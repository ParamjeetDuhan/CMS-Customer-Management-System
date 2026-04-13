/**
 * services/emailService.js
 * Resend Email Service (Production Ready)
 */

const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send Password Reset Email
 */
const sendPasswordResetEmail = async (toEmail, toName, resetUrl) => {
  try {

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset your ShopNear password</title>
</head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:520px;background:#1a1a1a;border-radius:16px;border:1px solid #2a2a2a;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#f97316,#ea580c);padding:32px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">
                🛒 Aapki Dukan
              </h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">
                Your local shopping companion
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px;">
              <h2 style="margin:0 0 8px;color:#ffffff;font-size:20px;font-weight:600;">
                Reset your password
              </h2>
              <p style="margin:0 0 24px;color:#9ca3af;font-size:14px;line-height:1.6;">
                Hi ${toName || "there"},<br/>
                We received a request to reset the password for your Aapki Dukan account.
                Click the button below to choose a new password.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 28px;">
                    <a href="${resetUrl}"
                       style="display:inline-block;background:#f97316;color:#fff;text-decoration:none;
                              font-size:15px;font-weight:600;padding:14px 36px;border-radius:12px;
                              letter-spacing:0.2px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Expiry notice -->
              <div style="background:#292524;border:1px solid #44403c;border-radius:10px;padding:14px 16px;margin-bottom:24px;">
                <p style="margin:0;color:#fbbf24;font-size:12px;line-height:1.5;">
                  ⏱ This link expires in <strong>30 minutes</strong>.
                  If you didn't request a password reset, you can safely ignore this email.
                </p>
              </div>

              <!-- Fallback URL -->
              <p style="margin:0 0 6px;color:#6b7280;font-size:12px;">
                If the button doesn't work, copy and paste this URL into your browser:
              </p>
              <p style="margin:0;word-break:break-all;">
                <a href="${resetUrl}" style="color:#f97316;font-size:11px;text-decoration:none;">
                  ${resetUrl}
                </a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #2a2a2a;text-align:center;">
              <p style="margin:0;color:#4b5563;font-size:11px;line-height:1.6;">
                You're receiving this because a password reset was requested for your account at
                <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}"
                   style="color:#f97316;text-decoration:none;">ShopNear</a>.<br/>
                © ${new Date().getFullYear()} ShopNear. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const response = await resend.emails.send({
      from: `Aapki Dukan <${process.env.EMAIL_FROM || "onboarding@resend.dev"}>`,
      to: toEmail,
      subject: "Reset your password",
      html: html,
    });

    console.log("Email sent:", response);
    return response;

  } catch (error) {
    console.error("Resend Email Error:", error);
    throw error;
  }
};

module.exports = { sendPasswordResetEmail };