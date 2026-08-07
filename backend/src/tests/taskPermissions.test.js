import request from 'supertest';
import app from './helpers/testApp.js';
import { registerAndLogin } from './helpers/createTestUser.js';
import Workspace from '../models/Workspace.js';
import User from '../models/User.js';

describe('Task CRUD permissions', () => {
  it('prevents a non-member from listing a project\'s tasks', async () => {
    const { cookie: ownerCookie } = await registerAndLogin();

    const workspaceRes = await request(app)
      .post('/api/workspaces')
      .set('Cookie', ownerCookie)
      .send({ name: 'Owner Workspace', slug: `owner-ws-${Date.now()}` });

    const workspaceId = workspaceRes.body._id;

    await request(app)
      .post(`/api/workspaces/${workspaceId}/projects`)
      .set('Cookie', ownerCookie)
      .send({ name: 'Owner Project' });

    const { cookie: outsiderCookie } = await registerAndLogin();

    const res = await request(app)
      .get(`/api/workspaces/${workspaceId}/projects`)
      .set('Cookie', outsiderCookie);

    expect(res.status).toBe(403);
  });

  it('prevents a non-member from creating a task in a project', async () => {
    const { cookie: ownerCookie } = await registerAndLogin();

    const workspaceRes = await request(app)
      .post('/api/workspaces')
      .set('Cookie', ownerCookie)
      .send({ name: 'Task Workspace', slug: `task-ws-${Date.now()}` });

    const projectRes = await request(app)
      .post(`/api/workspaces/${workspaceRes.body._id}/projects`)
      .set('Cookie', ownerCookie)
      .send({ name: 'Task Project' });

    const { cookie: outsiderCookie } = await registerAndLogin();

    const res = await request(app)
      .post(`/api/projects/${projectRes.body._id}/tasks`)
      .set('Cookie', outsiderCookie)
      .send({ title: 'Sneaky task', columnId: 'todo' });

    expect(res.status).toBe(403);
  });

  it('allows the workspace owner to create a task', async () => {
    const { cookie: ownerCookie } = await registerAndLogin();

    const workspaceRes = await request(app)
      .post('/api/workspaces')
      .set('Cookie', ownerCookie)
      .send({ name: 'Owner Create Workspace', slug: `owner-create-ws-${Date.now()}` });

    const projectRes = await request(app)
      .post(`/api/workspaces/${workspaceRes.body._id}/projects`)
      .set('Cookie', ownerCookie)
      .send({ name: 'Owner Create Project' });

    const res = await request(app)
      .post(`/api/projects/${projectRes.body._id}/tasks`)
      .set('Cookie', ownerCookie)
      .send({ title: 'First task', columnId: 'todo' });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('First task');
  });

  it('allows a regular member (not owner) to create a task', async () => {
    const { cookie: ownerCookie } = await registerAndLogin();

    const workspaceRes = await request(app)
      .post('/api/workspaces')
      .set('Cookie', ownerCookie)
      .send({ name: 'Member Workspace', slug: `member-ws-${Date.now()}` });

    const workspaceId = workspaceRes.body._id;

    const projectRes = await request(app)
      .post(`/api/workspaces/${workspaceId}/projects`)
      .set('Cookie', ownerCookie)
      .send({ name: 'Member Project' });

    
    const { cookie: memberCookie, userData: memberData } = await registerAndLogin();
    const memberUser = await User.findOne({ email: memberData.email });

    const workspace = await Workspace.findById(workspaceId);
    workspace.members.push({ user: memberUser._id, role: 'member' });
    await workspace.save();

    const res = await request(app)
      .post(`/api/projects/${projectRes.body._id}/tasks`)
      .set('Cookie', memberCookie)
      .send({ title: 'Member-created task', columnId: 'todo' });

    expect(res.status).toBe(201);
  });

  it('prevents a non-member from updating a task', async () => {
    const { cookie: ownerCookie } = await registerAndLogin();

    const workspaceRes = await request(app)
      .post('/api/workspaces')
      .set('Cookie', ownerCookie)
      .send({ name: 'Update Test Workspace', slug: `update-ws-${Date.now()}` });

    const projectRes = await request(app)
      .post(`/api/workspaces/${workspaceRes.body._id}/projects`)
      .set('Cookie', ownerCookie)
      .send({ name: 'Update Test Project' });

    const taskRes = await request(app)
      .post(`/api/projects/${projectRes.body._id}/tasks`)
      .set('Cookie', ownerCookie)
      .send({ title: 'Task to update', columnId: 'todo' });

    const { cookie: outsiderCookie } = await registerAndLogin();

    const res = await request(app)
      .patch(`/api/tasks/${taskRes.body._id}`)
      .set('Cookie', outsiderCookie)
      .send({ title: 'Hijacked title' });

    expect(res.status).toBe(403);
  });
});