const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const app = express();
app.use(cors());
app.use(bodyParser.json());

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || '1250098288178849';
const OWNER_NUMBER = process.env.OWNER_NUMBER || '919266313132';
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'goldenaxes123';
const FORM_BASE_URL = process.env.FORM_BASE_URL || 'https://golden-axes-backend.vercel.app/f';

let leads = [];

async function sendWhatsApp(to, text){
  if(!WHATSAPP_TOKEN || !PHONE_NUMBER_ID){
    console.log(`SIMULATE to ${to}: ${text}`);
    return {simulated:true};
  }
  try{
    const res = await axios.post(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`,{
      messaging_product:'whatsapp', to, type:'text', text:{body:text}
    },{headers:{Authorization:`Bearer ${WHATSAPP_TOKEN}`, 'Content-Type':'application/json'}});
    return res.data;
  }catch(e){
    console.error(e.response?.data || e.message);
  }
}

// ROOT - Fixes your 404
app.get('/', (req,res)=> res.send('<h2>Golden Axes Bot LIVE ✅</h2><p><a href="/f">Client Form /f</a> | <a href="/api/leads">Leads /api/leads</a></p>'));

// WhatsApp Verify (your old code - KEPT)
app.get('/webhook', (req,res)=>{
  if(req.query['hub.verify_token']===VERIFY_TOKEN) return res.send(req.query['hub.challenge']);
  res.sendStatus(403);
});

// FORM PAGE at /f
app.get('/f', (req,res)=>{
  const leadId = req.query.id || '';
  res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Golden Axes Form</title><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-yellow-50 min-h-screen p-4"><div class="max-w-lg mx-auto bg-white rounded-2xl p-6 shadow"><h1 class="text-2xl font-bold">Golden Axes - Complete Details</h1><p class="text-sm text-gray-500">Lead ID: ${leadId}</p><form id="form" class="mt-4 space-y-3"><input type="hidden" id="leadId" value="${leadId}"><input id="name" required placeholder="Full Name *" class="w-full border p-3 rounded-lg"><input id="mobile" required placeholder="Mobile 10 digit *" class="w-full border p-3 rounded-lg"><input id="area" value="Shahdara" class="w-full border p-3 rounded-lg"><select id="interestPlan" class="w-full border p-3 rounded-lg"><option>Health Insurance</option><option>Term Life</option><option>Shop Insurance</option><option>ReAssure Black 1Cr</option></select><select id="budgetRange" class="w-full border p-3 rounded-lg"><option>10k-25k</option><option>25k-50k</option><option>50k-1L</option><option>1L+</option></select><select id="bestTime" class="w-full border p-3 rounded-lg"><option>Now</option><option>Morning</option><option>Afternoon</option><option>Evening</option></select><textarea id="notes" placeholder="Notes" class="w-full border p-3 rounded-lg"></textarea><button id="btn" class="w-full bg-black text-yellow-400 p-4 rounded-full font-bold">Get Best Quote →</button></form><div id="ok" class="hidden text-center py-12"><div class="text-5xl">✅</div><h2 class="text-2xl font-bold mt-4">Thanks! Details Received</h2><p class="mt-2">Atul will call in 5 mins - 9266313132</p></div></div><script>
document.getElementById('form').addEventListener('submit', async(e)=>{e.preventDefault();document.getElementById('btn').textContent='Sending...';const fd={name:document.getElementById('name').value,mobile:document.getElementById('mobile').value,area:document.getElementById('area').value,interestPlan:document.getElementById('interestPlan').value,budgetRange:document.getElementById('budgetRange').value,bestTime:document.getElementById('bestTime').value,notes:document.getElementById('notes').value,age:'',occupation:'',familyType:'Family',familyMembers:'',fullAddress:'',pincode:'',planType:'New'};const lid=document.getElementById('leadId').value||'DIRECT-'+Date.now();const r=await fetch('/api/client-form-submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({leadId:lid,formData:fd})});if(r.ok){document.getElementById('form').classList.add('hidden');document.getElementById('ok').classList.remove('hidden');}});<\/script></body></html>`);
});

// GOOGLE ADS WEBHOOK - Main lead intake
app.post('/api/google-lead-webhook', async(req,res)=>{
  const d = req.body.lead || req.body;
  const newLead = {id:`GA-${Date.now()}`, name:d.full_name||d.name||'Google User', mobile:(d.phone_number||d.phone||'').replace(/\\D/g,'').slice(-10), area:d.area||'Delhi', interest:d.campaign_name||d.interest||'Health Insurance', source:'Google Ads', createdAt:new Date().toISOString()};
  leads.unshift(newLead);
  const link = `${FORM_BASE_URL}?id=${newLead.id}`;
  const msg = `Hi ${newLead.name}! Thanks for contacting Golden Axes for ${newLead.interest} in ${newLead.area}. Please fill 2-min form: ${link} - Atul 9266313132`;
  await sendWhatsApp('91'+newLead.mobile, msg);
  res.json({success:true, leadId:newLead.id});
});

// CLIENT FORM SUBMIT -> Notify OWNER
app.post('/api/client-form-submit', async(req,res)=>{
  const {leadId, formData} = req.body;
  const lead = leads.find(l=>l.id===leadId);
  if(lead) Object.assign(lead, formData, {status:'READY'});
  const ownerMsg = `🔥 READY LEAD - ${formData.name} - ${formData.area} Mob: 91${formData.mobile} Int: ${formData.interestPlan} Bud: ${formData.budgetRange} Time: ${formData.bestTime} Notes: ${formData.notes} https://wa.me/91${formData.mobile} ID: ${leadId}`;
  await sendWhatsApp(OWNER_NUMBER, ownerMsg);
  await sendWhatsApp('91'+formData.mobile, `Thanks ${formData.name}! Atul will call at ${formData.bestTime} - 9266313132`);
  res.json({success:true});
});

app.get('/api/leads', (req,res)=> res.json(leads));

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log('Live on '+PORT));
