const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});
transporter.verify((error, success) => {
  if (error) {
    console.log('Email error:', error);
  } else {
    console.log('Email server ready!');
  }
});

const sendBloodRequestEmail = async (donorEmail, donorName, hospitalName, bloodGroup, city, urgency, requestId) => {
  const urgencyColor = urgency === 'Critical' ? '#ff4444' : urgency === 'Urgent' ? '#ffaa00' : '#44ff88';
  const urgencyEmoji = urgency === 'Critical' ? '🚨' : urgency === 'Urgent' ? '⚠️' : '📋';

  const mailOptions = {
    from: `"BloodBridge" <${process.env.EMAIL_USER}>`,
    to: donorEmail,
    subject: `${urgencyEmoji} ${urgency} Blood Request — ${bloodGroup} needed in ${city}`,
    html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background:#030303;font-family:'DM Sans',Arial,sans-serif">
      <div style="max-width:600px;margin:0 auto;padding:40px 20px">

        <!-- Header -->
        <div style="text-align:center;margin-bottom:40px">
         <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 16px">
          <tr>
         <td style="width:60px;height:60px;background:#C1121F;border-radius:50%;text-align:center;vertical-align:middle;font-size:28px">
         🩸
         </td>
          </tr>
         </table>
          <h1 style="color:#ffffff;font-size:28px;font-weight:900;margin:0;letter-spacing:-1px">BloodBridge</h1>
          <p style="color:rgba(255,255,255,0.3);font-size:12px;letter-spacing:3px;margin-top:4px">BLOOD DONATION NETWORK</p>
        </div>

        <!-- Alert Card -->
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(193,18,31,0.3);border-radius:20px;padding:32px;margin-bottom:24px">
          <div style="display:inline-block;padding:6px 16px;border-radius:20px;background:rgba(193,18,31,0.1);border:1px solid rgba(193,18,31,0.3);margin-bottom:20px">
            <span style="color:#C1121F;font-size:12px;letter-spacing:2px;font-weight:600">${urgencyEmoji} ${urgency.toUpperCase()} REQUEST</span>
          </div>

          <h2 style="color:#ffffff;font-size:22px;font-weight:700;margin:0 0 8px">
            Hi ${donorName}, you're needed! 🩸
          </h2>
          <p style="color:rgba(255,255,255,0.5);font-size:14px;line-height:1.6;margin:0 0 24px">
            A hospital near you urgently needs your blood type. Your donation could save a life today.
          </p>

          <!-- Details -->
          <div style="background:rgba(255,255,255,0.03);border-radius:14px;padding:20px;margin-bottom:24px">
            <table style="width:100%;border-collapse:collapse">
              <tr>
                <td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:13px">🏥 Hospital</td>
                <td style="padding:8px 0;color:#ffffff;font-size:13px;font-weight:600;text-align:right">${hospitalName}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:13px">🩸 Blood Group</td>
                <td style="padding:8px 0;color:#C1121F;font-size:16px;font-weight:900;text-align:right">${bloodGroup}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:13px">📍 City</td>
                <td style="padding:8px 0;color:#ffffff;font-size:13px;font-weight:600;text-align:right">${city}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:13px">⚡ Urgency</td>
                <td style="padding:8px 0;font-size:13px;font-weight:600;text-align:right;color:${urgencyColor}">${urgency}</td>
              </tr>
            </table>
          </div>

          <!-- CTA Button -->
          <div style="text-align:center">
            <a href="http://localhost:3000/donor-dashboard"
              style="display:inline-block;padding:14px 40px;background:#C1121F;color:#ffffff;text-decoration:none;border-radius:25px;font-size:15px;font-weight:600;letter-spacing:0.5px">
              🩸 Respond Now
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align:center">
          <p style="color:rgba(255,255,255,0.2);font-size:11px;letter-spacing:1px">
            You received this because you registered as a donor on BloodBridge.<br>
            Your blood type: <strong style="color:#C1121F">${bloodGroup}</strong> · City: <strong style="color:rgba(255,255,255,0.4)">${city}</strong>
          </p>
        </div>

      </div>
    </body>
    </html>
    `
  };

  await transporter.sendMail(mailOptions);
};

const sendAcceptanceEmail = async (hospitalEmail, hospitalName, donorName, donorPhone, bloodGroup) => {
  const mailOptions = {
    from: `"BloodBridge" <${process.env.EMAIL_USER}>`,
    to: hospitalEmail,
    subject: `✅ Donor Found — ${bloodGroup} donor confirmed for your request`,
    html: `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#030303;font-family:Arial,sans-serif">
      <div style="max-width:600px;margin:0 auto;padding:40px 20px">
        <div style="text-align:center;margin-bottom:32px">
          <div style="font-size:48px">🩸</div>
          <h1 style="color:#ffffff;font-size:24px;font-weight:900;margin:8px 0">BloodBridge</h1>
        </div>
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(68,255,136,0.3);border-radius:20px;padding:32px">
          <h2 style="color:#44ff88;font-size:20px;margin:0 0 16px">✅ Donor Confirmed!</h2>
          <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.6">
            Great news! A donor has accepted your blood request.
          </p>
          <div style="background:rgba(255,255,255,0.03);border-radius:14px;padding:20px;margin-top:20px">
            <table style="width:100%;border-collapse:collapse">
              <tr>
                <td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:13px">👤 Donor Name</td>
                <td style="padding:8px 0;color:#ffffff;font-size:13px;font-weight:600;text-align:right">${donorName}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:13px">📞 Phone</td>
                <td style="padding:8px 0;color:#C1121F;font-size:14px;font-weight:700;text-align:right">${donorPhone}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:13px">🩸 Blood Group</td>
                <td style="padding:8px 0;color:#C1121F;font-size:16px;font-weight:900;text-align:right">${bloodGroup}</td>
              </tr>
            </table>
          </div>
        </div>
        <p style="color:rgba(255,255,255,0.2);font-size:11px;text-align:center;margin-top:24px">
          BloodBridge · Connecting donors with hospitals
        </p>
      </div>
    </body>
    </html>
    `
  };

  await transporter.sendMail(mailOptions);
};
const sendOTPEmail = async (email, name, otp) => {
  const mailOptions = {
    from: `"BloodBridge" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `${otp} is your BloodBridge verification code`,
    html: `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#030303;font-family:Arial,sans-serif">
      <div style="max-width:500px;margin:0 auto;padding:40px 20px">

        <!-- Header -->
        <div style="text-align:center;margin-bottom:32px">
          <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 16px">
            <tr>
              <td style="width:60px;height:60px;background:#C1121F;border-radius:50%;text-align:center;vertical-align:middle;font-size:28px">
                🩸
              </td>
            </tr>
          </table>
          <h1 style="color:#ffffff;font-size:22px;font-weight:900;margin:0;letter-spacing:-0.5px">BloodBridge</h1>
          <p style="color:rgba(255,255,255,0.3);font-size:11px;letter-spacing:3px;margin-top:4px">VERIFICATION CODE</p>
        </div>

        <!-- OTP Card -->
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(193,18,31,0.2);border-radius:20px;padding:32px;text-align:center">
          <p style="color:rgba(255,255,255,0.6);font-size:14px;margin:0 0 24px;line-height:1.6">
            Hi <strong style="color:#fff">${name}</strong>! Enter this code to verify your BloodBridge account.
          </p>

          <!-- OTP Code -->
          <div style="background:rgba(193,18,31,0.08);border:2px solid rgba(193,18,31,0.3);border-radius:16px;padding:24px;margin:0 0 24px;display:inline-block;width:100%">
            <div style="font-size:42px;font-weight:900;letter-spacing:12px;color:#C1121F;font-family:monospace">
              ${otp}
            </div>
          </div>

          <p style="color:rgba(255,255,255,0.3);font-size:12px;margin:0">
            ⏱️ This code expires in <strong style="color:rgba(255,255,255,0.6)">10 minutes</strong>
          </p>
          <p style="color:rgba(255,255,255,0.2);font-size:11px;margin:12px 0 0">
            If you didn't request this, ignore this email.
          </p>
        </div>

        <p style="color:rgba(255,255,255,0.15);font-size:11px;text-align:center;margin-top:24px;letter-spacing:1px">
          BloodBridge · Connecting donors with hospitals
        </p>
      </div>
    </body>
    </html>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendBloodRequestEmail, sendAcceptanceEmail, sendOTPEmail };