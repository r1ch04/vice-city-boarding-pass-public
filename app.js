"use strict";
const $=id=>document.getElementById(id);
const defaults={
  passenger:"JASON / MICHAEL",cabin:"business",seat:"06A",originCode:"LSX",originCity:"洛聖都",originAirport:"洛聖都國際機場",destinationCode:"VCI",destinationCity:"罪惡城",destinationAirport:"罪惡城國際機場",
  flight:"FU 061",aircraft:"BOEING 787-9",departureDate:"2026-11-19",boardingTime:"09:20",departureTime:"10:00",arrivalDate:"2026-11-19",arrivalTime:"18:30",terminal:"T2",gate:"B12",zone:"01",booking:"VC6LSX",sequence:"0019",ticketNumber:"061-2026111906",baggage:"2 PC / 32 KG",status:"PRIORITY",
  airline:"flyUS",tagline:"活得精彩一點，和我們一起飛翔！",message:"The Goodlife State",language:"bilingual",accent:"#24283f",showStub:true,showBarcode:true,showMessage:true,showNotice:false,theme:"classic",
  backgroundId:"palm-sunset",customImage:"",backgroundZoom:100,backgroundX:50,backgroundY:50,overlay:58
};
let state={...defaults},gallery=[],galleryPage=1,bgData="",bgWidth=1568,bgHeight=656,scriptFont="",imageToken=0,backgroundPromise=Promise.resolve();
const airports={LSX:["洛聖都","洛聖都國際機場","LOS SANTOS"],VCI:["罪惡城","罪惡城國際機場","VICE CITY"],TPE:["臺北","臺灣桃園國際機場","TAIPEI"],HKG:["香港","香港國際機場","HONG KONG"],NRT:["東京","成田國際機場","TOKYO"],LAX:["洛杉磯","洛杉磯國際機場","LOS ANGELES"]};
const airportEnglish={LSX:"LOS SANTOS INTERNATIONAL AIRPORT",VCI:"VICE CITY INTERNATIONAL AIRPORT",TPE:"TAIWAN TAOYUAN INTERNATIONAL AIRPORT",HKG:"HONG KONG INTERNATIONAL AIRPORT",NRT:"NARITA INTERNATIONAL AIRPORT",LAX:"LOS ANGELES INTERNATIONAL AIRPORT"};
const categories={"Jason and Lucia":"傑森與露西亞","Jason Duval":"傑森","Lucia Caminos":"露西亞","Vice City":"罪惡城","Leonida Keys":"雷奧奈達群島","Port Gellhorn":"蓋爾霍恩港","Grassrivers":"草之河","Ambrosia":"安布羅西亞","Cal Hampton":"卡爾・漢普頓","Boobie Ike":"布比・艾克","DreQuan Priest":"德昆・普里斯特","Real Dimez":"Real Dimez","Raul Bautista":"勞爾・巴蒂斯塔","Brian Heder":"布萊恩・赫德","Mount Kalaga National Park":"卡拉加山國家公園"};
const cabins={economy:["經濟艙","ECONOMY"],premium:["豪華經濟艙","PREMIUM ECONOMY"],business:["商務艙","BUSINESS"],first:["頭等艙","FIRST CLASS"]};
const labels={boarding:["登機證","BOARDING PASS"],passenger:["旅客姓名","PASSENGER"],from:["出發地","FROM"],to:["抵達地","TO"],flight:["航班","FLIGHT"],date:["日期","DATE"],boardingTime:["登機時間","BOARDING"],terminal:["航廈","TERMINAL"],gate:["登機門","GATE"],seat:["座位","SEAT"],zone:["登機區","ZONE"],booking:["訂位","REF"],baggage:["行李","BAG"],ticket:["電子機票","E-TICKET"],sequence:["序號","SEQ"],notice:["紀念票・非有效乘機憑證","SOUVENIR · NOT VALID FOR TRAVEL"]};
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[c]));
const label=k=>{const [zh,en]=labels[k];return state.language==="zh"?zh:state.language==="en"?en:`${zh} ${en}`};
const color=()=>/^#[\da-f]{6}$/i.test(state.accent)?state.accent:defaults.accent;
const safe=(v,f="－")=>String(v||f);
function formatDate(v,short=false){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(v||""))return "－";
  const [y,m,d]=v.split("-");
  if(state.language==="zh")return short?`${m}月${d}日`:`${y}年 ${m}月 ${d}日`;
  return `${d} ${["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"][+m-1]}${short?"":` ${y}`}`;
}
function city(prefix){const a=airports[state[prefix+"Code"].toUpperCase()];return state.language==="en"&&a&&a[0]===state[prefix+"City"]?a[2]:state[prefix+"City"]}
function airport(prefix){const code=state[prefix+"Code"].toUpperCase(),a=airports[code];return state.language==="en"&&a&&a[1]===state[prefix+"Airport"]?airportEnglish[code]:state[prefix+"Airport"]}
function feedback(message,error=false){$("feedback").textContent=message;$("feedback").classList.toggle("error",error)}
function barPattern(x,y,width,height,seed=19,fill=color()){
  let out="",p=x,i=0;
  while(p<x+width-3){const w=1+(seed+i*7)%3,g=1+(seed+i*3)%2;out+=`<rect x="${p}" y="${y}" width="${w}" height="${height-(i%13===0?0:2)}" fill="${fill}"/>`;p+=w+g;i++}
  return out;
}
function decorativeMatrix(x,y,size){
  let out="",n=25,cell=size/n,seed=[...state.booking].reduce((a,c)=>a+c.charCodeAt(0),7);
  for(let row=0;row<n;row++)for(let col=0;col<n;col++){
    const finder=(ox,oy)=>{const a=col-ox,b=row-oy;return a>=0&&a<7&&b>=0&&b<7?((a===0||a===6||b===0||b===6)||(a>=2&&a<=4&&b>=2&&b<=4)):null};
    const f1=finder(0,0),f2=finder(18,0),f3=finder(0,18),finderValue=f1??f2??f3;
    if(finderValue??((row*col+row*7+col*11+seed)%7<3))out+=`<rect x="${x+col*cell}" y="${y+row*cell}" width="${cell+.1}" height="${cell+.1}" fill="${color()}"/>`;
  }
  return out;
}
function ticketSVG(){
  const W=1200,H=480,m=state.showStub?870:1200,ink=color(),night=state.theme==="thermal",sunset=state.theme==="sunset",normal="'Noto Sans TC','Microsoft JhengHei','PingFang TC',sans-serif";
  const text=(x,y,v,size=18,weight=500,fill=ink,attrs="")=>`<text x="${x}" y="${y}" font-family="${normal}" font-size="${size}" font-weight="${weight}" fill="${fill}" ${attrs}>${esc(v)}</text>`;
  const fit=(x,y,v,width,size=18,weight=500,fill=ink,attrs="")=>{
    const s=safe(v),est=[...s].reduce((n,c)=>n+(/[^\x00-\xff]/.test(c)?1:.61),0)*size;
    return text(x,y,s,size,weight,fill,`${attrs} ${est>width?`textLength="${width}" lengthAdjust="spacingAndGlyphs"`:""}`);
  };
  const line=(x1,y1,x2,y2,opacity=.4,extra="")=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${ink}" opacity="${opacity}" ${extra}/>`;
  const plane=(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})" stroke="${ink}" fill="${ink}" stroke-width=".5"><g transform="rotate(45 12 12)"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></g></g>`;
  const overlay=state.overlay/100,palette=night?["#3e235d","#45255b"]:sunset?["#ffe0b7","#ebb4c4"]:["#d8c3ff","#a5b9f9"];
  const scale=Math.max(W/bgWidth,H/bgHeight)*state.backgroundZoom/100,bw=bgWidth*scale,bh=bgHeight*scale,bx=(W-bw)*state.backgroundX/100,by=(H-bh)*state.backgroundY/100;
  let out=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="ticket-title"><title id="ticket-title">${esc(state.passenger)}，${esc(state.originCode)} 飛往 ${esc(state.destinationCode)}，自訂登機證</title><defs><linearGradient id="bodyTint" x1="0" y1="0" x2=".2" y2="1"><stop stop-color="${palette[0]}"/><stop offset="1" stop-color="${palette[1]}"/></linearGradient><linearGradient id="sunsetBand"><stop stop-color="#bb7cbb"/><stop offset=".55" stop-color="#f1a4ae"/><stop offset="1" stop-color="#ffbf98"/></linearGradient><clipPath id="ticketClip"><rect width="1200" height="480" rx="8"/></clipPath><mask id="ticketNotches"><rect width="1200" height="480" fill="white"/>${state.showStub?'<circle cx="870" cy="0" r="9" fill="black"/><circle cx="870" cy="480" r="9" fill="black"/>':""}</mask>${scriptFont?`<style>@font-face{font-family:TicketScript;src:url('${scriptFont}') format('truetype')}</style>`:""}</defs><g clip-path="url(#ticketClip)" mask="url(#ticketNotches)"><rect width="${W}" height="${H}" fill="#b19cd7"/>`;
  if(bgData)out+=`<image x="${bx}" y="${by}" width="${bw}" height="${bh}" href="${bgData}" preserveAspectRatio="none"/>`;
  out+=`<rect width="${W}" height="${H}" fill="url(#bodyTint)" opacity="${overlay}"/><rect width="${W}" height="${H}" fill="${night?"#180e31":"#f4e8ff"}" opacity="${night?.14:.12}"/><rect width="${W}" height="54" fill="url(#sunsetBand)" opacity=".92"/><rect y="472" width="${W}" height="8" fill="url(#sunsetBand)" opacity=".85"/>`;
  out+=fit(35,38,state.airline,138,33,800,"#fff4fa",'font-style="italic"')+fit(200,35,state.tagline,m-455,16,700,"#fff6fa");
  out+=fit(m-25,34,label("boarding"),185,13,700,"#fff6fa",'text-anchor="end" letter-spacing="1"');
  if(state.showStub)out+=text(1162,40,"VI",34,900,"#fff5f8",'text-anchor="end"');
  if(state.showBarcode){
    out+=`<g transform="translate(24 383) rotate(-90)">${barPattern(0,0,298,26,23)}</g>`;
    out+=text(17,409,`${state.originCode} / ${state.destinationCode}`,11,500,ink,'transform="rotate(-90 17 409)"');
  }
  const x=state.showBarcode?98:42,to=state.showStub?488:740,contentRight=m-36;
  out+=fit(x,96,`${label("from")} · ${city("origin")}`,330,16,500);
  out+=fit(to,96,`${label("to")} · ${city("destination")}`,m-to-30,16,500);
  out+=fit(x,185,state.originCode.toUpperCase()||"---",state.showStub?285:370,102,900,ink,'letter-spacing="1"');
  out+=fit(to,185,state.destinationCode.toUpperCase()||"---",m-to-32,102,900,ink,'letter-spacing="1"');
  const pc=state.showStub?382:560;
  out+=line(pc-48,151,pc-15,151,.6)+plane(pc-4,128,1.9)+line(pc+56,151,pc+90,151,.6);
  out+=fit(x,216,airport("origin"),state.showStub?354:520,23,700)+fit(to,216,airport("destination"),m-to-30,23,700);
  out+=fit(x,247,formatDate(state.departureDate),330,18,500)+fit(to,247,formatDate(state.arrivalDate),m-to-30,18,500);
  out+=text(x,275,safe(state.departureTime),25,600)+text(to,275,safe(state.arrivalTime),25,600);
  const bandX=x-12,bandW=m-bandX-30;
  out+=`<rect x="${bandX}" y="296" width="${bandW}" height="65" fill="${night?"#e4c6ff":"#ffffff"}" opacity="${night?.13:.48}"/>`;
  const cols=state.showStub?[x,427,587,716]:[x,590,804,994],widths=state.showStub?[305,137,110,110]:[455,170,150,150];
  ["passenger","flight","seat","gate"].forEach((key,i)=>{out+=fit(cols[i],317,label(key),widths[i],13,500)+fit(cols[i],346,state[key],widths[i],i===0?24:25,800)});
  out+=text(x,386,label("boardingTime"),12,500)+text(x,411,safe(state.boardingTime),23,700);
  out+=text(x+166,386,label("terminal"),12,500)+text(x+166,411,safe(state.terminal),23,700);
  out+=text(x+286,386,label("zone"),12,500)+text(x+286,411,safe(state.zone),23,700);
  const cabin=cabins[state.cabin]||cabins.economy,cabinText=state.language==="zh"?cabin[0]:state.language==="en"?cabin[1]:`${cabin[0]} ${cabin[1]}`;
  const priority=state.language==="zh"?({PRIORITY:"優先登機",STANDARD:"一般登機","LOUNGE ACCESS":"貴賓室禮遇"}[state.status]||state.status):state.status;
  out+=fit(x+404,386,cabinText,state.showStub?190:330,15,700)+fit(x+404,410,priority,state.showStub?190:330,13,500);
  if(state.showMessage){
    const script=!/[^\x00-\xff]/.test(state.message);
    out+=fit(x,443,state.message,state.showBarcode?m-x-195:m-x-40,script?43:23,script?600:700,ink,script?'style="font-family:TicketScript,cursive"':"");
  }
  if(state.showBarcode)out+=`<g opacity=".9">${decorativeMatrix(m-130,378,73)}</g>`;
  out+=fit(x,465,`${label("booking")} ${safe(state.booking)} · ${label("baggage")} ${state.baggage} · ${state.aircraft} · ${label("ticket")} ${safe(state.ticketNumber)} · ${state.sequence}`,m-x-30,11,500);
  if(state.showNotice)out+=fit(contentRight,478,label("notice"),m-x-30,10,600,ink,'text-anchor="end"');
  if(state.showStub){
    out+=`<line x1="870" y1="0" x2="870" y2="480" stroke="#fff4ff" stroke-width="2" stroke-dasharray="8 7" opacity=".9"/>`;
    out+=text(898,108,state.originCode.toUpperCase()||"---",37,900)+text(1172,108,state.destinationCode.toUpperCase()||"---",37,900,ink,'text-anchor="end"')+plane(1016,80,1.35);
    out+=fit(898,134,airport("origin"),123,12,600)+fit(1172,134,airport("destination"),123,12,600,ink,'text-anchor="end"');
    out+=fit(898,156,formatDate(state.departureDate,true),120,13,500)+fit(1172,156,formatDate(state.arrivalDate,true),123,13,500,ink,'text-anchor="end"');
    out+=text(898,178,safe(state.departureTime),15,600)+text(1172,178,safe(state.arrivalTime),15,600,ink,'text-anchor="end"');
    out+=line(898,192,1172,192,.45);
    out+=`<rect x="898" y="207" width="274" height="136" fill="${night?"#e4c6ff":"#ffffff"}" opacity="${night?.13:.48}"/>`;
    out+=text(1035,228,label("passenger"),12,500,ink,'text-anchor="middle"')+fit(1035,256,state.passenger,250,23,800,ink,'text-anchor="middle"');
    out+=fit(920,280,`${label("flight")} ${safe(state.flight)}`,235,18,700);
    out+=text(950,305,label("seat"),12,500,ink,'text-anchor="middle"')+text(1120,305,label("gate"),12,500,ink,'text-anchor="middle"');
    out+=text(950,331,safe(state.seat),25,800,ink,'text-anchor="middle"')+text(1120,331,safe(state.gate),25,800,ink,'text-anchor="middle"');
    out+=fit(1035,367,`${label("boardingTime")} ${safe(state.boardingTime)} · ${state.terminal} · ${state.zone}`,272,13,500,ink,'text-anchor="middle"');
    if(state.showBarcode)out+=barPattern(898,386,274,27,31)+fit(1035,430,`${state.flight} · ${state.originCode}-${state.destinationCode} · ${state.sequence}`,274,12,500,ink,'text-anchor="middle"');
    else out+=fit(1035,410,cabinText,274,18,700,ink,'text-anchor="middle"');
    out+=text(898,445,"WELCOME TO",10,700,"#fff3ff",'letter-spacing="2"');
    out+=text(898,state.showNotice?467:471,"Vice City",36,600,"#fff3ff",'style="font-family:TicketScript,cursive"')+fit(1170,464,state.airline,95,23,800,"#fff3ff",'text-anchor="end" font-style="italic"');
    if(state.showNotice)out+=fit(1035,478,label("notice"),272,10,600,ink,'text-anchor="middle"');
  }
  return out+"</g></svg>";
}
function syncPresets(){
  for(const p of ["origin","destination"]){const a=airports[state[p+"Code"].toUpperCase()],el=$(p+"Preset");el.value=a&&a[0]===state[p+"City"]&&a[1]===state[p+"Airport"]&&[...el.options].some(o=>o.value===state[p+"Code"].toUpperCase())?state[p+"Code"].toUpperCase():"custom"}
}
function syncForm(){for(const [k,v] of Object.entries(state)){const e=$(k);if(e?.name){if(e.type==="checkbox")e.checked=v;else e.value=v}}syncPresets();update()}
function update(){
  const svg=ticketSVG();$("ticketHolder").innerHTML=svg;if($("zoomDialog").open)$("zoomTicket").innerHTML=svg;
  $("ticketHolder").setAttribute("aria-label",`${state.passenger}，${state.originCity}飛往${state.destinationCity}，${state.flight}，${state.seat}，自訂登機證`);
  const cap=p=>{const a=airports[state[p+"Code"].toUpperCase()];return a&&a[0]===state[p+"City"]?a[2]:state[p+"City"]};
  $("routeCaption").textContent=`${cap("origin")} → ${cap("destination")}`;$("accentHex").value=color().toUpperCase();
  for(const k of ["backgroundZoom","backgroundX","backgroundY","overlay"])$(k+"Value").textContent=state[k]+"%";
  document.querySelectorAll("[data-theme]").forEach(b=>{const a=b.dataset.theme===state.theme;b.classList.toggle("selected",a);b.setAttribute("aria-pressed",String(a))});
}
function setTab(name,focus=false){document.querySelectorAll("[data-tab]").forEach(b=>{const a=b.dataset.tab===name;b.setAttribute("aria-selected",String(a));b.tabIndex=a?0:-1;$(b.getAttribute("aria-controls")).hidden=!a;if(a&&focus)b.focus()})}
function validate(){
  const bad=[...$("ticketForm").elements].filter(e=>e.name&&e.type!=="checkbox"&&(!e.checkValidity()||(e.required&&!e.value.trim())));
  [...$("ticketForm").elements].filter(e=>e.name).forEach(e=>e.setAttribute("aria-invalid",String(bad.includes(e))));
  if(!bad.length)return true;const e=bad[0];setTab(e.closest(".tab-panel").id.replace("panel-",""));e.focus();feedback(e.id.includes("Code")?"機場代碼請填入 3 個英文字母。":e.id==="accentHex"?"請輸入有效的 6 位色碼，例如 #24283F。":"請先補齊標示欄位，並確認日期與時間格式。",true);return false;
}
function imageToDataURL(src,max=2400){
  return new Promise((resolve,reject)=>{const img=new Image();img.crossOrigin="anonymous";img.onload=()=>{try{const r=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight)),c=document.createElement("canvas");c.width=Math.round(img.naturalWidth*r);c.height=Math.round(img.naturalHeight*r);c.getContext("2d").drawImage(img,0,0,c.width,c.height);resolve({data:c.toDataURL("image/webp",.9),width:c.width,height:c.height})}catch(e){reject(e)}};img.onerror=()=>reject(new Error("圖片載入失敗"));img.src=src});
}
function backgroundInfo(id){
  if(id==="palm-sunset")return {id,title:"棕櫚落日",src:"assets/palm-sunset.webp",thumb:"assets/palm-sunset.webp",category:"你的底圖"};
  if(id==="custom"&&state.customImage)return {id,title:"我的上傳圖片",src:state.customImage,thumb:state.customImage,category:"你的底圖"};
  return gallery.find(i=>i.id===id);
}
function chooseBackground(id,{close=false,resetCrop=false}={}){
  const item=backgroundInfo(id);if(!item)return Promise.reject(new Error("找不到背景"));
  const token=++imageToken;$("backgroundStatus").textContent="正在套用…";
  backgroundPromise=imageToDataURL(item.src).then(result=>{
    if(token!==imageToken)return;bgData=result.data;bgWidth=result.width;bgHeight=result.height;state.backgroundId=id;
    if(resetCrop){state.backgroundZoom=100;state.backgroundX=50;state.backgroundY=50}
    $("backgroundName").textContent=item.title;$("selectedBackgroundThumb").src=item.thumb;$("backgroundStatus").textContent="已套用";
    syncForm();if($("galleryDialog").open)renderGallery();if(close)$("galleryDialog").close();
  }).catch(error=>{if(token===imageToken){$("backgroundStatus").textContent="載入失敗";feedback("圖片載入失敗，已保留目前的票面。請再選一次，或上傳自己的圖片。",true)}throw error});
  return backgroundPromise;
}
function galleryItems(){return [backgroundInfo("palm-sunset"),...(state.customImage?[backgroundInfo("custom")]:[]),...gallery]}
function renderGallery(){
  const q=$("gallerySearch").value.trim().toLowerCase(),cat=$("galleryCategory").value;
  const items=galleryItems().filter(i=>(cat==="all"||i.category===cat)&&(!q||`${i.title} ${i.category} ${categories[i.category]||""}`.toLowerCase().includes(q)));
  const pages=Math.max(1,Math.ceil(items.length/24));galleryPage=Math.min(Math.max(galleryPage,1),pages);
  const shown=items.slice((galleryPage-1)*24,galleryPage*24);
  $("galleryGrid").innerHTML=shown.length?shown.map(i=>`<button class="gallery-card ${state.backgroundId===i.id?"selected":""}" data-background="${esc(i.id)}" aria-pressed="${state.backgroundId===i.id}"><img src="${esc(i.thumb)}" width="360" height="210" loading="lazy" alt="${esc(i.title)}"><span>${esc(i.category==="你的底圖"?i.title:`${categories[i.category]||i.category} ${i.title.match(/\d+$/)?.[0]||""}`)}</span></button>`).join(""):'<p class="gallery-empty">找不到這個場景，試試其他關鍵字或分類。</p>';
  $("galleryCount").textContent=`${items.length} 個背景 · 收錄 ${gallery.length} 張官方截圖`;$("galleryPage").textContent=`${galleryPage} / ${pages}`;$("galleryPrev").disabled=galleryPage===1;$("galleryNext").disabled=galleryPage===pages;
}
function openGallery(){renderGallery();$("galleryDialog").showModal();$("gallerySearch").focus()}
async function uploadBackground(file){
  if(!file)return;
  try{
    if(!["image/png","image/jpeg","image/webp"].includes(file.type)||file.size>12*1024*1024)throw new Error("format");
    const url=URL.createObjectURL(file);let result;try{result=await imageToDataURL(url)}finally{URL.revokeObjectURL(url)}
    state.customImage=result.data;await chooseBackground("custom",{resetCrop:true});feedback("圖片已套用。可在「票面設計」調整位置與柔霧遮罩；圖片只在目前頁面處理。");
  }catch{feedback("無法讀取圖片。請使用 12 MB 以內的 JPG、PNG 或 WebP 圖片。",true)}
  finally{$("backgroundFile").value=""}
}
function downloadBlob(blob,name){const u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),30000)}
function filename(ext){const n=state.passenger.replace(/[^\p{L}\p{N}_-]/gu,"_").replace(/_+/g,"_").slice(0,28)||"passenger";return `DEPARTURE_${state.originCode}_${state.destinationCode}_${n}.${ext}`}
async function rasterize(){
  await backgroundPromise;await document.fonts.ready;
  const image=new Image();image.crossOrigin="anonymous";image.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(ticketSVG().replace('role="img"',""));await image.decode();
  const canvas=document.createElement("canvas");canvas.width=3600;canvas.height=1440;canvas.getContext("2d").drawImage(image,0,0,3600,1440);return canvas;
}
async function exportTicket(){
  if(!validate())return;const b=$("exportBtn"),q=$("quickExportBtn"),t=b.querySelector("span");b.disabled=true;q.disabled=true;t.textContent="正在準備…";feedback("正在產生高清票面，請稍候。");
  try{
    const canvas=await rasterize(),format=$("exportFormat").value;
    if(format==="pdf"){if(!window.jspdf)throw new Error("PDF 模組載入失敗");const doc=new window.jspdf.jsPDF({orientation:"landscape",unit:"mm",format:[240,96],compress:true});doc.setProperties({title:`${state.originCode} to ${state.destinationCode} - Boarding Pass Design`,creator:"DEPARTURE. Boarding Pass Studio"});doc.addImage(canvas.toDataURL("image/png"),"PNG",0,0,240,96);downloadBlob(doc.output("blob"),filename("pdf"));feedback("PDF 已產生並開始下載。票面為 240 × 96 毫米，包含你選擇的背景與標示設定。")}
    else{const blob=await new Promise((resolve,reject)=>canvas.toBlob(v=>v?resolve(v):reject(new Error("無法輸出")),"image/png"));downloadBlob(blob,filename("png"));feedback("PNG 已產生並開始下載。解析度為 3600 × 1440 像素，背景與標示依照目前設定輸出。")}
  }catch(e){console.error(e);feedback("匯出未完成，請確認背景已載入後再試，或改用 PNG 格式。",true)}
  finally{b.disabled=false;q.disabled=false;t.textContent="下載登機證"}
}
function saveDesign(){downloadBlob(new Blob([JSON.stringify({app:"departure-studio",version:1,design:state},null,2)],{type:"application/json"}),filename("json"));feedback("設計檔已開始下載，包含背景、紀念標示與所有自訂設定。")}
async function loadDesign(file){
  if(!file)return;
  try{
    if(file.size>12*1024*1024)throw new Error("size");const data=JSON.parse(await file.text());
    if(data.app!=="departure-studio"||data.version!==1||!data.design||typeof data.design!=="object"||Array.isArray(data.design))throw new Error("format");
    const next={...defaults};
    for(const k of Object.keys(defaults)){
      const v=data.design[k],el=$(k);if(v===undefined)continue;if(typeof v!==typeof defaults[k])throw new Error("type");
      if(k==="customImage"){if(v&&!/^data:image\/(?:jpeg|png|webp);base64,[a-zA-Z0-9+/=]+$/.test(v))throw new Error("image");if(v.length>10*1024*1024)throw new Error("size")}
      else if(typeof v==="string"){if(v.length>200||(el?.maxLength>0&&v.length>el.maxLength))throw new Error("long");if(el?.tagName==="SELECT"&&![...el.options].some(o=>o.value===v))throw new Error("option")}
      if(typeof v==="number"&&(!Number.isFinite(v)||v<(k==="backgroundZoom"?100:0)||v>(k==="backgroundZoom"?200:k==="overlay"?90:100)))throw new Error("range");next[k]=v;
    }
    if(!["classic","sunset","thermal"].includes(next.theme)||!/^#[\da-f]{6}$/i.test(next.accent))throw new Error("theme");
    if(next.backgroundId!=="palm-sunset"&&next.backgroundId!=="custom"&&!gallery.some(i=>i.id===next.backgroundId))throw new Error("background");if(next.backgroundId==="custom"&&!next.customImage)throw new Error("image");
    for(const k of ["departureDate","arrivalDate"])if(!/^\d{4}-\d{2}-\d{2}$/.test(next[k])||new Date(next[k]+"T12:00:00").toISOString().slice(0,10)!==next[k])throw new Error("date");
    for(const k of ["boardingTime","departureTime","arrivalTime"])if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(next[k]))throw new Error("time");
    const previous=state;state=next;try{await chooseBackground(state.backgroundId);syncForm()}catch(e){state=previous;syncForm();throw e}feedback("設計檔已載入，背景、標示設定與所有欄位已同步更新。");
  }catch{feedback("無法讀取設計檔。請選擇由這個設計室匯出的有效 JSON 檔案（12 MB 以內）。",true)}
  finally{$("loadFile").value=""}
}
document.addEventListener("DOMContentLoaded",async()=>{
  lucide.createIcons();
  $("ticketForm").addEventListener("submit",e=>e.preventDefault());
  $("ticketForm").addEventListener("input",e=>{
    const el=e.target;if(!el.name||!(el.name in defaults))return;state[el.name]=el.type==="checkbox"?el.checked:el.type==="range"?Number(el.value):el.value;
    if(["originCode","destinationCode","flight","seat","booking"].includes(el.name)){state[el.name]=el.value.toUpperCase();el.value=state[el.name]}el.removeAttribute("aria-invalid");syncPresets();update();if($("feedback").classList.contains("error"))feedback("");
  });
  $("accentHex").addEventListener("input",e=>{if(/^#[\da-f]{6}$/i.test(e.target.value)){state.accent=e.target.value;$("accent").value=state.accent;e.target.removeAttribute("aria-invalid");update()}});
  document.querySelectorAll("[data-tab]").forEach(b=>{b.addEventListener("click",()=>setTab(b.dataset.tab));b.addEventListener("keydown",e=>{if(!["ArrowLeft","ArrowRight","Home","End"].includes(e.key))return;e.preventDefault();const tabs=[...document.querySelectorAll("[data-tab]")];let i=tabs.indexOf(b);i=e.key==="Home"?0:e.key==="End"?2:(i+(e.key==="ArrowRight"?1:-1)+3)%3;setTab(tabs[i].dataset.tab,true)})});
  for(const p of ["origin","destination"])$(p+"Preset").addEventListener("change",e=>{const code=e.target.value;if(code==="custom"){$(p+"Code").focus();return}const [c,a]=airports[code];state[p+"Code"]=code;state[p+"City"]=c;state[p+"Airport"]=a;syncForm()});
  $("swapBtn").addEventListener("click",()=>{for(const k of ["Code","City","Airport"])[state["origin"+k],state["destination"+k]]=[state["destination"+k],state["origin"+k]];syncForm();feedback("已交換出發與抵達機場，日期與時間維持原設定。")});
  document.querySelectorAll("[data-theme]").forEach(b=>b.addEventListener("click",()=>{state.theme=b.dataset.theme;state.accent={classic:"#24283f",sunset:"#4e2e43",thermal:"#f8deef"}[state.theme];syncForm()}));
  $("exportBtn").addEventListener("click",exportTicket);$("quickExportBtn").addEventListener("click",()=>{$("exportFormat").scrollIntoView({behavior:"smooth",block:"center"});$("exportFormat").focus()});
  $("saveBtn").addEventListener("click",saveDesign);$("loadBtn").addEventListener("click",()=>$("loadFile").click());$("loadFile").addEventListener("change",e=>loadDesign(e.target.files[0]));
  $("helpBtn").addEventListener("click",()=>$("helpDialog").showModal());$("zoomBtn").addEventListener("click",()=>{$("zoomTicket").innerHTML=ticketSVG();$("zoomDialog").showModal()});$("resetBtn").addEventListener("click",()=>$("resetDialog").showModal());
  $("confirmReset").addEventListener("click",async()=>{state={...defaults};syncForm();await chooseBackground(state.backgroundId).catch(()=>{});document.querySelectorAll("[aria-invalid]").forEach(e=>e.removeAttribute("aria-invalid"));$("resetDialog").close();setTab("route");feedback("已還原棕櫚落日預設設計，紀念票標示為關閉。")});
  ["galleryBtn","designGalleryBtn"].forEach(id=>$(id).addEventListener("click",openGallery));$("uploadBackgroundBtn").addEventListener("click",()=>$("backgroundFile").click());$("backgroundFile").addEventListener("change",e=>uploadBackground(e.target.files[0]));
  $("galleryGrid").addEventListener("click",e=>{const b=e.target.closest("[data-background]");if(b)chooseBackground(b.dataset.background,{close:true,resetCrop:true}).catch(()=>{})});
  ["gallerySearch","galleryCategory"].forEach(id=>$(id).addEventListener("input",()=>{galleryPage=1;renderGallery()}));
  $("galleryPrev").addEventListener("click",()=>{galleryPage--;renderGallery();$("galleryGrid").scrollIntoView({block:"start"})});$("galleryNext").addEventListener("click",()=>{galleryPage++;renderGallery();$("galleryGrid").scrollIntoView({block:"start"})});
  document.querySelectorAll(".close-dialog").forEach(b=>b.addEventListener("click",()=>b.closest("dialog").close()));document.querySelectorAll("dialog").forEach(d=>d.addEventListener("click",e=>{const r=d.getBoundingClientRect();if(e.target===d&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))d.close()}));
  syncForm();
  try{const response=await fetch("./gallery.json");if(!response.ok)throw new Error("gallery");gallery=await response.json();for(const cat of [...new Set(gallery.map(i=>i.category))]){$("galleryCategory").add(new Option(categories[cat]||cat,cat))}}catch{feedback("官方截圖圖庫暫時無法載入，仍可使用預設背景或上傳自己的圖片。",true)}
  try{const font=await fetch("./assets/fonts/caveat-latin.ttf");if(font.ok){const blob=await font.blob();scriptFont=await new Promise(resolve=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.readAsDataURL(blob)})}}catch{}
  await chooseBackground(state.backgroundId).catch(()=>{});
});
