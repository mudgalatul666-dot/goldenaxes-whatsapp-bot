const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "goldenaxes123";
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = "1250098288178849";
const YOUR_PERSONAL = "919266313132";

app.get('/webhook', (req, res) => {
  if (req.query['hub.verify_token'] === VERIFY_TOKEN) res.send(req.query['hub.challenge']);
  else res.sendStatus(403);
});

app.post('/webhook', async (req, res) => {
  try {
    const entry = req.body.entry?.[0]?.changes?.[0]?.value;
    const msg = entry?.messages?.[0];
    if (!msg) return res.sendStatus(200);

    const customerPhone = msg.from;
    let customerText = "";
    if (msg.type === "text") customerText = msg.text.body;
    else if (msg.type === "interactive") customerText = msg.interactive?.button_reply?.title || msg.interactive?.button_reply?.id || "Button Clicked";
    else customerText = "Media/Other";

    let replyPayload;

    if (customerText.toLowerCase().includes("life")) {
      replyPayload = {
        messaging_product: "whatsapp", to: customerPhone, type: "text",
        text: { body: `*Life Insurance - Golden Axes Financial Services* 🛡️\n\nThank you for showing interest in Life Insurance.\n\nWe offer expert guidance in:\n\n✓ *Term Plan* - High Life Cover at Low Premium (1 Cr @ 500/month)\n✓ *Wealth Creation Plans* - ULIP & Investment + Insurance\n✓ *Saving Plans* - Guaranteed Returns + Life Cover\n✓ Child Education & Retirement Plans\n\nPlease share:\n1. Your Age\n2. Your Goal (Protection / Wealth / Saving)\n\nOur licensed advisor will call you in 10 mins for best plan comparison.\n\n- *Team Golden Axes Financial Services*\n📞 011-31507674 | 9266313132` }
      };
    } else if (customerText.toLowerCase().includes("health") || customerText.toLowerCase().includes("motor") || customerText.toLowerCase().includes("health & motor")) {
      replyPayload = {
        messaging_product: "whatsapp", to: customerPhone, type: "text",
        text: { body: `*Health & Motor Insurance - Golden Axes* 🏥🚗\n\nGreat Choice!\n\n*Health Insurance:*\n✓ Cashless in 5000+ Hospitals\n✓ 100% Claim Support\n✓ Family & Individual Plans\n\n*Motor Insurance:*\n✓ Instant Policy - Zero Paperwork\n✓ Zero Dep & Cashless Garage\n✓ Best Price Guaranteed\n\nPlease share:\nFor Health - Family Members & Age\nFor Motor - Vehicle Number\n\nAdvisor will assist you instantly.\n\n- *Team Golden Axes Financial Services*\n📞 011-31507674` }
      };
    } else if (customerText.toLowerCase().includes("loan")) {
      replyPayload = {
        messaging_product: "whatsapp", to: customerPhone, type: "text",
        text: { body: `*Loans - Golden Axes Financial Services* 💰\n\nWe offer quick approvals:\n\n✓ *Personal Loan* - Upto 25 Lakhs\n✓ *Business Loan* - Upto 2 Cr\n✓ *Home Loan* - Lowest Interest Rates\n✓ *Loan Against Property*\n\nPlease share:\n1. Loan Amount Needed\n2. City & Monthly Income\n\nQuick Approval in 24 Hours!\n\n- *Team Golden Axes Financial Services*\n📞 011-31507674` }
      };
    } else {
      // FIRST MESSAGE WITH ALL SERVICES
      replyPayload = {
        messaging_product: "whatsapp",
        to: customerPhone,
        type: "interactive",
        interactive: {
          type: "button",
          body: { text: `*Welcome to Golden Axes Financial Services* 🙏\n\nYour Trusted Partner for Insurance & Loans.\n\n*Our Services:*\n• Life Insurance (Term, Wealth, Saving)\n• Health Insurance\n• Motor Insurance\n• All Types of Loans\n\nPlease select an option below:` },
          action: {
            buttons: [
              { type: "reply", reply: { id: "life_ins", title: "🛡️ Life Insurance" } },
              { type: "reply", reply: { id: "health_motor", title: "🏥 Health & Motor" } },
              { type: "reply", reply: { id: "loans", title: "💰 Loans" } }
            ]
          }
        }
      };
    }

    await axios.post(`https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`, replyPayload, {
      headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` }
    });

    if (customerPhone!== YOUR_PERSONAL) {
      await axios.post(`https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`, {
        messaging_product: "whatsapp", to: YOUR_PERSONAL, type: "text",
        text: { body: `🔔 *NEW LEAD - Golden Axes*\n\n📱 From: +${customerPhone}\n💬 Selected: ${customerText}\n\nLead on: 11 3150 7674 - Call Immediately!` }
      }, { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } });
    }

  } catch (err) { console.log("Error:", err.response?.data || err.message); }
  res.sendStatus(200);
});

app.get('/', (req, res) => res.send('GoldenAxes Bot LIVE with ALL Services ✅'));
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Bot running on ${PORT}`));
