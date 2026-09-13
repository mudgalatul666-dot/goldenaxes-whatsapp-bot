// api/google-lead-webhook.js - FINAL FREE - Golden Axes - 9266313132
// Google Scraper -> Real Leads Only -> FREE Welcome to Client + FREE Telegram to You

const TG_TOKEN = "8985991031:AAFANHLa_oYNXh7dCLwqRTz6QC-id14ZAFc";
const TG_CHAT_OWNER = "8085742553"; // YOU - 9266313132

const WELCOME = `Hello, This is Golden Axes Financial Services!

We found your contact via Google for financial services requirement.

Thank you for your interest. Our financial expert will call you within 10 minutes to assist you.

For urgent queries, Email/WhatsApp us on 9266313132.

- Team Golden Axes Financial Services`;

if (!global.leads) global.leads = [];

function isMook(mobile, name) {
  if (!mobile) return true;
  const m = mobile.toString().replace(/\D/g, '');
  const n = (name||"").toLowerCase();
  if (["9999999999","1111111111","0000000000","1234567890","650555","9876543210"].some(b=>m.includes(b))) return true;
  if (/^(\d)\1{9,}$/.test(m)) return true;
  if (["test","firstname","abc"].some(b=>n.includes(b))) return true;
  if (m.length < 10) return true;
  return false;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    return res.status(200).json({ 
      message: "Golden Axes LIVE - Real Leads Only - 9266313132",
      welcome: WELCOME,
      total: global.leads.length
    });
  }

  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      const name = (body.name || body.fullName || "Client").toString().trim();
      const mobile = (body.mobile || body.phone || "").toString().trim();
      const email = (body.email || "").toString().trim();
      const area = (body.area || "Delhi").toString().trim();

      if (isMook(mobile, name)) {
        return res.status(200).json({ success: false, mook: true, message: "Mook blocked" });
      }

      global.leads.unshift({ name, mobile, email, area, time: new Date().toISOString() });

      // FREE Telegram to YOU on 9266313132
      const ownerMsg = `🔥 REAL LEAD - Google ✅\n\nClient: ${name}\nMobile: ${mobile}\nEmail: ${email||"No email"}\nArea: ${area}\nTime: ${new Date().toLocaleString()}\n\n✅ Welcome to Client:\n${WELCOME}\n\n📞 CALL NOW: ${mobile}\nOwner: 9266313132 - FREE`;

      try {
        await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage?chat_id=${TG_CHAT_OWNER}&text=${encodeURIComponent(ownerMsg)}`);
      } catch(e) { console.log("TG error", e); }

      return res.status(200).json({ success: true, realLead: true, welcome: WELCOME, owner: "Telegram sent to 9266313132" });

    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}
