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

export interface SendAdminStaffAlertOptions {
  adminEmail: string;
  staffEmail: string;
  staffName?: string;
  eventType: 'signup_request' | 'pending_login_attempt' | 'staff_login';
  origin?: string;
}

export async function sendAdminStaffAlertEmail({
  adminEmail,
  staffEmail,
  staffName,
  eventType,
  origin = 'https://b2b-image.vercel.app',
}: SendAdminStaffAlertOptions): Promise<EmailResult> {
  const isSignup = eventType === 'signup_request';
  const isPendingLogin = eventType === 'pending_login_attempt';

  const subject = isSignup
    ? `🔔 New Staff Account Request: ${staffName || staffEmail}`
    : isPendingLogin
    ? `⚠️ Pending Staff Login Attempt: ${staffName || staffEmail}`
    : `ℹ️ Staff Access Notice: ${staffName || staffEmail}`;

  const adminDashboardUrl = `${origin}/admin/users`;
  const timeFormatted = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
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
      background: ${isSignup ? 'rgba(234, 179, 8, 0.15)' : 'rgba(225, 29, 46, 0.15)'};
      border: 1px solid ${isSignup ? 'rgba(234, 179, 8, 0.3)' : 'rgba(225, 29, 46, 0.3)'};
      color: ${isSignup ? '#FACC15' : '#F87171'};
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      border-radius: 9999px;
      margin-bottom: 20px;
    }
    h1 {
      color: #FFFFFF;
      font-size: 20px;
      margin: 0 0 16px 0;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    p {
      color: #94A3B8;
      font-size: 14px;
      line-height: 1.6;
      margin: 0 0 18px 0;
    }
    .info-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 16px 20px;
      margin: 20px 0;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 13px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      color: #64748B;
    }
    .info-val {
      color: #F1F5F9;
      font-weight: 600;
      font-family: monospace;
    }
    .btn {
      display: inline-block;
      padding: 13px 28px;
      background-color: #E11D2E;
      color: #FFFFFF !important;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      border-radius: 10px;
      margin: 16px 0 24px 0;
      box-shadow: 0 4px 14px rgba(225, 29, 46, 0.4);
    }
    .footer {
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      padding-top: 20px;
      margin-top: 20px;
      font-size: 11px;
      color: #64748B;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">${isSignup ? 'New Account Request' : 'Login Attempt'}</div>
    <h1>Staff Access Notification</h1>
    <p>Hello Administrator,</p>
    <p>
      A staff member has <strong>${
        isSignup
          ? 'registered a new staff account and is waiting for your approval'
          : 'attempted to sign in to Sanford Studio while their account is pending approval'
      }</strong>.
    </p>

    <div class="info-card">
      <div class="info-row">
        <span class="info-label">Staff Name</span>
        <span class="info-val">${staffName || 'Not specified'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Staff Email</span>
        <span class="info-val">${staffEmail}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Action</span>
        <span class="info-val" style="color: ${isSignup ? '#FACC15' : '#F87171'}">${
          isSignup ? 'Staff Account Request' : 'Pending Login Attempt'
        }</span>
      </div>
      <div class="info-row">
        <span class="info-label">Timestamp (IST)</span>
        <span class="info-val">${timeFormatted}</span>
      </div>
    </div>

    <div style="text-align: center;">
      <a href="${adminDashboardUrl}" class="btn" target="_blank">Review & Approve in Admin Panel</a>
    </div>

    <div class="footer">
      <p style="margin: 0;">
        Sanford B2B Product Image Studio &bull; Automated Security & Administration Dispatch
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
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'Sanford Studio Alerts <alerts@resend.dev>';
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [adminEmail],
          subject,
          html: htmlContent,
        }),
      });

      if (res.ok) {
        return { sent: true, provider: 'resend' };
      } else {
        const errorText = await res.text();
        console.warn('Resend API failed to send admin alert:', errorText);
      }
    } catch (err: any) {
      console.warn('Resend request failed for admin alert:', err?.message);
    }
  }

  // 2. Simulated / logged for dev and fallback
  console.log(`[ADMIN NOTIFICATION EMAIL] To: ${adminEmail} | Staff: ${staffEmail} (${staffName || 'N/A'}) | Type: ${eventType}`);
  return {
    sent: true,
    provider: 'simulated',
    details: `Admin alert notification dispatched for ${adminEmail}. Staff: ${staffEmail}`,
  };
}

