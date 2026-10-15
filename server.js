import http from 'node:http';
import fs from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
const PORT=Number(process.env.PORT||3000);
const MODEL=process.env.OPENAI_MODEL||'gpt-4.1-mini';
const API_KEY=process.env.OPENAI_API_KEY;
const html=await fs.readFile(new URL('./index.html',import.meta.url));
const recent=new Map();
const MAX_BODY=5000;
const send=(res,status,body,type='application/json; charset=utf-8')=>{
 res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','X-Frame-Options':'DENY','Content-Security-Policy':"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'self'"});
 res.end(type.startsWith('application/json')?JSON.stringify(body):body);
};
const validCards = new Set(['Aşıklar','Güneş','Yıldız','Değnek Dörtlüsü','Kupa İkilisi','İmparatoriçe','Dünya','Güç','Adalet','Ermiş','Kılıç İkilisi','Ay','Kule','Asılan Adam','Kader Çarkı','Ölüm','Şeytan','Denge','Kılıç Üçlüsü','Tılsım Ası','Araba','Başrahibe','İmparator','Deli']);
// The client includes a full 78-card deck; validate card shape rather than fixed names.
function isValidCard(c){return c&&typeof c.name==='string'&&c.name.length>0&&c.name.length<=80&&typeof c.reversed==='boolean'&&typeof c.meaning==='string'&&c.meaning.length<=240;}
const server=http.createServer(async(req,res)=>{
 const path=(req.url||'').split('?')[0];
 if(req.method==='GET'&&(path==='/'||path==='/index.html'))return send(res,200,html,'text/html; charset=utf-8');
 if(req.method==='GET'&&path==='/health')return send(res,200,{ok:true,aiConfigured:Boolean(API_KEY)});
 if(req.method!=='POST'||path!=='/api/reading')return send(res,404,{error:'Sayfa bulunamadı.'});
 if(!API_KEY)return send(res,503,{error:'Yapay zekâ henüz etkin değil.'});
 const ip=req.socket.remoteAddress||'unknown';const now=Date.now();
 if(recent.size>5000)for(const [k,v] of recent)if(now-v.last>600000)recent.delete(k);
 const entry=recent.get(ip)||{hits:[],last:now};entry.hits=entry.hits.filter(t=>now-t<60000);entry.last=now;
 if(entry.hits.length>=3)return send(res,429,{error:'Bir dakika bekleyip tekrar deneyin.'});
 entry.hits.push(now);recent.set(ip,entry);
 let input;
 try{
  let body='';for await(const chunk of req){body+=chunk.toString('utf8');if(Buffer.byteLength(body,'utf8')>MAX_BODY)throw new Error('Too large')}
  input=JSON.parse(body);
  if(!input||typeof input.question!=='string'||input.question.trim().length<8||input.question.length>400||!Array.isArray(input.cards)||input.cards.length!==3||!input.cards.every(isValidCard))throw new Error('Invalid');
 }catch{return send(res,400,{error:'Geçersiz soru veya kart bilgisi.'});}
 const cards=input.cards.map(c=>({name:c.name,reversed:c.reversed,meaning:c.meaning}));
 try{
  const ctrl=new AbortController();const timeout=setTimeout(()=>ctrl.abort(),18000);
  let response;
  try{response=await fetch('https://api.openai.com/v1/responses',{method:'POST',signal:ctrl.signal,headers:{'Authorization':`Bearer ${API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:MODEL,max_output_tokens:500,instructions:'Türkçe yaz. Tarot sembolik eğlence ve düşünme aracıdır. Kesin kehanet, tarih, garanti veya doğaüstü kesinlik iddiasında bulunma. Kullanıcının sorusunu doğrudan ele al; üç kartın geçmiş, bugün ve olası yön konumlarını, düz/ters anlamlarını birlikte yorumla. Olumlu, olumsuz veya belirsiz ihtimalleri kartlara göre dengeli değerlendir. Duygusal, özgün, sıcak ve açık bir 100-150 kelimelik yorum oluştur. Korkutucu veya manipülatif dil kullanma. Sağlık, hukuk ve finans konularında profesyonel tavsiye verme. Yalnızca yorum metnini döndür.',input:JSON.stringify({question:input.question.trim(),topic:String(input.topic||'genel').slice(0,30),cards})})});}finally{clearTimeout(timeout)}
  if(!response.ok){console.error('AI provider status',response.status);return send(res,502,{error:'Yorum şu an oluşturulamıyor.'});}
  const data=await response.json();const reading=(data.output||[]).flatMap(x=>x.content||[]).filter(x=>x.type==='output_text').map(x=>x.text).join('\n').trim();
  if(!reading)return send(res,502,{error:'Yorum şu an oluşturulamıyor.'});
  return send(res,200,{reading:reading.slice(0,3500)});
 }catch(e){console.error('AI request failed',e.name);return send(res,502,{error:'Yorum şu an oluşturulamıyor.'});}
});
server.requestTimeout=25000;
server.listen(PORT,'0.0.0.0',()=>console.log(`MEZO'POTAMYA TAROT listening on ${PORT}`));
