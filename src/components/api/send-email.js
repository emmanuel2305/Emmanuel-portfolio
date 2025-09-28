// api/send-email.js (Vercel serverless function)
// or backend/routes/send-email.js (Express.js route)

import nodemailer from 'nodemailer'
import cors from 'cors'

// CORS middleware for Vercel
const corsOptions = {
  origin: ['http://localhost:3000', 'https://yourdomain.com'], // Add your domain
  methods: ['POST'],
  credentials: true
}

// Apply CORS
const corsMiddleware = cors(corsOptions)

// Helper function to run middleware
const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result)
      }
      return resolve(result)
    })
  })
}

export default async function handler(req, res) {
  // Apply CORS
  await runMiddleware(req, res, corsMiddleware)

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed. Use POST.' })
  }

  try {
    const {
      from_name,
      from_email,
      to_email,
      subject,
      message,
      urgency,
      user_id,
      timestamp,
      reply_to
    } = req.body

    // Input validation
    if (!from_name || !from_email || !message) {
      return res.status(400).json({ 
        message: 'Missing required fields: name, email, and message are required.' 
      })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(from_email)) {
      return res.status(400).json({ 
        message: 'Invalid email address format.' 
      })
    }

    if (!emailRegex.test(to_email)) {
      return res.status(400).json({ 
        message: 'Invalid recipient email address.' 
      })
    }

    // Create SMTP transporter
    const transporter = nodemailer.createTransporter({
      service: 'gmail', // or 'hotmail', 'yahoo', etc.
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASS  // Your Gmail app password
      },
      tls: {
        rejectUnauthorized: false
      }
    })

    // Verify connection
    await transporter.verify()
    console.log('SMTP connection verified')

    // Determine urgency emoji and priority
    const urgencyMap = {
      urgent: { emoji: '🔴', priority: 'high' },
      high: { emoji: '🟡', priority: 'normal' },
      normal: { emoji: '🟢', priority: 'low' }
    }

    const urgencyInfo = urgencyMap[urgency] || urgencyMap.normal

    // Email template
    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Message</title>
        <style>
            body { font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 2rem; text-align: center; }
            .header h1 { margin: 0; font-size: 1.75rem; font-weight: 700; }
            .content { padding: 2rem; }
            .field { margin-bottom: 1.5rem; }
            .field-label { font-weight: 600; color: #374151; margin-bottom: 0.5rem; display: block; }
            .field-value { background: #f8fafc; padding: 1rem; border-radius: 8px; border-left: 4px solid #22c55e; }
            .message-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 1.5rem; margin: 1rem 0; }
            .urgency { display: inline-block; padding: 0.5rem 1rem; border-radius: 9999px; font-weight: 600; font-size: 0.875rem; }
            .urgency-urgent { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
            .urgency-high { background: #fffbeb; color: #d97706; border: 1px solid #fed7aa; }
            .urgency-normal { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
            .footer { background: #f8fafc; padding: 1.5rem; text-align: center; color: #6b7280; font-size: 0.875rem; border-top: 1px solid #e5e7eb; }
            .reply-button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; text-decoration: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; margin: 1rem 0; }
            .meta-info { background: #f8fafc; border-radius: 8px; padding: 1rem; margin: 1rem 0; font-size: 0.875rem; color: #6b7280; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📧 New Contact Message</h1>
                <p>From your portfolio website</p>
            </div>
            
            <div class="content">
                <div class="field">
                    <span class="field-label">👤 From:</span>
                    <div class="field-value">
                        <strong>${from_name}</strong><br>
                        <a href="mailto:${from_email}" style="color: #3b82f6;">${from_email}</a>
                    </div>
                </div>

                <div class="field">
                    <span class="field-label">📋 Subject:</span>
                    <div class="field-value">${subject}</div>
                </div>

                <div class="field">
                    <span class="field-label">⚡ Priority:</span>
                    <div class="field-value">
                        <span class="urgency urgency-${urgency}">
                            ${urgencyInfo.emoji} ${urgency.charAt(0).toUpperCase() + urgency.slice(1)}
                        </span>
                    </div>
                </div>

                <div class="field">
                    <span class="field-label">💬 Message:</span>
                    <div class="message-box">
                        ${message.replace(/\n/g, '<br>')}
                    </div>
                </div>

                <div style="text-align: center;">
                    <a href="mailto:${from_email}?subject=Re: ${encodeURIComponent(subject)}" class="reply-button">
                        Reply to ${from_name}
                    </a>
                </div>

                <div class="meta-info">
                    <strong>📊 Additional Info:</strong><br>
                    • Timestamp: ${timestamp}<br>
                    • User ID: ${user_id}<br>
                    • Form submitted from portfolio
                </div>
            </div>

            <div class="footer">
                <p>This email was sent from your portfolio contact form.</p>
                <p>You can reply directly to this email to respond to ${from_name}.</p>
            </div>
        </div>
    </body>
    </html>
    `

    // Plain text version
    const textTemplate = `
New Contact Form Message

From: ${from_name} (${from_email})
Subject: ${subject}
Priority: ${urgencyInfo.emoji} ${urgency.charAt(0).toUpperCase() + urgency.slice(1)}

Message:
${message}

---
Timestamp: ${timestamp}
User ID: ${user_id}

Reply directly to this email to respond to ${from_name}.
    `

    // Email options
    const mailOptions = {
      from: {
        name: `Portfolio Contact Form`,
        address: process.env.EMAIL_USER
      },
      to: to_email,
      replyTo: from_email,
      subject: `${urgencyInfo.emoji} ${subject} - from ${from_name}`,
      text: textTemplate,
      html: htmlTemplate,
      priority: urgencyInfo.priority,
      headers: {
        'X-Mailer': 'Portfolio Contact Form',
        'X-Priority': urgency === 'urgent' ? '1' : urgency === 'high' ? '2' : '3'
      }
    }

    // Send email
    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully:', info.messageId)

    // Send auto-reply to the user
    const autoReplyOptions = {
      from: {
        name: 'Emmanuel N',
        address: process.env.EMAIL_USER
      },
      to: from_email,
      subject: `Thanks for reaching out! - Re: ${subject}`,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 2rem; text-align: center;">
            <h1 style="margin: 0;">Thanks for reaching out! 🚀</h1>
          </div>
          <div style="padding: 2rem;">
            <p>Hi ${from_name},</p>
            <p>Thank you for your message! I've received it and will get back to you within 24 hours.</p>
            <p>For urgent matters, you can also reach me via WhatsApp at +91 98765 43210.</p>
            <p>Best regards,<br><strong>Emmanuel N</strong><br>Full Stack Developer</p>
          </div>
          <div style="background: #f8fafc; padding: 1.5rem; text-align: center; color: #6b7280; font-size: 0.875rem;">
            <p>This is an automated response. Please don't reply to this email.</p>
          </div>
        </div>
      `
    }

    // Send auto-reply
    try {
      await transporter.sendMail(autoReplyOptions)
      console.log('Auto-reply sent successfully')
    } catch (autoReplyError) {
      console.error('Auto-reply failed:', autoReplyError)
      // Don't fail the main request if auto-reply fails
    }

    // Success response
    res.status(200).json({
      success: true,
      message: 'Email sent successfully!',
      messageId: info.messageId,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Email sending failed:', error)

    // Handle specific errors
    if (error.code === 'EAUTH') {
      return res.status(500).json({
        message: 'Email authentication failed. Please check email credentials.',
        error: 'Authentication error'
      })
    }

    if (error.code === 'ECONNECTION') {
      return res.status(500).json({
        message: 'Failed to connect to email server. Please try again later.',
        error: 'Connection error'
      })
    }

    return res.status(500).json({
      message: 'Failed to send email. Please try alternative contact methods.',
      error: error.message
    })
  }
}

// For Express.js (if not using Vercel)
/*
export const sendEmailRoute = async (req, res) => {
  return handler(req, res)
}
*/