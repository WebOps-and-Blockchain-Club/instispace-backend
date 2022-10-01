import nodemailer from "nodemailer";
import { google } from "googleapis";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import dotenv from "dotenv";

dotenv.config();
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

export const mail = async ({
  email,
  subject,
  htmlContent,
}: {
  email: string;
  subject: string;
  htmlContent: string;
}) => {
  console.log(email);
  const sendMail = async () => {
    try {
      const accessToken = await oAuth2Client.getAccessToken();

      const transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: "instispace_cfi@smail.iitm.ac.in",
          clientId: CLIENT_ID,
          clientSecret: CLIENT_SECRET,
          refreshToken: REFRESH_TOKEN,
          accessToken: accessToken,
        },
      } as SMTPTransport.Options);

      const mailOptions = {
        from: "instispace_cfi@smail.iitm.ac.in",
        fromName: "InstiSpace, IIT Madras",
        to: email,
        subject: subject,
        html: htmlContent,
      };
      const result = await transport.sendMail(mailOptions);
      return result;
    } catch (error) {
      return error;
    }
  };
  sendMail();
};
