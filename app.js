"use strict";
const $ = id => document.getElementById(id);
const defaults = {
  passenger:"JASON / MICHAEL",cabin:"business",seat:"06A",
  originCode:"LSX",originCity:"洛聖都",originAirport:"洛聖都國際機場",
  destinationCode:"VCI",destinationCity:"罪惡城",destinationAirport:"罪惡城國際機場",
  flight:"FU 061",aircraft:"BOEING 787-9",departureDate:"2026-11-19",boardingTime:"09:20",departureTime:"10:00",arrivalDate:"2026-11-19",arrivalTime:"18:30",
  terminal:"T2",gate:"B12",zone:"01",booking:"VC6LSX",sequence:"0019",ticketNumber:"061-2026111906",baggage:"2 PC / 32 KG",status:"PRIORITY",
  airline:"flyUS",tagline:"LIVE A LITTLE. FLY WITH US.",message:"下一站，罪惡城。THE GOODLIFE AWAITS.",
  language:"bilingual",accent:"#213b51",showStub:true,showBarcode:true,showMessage:true,theme:"classic"
};
let state = {...defaults};
const airports = {
  LSX:["洛聖都","洛聖都國際機場","LOS SANTOS"],
  VCI:["罪惡城","罪惡城國際機場","VICE CITY"],
  TPE:["臺北","臺灣桃園國際機場","TAIPEI"],
  HKG:["香港","香港國際機場","HONG KONG"],
  NRT:["東京","成田國際機場","TOKYO"],
  LAX:["洛杉磯","洛杉磯國際機場","LOS ANGELES"]
};
const cabins={economy:["經濟艙","ECONOMY"],premium:["豪華經濟艙","PREMIUM ECONOMY"],business:["商務艙","BUSINESS CLASS"],first:["頭等艙","FIRST CLASS"]};
const labels = {
  boarding:["登機證","BOARDING PASS"],passenger:["旅客姓名","PASSENGER NAME"],from:["出發地","FROM"],to:["目的地","TO"],flight:["航班","FLIGHT"],date:["日期","DATE"],boardingTime:["登機時間","BOARDING"],departure:["起飛時間","DEPARTURE"],arrival:["抵達時間","ARRIVAL"],terminal:["航廈","TERMINAL"],gate:["登機門","GATE"],seat:["座位","SEAT"],zone:["登機區","ZONE"],booking:["訂位代號","BOOKING REF."],baggage:["託運行李","BAGGAGE"],ticket:["電子機票","E-TICKET"],sequence:["序號","SEQ."],notice:["紀念票・非有效乘機憑證","SOUVENIR · NOT VALID FOR TRAVEL"]
};
const esc = str => String(str??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[c]));
const label = key => {const [zh,en]=labels[key];return state.language==="zh"?zh:state.language==="en"?en:`${zh} ${en}`};
const color = () => /^#[\da-f]{6}$/i.test(state.accent)?state.accent:defaults.accent;
function safeValue(v,fallback="—"){return String(v||fallback)}
function formatDate(value,compact=false){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(value||""))return "—";
  const [y,m,d]=value.split("-");
  if(state.language==="zh")return compact?`${m}月${d}日`:`${y}年${m}月${d}日`;
  const months=["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  return `${d} ${months[+m-1]||"—"}${compact?"":` ${y}`}`;
}
function cityName(prefix){
  const code=state[prefix+"Code"].toUpperCase(), known=airports[code];
  return state.language==="en"&&known&&state[prefix+"City"]===known[0]?known[2]:state[prefix+"City"];
}
function ticketSVG(){
  const W=1200,H=480,mainW=state.showStub?870:1200;
  const thermal=state.theme==="thermal",sunset=state.theme==="sunset";
  const ink=thermal?"#242823":"#24333e",muted=thermal?"#555b52":"#5d6a70",accent=color(),paper=sunset?"#fff8f1":thermal?"#fffef8":"#fffefa";
  const pale=thermal?"#eeeee5":sunset?"#f4e2d9":"#eaf0f2";
  const normalFont=thermal?"'Courier New','Noto Sans TC','Microsoft JhengHei',monospace":"'Noto Sans TC','Microsoft JhengHei','PingFang TC',sans-serif";
  const text=(x,y,value,size=20,weight=500,fill=ink,other="")=>`<text x="${x}" y="${y}" fill="${fill}" font-family="${normalFont}" font-size="${size}" font-weight="${weight}" ${other}>${esc(value)}</text>`;
  const fit=(x,y,value,width,size=20,weight=500,fill=ink,other="")=>{
    const s=String(value||"—"),estimate=[...s].reduce((n,c)=>n+(/[^\x00-\xff]/.test(c)?1:.59),0)*size;
    return text(x,y,s,size,weight,fill,`${other} ${estimate>width?`textLength="${width}" lengthAdjust="spacingAndGlyphs"`:""}`);
  };
  const field=(x,y,key,value,width=170,size=23)=>fit(x,y,label(key),width,15,400,muted)+fit(x,y+30,safeValue(value),width,size,600);
  const line=(x1,y1,x2,y2,stroke="#d4dad7",extra="")=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" ${extra}/>`;
  const airportStart=40,airportEnd=state.showStub?488:710;
  const codeSize=state.showStub?82:92;
  const cabin = cabins[state.cabin]||cabins.economy;
  const cabinText=state.language==="zh"?cabin[0]:state.language==="en"?cabin[1]:`${cabin[0]} ${cabin[1]}`;
  // Lucide's plane glyph, used as a standard pictogram rather than a custom airline mark.
  const plane=(x,y,scale=1,fill=accent)=>`<g transform="translate(${x} ${y}) scale(${scale})" stroke="${fill}" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><g transform="rotate(45 12 12)"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></g></g>`;
  let out=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="ticket-title"><title id="ticket-title">${esc(state.passenger)}，${esc(state.originCode)} 飛往 ${esc(state.destinationCode)}，紀念登機證，非有效乘機憑證</title><defs><clipPath id="ticketClip"><rect width="1200" height="480" rx="8"/></clipPath></defs><g clip-path="url(#ticketClip)"><rect width="${W}" height="${H}" fill="${paper}"/><rect width="${W}" height="70" fill="${accent}"/>`;
  out+=fit(40,46,state.airline,220,37,800,"#fff",`font-style="${thermal?"normal":"italic"}"`);
  out+=fit(260,42,state.tagline,mainW-560,14,500,"#ffffff",`letter-spacing="1"`);
  out+=fit(mainW-38,42,label("boarding"),245,18,600,"#fff",'text-anchor="end" letter-spacing="1"');
  out+=text(airportStart,103,label("from"),15,400,muted);
  out+=text(airportEnd,103,label("to"),15,400,muted);
  out+=fit(mainW-40,103,`${state.aircraft}${state.showStub?"":` · ${label("sequence")} ${safeValue(state.sequence)}`}`,state.showStub?180:390,13,500,muted,'text-anchor="end"');
  out+=fit(airportStart,184,state.originCode.toUpperCase()||"---",250,codeSize,800,accent,'letter-spacing="2"');
  out+=fit(airportEnd,184,state.destinationCode.toUpperCase()||"---",250,codeSize,800,accent,'letter-spacing="2"');
  const planeCenter=state.showStub?375:545;
  out+=line(planeCenter-81,148,planeCenter-30,148,muted)+plane(planeCenter-19,128,1.65,accent)+line(planeCenter+39,148,planeCenter+90,148,muted);
  out+=fit(airportStart,213,cityName("origin"),mainW*.34,22,600)+fit(airportEnd,213,cityName("destination"),mainW*.34,22,600);
  const airportDesc = prefix => {
    if(state.language==="en"&&airports[state[prefix+"Code"].toUpperCase()]&&state[prefix+"Airport"]===airports[state[prefix+"Code"].toUpperCase()][1])return `${cityName(prefix)} INTERNATIONAL AIRPORT`;
    return state[prefix+"Airport"];
  };
  out+=fit(airportStart,239,airportDesc("origin"),mainW*.38,15,400,muted)+fit(airportEnd,239,airportDesc("destination"),mainW*.38,15,400,muted);
  out+=fit(airportStart,267,`${formatDate(state.departureDate)}  ·  ${safeValue(state.departureTime)}`,mainW*.42,17,600);
  out+=fit(airportEnd,267,`${formatDate(state.arrivalDate)}  ·  ${safeValue(state.arrivalTime)}`,mainW*.38,17,600);
  out+=line(40,286,mainW-40,286);
  out+=field(40,311,"passenger",state.passenger,state.showStub?350:460,26);
  out+=field(state.showStub?440:600,311,"flight",state.flight,130,25);
  out+=fit(mainW-40,311,cabinText,230,16,600,accent,'text-anchor="end"');
  const priority=state.language==="zh"?({PRIORITY:"優先登機",STANDARD:"一般登機","LOUNGE ACCESS":"貴賓室禮遇"}[state.status]||state.status):state.status;
  out+=text(mainW-40,341,priority,16,500,muted,'text-anchor="end" letter-spacing="1"');
  out+=`<rect x="24" y="359" width="${mainW-48}" height="68" rx="3" fill="${pale}"/>`;
  const coords=state.showStub?[40,225,405,542,675]:[40,300,550,775,975];
  out+=field(coords[0],380,"boardingTime",state.boardingTime,150,27);
  out+=field(coords[1],380,"terminal",state.terminal,130,27);
  out+=field(coords[2],380,"gate",state.gate,110,27);
  out+=field(coords[3],380,"seat",state.seat,110,27);
  out+=field(coords[4],380,"zone",state.zone,100,27);
  out+=fit(40,450,`${label("booking")} ${safeValue(state.booking)}  ·  ${label("baggage")} ${state.baggage}`,state.showStub?470:405,13,400,muted);
  out+=fit(mainW-40,450,`${label("ticket")} ${safeValue(state.ticketNumber)}`,state.showStub?290:380,12,400,muted,'text-anchor="end"');
  const footY=470;
  if(state.showMessage)out+=fit(40,footY,state.message,mainW*.56,12,400,muted);
  out+=fit(mainW-40,footY,label("notice"),state.showMessage?mainW*.38:mainW-80,12,600,accent,'text-anchor="end"');
  if(state.showStub){
    out+=line(870,0,870,480,"#c6cdc9",'stroke-dasharray="6 7" stroke-width="1.5"');
    out+=`<circle cx="870" cy="0" r="11" fill="#e9ece9"/><circle cx="870" cy="480" r="11" fill="#e9ece9"/>`;
    out+=fit(900,43,label("boarding"),270,18,600,"#fff");
    out+=text(902,112,state.originCode.toUpperCase()||"---",38,800,accent)+text(1157,112,state.destinationCode.toUpperCase()||"---",38,800,accent,'text-anchor="end"')+plane(1015,86,1.3);
    out+=line(900,132,1170,132);
    out+=text(902,158,label("passenger"),14,400,muted)+fit(902,187,state.passenger,264,23,600);
    out+=field(902,217,"flight",state.flight,110,22)+field(1050,217,"date",formatDate(state.departureDate,true),120,20);
    out+=field(902,281,"gate",state.gate,80,29)+field(1008,281,"seat",state.seat,80,29)+field(1112,281,"zone",state.zone,62,29);
    out+=fit(902,342,`${label("boardingTime")} ${safeValue(state.boardingTime)}  ·  ${state.terminal}`,268,15,500,muted);
    if(state.showBarcode){
      // Intentionally non-standard decorative bars: not an airline BCBP payload or a scannable ticket.
      const seed=Array.from(`${state.booking}|${state.passenger}`).reduce((a,c)=>a+c.charCodeAt(0),0);
      let x=902;
      for(let i=0;i<95&&x<1164;i++){
        const width=1+((seed+i*13)%3);const gap=1+((seed+i*7)%2);
        const height= i%11===0?34:29;
        out+=`<rect x="${x}" y="363" width="${width}" height="${height}" fill="${ink}"/>`;x+=width+gap;
      }
      out+=fit(1035,416,`SOUVENIR / ${state.originCode}-${state.destinationCode} / ${state.sequence}`,266,12,500,muted,'text-anchor="middle"');
    }else{
      out+=fit(902,388,`${label("ticket")} ${safeValue(state.ticketNumber)}`,265,14,400,muted);
      out+=fit(902,416,`${label("sequence")} ${safeValue(state.sequence)}`,265,14,400,muted);
    }
    out+=fit(1035,446,cabinText,270,16,600,accent,'text-anchor="middle"');
    out+=fit(1035,470,label("notice"),278,12,600,accent,'text-anchor="middle"');
  }else{
    if(state.showBarcode){
      let x=480;
      for(let i=0;i<64;i++){const w=1+(i*7%3);out+=`<rect x="${x}" y="435" width="${w}" height="18" fill="${ink}" opacity=".85"/>`;x+=w+2;}
    }
  }
  // Small print remains part of every export, regardless of user-entered text.
  out+=`</g></svg>`;
  return out;
}
function feedback(message,error=false){$("feedback").textContent=message;$("feedback").classList.toggle("error",error)}
function syncPresets(){
  for(const prefix of ["origin","destination"]){
    const select=$(prefix+"Preset"),a=airports[state[prefix+"Code"].toUpperCase()];
    const available=[...select.options].some(o=>o.value===state[prefix+"Code"].toUpperCase());
    select.value=a&&available&&a[0]===state[prefix+"City"]&&a[1]===state[prefix+"Airport"]?state[prefix+"Code"].toUpperCase():"custom";
  }
}
function syncForm(){
  for(const [key,value] of Object.entries(state)){const el=$(key);if(el&&el.name){if(el.type==="checkbox")el.checked=value;else el.value=value}}
  syncPresets();update();
}
function update(){
  const svg=ticketSVG();$("ticketHolder").innerHTML=svg;
  $("ticketHolder").setAttribute("aria-label",`${state.passenger}，${state.originCity}飛往${state.destinationCity}，${state.flight}，${state.seat}，紀念登機證，非有效乘機憑證`);
  if($("zoomDialog").open)$("zoomTicket").innerHTML=svg;
  const cap = prefix => {const a=airports[state[prefix+"Code"].toUpperCase()];return a&&a[0]===state[prefix+"City"]?a[2]:state[prefix+"City"]};
  const from=cap("origin"),to=cap("destination");
  $("routeCaption").textContent=`${from} → ${to}`;
  $("colorValue").textContent=color().toUpperCase();
  document.querySelectorAll("[data-theme]").forEach(b=>{const active=b.dataset.theme===state.theme;b.classList.toggle("selected",active);b.setAttribute("aria-pressed",String(active))});
}
function setTab(name,focus=false){
  document.querySelectorAll("[data-tab]").forEach(b=>{const active=b.dataset.tab===name;b.setAttribute("aria-selected",String(active));b.tabIndex=active?0:-1;$(b.getAttribute("aria-controls")).hidden=!active;if(focus&&active)b.focus()});
}
function validate(){
  const invalid=[];
  for(const el of $("ticketForm").elements){
    if(!el.name||el.type==="checkbox"||el.type==="color")continue;
    const bad=!el.checkValidity()||(el.required&&!el.value.trim());
    el.setAttribute("aria-invalid",String(bad));if(bad)invalid.push(el);
  }
  if(invalid.length){
    const el=invalid[0],panel=el.closest(".tab-panel");setTab(panel.id.replace("panel-",""));el.focus();
    feedback(el.id.includes("Code")?"機場代碼請填入 3 個英文字母。":"請先補齊標示欄位，並確認日期與時間格式。",true);return false;
  }
  return true;
}
function downloadBlob(blob,name){
  const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
}
function filename(ext){
  const name=state.passenger.replace(/[^\p{L}\p{N}_-]/gu,"_").replace(/_+/g,"_").slice(0,28)||"passenger";
  return `DEPARTURE_${state.originCode}_${state.destinationCode}_${name}.${ext}`;
}
async function rasterize(){
  await document.fonts.ready;
  const image=new Image();image.crossOrigin="anonymous";
  const svg=ticketSVG().replace('role="img"','');
  // A data URL is self-contained and keeps the procedural canvas origin-clean in embedded previews.
  image.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg);
  await image.decode();
  const canvas=document.createElement("canvas");canvas.width=3600;canvas.height=1440;
  const ctx=canvas.getContext("2d");ctx.drawImage(image,0,0,3600,1440);return canvas;
}
async function exportTicket(){
  if(!validate())return;
  const button=$("exportBtn"),quick=$("quickExportBtn"),labelEl=button.querySelector("span");button.disabled=true;quick.disabled=true;labelEl.textContent="正在準備…";feedback("正在產生高清票面，請稍候。");
  try{
    const format=$("exportFormat").value,canvas=await rasterize();
    if(format==="pdf"){
      if(!window.jspdf)throw new Error("PDF 模組載入失敗");
      const doc=new window.jspdf.jsPDF({orientation:"landscape",unit:"mm",format:[240,96],compress:true});
      doc.setProperties({title:`${state.originCode} to ${state.destinationCode} - Souvenir Boarding Pass`,subject:"SOUVENIR - NOT VALID FOR TRAVEL",creator:"DEPARTURE. Boarding Pass Studio"});
      doc.addImage(canvas.toDataURL("image/png"),"PNG",0,0,240,96);
      downloadBlob(doc.output("blob"),filename("pdf"));feedback("PDF 已產生並開始下載。票面尺寸為 240 × 96 毫米，內含高清影像。");
    }else{
      const blob=await new Promise((resolve,reject)=>canvas.toBlob(v=>v?resolve(v):reject(new Error("無法輸出圖片")),"image/png"));
      downloadBlob(blob,filename("png"));feedback("PNG 已產生並開始下載。解析度為 3600 × 1440 像素，適合收藏或列印。");
    }
  }catch(error){console.error(error);feedback("匯出未完成。請重新整理後再試；若使用 PDF，亦可先改用 PNG 格式。",true)}
  finally{button.disabled=false;quick.disabled=false;labelEl.textContent="下載登機證"}
}
function saveDesign(){downloadBlob(new Blob([JSON.stringify({app:"departure-studio",version:1,design:state},null,2)],{type:"application/json"}),filename("json"));feedback("設計檔已開始下載。下次點選資料夾圖示，載入 JSON 即可繼續編輯。")}
async function loadDesign(file){
  if(!file)return;
  try{
    if(file.size>100000)throw new Error("size");
    const data=JSON.parse(await file.text());
    if(data.app!=="departure-studio"||data.version!==1||!data.design||typeof data.design!=="object"||Array.isArray(data.design))throw new Error("format");
    const next={...defaults};
    for(const key of Object.keys(defaults)){
      const value=data.design[key],el=$(key);
      if(value===undefined)continue;
      if(typeof value!==typeof defaults[key])throw new Error("value");
      if(typeof value==="string"){
        if(value.length>200)throw new Error("long");
        if(el?.maxLength>0&&value.length>el.maxLength)throw new Error("long");
        if(el?.tagName==="SELECT"&&![...el.options].some(o=>o.value===value))throw new Error("option");
      }
      next[key]=value;
    }
    if(!["classic","sunset","thermal"].includes(next.theme)||!/^#[\da-f]{6}$/i.test(next.accent))throw new Error("theme");
    for(const k of ["departureDate","arrivalDate"])if(!/^\d{4}-\d{2}-\d{2}$/.test(next[k])||new Date(next[k]+"T12:00:00").toISOString().slice(0,10)!==next[k])throw new Error("date");
    for(const k of ["boardingTime","departureTime","arrivalTime"])if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(next[k]))throw new Error("time");
    state=next;syncForm();feedback("設計檔已載入，票面與所有自訂欄位已同步更新。");
  }catch{feedback("無法讀取設計檔。請選擇由這個設計室匯出的有效 JSON 檔案（100 KB 以內）。",true)}
  finally{$("loadFile").value=""}
}
document.addEventListener("DOMContentLoaded",()=>{
  lucide.createIcons();
  $("ticketForm").addEventListener("submit",e=>e.preventDefault());
  $("ticketForm").addEventListener("input",e=>{
    const el=e.target;if(!el.name||!(el.name in defaults))return;
    state[el.name]=el.type==="checkbox"?el.checked:el.value;
    if(["originCode","destinationCode","flight","seat","booking"].includes(el.name)){state[el.name]=el.value.toUpperCase();el.value=state[el.name]}
    el.removeAttribute("aria-invalid");syncPresets();update();
    if($("feedback").classList.contains("error"))feedback("");
  });
  document.querySelectorAll("[data-tab]").forEach(b=>{
    b.addEventListener("click",()=>setTab(b.dataset.tab));
    b.addEventListener("keydown",e=>{
      const keys=["ArrowLeft","ArrowRight","Home","End"];if(!keys.includes(e.key))return;e.preventDefault();
      const tabs=[...document.querySelectorAll("[data-tab]")];let i=tabs.indexOf(b);
      i=e.key==="Home"?0:e.key==="End"?2:(i+(e.key==="ArrowRight"?1:-1)+3)%3;setTab(tabs[i].dataset.tab,true);
    });
  });
  for(const prefix of ["origin","destination"]){
    $(prefix+"Preset").addEventListener("change",e=>{
      const code=e.target.value;if(code==="custom"){$(prefix+"Code").focus();return}
      const [city,airport]=airports[code];state[prefix+"Code"]=code;state[prefix+"City"]=city;state[prefix+"Airport"]=airport;syncForm();
    });
  }
  $("swapBtn").addEventListener("click",()=>{for(const key of ["Code","City","Airport"])[state["origin"+key],state["destination"+key]]=[state["destination"+key],state["origin"+key]];syncForm();feedback("已交換出發與抵達機場；航班日期與時間維持原設定。")});
  document.querySelectorAll("[data-theme]").forEach(b=>b.addEventListener("click",()=>{
    state.theme=b.dataset.theme;state.accent={classic:"#213b51",sunset:"#864256",thermal:"#30342f"}[state.theme];syncForm();
  }));
  $("exportBtn").addEventListener("click",exportTicket);
  $("quickExportBtn").addEventListener("click",()=>{$("exportFormat").scrollIntoView({behavior:"smooth",block:"center"});$("exportFormat").focus()});
  $("saveBtn").addEventListener("click",saveDesign);
  $("loadBtn").addEventListener("click",()=>$("loadFile").click());
  $("loadFile").addEventListener("change",e=>loadDesign(e.target.files[0]));
  $("helpBtn").addEventListener("click",()=>$("helpDialog").showModal());
  $("zoomBtn").addEventListener("click",()=>{$("zoomTicket").innerHTML=ticketSVG();$("zoomDialog").showModal()});
  $("resetBtn").addEventListener("click",()=>$("resetDialog").showModal());
  $("confirmReset").addEventListener("click",()=>{state={...defaults};syncForm();document.querySelectorAll("[aria-invalid]").forEach(e=>e.removeAttribute("aria-invalid"));$("resetDialog").close();setTab("route");feedback("已還原預設設計。新的旅程，隨時可以開始。")});
  document.querySelectorAll(".close-dialog").forEach(b=>b.addEventListener("click",()=>b.closest("dialog").close()));
  document.querySelectorAll("dialog").forEach(d=>d.addEventListener("click",e=>{const r=d.getBoundingClientRect();if(e.target===d&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))d.close()}));
  syncForm();
});
