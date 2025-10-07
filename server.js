import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🔧 Setup email transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587, // use 587 instead of 465
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Helper function: Send form email to admin
const sendAdminEmail = async (type, formData) => {
  const htmlContent = Object.entries(formData)
    .map(([key, value]) => `<p><b>${key}:</b> ${value}</p>`)
    .join("");

  const mailOptions = {
    from: `"Dotcomdotin " <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: `📩 New ${type} Form Submission`,
    html: `<h3>${type.toUpperCase()} Form Details</h3>${htmlContent}`,
  };

  await transporter.sendMail(mailOptions);
};

// ✅ Helper function: Send confirmation email to user
const sendConfirmationEmail = async (userEmail, type, userName = "") => {
  const mailOptions = {
  from: `"Dotcomdotin" <${process.env.EMAIL_USER}>`,
  to: userEmail,
  subject: `✅ We've received your ${type} form`,
  html: `
  <div style="
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #f7f9fc;
    padding: 30px;
    color: #333;
  ">
    <div style="
      max-width: 600px;
      margin: auto;
      background-color: #ffffff;
      border-radius: 10px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
      overflow: hidden;
    ">
      <div style="background-color: #ff6b35; padding: 20px; text-align: center;">
        <h2 style="color: #ffffff; margin: 0;">Dotcomdotin</h2>
      </div>

      <div style="padding: 25px;">
        <h3 style="color: #333;">Hi ${userName || "there"},</h3>
        <p style="font-size: 15px; line-height: 1.6; color: #555;">
          Thank you for submitting your <strong>${type}</strong> form.
          We’ve received your details and our team will get back to you soon.
        </p>

        <p style="font-size: 15px; line-height: 1.6; color: #555;">
          If you have any urgent queries, feel free to reply to this email.
        </p>

        <p style="margin-top: 25px; font-size: 15px; color: #333;">
          Best regards,<br>
          <strong>Dotcomdotin</strong>
        </p>
      </div>

      <div style="
        background-color: #f0f0f0;
        text-align: center;
        padding: 15px;
        font-size: 13px;
        color: #777;
      ">
        © ${new Date().getFullYear()} Dotcomdotin. All rights reserved.
      </div>
    </div>
  </div>
  `
};


  await transporter.sendMail(mailOptions);
};

// 🧾 Main endpoint — Handles multiple form types
app.post("/api/form/:type", async (req, res) => {
  const { type } = req.params;
  const formData = req.body;
  console.log(type);
  console.log(formData);

  if (!formData || Object.keys(formData).length === 0) {
    return res.status(400).json({ success: false, message: "Form data is required" });
  }

  try {
    // 1️⃣ Send to admin
    await sendAdminEmail(type, formData);

    // 2️⃣ Send confirmation to user (if email is present)
    if (formData.email) {
      await sendConfirmationEmail(formData.email, type, formData.firstName || formData.fullName);
    }

    res.json({ success: true, message: `${type} form submitted successfully.` });
  } catch (error) {
    console.error("Email sending error:", error);
    res.status(500).json({ success: false, message: "Failed to send emails" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

