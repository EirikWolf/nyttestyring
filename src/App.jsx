import React, { useState, useMemo } from "react";

const LT={primary:"#003087",primaryLight:"#6CACE4",primaryDark:"#001A4E",accent:"#0072CE",bg:"#F5F7FA",surface:"#FFFFFF",surfaceAlt:"#EBF0F7",border:"#D0D9E4",text:"#1A1A2E",textSec:"#4A5568",textMuted:"#8896A6",success:"#2D8A4E",successBg:"#E6F5EC",warning:"#C67A1A",warningBg:"#FFF3E0",danger:"#C53030",dangerBg:"#FEE2E2",focus:"#0072CE",purple:"#7C3AED",purpleBg:"#EDE9FE"};
const DK={primary:"#6CACE4",primaryLight:"#003087",primaryDark:"#0A1628",accent:"#4DB8FF",bg:"#0F1A2E",surface:"#162038",surfaceAlt:"#1C2A48",border:"#2A3A5C",text:"#E8ECF2",textSec:"#A0B0C8",textMuted:"#6880A0",success:"#4ADE80",successBg:"#0D2818",warning:"#FBB040",warningBg:"#2A1A00",danger:"#F87171",dangerBg:"#2A0808",focus:"#4DB8FF",purple:"#A78BFA",purpleBg:"#1E1040"};
const HRS_WEEK=37.5;
const autoHours=(avail,weeks=2)=>Math.round(avail/100*HRS_WEEK*weeks*10)/10;
let C=LT;
const TRACKS=[
  {id:"rpa",label:"RPA",color:"#0072CE",icon:"⚙️"},
  {id:"integration",label:"Integrasjon",color:"#6CACE4",icon:"🔗"},
  {id:"sysdev",label:"Systemutvikling",color:"#003087",icon:"💻"},
  {id:"lowcode",label:"No code / Low code",color:"#2D8A4E",icon:"🧩"},
  {id:"cots",label:"Kjøp av hyllevare",color:"#C67A1A",icon:"📦"},
];
const STATUSES=[
  {id:"submitted",label:"Innmeldt",color:"#8896A6",bg:"#F0F0F0"},
  {id:"under-review",label:"Under vurdering",color:"#7C3AED",bg:"#EDE9FE"},
  {id:"assessed",label:"Vurdert",color:"#0891B2",bg:"#E0F7FA"},
  {id:"ready",label:"Klar for sprint",color:"#2D8A4E",bg:"#E6F5EC"},
  {id:"in-progress",label:"Pågår",color:"#0072CE",bg:"#E0F0FF"},
  {id:"blocked",label:"Blokkert",color:"#C53030",bg:"#FEE2E2"},
  {id:"done",label:"Ferdig",color:"#6B7280",bg:"#F3F4F6"},
  {id:"rejected",label:"Avvist",color:"#991B1B",bg:C.dangerBg},
  {id:"archived",label:"Arkivert",color:"#9CA3AF",bg:"#F3F4F6"},
];
const stMap=Object.fromEntries(STATUSES.map(s=>[s.id,s]));
const SKILLS_LIST=["Backend","Frontend","Fullstack","UX","QA","DevOps","RPA","Data","Arkitektur"];
const FIBONACCI=[{v:1,l:"1 – Triviell (timer)"},{v:2,l:"2 – Enkel (halv dag)"},{v:3,l:"3 – Overkommelig (1 dag)"},{v:5,l:"5 – Middels (2–3 dager)"},{v:8,l:"8 – Kompleks (1 uke)"},{v:13,l:"13 – Svært kompleks (2 uker)"},{v:21,l:"21 – Episk (full sprint+)"}];
const PRIORITIES=[{id:"low",label:"Lav",color:"#8896A6"},{id:"medium",label:"Medium",color:C.warning},{id:"high",label:"Høy",color:C.danger},{id:"critical",label:"Kritisk",color:"#991B1B"}];

const WSJF_DIMS=[{key:"value",label:"Forretningsverdi"},{key:"urgency",label:"Hastegrad"},{key:"risk",label:"Risiko ved utsettelse"},{key:"feasibility",label:"Gjennomførbarhet"},{key:"deps",label:"Avhengigheter"},{key:"effort",label:"Innsats (inv.)"}];
const COD_DIMS=[{key:"cod_business",label:"Forr.verdi (CoD)"},{key:"cod_time",label:"Tidskritikalitet"},{key:"cod_opportunity",label:"Mulighetskost."},{key:"cod_downstream",label:"Nedstrøms blokk."}];
const RPA_DIMS=[{key:"rpa_volume",label:"Trans.volum"},{key:"rpa_rule",label:"Regelbaserthet"},{key:"rpa_digital",label:"Dig.grad"},{key:"rpa_stability",label:"Prosess-stab."},{key:"rpa_roi",label:"Est. ROI"}];
const RICE_DIMS=[{key:"rice_reach",label:"Reach"},{key:"rice_impact",label:"Impact"},{key:"rice_confidence",label:"Confidence"},{key:"rice_effort",label:"Effort (inv.)"}];
const ICE_DIMS=[{key:"ice_impact",label:"Impact"},{key:"ice_confidence",label:"Confidence"},{key:"ice_ease",label:"Ease"}];
const COTS_DIMS=[{key:"cots_fit",label:"Funksjonell dekn."},{key:"cots_tco",label:"TCO (inv.)"},{key:"cots_vendor",label:"Leverandørsol."},{key:"cots_integration",label:"Integrasjonsevne"},{key:"cots_security",label:"Sikkerhet/personv."}];

const calcWsjf=t=>((t.value||3)+(t.urgency||3)+(t.risk||3))*(t.feasibility||3)*(t.deps||3)*(t.effort||3);
const calcCod=t=>((t.cod_business||3)+(t.cod_time||3)+(t.cod_opportunity||3)+(t.cod_downstream||3));
const calcRpa=t=>((t.rpa_volume||3)+(t.rpa_rule||3)+(t.rpa_digital||3)+(t.rpa_stability||3))*(t.rpa_roi||3);
const calcRice=t=>Math.round(((t.rice_reach||3)*(t.rice_impact||3)*(t.rice_confidence||3))/Math.max(6-(t.rice_effort||3),1));
const calcIce=t=>(t.ice_impact||3)*(t.ice_confidence||3)*(t.ice_ease||3);
const calcCots=t=>((t.cots_fit||3)*(t.cots_tco||3)+(t.cots_vendor||3)+(t.cots_integration||3)+(t.cots_security||3));
const composite=t=>{const w=calcWsjf(t);const tr=t.tracks||[];let x=0;if(tr.includes("integration"))x+=calcCod(t);if(tr.includes("rpa"))x+=calcRpa(t);if(tr.includes("sysdev"))x+=calcRice(t);if(tr.includes("lowcode"))x+=calcIce(t);if(tr.includes("cots"))x+=calcCots(t);return x>0?Math.round(w+x):w;};
const ts=()=>new Date().toISOString().replace("T"," ").slice(0,16);
const td=()=>new Date().toISOString().split("T")[0];

const INIT_GOALS=[
  {id:"G-01",title:"Øke digitaliseringsgrad til 80%",type:"Hovedmål",parent:null},
  {id:"G-02",title:"Redusere manuelt arbeid med 30%",type:"Delmål",parent:"G-01"},
  {id:"G-03",title:"Forbedre pasientsikkerhet gjennom IKT",type:"Hovedmål",parent:null},
  {id:"G-04",title:"Styrke informasjonssikkerhet",type:"Delmål",parent:"G-03"},
  {id:"G-05",title:"Redusere ventetider gjennom digitalisering",type:"Delmål",parent:"G-03"},
  {id:"G-06",title:"Effektivisere administrative prosesser",type:"Hovedmål",parent:null},
  {id:"G-07",title:"Øke medarbeidertilfredshet med IKT-verktøy",type:"Delmål",parent:"G-06"},
];

const INIT_TASKS=[
  {id:"T-001",title:"Automatisere fakturautsending",desc:"Robotisere manuell fakturaprosess i økonomiavd.",tracks:["rpa"],value:5,urgency:4,risk:3,feasibility:4,deps:5,effort:4,size:8,status:"ready",sprint:true,submitterName:"Kari Haugen",submitterDept:"Økonomiavd.",processOwner:"Økonomisjef Trond Lie",date:"2026-01-20",reviewed:true,priority:"high",goals:["G-02","G-06"],eqsRef:"EQS-2024-0142 Fakturahåndtering",personalData:"no",parentId:null,rpa_volume:5,rpa_rule:5,rpa_digital:4,rpa_stability:4,rpa_roi:5,comments:[{author:"Utviklingsforum",text:"Høy ROI – prioriteres i S-27.",time:"2026-01-22 09:15"}],history:[{who:"System",what:"Opprettet",time:"2026-01-20 08:00"},{who:"Utviklingsforum",what:"Status → Klar for sprint",time:"2026-01-22 09:15"}],attachments:[]},
  {id:"T-001-A",title:"Kartlegge fakturaprosess (AS-IS)",desc:"Dokumentere nåværende manuell flyt.",tracks:["rpa"],value:5,urgency:4,risk:2,feasibility:5,deps:5,effort:5,size:3,status:"done",sprint:true,submitterName:"Kari Haugen",submitterDept:"Økonomiavd.",processOwner:"Økonomisjef Trond Lie",date:"2026-01-21",reviewed:true,priority:"high",goals:["G-02"],parentId:"T-001",personalData:"no",comments:[],history:[],attachments:[]},
  {id:"T-001-B",title:"Utvikle RPA-bot for faktura",desc:"Bygge UiPath-bot for automatisk fakturabehandling.",tracks:["rpa"],value:5,urgency:4,risk:3,feasibility:4,deps:4,effort:3,size:5,status:"in-progress",sprint:true,submitterName:"Kari Haugen",submitterDept:"Økonomiavd.",processOwner:"Økonomisjef Trond Lie",date:"2026-01-22",reviewed:true,priority:"high",goals:["G-02"],parentId:"T-001",personalData:"no",rpa_volume:5,rpa_rule:5,rpa_digital:4,rpa_stability:4,rpa_roi:5,comments:[],history:[],attachments:[]},
  {id:"T-001-C",title:"Test og pilot faktura-bot",desc:"UAT med økonomiavdelingen, pilotperiode 2 uker.",tracks:["rpa"],value:5,urgency:3,risk:3,feasibility:4,deps:4,effort:4,size:3,status:"ready",sprint:false,submitterName:"Kari Haugen",submitterDept:"Økonomiavd.",processOwner:"Økonomisjef Trond Lie",date:"2026-01-22",reviewed:true,priority:"high",goals:["G-02"],parentId:"T-001",personalData:"no",comments:[{author:"Leveranseteam",text:"Planlagt Sprint 28.",time:"2026-02-05 10:00"}],history:[],attachments:[]},
  {id:"T-002",title:"Bygge kundedashboard",desc:"Samlet oversikt over henvendelser.",tracks:["sysdev"],value:5,urgency:2,risk:2,feasibility:5,deps:4,effort:2,size:13,status:"ready",sprint:true,submitterName:"Per Olsen",submitterDept:"Kundeservice",processOwner:"Leder kundeservice",date:"2026-01-22",reviewed:true,priority:"high",goals:["G-01"],parentId:null,rice_reach:4,rice_impact:5,rice_confidence:4,rice_effort:2,comments:[],history:[],attachments:[]},
  {id:"T-002-A",title:"Design UI/UX for dashboard",desc:"Wireframes og prototyp i Figma.",tracks:["sysdev"],value:5,urgency:2,risk:1,feasibility:5,deps:5,effort:4,size:5,status:"ready",sprint:true,submitterName:"Per Olsen",submitterDept:"Kundeservice",processOwner:"Leder kundeservice",date:"2026-01-23",reviewed:true,priority:"high",goals:["G-01"],parentId:"T-002",comments:[],history:[],attachments:[]},
  {id:"T-002-B",title:"Implementere backend API for dashboard",desc:"REST-endepunkter for henvendelsesdata.",tracks:["sysdev"],value:5,urgency:2,risk:2,feasibility:4,deps:3,effort:2,size:8,status:"ready",sprint:false,submitterName:"Per Olsen",submitterDept:"Kundeservice",processOwner:"Leder kundeservice",date:"2026-01-23",reviewed:true,priority:"high",goals:["G-01"],parentId:"T-002",rice_reach:4,rice_impact:5,rice_confidence:4,rice_effort:2,comments:[{author:"Leveranseteam",text:"Sprint 28 – avhenger av T-002-A.",time:"2026-02-03 11:00"}],history:[],attachments:[]},
  {id:"T-003",title:"Oppgradere CRM-integrasjon",desc:"Ny REST-API versjon.",tracks:["integration"],value:4,urgency:3,risk:2,feasibility:3,deps:3,effort:3,size:8,status:"in-progress",sprint:true,submitterName:"Erik Holm",submitterDept:"IT-drift",processOwner:"CRM-forvalter",date:"2026-01-18",parentId:null,reviewed:true,priority:"medium",goals:["G-01"],cod_business:4,cod_time:3,cod_opportunity:2,cod_downstream:4,comments:[],history:[],attachments:[]},
  {id:"T-004",title:"Migrere legacy-API",desc:"Flytte SOAP til REST – blokkerer flere initiativ.",tracks:["integration","sysdev"],value:3,urgency:5,risk:4,feasibility:2,deps:2,effort:1,size:21,status:"blocked",sprint:false,submitterName:"Lise Berg",submitterDept:"Arkitektur",processOwner:"Sjefsarkitekt",date:"2026-01-15",parentId:null,reviewed:true,priority:"high",goals:["G-01","G-04"],cod_business:5,cod_time:5,cod_opportunity:3,cod_downstream:5,rice_reach:3,rice_impact:3,rice_confidence:3,rice_effort:2,comments:[{author:"Utviklingsforum",text:"Blokkert av leverandør – følges opp.",time:"2026-02-01 14:00"}],history:[],attachments:[]},
  {id:"T-005",title:"SSO-pålogging alle systemer",desc:"Azure AD SSO for interne systemer.",tracks:["sysdev"],value:4,urgency:3,risk:3,feasibility:4,deps:4,effort:3,size:5,status:"ready",sprint:true,submitterName:"Jonas Ribe",submitterDept:"Sikkerhet",processOwner:"CISO",date:"2026-01-25",parentId:null,reviewed:true,priority:"medium",goals:["G-04"],eqsRef:"EQS-2023-0088 Tilgangsstyring",personalData:"yes",rice_reach:5,rice_impact:4,rice_confidence:5,rice_effort:3,comments:[],history:[],attachments:[]},
  {id:"T-006",title:"Redesigne onboarding-flyt",desc:"Power Apps onboarding for nye ansatte.",tracks:["lowcode"],value:5,urgency:2,risk:1,feasibility:5,deps:5,effort:4,size:8,status:"assessed",sprint:false,submitterName:"Sofie Aasen",submitterDept:"HR",processOwner:"HR-leder",date:"2026-02-01",parentId:null,reviewed:true,priority:"medium",goals:["G-07"],ice_impact:5,ice_confidence:4,ice_ease:4,comments:[],history:[],attachments:[]},
  {id:"T-007",title:"Lisenshåndteringsverktøy",desc:"Erstatte Excel med hyllevare-løsning.",tracks:["cots"],value:4,urgency:3,risk:2,feasibility:5,deps:5,effort:4,size:3,status:"assessed",sprint:false,submitterName:"Ida Berg",submitterDept:"Innkjøp",processOwner:"IT innkjøpsansvarlig",date:"2026-02-03",parentId:null,reviewed:true,priority:"medium",goals:["G-06"],cots_fit:4,cots_tco:4,cots_vendor:5,cots_integration:3,cots_security:4,comments:[],history:[],attachments:[]},
  {id:"T-008",title:"Power App avviksmeldinger",desc:"Erstatte papirskjema for avviksrapportering.",tracks:[],value:4,urgency:3,risk:2,feasibility:5,deps:5,effort:5,size:0,status:"submitted",sprint:false,submitterName:"Ona Nilsen",submitterDept:"Kvalitet",processOwner:"Kvalitetssjef",date:"2026-02-07",parentId:null,reviewed:false,priority:"medium",goals:["G-06"],comments:[],history:[],attachments:[]},
  {id:"T-009",title:"Bedre venteromsinfo",desc:"Digital informasjonstavle for pasienter.",tracks:[],value:3,urgency:2,risk:1,feasibility:3,deps:3,effort:3,size:0,status:"submitted",sprint:false,submitterName:"Anna Sæther",submitterDept:"Poliklinikk",processOwner:"Avd.leder poliklinikk",date:"2026-02-10",parentId:null,reviewed:false,priority:"low",goals:["G-05"],comments:[],history:[],attachments:[]},
  {id:"T-010",title:"E-signeringsløsning",desc:"Digital signering for kontrakter og samtykker.",tracks:[],value:5,urgency:4,risk:3,feasibility:4,deps:4,effort:4,size:0,status:"submitted",sprint:false,submitterName:"Toril Strand",submitterDept:"Jus",processOwner:"Juridisk rådgiver",date:"2026-02-12",parentId:null,reviewed:false,priority:"high",goals:["G-06"],comments:[],history:[],attachments:[]},
];

const INIT_CONFIG={sprintName:"Sprint 27",sprintStart:"2026-02-03",sprintEnd:"2026-02-14",sprintWeeks:2,notifyEmails:["utviklingsforum@hemit.no","leder@hemit.no"],emailNotifications:true,emailOnStatusChange:true,emailOnReview:true,notifyProcessOwner:true,scoringWeights:{wsjf:60,trackSpecific:40},dpiaLink:"https://eqs.hemit.no/doc/DPIA-mal-2024",dpiaEqsRef:"EQS-2024-0200 DPIA-prosedyre",
  auth:{enabled:false,provider:"azure-ad",tenantId:"",clientId:"",allowedDomains:["hemit.no","helse-midt.no","helseplattformen.no"],requireMfa:false,sessionTimeout:480,
    roleMappings:[
      {id:"rm1",groupId:"",groupName:"IT Utviklingsforum",role:"forum"},
      {id:"rm2",groupId:"",groupName:"Leveranseteam",role:"team"},
      {id:"rm3",groupId:"",groupName:"IT Administrasjon",role:"admin"},
    ],
    defaultRole:"employee",autoProvision:true,
  },
  azureDevOps:{enabled:false,orgUrl:"",pat:"",defaultProject:"",syncWorkItems:true,syncOnStatusChange:true,
    fieldMapping:{title:"System.Title",description:"System.Description",priority:"Microsoft.VSTS.Common.Priority",status:"System.State"},
    workItemType:"User Story",areaPath:"",iterationPath:"",
    statusMapping:[
      {id:"sm1",appStatus:"ready",devOpsState:"New"},
      {id:"sm2",appStatus:"in-progress",devOpsState:"Active"},
      {id:"sm3",appStatus:"done",devOpsState:"Closed"},
    ],
  },
  serviceNow:{enabled:false,instanceUrl:"",authMethod:"basic",username:"",password:"",clientId:"",clientSecret:"",
    syncIncidents:true,syncChangeRequests:false,syncOnStatusChange:true,
    table:"incident",assignmentGroup:"",category:"Software",
    fieldMapping:{shortDescription:"title",description:"description",priority:"priority",state:"status"},
    statusMapping:[
      {id:"sn1",appStatus:"submitted",snowState:"New"},
      {id:"sn2",appStatus:"in-progress",snowState:"In Progress"},
      {id:"sn3",appStatus:"done",snowState:"Resolved"},
    ],
  },
};

const INIT_TEAM=[
  {id:"m1",name:"Lars Kristiansen",role:"Backend",availability:100,skills:["Backend","DevOps"],track:"sysdev"},
  {id:"m2",name:"Marte Solberg",role:"Frontend",availability:80,skills:["Frontend","UX"],track:"sysdev"},
  {id:"m3",name:"Erik Nordli",role:"Fullstack",availability:60,skills:["Frontend","Backend"],track:"sysdev"},
  {id:"m4",name:"Sofie Aasen",role:"UX/UI",availability:50,skills:["UX"],track:"lowcode"},
  {id:"m5",name:"Jonas Ribe",role:"QA",availability:100,skills:["QA"],track:"sysdev"},
  {id:"m6",name:"Ida Berg",role:"RPA-utvikler",availability:70,skills:["RPA"],track:"rpa"},
];
const SPRINTS=[{s:"S-21",p:34,d:29},{s:"S-22",p:38,d:35},{s:"S-23",p:40,d:38},{s:"S-24",p:36,d:36},{s:"S-25",p:42,d:39},{s:"S-26",p:38,d:37}];

/* ── UI Atoms ── */
const Badge=({children,color,bg,style={}})=><span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"2px 10px",borderRadius:20,fontSize:11,fontWeight:600,color,background:bg,border:`1px solid ${color}20`,whiteSpace:"nowrap",...style}}>{children}</span>;
const TBadge=({id:tid})=>{const t=TRACKS.find(x=>x.id===tid);return t?<Badge color={t.color} bg={t.color+"14"}>{t.icon} {t.label}</Badge>:null;};
const Card=({children,style={},...p})=><div style={{background:C.surface,borderRadius:12,border:`1px solid ${C.border}`,padding:18,...style}} {...p}>{children}</div>;
const Btn=({children,variant="primary",onClick,style={},type="button",disabled,...p})=>{
  const v={primary:{background:C.primary,color:"#fff"},secondary:{background:C.surfaceAlt,color:C.primary,border:`1px solid ${C.border}`},ghost:{background:"transparent",color:C.textSec},danger:{background:C.dangerBg,color:C.danger},success:{background:C.successBg,color:C.success}};
  return <button type={type} onClick={onClick} disabled={disabled} style={{borderRadius:8,fontWeight:600,fontSize:13,cursor:disabled?"not-allowed":"pointer",padding:"7px 16px",border:"none",transition:"all .15s",outline:"none",opacity:disabled?.5:1,...(v[variant]||{}),...style}} onFocus={e=>e.target.style.boxShadow=`0 0 0 3px ${C.focus}44`} onBlur={e=>e.target.style.boxShadow="none"} {...p}>{children}</button>;
};
const SH=({children})=><h3 style={{fontSize:13,fontWeight:700,color:C.primary,margin:"0 0 10px",borderBottom:`2px solid ${C.primaryLight}`,paddingBottom:5}}>{children}</h3>;
const TF=({label,id,value,onChange,required,multiline,placeholder,type="text"})=>{
  const s={padding:"8px 11px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:13,color:C.text,background:C.surface,outline:"none",width:"100%",boxSizing:"border-box",fontFamily:"inherit"};
  return <div style={{display:"flex",flexDirection:"column",gap:2}}><label htmlFor={id} style={{fontSize:11,fontWeight:600,color:C.textSec}}>{label}{required&&<span style={{color:C.danger}}> *</span>}</label>{multiline?<textarea id={id} value={value} onChange={onChange} required={required} placeholder={placeholder} rows={3} style={s}/>:<input type={type} id={id} value={value} onChange={onChange} required={required} placeholder={placeholder} style={s}/>}</div>;
};
const SF=({label,id,value,onChange,children,required})=><div style={{display:"flex",flexDirection:"column",gap:2}}><label htmlFor={id} style={{fontSize:11,fontWeight:600,color:C.textSec}}>{label}{required&&<span style={{color:C.danger}}> *</span>}</label><select id={id} value={value} onChange={onChange} required={required} style={{padding:"8px 11px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:13,color:C.text,background:C.surface,outline:"none"}}>{children}</select></div>;
const Sl=({label,id,value,onChange})=><div style={{display:"flex",flexDirection:"column",gap:1}}><div style={{display:"flex",justifyContent:"space-between"}}><label htmlFor={id} style={{fontSize:11,fontWeight:600,color:C.textSec}}>{label}</label><span style={{fontSize:14,fontWeight:800,color:C.primary}}>{value}</span></div><input type="range" id={id} min={1} max={5} step={1} value={value} onChange={onChange} style={{width:"100%",accentColor:C.primary}}/></div>;
const SBar=({value})=><div style={{display:"flex",alignItems:"center",gap:3}}><div style={{display:"flex",gap:1}}>{[1,2,3,4,5].map(i=><div key={i} style={{width:6,height:12,borderRadius:2,background:i<=value?C.primary:C.border}}/>)}</div><span style={{fontSize:10,color:"#8896A6"}}>{value}</span></div>;

function findDupes(title,tasks){
  if(!title||title.length<5)return[];
  const w=title.toLowerCase().split(/\s+/).filter(x=>x.length>3);
  return tasks.filter(t=>{const tw=t.title.toLowerCase();return w.filter(x=>tw.includes(x)).length>=2;}).slice(0,3);
}

const TIP={
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
const Tip=({children,k,style={}})=><span title={TIP[k]||""} style={{borderBottom:`1px dashed ${C.textMuted}55`,cursor:"help",...style}}>{children||k}</span>;

const GoalPicker=({goals,selected=[],onChange})=><div style={{display:"flex",flexDirection:"column",gap:3}}>
  <label style={{fontSize:11,fontWeight:600,color:C.textSec}}>Strategiske mål <span style={{fontWeight:400,color:"#8896A6"}}>(handlingsplan)</span></label>
  <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{goals.map(g=>{const sel=selected.includes(g.id);return <button key={g.id} type="button" onClick={()=>onChange(sel?selected.filter(x=>x!==g.id):[...selected,g.id])} style={{padding:"4px 10px",borderRadius:7,border:`1.5px solid ${sel?C.primary:C.border}`,background:sel?C.primary+"0C":"transparent",color:sel?C.primary:C.textMuted,fontSize:10,fontWeight:600,cursor:"pointer",outline:"none",textAlign:"left"}}>{g.type==="Delmål"?"↳ ":""}{g.title}{sel?" ✓":""}</button>;})}</div>
</div>;

const AttachArea=({attachments=[],onChange})=><div style={{display:"flex",flexDirection:"column",gap:3}}>
  <label style={{fontSize:11,fontWeight:600,color:C.textSec}}>Vedlegg</label>
  <div style={{border:`1px dashed ${C.border}`,borderRadius:8,padding:10,textAlign:"center",cursor:"pointer",background:C.surfaceAlt}} onClick={()=>{const n=prompt("Filnavn (simulert):","skjermbilde.png");if(n)onChange([...attachments,{name:n,size:"128 KB",time:ts()}]);}}>
    <span style={{fontSize:11,color:"#8896A6"}}>📎 Klikk for å legge til vedlegg</span>
  </div>
  {attachments.length>0&&<div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:3}}>{attachments.map((a,i)=><Badge key={i} color={C.accent} bg={C.accent+"10"}>📄 {a.name} <button type="button" onClick={e=>{e.stopPropagation();onChange(attachments.filter((_,j)=>j!==i));}} style={{background:"none",border:"none",color:C.danger,cursor:"pointer",fontWeight:700,fontSize:11,marginLeft:3}}>×</button></Badge>)}</div>}
</div>;

const CommentsPanel=({task,role,onAdd})=>{
  const [txt,setTxt]=useState("");
  return <div style={{marginTop:10}}>
    <div style={{fontSize:11,fontWeight:700,color:C.primary,marginBottom:4}}>Kommentarer ({task.comments?.length||0})</div>
    {(task.comments||[]).map((c,i)=><div key={i} style={{padding:"5px 9px",background:C.surfaceAlt,borderRadius:6,marginBottom:3,fontSize:11}}>
      <div style={{display:"flex",justifyContent:"space-between"}}><strong style={{color:C.primary}}>{c.author}</strong><span style={{color:C.textMuted,fontSize:9}}>{c.time}</span></div>
      <div style={{color:C.textSec,marginTop:1}}>{c.text}</div>
    </div>)}
    {role!=="employee"&&<div style={{display:"flex",gap:5,marginTop:3}}>
      <input value={txt} onChange={e=>setTxt(e.target.value)} placeholder="Legg til kommentar..." style={{flex:1,padding:"5px 9px",borderRadius:6,border:`1px solid ${C.border}`,fontSize:11,outline:"none"}} onKeyDown={e=>{if(e.key==="Enter"&&txt.trim()){onAdd(txt.trim());setTxt("");}}}/>
      <Btn style={{fontSize:10,padding:"5px 10px"}} onClick={()=>{if(txt.trim()){onAdd(txt.trim());setTxt("");}}}>Legg til</Btn>
    </div>}
  </div>;
};

const HistoryPanel=({task})=><div style={{marginTop:8}}>
  <div style={{fontSize:11,fontWeight:700,color:C.primary,marginBottom:4}}>Endringshistorikk ({task.history?.length||0})</div>
  {(task.history||[]).length===0?<p style={{fontSize:11,color:C.textMuted,margin:0}}>Ingen endringer registrert.</p>
  :<div style={{maxHeight:160,overflow:"auto"}}>{(task.history||[]).slice().reverse().map((h,i)=><div key={i} style={{padding:"3px 0",borderBottom:`1px solid ${C.border}33`,fontSize:10,display:"flex",justifyContent:"space-between"}}>
    <span><strong style={{color:C.primary}}>{h.who}</strong>: {h.what}</span><span style={{color:C.textMuted,flexShrink:0,marginLeft:6}}>{h.time}</span>
  </div>)}</div>}
</div>;

export default function App(){
  const [dark,setDark]=useState(false);
  C=dark?DK:LT;
  const [role,setRole]=useState("employee");
  const [tab,setTab]=useState("submit");
  const [tasks,setTasks]=useState(INIT_TASKS);
  const [goals,setGoals]=useState(INIT_GOALS);
  const [config,setConfig]=useState(INIT_CONFIG);
  const [team,setTeam]=useState(INIT_TEAM);
  const [sortBy,setSortBy]=useState("score");
  const [filterTrack,setFilterTrack]=useState("all");
  const [filterStatus,setFilterStatus]=useState("all");
  const [searchQ,setSearchQ]=useState("");
  const [selectedTask,setSelectedTask]=useState(null);
  const [modal,setModal]=useState(null);
  const [note,setNote]=useState(null);
  const [batchSel,setBatchSel]=useState([]);
  const [editMember,setEditMember]=useState(null);
  const [dragTask,setDragTask]=useState(null);
  const [showArchived,setShowArchived]=useState(false);
  const emptyForm={title:"",desc:"",submitterName:"",submitterDept:"",processOwner:"",priority:"medium",goals:[],eqsRef:"",personalData:"unknown",value:3,urgency:3,risk:3,feasibility:3,deps:3,effort:3,attachments:[]};
  const [form,setForm]=useState(emptyForm);
  const [goalForm,setGoalForm]=useState({title:"",type:"Hovedmål",parent:""});
  const [memberForm,setMemberForm]=useState({name:"",role:"",availability:100,skills:[],track:"sysdev"});
  const [subForm,setSubForm]=useState({title:"",size:3,sprintAssign:""});

  const notify=(msg,type="success")=>{setNote({msg,type});setTimeout(()=>setNote(null),4500);};
  const updateTask=(id,ch)=>{setTasks(p=>p.map(t=>{if(t.id!==id)return t;const hist=Object.keys(ch).filter(k=>!["comments","history","attachments"].includes(k)&&JSON.stringify(t[k])!==JSON.stringify(ch[k])).map(k=>({who:role==="employee"?"Medarbeider":role==="forum"?"Utviklingsforum":"Leveranseteam",what:`${k}: ${JSON.stringify(t[k])}→${JSON.stringify(ch[k])}`,time:ts()}));return{...t,...ch,history:[...(t.history||[]),...hist]};}));if(config.emailNotifications&&config.emailOnStatusChange&&ch.status){const old=tasks.find(t=>t.id===id);if(old&&old.status!==ch.status){notify("📧 Varsling → "+stMap[ch.status]?.label);if(config.notifyProcessOwner&&old.processOwner)notify(`📧 Prosesseier varslet`);}}};
  const addComment=(id,text)=>{const author=role==="employee"?"Medarbeider":role==="forum"?"Utviklingsforum":"Leveranseteam";setTasks(p=>p.map(t=>t.id===id?{...t,comments:[...(t.comments||[]),{author,text,time:ts()}]}:t));};
  const deleteTask=id=>{setTasks(p=>p.filter(t=>t.id!==id));setModal(null);notify("Slettet.","warning");};
  const archiveTask=id=>updateTask(id,{archived:true,status:"archived"});
  const batchAction=(act,val)=>{const n=batchSel.length;batchSel.forEach(id=>{if(act==="status")updateTask(id,{status:val});else if(act==="sprint")updateTask(id,{sprint:val});else if(act==="archive")archiveTask(id);});setBatchSel([]);notify(`${n} oppdatert`);};
  const dupes=useMemo(()=>findDupes(form.title,tasks),[form.title,tasks]);
  const unreviewed=tasks.filter(t=>!t.reviewed&&!t.archived);
  const activeTasks=useMemo(()=>showArchived?tasks:tasks.filter(t=>!t.archived),[tasks,showArchived]);
  const handleSubmit=e=>{e.preventDefault();if(!form.title){notify("Fyll inn tittel.","warning");return;}if(!form.submitterName){notify("Fyll inn navnet ditt.","warning");return;}const t={...form,id:`T-${String(tasks.length+1).padStart(3,"0")}`,tracks:[],size:0,status:"submitted",sprint:false,date:td(),reviewed:false,actualHours:0,comments:[],history:[{who:form.submitterName,what:"Opprettet",time:ts()}],archived:false,parentId:null};setTasks(p=>[t,...p]);setForm(emptyForm);notify(`"${t.title}" sendt til Utviklingsforum.`);};
  const getSubtasks=(parentId)=>tasks.filter(t=>t.parentId===parentId);
  const isParent=(t)=>!t.parentId&&tasks.some(s=>s.parentId===t.id);
  const addSubtask=(parent,title,size,sprintName)=>{const sub={...parent,id:`${parent.id}-${String.fromCharCode(65+getSubtasks(parent.id).length)}`,title,desc:`Deloppgave av ${parent.title}`,size:parseInt(size)||3,status:"ready",sprint:!!sprintName,parentId:parent.id,actualHours:0,comments:[],history:[{who:role==="forum"?"Utviklingsforum":"Leveranseteam",what:`Deloppgave opprettet (av ${parent.id})`,time:ts()}],attachments:[],archived:false};setTasks(p=>[...p,sub]);notify(`Deloppgave "${title}" opprettet`);};
  const subProgress=(parentId)=>{const subs=getSubtasks(parentId);if(!subs.length)return null;const done=subs.filter(s=>s.status==="done").length;return{total:subs.length,done,pct:Math.round(done/subs.length*100)};};
  const parentTasks=useMemo(()=>tasks.filter(t=>!t.parentId&&!t.archived),[tasks]);
  const sorted=useMemo(()=>{let a=[...activeTasks];if(role==="team")a=a.filter(t=>t.reviewed);if(filterTrack!=="all")a=a.filter(t=>(t.tracks||[]).includes(filterTrack));if(filterStatus!=="all")a=a.filter(t=>t.status===filterStatus);if(searchQ){const q=searchQ.toLowerCase();a=a.filter(t=>t.title.toLowerCase().includes(q)||t.desc?.toLowerCase().includes(q)||t.submitterName?.toLowerCase().includes(q)||t.processOwner?.toLowerCase().includes(q));}const o={critical:4,high:3,medium:2,low:1};if(sortBy==="score")a.sort((x,y)=>composite(y)-composite(x));else if(sortBy==="priority")a.sort((x,y)=>(o[y.priority]||0)-(o[x.priority]||0));else if(sortBy==="date")a.sort((x,y)=>y.date.localeCompare(x.date));return a;},[activeTasks,sortBy,filterTrack,filterStatus,searchQ,role]);
  const sprintTasks=tasks.filter(t=>t.sprint&&!t.archived);
  const totalSP=sprintTasks.reduce((s,t)=>s+t.size,0);
  const doneSP=sprintTasks.filter(t=>t.status==="done").reduce((s,t)=>s+t.size,0);
  const sprintPct=totalSP>0?Math.round(doneSP/totalSP*100):0;
  const totalCap=team.reduce((s,m)=>s+autoHours(m.availability,config.sprintWeeks),0);
  const prMap=Object.fromEntries(PRIORITIES.map(p=>[p.id,p]));
  const roleTabs={employee:[{id:"submit",label:"Meld forslag",icon:"💡"},{id:"my",label:"Mine",icon:"📋"}],forum:[{id:"inbox",label:"Innkomne",icon:"📥"},{id:"review",label:"Alle",icon:"🔬"},{id:"backlog",label:"Backlog",icon:"≡"},{id:"goals",label:"Mål",icon:"🎯"}],team:[{id:"backlog",label:"Backlog",icon:"≡"},{id:"sprint",label:"Sprint",icon:"⚡"},{id:"capacity",label:"Kapasitet",icon:"👥"},{id:"dashboard",label:"Dashboard",icon:"📊"}],admin:[{id:"config",label:"Konfig",icon:"⚙️"},{id:"goals",label:"Mål",icon:"🎯"}]};
  const saveConfig=()=>{try{localStorage.setItem("hemit-cfg",JSON.stringify({config,team,goals}));}catch(e){}notify("Konfigurasjon lagret ✓");};
  const loadConfig=()=>{try{const d=JSON.parse(localStorage.getItem("hemit-cfg"));if(d){if(d.config)setConfig(d.config);if(d.team)setTeam(d.team);if(d.goals)setGoals(d.goals);notify("Lastet.");}}catch(e){notify("Ingen lagret.","warning");}};

  const ReviewModal=({task,onClose})=>{const[f,sF]=useState({...task});const[cmt,setCmt]=useState("");const tog=id=>sF(p=>({...p,tracks:(p.tracks||[]).includes(id)?(p.tracks||[]).filter(x=>x!==id):[...(p.tracks||[]),id]}));const trkD=()=>{let d=[];const tr=f.tracks||[];if(tr.includes("integration"))d.push({s:"Cost of Delay",tip:TIP.CoD,dims:COD_DIMS,calc:calcCod,c:TRACKS[1].color});if(tr.includes("rpa"))d.push({s:"RPA Pipeline",tip:TIP.RPA,dims:RPA_DIMS,calc:calcRpa,c:TRACKS[0].color});if(tr.includes("sysdev"))d.push({s:"RICE",tip:TIP.RICE,dims:RICE_DIMS,calc:calcRice,c:TRACKS[2].color});if(tr.includes("lowcode"))d.push({s:"ICE",tip:TIP.ICE,dims:ICE_DIMS,calc:calcIce,c:TRACKS[3].color});if(tr.includes("cots"))d.push({s:"TCO/Fit",tip:TIP.TCO,dims:COTS_DIMS,calc:calcCots,c:TRACKS[4].color});return d;};const save=()=>{const upd={...f,reviewed:true,status:f.status==="submitted"?((f.tracks||[]).length?"assessed":"under-review"):f.status};updateTask(task.id,upd);if(cmt.trim())addComment(task.id,cmt.trim());onClose();notify(`"${f.title}" vurdert.`);};
  return <div style={{position:"fixed",inset:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.45)",padding:10}} onClick={onClose}><div onClick={e=>e.stopPropagation()} style={{background:C.surface,borderRadius:14,maxWidth:860,width:"100%",maxHeight:"94vh",overflow:"auto",padding:22,color:C.text}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><div><h2 style={{fontSize:17,fontWeight:700,color:C.primary,margin:0}}>{task.id}: {task.title}</h2><p style={{fontSize:11,color:C.textMuted,margin:"2px 0"}}>{task.submitterName} · {task.processOwner&&`${task.processOwner} · `}{task.date}</p></div><Btn variant="ghost" onClick={onClose} style={{color:C.textSec}}>✕</Btn></div>
    <Card style={{marginBottom:10,borderLeft:`4px solid ${C.accent}`,background:C.surfaceAlt,padding:12}}><p style={{fontSize:12,color:C.textSec,margin:0}}>{task.desc||"—"}</p><div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:4}}>{task.eqsRef&&<Badge color="#0891B2" bg="#E0F7FA" style={{fontSize:9}}>📋 {task.eqsRef}</Badge>}{task.personalData==="yes"&&<Badge color={C.danger} bg={C.dangerBg} style={{fontSize:9}}>🔒 DPIA – <a href={config.dpiaLink} target="_blank" rel="noopener" style={{color:C.danger}}>Mal</a></Badge>}{(task.goals||[]).map(gid=>{const g=goals.find(x=>x.id===gid);return g?<Badge key={gid} color={C.primary} bg={C.primary+"0C"} style={{fontSize:9}}>🎯 {g.title}</Badge>:null;})}</div></Card>
    <SH><Tip k="WSJF">WSJF-scoring</Tip></SH><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:4}}>{WSJF_DIMS.map(d=><Sl key={d.key} label={d.label} id={`r-${d.key}`} value={f[d.key]||3} onChange={e=>sF(p=>({...p,[d.key]:parseInt(e.target.value)}))}/>)}</div><div style={{padding:"6px 10px",background:C.surfaceAlt,borderRadius:8,marginBottom:14,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:11,color:C.textSec}}><Tip k="WSJF">WSJF</Tip></span><span style={{fontSize:18,fontWeight:800,color:C.primary}}>{calcWsjf(f)}</span></div>
    <SH>Løype(r)</SH><div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:14}}>{TRACKS.map(tr=>{const sel=(f.tracks||[]).includes(tr.id);return <button key={tr.id} type="button" onClick={()=>tog(tr.id)} style={{padding:"7px 14px",borderRadius:9,border:`2px solid ${sel?tr.color:C.border}`,background:sel?tr.color+"0C":"transparent",color:sel?tr.color:C.textMuted,fontWeight:600,fontSize:11,cursor:"pointer"}}>{tr.icon} {tr.label}{sel&&" ✓"}</button>;})}</div>
    {trkD().map(({s,tip,dims,calc,c})=><div key={s} style={{marginBottom:10,padding:10,background:c+"06",borderRadius:8,border:`1px solid ${c}15`}}><h4 style={{fontSize:11,fontWeight:700,color:c,margin:"0 0 6px"}} title={tip}><span style={{borderBottom:`1px dashed ${c}55`,cursor:"help"}}>{s}</span></h4><div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(dims.length,3)},1fr)`,gap:8,marginBottom:4}}>{dims.map(d=><Sl key={d.key} label={d.label} id={`rv-${d.key}`} value={f[d.key]||3} onChange={e=>sF(p=>({...p,[d.key]:parseInt(e.target.value)}))}/>)}</div><div style={{display:"flex",justifyContent:"space-between",padding:"5px 8px",background:C.surface,borderRadius:6}}><span style={{fontSize:10,color:C.textSec}}>Delsum</span><span style={{fontSize:13,fontWeight:800,color:c}}>{Math.round(calc(f))}</span></div></div>)}
    <SH>Metadata</SH><GoalPicker goals={goals} selected={f.goals||[]} onChange={g=>sF(p=>({...p,goals:g}))}/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginTop:8}}><SF label="Prioritet" id="r-prio" value={f.priority||"medium"} onChange={e=>sF(p=>({...p,priority:e.target.value}))}>{PRIORITIES.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</SF><SF label="Status" id="r-status" value={f.status} onChange={e=>sF(p=>({...p,status:e.target.value}))}>{STATUSES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</SF><div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:C.primary+"08",borderRadius:8}}><span style={{fontSize:8,color:C.textMuted}}>SAMLET</span><span style={{fontSize:24,fontWeight:800,color:C.primary}}>{composite(f)}</span></div></div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:8}}><TF label="Faktisk tidsbruk (t)" id="r-hrs" type="number" value={f.actualHours||0} onChange={e=>sF(p=>({...p,actualHours:parseFloat(e.target.value)||0}))}/><TF label="Kommentar" id="r-cmt" value={cmt} onChange={e=>setCmt(e.target.value)} placeholder="Begrunnelse..."/></div>
    {/* Subtask panel */}
    {!task.parentId&&<div style={{marginTop:14,border:`1px solid ${C.border}`,borderRadius:10,padding:12,background:C.bg}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><h4 style={{fontSize:13,fontWeight:700,color:C.primary,margin:0}}>🧩 Deloppgaver</h4>{(()=>{const sp=subProgress(task.id);return sp?<Badge color={sp.pct===100?C.success:C.accent} bg={sp.pct===100?C.successBg:C.accent+"10"} style={{fontSize:9}}>{sp.done}/{sp.total} ferdig ({sp.pct}%)</Badge>:null;})()}</div>
      {getSubtasks(task.id).length>0&&<div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:8}}>{getSubtasks(task.id).map(sub=>{const st=stMap[sub.status];return <div key={sub.id} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 10px",background:C.surface,borderRadius:7,border:`1px solid ${C.border}`}}>
        <div style={{width:18,height:18,borderRadius:4,background:sub.status==="done"?C.success:C.surfaceAlt,border:`1.5px solid ${sub.status==="done"?C.success:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#fff",cursor:"pointer"}} onClick={()=>updateTask(sub.id,{status:sub.status==="done"?"ready":"done"})}>{sub.status==="done"&&"✓"}</div>
        <div style={{flex:1,minWidth:0}}><div style={{fontSize:11,fontWeight:600,textDecoration:sub.status==="done"?"line-through":"none",color:sub.status==="done"?C.textMuted:C.text}}>{sub.title}</div><div style={{fontSize:9,color:C.textMuted}}>{sub.id} · {sub.size}SP · {sub.sprint?"I sprint":"Ikke tildelt sprint"}</div></div>
        <Badge color={st?.color} bg={st?.bg} style={{fontSize:8}}>{st?.label}</Badge>
        <select value={sub.sprint?"sprint":"backlog"} onChange={e=>updateTask(sub.id,{sprint:e.target.value==="sprint"})} style={{fontSize:9,padding:"2px 4px",borderRadius:4,border:`1px solid ${C.border}`,background:C.surface,color:C.text}}><option value="backlog">Backlog</option><option value="sprint">Sprint</option></select>
        <select value={sub.status} onChange={e=>updateTask(sub.id,{status:e.target.value})} style={{fontSize:9,padding:"2px 4px",borderRadius:4,border:`1px solid ${st?.color||C.border}`,background:st?.bg,color:st?.color}}>{STATUSES.filter(s=>s.id!=="archived").map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select>
      </div>;})}
      {(()=>{const sp=subProgress(task.id);return sp?<div style={{marginTop:4}}><div style={{height:4,borderRadius:2,background:C.surfaceAlt}}><div style={{height:4,borderRadius:2,background:sp.pct===100?C.success:C.accent,width:`${sp.pct}%`,transition:"width .3s"}}/></div></div>:null;})()}
      </div>}
      <div style={{display:"grid",gridTemplateColumns:"3fr 1fr auto",gap:6,alignItems:"end"}}><TF label="Ny deloppgave" id="sub-t" value={subForm.title} onChange={e=>setSubForm(f=>({...f,title:e.target.value}))} placeholder="Beskriv deloppgaven..."/><SF label="SP" id="sub-sp" value={subForm.size} onChange={e=>setSubForm(f=>({...f,size:e.target.value}))}>{FIBONACCI.map(f=><option key={f.v} value={f.v}>{f.v}</option>)}</SF><Btn onClick={()=>{if(!subForm.title.trim())return;addSubtask(task,subForm.title.trim(),subForm.size);setSubForm({title:"",size:3,sprintAssign:""});}} style={{fontSize:11}}>+ Legg til</Btn></div>
    </div>}
    {task.parentId&&<div style={{marginTop:10,padding:"6px 10px",background:C.accent+"08",borderRadius:7,border:`1px solid ${C.accent}20`}}><span style={{fontSize:11,color:C.accent}}>🔗 Deloppgave av <strong>{task.parentId}</strong>: {tasks.find(t=>t.id===task.parentId)?.title||"—"}</span></div>}
    <div style={{display:"flex",justifyContent:"flex-end",gap:6,marginTop:14}}><Btn variant="secondary" onClick={onClose} style={{background:C.surfaceAlt,color:C.primary}}>Avbryt</Btn><Btn onClick={save}>Godkjenn</Btn></div>
  </div></div>;};

  const StSel=({task})=><select value={task.status} onChange={e=>{e.stopPropagation();updateTask(task.id,{status:e.target.value});}} onClick={e=>e.stopPropagation()} style={{padding:"3px 5px",borderRadius:5,border:`1px solid ${stMap[task.status]?.color||C.border}`,background:stMap[task.status]?.bg,color:stMap[task.status]?.color,fontSize:10,fontWeight:600,cursor:"pointer"}}>{STATUSES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select>;
  const SPSel=({task})=><select value={task.size} onChange={e=>{e.stopPropagation();updateTask(task.id,{size:parseInt(e.target.value)||0});}} onClick={e=>e.stopPropagation()} style={{padding:"3px 5px",borderRadius:5,border:`1px solid ${C.border}`,fontSize:10,fontWeight:600,cursor:"pointer",background:C.surface,color:C.text}}><option value={0}>–</option>{FIBONACCI.map(f=><option key={f.v} value={f.v}>{f.l}</option>)}</select>;
  const Empty=({icon,text})=><div style={{textAlign:"center",padding:40}}><div style={{fontSize:36,marginBottom:8}}>{icon}</div><p style={{color:C.textMuted,fontSize:13}}>{text}</p></div>;


  return <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'Source Sans 3','Calibri',system-ui,sans-serif"}}>
    {note&&<div role="alert" style={{position:"fixed",top:12,right:12,zIndex:300,padding:"10px 20px",borderRadius:10,background:note.type==="success"?C.successBg:C.warningBg,color:note.type==="success"?C.success:C.warning,fontWeight:600,fontSize:12,boxShadow:"0 4px 16px rgba(0,0,0,.15)",maxWidth:460}}>{note.msg}</div>}
    {modal?.type==="delete"&&<div style={{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.5)"}} onClick={()=>setModal(null)}><Card onClick={e=>e.stopPropagation()} style={{maxWidth:380,textAlign:"center",padding:24}}><div style={{fontSize:28,marginBottom:6}}>⚠️</div><h3 style={{fontSize:16,fontWeight:700,color:C.danger,margin:"0 0 14px"}}>Slette «{modal.task.title}»?</h3><div style={{display:"flex",justifyContent:"center",gap:8}}><Btn variant="secondary" onClick={()=>setModal(null)} style={{background:C.surfaceAlt,color:C.primary}}>Avbryt</Btn><Btn variant="danger" onClick={()=>deleteTask(modal.task.id)} style={{background:C.dangerBg,color:C.danger}}>Slett</Btn></div></Card></div>}
    {modal?.type==="review"&&<ReviewModal task={modal.task} onClose={()=>setModal(null)}/>}
    <header style={{background:dark?"#0A1628":"#003087",color:"#fff",borderBottom:`3px solid ${C.primaryLight}`}}>
      <div style={{maxWidth:1400,margin:"0 auto",padding:"0 16px",display:"flex",alignItems:"center",justifyContent:"space-between",height:52,flexWrap:"wrap",gap:4}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontWeight:700,fontSize:14}}>Hemit Nyttestyring</span><span style={{fontSize:9,opacity:.5}}>v6.3</span>{config.auth?.enabled&&<span style={{fontSize:8,padding:"2px 6px",borderRadius:4,background:"rgba(45,138,78,.3)",color:"#4ADE80",fontWeight:600}}>🔐 Entra ID</span>}</div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <button onClick={()=>setDark(!dark)} style={{background:"rgba(255,255,255,.1)",border:"none",borderRadius:4,padding:"3px 8px",color:"#fff",fontSize:11,cursor:"pointer"}}>{dark?"☀️":"🌙"}</button>
          {!config.auth?.enabled&&<div style={{display:"flex",gap:1,background:"rgba(255,255,255,.06)",borderRadius:6,padding:2}}>{[["employee","Medarbeider"],["forum","Utviklingsforum"],["team","Leveranseteam"],["admin","Admin"]].map(([r,l])=><button key={r} onClick={()=>{setRole(r);setTab(roleTabs[r][0].id);setSelectedTask(null);setBatchSel([]);}} style={{padding:"3px 9px",borderRadius:4,border:"none",cursor:"pointer",fontSize:10,fontWeight:600,background:role===r?"rgba(255,255,255,.18)":"transparent",color:role===r?"#fff":"rgba(255,255,255,.4)"}}>{l}</button>)}</div>}
          {config.auth?.enabled&&<div style={{display:"flex",alignItems:"center",gap:4,padding:"3px 9px",background:"rgba(255,255,255,.08)",borderRadius:6}}><span style={{fontSize:10,color:"rgba(255,255,255,.6)"}}>👤 {role==="admin"?"Administrator":role==="forum"?"Utviklingsforum":role==="team"?"Leveranseteam":"Medarbeider"}</span></div>}
          <nav><div style={{display:"flex",gap:1,background:"rgba(255,255,255,.06)",borderRadius:6,padding:2}}>{(roleTabs[role]||[]).map(t=><button key={t.id} onClick={()=>{setTab(t.id);setSelectedTask(null);setBatchSel([]);}} style={{padding:"3px 9px",borderRadius:4,border:"none",cursor:"pointer",fontSize:10,fontWeight:600,background:tab===t.id?"rgba(255,255,255,.18)":"transparent",color:tab===t.id?"#fff":"rgba(255,255,255,.4)",position:"relative"}}>{t.icon} {t.label}{t.id==="inbox"&&unreviewed.length>0&&<span style={{position:"absolute",top:-3,right:-3,width:14,height:14,borderRadius:"50%",background:"#C53030",color:"#fff",fontSize:8,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>{unreviewed.length}</span>}</button>)}</div></nav>
        </div>
      </div>
    </header>
    <main id="main" style={{maxWidth:1400,margin:"0 auto",padding:"16px 16px 50px"}}>

      {role==="employee"&&tab==="submit"&&<div style={{maxWidth:720,margin:"0 auto"}}>
        <h1 style={{fontSize:20,fontWeight:700,color:C.primary,margin:"0 0 12px"}}>Meld inn forbedringsforslag</h1>
        <form onSubmit={handleSubmit}><Card style={{marginBottom:12}}><SH>Grunndata</SH><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div style={{gridColumn:"1/-1"}}><TF label="Tittel" id="s-t" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} required placeholder="Kort beskrivelse"/></div>
          {dupes.length>0&&<div style={{gridColumn:"1/-1",padding:"6px 10px",background:C.warningBg,borderRadius:7}}><div style={{fontSize:11,fontWeight:700,color:C.warning}}>⚠️ Mulige duplikater:</div>{dupes.map(d=><div key={d.id} style={{fontSize:11,color:C.textSec}}>• {d.id}: {d.title}</div>)}</div>}
          <div style={{gridColumn:"1/-1"}}><TF label="Beskriv problemet" id="s-d" value={form.desc} onChange={e=>setForm(f=>({...f,desc:e.target.value}))} multiline placeholder="Hva er utfordringen?"/></div>
          <TF label="Ditt navn" id="s-n" value={form.submitterName} onChange={e=>setForm(f=>({...f,submitterName:e.target.value}))} required placeholder="Fornavn Etternavn"/>
          <TF label="Avdeling" id="s-dep" value={form.submitterDept} onChange={e=>setForm(f=>({...f,submitterDept:e.target.value}))} placeholder="Økonomiavd."/>
          <TF label="Prosess-/systemeier" id="s-o" value={form.processOwner} onChange={e=>setForm(f=>({...f,processOwner:e.target.value}))} placeholder="Hvem eier prosessen?"/>
          <SF label="Viktighet" id="s-p" value={form.priority} onChange={e=>setForm(f=>({...f,priority:e.target.value}))}>{PRIORITIES.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</SF>
          <div style={{gridColumn:"1/-1"}}><div title={TIP.EQS}><TF label="EQS-referanse (rutine/prosessbeskrivelse)" id="s-eqs" value={form.eqsRef} onChange={e=>setForm(f=>({...f,eqsRef:e.target.value}))} placeholder="EQS-xxxx eller 'Finnes ikke'"/></div></div>
          <SF label="Behandles persondata?" id="s-pd" value={form.personalData} onChange={e=>setForm(f=>({...f,personalData:e.target.value}))}><option value="unknown">Usikker</option><option value="yes">Ja</option><option value="no">Nei</option></SF>
        </div>
        {form.personalData==="yes"&&<div style={{marginTop:8,padding:"8px 12px",background:C.dangerBg,borderRadius:8}}><div style={{fontSize:11,fontWeight:700,color:C.danger}} title={TIP.DPIA}>⚠️ <Tip k="DPIA">DPIA</Tip> påkrevd</div><p style={{fontSize:11,color:C.textSec,margin:"2px 0 0"}}>Persondata behandles. <a href={config.dpiaLink} target="_blank" rel="noopener" style={{color:C.danger,fontWeight:600}}>Åpne DPIA-mal →</a>{config.dpiaEqsRef&&<span style={{fontSize:10}}> ({config.dpiaEqsRef})</span>}</p></div>}
        <div style={{marginTop:10}}><GoalPicker goals={goals} selected={form.goals} onChange={g=>setForm(f=>({...f,goals:g}))}/></div>
        <div style={{marginTop:10}}><AttachArea attachments={form.attachments} onChange={a=>setForm(f=>({...f,attachments:a}))}/></div>
        </Card>
        <Card style={{marginBottom:12}}><SH><Tip k="WSJF">Egen WSJF-vurdering</Tip></SH><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>{WSJF_DIMS.map(d=><Sl key={d.key} label={d.label} id={`sw-${d.key}`} value={form[d.key]} onChange={e=>setForm(f=>({...f,[d.key]:parseInt(e.target.value)}))}/>)}</div><div style={{marginTop:8,padding:"6px 10px",background:C.surfaceAlt,borderRadius:7,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:11,color:C.textSec}}><Tip k="WSJF">Din WSJF</Tip></span><span style={{fontSize:18,fontWeight:800,color:C.primary}}>{calcWsjf(form)}</span></div></Card>
        <div style={{display:"flex",justifyContent:"flex-end",gap:6}}><Btn variant="secondary" onClick={()=>setForm(emptyForm)} style={{background:C.surfaceAlt,color:C.primary}}>Nullstill</Btn><Btn type="submit">Send inn forslag</Btn></div>
        </form></div>}

      {role==="employee"&&tab==="my"&&<div><h1 style={{fontSize:20,fontWeight:700,color:C.primary,margin:"0 0 12px"}}>Mine forslag</h1>
        {tasks.filter(t=>!t.archived).length===0?<Card><Empty icon="📋" text="Ingen forslag ennå."/></Card>
        :tasks.filter(t=>!t.archived).slice(0,15).map(t=>{const st=stMap[t.status];return <Card key={t.id} style={{borderLeft:`4px solid ${st?.color}`,padding:"10px 14px",marginBottom:6}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:4}}><div><div style={{fontWeight:600,fontSize:13}}>{t.title}</div><div style={{fontSize:10,color:C.textMuted}}>{t.date} · {t.submitterDept}</div></div><Badge color={st?.color} bg={st?.bg}>{st?.label}</Badge></div></Card>;})}</div>}

      {role==="forum"&&tab==="inbox"&&<div><h1 style={{fontSize:20,fontWeight:700,color:C.primary,margin:"0 0 4px"}}>Innkomne ({unreviewed.length})</h1>
        {unreviewed.length===0?<Card><Empty icon="🎉" text="Alle vurdert!"/></Card>
        :<div style={{display:"flex",flexDirection:"column",gap:8}}>{unreviewed.map(t=><Card key={t.id} style={{borderLeft:`4px solid ${C.purple}`}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}><div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}><span style={{fontWeight:700,fontSize:13}}>{t.title}</span><Badge color={prMap[t.priority]?.color} bg={C.surfaceAlt} style={{fontSize:9}}>{prMap[t.priority]?.label}</Badge></div><p style={{fontSize:11,color:C.textSec,margin:"0 0 3px"}}>{t.desc||"—"}</p><div style={{fontSize:10,color:C.textMuted}}>{t.submitterName} · {t.processOwner&&`${t.processOwner} · `}{t.date}</div><div style={{marginTop:3,display:"flex",gap:3,flexWrap:"wrap"}}>{t.eqsRef&&<Badge color="#0891B2" bg="#E0F7FA" style={{fontSize:8}}>📋 {t.eqsRef}</Badge>}{t.personalData==="yes"&&<Badge color={C.danger} bg={C.dangerBg} style={{fontSize:8}}>🔒 Persondata</Badge>}{t.personalData==="unknown"&&<Badge color={C.warning} bg={C.warningBg} style={{fontSize:8}}>❓ Persondata?</Badge>}</div></div><div style={{display:"flex",gap:4}}><Btn variant="danger" onClick={()=>setModal({type:"delete",task:t})} style={{fontSize:10,padding:"4px 8px",background:C.dangerBg,color:C.danger}}>🗑️</Btn><Btn onClick={()=>setModal({type:"review",task:t})} style={{fontSize:10}}>Vurder →</Btn></div></div></Card>)}</div>}</div>}

      {role==="forum"&&tab==="review"&&<div><h1 style={{fontSize:20,fontWeight:700,color:C.primary,margin:"0 0 12px"}}>Alle ({activeTasks.length})</h1><label style={{fontSize:11,color:C.textMuted,display:"flex",gap:4,alignItems:"center",marginBottom:8}}><input type="checkbox" checked={showArchived} onChange={e=>setShowArchived(e.target.checked)}/>Vis arkiverte</label>
        {activeTasks.map(t=>{const st=stMap[t.status];return <Card key={t.id} style={{padding:"10px 14px",borderLeft:`4px solid ${t.reviewed?C.success:C.purple}`,marginBottom:5,cursor:"pointer",opacity:t.archived?.6:1}} onClick={()=>setModal({type:"review",task:t})}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,flexWrap:"wrap"}}><div style={{flex:1}}><span style={{fontWeight:700,fontSize:12}}>{t.title}</span>{t.archived&&<Badge color={C.textMuted} bg={C.surfaceAlt} style={{fontSize:8,marginLeft:4}}>Arkiv</Badge>}<div style={{display:"flex",gap:3,marginTop:2}}>{(t.tracks||[]).map(tr=><TBadge key={tr} id={tr}/>)}</div></div><div style={{display:"flex",gap:6,alignItems:"center"}}><span style={{fontSize:13,fontWeight:800,color:C.primary}}>{composite(t)}</span><Badge color={st?.color} bg={st?.bg}>{st?.label}</Badge>{!t.archived&&(t.status==="done"||t.status==="rejected")&&<Btn variant="ghost" onClick={e=>{e.stopPropagation();archiveTask(t.id);}} style={{fontSize:9,padding:"2px 5px",color:C.textSec}}>📦</Btn>}</div></div></Card>;})}</div>}


      {tab==="backlog"&&<div>
        <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8,marginBottom:10}}><h1 style={{fontSize:20,fontWeight:700,color:C.primary,margin:0}}>Backlog</h1><div style={{display:"flex",gap:4,flexWrap:"wrap",alignItems:"center"}}>
          <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="🔍 Søk..." style={{padding:"4px 8px",borderRadius:6,border:`1px solid ${C.border}`,fontSize:11,width:140,background:C.surface,color:C.text}}/>
          <select value={filterTrack} onChange={e=>setFilterTrack(e.target.value)} style={{padding:"4px 8px",borderRadius:6,border:`1px solid ${C.border}`,fontSize:10,background:C.surface,color:C.text}}><option value="all">Alle løyper</option>{TRACKS.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}</select>
          <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{padding:"4px 8px",borderRadius:6,border:`1px solid ${C.border}`,fontSize:10,background:C.surface,color:C.text}}><option value="all">Alle statuser</option>{STATUSES.filter(s=>s.id!=="archived").map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select>
          {[["score","Score"],["priority","Prio"],["date","Dato"]].map(([k,l])=><Btn key={k} variant={sortBy===k?"primary":"secondary"} onClick={()=>setSortBy(k)} style={{padding:"4px 8px",fontSize:10,...(sortBy!==k?{background:C.surfaceAlt,color:C.primary}:{})}}>{l}</Btn>)}
          <label style={{fontSize:10,color:C.textMuted,display:"flex",gap:3,alignItems:"center"}}><input type="checkbox" checked={showArchived} onChange={e=>setShowArchived(e.target.checked)}/>Arkiv</label></div></div>
        {batchSel.length>0&&<div style={{marginBottom:8,padding:"6px 12px",background:C.primaryLight+"20",borderRadius:8,display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}><span style={{fontSize:11,fontWeight:600}}>{batchSel.length} valgt</span><select onChange={e=>{if(e.target.value)batchAction("status",e.target.value);e.target.value="";}} style={{fontSize:10,padding:"2px 6px",borderRadius:4,border:`1px solid ${C.border}`,background:C.surface,color:C.text}}><option value="">Status →</option>{STATUSES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select><Btn variant="success" onClick={()=>batchAction("sprint",true)} style={{fontSize:10,padding:"3px 8px",background:C.successBg,color:C.success}}>→Sprint</Btn><Btn variant="ghost" onClick={()=>batchAction("archive")} style={{fontSize:10,color:C.textSec}}>📦</Btn><Btn variant="ghost" onClick={()=>setBatchSel([])} style={{fontSize:10,color:C.textMuted}}>✕</Btn></div>}
        {sorted.filter(t=>t.reviewed).length===0?<Card><Empty icon="📋" text="Ingen oppgaver matcher."/></Card>
        :<Card style={{padding:0,overflow:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}><thead><tr style={{background:C.surfaceAlt,borderBottom:`2px solid ${C.primary}`}}>{[{h:"",t:""},{h:"#",t:""},{h:"Oppgave",t:""},{h:"Løype",t:""},{h:"Score",t:TIP.Score},{h:"V",t:TIP.V},{h:"H",t:TIP.H},{h:"Gf",t:TIP.Gf},{h:"SP",t:TIP.SP},{h:"Timer",t:"Faktisk medgått tid i timer"},{h:"Status",t:""},{h:"",t:""}].map((c,ci)=><th key={ci} title={c.t} style={{padding:"6px 4px",textAlign:"left",fontSize:8,fontWeight:700,color:C.textSec,textTransform:"uppercase",cursor:c.t?"help":"default",borderBottom:c.t?`1px dashed ${C.textMuted}55`:"none"}}>{c.h}</th>)}</tr></thead><tbody>{sorted.filter(t=>t.reviewed).map((t,i)=>{const sc=composite(t);const open=selectedTask===t.id;const pc=prMap[t.priority]?.color||C.textMuted;return <React.Fragment key={t.id}>
          <tr onClick={()=>setSelectedTask(open?null:t.id)} style={{cursor:"pointer",borderBottom:`1px solid ${C.border}`,background:open?C.surfaceAlt:i%2===0?C.surface:C.surfaceAlt+"80",borderLeft:`3px solid ${pc}`,opacity:t.archived?.5:1}}>
            <td style={{padding:"6px 3px"}} onClick={e=>e.stopPropagation()}><input type="checkbox" checked={batchSel.includes(t.id)} onChange={()=>setBatchSel(p=>p.includes(t.id)?p.filter(x=>x!==t.id):[...p,t.id])}/></td>
            <td style={{padding:"6px 3px",fontWeight:600,color:C.textMuted}}>{i+1}</td>
            <td style={{padding:"6px 3px"}}><div style={{fontWeight:600,...(t.parentId?{paddingLeft:14,fontSize:10}:{})}}>{t.parentId&&<span style={{color:C.textMuted,marginRight:3}}>↳</span>}{t.title}{(()=>{const sp=subProgress(t.id);return sp?<Badge color={C.accent} bg={C.accent+"10"} style={{fontSize:7,marginLeft:4}}>{sp.done}/{sp.total} del</Badge>:null;})()}</div><div style={{fontSize:9,color:C.textMuted,...(t.parentId?{paddingLeft:14}:{})}}>{t.submitterName}{t.processOwner&&` · ${t.processOwner}`}</div></td>
            <td style={{padding:"6px 3px"}}>{(t.tracks||[]).map(tr=><TBadge key={tr} id={tr}/>)}</td>
            <td style={{padding:"6px 3px"}}><span style={{fontSize:14,fontWeight:800,color:sc>200?C.success:sc>100?C.warning:C.danger}}>{sc}</span></td>
            <td style={{padding:"6px 3px"}}><SBar value={t.value}/></td><td style={{padding:"6px 3px"}}><SBar value={t.urgency}/></td><td style={{padding:"6px 3px"}}><SBar value={t.feasibility}/></td>
            <td style={{padding:"6px 3px"}} onClick={e=>e.stopPropagation()}>{role==="team"?<SPSel task={t}/>:<span style={{fontWeight:700,color:C.textSec}}>{t.size||"–"}</span>}</td>
            <td style={{padding:"6px 3px",fontSize:10,color:C.textMuted}}>{t.actualHours?`${t.actualHours}t`:"–"}</td>
            <td style={{padding:"6px 3px"}} onClick={e=>e.stopPropagation()}><StSel task={t}/></td>
            <td style={{padding:"6px 3px"}} onClick={e=>e.stopPropagation()}><Btn variant="ghost" onClick={()=>setModal({type:"review",task:t})} style={{fontSize:9,padding:"2px 5px",color:C.textSec}}>✏️</Btn></td></tr>
          {open&&<tr><td colSpan={12} style={{padding:"10px 14px",background:C.surfaceAlt,borderBottom:`1px solid ${C.border}`}}><p style={{fontSize:11,color:C.textSec,margin:"0 0 6px"}}>{t.desc}</p>{t.personalData==="yes"&&<div style={{marginBottom:6,padding:"4px 8px",background:C.dangerBg,borderRadius:6,fontSize:10,color:C.danger}}>🔒 DPIA – <a href={config.dpiaLink} target="_blank" rel="noopener" style={{color:C.danger}}>Mal</a></div>}<div style={{display:"flex",gap:4,marginBottom:6}}><Btn variant={t.sprint?"danger":"success"} style={{fontSize:10,padding:"4px 10px",...(t.sprint?{background:C.dangerBg,color:C.danger}:{background:C.successBg,color:C.success})}} onClick={e=>{e.stopPropagation();updateTask(t.id,{sprint:!t.sprint});}}>{t.sprint?"Fjern":"→Sprint"}</Btn>{!t.archived&&(t.status==="done"||t.status==="rejected")&&<Btn variant="ghost" style={{fontSize:10,color:C.textSec}} onClick={e=>{e.stopPropagation();archiveTask(t.id);}}>📦</Btn>}</div><CommentsPanel task={t} role={role} onAdd={txt=>addComment(t.id,txt)}/><HistoryPanel task={t}/></td></tr>}
        </React.Fragment>;})}</tbody></table></Card>}</div>}

      {tab==="sprint"&&<div>
        <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:10,marginBottom:12}}><div><h1 style={{fontSize:20,fontWeight:700,color:C.primary,margin:0}}>{config.sprintName}</h1><p style={{fontSize:12,color:C.textSec,margin:0}}>{config.sprintStart} – {config.sprintEnd}</p></div>
          <div style={{display:"flex",gap:14,alignItems:"center"}}><div style={{width:54,height:54,borderRadius:"50%",border:`4px solid ${C.surfaceAlt}`,background:`conic-gradient(${C.success} ${sprintPct*3.6}deg, ${C.surfaceAlt} 0deg)`,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:40,height:40,borderRadius:"50%",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:C.primary}}>{sprintPct}%</div></div><div style={{textAlign:"center"}}><div style={{fontSize:22,fontWeight:800,color:C.primary}}>{doneSP}/{totalSP}</div><div style={{fontSize:8,color:C.textMuted}}>SP</div></div><div style={{textAlign:"center"}}><div style={{fontSize:22,fontWeight:800,color:C.success}}>{Math.round(totalCap)}t</div><div style={{fontSize:8,color:C.textMuted}}>KAP</div></div></div></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>{[["ready","Klar"],["in-progress","Pågår"],["blocked","Blokkert"],["done","Ferdig"]].map(([st,lb])=>{const col=sprintTasks.filter(t=>t.status===st);const s=stMap[st];return <div key={st} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();if(dragTask){updateTask(dragTask,{status:st});setDragTask(null);}}}>
          <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:6}}><div style={{width:8,height:8,borderRadius:"50%",background:s?.color}}/><span style={{fontSize:12,fontWeight:700}}>{lb}</span><span style={{marginLeft:"auto",fontSize:10,fontWeight:600,color:C.textMuted,background:C.surfaceAlt,padding:"1px 7px",borderRadius:14}}>{col.length}</span></div>
          <div style={{display:"flex",flexDirection:"column",gap:5,minHeight:60}}>{col.map(t=><Card key={t.id} draggable onDragStart={()=>setDragTask(t.id)} onClick={()=>setModal({type:"review",task:t})} style={{padding:8,borderLeft:`3px solid ${(t.tracks||[])[0]?TRACKS.find(x=>x.id===t.tracks[0])?.color:C.border}`,cursor:"grab"}}><div style={{fontSize:11,fontWeight:600,marginBottom:3}}>{t.parentId&&<span style={{fontSize:9,color:C.textMuted}}>↳ </span>}{t.title}</div><div style={{display:"flex",justifyContent:"space-between"}}><div style={{display:"flex",gap:2}}>{(t.tracks||[]).map(tr=><TBadge key={tr} id={tr}/>)}</div><span style={{fontSize:10,fontWeight:700,color:C.textMuted}}>{t.size}SP</span></div>{t.actualHours>0&&<div style={{fontSize:9,color:C.textMuted,marginTop:2}}>⏱ {t.actualHours}t</div>}{(()=>{const sp=subProgress(t.id);return sp?<div style={{marginTop:3}}><div style={{height:3,borderRadius:2,background:C.surfaceAlt}}><div style={{height:3,borderRadius:2,background:sp.pct===100?C.success:C.accent,width:`${sp.pct}%`}}/></div><div style={{fontSize:8,color:C.textMuted,marginTop:1}}>{sp.done}/{sp.total} del</div></div>:null;})()}</Card>)}{!col.length&&<div style={{padding:14,textAlign:"center",fontSize:10,color:C.textMuted,background:C.surfaceAlt,borderRadius:7,border:`1px dashed ${C.border}`}}>Slipp her</div>}</div></div>;})}</div></div>}

      {tab==="capacity"&&<div><h1 style={{fontSize:20,fontWeight:700,color:C.primary,margin:"0 0 4px"}}>Kapasitet – {config.sprintName}</h1><p style={{fontSize:12,color:C.textSec,margin:"0 0 12px"}}>37,5 t/uke × {config.sprintWeeks} uker · {team.length} medlemmer · {Math.round(totalCap)}t</p>
        <Card style={{marginBottom:12,background:C.surfaceAlt}}><div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr auto",gap:8,alignItems:"end"}}><TF label="Navn" id="tm-n" value={memberForm.name} onChange={e=>setMemberForm(f=>({...f,name:e.target.value}))} placeholder="Nytt medlem"/><TF label="Stilling" id="tm-r" value={memberForm.role} onChange={e=>setMemberForm(f=>({...f,role:e.target.value}))} placeholder="Backend"/><SF label="Løype" id="tm-t" value={memberForm.track} onChange={e=>setMemberForm(f=>({...f,track:e.target.value}))}>{TRACKS.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}</SF><TF label="%" id="tm-a" type="number" value={memberForm.availability} onChange={e=>setMemberForm(f=>({...f,availability:parseInt(e.target.value)||0}))}/><Btn onClick={()=>{if(!memberForm.name)return;setTeam(p=>[...p,{...memberForm,id:`m${Date.now()}`,skills:[memberForm.role]}]);setMemberForm({name:"",role:"",availability:100,skills:[],track:"sysdev"});notify("Lagt til.");}}>+</Btn></div></Card>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:10}}>{team.map(m=>{const hrs=autoHours(m.availability,config.sprintWeeks);const tr=TRACKS.find(x=>x.id===m.track);const isEd=editMember===m.id;return <Card key={m.id}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><div style={{width:34,height:34,borderRadius:8,background:C.surfaceAlt,border:`2px solid ${tr?.color||C.primaryLight}`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:12,color:C.primary}}>{m.name.split(" ").map(n=>n[0]).join("")}</div><div style={{flex:1}}>{isEd?<div style={{display:"flex",flexDirection:"column",gap:3}}><input value={m.name} onChange={e=>setTeam(p=>p.map(x=>x.id===m.id?{...x,name:e.target.value}:x))} style={{fontSize:12,fontWeight:700,border:`1px solid ${C.border}`,borderRadius:4,padding:"2px 6px",background:C.surface,color:C.text}}/><input value={m.role} onChange={e=>setTeam(p=>p.map(x=>x.id===m.id?{...x,role:e.target.value}:x))} style={{fontSize:10,border:`1px solid ${C.border}`,borderRadius:4,padding:"2px 6px",background:C.surface,color:C.text}}/><div style={{display:"flex",gap:3}}><select value={m.track||""} onChange={e=>setTeam(p=>p.map(x=>x.id===m.id?{...x,track:e.target.value}:x))} style={{fontSize:10,border:`1px solid ${C.border}`,borderRadius:4,padding:"2px 4px",background:C.surface,color:C.text}}>{TRACKS.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}</select><input type="number" value={m.availability} onChange={e=>setTeam(p=>p.map(x=>x.id===m.id?{...x,availability:parseInt(e.target.value)||0}:x))} style={{width:50,fontSize:10,border:`1px solid ${C.border}`,borderRadius:4,padding:"2px 4px",background:C.surface,color:C.text}}/></div><div style={{display:"flex",gap:2,flexWrap:"wrap"}}>{SKILLS_LIST.map(sk=>{const has=(m.skills||[]).includes(sk);return <button key={sk} type="button" onClick={()=>setTeam(p=>p.map(x=>x.id===m.id?{...x,skills:has?(x.skills||[]).filter(s=>s!==sk):[...(x.skills||[]),sk]}:x))} style={{padding:"1px 6px",borderRadius:4,border:`1px solid ${has?C.primary:C.border}`,background:has?C.primary+"10":"transparent",color:has?C.primary:C.textMuted,fontSize:9,cursor:"pointer"}}>{sk}{has&&" ✓"}</button>;})}</div></div>:<div><div style={{fontSize:12,fontWeight:700}}>{m.name}</div><div style={{fontSize:10,color:C.textMuted}}>{m.role} · {m.availability}% · {tr&&<span style={{color:tr.color}}>{tr.icon} {tr.label}</span>}</div></div>}</div><div style={{display:"flex",flexDirection:"column",gap:3,alignItems:"flex-end"}}><div style={{fontSize:16,fontWeight:800,color:C.primary}}>{hrs}t</div><div style={{display:"flex",gap:3}}><Btn variant="ghost" onClick={()=>setEditMember(isEd?null:m.id)} style={{fontSize:9,padding:"2px 6px",color:C.textSec}}>{isEd?"✓":"✏️"}</Btn><Btn variant="ghost" onClick={()=>{if(confirm(`Fjerne ${m.name}?`))setTeam(p=>p.filter(x=>x.id!==m.id));}} style={{fontSize:9,padding:"2px 6px",color:C.danger}}>🗑️</Btn></div></div></div><div style={{display:"flex",gap:2,flexWrap:"wrap"}}>{(m.skills||[]).map(s=><Badge key={s} color={C.primary} bg={C.surfaceAlt} style={{fontSize:8}}>{s}</Badge>)}</div></Card>;})}</div></div>}

      {tab==="dashboard"&&<div><h1 style={{fontSize:20,fontWeight:700,color:C.primary,margin:"0 0 14px"}}>Dashboard</h1>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>{[{l:"Velocity",v:`${SPRINTS[SPRINTS.length-1].d} SP`,t:TIP.Velocity},{l:"Sprint",v:`${sprintPct}%`},{l:"Kapasitet",v:`${Math.round(totalCap)}t`},{l:"Aktive",v:`${tasks.filter(t=>!t.archived).length}`}].map((k,i)=><Card key={i} style={{borderTop:`3px solid ${C.primary}`}}><div style={{fontSize:8,color:C.textMuted,fontWeight:600,textTransform:"uppercase",marginBottom:3,cursor:k.t?"help":"default",borderBottom:k.t?`1px dashed ${C.textMuted}55`:"none",display:"inline-block"}} title={k.t||""}>{k.l}</div><span style={{fontSize:22,fontWeight:800,color:C.primary}}>{k.v}</span></Card>)}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}><Card><h2 style={{fontSize:12,fontWeight:700,color:C.primary,margin:"0 0 10px"}}>Per løype</h2>{TRACKS.map(tr=>{const c=tasks.filter(t=>(t.tracks||[]).includes(tr.id)&&!t.archived).length;const p=Math.round(c/Math.max(tasks.filter(t=>!t.archived).length,1)*100);return <div key={tr.id} style={{marginBottom:5}}><div style={{display:"flex",justifyContent:"space-between",fontSize:10,marginBottom:1}}><span>{tr.icon} {tr.label}</span><span style={{fontWeight:700}}>{c}</span></div><div style={{height:5,borderRadius:3,background:C.surfaceAlt}}><div style={{height:5,borderRadius:3,background:tr.color,width:p+"%"}}/></div></div>;})}</Card><Card><h2 style={{fontSize:12,fontWeight:700,color:C.primary,margin:"0 0 10px"}} title={TIP.Velocity}><Tip k="Velocity">Velocity</Tip></h2><div style={{display:"flex",alignItems:"flex-end",gap:5,height:100}}>{SPRINTS.map((d,i)=><div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}><span style={{fontSize:9,fontWeight:700,color:C.textSec}}>{d.d}</span><div style={{width:"100%",maxWidth:32,borderRadius:"3px 3px 0 0",background:C.primary,height:(d.d/45)*80}}/><span style={{fontSize:8,color:C.textMuted}}>{d.s}</span></div>)}</div></Card></div>
        <Card><h2 style={{fontSize:12,fontWeight:700,color:C.primary,margin:"0 0 10px"}}>Mål-fremgang</h2>{goals.filter(g=>!g.parent).map(main=>{const allIds=[main.id,...goals.filter(g=>g.parent===main.id).map(g=>g.id)];const linked=tasks.filter(t=>!t.archived&&(t.goals||[]).some(g=>allIds.includes(g)));const done=linked.filter(t=>t.status==="done").length;const pct=linked.length?Math.round(done/linked.length*100):0;return <div key={main.id} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:2}}><span style={{fontWeight:600}}>🎯 {main.title}</span><span style={{fontWeight:700,color:C.primary}}>{done}/{linked.length} ({pct}%)</span></div><div style={{height:6,borderRadius:3,background:C.surfaceAlt}}><div style={{height:6,borderRadius:3,background:pct>=100?C.success:pct>=50?C.accent:C.warning,width:`${pct}%`}}/></div></div>;})}</Card></div>}

      {tab==="goals"&&<div><h1 style={{fontSize:20,fontWeight:700,color:C.primary,margin:"0 0 4px"}}>Målregister</h1>
        <Card style={{marginBottom:12}}><SH>Nytt mål</SH><div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr auto",gap:8,alignItems:"end"}}><TF label="Tittel" id="g-t" value={goalForm.title} onChange={e=>setGoalForm(f=>({...f,title:e.target.value}))} placeholder="Nytt mål"/><SF label="Type" id="g-ty" value={goalForm.type} onChange={e=>setGoalForm(f=>({...f,type:e.target.value}))}><option value="Hovedmål">Hovedmål</option><option value="Delmål">Delmål</option></SF><SF label="Over" id="g-p" value={goalForm.parent} onChange={e=>setGoalForm(f=>({...f,parent:e.target.value}))}><option value="">Topp</option>{goals.filter(g=>g.type==="Hovedmål").map(g=><option key={g.id} value={g.id}>{g.title}</option>)}</SF><Btn onClick={()=>{if(!goalForm.title)return;setGoals(p=>[...p,{id:`G-${String(p.length+1).padStart(2,"0")}`,title:goalForm.title,type:goalForm.type,parent:goalForm.parent||null}]);setGoalForm({title:"",type:"Hovedmål",parent:""});notify("Mål opprettet.");}}>+</Btn></div></Card>
        <Card>{goals.filter(g=>!g.parent).map(main=>{const subs=goals.filter(g=>g.parent===main.id);const allIds=[main.id,...subs.map(g=>g.id)];const linked=tasks.filter(t=>!t.archived&&(t.goals||[]).some(g=>allIds.includes(g)));const done=linked.filter(t=>t.status==="done").length;return <div key={main.id} style={{marginBottom:12}}><div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}`}}><span style={{fontWeight:700,fontSize:13,color:C.primary}}>🎯 {main.title}</span><div style={{display:"flex",gap:4}}><Badge color={C.success} bg={C.successBg} style={{fontSize:8}}>{done}/{linked.length}</Badge><Btn variant="ghost" onClick={()=>setGoals(p=>p.filter(g=>g.id!==main.id&&g.parent!==main.id))} style={{fontSize:9,padding:"1px 4px",color:C.danger}}>🗑️</Btn></div></div>{subs.map(sub=><div key={sub.id} style={{display:"flex",justifyContent:"space-between",padding:"5px 0 5px 24px",borderBottom:`1px solid ${C.border}15`}}><span style={{fontSize:12}}>↳ {sub.title}</span><div style={{display:"flex",gap:4}}><Badge color={C.textMuted} bg={C.surfaceAlt} style={{fontSize:8}}>{tasks.filter(t=>!t.archived&&(t.goals||[]).includes(sub.id)).length}</Badge><Btn variant="ghost" onClick={()=>setGoals(p=>p.filter(g=>g.id!==sub.id))} style={{fontSize:9,padding:"1px 4px",color:C.danger}}>🗑️</Btn></div></div>)}</div>;})}</Card></div>}

      {tab==="config"&&<div style={{maxWidth:760,margin:"0 auto"}}><h1 style={{fontSize:20,fontWeight:700,color:C.primary,margin:"0 0 12px"}}>Konfigurasjon</h1>
        <Card style={{marginBottom:12}}><SH>Sprint</SH><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10}}><TF label="Navn" id="c-n" value={config.sprintName} onChange={e=>setConfig(c=>({...c,sprintName:e.target.value}))}/><TF label="Start" id="c-s" type="date" value={config.sprintStart} onChange={e=>setConfig(c=>({...c,sprintStart:e.target.value}))}/><TF label="Slutt" id="c-e" type="date" value={config.sprintEnd} onChange={e=>setConfig(c=>({...c,sprintEnd:e.target.value}))}/><TF label="Uker" id="c-w" type="number" value={config.sprintWeeks} onChange={e=>setConfig(c=>({...c,sprintWeeks:parseInt(e.target.value)||2}))}/></div><p style={{fontSize:10,color:C.textMuted,marginTop:6}}>Timer = allokering% × 37,5 × {config.sprintWeeks} uker</p></Card>
        <Card style={{marginBottom:12}}><SH>E-postvarsling</SH><div style={{display:"flex",gap:12,marginBottom:8,flexWrap:"wrap"}}>{[["emailNotifications","Aktiver"],["emailOnStatusChange","Statusendring"],["emailOnReview","Vurdering"],["notifyProcessOwner","Varsle prosesseier"]].map(([k,l])=><label key={k} style={{display:"flex",alignItems:"center",gap:4,fontSize:12,cursor:"pointer"}}><input type="checkbox" checked={config[k]} onChange={e=>setConfig(c=>({...c,[k]:e.target.checked}))}/>{l}</label>)}</div><TF label="Adresser (komma)" id="c-em" value={config.notifyEmails.join(", ")} onChange={e=>setConfig(c=>({...c,notifyEmails:e.target.value.split(",").map(s=>s.trim()).filter(Boolean)}))}/></Card>
        <Card style={{marginBottom:12}}><SH>DPIA / Personvern</SH><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><TF label="DPIA-mal lenke" id="c-dp" value={config.dpiaLink} onChange={e=>setConfig(c=>({...c,dpiaLink:e.target.value}))}/><TF label="EQS DPIA-ref" id="c-de" value={config.dpiaEqsRef} onChange={e=>setConfig(c=>({...c,dpiaEqsRef:e.target.value}))}/></div><p style={{fontSize:10,color:C.textMuted,marginTop:4}}>Vises automatisk ved persondata=Ja.</p></Card>
        <Card style={{marginBottom:12}}><SH>Scoringsvekter</SH><input type="range" min={10} max={90} value={config.scoringWeights.wsjf} onChange={e=>setConfig(c=>({...c,scoringWeights:{wsjf:parseInt(e.target.value),trackSpecific:100-parseInt(e.target.value)}}))} style={{width:"100%",accentColor:C.primary}}/><div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.textMuted}}><span>WSJF: {config.scoringWeights.wsjf}%</span><span>Løype: {config.scoringWeights.trackSpecific}%</span></div></Card>

        {/* ══ Tilgangsstyring / Azure AD ══ */}
        <Card style={{marginBottom:12,border:`1px solid ${config.auth?.enabled?C.success+40:C.border}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <SH style={{margin:0}}>🔐 Tilgangsstyring – Microsoft Entra ID</SH>
            <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer"}}><span style={{fontSize:11,fontWeight:600,color:config.auth?.enabled?C.success:C.textMuted}}>{config.auth?.enabled?"Aktiv":"Inaktiv"}</span><div onClick={()=>setConfig(c=>({...c,auth:{...(c.auth||INIT_CONFIG.auth),enabled:!c.auth?.enabled}}))} style={{width:40,height:22,borderRadius:11,background:config.auth?.enabled?C.success:C.border,cursor:"pointer",position:"relative",transition:"background .2s"}}><div style={{width:18,height:18,borderRadius:9,background:"#fff",position:"absolute",top:2,left:config.auth?.enabled?20:2,transition:"left .2s",boxShadow:"0 1px 3px rgba(0,0,0,.2)"}}/></div></label>
          </div>

          {!config.auth?.enabled&&<div style={{padding:"14px 16px",background:C.surfaceAlt,borderRadius:8,border:`1px dashed ${C.border}`}}>
            <p style={{fontSize:12,color:C.textSec,margin:"0 0 6px"}}>Tilgangsstyring er deaktivert. Alle brukere velger rolle manuelt via rolleveksler i header.</p>
            <p style={{fontSize:11,color:C.textMuted,margin:0}}>Aktiver for å koble til Microsoft Entra ID (Azure AD) og styre tilgang basert på AD-grupper.</p>
          </div>}

          {config.auth?.enabled&&<div>
            {/* Connection status */}
            <div style={{padding:"8px 12px",background:config.auth?.tenantId&&config.auth?.clientId?C.successBg:C.warningBg,borderRadius:7,marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:16}}>{config.auth?.tenantId&&config.auth?.clientId?"✅":"⚠️"}</span>
              <div><div style={{fontSize:11,fontWeight:700,color:config.auth?.tenantId&&config.auth?.clientId?C.success:C.warning}}>{config.auth?.tenantId&&config.auth?.clientId?"Konfigurert – klar til aktivering":"Mangler påkrevde felter"}</div><div style={{fontSize:10,color:C.textMuted}}>Provider: Microsoft Entra ID (Azure AD)</div></div>
            </div>

            {/* Tenant + Client */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <div title="Directory (tenant) ID fra Azure Portal → App-registreringer"><TF label="Tenant ID (Katalog-ID) *" id="c-tenant" value={config.auth?.tenantId||""} onChange={e=>setConfig(c=>({...c,auth:{...c.auth,tenantId:e.target.value}}))} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"/></div>
              <div title="Application (client) ID fra Azure Portal → App-registreringer"><TF label="Client ID (Applikasjons-ID) *" id="c-client" value={config.auth?.clientId||""} onChange={e=>setConfig(c=>({...c,auth:{...c.auth,clientId:e.target.value}}))} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"/></div>
            </div>

            {/* Allowed domains */}
            <div style={{marginBottom:10}}><TF label="Tillatte e-postdomener (komma)" id="c-domains" value={(config.auth?.allowedDomains||[]).join(", ")} onChange={e=>setConfig(c=>({...c,auth:{...c.auth,allowedDomains:e.target.value.split(",").map(s=>s.trim()).filter(Boolean)}}))} placeholder="hemit.no, helse-midt.no"/><p style={{fontSize:9,color:C.textMuted,margin:"3px 0 0"}}>Kun brukere med disse domenene kan logge inn. La stå tomt for å tillate alle.</p></div>

            {/* Security options */}
            <div style={{display:"flex",gap:14,marginBottom:12,flexWrap:"wrap"}}>
              <label style={{display:"flex",alignItems:"center",gap:5,fontSize:12,cursor:"pointer"}}><input type="checkbox" checked={config.auth?.requireMfa||false} onChange={e=>setConfig(c=>({...c,auth:{...c.auth,requireMfa:e.target.checked}}))}/>Krev MFA (multifaktor)</label>
              <label style={{display:"flex",alignItems:"center",gap:5,fontSize:12,cursor:"pointer"}}><input type="checkbox" checked={config.auth?.autoProvision!==false} onChange={e=>setConfig(c=>({...c,auth:{...c.auth,autoProvision:e.target.checked}}))}/>Auto-opprett brukere ved første innlogging</label>
              <div style={{display:"flex",alignItems:"center",gap:5}}><label style={{fontSize:12}} htmlFor="c-timeout">Sesjonstid (min):</label><input type="number" id="c-timeout" value={config.auth?.sessionTimeout||480} onChange={e=>setConfig(c=>({...c,auth:{...c.auth,sessionTimeout:parseInt(e.target.value)||480}}))} style={{width:60,padding:"4px 6px",borderRadius:6,border:`1px solid ${C.border}`,fontSize:12,background:C.surface,color:C.text}} min={15} max={1440}/></div>
            </div>

            {/* Role mappings */}
            <div style={{border:`1px solid ${C.border}`,borderRadius:8,padding:12,marginBottom:10,background:C.bg}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><h4 style={{fontSize:12,fontWeight:700,color:C.primary,margin:0}}>Rollemapping – AD-grupper → Roller</h4><Btn style={{fontSize:10,padding:"4px 10px"}} onClick={()=>setConfig(c=>({...c,auth:{...c.auth,roleMappings:[...(c.auth?.roleMappings||[]),{id:`rm${Date.now()}`,groupId:"",groupName:"",role:"employee"}]}}))}>+ Legg til</Btn></div>
              <p style={{fontSize:10,color:C.textMuted,margin:"0 0 8px"}}>Koble Azure AD-sikkerhetsgrupper til roller i verktøyet. Brukere som ikke matcher noen gruppe får standardrollen.</p>
              <div style={{display:"grid",gridTemplateColumns:"2fr 2fr 1fr auto",gap:6,marginBottom:4,fontSize:9,fontWeight:700,color:C.textMuted,textTransform:"uppercase",padding:"0 2px"}}><span>Azure AD Gruppe-ID</span><span>Gruppenavn (valgfri)</span><span>Rolle</span><span></span></div>
              {(config.auth?.roleMappings||[]).map((rm,ri)=><div key={rm.id} style={{display:"grid",gridTemplateColumns:"2fr 2fr 1fr auto",gap:6,marginBottom:4,alignItems:"center"}}>
                <input value={rm.groupId} onChange={e=>{const m=[...(config.auth?.roleMappings||[])];m[ri]={...m[ri],groupId:e.target.value};setConfig(c=>({...c,auth:{...c.auth,roleMappings:m}}));}} placeholder="xxxxxxxx-xxxx-..." style={{padding:"5px 8px",borderRadius:5,border:`1px solid ${C.border}`,fontSize:11,background:C.surface,color:C.text,fontFamily:"monospace"}}/>
                <input value={rm.groupName} onChange={e=>{const m=[...(config.auth?.roleMappings||[])];m[ri]={...m[ri],groupName:e.target.value};setConfig(c=>({...c,auth:{...c.auth,roleMappings:m}}));}} placeholder="Gruppenavn" style={{padding:"5px 8px",borderRadius:5,border:`1px solid ${C.border}`,fontSize:11,background:C.surface,color:C.text}}/>
                <select value={rm.role} onChange={e=>{const m=[...(config.auth?.roleMappings||[])];m[ri]={...m[ri],role:e.target.value};setConfig(c=>({...c,auth:{...c.auth,roleMappings:m}}));}} style={{padding:"5px 6px",borderRadius:5,border:`1px solid ${rm.role==="admin"?C.danger:rm.role==="forum"?C.purple:rm.role==="team"?C.accent:C.border}`,fontSize:11,background:C.surface,color:C.text}}>
                  <option value="employee">Medarbeider</option>
                  <option value="forum">Utviklingsforum</option>
                  <option value="team">Leveranseteam</option>
                  <option value="admin">Administrator</option>
                </select>
                <Btn variant="ghost" onClick={()=>setConfig(c=>({...c,auth:{...c.auth,roleMappings:(c.auth?.roleMappings||[]).filter((_,j)=>j!==ri)}}))} style={{fontSize:10,padding:"3px 8px",color:C.danger}}>🗑️</Btn>
              </div>)}
              <div style={{display:"flex",alignItems:"center",gap:6,marginTop:6,padding:"6px 8px",background:C.surfaceAlt,borderRadius:6}}><span style={{fontSize:11,color:C.textMuted}}>Standardrolle (ingen gruppematch):</span><select value={config.auth?.defaultRole||"employee"} onChange={e=>setConfig(c=>({...c,auth:{...c.auth,defaultRole:e.target.value}}))} style={{padding:"3px 6px",borderRadius:5,border:`1px solid ${C.border}`,fontSize:11,background:C.surface,color:C.text}}><option value="employee">Medarbeider</option><option value="team">Leveranseteam</option></select></div>
            </div>

            {/* Setup instructions */}
            <details style={{marginBottom:4}}>
              <summary style={{fontSize:11,fontWeight:700,color:C.accent,cursor:"pointer",padding:"4px 0"}}>📋 Oppsettguide – Azure Portal</summary>
              <div style={{fontSize:11,color:C.textSec,lineHeight:1.6,padding:"8px 12px",background:C.surfaceAlt,borderRadius:7,marginTop:4}}>
                <strong>1. App-registrering</strong><br/>
                Azure Portal → Microsoft Entra ID → App-registreringer → Ny registrering<br/>
                Navn: «Hemit Nyttestyring» · Omdirigerings-URI: <code style={{fontSize:10,background:C.bg,padding:"1px 4px",borderRadius:3}}>{`https://${config.auth?.clientId||"PROSJEKT"}.firebaseapp.com/__/auth/handler`}</code><br/><br/>
                <strong>2. Kopier ID-er</strong><br/>
                Oversikt → Application (client) ID → Lim inn i «Client ID» over<br/>
                Oversikt → Directory (tenant) ID → Lim inn i «Tenant ID» over<br/><br/>
                <strong>3. Klienthemmelighet</strong><br/>
                Sertifikater og hemmeligheter → Ny klienthemmelighet → Kopier verdi<br/>
                Firebase Console → Authentication → Microsoft → Lim inn Client ID + hemmelighet<br/><br/>
                <strong>4. API-tillatelser</strong><br/>
                API-tillatelser → Legg til → Microsoft Graph → Delegert:<br/>
                <code style={{fontSize:10}}>User.Read</code>, <code style={{fontSize:10}}>GroupMember.Read.All</code>, <code style={{fontSize:10}}>openid</code>, <code style={{fontSize:10}}>profile</code>, <code style={{fontSize:10}}>email</code><br/><br/>
                <strong>5. Sikkerhetsgrupper</strong><br/>
                Entra ID → Grupper → Kopier Object ID for hver gruppe → Lim inn i rollemapping over
              </div>
            </details>

            {/* Redirect URI helper */}
            {config.auth?.clientId&&<div style={{padding:"6px 10px",background:C.accent+"08",borderRadius:6,marginTop:6}}><div style={{fontSize:10,color:C.accent,fontWeight:600}}>Omdirigerings-URI for Azure:</div><code style={{fontSize:10,color:C.text,wordBreak:"break-all"}}>{`https://${config.auth?.clientId}.firebaseapp.com/__/auth/handler`}</code></div>}
          </div>}
        </Card>

        {/* ══ Azure DevOps-integrasjon ══ */}
        <Card style={{marginBottom:12,border:`1px solid ${config.azureDevOps?.enabled?C.accent+40:C.border}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <SH style={{margin:0}}>🔗 Azure DevOps-integrasjon</SH>
            <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer"}}><span style={{fontSize:11,fontWeight:600,color:config.azureDevOps?.enabled?C.accent:C.textMuted}}>{config.azureDevOps?.enabled?"Aktiv":"Inaktiv"}</span><div onClick={()=>setConfig(c=>({...c,azureDevOps:{...(c.azureDevOps||INIT_CONFIG.azureDevOps),enabled:!c.azureDevOps?.enabled}}))} style={{width:40,height:22,borderRadius:11,background:config.azureDevOps?.enabled?C.accent:C.border,cursor:"pointer",position:"relative",transition:"background .2s"}}><div style={{width:18,height:18,borderRadius:9,background:"#fff",position:"absolute",top:2,left:config.azureDevOps?.enabled?20:2,transition:"left .2s",boxShadow:"0 1px 3px rgba(0,0,0,.2)"}}/></div></label>
          </div>

          {!config.azureDevOps?.enabled&&<div style={{padding:"14px 16px",background:C.surfaceAlt,borderRadius:8,border:`1px dashed ${C.border}`}}>
            <p style={{fontSize:12,color:C.textSec,margin:"0 0 6px"}}>Azure DevOps-integrasjon er deaktivert.</p>
            <p style={{fontSize:11,color:C.textMuted,margin:0}}>Aktiver for å synkronisere forbedringsforslag som work items i Azure DevOps.</p>
          </div>}

          {config.azureDevOps?.enabled&&<div>
            {/* Connection status */}
            <div style={{padding:"8px 12px",background:config.azureDevOps?.orgUrl&&config.azureDevOps?.pat?C.successBg:C.warningBg,borderRadius:7,marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:16}}>{config.azureDevOps?.orgUrl&&config.azureDevOps?.pat?"✅":"⚠️"}</span>
              <div><div style={{fontSize:11,fontWeight:700,color:config.azureDevOps?.orgUrl&&config.azureDevOps?.pat?C.success:C.warning}}>{config.azureDevOps?.orgUrl&&config.azureDevOps?.pat?"Tilkoblingsinfo konfigurert":"Mangler påkrevde felter"}</div><div style={{fontSize:10,color:C.textMuted}}>Synkroniserer forbedringsforslag → Azure DevOps Work Items</div></div>
            </div>

            {/* Connection fields */}
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:10,marginBottom:10}}>
              <TF label="Organisasjons-URL *" id="c-ado-org" value={config.azureDevOps?.orgUrl||""} onChange={e=>setConfig(c=>({...c,azureDevOps:{...c.azureDevOps,orgUrl:e.target.value}}))} placeholder="https://dev.azure.com/hemit"/>
              <TF label="Standardprosjekt" id="c-ado-proj" value={config.azureDevOps?.defaultProject||""} onChange={e=>setConfig(c=>({...c,azureDevOps:{...c.azureDevOps,defaultProject:e.target.value}}))} placeholder="Nyttestyring"/>
            </div>
            <div style={{marginBottom:10}}>
              <TF label="Personal Access Token (PAT) *" id="c-ado-pat" value={config.azureDevOps?.pat||""} onChange={e=>setConfig(c=>({...c,azureDevOps:{...c.azureDevOps,pat:e.target.value}}))} placeholder="Lim inn PAT fra Azure DevOps"/>
              <p style={{fontSize:9,color:C.textMuted,margin:"3px 0 0"}}>Krever tillatelse: Work Items (Read & Write). Opprett via Azure DevOps → User Settings → Personal Access Tokens.</p>
            </div>

            {/* Work item settings */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
              <SF label="Work Item-type" id="c-ado-wit" value={config.azureDevOps?.workItemType||"User Story"} onChange={e=>setConfig(c=>({...c,azureDevOps:{...c.azureDevOps,workItemType:e.target.value}}))}>
                <option value="User Story">User Story</option>
                <option value="Bug">Bug</option>
                <option value="Task">Task</option>
                <option value="Feature">Feature</option>
                <option value="Epic">Epic</option>
              </SF>
              <TF label="Area Path" id="c-ado-area" value={config.azureDevOps?.areaPath||""} onChange={e=>setConfig(c=>({...c,azureDevOps:{...c.azureDevOps,areaPath:e.target.value}}))} placeholder="Prosjekt\Team"/>
              <TF label="Iteration Path" id="c-ado-iter" value={config.azureDevOps?.iterationPath||""} onChange={e=>setConfig(c=>({...c,azureDevOps:{...c.azureDevOps,iterationPath:e.target.value}}))} placeholder="Prosjekt\Sprint 27"/>
            </div>

            {/* Sync options */}
            <div style={{display:"flex",gap:14,marginBottom:12,flexWrap:"wrap"}}>
              <label style={{display:"flex",alignItems:"center",gap:5,fontSize:12,cursor:"pointer"}}><input type="checkbox" checked={config.azureDevOps?.syncWorkItems!==false} onChange={e=>setConfig(c=>({...c,azureDevOps:{...c.azureDevOps,syncWorkItems:e.target.checked}}))}/>Synkroniser work items</label>
              <label style={{display:"flex",alignItems:"center",gap:5,fontSize:12,cursor:"pointer"}}><input type="checkbox" checked={config.azureDevOps?.syncOnStatusChange!==false} onChange={e=>setConfig(c=>({...c,azureDevOps:{...c.azureDevOps,syncOnStatusChange:e.target.checked}}))}/>Synk ved statusendring</label>
            </div>

            {/* Status mapping */}
            <div style={{border:`1px solid ${C.border}`,borderRadius:8,padding:12,marginBottom:10,background:C.bg}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><h4 style={{fontSize:12,fontWeight:700,color:C.primary,margin:0}}>Statusmapping – App → DevOps</h4><Btn style={{fontSize:10,padding:"4px 10px"}} onClick={()=>setConfig(c=>({...c,azureDevOps:{...c.azureDevOps,statusMapping:[...(c.azureDevOps?.statusMapping||[]),{id:`sm${Date.now()}`,appStatus:"",devOpsState:""}]}}))}>+ Legg til</Btn></div>
              <p style={{fontSize:10,color:C.textMuted,margin:"0 0 8px"}}>Koble applikasjonsstatus til Azure DevOps work item-tilstander.</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:6,marginBottom:4,fontSize:9,fontWeight:700,color:C.textMuted,textTransform:"uppercase",padding:"0 2px"}}><span>App-status</span><span>DevOps State</span><span></span></div>
              {(config.azureDevOps?.statusMapping||[]).map((sm,si)=><div key={sm.id} style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:6,marginBottom:4,alignItems:"center"}}>
                <select value={sm.appStatus} onChange={e=>{const m=[...(config.azureDevOps?.statusMapping||[])];m[si]={...m[si],appStatus:e.target.value};setConfig(c=>({...c,azureDevOps:{...c.azureDevOps,statusMapping:m}}));}} style={{padding:"5px 6px",borderRadius:5,border:`1px solid ${C.border}`,fontSize:11,background:C.surface,color:C.text}}>
                  <option value="">Velg...</option>
                  {STATUSES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                <input value={sm.devOpsState} onChange={e=>{const m=[...(config.azureDevOps?.statusMapping||[])];m[si]={...m[si],devOpsState:e.target.value};setConfig(c=>({...c,azureDevOps:{...c.azureDevOps,statusMapping:m}}));}} placeholder="f.eks. Active, Resolved" style={{padding:"5px 8px",borderRadius:5,border:`1px solid ${C.border}`,fontSize:11,background:C.surface,color:C.text}}/>
                <Btn variant="ghost" onClick={()=>setConfig(c=>({...c,azureDevOps:{...c.azureDevOps,statusMapping:(c.azureDevOps?.statusMapping||[]).filter((_,j)=>j!==si)}}))} style={{fontSize:10,padding:"3px 8px",color:C.danger}}>🗑️</Btn>
              </div>)}
            </div>

            {/* Setup guide */}
            <details style={{marginBottom:4}}>
              <summary style={{fontSize:11,fontWeight:700,color:C.accent,cursor:"pointer",padding:"4px 0"}}>📋 Oppsettguide – Azure DevOps</summary>
              <div style={{fontSize:11,color:C.textSec,lineHeight:1.6,padding:"8px 12px",background:C.surfaceAlt,borderRadius:7,marginTop:4}}>
                <strong>1. Opprett PAT</strong><br/>
                Azure DevOps → User Settings (øverst til høyre) → Personal Access Tokens → New Token<br/>
                Scope: Work Items – Read & Write · Organisasjon: velg din org<br/><br/>
                <strong>2. Finn organisasjons-URL</strong><br/>
                URL-en er på formatet <code style={{fontSize:10,background:C.bg,padding:"1px 4px",borderRadius:3}}>https://dev.azure.com/din-org</code><br/><br/>
                <strong>3. Prosjektoppsett</strong><br/>
                Opprett et prosjekt i Azure DevOps for å motta work items fra Nyttestyring.<br/>
                Konfigurer Area Path og Iteration Path etter behov.<br/><br/>
                <strong>4. Statusmapping</strong><br/>
                Map applikasjonsstatus til gyldige DevOps-tilstander for din prosessmal (Agile, Scrum, CMMI).
              </div>
            </details>
          </div>}
        </Card>

        {/* ══ ServiceNow-integrasjon ══ */}
        <Card style={{marginBottom:12,border:`1px solid ${config.serviceNow?.enabled?C.purple+40:C.border}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <SH style={{margin:0}}>🎫 ServiceNow-integrasjon</SH>
            <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer"}}><span style={{fontSize:11,fontWeight:600,color:config.serviceNow?.enabled?C.purple:C.textMuted}}>{config.serviceNow?.enabled?"Aktiv":"Inaktiv"}</span><div onClick={()=>setConfig(c=>({...c,serviceNow:{...(c.serviceNow||INIT_CONFIG.serviceNow),enabled:!c.serviceNow?.enabled}}))} style={{width:40,height:22,borderRadius:11,background:config.serviceNow?.enabled?C.purple:C.border,cursor:"pointer",position:"relative",transition:"background .2s"}}><div style={{width:18,height:18,borderRadius:9,background:"#fff",position:"absolute",top:2,left:config.serviceNow?.enabled?20:2,transition:"left .2s",boxShadow:"0 1px 3px rgba(0,0,0,.2)"}}/></div></label>
          </div>

          {!config.serviceNow?.enabled&&<div style={{padding:"14px 16px",background:C.surfaceAlt,borderRadius:8,border:`1px dashed ${C.border}`}}>
            <p style={{fontSize:12,color:C.textSec,margin:"0 0 6px"}}>ServiceNow-integrasjon er deaktivert.</p>
            <p style={{fontSize:11,color:C.textMuted,margin:0}}>Aktiver for å opprette og synkronisere incidents/change requests i ServiceNow.</p>
          </div>}

          {config.serviceNow?.enabled&&<div>
            {/* Connection status */}
            <div style={{padding:"8px 12px",background:config.serviceNow?.instanceUrl?C.successBg:C.warningBg,borderRadius:7,marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:16}}>{config.serviceNow?.instanceUrl?"✅":"⚠️"}</span>
              <div><div style={{fontSize:11,fontWeight:700,color:config.serviceNow?.instanceUrl?C.success:C.warning}}>{config.serviceNow?.instanceUrl?"Tilkoblingsinfo konfigurert":"Mangler instans-URL"}</div><div style={{fontSize:10,color:C.textMuted}}>Synkroniserer forbedringsforslag → ServiceNow-poster</div></div>
            </div>

            {/* Instance URL */}
            <div style={{marginBottom:10}}>
              <TF label="Instans-URL *" id="c-sn-url" value={config.serviceNow?.instanceUrl||""} onChange={e=>setConfig(c=>({...c,serviceNow:{...c.serviceNow,instanceUrl:e.target.value}}))} placeholder="https://hemit.service-now.com"/>
            </div>

            {/* Auth method */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 2fr 2fr",gap:10,marginBottom:10}}>
              <SF label="Autentisering" id="c-sn-auth" value={config.serviceNow?.authMethod||"basic"} onChange={e=>setConfig(c=>({...c,serviceNow:{...c.serviceNow,authMethod:e.target.value}}))}>
                <option value="basic">Basic Auth</option>
                <option value="oauth">OAuth 2.0</option>
              </SF>
              {config.serviceNow?.authMethod==="basic"&&<>
                <TF label="Brukernavn" id="c-sn-user" value={config.serviceNow?.username||""} onChange={e=>setConfig(c=>({...c,serviceNow:{...c.serviceNow,username:e.target.value}}))} placeholder="integrasjonsbruker"/>
                <TF label="Passord" id="c-sn-pass" value={config.serviceNow?.password||""} onChange={e=>setConfig(c=>({...c,serviceNow:{...c.serviceNow,password:e.target.value}}))} placeholder="••••••••"/>
              </>}
              {config.serviceNow?.authMethod==="oauth"&&<>
                <TF label="Client ID" id="c-sn-cid" value={config.serviceNow?.clientId||""} onChange={e=>setConfig(c=>({...c,serviceNow:{...c.serviceNow,clientId:e.target.value}}))} placeholder="OAuth Client ID"/>
                <TF label="Client Secret" id="c-sn-csec" value={config.serviceNow?.clientSecret||""} onChange={e=>setConfig(c=>({...c,serviceNow:{...c.serviceNow,clientSecret:e.target.value}}))} placeholder="OAuth Client Secret"/>
              </>}
            </div>

            {/* Table and sync settings */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
              <SF label="Tabell" id="c-sn-table" value={config.serviceNow?.table||"incident"} onChange={e=>setConfig(c=>({...c,serviceNow:{...c.serviceNow,table:e.target.value}}))}>
                <option value="incident">Incident</option>
                <option value="change_request">Change Request</option>
                <option value="sc_req_item">Requested Item</option>
                <option value="problem">Problem</option>
              </SF>
              <TF label="Assignment Group" id="c-sn-ag" value={config.serviceNow?.assignmentGroup||""} onChange={e=>setConfig(c=>({...c,serviceNow:{...c.serviceNow,assignmentGroup:e.target.value}}))} placeholder="IT Utvikling"/>
              <SF label="Kategori" id="c-sn-cat" value={config.serviceNow?.category||"Software"} onChange={e=>setConfig(c=>({...c,serviceNow:{...c.serviceNow,category:e.target.value}}))}>
                <option value="Software">Software</option>
                <option value="Hardware">Hardware</option>
                <option value="Network">Network</option>
                <option value="Database">Database</option>
                <option value="Inquiry / Help">Inquiry / Help</option>
              </SF>
            </div>

            {/* Sync options */}
            <div style={{display:"flex",gap:14,marginBottom:12,flexWrap:"wrap"}}>
              <label style={{display:"flex",alignItems:"center",gap:5,fontSize:12,cursor:"pointer"}}><input type="checkbox" checked={config.serviceNow?.syncIncidents!==false} onChange={e=>setConfig(c=>({...c,serviceNow:{...c.serviceNow,syncIncidents:e.target.checked}}))}/>Synkroniser incidents</label>
              <label style={{display:"flex",alignItems:"center",gap:5,fontSize:12,cursor:"pointer"}}><input type="checkbox" checked={config.serviceNow?.syncChangeRequests||false} onChange={e=>setConfig(c=>({...c,serviceNow:{...c.serviceNow,syncChangeRequests:e.target.checked}}))}/>Synkroniser change requests</label>
              <label style={{display:"flex",alignItems:"center",gap:5,fontSize:12,cursor:"pointer"}}><input type="checkbox" checked={config.serviceNow?.syncOnStatusChange!==false} onChange={e=>setConfig(c=>({...c,serviceNow:{...c.serviceNow,syncOnStatusChange:e.target.checked}}))}/>Synk ved statusendring</label>
            </div>

            {/* Status mapping */}
            <div style={{border:`1px solid ${C.border}`,borderRadius:8,padding:12,marginBottom:10,background:C.bg}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><h4 style={{fontSize:12,fontWeight:700,color:C.primary,margin:0}}>Statusmapping – App → ServiceNow</h4><Btn style={{fontSize:10,padding:"4px 10px"}} onClick={()=>setConfig(c=>({...c,serviceNow:{...c.serviceNow,statusMapping:[...(c.serviceNow?.statusMapping||[]),{id:`sn${Date.now()}`,appStatus:"",snowState:""}]}}))}>+ Legg til</Btn></div>
              <p style={{fontSize:10,color:C.textMuted,margin:"0 0 8px"}}>Koble applikasjonsstatus til ServiceNow-tilstander.</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:6,marginBottom:4,fontSize:9,fontWeight:700,color:C.textMuted,textTransform:"uppercase",padding:"0 2px"}}><span>App-status</span><span>ServiceNow State</span><span></span></div>
              {(config.serviceNow?.statusMapping||[]).map((sm,si)=><div key={sm.id} style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:6,marginBottom:4,alignItems:"center"}}>
                <select value={sm.appStatus} onChange={e=>{const m=[...(config.serviceNow?.statusMapping||[])];m[si]={...m[si],appStatus:e.target.value};setConfig(c=>({...c,serviceNow:{...c.serviceNow,statusMapping:m}}));}} style={{padding:"5px 6px",borderRadius:5,border:`1px solid ${C.border}`,fontSize:11,background:C.surface,color:C.text}}>
                  <option value="">Velg...</option>
                  {STATUSES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                <input value={sm.snowState} onChange={e=>{const m=[...(config.serviceNow?.statusMapping||[])];m[si]={...m[si],snowState:e.target.value};setConfig(c=>({...c,serviceNow:{...c.serviceNow,statusMapping:m}}));}} placeholder="f.eks. New, In Progress, Resolved" style={{padding:"5px 8px",borderRadius:5,border:`1px solid ${C.border}`,fontSize:11,background:C.surface,color:C.text}}/>
                <Btn variant="ghost" onClick={()=>setConfig(c=>({...c,serviceNow:{...c.serviceNow,statusMapping:(c.serviceNow?.statusMapping||[]).filter((_,j)=>j!==si)}}))} style={{fontSize:10,padding:"3px 8px",color:C.danger}}>🗑️</Btn>
              </div>)}
            </div>

            {/* Setup guide */}
            <details style={{marginBottom:4}}>
              <summary style={{fontSize:11,fontWeight:700,color:C.purple,cursor:"pointer",padding:"4px 0"}}>📋 Oppsettguide – ServiceNow</summary>
              <div style={{fontSize:11,color:C.textSec,lineHeight:1.6,padding:"8px 12px",background:C.surfaceAlt,borderRadius:7,marginTop:4}}>
                <strong>1. Integrasjonsbruker</strong><br/>
                ServiceNow → Brukeradministrasjon → Opprett en dedikert integrasjonsbruker<br/>
                Tildel rollen <code style={{fontSize:10,background:C.bg,padding:"1px 4px",borderRadius:3}}>itil</code> for å opprette/oppdatere incidents.<br/><br/>
                <strong>2. OAuth-oppsett (valgfritt)</strong><br/>
                System OAuth → Application Registry → Opprett OAuth-applikasjon<br/>
                Kopier Client ID og Client Secret til feltene over.<br/><br/>
                <strong>3. Instans-URL</strong><br/>
                URL-en er på formatet <code style={{fontSize:10,background:C.bg,padding:"1px 4px",borderRadius:3}}>https://din-instans.service-now.com</code><br/><br/>
                <strong>4. Assignment Group</strong><br/>
                Definer hvilken gruppe som skal motta opprettede saker.<br/>
                ServiceNow → Grupper → Kopier gruppenavnet til feltet over.<br/><br/>
                <strong>5. Statusmapping</strong><br/>
                Map applikasjonsstatus til gyldige ServiceNow-tilstander for valgt tabell.
              </div>
            </details>
          </div>}
        </Card>

        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><Btn variant="secondary" onClick={loadConfig} style={{background:C.surfaceAlt,color:C.primary}}>📥 Last inn</Btn><Btn onClick={saveConfig}>💾 Lagre</Btn></div></div>}

    </main>
    <footer style={{borderTop:`1px solid ${C.border}`,padding:"10px 18px",textAlign:"center",fontSize:10,color:C.textMuted}}>Hemit HF – Nyttestyringsverktøy v6.3 · 37,5 t/uke</footer>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700;800&display=swap');*,*::before,*::after{box-sizing:border-box;}input[type="range"]{height:5px;-webkit-appearance:none;background:transparent;}input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:${C.primary};cursor:pointer;border:2px solid ${C.surface};box-shadow:0 1px 3px rgba(0,0,0,.2);margin-top:-5px;}input[type="range"]::-webkit-slider-runnable-track{height:5px;border-radius:3px;background:${C.border};}@media(max-width:768px){main>div>div[style*="repeat(4"]{grid-template-columns:1fr 1fr!important;}header>div{flex-direction:column;height:auto!important;padding:8px!important;}}@media(max-width:640px){main>div>div[style*="repeat(4"]{grid-template-columns:1fr!important;}main>div>div[style*="1fr 1fr"]{grid-template-columns:1fr!important;}}`}</style>
  </div>;
}
