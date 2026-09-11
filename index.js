const express = require('express');
const app = express();
app.use(express.json());

app.get('/', (req,res)=>{
  res.send(`<h1>Golden Axes Bot LIVE ✅</h1><p>Crash Fixed!</p><a href='/f'>Client Form /f</a> | <a href='/api/leads'>Leads /api/leads</a><p>Webhook: /api/google-lead-webhook</p>`);
});

app.get('/f', (req,res)=>{
  res.send(`<!doctype html><html><body style='font-family:Arial;padding:20px;max-width:600px;margin:auto'>
<h2>Golden Axes - Client Form</h2>
<form id='f'>
<input name='name' placeholder='Name' required style='width:100%;padding:10px;margin:5px 0'><br>
<input name='mobile' placeholder='Mobile 10 digit' required style='width:100%;padding:10px;margin:5px 0'><br>
<input name='area' placeholder='Area in Delhi' required style='width:100%;padding:10px;margin:5px 0'><br>
<select name='interestPlan' style='width:100%;padding:10px;margin:5px 0'><option>Term</option><option>Health</option><option>Car</option><option>Life</option></select><br>
<button style='width:100%;padding:12px;background:#0a7cff;color:white;border:none;margin-top:10px'>Submit</button>
</form>
<div id='msg'></div>
<script>
document.getElementById('f').onsubmit=async(e)=>{
 e.preventDefault();
 const fd=new FormData(e.target);
 const data=Object.fromEntries(fd);
 document.getElementById('msg').innerText='Submitting...';
 try{
   const r=await fetch('/api/client-form-submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({leadId:'web-'+Date.now(),formData:data})});
   const j=await r.json();
   document.getElementById('msg').innerText=j.success?'✅ Submitted! Atul will call you':'❌ Error';
 }catch(err){ document.getElementById('msg').innerText='Error: '+err.message; }
}
</script>
</body></html>`);
});

const leads=[];
app.post('/api/google-lead-webhook',(req,res)=>{
  console.log('Google lead:', req.body);
  const id='g-'+Date.now();
  leads.push({id, source:'google', body:req.body, time:new Date()});
  res.json({success:true, id});
});

app.post('/api/client-form-submit',(req,res)=>{
  console.log('Client form:', req.body);
  leads.push({id:req.body.leadId||'f-'+Date.now(), source:'form', data:req.body.formData, time:new Date()});
  res.json({success:true});
});

app.get('/api/leads',(req,res)=>res.json(leads));

module.exports = app;
