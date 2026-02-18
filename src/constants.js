// ══ Themes ══
export const LT={primary:"#003087",primaryLight:"#6CACE4",primaryDark:"#001A4E",accent:"#0072CE",bg:"#F5F7FA",surface:"#FFFFFF",surfaceAlt:"#EBF0F7",border:"#D0D9E4",text:"#1A1A2E",textSec:"#4A5568",textMuted:"#8896A6",success:"#2D8A4E",successBg:"#E6F5EC",warning:"#C67A1A",warningBg:"#FFF3E0",danger:"#C53030",dangerBg:"#FEE2E2",focus:"#0072CE",purple:"#7C3AED",purpleBg:"#EDE9FE"};
export const DK={primary:"#6CACE4",primaryLight:"#003087",primaryDark:"#0A1628",accent:"#4DB8FF",bg:"#0F1A2E",surface:"#162038",surfaceAlt:"#1C2A48",border:"#2A3A5C",text:"#E8ECF2",textSec:"#A0B0C8",textMuted:"#6880A0",success:"#4ADE80",successBg:"#0D2818",warning:"#FBB040",warningBg:"#2A1A00",danger:"#F87171",dangerBg:"#2A0808",focus:"#4DB8FF",purple:"#A78BFA",purpleBg:"#1E1040"};
export const getTheme=(dark)=>dark?DK:LT;

// ══ Core constants ══
export const HRS_WEEK=37.5;
export const autoHours=(avail,weeks=2)=>Math.round(avail/100*HRS_WEEK*weeks*10)/10;

export const TRACKS=[
  {id:"rpa",label:"RPA",color:"#0072CE",icon:"⚙️"},
  {id:"integration",label:"Integrasjon",color:"#6CACE4",icon:"🔗"},
  {id:"sysdev",label:"Systemutvikling",color:"#003087",icon:"💻"},
  {id:"lowcode",label:"No code / Low code",color:"#2D8A4E",icon:"🧩"},
  {id:"cots",label:"Kjøp av hyllevare",color:"#C67A1A",icon:"📦"},
];
export const STATUSES=[
  {id:"submitted",label:"Innmeldt",color:"#8896A6",bg:"#F0F0F0"},
  {id:"under-review",label:"Under vurdering",color:"#7C3AED",bg:"#EDE9FE"},
  {id:"assessed",label:"Vurdert",color:"#0891B2",bg:"#E0F7FA"},
  {id:"ready",label:"Klar for sprint",color:"#2D8A4E",bg:"#E6F5EC"},
  {id:"in-progress",label:"Pågår",color:"#0072CE",bg:"#E0F0FF"},
  {id:"blocked",label:"Blokkert",color:"#C53030",bg:"#FEE2E2"},
  {id:"done",label:"Ferdig",color:"#6B7280",bg:"#F3F4F6"},
  {id:"rejected",label:"Avvist",color:"#991B1B",bg:"#FEE2E2"},
  {id:"archived",label:"Arkivert",color:"#9CA3AF",bg:"#F3F4F6"},
];
// Statusoverganger — alle overganger er tillatt
export const STATUS_TRANSITIONS={};
export const validTransition=()=>true;
export const stMap=Object.fromEntries(STATUSES.map(s=>[s.id,s]));
export const SKILLS_LIST=["Backend","Frontend","Fullstack","UX","QA","DevOps","RPA","Data","Arkitektur"];
export const FIBONACCI=[{v:1,l:"1 – Triviell (timer)"},{v:2,l:"2 – Enkel (halv dag)"},{v:3,l:"3 – Overkommelig (1 dag)"},{v:5,l:"5 – Middels (2–3 dager)"},{v:8,l:"8 – Kompleks (1 uke)"},{v:13,l:"13 – Svært kompleks (2 uker)"},{v:21,l:"21 – Episk (full sprint+)"}];
export const PRIORITIES=[{id:"low",label:"Lav",color:"#8896A6"},{id:"medium",label:"Medium",color:"#C67A1A"},{id:"high",label:"Høy",color:"#C53030"},{id:"critical",label:"Kritisk",color:"#991B1B"}];

export const ATTACH_ACCEPT=".png,.jpg,.jpeg,.gif,.docx,.xls,.xlsx,.pptx";
export const ATTACH_MAX_BYTES=5*1024*1024;

// ══ Scoring dimensions ══
export const WSJF_DIMS=[{key:"value",label:"Forretningsverdi"},{key:"urgency",label:"Hastegrad"},{key:"risk",label:"Risiko ved utsettelse"},{key:"feasibility",label:"Gjennomførbarhet"},{key:"deps",label:"Avhengigheter"},{key:"effort",label:"Innsats (inv.)"}];
export const COD_DIMS=[{key:"cod_business",label:"Forr.verdi (CoD)"},{key:"cod_time",label:"Tidskritikalitet"},{key:"cod_opportunity",label:"Mulighetskost."},{key:"cod_downstream",label:"Nedstrøms blokk."}];
export const RPA_DIMS=[{key:"rpa_volume",label:"Trans.volum"},{key:"rpa_rule",label:"Regelbaserthet"},{key:"rpa_digital",label:"Dig.grad"},{key:"rpa_stability",label:"Prosess-stab."},{key:"rpa_roi",label:"Est. ROI"}];
export const RICE_DIMS=[{key:"rice_reach",label:"Reach"},{key:"rice_impact",label:"Impact"},{key:"rice_confidence",label:"Confidence"},{key:"rice_effort",label:"Effort (inv.)"}];
export const ICE_DIMS=[{key:"ice_impact",label:"Impact"},{key:"ice_confidence",label:"Confidence"},{key:"ice_ease",label:"Ease"}];
export const COTS_DIMS=[{key:"cots_fit",label:"Funksjonell dekn."},{key:"cots_tco",label:"TCO (inv.)"},{key:"cots_vendor",label:"Leverandørsol."},{key:"cots_integration",label:"Integrasjonsevne"},{key:"cots_security",label:"Sikkerhet/personv."}];

// ══ Scoring functions ══
export const calcWsjf=t=>((t.value||3)+(t.urgency||3)+(t.risk||3))*(t.feasibility||3)*(t.deps||3)*(t.effort||3);
export const calcCod=t=>((t.cod_business||3)+(t.cod_time||3)+(t.cod_opportunity||3)+(t.cod_downstream||3));
export const calcRpa=t=>((t.rpa_volume||3)+(t.rpa_rule||3)+(t.rpa_digital||3)+(t.rpa_stability||3))*(t.rpa_roi||3);
export const calcRice=t=>Math.round(((t.rice_reach||3)*(t.rice_impact||3)*(t.rice_confidence||3))/Math.max(6-(t.rice_effort||3),1));
export const calcIce=t=>(t.ice_impact||3)*(t.ice_confidence||3)*(t.ice_ease||3);
export const calcCots=t=>((t.cots_fit||3)*(t.cots_tco||3)+(t.cots_vendor||3)+(t.cots_integration||3)+(t.cots_security||3));

// Factory: composite scorer med konfigurerbare vekter (fikser A1-bug)
export const makeComposite=(config)=>(t)=>{
  const w=calcWsjf(t);const tr=t.tracks||[];let x=0;
  if(tr.includes("integration"))x+=calcCod(t);
  if(tr.includes("rpa"))x+=calcRpa(t);
  if(tr.includes("sysdev"))x+=calcRice(t);
  if(tr.includes("lowcode"))x+=calcIce(t);
  if(tr.includes("cots"))x+=calcCots(t);
  if(x===0)return w;
  const wPct=(config?.scoringWeights?.wsjf||60)/100;
  const tPct=(config?.scoringWeights?.trackSpecific||40)/100;
  return Math.round(w*wPct+x*tPct);
};

// ══ Utilities ══
export const ts=()=>new Date().toISOString().replace("T"," ").slice(0,16);
export const td=()=>new Date().toISOString().split("T")[0];
export const fmtSize=b=>b<1024?b+" B":b<1048576?(b/1024).toFixed(1)+" KB":(b/1048576).toFixed(1)+" MB";

export function findDupes(title,tasks){
  if(!title||title.length<5)return[];
  const w=title.toLowerCase().split(/\s+/).filter(x=>x.length>3);
  // A6: sjekk tittel + beskrivelse, bruk word-match + substring
  return tasks.filter(t=>{
    const tw=(t.title+" "+(t.desc||"")).toLowerCase();
    const hits=w.filter(x=>tw.includes(x)).length;
    return hits>=2;
  }).slice(0,5);
}

// ══ Lead/Cycle time (D4) ══
export const calcLeadTime=(task)=>{
  const h=task.history||[];
  const created=h.find(x=>x.what==="Opprettet");
  const done=h.find(x=>x.what?.includes("status")&&x.what?.includes("done"));
  if(!created||!done)return null;
  const d1=new Date(created.time),d2=new Date(done.time);
  return isNaN(d1)||isNaN(d2)?null:Math.round((d2-d1)/(1000*60*60*24));
};
export const calcCycleTime=(task)=>{
  const h=task.history||[];
  const start=h.find(x=>x.what?.includes("status")&&x.what?.includes("in-progress"));
  const done=h.find(x=>x.what?.includes("status")&&x.what?.includes("done"));
  if(!start||!done)return null;
  const d1=new Date(start.time),d2=new Date(done.time);
  return isNaN(d1)||isNaN(d2)?null:Math.round((d2-d1)/(1000*60*60*24));
};

// ══ CSV export (D2) ══
export const exportCsv=(headers,rows,filename="export.csv")=>{
  const esc=v=>{const s=String(v??"");return s.includes(",")||s.includes('"')||s.includes("\n")?`"${s.replace(/"/g,'""')}"`:s;};
  const csv=[headers.join(","),...rows.map(r=>r.map(esc).join(","))].join("\n");
  const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=filename;a.click();URL.revokeObjectURL(a.href);
};

// ══ Tooltips ══
export const TIP={
  WSJF:"Weighted Shortest Job First – prioriteringsmodell som vekter forretningsverdi, hastegrad og risiko mot innsats. Høyere = høyere prioritet.",
  CoD:"Cost of Delay – kostnaden ved å utsette. Vurderer forretningsverdi, tidskritikalitet, mulighetskostnad og nedstrømsblokkeringer.",
  RPA:"Robotic Process Automation Pipeline – vurderer automatiseringspotensial: volum, regelbaserthet, digitaliseringsgrad, stabilitet og ROI.",
  RICE:"Reach · Impact · Confidence / Effort – prioriteringsmodell for systemutvikling.",
  ICE:"Impact · Confidence · Ease – forenklet prioritering for low-code/no-code.",
  TCO:"Total Cost of Ownership / Fit-Gap – vurderer hyllevare: dekning, kostnad, leverandør, integrasjon, sikkerhet.",
  Score:"Sammensatt score: WSJF + løypespesifikk vurdering (CoD/RICE/ICE/RPA/TCO), basert på konfigurerbare vekter.",
  V:"Verdi – forventet forretningsverdi (1–5). Inngår i WSJF.",
  H:"Hastegrad – tidskritikalitet (1–5). Inngår i WSJF.",
  Gf:"Gjennomførbarhet – teknisk/organisatorisk realisme (1–5). Inngår i WSJF.",
  SP:"Story Points – relativ kompleksitet (Fibonacci: 1–21). Brukes til sprintplanlegging.",
  Velocity:"Velocity – teamets leveransehastighet målt i story points per sprint. Brukes til å planlegge fremtidig kapasitet og forutsi leveransetakt.",
  DPIA:"Data Protection Impact Assessment – personvernkonsekvensvurdering, påkrevd ved behandling av persondata (GDPR art. 35).",
  EQS:"Elektronisk kvalitetssystem – Hemits system for rutiner, prosedyrer og arbeidsbeskrivelser.",
};

// ══ Reusable style objects (E2) ══
export const S={
  input:(C)=>({padding:"8px 11px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:13,color:C.text,background:C.surface,outline:"none",width:"100%",boxSizing:"border-box",fontFamily:"inherit"}),
  label:(C)=>({fontSize:11,fontWeight:600,color:C.textSec}),
  card:(C)=>({background:C.surface,borderRadius:12,border:`1px solid ${C.border}`,padding:18}),
  sectionHeader:(C)=>({fontSize:13,fontWeight:700,color:C.primary,margin:"0 0 10px",borderBottom:`2px solid ${C.primaryLight}`,paddingBottom:5}),
  modalBackdrop:()=>({position:"fixed",inset:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.45)",padding:10}),
  badge:(color)=>({display:"inline-flex",alignItems:"center",gap:4,padding:"2px 10px",borderRadius:20,fontSize:11,fontWeight:600,color,whiteSpace:"nowrap"}),
  tableCell:()=>({padding:"6px 3px"}),
  miniSelect:(C)=>({fontSize:9,padding:"2px 4px",borderRadius:4,border:`1px solid ${C.border}`,background:C.surface,color:C.text}),
};
