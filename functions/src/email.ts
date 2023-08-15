import sendGrid from "@sendgrid/mail";
import { https } from "firebase-functions";

export const sendEmail = https.onRequest(async (req, res) => {
  const email = req.query.email?.toString();
  const subject = req.query.subject?.toString();
  const html = req.query.html?.toString();
  sendGrid.setApiKey(process.env.SENDGRID_API_KEY || "");

  if (!email || !subject || !html) {
    res.status(400).send("Bad request");
    return;
  }

  await sendSendgridEmail(email, subject, html);
  res.status(200).send("OK");
});

const sendSendgridEmail = async (
  email: string,
  subject: string,
  html: string
) => {
  const msg = {
    to: email,
    from: "nikitabot@gamolsky.net",
    subject: subject,
    html: html,
  };

  await sendGrid.send(msg);
};
