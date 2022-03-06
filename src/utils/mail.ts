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

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN});

export const mail = async ({ email, subject, htmlContent } : { email: string, subject: string, htmlContent: string }) => {
    const sendMail = async () => {
        try {
            const accessToken = await oAuth2Client.getAccessToken();
    
            const transport = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    type: 'OAuth2',
                    user: "clinsti2021@gmail.com",
                    clientId: CLIENT_ID,
                    clientSecret: CLIENT_SECRET,
                    refreshToken: REFRESH_TOKEN,
                    accessToken: accessToken,
                },
            }  as SMTPTransport.Options);
    
            const mailOptions = {
                from: 'myhostel20@gmail.com',
                fromName: 'CFI InstiSpace, IIT Madras',
                to: email,
                subject: subject,
                html: htmlContent
            };
            const result = await transport.sendMail(mailOptions);
            return result;
        } catch (error) {
            return error;
        }
    }
    sendMail()
    .then((result) => console.log("Email sent...", result))
    .catch((error) => console.log(error.message));
}