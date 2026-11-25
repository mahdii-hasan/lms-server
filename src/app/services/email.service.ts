import nodemailer from "nodemailer";
import config from "../config/env";

interface ISendEmail {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",

      auth: {
        user: config.email_user,
        pass: config.email_pass,
      },
    });
  }

  async sendEmail(payload: ISendEmail): Promise<void> {
    await this.transporter.sendMail({
      from: `"${"Auth kit"}" <${config.email_user}>`,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });
  }
}

const emailService = new EmailService();

export default emailService;
