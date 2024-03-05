import sendGrid from "@sendgrid/mail";

export const sendEmail = async (
  email: string,
  subject: string,
  html: string
) => {
  sendGrid.setApiKey(process.env.SENDGRID_API_KEY || "");

  const msg = {
    to: email,
    from: process.env.BOT_EMAIL || "",
    subject: subject,
    html: html,
  };

  await sendGrid.send(msg);
};
