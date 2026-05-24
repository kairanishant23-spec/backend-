// ─── Startup diagnostics (visible in Render logs on every deploy) ─────────────
console.log("📧 [Notifications] SMTP_HOST :", process.env.SMTP_HOST || "❌ NOT SET");
console.log("📧 [Notifications] SMTP_USER :", process.env.SMTP_USER || "❌ NOT SET");
console.log("📧 [Notifications] SMTP_PASS :", process.env.SMTP_PASS ? `✅ SET (${process.env.SMTP_PASS.length} chars)` : "❌ NOT SET");
console.log("📱 [Notifications] SMS_API_KEY:", process.env.SMS_API_KEY && process.env.SMS_API_KEY !== "MtwLpgJCqsfBF9muk1NPOS3nQVeDoXl62HYaRWcr4dGi8x5AjvdYUQkfNB4HPiqFtM9voWK2R73y5SrX" ? `✅ SET (${process.env.SMS_API_KEY.length} chars)` : "❌ NOT SET / placeholder");

let nodemailer;
try {
  nodemailer = require("nodemailer");
} catch (e) {
  console.warn("⚠️ Nodemailer not installed — email will run in simulation mode.");
}

// ─── Helper: clean environment variable values (remove accidental quotes or whitespace) ───
function cleanEnvVar(val) {
  if (!val) return "";
  let clean = val.trim();
  if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) {
    clean = clean.substring(1, clean.length - 1).trim();
  }
  return clean;
}

// ─── Helper: wrap any promise with a hard timeout ─────────────────────────────
function withTimeout(promise, ms, label) {
  const timer = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timer]);
}

// ─── Reusable SMTP transporter (created lazily) ──────────────────────────────
let _transporter = null;
function getTransporter() {
  if (_transporter) return _transporter;
  const smtpHost = cleanEnvVar(process.env.SMTP_HOST);
  const smtpPort = Number(cleanEnvVar(process.env.SMTP_PORT)) || 587;
  const smtpUser = cleanEnvVar(process.env.SMTP_USER);
  const smtpPass = cleanEnvVar(process.env.SMTP_PASS);

  const missingOrPlaceholder =
    !nodemailer ||
    !smtpHost || 
    !smtpUser || smtpUser === "kairanishant23@gmail.com" ||
    !smtpPass || smtpPass === "ggip nqqu omod zcgg";

  if (missingOrPlaceholder) {
    console.warn("⚠️  [Email] Transporter not created — SMTP credentials missing or placeholder. Running in simulation.");
    return null;
  }

  console.log(`✅ [Email] Creating SMTP transporter: ${smtpHost}:${smtpPort} user=${smtpUser}`);
  _transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
    pool: true,
    maxConnections: 5
  });
  return _transporter;
}

/**
 * Send SMS via Fast2SMS — falls back to simulation if SMS_API_KEY is missing/placeholder.
 * @param {string} phone - 10-digit Indian phone number
 * @param {string} message - SMS text
 */
async function sendSMSNotification(phone, message) {
  const cleanPhone = phone.replace(/\D/g, "");
  const smsApiKey = cleanEnvVar(process.env.SMS_API_KEY);

  // ── Simulation mode ───────────────────────────────────────────────────────
  if (!smsApiKey || smsApiKey === "MtwLpgJCqsfBF9muk1NPOS3nQVeDoXl62HYaRWcr4dGi8x5AjvdYUQkfNB4HPiqFtM9voWK2R73y5SrX" || smsApiKey.includes("placeholder")) {
    console.log(`ℹ️  [SMS Simulation] → ${cleanPhone}: "${message}"`);
    return { success: true, simulated: true };
  }

  // ── Live mode: Fast2SMS Quick SMS route ──────────────────────────────────
  try {
    console.log(`📱 [SMS Live] Calling Fast2SMS for ${cleanPhone}...`);
    const payload = JSON.stringify({
      route: "otp",
      message,
      language: "english",
      flash: 0,
      numbers: cleanPhone
    });

    const https = require("https");
    const sendFn = new Promise((resolve, reject) => {
      const options = {
        hostname: "www.fast2sms.com",
        port: 443,
        path: "/dev/bulkV2",
        method: "POST",
        headers: {
          "authorization": smsApiKey,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload)
        }
      };

      const req = https.request(options, (res) => {
        let body = "";
        res.on("data", (chunk) => body += chunk);
        res.on("end", () => {
          try {
            const data = JSON.parse(body);
            resolve(data);
          } catch (err) {
            reject(new Error(`Fast2SMS non-JSON response: ${body.slice(0, 200)}`));
          }
        });
      });

      req.on("error", (err) => {
        reject(err);
      });

      req.write(payload);
      req.end();
    }).then((data) => {
      console.log(`📱 [SMS Live] Fast2SMS raw response:`, JSON.stringify(data));
      if (data.return) {
        console.log(`✅ [SMS Live] Sent to ${cleanPhone} | Fast2SMS ID: ${data.request_id}`);
        return { success: true, requestId: data.request_id };
      }
      throw new Error(data.message || JSON.stringify(data));
    });

    return await withTimeout(sendFn, 9000, "Fast2SMS");
  } catch (error) {
    console.error("❌ [SMS Error]", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send Email Notification via SMTP — falls back to simulation if credentials missing.
 * @param {string} email        - Recipient email address
 * @param {string} subject      - Email subject line
 * @param {string} htmlContent  - Full HTML body
 */
async function sendEmailNotification(email, subject, htmlContent) {
  const cleanEmail = email.trim();
  const fromEmail = cleanEnvVar(process.env.FROM_EMAIL) || "HIMSARU <no-reply@himsaru.com>";
  const transporter = getTransporter();

  // ── Simulation mode ───────────────────────────────────────────────────────
  if (!transporter) {
    console.log(`ℹ️  [Email Simulation] → ${cleanEmail} | Subject: "${subject}"`);
    return { success: true, simulated: true };
  }

  // ── Live mode ─────────────────────────────────────────────────────────────
  try {
    const sendFn = transporter.sendMail({
      from: fromEmail,
      to: cleanEmail,
      subject,
      html: htmlContent
    });

    const info = await withTimeout(sendFn, 9000, "Email SMTP");
    console.log(`✅ [Email Live] Sent to ${cleanEmail} | MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ [Email Error]", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Generate a premium order update email template
 */
function generateOrderEmailTemplate(order, title, message) {
  const itemsHtml = (order.items || []).map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #EFEFEF; font-size: 14px; color: #1F2937;">
        <strong>${item.name}</strong> ${item.variant ? `(${item.variant})` : ""}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #EFEFEF; font-size: 14px; color: #4B5563; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #EFEFEF; font-size: 14px; color: #1F2937; text-align: right; font-weight: 600;">
        ₹${item.total.toLocaleString("en-IN")}
      </td>
    </tr>
  `).join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
    </head>
    <body style="font-family: 'DM Sans', Arial, sans-serif; background-color: #F7F6F3; margin: 0; padding: 20px; -webkit-font-smoothing: antialiased;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border: 1.5px solid #E2E8F0;">
        <!-- Header -->
        <div style="background-color: #1B3A20; padding: 30px; text-align: center;">
          <h1 style="color: #F2EDE3; margin: 0; font-size: 24px; letter-spacing: 2px; font-weight: 500; font-family: 'Playfair Display', Georgia, serif;">HIMSARU</h1>
          <p style="color: #D4AF37; margin: 5px 0 0 0; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase;">Pure Taste of the Himalayas</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
          <h2 style="color: #1B3A20; font-size: 18px; margin-top: 0; border-bottom: 1.5px solid #E2E8F0; padding-bottom: 12px;">${title}</h2>
          <p style="color: #4B5563; font-size: 15px; line-height: 1.6; margin-bottom: 25px;">${message}</p>
          
          <!-- Order summary card -->
          <div style="background-color: #F9FAFB; border-radius: 10px; padding: 20px; margin-bottom: 25px; border: 1px solid #E5E7EB;">
            <div style="font-size: 14px; color: #6B7280; margin-bottom: 10px;">
              Order Number: <strong style="color: #1F2937;">${order.orderNumber}</strong><br>
              Placed on: <strong style="color: #1F2937;">${order.createdAtIST || new Date(order.createdAt).toLocaleString("en-IN")}</strong><br>
              Payment Method: <strong style="color: #1F2937; text-transform: uppercase;">${order.paymentMethod}</strong>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
              <thead>
                <tr style="background-color: #F3F4F6;">
                  <th style="padding: 8px 12px; font-size: 12px; color: #4B5563; text-align: left; text-transform: uppercase;">Item</th>
                  <th style="padding: 8px 12px; font-size: 12px; color: #4B5563; text-align: center; text-transform: uppercase;">Qty</th>
                  <th style="padding: 8px 12px; font-size: 12px; color: #4B5563; text-align: right; text-transform: uppercase;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <div style="text-align: right; margin-top: 15px; font-size: 15px; color: #1F2937;">
              Subtotal: <strong>₹${order.subtotal.toLocaleString("en-IN")}</strong><br>
              Shipping: <strong>₹${(order.shipping || 0).toLocaleString("en-IN")}</strong><br>
              <span style="font-size: 16px; font-weight: bold; color: #1B3A20;">Total: ₹${order.total.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <!-- Shipping Address -->
          <h3 style="color: #1B3A20; font-size: 15px; margin-bottom: 8px;">Delivery Details</h3>
          <div style="background-color: #F9FAFB; border-radius: 10px; padding: 15px; font-size: 14px; color: #4B5563; border: 1px solid #E5E7EB; line-height: 1.5;">
            <strong>${order.address.name}</strong><br>
            Phone: ${order.address.phone}<br>
            ${order.address.line1}${order.address.line2 ? `, ${order.address.line2}` : ""}<br>
            ${order.address.city}, ${order.address.state} - ${order.address.pincode}
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #F3F4F6; padding: 20px; text-align: center; font-size: 12px; color: #6B7280; border-top: 1.5px solid #E2E8F0;">
          <p style="margin: 0;">If you have any questions, feel free to contact us at support@himsaru.com</p>
          <p style="margin: 5px 0 0 0;">© ${new Date().getFullYear()} HIMSARU. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Main function to notify customer of order status updates
 * @param {string} orderId - Database Order ID
 * @param {string} status - New Order Status
 */
async function notifyOrderStatusUpdate(orderId, status) {
  try {
    // Loaded inside function to avoid circular dependency issues at module load time
    const Order = require("../models/Order");
    const order = await Order.findById(orderId).populate("items.product");
    if (!order) return { success: false, message: "Order not found" };

    const email = order.address.email || (order.user && order.user.email);
    const phone = order.address.phone;

    let emailSubject = "";
    let emailMessage = "";
    let smsMessage = "";

    switch (status) {
      case "placed":
        emailSubject = `🛒 HIMSARU: Order Placed Successfully - ${order.orderNumber}`;
        emailMessage = `Thank you for choosing HIMSARU! Your order ${order.orderNumber} has been successfully placed. We are carefully packaging your Himalayan treasures and will notify you as soon as they are shipped.`;
        smsMessage = `HIMSARU: Thank you for your order! Your order ${order.orderNumber} has been placed successfully. Track your delivery at: https://himsaru.com/track`;
        break;

      case "confirmed":
        emailSubject = `✅ HIMSARU: Order Confirmed! - ${order.orderNumber}`;
        emailMessage = `Great news! Your order ${order.orderNumber} has been verified and confirmed. We are starting to pack your items for shipment.`;
        smsMessage = `HIMSARU: Order ${order.orderNumber} has been confirmed! We are preparing it for shipment.`;
        break;

      case "processing":
        emailSubject = `📦 HIMSARU: Your order is being packed! - ${order.orderNumber}`;
        emailMessage = `We are currently packing and preparing your order ${order.orderNumber} for shipment. We ensure that every product meets the highest standards of Himalayan purity before dispatch.`;
        smsMessage = `HIMSARU: Order ${order.orderNumber} is being packed and prepared for dispatch.`;
        break;

      case "shipped":
        emailSubject = `🚀 HIMSARU: Your order has been shipped! - ${order.orderNumber}`;
        emailMessage = `Exciting news! Your order ${order.orderNumber} has been shipped. It is on its way to bring the pure taste of the Himalayas right to your doorstep.`;
        smsMessage = `HIMSARU: Order ${order.orderNumber} has been shipped! It is on its way to you.`;
        break;

      case "out_for_delivery":
        emailSubject = `🚚 HIMSARU: Order out for delivery today! - ${order.orderNumber}`;
        emailMessage = `Your order ${order.orderNumber} is out for delivery today. Please ensure someone is available at your address to receive it.`;
        smsMessage = `HIMSARU: Your order ${order.orderNumber} is out for delivery today! Please keep your phone handy.`;
        break;

      case "delivered":
        emailSubject = `🌟 HIMSARU: Delivered! - ${order.orderNumber}`;
        emailMessage = `Your order ${order.orderNumber} has been successfully delivered! We hope you love your pure Himalayan products. Thank you for choosing HIMSARU.`;
        smsMessage = `HIMSARU: Order ${order.orderNumber} has been delivered successfully. We hope you enjoy it!`;
        break;

      case "cancelled":
        emailSubject = `❌ HIMSARU: Order Cancelled - ${order.orderNumber}`;
        emailMessage = `Your order ${order.orderNumber} has been cancelled. If this was a mistake or if you need assistance, please get in touch with our support team immediately.`;
        smsMessage = `HIMSARU: Order ${order.orderNumber} has been cancelled. Please contact support if you need assistance.`;
        break;

      default:
        return { success: false, message: "Unhandled status notification." };
    }

    const emailPromise = email
      ? sendEmailNotification(email, emailSubject, generateOrderEmailTemplate(order, emailSubject, emailMessage))
      : Promise.resolve({ success: false, message: "No email available" });

    const smsPromise = phone
      ? sendSMSNotification(phone, smsMessage)
      : Promise.resolve({ success: false, message: "No phone available" });

    const [emailRes, smsRes] = await Promise.all([emailPromise, smsPromise]);

    return { success: true, email: emailRes, sms: smsRes };
  } catch (error) {
    console.error("❌ notifyOrderStatusUpdate error:", error);
    return { success: false, error: error.message };
  }
}

// ─── Shared branded OTP email template ───────────────────────────────────────
function buildOtpEmailHtml(otp, headingText, bodyText) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head><meta charset="utf-8"><title>HIMSARU OTP</title></head>
  <body style="margin:0;padding:0;background:#F7F6F3;font-family:'DM Sans',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6F3;padding:30px 0;">
      <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:14px;overflow:hidden;border:1.5px solid #E2E8F0;box-shadow:0 4px 20px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:#1B3A20;padding:28px 32px;text-align:center;">
              <div style="color:#F2EDE3;font-size:22px;letter-spacing:4px;font-weight:600;font-family:Georgia,serif;">HIMSARU</div>
              <div style="color:#D4AF37;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin-top:4px;">Pure Taste of the Himalayas</div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <h2 style="color:#1B3A20;font-size:18px;margin:0 0 12px 0;">${headingText}</h2>
              <p style="color:#4B5563;font-size:15px;line-height:1.7;margin:0 0 28px 0;">${bodyText}</p>

              <!-- OTP Box -->
              <div style="background:#F0FDF4;border:2px dashed #1B3A20;border-radius:10px;padding:20px;text-align:center;margin:0 0 28px 0;">
                <div style="font-size:36px;font-weight:700;letter-spacing:12px;color:#1B3A20;font-family:monospace;">${otp}</div>
                <div style="font-size:12px;color:#6B7280;margin-top:8px;">Valid for <strong>10 minutes</strong> &mdash; do not share this code.</div>
              </div>

              <p style="color:#9CA3AF;font-size:12px;margin:0;">If you didn&rsquo;t request this OTP, you can safely ignore this email.</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F9FAFB;border-top:1.5px solid #E2E8F0;padding:18px 32px;text-align:center;font-size:11px;color:#9CA3AF;">
              &copy; ${new Date().getFullYear()} HIMSARU &bull; support@himsaru.com
            </td>
          </tr>

        </table>
      </td></tr>
    </table>
  </body>
  </html>`;
}

/**
 * Send OTP for Signup — fires both SMS and email in parallel.
 * @param {string} email
 * @param {string} phone
 * @param {string} otp
 */
async function sendSignupOTP(email, phone, otp) {
  const subject = `🔑 HIMSARU: Your Verification OTP is ${otp}`;
  const emailHtml = buildOtpEmailHtml(
    otp,
    "Verify Your Account",
    "Thank you for registering with HIMSARU! Use the OTP below to verify your email address and mobile number. The same code works on both."
  );
  const smsMessage = `HIMSARU: Your signup OTP is ${otp}. Valid for 10 min. Do not share.`;

  console.log(`📤 [OTP] Sending signup OTP to Email: ${email} & SMS: ${phone}`);
  const [emailRes, smsRes] = await Promise.all([
    sendEmailNotification(email, subject, emailHtml),
    sendSMSNotification(phone, smsMessage)
  ]);
  console.log(`   Email: ${emailRes.simulated ? "simulated" : (emailRes.success ? "✅ sent" : "❌ failed")} | SMS: ${smsRes.simulated ? "simulated" : (smsRes.success ? "✅ sent" : "❌ failed")}`);
}

/**
 * Send OTP for Login — fires both SMS and email in parallel.
 * @param {string} phone
 * @param {string} email
 * @param {string} otp
 */
async function sendLoginOTP(phone, email, otp) {
  const subject = `🔑 HIMSARU: Your Login OTP is ${otp}`;
  const emailHtml = buildOtpEmailHtml(
    otp,
    "Login to Your Account",
    "Use the OTP below to securely log in to your HIMSARU account. It is valid for 10 minutes."
  );
  const smsMessage = `HIMSARU: Your login OTP is ${otp}. Valid for 10 min. Do not share.`;

  console.log(`📤 [OTP] Sending login OTP to SMS: ${phone}${email ? ` & Email: ${email}` : ""}`);
  const tasks = [sendSMSNotification(phone, smsMessage)];
  if (email) tasks.push(sendEmailNotification(email, subject, emailHtml));

  const results = await Promise.all(tasks);
  results.forEach((r, i) => {
    const channel = i === 0 ? "SMS" : "Email";
    console.log(`   ${channel}: ${r.simulated ? "simulated" : (r.success ? "✅ sent" : "❌ failed")}`);
  });
}

module.exports = {
  notifyOrderStatusUpdate,
  sendSignupOTP,
  sendLoginOTP
};
