const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "goldenaxes123";
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = "1250098288178849"; // Landline 11 3150 7674
const YOUR_PERSONAL = "919266313132"; // Your phone 9266313132

// For Meta Verification
app.get('/webhook', (req, res) => {
  if (req.query['hub.verify_token'] === VERIFY_TOKEN) {
    res.send(req.query['hub.challenge']);
  } else {
    res.sendStatus(403);
  }
});

// When customer sends message to LANDLINE bot
app.post('/webhook', async (req, res) => {
  try {
    const entry = req.body.entry?.[0]?.changes?.[0]?.value;
    const msg = entry?.messages?.[0];
    if (!msg) return res.sendStatus(200);

    const customerPhone = msg.from;
    const customerText = msg.text?.body || "Media/Other";

    console.log(`Message from ${customerPhone}: ${customerText}`);

    // 1. Auto-reply to CUSTOMER
    await axios.post(`https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`, {
      messaging_product: "whatsapp",
      to: customerPhone,
      type: "text",
      text: { body: `Hello! Welcome to Golden Axes Finance 🙏\n\nYou said: ${customerText}\n\nOur team will contact you shortly.` }
    }, {
      headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` }
    });

    // 2. Forward alert to YOU on 9266313132 (if not you)
    if (customerPhone!== YOUR_PERSONAL) {
      await axios.post(`https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`, {
        messaging_product: "whatsapp",
        to: YOUR_PERSONAL,
        type: "text",
        text: { body: `🔔 NEW LEAD on Landline Bot (11 3150 7674)\n\nFrom: +${customerPhone}\nMessage: ${customerText}\n\nReply from your dashboard!` }
      }, {
        headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` }
      });
    }

  } catch (err) {
    console.log("Error:", err.response?.data || err.message);
  }
  res.sendStatus(200);
});

app.get('/', (req, res) => {
  res.send('GoldenAxes Bot LIVE with Forwarding to 9266313132 ✅');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Bot running on ${PORT}`));
