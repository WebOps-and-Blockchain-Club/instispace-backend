import nodemailer, { SentMessageInfo, Transporter } from 'nodemailer';
import { google } from 'googleapis';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import fs from 'fs';
import { UserRole } from '../user/type/role.enum';

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

class MailService {
  private mail: Transporter<SentMessageInfo> | null;

  constructor() {
    this.mail = null;
    this.connect();
  }

  async connect() {
    try {
      if (this.mail === null) {
        const oAuth2Client = new google.auth.OAuth2(
          CLIENT_ID,
          CLIENT_SECRET,
          REDIRECT_URI,
        );

        oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
        const accessToken = await oAuth2Client.getAccessToken();

        this.mail = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            type: 'OAuth2',
            user: 'instispace_cfi@smail.iitm.ac.in',
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            refreshToken: REFRESH_TOKEN,
            accessToken: accessToken,
          },
        } as SMTPTransport.Options);
      }
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }

  async sendAccountCreationMail(
    role: UserRole,
    email: string,
    password: string,
  ) {
    try {
      if (this.mail == null) await this.connect();

      let htmlContent = fs.readFileSync('src/assets/email/newAccount.html', {
        encoding: 'utf-8',
        flag: 'r',
      });
      htmlContent = htmlContent.replace('VARIABLE_EMAIL', email);
      htmlContent = htmlContent.replace('VARIABLE_PASSWORD', password);
      htmlContent = htmlContent.replace('VARIABLE_ROLE', role);
      const mailOptions = {
        from: 'instispace_cfi@smail.iitm.ac.in',
        fromName: 'InstiSpace, WebOps and Blockchain Club, CFI',
        to: email,
        subject: `Congrats! ${role} Account Created || InstiSpace App`,
        html: htmlContent,
      };
      this.mail?.sendMail(mailOptions);
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }
}

export default new MailService();
