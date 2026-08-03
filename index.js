const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
app.use(bodyParser.json());

const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.PHONE_NUMBER_ID || '1250098288178849';
const ADMIN = '919266313132';
const VERIFY = process.env.VERIFY_TOKEN || 'goldenaxes123';

app.get('/', (req,res)=> res.send('GoldenAxes Bot LIVE with ALL Services ✅'));

app.get('/webhook', (req,res)=>{
  if(req.query['hub.verify_token']===VERIFY) return res.send(req.query['hub.challenge']);
  res.sendStatus(403);
});

async function send(to, msg){
  try{
    await axios.post(`https://graph.facebook.com/v21.0/${PHONE_ID}/messages`,{
      messaging_product:'whatsapp', to, type:'text', text:{body:msg}
    },{headers:{Authorization:`Bearer ${TOKEN}`}});
  }catch(e){ console.log('Send Error', e.response?.data || e.message); }
}

async function sendButtons(to){
  try{
    await axios.post(`https://graph.facebook.com/v21.0/${PHONE_ID}/messages`,{
      messaging_product:'whatsapp',
      to,
      type:'interactive',
      interactive:{
        type:'button',
        body:{text:'Welcome to Golden Axes Financial Services 🙏\n\nYour Trusted Partner for Insurance & Loans.\n\nOur Services:\n- Life Insurance (Term, Wealth, Saving)\n- Health Insurance\n- Motor Insurance\n- All Types of Loans\n\nPlease select:'},
        action:{buttons:[
          {type:'reply', reply:{id:'LIFE', title:'Life Insurance'}},
          {type:'reply', reply:{id:'HEALTH_MOTOR', title:'Health & Motor'}},
          {type:'reply', reply:{id:'LOANS', title:'Loans'}}
        ]}
      }
    },{headers:{Authorization:`Bearer ${TOKEN}`}});
  }catch(e){ console.log('Btn Error', e.response?.data); }
}

app.post('/webhook', async (req,res)=>{
  res.sendStatus(200);
  try{
    const msg = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if(!msg) return;
    const from = msg.from;
    const text = (msg.text?.body || msg.button_reply?.id || msg.interactive?.button_reply?.id || '').toLowerCase();
    console.log(`From ${from}: ${text}`);

    if(text.includes('hi') || text.includes('hello') || text.includes('hey') || text===''){
      await sendButtons(from);
      await send(ADMIN, `🔔 New Lead: ${from} said Hi on WhatsApp Bot`);
      return;
    }
    if(text.includes('life')){
      await send(from, '🛡️ *Life Insurance Plans*\n\n1. *Term Plan* - Pure protection for family\n2. *Wealth Creation* - Investment + Insurance (ULIP)\n3. *Saving Plans* - Guaranteed returns\n\nReply with:\n- TERM\n- WEALTH\n- SAVING\n\nOur expert will call you in 10 mins!');
      return;
    }
    if(text.includes('health_motor') || text.includes('health')){
      await send(from, '🏥 *Health & Motor Insurance*\n\n- Health Insurance: Cashless hospitals across India\n- Motor Insurance: Car / Bike - Instant policy\n\nSend your details, our team will share best quotes!');
      return;
    }
    if(text.includes('loan')){
      await send(from, '💰 *All Types of Loans*\n\n- Personal Loan\n- Business Loan\n- Home Loan\n- Loan Against Property\n\nLow interest, Fast approval. Send your requirement!');
      return;
    }
    if(text.includes('term')){
      await send(from, '🛡️ *Term Plan* - Best for Family Security\n\n1 Cr cover starting @ ₹500/month*\nReply YES for callback.');
      await send(ADMIN, `🔥 HOT Lead: ${from} interested in TERM PLAN`);
      return;
    }
    await send(from, 'Thanks for contacting Golden Axes! 🙏\nType Hi to see menu again.\nCall: 9266313132');
  }catch(e){ console.log('Webhook Error', e.message); }
});

app.listen(process.env.PORT||10000, ()=> console.log('Bot LIVE'));
