import request from 'supertest';
import app from './helpers/testApp.js';
import { registerAndLogin } from './helpers/createTestUser.js';
import Workspace from '../models/workspaceModel.js'; 

describe('RBAC — workspace roles', () => {
  it('prevents a member from changing another member\'s role', async () => {
  const { cookie: ownerCookie } = await registerAndLogin();

  const workspaceRes = await request(app)
    .post('/api/workspaces')
    .set('Cookie', ownerCookie)
    .send({ name: 'Test Workspace', slug: `test-ws-${Date.now()}` });

  const workspaceId = workspaceRes.body._id;

  const User = (await import('../models/userModel.js')).default;

  const { cookie: memberACookie, userData: memberAData } = await registerAndLogin();
  const memberAUser = await User.findOne({ email: memberAData.email });

  const { userData: memberBData } = await registerAndLogin();
  const memberBUser = await User.findOne({ email: memberBData.email });

  const workspace = await Workspace.findById(workspaceId);
  workspace.members.push({ user: memberAUser._id, role: 'member' });
  workspace.members.push({ user: memberBUser._id, role: 'member' });
  await workspace.save();

  const res = await request(app)
    .put(`/api/workspaces/${workspaceId}/members/${memberBUser._id}`)
    .set('Cookie', memberACookie)
    .send({ role: 'admin' });

  expect(res.status).toBe(403);
});

  it('allows the workspace owner to change a member\'s role', async () => {
    const { cookie: ownerCookie } = await registerAndLogin();

    const workspaceRes = await request(app)
      .post('/api/workspaces')
      .set('Cookie', ownerCookie)
      .send({ name: 'Owner-managed Workspace', slug: `owner-ws-${Date.now()}` });

    const workspaceId = workspaceRes.body._id;

    const { userData: memberData } = await registerAndLogin();
    const User = (await import('../models/userModel.js')).default;
    const memberUser = await User.findOne({ email: memberData.email });

    const workspace = await Workspace.findById(workspaceId);
    workspace.members.push({ user: memberUser._id, role: 'member' });
    await workspace.save();

    const res = await request(app)
      .put(`/api/workspaces/${workspaceId}/members/${memberUser._id}`)
      .set('Cookie', ownerCookie)
      .send({ role: 'admin' });

    expect(res.status).toBe(200);
  });
});