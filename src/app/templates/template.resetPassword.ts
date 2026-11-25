const resetPasswordEmailTemplate = (name: string, resetUrl: string) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Password Reset</title>
      </head>

      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 10px;">
          <h2>Password Reset Request</h2>

          <p>Hello ${name},</p>

          <p>
            We received a request to reset your password.
            Click the button below to set a new password.
          </p>

          <a
            href="${resetUrl}"
            style="
              display: inline-block;
              padding: 12px 24px;
              background-color: #2563eb;
              color: white;
              text-decoration: none;
              border-radius: 6px;
            "
          >
            Reset Password
          </a>

          <p>
            This link will expire in 15 minutes and can only be used once.
          </p>

          <p>
            If you did not request a password reset,
            you can safely ignore this email.
          </p>

          <p>
            For security reasons, we will never ask you to share
            your password or reset token.
          </p>

          <p>Regards,<br />Your LMS Team</p>
        </div>
      </body>
    </html>
  `;
};

export default resetPasswordEmailTemplate;
