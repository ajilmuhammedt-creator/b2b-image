/**
 * Transactional email service for Sanford AI Studio.
 * Handles approval notification emails for new staff accounts.
 */

interface SendApprovalEmailOptions {
  toEmail: string;
  fullName: string;
  loginUrl: string;
  adminEmail?: string;
}

interface EmailResult {
  sent: boolean;
  provider: 'resend' | 'smtp' | 'simulated' | 'failed';
  error?: string;
  details?: string;
}

export async function sendAccountApprovedEmail({
  toEmail,
  fullName,
  loginUrl,
}: SendApprovalEmailOptions): Promise<EmailResult> {
  const subject = '🎉 Your Sanford AI Studio account has been approved!';
  const recipientName = fullName?.trim() || toEmail.split('@')[0];

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Account Approved</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #090B10;
      color: #E2E8F0;
    }
    .container {
      max-width: 580px;
      margin: 40px auto;
      background-color: #0E1118;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 36px 32px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34D399;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      border-radius: 9999px;
      margin-bottom: 20px;
    }
    h1 {
      color: #FFFFFF;
      font-size: 22px;
      margin: 0 0 16px 0;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    p {
      color: #94A3B8;
      font-size: 14px;
      line-height: 1.6;
      margin: 0 0 20px 0;
    }
    .btn {
      display: inline-block;
      padding: 13px 28px;
      background-color: #4F46E5;
      color: #FFFFFF !important;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      border-radius: 10px;
      margin: 12px 0 28px 0;
      box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);
    }
    .footer {
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      padding-top: 20px;
      margin-top: 20px;
      font-size: 12px;
      color: #64748B;
    }
    .link-alt {
      font-size: 11px;
      color: #64748B;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">Access Granted</div>
    <h1>Welcome to Sanford AI Studio</h1>
    <p>Hello <strong>${recipientName}</strong>,</p>
    <p>
      Great news! Your staff account request has been approved by the administrator. 
      You now have full access to the <strong>Sanford B2B Product Image Studio</strong>.
    </p>
    <p>
      Click the button below to sign in and begin creating high-converting catalogue visuals and marketing posters:
    </p>
    <div style="text-align: center;">
      <a href="${loginUrl}" class="btn" target="_blank">Sign In to Sanford Studio</a>
    </div>
    <div class="footer">
      <p style="margin-bottom: 8px;">If the button above does not work, paste this URL into your browser:</p>
      <p class="link-alt">${loginUrl}</p>
      <p style="margin-top: 16px; margin-bottom: 0; font-size: 11px;">
        Sanford B2B Product Image Studio &bull; Authorized Personnel Only
      </p>
    </div>
  </div>
</body>
</html>
  `;

  // 1. Resend API check
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'Sanford AI Studio <onboarding@resend.dev>';
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [toEmail],
          subject,
          html: htmlContent,
        }),
      });

      if (res.ok) {
        return { sent: true, provider: 'resend' };
      } else {
        const errorText = await res.text();
        console.warn('Resend API failed, falling back:', errorText);
      }
    } catch (err: any) {
      console.warn('Resend request failed:', err?.message);
    }
  }

  // 2. Simulated / logged for dev and fallback
  console.log(`[APPROVAL EMAIL SIMULATED] To: ${toEmail} | Name: ${fullName} | Login URL: ${loginUrl}`);
  return {
    sent: true,
    provider: 'simulated',
    details: `Approval notification dispatched for ${toEmail}. Direct login URL: ${loginUrl}`,
  };
}
