require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// --- Email transporter (Gmail example — works with any SMTP provider) ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail "App Password", NOT your normal password
  },
});

// --- Send WhatsApp message via CallMeBot (free, no business account needed) ---
async function sendWhatsApp(text) {
  if (!process.env.CALLMEBOT_PHONE || !process.env.CALLMEBOT_APIKEY) return;
  const url = `https://api.callmebot.com/whatsapp.php?phone=${process.env.CALLMEBOT_PHONE}&text=${encodeURIComponent(text)}&apikey=${process.env.CALLMEBOT_APIKEY}`;
  try {
    await axios.get(url);
  } catch (err) {
    console.error('WhatsApp send failed:', err.message);
  }
}

app.post('/api/consult', async (req, res) => {
  const { name, phone, destination, message } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ ok: false, error: 'Name and phone are required.' });
  }

  const summary =
    `New Free Counselling Request\n` +
    `Name: ${name}\n` +
    `Phone: ${phone}\n` +
    `Destination: ${destination || 'Not specified'}\n` +
    `Message: ${message || '-'}`;

  try {
    // 1. Email notification
    if (process.env.EMAIL_USER && process.env.EMAIL_TO) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_TO,
        subject: `New Counselling Request — ${name}`,
        text: summary,
      });
    }

    // 2. WhatsApp notification
    await sendWhatsApp(summary);

    res.json({ ok: true });
  } catch (err) {
    console.error('Submission error:', err.message);
    res.status(500).json({ ok: false, error: 'Something went wrong. Please try again.' });
  }
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
