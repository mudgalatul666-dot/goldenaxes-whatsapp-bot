const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res)=>{
  res.send('<h1>Golden Axes Bot LIVE ✅</h1><p><a href="/f">Form /f</a> | <a href="/api/leads">Leads</a><br>Webhook: /api/google-lead-webhook - READY FOR 10 LEADS/DAY</p>');
});

app.get('/f', (req, res)=>{
  res.send(`<!doctype html><html><body style="font-family:Arial;padding:20px;max-width:600px;margin:auto">
  <h2>Golden Axes - Client Form</h2>
  <form id='f'>
  <input name='name' placeholder='Name' required style='width:100%;padding:10px;margin:5px 0'>
  <input name='mobile' placeholder='Mobile 10 digit' required style='width:100%;padding:10px;margin:5px 0'>
  <input name='area' placeholder='Area in Delhi' required style='width:100%;padding:10px;margin:5px 0'>
  <input name='interestPlan' placeholder='Plan: Health/Car/Life' required style='width:100%;padding:10px;margin:5px 0'>
  <button style='width:100%;padding:12px;background:#0a7cff;color:white;border:none;margin-top:10px'>Submit</button>
  </form>
  <div id='msg'></div>
  <script>
  document.getElementById('f').onsubmit=async(e)=>{
    e.preventDefault();
    const fd=new FormData(e.target);
    const data=Object.fromEntries(fd);
    document.getElementById('msg').innerText='Submitting...';
    const r=await fetch('/f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
    document.getElementById('msg').innerText='Thank you! We will call in 10 mins - Golden Axes';
  }
  </script>
  </body></html>`);
});

let leadsDB=[];
app.post('/f',(req,res)=>{
  leadsDB.push({...req.body,time:new Date(),source:'Form'});
  res.json({ok:true});
});

app.get('/api/leads',(req,res)=>{res.json(leadsDB);});

app.all('/api/google-lead-webhook',(req,res)=>{
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS') return res.status(200).end();
  if(req.method==='GET') return res.status(200).send('Golden Axes Webhook LIVE - 10 Genuine Leads/Day - READY');
  try{
    const body=req.body||{};
    let phone='',name='',city='';
    if(body.user_column_data && Array.isArray(body.user_column_data)){
      phone=body.user_column_data.find(c=>c.column_name&&c.column_name.toLowerCase().includes('phone'))?.string_value||'';
      name=body.user_column_data.find(c=>c.column_name&&c.column_name.toLowerCase().includes('name'))?.string_value||'';
      city=body.user_column_data.find(c=>c.column_name&&c.column_name.toLowerCase().includes('city'))?.string_value||'';
    }else{
      phone=body.phone_number||body.phone||'';
      name=body.full_name||body.name||'';
      city=body.city||'Delhi';
    }
    let cleanPhone=phone.toString().replace(/[^0-9]/g,'');
    cleanPhone=cleanPhone.slice(-10);
    const isFake=!cleanPhone.match(/^[6-9][0-9]{9}$/) || cleanPhone.match(/^(.)\1{9}$/) || /test|xyz|mook|fake/i.test(name) || name.length<2;
    if(isFake){
      console.log('MOOK BLOCKED',name,phone);
      return res.status(200).json({ok:true,filtered:true});
    }
    console.log('GENUINE LEAD',name,cleanPhone,city);
    leadsDB.push({name,mobile:cleanPhone,area:city,time:new Date(),source:'Google Ads'});
    return res.status(200).json({ok:true,status:'genuine',phone:cleanPhone});
  }catch(e){
    return res.status(200).json({ok:true});
  }
});

const PORT=process.env.PORT||3000;
app.listen(PORT,()=>{console.log('Golden Axes Ready - 10 Leads/Day');});
module.exports=app;
