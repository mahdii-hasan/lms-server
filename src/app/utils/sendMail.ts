import nodemailer from "nodemailer";
import AppError from "../errors/AppError";
import httpStatus from "http-status";
import config from "../config/env";

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

const sendMail = async ({
  to,
  subject,
  html,
}: SendMailOptions): Promise<void> => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      auth: {
        user: config.email_user,
        pass: config.email_pass,
      },
    });

    await transporter.sendMail({
      from: `"LMS-BACK" <${config.email_user}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to send email",
    );
  }
};

export default sendMail;
