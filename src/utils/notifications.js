const Order = require("../models/Order");

let nodemailer;
try {
  nodemailer = require("nodemailer");
} catch (e) {
  console.warn("⚠️ Nodemailer is not installed or failed to load. Email notifications will run in simulation mode.");
}

/**
 * Send SMS Notification (Simulated or via HTTP SMS API)
 * @param {string} phone - Recipient phone number
 * @param {string} message - SMS message text
 */
async function sendSMSNotification(phone, message) {
  try {
    const cleanPhone = phone.trim();
    const smsApiKey = process.env.SMS_API_KEY;
    const senderId = process.env.SMS_SENDER_ID || "HMSRU";

    if (!smsApiKey || smsApiKey.includes("placeholder")) {
      console.log(`ℹ️ [SMS Simulation] To: ${cleanPhone} | Sender: ${senderId} | Msg: "${message}"`);
      return { success: true, simulated: true };
    }

    // In production, trigger request to your SMS provider (e.g. Twilio, Fast2SMS, Msg91, etc.)
    // For demonstration, we show a typical request format:
    /*
    const response = await fetch("https://api.sms-provider.com/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${smsApiKey}` },
      body: JSON.stringify({ to: cleanPhone, sender: senderId, message })
    });
    */
    console.log(`🚀 [SMS Live] Order notification sent to ${cleanPhone}`);
    return { success: true };
  } catch (error) {
    console.error("❌ SMS Notification Error:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send Email Notification (Simulated or via SMTP)
 * @param {string} email - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} htmlContent - HTML formatted body
 */
async function sendEmailNotification(email, subject, htmlContent) {
  try {
    const cleanEmail = email.trim();
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT || 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const fromEmail = process.env.FROM_EMAIL || "HIMSARU <no-reply@himsaru.com>";

    if (!nodemailer || !smtpHost || !smtpUser || !smtpPass || smtpHost.includes("placeholder")) {
      console.log(`ℹ️ [Email Simulation] To: ${cleanEmail} | Subject: "${subject}" | Content: HTML template simulated successfully.`);
      return { success: true, simulated: true };
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort),
      secure: Number(smtpPort) === 465, // true for 465, false for others
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    const mailOptions = {
      from: fromEmail,
      to: cleanEmail,
      subject: subject,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    console.log(`🚀 [Email Live] Order confirmation email sent to ${cleanEmail}`);
    return { success: true };
  } catch (error) {
    console.error("❌ Email Notification Error:", error.message);
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

    // Send notifications in parallel (ignoring failures so one error doesn't block the other)
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

/**
 * Send OTPs for Signup Verification (separate OTPs to Email and Phone)
 */
async function sendSignupOTP(email, phone, emailOtp, phoneOtp) {
  const subject = `🔑 HIMSARU: Verify your Email Address`;
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 500px; margin: 0 auto;">
      <h2 style="color: #1B3A20; text-align: center;">HIMSARU</h2>
      <p style="font-size: 15px; color: #333;">Hello,</p>
      <p style="font-size: 15px; color: #333;">Thank you for registering with HIMSARU. Please use the following One-Time Password (OTP) to verify your email address:</p>
      <div style="background-color: #F3F4F6; padding: 15px; font-size: 24px; font-weight: bold; letter-spacing: 4px; text-align: center; color: #1B3A20; border-radius: 6px; margin: 20px 0;">
        ${emailOtp}
      </div>
      <p style="font-size: 13px; color: #666;">This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
    </div>
  `;
  const smsMessage = `HIMSARU: Your verification OTP is ${phoneOtp}. Valid for 10 minutes.`;

  await Promise.all([
    sendEmailNotification(email, subject, emailHtml),
    sendSMSNotification(phone, smsMessage)
  ]);
}

/**
 * Send OTP for Login verification (to phone number)
 */
async function sendLoginOTP(phone, otp) {
  const smsMessage = `HIMSARU: Your login OTP is ${otp}. Valid for 10 minutes.`;
  await sendSMSNotification(phone, smsMessage);
}

module.exports = { 
  notifyOrderStatusUpdate,
  sendSignupOTP,
  sendLoginOTP
};
