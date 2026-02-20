// ══ Themes ══
export const LT={primary:"#003087",primaryLight:"#6CACE4",primaryDark:"#001A4E",accent:"#0072CE",bg:"#F5F7FA",surface:"#FFFFFF",surfaceAlt:"#EBF0F7",border:"#D0D9E4",text:"#1A1A2E",textSec:"#4A5568",textMuted:"#8896A6",success:"#2D8A4E",successBg:"#E6F5EC",warning:"#C67A1A",warningBg:"#FFF3E0",danger:"#C53030",dangerBg:"#FEE2E2",focus:"#0072CE",purple:"#7C3AED",purpleBg:"#EDE9FE"};
export const DK={primary:"#6CACE4",primaryLight:"#003087",primaryDark:"#0A1628",accent:"#4DB8FF",bg:"#0F1A2E",surface:"#162038",surfaceAlt:"#1C2A48",border:"#2A3A5C",text:"#E8ECF2",textSec:"#A0B0C8",textMuted:"#6880A0",success:"#4ADE80",successBg:"#0D2818",warning:"#FBB040",warningBg:"#2A1A00",danger:"#F87171",dangerBg:"#2A0808",focus:"#4DB8FF",purple:"#A78BFA",purpleBg:"#1E1040"};
export const getTheme=(dark)=>dark?DK:LT;

// ══ Spacing system (B.13) ══
export const SP={xs:4,sm:8,md:12,lg:16,xl:24,xxl:32};

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
  {id:"submitted",label:"Innmeldt",color:"#8896A6",bg:"#F0F0F0",icon:"📩"},
  {id:"under-review",label:"Under vurdering",color:"#7C3AED",bg:"#EDE9FE",icon:"🔍"},
  {id:"assessed",label:"Vurdert",color:"#0891B2",bg:"#E0F7FA",icon:"✅"},
  {id:"ready",label:"Klar for sprint",color:"#2D8A4E",bg:"#E6F5EC",icon:"○"},
  {id:"in-progress",label:"Pågår",color:"#0072CE",bg:"#E0F0FF",icon:"▶"},
  {id:"blocked",label:"Blokkert",color:"#C53030",bg:"#FEE2E2",icon:"⚠"},
  {id:"done",label:"Ferdig",color:"#6B7280",bg:"#F3F4F6",icon:"✓"},
  {id:"rejected",label:"Avvist",color:"#991B1B",bg:"#FEE2E2",icon:"✕"},
  {id:"archived",label:"Arkivert",color:"#9CA3AF",bg:"#F3F4F6",icon:"📦"},
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

// ══ Scoring criteria (vektet 0-10) ══
export const SCORING_CRITERIA=[
  {key:"regulatory",label:"Regulatorisk etterlevelse",weight:0.15},
  {key:"security",label:"Økt informasjonssikkerhet",weight:0.10},
  {key:"costSaving",label:"Tid og/eller kostbesparelse",weight:0.20},
  {key:"dataQuality",label:"Økt datakvalitet",weight:0.15},
  {key:"simplicity",label:"Forenklet arbeidsprosess",weight:0.10},
  {key:"patientBenefit",label:"Bedre tilbud for pasientene",weight:0.15},
  {key:"employeeSat",label:"Bedre arbeidsdag for ansatte",weight:0.15},
];

export const SCORE_EXAMPLES={
  regulatory:[
    "Ingen regulatorisk relevans",
    "Svært begrenset regulatorisk relevans",
    "Marginal indirekte kobling til regelverk",
    "Kan ha noe effekt på etterlevelse",
    "Moderat forbedring av regelverksetterlevelse",
    "Tydelig positiv effekt på etterlevelse",
    "Betydelig forbedring av lovpålagt etterlevelse",
    "Viktig bidrag til å oppfylle regulatoriske krav",
    "Sterkt bidrag til etterlevelse av flere regelverk",
    "Nødvendig for å unngå lovbrudd eller sanksjoner",
    "Absolutt kritisk for lovpålagt etterlevelse",
  ],
  security:[
    "Ingen effekt på informasjonssikkerhet",
    "Svært marginal sikkerhetsrelevans",
    "Liten forbedring av sikkerhetsrutiner",
    "Noe bedre beskyttelse av data",
    "Moderat styrking av informasjonssikkerheten",
    "Tydelig reduksjon av sikkerhetsrisiko",
    "Betydelig forbedring av tilgangsstyring eller datavern",
    "Viktig bidrag til helhetlig sikkerhetsnivå",
    "Sterk forbedring av sikkerhet på flere områder",
    "Kritisk for å forhindre alvorlige sikkerhetshendelser",
    "Avgjørende for å beskytte sensitiv pasient-/virksomhetsdata",
  ],
  costSaving:[
    "Ingen tids- eller kostbesparelse",
    "Ubetydelig besparelse (under 10 timer/år)",
    "Liten besparelse (10–50 timer/år)",
    "Noe besparelse (50–100 timer/år)",
    "Moderat besparelse (100–300 timer/år)",
    "Tydelig besparelse (300–500 timer/år)",
    "Betydelig besparelse (500–1000 timer/år)",
    "Stor besparelse (1000–2000 timer/år)",
    "Svært stor besparelse (2000–5000 timer/år)",
    "Massiv besparelse (5000–10000 timer/år)",
    "Transformativ besparelse (over 10000 timer/år)",
  ],
  dataQuality:[
    "Ingen effekt på datakvalitet",
    "Svært begrenset forbedring av datakvalitet",
    "Marginal forbedring i et avgrenset område",
    "Noe bedre datakvalitet i enkeltprosesser",
    "Moderat forbedring av datakvalitet",
    "Tydelig bedre datakvalitet i viktige systemer",
    "Betydelig forbedring av dataintegritet",
    "Stor forbedring av datakvalitet på tvers av systemer",
    "Omfattende forbedring av kvalitet og konsistens",
    "Kritisk forbedring av datakvalitet i kjernesystemer",
    "Transformativ effekt på datakvalitet i hele organisasjonen",
  ],
  simplicity:[
    "Ingen forenkling av arbeidsprosesser",
    "Ubetydelig forenkling",
    "Marginal forenkling av enkelte steg",
    "Noe forenkling for noen brukere",
    "Moderat forenkling av prosessen",
    "Tydelig forenkling med færre manuelle steg",
    "Betydelig forenkling av arbeidsflyten",
    "Stor forenkling – fjerner flere tidkrevende steg",
    "Svært stor forenkling – automatiserer det meste",
    "Nesten full automatisering av prosessen",
    "Fullstendig eliminering av manuell prosess",
  ],
  patientBenefit:[
    "Ingen direkte nytte for pasienter",
    "Svært marginal pasientnytte",
    "Liten indirekte forbedring for pasienter",
    "Noe forbedring i pasientopplevelsen",
    "Moderat forbedring av pasienttilbudet",
    "Tydelig bedre opplevelse for pasientene",
    "Betydelig forbedring av behandlingskvalitet",
    "Stor forbedring av pasientsikkerhet/tilbud",
    "Svært stor forbedring av pasientbehandling",
    "Kritisk forbedring av pasientsikkerhet",
    "Livreddende eller transformativ pasientforbedring",
  ],
  employeeSat:[
    "Ingen effekt på ansattes arbeidsdag",
    "Svært marginal forbedring",
    "Liten forbedring for noen ansatte",
    "Noe bedre arbeidsdag for berørte ansatte",
    "Moderat forbedring av arbeidshverdagen",
    "Tydelig bedre arbeidsdag for mange ansatte",
    "Betydelig forbedring av trivsel og effektivitet",
    "Stor forbedring av arbeidsmiljøet",
    "Svært stor forbedring – fjerner frustrasjonskilder",
    "Kritisk forbedring av arbeidsforhold",
    "Transformativ forbedring av ansattes arbeidsdag",
  ],
};

// ══ Foretak i Helse Midt-Norge ══
export const ENTERPRISES=[
  {id:"hmr",label:"Helse Møre og Romsdal HF (HMR)"},
  {id:"stolav",label:"St. Olavs hospital HF"},
  {id:"hnt",label:"Helse Nord-Trøndelag HF"},
  {id:"hemit",label:"Hemit HF"},
  {id:"hmn",label:"Helse Midt-Norge RHF"},
];

// ══ Løsningskategorier ══
export const SOLUTION_CATEGORIES=[
  {id:"unknown",label:"Vet ikke / Usikker"},
  {id:"rpa",label:"RPA"},
  {id:"sysdev",label:"Systemutvikling"},
  {id:"integration",label:"Integrasjon"},
  {id:"lowcode",label:"No code / Low code"},
];

// ══ Scoring functions ══
export const calcWeightedScore=(t)=>{
  const raw=SCORING_CRITERIA.reduce((sum,c)=>sum+(t[c.key]||0)*c.weight,0);
  return Math.round(raw*10)/10;
};

// Factory: composite scorer (backward-compatible API)
export const makeComposite=(config)=>(t)=>calcWeightedScore(t);

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

// ══ Benefit management (A.11) ══
export const BENEFIT_UNITS=[
  {id:"kr",label:"Kroner (kr)"},{id:"timer",label:"Timer"},{id:"min",label:"Minutter per stk"},
  {id:"pct",label:"Prosent (%)"},{id:"antall",label:"Antall"},{id:"dager",label:"Dager"},{id:"annet",label:"Annet"},
];
export const BENEFIT_CATEGORIES=[
  {id:"cost",label:"Kostnadsreduksjon"},{id:"time",label:"Tidsbesparing"},{id:"quality",label:"Kvalitetsforbedring"},
  {id:"satisfaction",label:"Brukertilfredshet"},{id:"risk",label:"Risikoreduksjon"},{id:"compliance",label:"Etterlevelse"},
];
export const calcRealizationPct=(baseline,target,actual)=>{
  const b=parseFloat(baseline),t=parseFloat(target),a=parseFloat(actual);
  if(isNaN(b)||isNaN(t)||isNaN(a)||t===b)return null;
  return Math.round((a-b)/(t-b)*100)||0;
};

// ══ C.1: Nyttetype og klassifisering ══
export const BENEFIT_TYPES=[
  {id:"kostnadsreduksjon",label:"Kostnadsreduksjon"},{id:"tidsbesparing",label:"Tidsbesparing"},
  {id:"kvalitetsforbedring",label:"Kvalitetsforbedring"},{id:"brukertilfredshet",label:"Brukertilfredshet"},
  {id:"risikoreduksjon",label:"Risikoreduksjon"},{id:"etterlevelse",label:"Etterlevelse"},
];
export const BENEFIT_CLASSIFICATIONS=[
  {id:"kvantitativ",label:"Kvantitativ"},{id:"kvalitativ",label:"Kvalitativ"},
];

// ══ C.4: PIR-læringskategorier ══
export const PIR_LESSON_CATEGORIES=[
  {id:"process",label:"Prosess"},{id:"technical",label:"Teknisk"},
  {id:"organizational",label:"Organisatorisk"},{id:"stakeholder",label:"Interessenter"},
  {id:"scope",label:"Omfang"},
];

// ══ C.9: Aggregert tilbakebetalingstid ══
export const calcAggregatePayback=(tasks)=>{
  const cost=tasks.reduce((s,t)=>s+(parseFloat(t.estimatedCost)||0),0);
  const saving=tasks.reduce((s,t)=>s+(parseFloat(t.estimatedAnnualSaving)||0),0);
  if(cost<=0||saving<=0)return null;
  return Math.round(cost/saving*10)/10;
};

// ══ C.8: Gjennomsnittlig nytterealisering ══
export const calcGoalBenefitRealization=(tasks)=>{
  const m=tasks.filter(t=>t.benefitBaseline&&t.benefitTarget&&t.benefitActual);
  if(!m.length)return null;
  const sum=m.reduce((s,t)=>s+(calcRealizationPct(t.benefitBaseline,t.benefitTarget,t.benefitActual)||0),0);
  return Math.round(sum/m.length);
};

// ══ C.4: PIR-rapport generator ══
export const buildPirReport=(t)=>{
  const lines=[
    `PIR-RAPPORT: ${t.title||"Ukjent"}`,`ID: ${t.id||"–"}`,`Dato: ${td()}`,``,
    `═══ VURDERING ═══`,
    `Nytterealisering: ${t.pirRealization||0}/5`,`Interessenttilfredshet: ${t.pirSatisfaction||0}/5`,
    `Prosessforbedring: ${t.pirProcess||0}/5`,`Teknisk kvalitet: ${t.pirTechnical||0}/5`,
    `Interessentvurdering: ${t.pirStakeholderScore||0}/5`,
    `Gjennomsnitt: ${((t.pirRealization||0)+(t.pirSatisfaction||0)+(t.pirProcess||0)+(t.pirTechnical||0)+(t.pirStakeholderScore||0))/5}/5`,``,
    `═══ NYTTE ═══`,
    `Forventet: ${t.expectedBenefit||"–"}`,`Kategori: ${t.benefitCategory||"–"}`,`Type: ${t.benefitType||"–"}`,
    `Klassifisering: ${t.benefitClassification||"–"}`,`Nytteeier: ${t.benefitOwner||"–"}`,
    `Baseline: ${t.benefitBaseline||"–"}`,`Mål: ${t.benefitTarget||"–"}`,`Faktisk: ${t.benefitActual||"–"}`,
    `Realisering: ${t.benefitBaseline&&t.benefitTarget&&t.benefitActual?calcRealizationPct(t.benefitBaseline,t.benefitTarget,t.benefitActual)+"%":"Ikke målt"}`,``,
    `═══ UVENTEDE GEVINSTER/ULEMPER ═══`,t.pirUnexpectedBenefits||"Ingen",``,
    `═══ LÆRINGSPUNKTER ═══`,
    ...((t.pirLessonCategories||[]).length>0
      ?(t.pirLessonCategories||[]).map(l=>`  ${l.category}: ${l.text}`)
      :[t.pirLessons||"Ingen"]),``,
    `═══ OPPFØLGINGSTILTAK ═══`,
    ...((t.pirActionItems||[]).length>0
      ?(t.pirActionItems||[]).map(a=>`  [${a.done?"x":" "}] ${a.action} (${a.responsible||"–"}, ${a.deadline||"–"})`)
      :["Ingen"]),``,
    `═══ UTFALL ═══`,`${t.pirOutcome||"Ikke satt"}`,
    t.pirFollowUp?`Oppfølgingsplan: ${t.pirFollowUp}`:"",
  ];
  return lines.filter(l=>l!==undefined).join("\n");
};

// ══ D.1: Velocity-trend med statistikk ══
export const calcVelocityTrend=(sprints)=>{
  const done=sprints.filter(s=>s.status==="completed"&&s.delivered>0);
  if(!done.length)return{data:[],avg:0,stdDev:0,trend:"flat",slope:0};
  const vals=done.map(s=>s.delivered);
  const avg=vals.reduce((s,v)=>s+v,0)/vals.length;
  const variance=vals.reduce((s,v)=>s+(v-avg)**2,0)/vals.length;
  const stdDev=Math.round(Math.sqrt(variance)*10)/10;
  const n=vals.length;const xAvg=(n-1)/2;
  const slope=n>1?vals.reduce((s,v,i)=>s+(i-xAvg)*(v-avg),0)/vals.reduce((s,_,i)=>s+(i-xAvg)**2,0):0;
  const trend=slope>0.5?"up":slope<-0.5?"down":"flat";
  return{data:done.map(s=>({id:s.id,name:s.name,planned:s.planned,delivered:s.delivered})),avg:Math.round(avg*10)/10,stdDev,trend,slope:Math.round(slope*10)/10};
};

// ══ D.1: Cycle time-trend per sprint ══
export const calcCycleTimeTrend=(tasks,sprints)=>sprints.filter(s=>s.status==="completed").map(s=>{
  const st=tasks.filter(t=>t.sprintId===s.id&&t.status==="done");
  const leads=st.map(calcLeadTime).filter(Boolean);const cycles=st.map(calcCycleTime).filter(Boolean);
  return{sprintId:s.id,sprintName:s.name,avgLeadTime:leads.length?Math.round(leads.reduce((a,b)=>a+b,0)/leads.length):null,avgCycleTime:cycles.length?Math.round(cycles.reduce((a,b)=>a+b,0)/cycles.length):null,count:st.length};
});

// ══ D.1: Gjennomstrømning per løype per sprint ══
export const calcThroughputByTrack=(tasks,sprints)=>sprints.filter(s=>s.status==="completed").map(s=>{
  const st=tasks.filter(t=>t.sprintId===s.id&&t.status==="done");
  const tracks={};st.forEach(t=>(t.tracks||[]).forEach(tr=>{tracks[tr]=(tracks[tr]||0)+1;}));
  return{sprintId:s.id,sprintName:s.name,tracks,total:st.length};
});

// ══ D.2: CFD-data fra task-historikk ══
export const buildCfdData=(tasks)=>{
  const events=[];
  tasks.filter(t=>!t.archived).forEach(t=>{
    const h=t.history||[];
    const created=h.find(x=>x.what==="Opprettet");
    if(created)events.push({date:created.time?.slice(0,10),taskId:t.id,to:"submitted"});
    h.forEach(x=>{
      const m=x.what?.match(/status.*?→\s*"?(\w[\w-]*)/)||x.what?.match(/status:.*?"(\w[\w-]*)"/);
      if(m)events.push({date:x.time?.slice(0,10),taskId:t.id,to:m[1]});
    });
  });
  events.sort((a,b)=>(a.date||"").localeCompare(b.date||""));
  if(!events.length)return[];
  const taskStatus={};
  const dates=[...new Set(events.map(e=>e.date).filter(Boolean))].sort();
  const statusIds=["submitted","under-review","assessed","ready","in-progress","blocked","done","rejected"];
  return dates.map(d=>{
    events.filter(e=>e.date===d).forEach(e=>{taskStatus[e.taskId]=e.to;});
    const counts={};statusIds.forEach(s=>{counts[s]=Object.values(taskStatus).filter(v=>v===s).length;});
    return{date:d,...counts};
  });
};

// ══ D.3: Probabilistisk prognose ══
export const calcPredictiveCompletion=(backlogSP,sprints,intakeRate=0)=>{
  const done=sprints.filter(s=>s.status==="completed"&&s.delivered>0);
  if(!done.length||backlogSP<=0)return null;
  const vals=done.map(s=>s.delivered);
  const avg=vals.reduce((s,v)=>s+v,0)/vals.length;
  const stdDev=Math.sqrt(vals.reduce((s,v)=>s+(v-avg)**2,0)/vals.length);
  const netOpt=Math.max(avg+stdDev-intakeRate,1);const netLikely=Math.max(avg-intakeRate,1);const netPes=Math.max(avg-stdDev-intakeRate,1);
  const sprintsOpt=Math.ceil(backlogSP/netOpt);const sprintsLikely=Math.ceil(backlogSP/netLikely);const sprintsPes=Math.ceil(backlogSP/netPes);
  const addWeeks=(n)=>{const d=new Date();d.setDate(d.getDate()+n*2*7);return d.toISOString().split("T")[0];};
  return{optimistic:sprintsOpt,mostLikely:sprintsLikely,pessimistic:sprintsPes,
    dates:{optimistic:addWeeks(sprintsOpt),mostLikely:addWeeks(sprintsLikely),pessimistic:addWeeks(sprintsPes)},
    velocity:{avg:Math.round(avg*10)/10,stdDev:Math.round(stdDev*10)/10},intakeRate};
};

// ══ D.4: Nytte per løype ══
export const calcBenefitByTrack=(tasks)=>{
  const active=tasks.filter(t=>!t.archived&&!t.parentId);
  return TRACKS.map(tr=>{
    const ts=active.filter(t=>(t.tracks||[]).includes(tr.id));
    const cost=ts.reduce((s,t)=>s+(parseFloat(t.estimatedCost)||0),0);
    const saving=ts.reduce((s,t)=>s+(parseFloat(t.estimatedAnnualSaving)||0),0);
    const measured=ts.filter(t=>t.benefitBaseline&&t.benefitTarget&&t.benefitActual);
    const avgR=measured.length?Math.round(measured.reduce((s,t)=>s+(calcRealizationPct(t.benefitBaseline,t.benefitTarget,t.benefitActual)||0),0)/measured.length):null;
    return{trackId:tr.id,trackLabel:tr.label,trackColor:tr.color,totalEstCost:cost,totalEstSaving:saving,avgRealization:avgR,taskCount:ts.length,measuredCount:measured.length};
  });
};

// ══ D.4: Nytte per mål ══
export const calcBenefitByGoal=(tasks,goals)=>goals.filter(g=>!g.parent).map(g=>{
  const allIds=[g.id,...goals.filter(x=>x.parent===g.id).map(x=>x.id)];
  const ts=tasks.filter(t=>!t.archived&&(t.goals||[]).some(id=>allIds.includes(id)));
  const cost=ts.reduce((s,t)=>s+(parseFloat(t.estimatedCost)||0),0);
  const saving=ts.reduce((s,t)=>s+(parseFloat(t.estimatedAnnualSaving)||0),0);
  const measured=ts.filter(t=>t.benefitBaseline&&t.benefitTarget&&t.benefitActual);
  const avgR=measured.length?Math.round(measured.reduce((s,t)=>s+(calcRealizationPct(t.benefitBaseline,t.benefitTarget,t.benefitActual)||0),0)/measured.length):null;
  return{goalId:g.id,goalTitle:g.title,totalEstCost:cost,totalEstSaving:saving,avgRealization:avgR,taskCount:ts.length,measuredCount:measured.length};
});

// ══ D.4: Gap-analyse ══
export const calcBenefitGaps=(tasks)=>tasks.filter(t=>!t.archived&&t.benefitBaseline&&t.benefitTarget&&t.benefitActual)
  .map(t=>{const pct=calcRealizationPct(t.benefitBaseline,t.benefitTarget,t.benefitActual)||0;
    return{id:t.id,title:t.title,baseline:t.benefitBaseline,target:t.benefitTarget,actual:t.benefitActual,realization:pct,gap:100-pct,benefitOwner:t.benefitOwner||""};})
  .sort((a,b)=>b.gap-a.gap);

// ══ D.5: Eksportkolonner og maler ══
export const EXPORT_COLUMNS=[
  {id:"id",label:"ID",get:t=>t.id},{id:"title",label:"Tittel",get:t=>t.title},
  {id:"desc",label:"Beskrivelse",get:t=>t.desc||""},{id:"status",label:"Status",get:t=>stMap[t.status]?.label||t.status},
  {id:"priority",label:"Prioritet",get:t=>t.priority},{id:"tracks",label:"Løyper",get:t=>(t.tracks||[]).join(";")},
  {id:"sp",label:"SP",get:t=>t.size},{id:"hours",label:"Timer",get:t=>t.actualHours||0},
  {id:"submitter",label:"Innmelder",get:t=>t.submitterName},{id:"owner",label:"Prosesseier",get:t=>t.processOwner||""},
  {id:"date",label:"Dato",get:t=>t.date},{id:"sprint",label:"Sprint",get:t=>t.sprintId||""},
  {id:"cost",label:"Est.kostnad",get:t=>t.estimatedCost||""},{id:"saving",label:"Est.besparelse",get:t=>t.estimatedAnnualSaving||""},
  {id:"benefitType",label:"Nyttetype",get:t=>t.benefitType||""},{id:"benefitActual",label:"Faktisk nytte",get:t=>t.benefitActual||""},
  {id:"benefitOwner",label:"Nytteeier",get:t=>t.benefitOwner||""},
  {id:"leadTime",label:"Lead Time (d)",get:t=>calcLeadTime(t)||""},{id:"cycleTime",label:"Cycle Time (d)",get:t=>calcCycleTime(t)||""},
];
export const EXPORT_TEMPLATES=[
  {id:"sprint",label:"Sprint-rapport",cols:["id","title","status","sp","hours","tracks","sprint"]},
  {id:"benefit",label:"Nytterapport",cols:["id","title","status","cost","saving","benefitType","benefitActual","benefitOwner"]},
  {id:"portfolio",label:"Porteføljeoversikt",cols:["id","title","status","priority","tracks","sp","cost","saving","leadTime","cycleTime"]},
];
export const exportCsvAdvanced=(tasks,colIds,compositeScore,filename)=>{
  const cols=colIds.map(id=>EXPORT_COLUMNS.find(c=>c.id===id)).filter(Boolean);
  const headers=cols.map(c=>c.label);
  const rows=tasks.map(t=>cols.map(c=>c.id==="score"?compositeScore?.(t):c.get(t)));
  exportCsv(headers,rows,filename);
};

// ══ D.5: Print-rapport (PDF via iframe) ══
export const exportPrintReport=(title,htmlContent)=>{
  const iframe=document.createElement("iframe");iframe.style.display="none";document.body.appendChild(iframe);
  const doc=iframe.contentDocument;
  doc.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>body{font-family:system-ui,sans-serif;padding:24px;color:#1A1A2E}h1{color:#003087;font-size:18px;border-bottom:2px solid #6CACE4;padding-bottom:6px}table{width:100%;border-collapse:collapse;font-size:11px;margin-top:12px}th{background:#F5F7FA;padding:6px;text-align:left;font-size:9px;font-weight:700;text-transform:uppercase;border-bottom:2px solid #003087}td{padding:5px 6px;border-bottom:1px solid #D0D9E4}.meta{font-size:10px;color:#4A5568;margin-top:4px}</style></head><body><h1>Hemit Nyttestyring — ${title}</h1><p class="meta">Generert: ${new Date().toLocaleDateString("nb-NO")}</p>${htmlContent}</body></html>`);
  doc.close();setTimeout(()=>{iframe.contentWindow.print();setTimeout(()=>document.body.removeChild(iframe),1000);},300);
};

// ══ D.6: Dashboard-widgetdefinisjoner ══
export const DASHBOARD_WIDGETS=[
  {id:"velocity",label:"Velocity",icon:"📈",default:true},
  {id:"sprintProgress",label:"Sprint-fremgang",icon:"⚡",default:true},
  {id:"statusDist",label:"Status-fordeling",icon:"📊",default:true},
  {id:"trackDist",label:"Per løype",icon:"🔀",default:true},
  {id:"leadCycleTime",label:"Gjennomløpstider",icon:"⏱",default:true},
  {id:"goalProgress",label:"Mål-fremgang",icon:"🎯",default:true},
  {id:"velocityTrend",label:"Velocity-trend",icon:"📉",default:false},
  {id:"cycleTimeTrend",label:"Cycle Time-trend",icon:"⏱📉",default:false},
  {id:"throughputTrack",label:"Gjennomstrømning/løype",icon:"🔄",default:false},
  {id:"cfd",label:"Kumulativt flytdiagram",icon:"📊",default:false},
  {id:"predictive",label:"Prognose",icon:"🔮",default:false},
  {id:"resourceUtil",label:"Ressursutnyttelse",icon:"👥📊",default:false},
];

// ══ D.8: KPI-snapshot for mål ══
export const addGoalKpiSnapshot=(goal,value)=>({...goal,kpiHistory:[...(goal.kpiHistory||[]),{date:td(),value:String(value)}]});

// ══ D.9: Ressursutnyttelse per teammedlem ══
export const calcResourceUtilization=(team,tasks,sprintId,sprintWeeks)=>{
  const sprintTasks=tasks.filter(t=>t.sprintId===sprintId&&!t.archived);
  return team.map(m=>{
    const allocated=autoHours(m.availability,sprintWeeks);
    const memberTasks=sprintTasks.filter(t=>t.assignee===m.id);
    const actual=memberTasks.reduce((s,t)=>s+(parseFloat(t.actualHours)||0),0);
    const hoursByTrack={};memberTasks.forEach(t=>(t.tracks||[]).forEach(tr=>{hoursByTrack[tr]=(hoursByTrack[tr]||0)+(parseFloat(t.actualHours)||0);}));
    return{memberId:m.id,name:m.name,allocatedHours:allocated,actualHours:actual,utilization:allocated>0?Math.round(actual/allocated*100):0,hoursByTrack,overAllocated:actual>allocated,taskCount:memberTasks.length};
  });
};

// ══ E.7: Filvedlegg-hjelpefunksjoner ══
export const isImageAttachment=(a)=>a?.type?.startsWith("image/");
export const getAttachIcon=(a)=>{
  if(isImageAttachment(a))return"🖼";
  if(a?.name?.match(/\.(docx?)$/i))return"📝";
  if(a?.name?.match(/\.(xlsx?|csv)$/i))return"📊";
  if(a?.name?.match(/\.(pptx?)$/i))return"📽";
  if(a?.name?.match(/\.pdf$/i))return"📕";
  return"📄";
};

// ══ Score label (B.11 – tilgjengelighet) ══
export const scoreLabel=(sc)=>sc>=7?"Høy":sc>=4?"Medium":"Lav";

// ══ Relative dates (B.8 – norske datoformater) ══
export const fmtDate=(dateStr,style="relative")=>{
  if(!dateStr)return"";
  const d=new Date(dateStr.replace(" ","T"));
  if(isNaN(d))return dateStr;
  if(style==="absolute")return d.toLocaleDateString("nb-NO",{day:"numeric",month:"short",year:"numeric"});
  const now=new Date(),diff=Math.floor((now-d)/1000);
  if(diff<0)return d.toLocaleDateString("nb-NO",{day:"numeric",month:"short",year:"numeric"});
  if(diff<60)return"Nå";
  if(diff<3600)return`${Math.floor(diff/60)} min siden`;
  if(diff<86400)return`${Math.floor(diff/3600)} t siden`;
  if(diff<172800)return"I går";
  if(diff<604800)return`${Math.floor(diff/86400)} d siden`;
  return d.toLocaleDateString("nb-NO",{day:"numeric",month:"short",year:"numeric"});
};

// ══ Tooltips ══
export const TIP={
  Score:"Vektet prioriteringsscore (0–10) basert på 7 kriterier: regulatorisk, sikkerhet, kostnadsbesparelse, datakvalitet, prosessforenkling, pasientnytte og medarbeidertilfredshet.",
  SP:"Story Points – relativ kompleksitet (Fibonacci: 1–21). Brukes til sprintplanlegging.",
  Velocity:"Velocity – teamets leveransehastighet målt i story points per sprint. Brukes til å planlegge fremtidig kapasitet og forutsi leveransetakt.",
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
