import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, 
  },
});

export const sendInviteEmail = async (toEmail, workspaceName, inviteLink) => {
  await transporter.sendMail({
    from: `"${workspaceName}" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: `You've been invited to join ${workspaceName}`,
    html: `
      <p>You've been invited to join <b>${workspaceName}</b>.</p>
      <p><a href="${inviteLink}">Click here to accept the invite</a></p>
      <p>This link expires in 24 hours.</p>
    `,
  });
};