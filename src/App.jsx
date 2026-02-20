import React, { useState, useMemo, useEffect } from "react";
import { ThemeContext } from "./ThemeContext";
import { LT, DK, getTheme, HRS_WEEK, autoHours, TRACKS, STATUSES, stMap, SKILLS_LIST, FIBONACCI, PRIORITIES, ATTACH_ACCEPT, ATTACH_MAX_BYTES, SCORING_CRITERIA, SCORE_EXAMPLES, calcWeightedScore, makeComposite, ts, td, fmtSize, findDupes, TIP, S, STATUS_TRANSITIONS, validTransition, calcLeadTime, calcCycleTime, exportCsv, SP, scoreLabel, calcGoalBenefitRealization, calcAggregatePayback, calcRealizationPct, calcVelocityTrend, calcCycleTimeTrend, calcThroughputByTrack, buildCfdData, calcPredictiveCompletion, calcBenefitByTrack, calcBenefitByGoal, calcBenefitGaps, EXPORT_COLUMNS, EXPORT_TEMPLATES, exportCsvAdvanced, exportPrintReport, DASHBOARD_WIDGETS, addGoalKpiSnapshot, calcResourceUtilization, ENTERPRISES, SOLUTION_CATEGORIES } from "./constants";
import { suggestBenefits, autoScore } from "./ai";
import { INIT_GOALS, INIT_TASKS, INIT_CONFIG, INIT_TEAM, INIT_SPRINTS } from "./data";
import { Badge, TBadge, Card, Btn, SH, TF, SF, Sl, SBar, Tip, GoalPicker, KriterieScoring } from "./atoms";
import AttachArea from "./components/AttachArea";
import CommentsPanel from "./components/CommentsPanel";
import HistoryPanel from "./components/HistoryPanel";
import ReviewModal from "./components/ReviewModal";
import { SkeletonTable } from "./components/Skeleton";
import s from "./App.module.css";

export default function App(){
  const [dark,setDark]=useState(false);
  const C=getTheme(dark);
  const [role,setRole]=useState("employee");
  const [tab,setTab]=useState("submit");
  const [tasks,setTasks]=useState(()=>{try{const d=JSON.parse(localStorage.getItem("hemit-tasks"));return Array.isArray(d)&&d.length?d:INIT_TASKS;}catch(e){return INIT_TASKS;}});
  const [goals,setGoals]=useState(()=>{try{const d=JSON.parse(localStorage.getItem("hemit-cfg"));return d?.goals||INIT_GOALS;}catch(e){return INIT_GOALS;}});
  const [config,setConfig]=useState(()=>{try{const d=JSON.parse(localStorage.getItem("hemit-cfg"));return d?.config?{...INIT_CONFIG,...d.config}:INIT_CONFIG;}catch(e){return INIT_CONFIG;}});
  const [team,setTeam]=useState(()=>{try{const d=JSON.parse(localStorage.getItem("hemit-cfg"));return d?.team||INIT_TEAM;}catch(e){return INIT_TEAM;}});
  const [sprints,setSprints]=useState(()=>{try{const d=JSON.parse(localStorage.getItem("hemit-cfg"));return d?.sprints||INIT_SPRINTS;}catch(e){return INIT_SPRINTS;}});
  const [viewSprintId,setViewSprintId]=useState(()=>{try{const d=JSON.parse(localStorage.getItem("hemit-cfg"));const sp=d?.sprints||INIT_SPRINTS;const a=sp.find(s=>s.status==="active");return a?a.id:sp[sp.length-1].id;}catch(e){return "S-27";}});
  const [sortBy,setSortBy]=useState("score");
  const [filterTrack,setFilterTrack]=useState("all");
  const [filterStatus,setFilterStatus]=useState("all");
  const [searchQ,setSearchQ]=useState("");
  const [selectedTask,setSelectedTask]=useState(null);
  const [modal,setModal]=useState(null);
  const [notes,setNotes]=useState([]);
  const [batchSel,setBatchSel]=useState([]);
  const [editMember,setEditMember]=useState(null);
  const [dragTask,setDragTask]=useState(null);
  const [showArchived,setShowArchived]=useState(false);
  const emptyForm={title:"",desc:"",submitterName:"",submitterDept:"",processOwner:"",priority:"medium",goals:[],eqsRef:"",attachments:[],expectedBenefit:"",benefitMetric:"",benefitBaseline:"",benefitTarget:"",benefitActual:"",benefitReviewDate:"",estimatedCost:"",estimatedAnnualSaving:"",blockedBy:[],benefitCategory:"",benefitUnit:"",pirRealization:0,pirSatisfaction:0,pirProcess:0,pirTechnical:0,pirLessons:"",pirOutcome:"",pirFollowUp:"",benefitType:"",benefitClassification:"",benefitOwner:"",benefitPlan:[],pirUnexpectedBenefits:"",pirLessonCategories:[],pirActionItems:[],pirStakeholderScore:0,
    serviceNowRef:"",pilotUnit:"",enterprise:"",solutionCategory:"unknown",
    manualTask:"",taskPerformer:"",frequency:"",volumePerTime:"",annualTimeSaving:"",involvedSystems:"",
    needSummary:"",background:"",
    qualitativeBenefits:"",quantitativeBenefits:"",alternativeSolutions:"",otherInfo:"",
    regulatory:0,security:0,costSaving:0,dataQuality:0,simplicity:0,patientBenefit:0,employeeSat:0,
    regulatoryReason:"",securityReason:"",costSavingReason:"",dataQualityReason:"",simplicityReason:"",patientBenefitReason:"",employeeSatReason:""};
  const [form,setForm]=useState(emptyForm);
  const [goalForm,setGoalForm]=useState({title:"",type:"Hovedmål",parent:""});
  const [memberForm,setMemberForm]=useState({name:"",role:"",availability:100,skills:[],track:"sysdev"});
  const [expandedTrack,setExpandedTrack]=useState(null);
  const [tplForm,setTplForm]=useState({});
  const [confirmSubmit,setConfirmSubmit]=useState(null);
  const [aiLoading,setAiLoading]=useState(null);
  const [aiError,setAiError]=useState(null);
  const [configUnlocked,setConfigUnlocked]=useState(false);
  const [configPw,setConfigPw]=useState("");
  const [loading,setLoading]=useState(true);
  /* B.5: responsive mobile detection */
  const [isMobile,setIsMobile]=useState(typeof window!=="undefined"&&window.innerWidth<768);
  /* B.10: mobile menu */
  const [mobileMenuOpen,setMobileMenuOpen]=useState(false);
  /* D.6: configurable dashboard widgets */
  const [dashWidgets,setDashWidgets]=useState(()=>{try{const d=JSON.parse(localStorage.getItem("hemit-dash-widgets"));return Array.isArray(d)?d:DASHBOARD_WIDGETS.filter(w=>w.default).map(w=>w.id);}catch(e){return DASHBOARD_WIDGETS.filter(w=>w.default).map(w=>w.id);}});
  /* D.7: sprint comparison */
  const [compareSprints,setCompareSprints]=useState([null,null]);
  /* D.5: export columns */
  const [exportCols,setExportCols]=useState(EXPORT_COLUMNS.map(c=>c.id));
  const [exportTpl,setExportTpl]=useState("");

  const composite=useMemo(()=>makeComposite(config),[config]);
  /* B.6: pagination */
  const [page,setPage]=useState(0);const PAGE_SIZE=30;

  useEffect(()=>{try{localStorage.setItem("hemit-cfg",JSON.stringify({config,team,goals,sprints}));}catch(e){}},[config,team,goals,sprints]);
  useEffect(()=>{try{localStorage.setItem("hemit-tasks",JSON.stringify(tasks));}catch(e){}},[tasks]);
  useEffect(()=>{try{localStorage.setItem("hemit-dash-widgets",JSON.stringify(dashWidgets));}catch(e){}},[dashWidgets]);
  /* B.3: Initial loading state */
  useEffect(()=>{setLoading(false);},[]);
  /* B.5: Window resize listener */
  useEffect(()=>{const h=()=>setIsMobile(window.innerWidth<768);window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h);},[]);

  const notify=(msg,type="success")=>{const id=Date.now()+Math.random();setNotes(prev=>[...prev.slice(-4),{id,msg,type}]);setTimeout(()=>setNotes(prev=>prev.filter(n=>n.id!==id)),4500);};
  const updateTask=(id,ch)=>{setTasks(p=>{const updated=p.map(t=>{if(t.id!==id)return t;const hist=Object.keys(ch).filter(k=>!["comments","history","attachments"].includes(k)&&JSON.stringify(t[k])!==JSON.stringify(ch[k])).map(k=>({who:role==="employee"?"Medarbeider":role==="forum"?"Utviklingsforum":"Leveranseteam",what:`${k}: ${JSON.stringify(t[k])}→${JSON.stringify(ch[k])}`,time:ts()}));return{...t,...ch,history:[...(t.history||[]),...hist]};});/* A.5: Varsle når alle deloppgaver er ferdige */if(ch.status){const changedTask=updated.find(t=>t.id===id);if(changedTask?.parentId){const parent=updated.find(t=>t.id===changedTask.parentId);if(parent&&parent.status!=="done"&&parent.status!=="archived"){const siblings=updated.filter(t=>t.parentId===parent.id);if(siblings.length>0&&siblings.every(t=>t.status==="done")){setTimeout(()=>notify(`✅ Alle deloppgaver under "${parent.title}" er ferdig! Vurder å oppdatere foreldrens status.`),100);}}}}return updated;});if(config.emailNotifications&&config.emailOnStatusChange&&ch.status){const old=tasks.find(t=>t.id===id);if(old&&old.status!==ch.status){notify("📧 Varsling → "+stMap[ch.status]?.label);if(config.notifyProcessOwner&&old.processOwner)notify(`📧 Prosesseier varslet`);}}};
  const addComment=(id,text)=>{const author=role==="employee"?"Medarbeider":role==="forum"?"Utviklingsforum":"Leveranseteam";setTasks(p=>p.map(t=>t.id===id?{...t,comments:[...(t.comments||[]),{author,text,time:ts()}]}:t));};
  const deleteTask=id=>{setTasks(p=>p.filter(t=>t.id!==id));setModal(null);notify("Slettet.","warning");};
  const archiveTask=id=>updateTask(id,{archived:true,status:"archived"});
  const batchAction=(act,val)=>{const n=batchSel.length;batchSel.forEach(id=>{if(act==="status")updateTask(id,{status:val});else if(act==="sprint")updateTask(id,{sprintId:val||null});else if(act==="archive")archiveTask(id);});setBatchSel([]);notify(`${n} oppdatert`);};
  const dupes=useMemo(()=>findDupes(form.title,tasks),[form.title,tasks]);
  const unreviewed=tasks.filter(t=>!t.reviewed&&!t.archived&&!t.parentId);
  const activeTasks=useMemo(()=>showArchived?tasks:tasks.filter(t=>!t.archived),[tasks,showArchived]);
  const handleSubmit=e=>{e.preventDefault();if(!form.title){notify("Fyll inn tittel.","warning");return;}if(!form.submitterName){notify("Fyll inn navnet ditt.","warning");return;}setConfirmSubmit({...form});};
  const doSubmit=()=>{if(!confirmSubmit)return;const t={...confirmSubmit,id:`T-${String(tasks.length+1).padStart(3,"0")}`,tracks:[],size:0,status:"submitted",sprintId:null,date:td(),reviewed:false,actualHours:0,comments:[],history:[{who:confirmSubmit.submitterName,what:"Opprettet",time:ts()}],archived:false,parentId:null,blockedBy:[]};setTasks(p=>[t,...p]);setForm(emptyForm);setConfirmSubmit(null);notify(`"${t.title}" sendt til Utviklingsforum.`);};
  const getSubtasks=(parentId)=>tasks.filter(t=>t.parentId===parentId);
  const isParent=(t)=>!t.parentId&&tasks.some(s=>s.parentId===t.id);
  const addSubtask=(parent,title,size)=>{setTasks(p=>{const existing=p.filter(t=>t.parentId===parent.id);const letter=String.fromCharCode(65+existing.length);const sub={...parent,id:`${parent.id}-${letter}`,title,desc:`Deloppgave av ${parent.title}`,size:parseInt(size)||3,status:"ready",sprintId:parent.sprintId||null,parentId:parent.id,assignee:"",actualHours:0,comments:[],history:[{who:role==="forum"?"Utviklingsforum":"Leveranseteam",what:`Deloppgave opprettet (av ${parent.id})`,time:ts()}],attachments:[],archived:false,reviewed:true};return[...p,sub];});notify(`Deloppgave "${title}" opprettet`);};
  const addSubtasksBatch=(parent,templates)=>{setTasks(p=>{const existing=p.filter(t=>t.parentId===parent.id);let startIdx=existing.length;const newSubs=templates.map((tpl,i)=>({...parent,id:`${parent.id}-${String.fromCharCode(65+startIdx+i)}`,title:tpl.title,desc:`Deloppgave av ${parent.title}`,size:parseInt(tpl.size)||3,status:"ready",sprintId:parent.sprintId||null,parentId:parent.id,assignee:"",actualHours:0,comments:[],history:[{who:role==="forum"?"Utviklingsforum":"Leveranseteam",what:`Deloppgave opprettet (av ${parent.id})`,time:ts()}],attachments:[],archived:false,reviewed:true}));return[...p,...newSubs];});notify(`${templates.length} faste deloppgaver opprettet`);};
  const subProgress=(parentId)=>{const subs=getSubtasks(parentId);if(!subs.length)return null;const done=subs.filter(s=>s.status==="done").length;return{total:subs.length,done,pct:Math.round(done/subs.length*100)};};
  // A3: Check if task is blocked by unfinished dependencies
  const isBlockedByDeps=(task)=>{const deps=task.blockedBy||[];if(!deps.length)return false;return deps.some(depId=>{const dep=tasks.find(t=>t.id===depId);return dep&&dep.status!=="done"&&dep.status!=="archived";});};
  const getBlockers=(task)=>(task.blockedBy||[]).map(id=>tasks.find(t=>t.id===id)).filter(Boolean).filter(t=>t.status!=="done"&&t.status!=="archived");
  const parentTasks=useMemo(()=>tasks.filter(t=>!t.parentId&&!t.archived),[tasks]);
  const sorted=useMemo(()=>{let a=[...activeTasks];if(role==="team")a=a.filter(t=>t.reviewed);if(filterTrack!=="all")a=a.filter(t=>(t.tracks||[]).includes(filterTrack));if(filterStatus!=="all")a=a.filter(t=>t.status===filterStatus);if(searchQ){const q=searchQ.toLowerCase();a=a.filter(t=>t.title.toLowerCase().includes(q)||t.desc?.toLowerCase().includes(q)||t.submitterName?.toLowerCase().includes(q)||t.processOwner?.toLowerCase().includes(q));}const o={critical:4,high:3,medium:2,low:1};if(sortBy==="score")a.sort((x,y)=>composite(y)-composite(x));else if(sortBy==="priority")a.sort((x,y)=>(o[y.priority]||0)-(o[x.priority]||0));else if(sortBy==="date")a.sort((x,y)=>y.date.localeCompare(x.date));else if(sortBy==="id"){const parents=a.filter(t=>!t.parentId);const children=a.filter(t=>t.parentId);parents.sort((x,y)=>x.id.localeCompare(y.id));const result=[];parents.forEach(p=>{result.push(p);const subs=children.filter(c=>c.parentId===p.id).sort((x,y)=>x.id.localeCompare(y.id));result.push(...subs);});const placed=new Set(result.map(t=>t.id));children.filter(c=>!placed.has(c.id)).sort((x,y)=>x.id.localeCompare(y.id)).forEach(c=>result.push(c));a=result;}return a;},[activeTasks,sortBy,filterTrack,filterStatus,searchQ,role,composite]);
  /* B.6: Reset page when filters change */
  useEffect(()=>{setPage(0);},[filterTrack,filterStatus,searchQ,sortBy,showArchived]);
  useEffect(()=>{if(tab!=="config"){setConfigUnlocked(false);setConfigPw("");}},[tab]);
  const reviewedSorted=useMemo(()=>sorted.filter(t=>t.reviewed),[sorted]);
  const totalPages=Math.ceil(reviewedSorted.length/PAGE_SIZE);
  const paged=reviewedSorted.slice(page*PAGE_SIZE,(page+1)*PAGE_SIZE);
  const viewSprint=sprints.find(s=>s.id===viewSprintId);
  const activeSprint=sprints.find(s=>s.status==="active");
  const sprintMap=Object.fromEntries(sprints.map(s=>[s.id,s]));
  const sprintTasks=tasks.filter(t=>t.sprintId===viewSprintId&&!t.archived);
  const totalSP=sprintTasks.reduce((s,t)=>s+t.size,0);
  const doneSP=sprintTasks.filter(t=>t.status==="done").reduce((s,t)=>s+t.size,0);
  const sprintPct=totalSP>0?Math.round(doneSP/totalSP*100):0;
  const sprintWeeks=viewSprint?.weeks||config.defaultSprintWeeks||2;
  const totalCap=team.reduce((s,m)=>s+autoHours(m.availability,sprintWeeks),0);
  const prMap=Object.fromEntries(PRIORITIES.map(p=>[p.id,p]));
  const roleTabs={employee:[{id:"submit",label:"Meld forslag",icon:"💡"},{id:"my",label:"Mine",icon:"📋"}],forum:[{id:"inbox",label:"Innkomne",icon:"📥"},{id:"review",label:"Alle",icon:"🔬"},{id:"backlog",label:"Backlog",icon:"≡"},{id:"portfolio",label:"Portefølje",icon:"📁"},{id:"goals",label:"Mål",icon:"🎯"},{id:"benefit-report",label:"Nytterapport",icon:"📊"}],team:[{id:"backlog",label:"Backlog",icon:"≡"},{id:"sprint",label:"Sprint",icon:"⚡"},{id:"capacity",label:"Kapasitet",icon:"👥"},{id:"dashboard",label:"Dashboard",icon:"📊"},{id:"portfolio",label:"Portefølje",icon:"📁"},{id:"benefit-report",label:"Nytterapport",icon:"📊"}],admin:[{id:"config",label:"Konfig",icon:"⚙️"},{id:"goals",label:"Mål",icon:"🎯"},{id:"portfolio",label:"Portefølje",icon:"📁"}]};
  const saveConfig=()=>{try{localStorage.setItem("hemit-cfg",JSON.stringify({config,team,goals,sprints}));}catch(e){}notify("Konfigurasjon lagret ✓");};
  const loadConfig=()=>{try{const d=JSON.parse(localStorage.getItem("hemit-cfg"));if(d){if(d.config)setConfig(d.config);if(d.team)setTeam(d.team);if(d.goals)setGoals(d.goals);if(d.sprints)setSprints(d.sprints);notify("Lastet.");}}catch(e){notify("Ingen lagret.","warning");}};

  const StSel=({task})=><select value={task.status} onChange={e=>{e.stopPropagation();updateTask(task.id,{status:e.target.value});}} onClick={e=>e.stopPropagation()} style={{padding:"3px 5px",borderRadius:5,border:`1px solid ${stMap[task.status]?.color||C.border}`,background:stMap[task.status]?.bg,color:stMap[task.status]?.color,fontSize:10,fontWeight:600,cursor:"pointer"}}>{STATUSES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select>;
  const SPSel=({task})=><select value={task.size} onChange={e=>{e.stopPropagation();updateTask(task.id,{size:parseInt(e.target.value)||0});}} onClick={e=>e.stopPropagation()} style={{padding:"3px 5px",borderRadius:5,border:`1px solid ${C.border}`,fontSize:10,fontWeight:600,cursor:"pointer",background:C.surface,color:C.text}}><option value={0}>–</option>{FIBONACCI.map(f=><option key={f.v} value={f.v}>{f.l}</option>)}</select>;
  const MemSel=({task})=><select value={task.assignee||""} onChange={e=>{e.stopPropagation();updateTask(task.id,{assignee:e.target.value});}} onClick={e=>e.stopPropagation()} style={{padding:"3px 5px",borderRadius:5,border:`1px solid ${C.border}`,fontSize:10,fontWeight:600,cursor:"pointer",background:C.surface,color:C.text,maxWidth:110}}><option value="">–</option>{team.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select>;
  const SprintSel=({task})=>{const sp=sprintMap[task.sprintId];return <select value={task.sprintId||""} onChange={e=>{e.stopPropagation();updateTask(task.id,{sprintId:e.target.value||null});}} onClick={e=>e.stopPropagation()} style={{padding:"3px 5px",borderRadius:5,border:`1px solid ${sp?C.success:C.border}`,fontSize:10,fontWeight:600,cursor:"pointer",background:sp?C.successBg:C.surface,color:sp?C.success:C.text,maxWidth:120}}><option value="">Backlog</option>{sprints.filter(s=>s.status!=="completed").map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>;};
  const Empty=({icon,text,guide,actions})=><div style={{textAlign:"center",padding:SP.xxl}}><div style={{fontSize:36,marginBottom:SP.sm}}>{icon}</div><p style={{color:C.textMuted,fontSize:13}}>{text}</p>{guide&&<p style={{color:C.textSec,fontSize:11,maxWidth:400,margin:`${SP.sm}px auto`}}>{guide}</p>}{actions&&<div style={{display:"flex",gap:SP.sm,justifyContent:"center",marginTop:SP.lg}}>{actions.map((a,i)=><Btn key={i} variant="secondary" onClick={a.onClick} style={{fontSize:11}}>{a.icon} {a.label}</Btn>)}</div>}</div>;


  /* B.3: Loading screen */
  if(loading)return <ThemeContext.Provider value={C}><div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:C.bg}}><div style={{textAlign:"center"}}><div className={s.spinner}/><p style={{color:C.textMuted,marginTop:SP.lg,fontSize:13}}>Laster...</p></div></div></ThemeContext.Provider>;

  return <ThemeContext.Provider value={C}><div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'Source Sans 3','Calibri',system-ui,sans-serif"}}>
    <a href="#main" className={s.skip} style={{background:C.primary,color:"#fff"}}>Hopp til hovedinnhold</a>
    {/* B.14: Notification queue */}
    {notes.length>0&&<div style={{position:"fixed",top:12,right:12,zIndex:300,display:"flex",flexDirection:"column",gap:SP.xs}}>
      {notes.map(n=><div key={n.id} role="alert" aria-live="polite" className={s.slideIn} style={{padding:`${SP.sm}px ${SP.lg}px`,borderRadius:10,background:n.type==="success"?C.successBg:C.warningBg,color:n.type==="success"?C.success:C.warning,fontWeight:600,fontSize:12,boxShadow:"0 4px 16px rgba(0,0,0,.15)",maxWidth:460,display:"flex",alignItems:"center",gap:SP.sm}}>{n.msg}<button onClick={()=>setNotes(prev=>prev.filter(x=>x.id!==n.id))} style={{marginLeft:SP.sm,background:"none",border:"none",cursor:"pointer",opacity:.6,fontSize:12,color:"inherit"}}>✕</button></div>)}
    </div>}
    {modal?.type==="delete"&&<div role="dialog" aria-modal="true" aria-label="Bekreft sletting" onKeyDown={e=>{if(e.key==="Escape")setModal(null);}} style={{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.5)"}} onClick={()=>setModal(null)}><Card onClick={e=>e.stopPropagation()} style={{maxWidth:380,textAlign:"center",padding:24}}><div style={{fontSize:28,marginBottom:6}}>⚠️</div><h3 style={{fontSize:16,fontWeight:700,color:C.danger,margin:"0 0 14px"}}>Slette «{modal.task.title}»?</h3><div style={{display:"flex",justifyContent:"center",gap:8}}><Btn variant="secondary" onClick={()=>setModal(null)} style={{background:C.surfaceAlt,color:C.primary}}>Avbryt</Btn><Btn variant="danger" onClick={()=>deleteTask(modal.task.id)} style={{background:C.dangerBg,color:C.danger}}>Slett</Btn></div></Card></div>}
    {modal?.type==="review"&&<ReviewModal task={modal.task} onClose={()=>setModal(null)} config={config} goals={goals} role={role} updateTask={updateTask} addComment={addComment} notify={notify} getSubtasks={getSubtasks} subProgress={subProgress} addSubtask={addSubtask} addSubtasksBatch={addSubtasksBatch} setTasks={setTasks} tasks={tasks} team={team} sprints={sprints} sprintMap={sprintMap}/>}
    {confirmSubmit&&<div role="dialog" aria-modal="true" aria-label="Bekreft innsending" onKeyDown={e=>{if(e.key==="Escape")setConfirmSubmit(null);}} style={{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.5)"}} onClick={()=>setConfirmSubmit(null)}><Card onClick={e=>e.stopPropagation()} style={{maxWidth:440,padding:24}}><div style={{fontSize:28,textAlign:"center",marginBottom:6}}>📋</div><h3 style={{fontSize:16,fontWeight:700,color:C.primary,margin:"0 0 10px",textAlign:"center"}}>Bekreft innsending</h3><div style={{fontSize:12,color:C.textSec,marginBottom:10}}><div><strong>Tittel:</strong> {confirmSubmit.title}</div><div><strong>Innmelder:</strong> {confirmSubmit.submitterName}</div>{confirmSubmit.desc&&<div style={{marginTop:4,fontSize:11,color:C.textMuted}}>{confirmSubmit.desc.slice(0,120)}{confirmSubmit.desc.length>120?"...":""}</div>}</div><div style={{display:"flex",justifyContent:"center",gap:8}}><Btn variant="secondary" onClick={()=>setConfirmSubmit(null)} style={{background:C.surfaceAlt,color:C.primary}}>Avbryt</Btn><Btn onClick={doSubmit}>Bekreft</Btn></div></Card></div>}
    {/* D.5: Forbedret eksport-dialog */}
    {modal?.type==="export"&&(()=>{const allActive=tasks.filter(t=>!t.archived);return <div role="dialog" aria-modal="true" aria-label="Eksporter" onKeyDown={e=>{if(e.key==="Escape")setModal(null);}} style={{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.5)"}} onClick={()=>setModal(null)}><Card onClick={e=>e.stopPropagation()} style={{maxWidth:560,padding:24,maxHeight:"90vh",overflow:"auto"}}><SH>📥 Eksporter data</SH><div style={{marginBottom:10}}><label style={{fontSize:9,fontWeight:600,color:C.textMuted,textTransform:"uppercase",display:"block",marginBottom:3}}>Mal</label><select value={exportTpl} onChange={e=>{setExportTpl(e.target.value);const tpl=EXPORT_TEMPLATES.find(t=>t.id===e.target.value);if(tpl)setExportCols(tpl.cols);}} style={{width:"100%",padding:"6px 10px",fontSize:11,borderRadius:6,border:`1px solid ${C.border}`,background:C.surface,color:C.text}}><option value="">Egendefinert</option>{EXPORT_TEMPLATES.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}</select></div><div style={{marginBottom:10}}><label style={{fontSize:9,fontWeight:600,color:C.textMuted,textTransform:"uppercase",display:"block",marginBottom:3}}>Kolonner</label><div style={{display:"flex",flexWrap:"wrap",gap:4}}>{EXPORT_COLUMNS.map(c=><label key={c.id} style={{display:"flex",alignItems:"center",gap:3,fontSize:10,padding:"3px 6px",background:exportCols.includes(c.id)?C.primary+"15":C.surfaceAlt,borderRadius:4,cursor:"pointer",border:`1px solid ${exportCols.includes(c.id)?C.primary+"40":"transparent"}`}}><input type="checkbox" checked={exportCols.includes(c.id)} onChange={()=>{setExportCols(p=>p.includes(c.id)?p.filter(x=>x!==c.id):[...p,c.id]);setExportTpl("");}} style={{width:12,height:12}}/>{c.label}</label>)}</div></div><div style={{marginBottom:10,padding:8,background:C.surfaceAlt,borderRadius:6,fontSize:9,color:C.textMuted}}><strong>Forhåndsvisning ({allActive.length} oppgaver):</strong><div style={{marginTop:4,overflowX:"auto"}}><table style={{borderCollapse:"collapse",fontSize:9}}><thead><tr>{exportCols.map(id=>{const col=EXPORT_COLUMNS.find(c=>c.id===id);return col?<th key={id} style={{padding:"2px 6px",textAlign:"left",fontWeight:600,borderBottom:`1px solid ${C.border}`}}>{col.label}</th>:null;})}</tr></thead><tbody>{allActive.slice(0,3).map(t=><tr key={t.id}>{exportCols.map(id=>{const col=EXPORT_COLUMNS.find(c=>c.id===id);return col?<td key={id} style={{padding:"2px 6px",borderBottom:`1px solid ${C.border}30`}}>{String(col.get(t)).slice(0,30)}</td>:null;})}</tr>)}</tbody></table></div></div><div style={{display:"flex",gap:6,justifyContent:"flex-end"}}><Btn variant="secondary" onClick={()=>setModal(null)} style={{background:C.surfaceAlt,color:C.primary}}>Avbryt</Btn><Btn variant="secondary" onClick={()=>{exportCsvAdvanced(allActive,exportCols,makeComposite(config),"hemit-eksport.csv");setModal(null);notify("CSV eksportert!");}} style={{background:C.surfaceAlt,color:C.primary}}>📥 CSV</Btn><Btn onClick={()=>{const cols=exportCols.map(id=>EXPORT_COLUMNS.find(c=>c.id===id)).filter(Boolean);const html="<table>"+`<tr>${cols.map(c=>"<th>"+c.label+"</th>").join("")}</tr>`+allActive.map(t=>`<tr>${cols.map(c=>"<td>"+String(c.get(t))+"</td>").join("")}</tr>`).join("")+"</table>";exportPrintReport("Eksport",html);setModal(null);}}>🖨️ Skriv ut</Btn></div></Card></div>;})()}
    <header role="banner" style={{background:dark?"#0A1628":"#003087",color:"#fff",borderBottom:`3px solid ${C.primaryLight}`}}>
      <div className={s.headerInner} style={{maxWidth:1400,margin:"0 auto",padding:"0 16px",display:"flex",alignItems:"center",justifyContent:"space-between",height:52,flexWrap:"wrap",gap:4}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontWeight:700,fontSize:14}}>{config.appTitle||"Hemit Nyttestyring"}</span><span style={{fontSize:9,opacity:.5}}>v7.0</span>{config.auth?.enabled&&<span style={{fontSize:8,padding:"2px 6px",borderRadius:4,background:"rgba(45,138,78,.3)",color:"#4ADE80",fontWeight:600}}>🔐 Entra ID</span>}</div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <button aria-label={dark?"Bytt til lyst tema":"Bytt til mørkt tema"} onClick={()=>setDark(!dark)} style={{background:"rgba(255,255,255,.1)",border:"none",borderRadius:4,padding:"3px 8px",color:"#fff",fontSize:11,cursor:"pointer"}}>{dark?"☀️":"🌙"}</button>
          {!config.auth?.enabled&&<div role="group" aria-label="Rollevalg" style={{display:"flex",gap:1,background:"rgba(255,255,255,.06)",borderRadius:6,padding:2}}>{[["employee","Medarbeider"],["forum","Utviklingsforum"],["team","Leveranseteam"],["admin","Admin"]].map(([r,l])=><button key={r} aria-pressed={role===r} onClick={()=>{setRole(r);setTab(roleTabs[r][0].id);setSelectedTask(null);setBatchSel([]);}} style={{padding:"3px 9px",borderRadius:4,border:"none",cursor:"pointer",fontSize:10,fontWeight:600,background:role===r?"rgba(255,255,255,.18)":"transparent",color:role===r?"#fff":"rgba(255,255,255,.4)"}}>{l}</button>)}</div>}
          {config.auth?.enabled&&<div style={{display:"flex",alignItems:"center",gap:4,padding:"3px 9px",background:"rgba(255,255,255,.08)",borderRadius:6}}><span style={{fontSize:10,color:"rgba(255,255,255,.6)"}}>👤 {role==="admin"?"Administrator":role==="forum"?"Utviklingsforum":role==="team"?"Leveranseteam":"Medarbeider"}</span></div>}
          <nav aria-label="Hovednavigasjon">{isMobile?<div style={{position:"relative"}}><button aria-label="Meny" aria-expanded={mobileMenuOpen} onClick={()=>setMobileMenuOpen(p=>!p)} style={{padding:"3px 9px",borderRadius:6,border:"none",cursor:"pointer",fontSize:10,fontWeight:600,background:"rgba(255,255,255,.18)",color:"#fff",display:"flex",alignItems:"center",gap:4,position:"relative"}}>☰ {(roleTabs[role]||[]).find(t=>t.id===tab)?.label||"Meny"}{tab==="inbox"&&unreviewed.length>0&&<span style={{width:14,height:14,borderRadius:"50%",background:C.danger,color:"#fff",fontSize:8,fontWeight:800,display:"inline-flex",alignItems:"center",justifyContent:"center"}}>{unreviewed.length}</span>}</button>{mobileMenuOpen&&<><div className={s.mobileMenuOverlay} onClick={()=>setMobileMenuOpen(false)}/><div className={s.mobileMenu}>{(roleTabs[role]||[]).map(t=><button key={t.id} onClick={()=>{setTab(t.id);setSelectedTask(null);setBatchSel([]);setMobileMenuOpen(false);}} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"8px 12px",border:"none",cursor:"pointer",fontSize:12,fontWeight:tab===t.id?700:400,background:tab===t.id?C.primaryLight+"20":"transparent",color:tab===t.id?C.primary:C.text,borderRadius:6,position:"relative"}}>{t.icon} {t.label}{t.id==="inbox"&&unreviewed.length>0&&<span style={{marginLeft:"auto",width:16,height:16,borderRadius:"50%",background:C.danger,color:"#fff",fontSize:9,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>{unreviewed.length}</span>}</button>)}</div></>}</div>:<div role="tablist" style={{display:"flex",gap:1,background:"rgba(255,255,255,.06)",borderRadius:6,padding:2}}>{(roleTabs[role]||[]).map(t=><button key={t.id} role="tab" aria-selected={tab===t.id} aria-label={t.label} onClick={()=>{setTab(t.id);setSelectedTask(null);setBatchSel([]);}} style={{padding:"3px 9px",borderRadius:4,border:"none",cursor:"pointer",fontSize:10,fontWeight:600,background:tab===t.id?"rgba(255,255,255,.18)":"transparent",color:tab===t.id?"#fff":"rgba(255,255,255,.4)",position:"relative"}}>{t.icon} {t.label}{t.id==="inbox"&&unreviewed.length>0&&<span style={{position:"absolute",top:-3,right:-3,width:14,height:14,borderRadius:"50%",background:C.danger,color:"#fff",fontSize:8,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>{unreviewed.length}</span>}</button>)}</div>}</nav>
        </div>
      </div>
    </header>
    <main id="main" style={{maxWidth:1400,margin:"0 auto",padding:"16px 16px 50px"}}>

      {role==="employee"&&tab==="submit"&&<div style={{maxWidth:720,margin:"0 auto"}}>
        <h1 style={{fontSize:20,fontWeight:700,color:C.primary,margin:"0 0 12px"}}>Meld inn behov</h1>
        {aiError&&<div style={{padding:"8px 14px",background:C.dangerBg,borderRadius:8,marginBottom:10,display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:11,color:C.danger,flex:1}}>⚠️ {aiError}</span><Btn variant="ghost" onClick={()=>setAiError(null)} style={{fontSize:10,color:C.danger,padding:"2px 6px"}}>✕</Btn></div>}
        <form onSubmit={handleSubmit}>

        {/* ═══ Kort 1: Generell informasjon ═══ */}
        <Card style={{marginBottom:12}}><SH>Generell informasjon</SH><div className={s.submitGrid} style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div style={{gridColumn:"1/-1"}}><TF label="Tittel" id="s-t" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} required placeholder="Kort beskrivelse av behovet"/></div>
          {dupes.length>0&&<div style={{gridColumn:"1/-1",padding:"6px 10px",background:C.warningBg,borderRadius:7}}><div style={{fontSize:11,fontWeight:700,color:C.warning}}>⚠️ Mulige duplikater:</div>{dupes.map(d=><div key={d.id} style={{fontSize:11,color:C.textSec}}>• {d.id}: {d.title}</div>)}</div>}
          <div style={{gridColumn:"1/-1"}}><TF label="Beskriv problemet" id="s-d" value={form.desc} onChange={e=>setForm(f=>({...f,desc:e.target.value}))} multiline placeholder="Hva er utfordringen?"/></div>
          <TF label="Ditt navn" id="s-n" value={form.submitterName} onChange={e=>setForm(f=>({...f,submitterName:e.target.value}))} required placeholder="Fornavn Etternavn"/>
          <TF label="Avdeling" id="s-dep" value={form.submitterDept} onChange={e=>setForm(f=>({...f,submitterDept:e.target.value}))} placeholder="Økonomiavd."/>
          <TF label="Prosess-/systemeier" id="s-o" value={form.processOwner} onChange={e=>setForm(f=>({...f,processOwner:e.target.value}))} placeholder="Hvem eier prosessen?"/>
          <TF label="Nytteeier" id="s-bowner" value={form.benefitOwner||""} onChange={e=>setForm(f=>({...f,benefitOwner:e.target.value}))} placeholder="Hvem er ansvarlig for nytterealisering?"/>
          <SF label="Viktighet" id="s-p" value={form.priority} onChange={e=>setForm(f=>({...f,priority:e.target.value}))}>{PRIORITIES.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</SF>
          <TF label="EQS-referanse" id="s-eqs" value={form.eqsRef} onChange={e=>setForm(f=>({...f,eqsRef:e.target.value}))} placeholder="EQS-xxxx eller 'Finnes ikke'"/>
          <TF label="ServiceNow sak" id="s-snow" value={form.serviceNowRef} onChange={e=>setForm(f=>({...f,serviceNowRef:e.target.value}))} placeholder="INC/REQ-nummer"/>
          <TF label="Aktuell pilotenhet" id="s-pilot" value={form.pilotUnit} onChange={e=>setForm(f=>({...f,pilotUnit:e.target.value}))} placeholder="Avdeling/enhet for pilot"/>
          <div style={{gridColumn:"1/-1"}}><SF label="Aktuelle foretak" id="s-ent" value={form.enterprise} onChange={e=>setForm(f=>({...f,enterprise:e.target.value}))}><option value="">Velg foretak...</option>{ENTERPRISES.map(e=><option key={e.id} value={e.id}>{e.label}</option>)}</SF></div>
          <div style={{gridColumn:"1/-1"}}><SF label="Antatt løsningskategori" id="s-cat" value={form.solutionCategory} onChange={e=>setForm(f=>({...f,solutionCategory:e.target.value}))}>{SOLUTION_CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}</SF></div>
        </div>
        <div style={{marginTop:10}}><GoalPicker goals={goals} selected={form.goals} onChange={g=>setForm(f=>({...f,goals:g}))}/></div>
        <div style={{marginTop:10}}><AttachArea attachments={form.attachments} onChange={a=>setForm(f=>({...f,attachments:a}))}/></div>
        </Card>

        {/* ═══ Kort 2: Nå-situasjon og prosessdetaljer ═══ */}
        <Card style={{marginBottom:12}}><SH>Nå-situasjon og prosessdetaljer</SH>
          <div style={{marginBottom:10}}><label style={{fontSize:11,fontWeight:600,color:C.textSec}}>Gjelder dette en oppgave som utføres manuelt i dag?</label>
            <div style={{display:"flex",gap:12,marginTop:4}}>{[["yes","Ja"],["no","Nei"]].map(([v,l])=><label key={v} style={{display:"flex",alignItems:"center",gap:4,fontSize:12,cursor:"pointer",color:C.text}}><input type="radio" name="manualTask" value={v} checked={form.manualTask===v} onChange={e=>setForm(f=>({...f,manualTask:e.target.value}))} style={{accentColor:C.primary}}/>{l}</label>)}</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <TF label="Hvem utfører oppgaven i dag?" id="s-performer" value={form.taskPerformer} onChange={e=>setForm(f=>({...f,taskPerformer:e.target.value}))} placeholder="Rolle/stilling"/>
            <TF label="Frekvens" id="s-freq" value={form.frequency} onChange={e=>setForm(f=>({...f,frequency:e.target.value}))} placeholder="Daglig, ukentlig, månedlig..."/>
            <TF label="Volum per gang" id="s-vol" value={form.volumePerTime} onChange={e=>setForm(f=>({...f,volumePerTime:e.target.value}))} placeholder="Antall transaksjoner/hendelser"/>
            <div><TF label="Forventet tidsbesparelse per år" id="s-save" type="number" value={form.annualTimeSaving} onChange={e=>setForm(f=>({...f,annualTimeSaving:e.target.value}))} placeholder="0"/><span style={{fontSize:9,color:C.textMuted,marginTop:2,display:"block"}}>Timer</span></div>
          </div>
          <div style={{marginTop:10}}><TF label="Hvilke IT-systemer er involvert?" id="s-sys" value={form.involvedSystems} onChange={e=>setForm(f=>({...f,involvedSystems:e.target.value}))} placeholder="DIPS, Helseplattformen, HMN nett..."/></div>
        </Card>

        {/* ═══ Kort 3: Beskrivelse og Bakgrunn ═══ */}
        <Card style={{marginBottom:12}}><SH>Beskrivelse og Bakgrunn</SH>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <TF label="Hva er behovet eller oppgaven i korte trekk?" id="s-need" value={form.needSummary} onChange={e=>setForm(f=>({...f,needSummary:e.target.value}))} multiline required placeholder="Beskriv kort hva som ønskes løst..."/>
            <TF label="Bakgrunn for innmeldingen" id="s-bg" value={form.background} onChange={e=>setForm(f=>({...f,background:e.target.value}))} multiline required placeholder="Hvorfor meldes dette inn nå? Kontekst og drivere..."/>
          </div>
        </Card>

        {/* ═══ Kort 4: Gevinster og Alternativer ═══ */}
        <Card style={{marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <SH>Gevinster og Alternativer</SH>
            <Btn variant="secondary" disabled={aiLoading==="benefits"} onClick={async()=>{
              if(!form.needSummary.trim()||!form.background.trim()){setAiError("Fyll ut «Behov» og «Bakgrunn» (Kort 3) før AI kan foreslå gevinster.");return;}
              setAiLoading("benefits");setAiError(null);
              try{const r=await suggestBenefits(config,SOLUTION_CATEGORIES.find(c=>c.id===form.solutionCategory)?.label||"",form.needSummary,form.background);
                setForm(f=>({...f,qualitativeBenefits:r.kvalitative||"",quantitativeBenefits:r.kvantitative||""}));
              }catch(e){setAiError(e.message);}finally{setAiLoading(null);}
            }} style={{fontSize:10,padding:"4px 10px"}}>{aiLoading==="benefits"?"⏳ Analyserer...":"✨ Foreslå gevinster"}</Btn>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <TF label="Kvalitative gevinster" id="s-qben" value={form.qualitativeBenefits} onChange={e=>setForm(f=>({...f,qualitativeBenefits:e.target.value}))} multiline placeholder="Forbedret kvalitet, økt sikkerhet, bedre brukeropplevelse..."/>
            <TF label="Kvantitative gevinster" id="s-kben" value={form.quantitativeBenefits} onChange={e=>setForm(f=>({...f,quantitativeBenefits:e.target.value}))} multiline placeholder="Timer spart, kostnadsreduksjon, antall berørte brukere..."/>
            <TF label="Alternative løsninger" id="s-alt" value={form.alternativeSolutions} onChange={e=>setForm(f=>({...f,alternativeSolutions:e.target.value}))} multiline placeholder="Hvilke andre løsninger er vurdert?"/>
            <TF label="Annen relevant informasjon" id="s-other" value={form.otherInfo} onChange={e=>setForm(f=>({...f,otherInfo:e.target.value}))} multiline placeholder="Tilleggsinformasjon..."/>
          </div>
        </Card>

        {/* ═══ Kort 5: Prioriteringskriterier ═══ */}
        <Card style={{marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <SH>Prioriteringskriterier (0–10)</SH>
            <Btn variant="secondary" disabled={aiLoading==="scoring"} onClick={async()=>{
              if(!form.needSummary.trim()||!form.background.trim()){setAiError("Fyll ut «Behov» og «Bakgrunn» (Kort 3) før AI kan vurdere.");return;}
              setAiLoading("scoring");setAiError(null);
              try{const r=await autoScore(config,SOLUTION_CATEGORIES.find(c=>c.id===form.solutionCategory)?.label||"",form.needSummary,form.background,{qualitative:form.qualitativeBenefits,quantitative:form.quantitativeBenefits});
                const keys=SCORING_CRITERIA.map(c=>c.key);let i=0;
                const cascade=()=>{if(i>=keys.length){setAiLoading(null);return;}
                  const k=keys[i];const v=r[k];
                  if(v){setForm(f=>({...f,[k]:Math.min(10,Math.max(0,v.score||0)),[k+"Reason"]:v.reason||v.begrunnelse||""}));}
                  i++;setTimeout(cascade,300);};
                cascade();
              }catch(e){setAiError(e.message);setAiLoading(null);}
            }} style={{fontSize:10,padding:"4px 10px"}}>{aiLoading==="scoring"?"⏳ Vurderer...":"✨ Vurder automatisk"}</Btn>
          </div>
          <div style={{padding:"8px 12px",background:C.accent+"0C",borderRadius:8,marginBottom:12,border:`1px solid ${C.accent}20`}}>
            <span style={{fontSize:11,color:C.accent}}>💡 Dra i glidebryteren for å angi score 0–10 for hvert kriterie. Høyere score = høyere prioritet. Tekstbeskrivelsen oppdateres automatisk.</span>
          </div>
          {SCORING_CRITERIA.map(c=><KriterieScoring key={c.key} label={c.label} weight={c.weight} value={form[c.key]||0} onChange={e=>setForm(f=>({...f,[c.key]:parseInt(e.target.value)}))} examples={SCORE_EXAMPLES[c.key]||[]} reason={form[c.key+"Reason"]||""} onReasonChange={e=>setForm(f=>({...f,[c.key+"Reason"]:e.target.value}))}/>)}
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:12,background:C.primary+"08",borderRadius:8,marginTop:6}}>
            <span style={{fontSize:10,color:C.textMuted,marginRight:8}}>VEKTET SCORE</span>
            <span style={{fontSize:28,fontWeight:800,color:C.primary}}>{calcWeightedScore(form)}</span>
            <span style={{fontSize:10,color:C.textMuted,marginLeft:4}}>/ 10</span>
          </div>
        </Card>

        <div style={{display:"flex",justifyContent:"flex-end",gap:6}}><Btn variant="secondary" onClick={()=>setForm(emptyForm)} style={{background:C.surfaceAlt,color:C.primary}}>Nullstill</Btn><Btn type="submit">Send inn forslag</Btn></div>
        </form></div>}

      {role==="employee"&&tab==="my"&&<div><h1 style={{fontSize:20,fontWeight:700,color:C.primary,margin:"0 0 12px"}}>Mine forslag</h1>
        {tasks.filter(t=>!t.archived).length===0?<Card><Empty icon="📋" text="Ingen forslag ennå." guide="Bruk «Meld forslag»-fanen for å sende inn ditt første forbedringsforslag."/></Card>
        :tasks.filter(t=>!t.archived).slice(0,15).map(t=>{const st=stMap[t.status];return <Card key={t.id} style={{borderLeft:`4px solid ${st?.color}`,padding:"10px 14px",marginBottom:6}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:4}}><div><div style={{fontWeight:600,fontSize:13}}>{t.title}</div><div style={{fontSize:10,color:C.textMuted}}>{t.date} · {t.submitterDept}</div></div><Badge color={st?.color} bg={st?.bg}>{st?.label}</Badge></div></Card>;})}</div>}

      {role==="forum"&&tab==="inbox"&&<div><h1 style={{fontSize:20,fontWeight:700,color:C.primary,margin:"0 0 4px"}}>Innkomne ({unreviewed.length})</h1>
        {unreviewed.length===0?<Card><Empty icon="🎉" text="Alle vurdert!" guide="Nye forbedringsforslag fra medarbeidere vil dukke opp her for vurdering."/></Card>
        :<div style={{display:"flex",flexDirection:"column",gap:8}}>{unreviewed.map(t=><Card key={t.id} style={{borderLeft:`4px solid ${C.purple}`}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}><div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}><span style={{fontWeight:700,fontSize:13}}>{t.title}</span><Badge color={prMap[t.priority]?.color} bg={C.surfaceAlt} style={{fontSize:9}}>{prMap[t.priority]?.label}</Badge></div><p style={{fontSize:11,color:C.textSec,margin:"0 0 3px"}}>{t.desc||"—"}</p><div style={{fontSize:10,color:C.textMuted}}>Forslagsstiller: {t.submitterName} · {t.processOwner&&`Prosess-/systemeier: ${t.processOwner} · `}{t.date}</div><div style={{marginTop:3,display:"flex",gap:3,flexWrap:"wrap"}}>{t.eqsRef&&<Badge color="#0891B2" bg="#E0F7FA" style={{fontSize:8}}>📋 {t.eqsRef}</Badge>}{t.personalData==="yes"&&<Badge color={C.danger} bg={C.dangerBg} style={{fontSize:8}}>🔒 Persondata</Badge>}{t.personalData==="unknown"&&<Badge color={C.warning} bg={C.warningBg} style={{fontSize:8}}>❓ Persondata?</Badge>}</div></div><div style={{display:"flex",gap:4}}><Btn variant="danger" onClick={()=>setModal({type:"delete",task:t})} style={{fontSize:10,padding:"4px 8px",background:C.dangerBg,color:C.danger}}>🗑️</Btn><Btn onClick={()=>setModal({type:"review",task:t})} style={{fontSize:10}}>Vurder →</Btn></div></div></Card>)}</div>}</div>}

      {role==="forum"&&tab==="review"&&<div><h1 style={{fontSize:20,fontWeight:700,color:C.primary,margin:"0 0 12px"}}>Alle ({activeTasks.length})</h1><label style={{fontSize:11,color:C.textMuted,display:"flex",gap:4,alignItems:"center",marginBottom:8}}><input type="checkbox" checked={showArchived} onChange={e=>setShowArchived(e.target.checked)}/>Vis arkiverte</label>
        {activeTasks.map(t=>{const st=stMap[t.status];return <Card key={t.id} style={{padding:"10px 14px",borderLeft:`4px solid ${t.reviewed?C.success:C.purple}`,marginBottom:5,cursor:"pointer",opacity:t.archived?.6:1}} onClick={()=>setModal({type:"review",task:t})}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,flexWrap:"wrap"}}><div style={{flex:1}}><span style={{fontWeight:700,fontSize:12}}>{t.title}</span>{t.archived&&<Badge color={C.textMuted} bg={C.surfaceAlt} style={{fontSize:8,marginLeft:4}}>Arkiv</Badge>}<div style={{display:"flex",gap:3,marginTop:2}}>{(t.tracks||[]).map(tr=><TBadge key={tr} id={tr}/>)}</div></div><div style={{display:"flex",gap:6,alignItems:"center"}}><span style={{fontSize:13,fontWeight:800,color:C.primary}}>{composite(t)}</span><Badge color={st?.color} bg={st?.bg}>{st?.label}</Badge>{!t.archived&&(t.status==="done"||t.status==="rejected")&&<Btn variant="ghost" onClick={e=>{e.stopPropagation();archiveTask(t.id);}} style={{fontSize:9,padding:"2px 5px",color:C.textSec}}>📦</Btn>}</div></div></Card>;})}</div>}


      {tab==="backlog"&&<div>
        <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8,marginBottom:10}}><h1 style={{fontSize:20,fontWeight:700,color:C.primary,margin:0}}>Backlog</h1><div style={{display:"flex",gap:4,flexWrap:"wrap",alignItems:"center"}}>
          <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="🔍 Søk..." style={{padding:"4px 8px",borderRadius:6,border:`1px solid ${C.border}`,fontSize:11,width:140,background:C.surface,color:C.text}}/>
          <select value={filterTrack} onChange={e=>setFilterTrack(e.target.value)} style={{padding:"4px 8px",borderRadius:6,border:`1px solid ${C.border}`,fontSize:10,background:C.surface,color:C.text}}><option value="all">Alle løyper</option>{TRACKS.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}</select>
          <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{padding:"4px 8px",borderRadius:6,border:`1px solid ${C.border}`,fontSize:10,background:C.surface,color:C.text}}><option value="all">Alle statuser</option>{STATUSES.filter(s=>s.id!=="archived").map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select>
          {[["score","Score"],["priority","Prio"],["date","Dato"],["id","Nr"]].map(([k,l])=><Btn key={k} variant={sortBy===k?"primary":"secondary"} onClick={()=>setSortBy(k)} style={{padding:"4px 8px",fontSize:10,...(sortBy!==k?{background:C.surfaceAlt,color:C.primary}:{})}}>{l}</Btn>)}
          <label style={{fontSize:10,color:C.textMuted,display:"flex",gap:3,alignItems:"center"}}><input type="checkbox" checked={showArchived} onChange={e=>setShowArchived(e.target.checked)}/>Arkiv</label>
          <Btn variant="secondary" onClick={()=>{const rows=sorted.filter(t=>t.reviewed).map(t=>[t.id,t.title,stMap[t.status]?.label,t.priority,(t.tracks||[]).join(";"),composite(t),t.size,t.actualHours||0,t.submitterName,t.processOwner||"",t.date,t.sprintId||""]);exportCsv(["ID","Tittel","Status","Prioritet","Løyper","Score","Story Points","Timer","Innmelder","Prosesseier","Dato","Sprint"],rows,"hemit-backlog.csv");notify("CSV eksportert");}} style={{padding:"4px 8px",fontSize:10,background:C.surfaceAlt,color:C.primary}}>📥 CSV</Btn></div></div>
        {batchSel.length>0&&<div style={{marginBottom:8,padding:"6px 12px",background:C.primaryLight+"20",borderRadius:8,display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}><span style={{fontSize:11,fontWeight:600}}>{batchSel.length} valgt</span><select onChange={e=>{if(e.target.value)batchAction("status",e.target.value);e.target.value="";}} style={{fontSize:10,padding:"2px 6px",borderRadius:4,border:`1px solid ${C.border}`,background:C.surface,color:C.text}}><option value="">Status →</option>{STATUSES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select><select onChange={e=>{if(e.target.value)batchAction("sprint",e.target.value);e.target.value="";}} style={{fontSize:10,padding:"2px 6px",borderRadius:4,border:`1px solid ${C.success}`,background:C.successBg,color:C.success}}><option value="">→Sprint...</option>{sprints.filter(s=>s.status!=="completed").map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select><Btn variant="ghost" onClick={()=>batchAction("archive")} style={{fontSize:10,color:C.textSec}}>📦</Btn><Btn variant="ghost" onClick={()=>setBatchSel([])} style={{fontSize:10,color:C.textMuted}}>✕</Btn></div>}
        {reviewedSorted.length===0?<Card><Empty icon="📋" text="Ingen oppgaver matcher." guide="Prøv å justere filtrene eller søkeord, eller legg til nye forslag."/></Card>
        :isMobile?<div style={{display:"flex",flexDirection:"column",gap:SP.sm}}>{paged.map(t=>{const sc=composite(t);const pc=prMap[t.priority]?.color||C.textMuted;const st=stMap[t.status];return <Card key={t.id} style={{padding:SP.md,cursor:"pointer",borderLeft:`3px solid ${pc}`,opacity:t.archived?.5:1}} onClick={()=>setModal({type:"review",task:t})}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:SP.xs}}>
            <div style={{flex:1,minWidth:0}}><div style={{fontWeight:600,fontSize:12,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.parentId&&<span style={{color:C.textMuted,marginRight:3}}>↳</span>}{t.title}</div><div style={{fontSize:10,color:C.textMuted,marginTop:2}}>{t.submitterName}{t.processOwner&&` · ${t.processOwner}`}</div></div>
            <span style={{fontSize:16,fontWeight:800,color:sc>200?C.success:sc>100?C.warning:C.danger,flexShrink:0}}>{sc}</span>
          </div>
          <div style={{display:"flex",gap:SP.xs,marginTop:SP.xs,flexWrap:"wrap",alignItems:"center"}}>
            {(t.tracks||[]).map(tr=><TBadge key={tr} id={tr}/>)}
            {st&&<Badge variant="status" color={st.color} bg={st.bg} size="small">{st.icon} {st.label}</Badge>}
            {t.size&&<Badge variant="count" size="small">{t.size} SP</Badge>}
            {isBlockedByDeps(t)&&<Badge color={C.danger} bg={C.dangerBg} size="small">🚫 Blokkert</Badge>}
          </div>
        </Card>;})}</div>
        :<Card style={{padding:0,overflow:"auto"}}><table className={s.backlogTable} style={{width:"100%",borderCollapse:"collapse",fontSize:11}}><thead><tr style={{background:C.surfaceAlt,borderBottom:`2px solid ${C.primary}`}}>{[{h:"",t:""},{h:"#",t:""},{h:"Oppgave",t:""},{h:"Løype",t:""},{h:"Score",t:TIP.Score},{h:"Story Points",t:TIP.SP},{h:"Timer",t:"Faktisk medgått tid i timer"},{h:"Status",t:""},{h:"Tildelt",t:"Teammedlem tildelt oppgaven"},{h:"Sprint",t:"Tildelt sprint"},{h:"",t:""}].map((c,ci)=><th key={ci} title={c.t} style={{padding:"6px 4px",textAlign:"left",fontSize:8,fontWeight:700,color:C.textSec,textTransform:"uppercase",cursor:c.t?"help":"default",borderBottom:c.t?`1px dashed ${C.textMuted}55`:"none"}}>{c.h}</th>)}</tr></thead><tbody>{paged.map((t,i)=>{const sc=composite(t);const open=selectedTask===t.id;const pc=prMap[t.priority]?.color||C.textMuted;return <React.Fragment key={t.id}>
          <tr onClick={()=>setSelectedTask(open?null:t.id)} style={{cursor:"pointer",borderBottom:`1px solid ${C.border}`,background:open?C.surfaceAlt:i%2===0?C.surface:C.surfaceAlt+"80",borderLeft:`3px solid ${pc}`,opacity:t.archived?.5:1}}>
            <td style={{padding:"6px 3px"}} onClick={e=>e.stopPropagation()}><input type="checkbox" checked={batchSel.includes(t.id)} onChange={()=>setBatchSel(p=>p.includes(t.id)?p.filter(x=>x!==t.id):[...p,t.id])}/></td>
            <td style={{padding:"6px 3px",fontWeight:600,color:C.textMuted,fontSize:9}}>{t.id}</td>
            <td style={{padding:"6px 3px"}}><div style={{fontWeight:600,...(t.parentId?{paddingLeft:14,fontSize:10}:{})}}>{t.parentId&&<span style={{color:C.textMuted,marginRight:3}}>↳</span>}{t.title}{isBlockedByDeps(t)&&<Badge color={C.danger} bg={C.dangerBg} style={{fontSize:7,marginLeft:4}}>🚫 Blokkert</Badge>}{(()=>{const sp=subProgress(t.id);return sp?<Badge color={C.accent} bg={C.accent+"10"} style={{fontSize:7,marginLeft:4}}>{sp.done}/{sp.total} del</Badge>:null;})()}</div><div style={{fontSize:9,color:C.textMuted,...(t.parentId?{paddingLeft:14}:{})}}>{t.submitterName}{t.processOwner&&` · ${t.processOwner}`}</div></td>
            <td style={{padding:"6px 3px"}}>{(t.tracks||[]).map(tr=><TBadge key={tr} id={tr}/>)}</td>
            <td style={{padding:"6px 3px"}}><span style={{fontSize:14,fontWeight:800,color:sc>200?C.success:sc>100?C.warning:C.danger}}>{sc}</span><span style={{fontSize:8,color:C.textMuted,display:"block"}}>{scoreLabel(sc)}</span></td>
                        <td style={{padding:"6px 3px"}} onClick={e=>e.stopPropagation()}>{role==="team"?<SPSel task={t}/>:<span style={{fontWeight:700,color:C.textSec}}>{t.size||"–"}</span>}</td>
            <td style={{padding:"6px 3px",fontSize:10,color:C.textMuted}}>{t.actualHours?`${t.actualHours}t`:"–"}</td>
            <td style={{padding:"6px 3px"}} onClick={e=>e.stopPropagation()}><StSel task={t}/></td>
            <td style={{padding:"6px 3px"}} onClick={e=>e.stopPropagation()}>{role==="team"?<MemSel task={t}/>:<span style={{fontSize:10,color:C.textMuted}}>{(()=>{const m=team.find(x=>x.id===t.assignee);return m?m.name:"–";})()}</span>}</td>
            <td style={{padding:"6px 3px"}} onClick={e=>e.stopPropagation()}><SprintSel task={t}/></td>
            <td style={{padding:"6px 3px"}} onClick={e=>e.stopPropagation()}><Btn variant="ghost" onClick={()=>setModal({type:"review",task:t})} style={{fontSize:9,padding:"2px 5px",color:C.textSec}}>✏️</Btn></td></tr>
          {open&&<tr><td colSpan={15} style={{padding:"10px 14px",background:C.surfaceAlt,borderBottom:`1px solid ${C.border}`}}><p style={{fontSize:11,color:C.textSec,margin:"0 0 6px"}}>{t.desc}</p>{t.personalData==="yes"&&<div style={{marginBottom:6,padding:"4px 8px",background:C.dangerBg,borderRadius:6,fontSize:10,color:C.danger}}>🔒 DPIA – <a href={config.dpiaLink} target="_blank" rel="noopener" style={{color:C.danger}}>Mal</a></div>}{(t.attachments||[]).length>0&&<div style={{marginBottom:6}}><AttachArea attachments={t.attachments} readOnly/></div>}<div style={{display:"flex",gap:4,marginBottom:6}}><SprintSel task={t}/>{!t.archived&&(t.status==="done"||t.status==="rejected")&&<Btn variant="ghost" style={{fontSize:10,color:C.textSec}} onClick={e=>{e.stopPropagation();archiveTask(t.id);}}>📦</Btn>}</div><CommentsPanel task={t} role={role} onAdd={txt=>addComment(t.id,txt)}/><HistoryPanel task={t}/></td></tr>}
        </React.Fragment>;})}</tbody></table></Card>}
        {/* B.6: Pagination */}
        {reviewedSorted.length>PAGE_SIZE&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:SP.md}}>
          <span style={{fontSize:11,color:C.textMuted}}>Viser {page*PAGE_SIZE+1}–{Math.min((page+1)*PAGE_SIZE,reviewedSorted.length)} av {reviewedSorted.length}</span>
          <div style={{display:"flex",gap:SP.xs}}><Btn variant="ghost" disabled={page===0} onClick={()=>setPage(p=>p-1)} style={{fontSize:10,padding:"4px 8px"}}>← Forrige</Btn><Btn variant="ghost" disabled={page>=totalPages-1} onClick={()=>setPage(p=>p+1)} style={{fontSize:10,padding:"4px 8px"}}>Neste →</Btn></div>
        </div>}
        </div>}

      {tab==="sprint"&&<div>
        <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:10,marginBottom:8}}><div><h1 style={{fontSize:20,fontWeight:700,color:C.primary,margin:0}}>{viewSprint?.name||"Sprint"}</h1><p style={{fontSize:12,color:C.textSec,margin:0}}>{viewSprint?.start} – {viewSprint?.end}{viewSprint?.status==="completed"?" (avsluttet)":viewSprint?.status==="planned"?" (planlagt)":""}</p></div>
          <div style={{display:"flex",gap:14,alignItems:"center"}}><div style={{width:54,height:54,borderRadius:"50%",border:`4px solid ${C.surfaceAlt}`,background:`conic-gradient(${C.success} ${sprintPct*3.6}deg, ${C.surfaceAlt} 0deg)`,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:40,height:40,borderRadius:"50%",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:C.primary}}>{sprintPct}%</div></div><div style={{textAlign:"center"}}><div style={{fontSize:22,fontWeight:800,color:C.primary}}>{doneSP}/{totalSP}</div><div style={{fontSize:8,color:C.textMuted}}>SP</div></div><div style={{textAlign:"center"}}><div style={{fontSize:22,fontWeight:800,color:C.success}}>{Math.round(totalCap)}t</div><div style={{fontSize:8,color:C.textMuted}}>KAP</div></div></div></div>
        <div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:10,background:C.surfaceAlt,padding:4,borderRadius:8}}>{sprints.map(s=>{const isSel=s.id===viewSprintId;const ico=s.status==="completed"?"✓":s.status==="active"?"⚡":"📋";return <button key={s.id} onClick={()=>setViewSprintId(s.id)} style={{padding:"5px 12px",borderRadius:6,border:"none",cursor:"pointer",fontSize:10,fontWeight:600,background:isSel?C.primary:"transparent",color:isSel?"#fff":C.textMuted}}>{ico} {s.name}</button>;})}</div>
        {(()=>{const avgSPperHour=totalCap>0&&totalSP>0?totalSP/totalCap:null;const sprintCapSP=avgSPperHour?Math.round(totalCap*avgSPperHour):null;const overloaded=totalSP>0&&totalCap>0&&totalSP>totalCap/2;return overloaded?<div style={{marginBottom:10,padding:"8px 14px",background:C.warningBg,borderRadius:8,border:`1px solid ${C.warning}30`,display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:18}}>⚠️</span><div><div style={{fontSize:12,fontWeight:700,color:C.warning}}>Kapasitetsadvarsel</div><div style={{fontSize:11,color:C.textSec}}>Planlagt: {totalSP} SP · Kapasitet: {Math.round(totalCap)}t — sprinten kan være overbelastet.</div></div></div>:null;})()}
        {/* D3: Burndown/Burnup chart */}
        {viewSprint?.start&&viewSprint?.end&&totalSP>0&&(()=>{
          const startD=new Date(viewSprint.start);const endD=new Date(viewSprint.end);
          const days=[];for(let d=new Date(startD);d<=endD;d.setDate(d.getDate()+1))days.push(new Date(d).toISOString().split("T")[0]);
          if(!days.length)return null;
          // Build burndown: track remaining SP per day
          const doneDates={};sprintTasks.forEach(t=>{const h=(t.history||[]).find(x=>x.what?.includes("status")&&x.what?.includes("done"));if(h){const dStr=h.time?.slice(0,10);if(dStr&&!doneDates[dStr])doneDates[dStr]=0;if(dStr)doneDates[dStr]+=t.size;}});
          let remaining=totalSP;const burnData=days.map(day=>{remaining-=(doneDates[day]||0);return{day,remaining:Math.max(0,remaining),done:totalSP-Math.max(0,remaining)};});
          const chartH=100;const maxSP=totalSP;
          const idealStep=totalSP/(days.length-1||1);
          return <Card style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <h3 style={{fontSize:12,fontWeight:700,color:C.primary,margin:0}}>📉 Burndown / Burnup</h3>
              <div style={{display:"flex",gap:10,fontSize:9}}>
                <span style={{display:"flex",alignItems:"center",gap:3}}><span style={{width:12,height:3,borderRadius:2,background:C.danger,display:"inline-block"}}/> Gjenstående</span>
                <span style={{display:"flex",alignItems:"center",gap:3}}><span style={{width:12,height:3,borderRadius:2,background:C.success,display:"inline-block"}}/> Levert</span>
                <span style={{display:"flex",alignItems:"center",gap:3}}><span style={{width:12,height:3,borderRadius:2,background:C.textMuted,display:"inline-block",borderTop:"1px dashed"}}/> Ideal</span>
              </div>
            </div>
            <div style={{position:"relative",height:chartH+30,overflow:"hidden"}}>
              {/* Y axis labels */}
              <div style={{position:"absolute",left:0,top:0,bottom:20,width:28,display:"flex",flexDirection:"column",justifyContent:"space-between",fontSize:8,color:C.textMuted}}>
                <span>{maxSP}</span><span>{Math.round(maxSP/2)}</span><span>0</span>
              </div>
              {/* Chart area */}
              <svg viewBox={`0 0 ${days.length*20} ${chartH}`} style={{marginLeft:30,width:`calc(100% - 30px)`,height:chartH}} preserveAspectRatio="none">
                {/* Ideal burndown line */}
                <line x1={0} y1={0} x2={days.length*20-20} y2={chartH} stroke={C.textMuted} strokeWidth={1} strokeDasharray="4 3" opacity={0.5}/>
                {/* Burndown (remaining) */}
                <polyline fill="none" stroke={C.danger} strokeWidth={2} points={burnData.map((d,i)=>`${i*20},${chartH-(d.remaining/maxSP)*chartH}`).join(" ")}/>
                {/* Burnup (done) */}
                <polyline fill="none" stroke={C.success} strokeWidth={2} points={burnData.map((d,i)=>`${i*20},${chartH-(d.done/maxSP)*chartH}`).join(" ")}/>
                {/* Data points */}
                {burnData.map((d,i)=><React.Fragment key={i}><circle cx={i*20} cy={chartH-(d.remaining/maxSP)*chartH} r={2.5} fill={C.danger}/><circle cx={i*20} cy={chartH-(d.done/maxSP)*chartH} r={2.5} fill={C.success}/></React.Fragment>)}
              </svg>
              {/* X axis labels */}
              <div style={{marginLeft:30,display:"flex",justifyContent:"space-between",fontSize:7,color:C.textMuted,marginTop:2}}>
                {days.filter((_,i)=>i===0||i===days.length-1||i%Math.max(1,Math.floor(days.length/5))===0).map(d=><span key={d}>{d.slice(5)}</span>)}
              </div>
            </div>
          </Card>;
        })()}
        {/* D.7: Sprint-sammenligning */}
        <details style={{marginBottom:10}}><summary style={{cursor:"pointer",fontSize:11,fontWeight:600,color:C.primary,padding:"6px 0"}}>📊 Sammenlign sprinter</summary><Card style={{marginTop:6}}>{(()=>{const [sA,sB]=compareSprints;const spA=sprints.find(x=>x.id===sA);const spB=sprints.find(x=>x.id===sB);const metrics=(sp)=>{if(!sp)return null;const st=tasks.filter(t=>t.sprintId===sp.id&&!t.archived);const done=st.filter(t=>t.status==="done"||t.status==="archived");const tracks={};st.forEach(t=>(t.tracks||[]).forEach(tr=>{tracks[tr]=(tracks[tr]||0)+1;}));return{planned:sp.planned||0,delivered:sp.delivered||0,taskCount:st.length,doneCount:done.length,tracks,hours:st.reduce((s,t)=>s+(parseFloat(t.actualHours)||0),0)};};const mA=metrics(spA);const mB=metrics(spB);const delta=(a,b)=>a!==null&&b!==null?b-a:null;const dFmt=(d)=>d===null?"—":d>0?`+${d}`:String(d);return <div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:SP.lg}}><div><label style={{fontSize:9,fontWeight:600,color:C.textMuted,textTransform:"uppercase"}}>Sprint A</label><select value={sA||""} onChange={e=>setCompareSprints(p=>[e.target.value||null,p[1]])} style={{width:"100%",padding:"4px 8px",fontSize:11,borderRadius:6,border:`1px solid ${C.border}`,background:C.surface,color:C.text,marginTop:2}}><option value="">Velg sprint...</option>{sprints.filter(x=>x.status==="completed").map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select>{mA&&<div style={{marginTop:8,fontSize:10}}><div>Planlagt: <b>{mA.planned} SP</b></div><div>Levert: <b>{mA.delivered} SP</b></div><div>Oppgaver: <b>{mA.doneCount}/{mA.taskCount}</b></div><div>Timer: <b>{mA.hours}t</b></div></div>}</div><div><label style={{fontSize:9,fontWeight:600,color:C.textMuted,textTransform:"uppercase"}}>Sprint B</label><select value={sB||""} onChange={e=>setCompareSprints(p=>[p[0],e.target.value||null])} style={{width:"100%",padding:"4px 8px",fontSize:11,borderRadius:6,border:`1px solid ${C.border}`,background:C.surface,color:C.text,marginTop:2}}><option value="">Velg sprint...</option>{sprints.filter(x=>x.status==="completed").map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select>{mB&&<div style={{marginTop:8,fontSize:10}}><div>Planlagt: <b>{mB.planned} SP</b></div><div>Levert: <b>{mB.delivered} SP</b></div><div>Oppgaver: <b>{mB.doneCount}/{mB.taskCount}</b></div><div>Timer: <b>{mB.hours}t</b></div></div>}</div></div>{mA&&mB&&<div style={{marginTop:12,padding:10,background:C.surfaceAlt,borderRadius:8}}><div style={{fontSize:10,fontWeight:700,color:C.primary,marginBottom:6}}>Delta (B − A)</div><div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,fontSize:11}}>{[{l:"Planlagt SP",v:delta(mA.planned,mB.planned)},{l:"Levert SP",v:delta(mA.delivered,mB.delivered)},{l:"Oppgaver",v:delta(mA.doneCount,mB.doneCount)},{l:"Timer",v:delta(mA.hours,mB.hours)}].map(d=><div key={d.l} style={{textAlign:"center",padding:6,background:C.surface,borderRadius:6}}><div style={{fontSize:8,color:C.textMuted,textTransform:"uppercase",marginBottom:2}}>{d.l}</div><div style={{fontSize:16,fontWeight:800,color:d.v>0?C.success:d.v<0?C.danger:C.textMuted}}>{dFmt(d.v)}</div></div>)}</div></div>}</div>;})()}</Card></details>
        <div className={s.kanban} style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>{[["ready","Klar"],["in-progress","Pågår"],["blocked","Blokkert"],["done","Ferdig"]].map(([st,lb])=>{const col=sprintTasks.filter(t=>t.status===st);const s=stMap[st];return <div key={st} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();if(dragTask){updateTask(dragTask,{status:st});setDragTask(null);}}}>
          <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:6}}><div style={{width:8,height:8,borderRadius:"50%",background:s?.color}}/><span style={{fontSize:12,fontWeight:700}}>{lb}</span><Badge variant="count">{col.length}</Badge></div>
          <div style={{display:"flex",flexDirection:"column",gap:5,minHeight:60}}>{col.map(t=>{const blocked=isBlockedByDeps(t);const blockers=getBlockers(t);return <Card key={t.id} draggable onDragStart={()=>setDragTask(t.id)} onClick={()=>setModal({type:"review",task:t})} style={{padding:8,borderLeft:`3px solid ${blocked?C.danger:(t.tracks||[])[0]?TRACKS.find(x=>x.id===t.tracks[0])?.color:C.border}`,cursor:"grab",opacity:blocked?.75:1}}>{blocked&&<div style={{fontSize:9,fontWeight:700,color:C.danger,marginBottom:3,padding:"2px 6px",background:C.dangerBg,borderRadius:4}}>🚫 Blokkert av: {blockers.map(b=>b.id).join(", ")}</div>}<div style={{fontSize:11,fontWeight:600,marginBottom:3}}>{t.parentId&&<span style={{fontSize:9,color:C.textMuted}}>↳ </span>}{t.title}</div><div style={{display:"flex",justifyContent:"space-between"}}><div style={{display:"flex",gap:2}}>{(t.tracks||[]).map(tr=><TBadge key={tr} id={tr}/>)}</div><span style={{fontSize:10,fontWeight:700,color:C.textMuted}}>{t.size}SP</span></div>{t.actualHours>0&&<div style={{fontSize:9,color:C.textMuted,marginTop:2}}>⏱ {t.actualHours}t</div>}{(()=>{const sp=subProgress(t.id);return sp?<div style={{marginTop:3}}><div style={{height:3,borderRadius:2,background:C.surfaceAlt}}><div style={{height:3,borderRadius:2,background:sp.pct===100?C.success:C.accent,width:`${sp.pct}%`}}/></div><div style={{fontSize:8,color:C.textMuted,marginTop:1}}>{sp.done}/{sp.total} del</div></div>:null;})()}{t.assignee&&(()=>{const m=team.find(x=>x.id===t.assignee);return m?<div style={{fontSize:9,color:C.textSec,marginTop:2,display:"flex",alignItems:"center",gap:3}}><span style={{width:16,height:16,borderRadius:4,background:C.surfaceAlt,border:`1px solid ${C.border}`,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:7,fontWeight:800,color:C.primary}}>{m.name.split(" ").map(n=>n[0]).join("")}</span>{m.name}</div>:null;})()}<select value={t.assignee||""} onChange={e=>{e.stopPropagation();updateTask(t.id,{assignee:e.target.value});}} onClick={e=>e.stopPropagation()} style={{fontSize:9,padding:"2px 4px",borderRadius:4,border:`1px solid ${C.border}`,background:C.surface,color:C.text,width:"100%",marginTop:3}}><option value="">Tildel medlem...</option>{team.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></Card>;})}{!col.length&&<div style={{padding:14,textAlign:"center",fontSize:10,color:C.textMuted,background:C.surfaceAlt,borderRadius:7,border:`1px dashed ${C.border}`}}>Slipp her</div>}</div></div>;})}</div></div>}

      {tab==="capacity"&&<div><h1 style={{fontSize:20,fontWeight:700,color:C.primary,margin:"0 0 4px"}}>Kapasitet – {viewSprint?.name||"Sprint"}</h1><p style={{fontSize:12,color:C.textSec,margin:"0 0 4px"}}>37,5 t/uke × {sprintWeeks} uker · {team.length} medlemmer · {Math.round(totalCap)}t</p>
        <div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:10,background:C.surfaceAlt,padding:4,borderRadius:8}}>{sprints.map(s=>{const isSel=s.id===viewSprintId;const ico=s.status==="completed"?"✓":s.status==="active"?"⚡":"📋";return <button key={s.id} onClick={()=>setViewSprintId(s.id)} style={{padding:"5px 12px",borderRadius:6,border:"none",cursor:"pointer",fontSize:10,fontWeight:600,background:isSel?C.primary:"transparent",color:isSel?"#fff":C.textMuted}}>{ico} {s.name}</button>;})}</div>
        <Card style={{marginBottom:12,background:C.surfaceAlt}}><div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr auto",gap:8,alignItems:"end"}}><TF label="Navn" id="tm-n" value={memberForm.name} onChange={e=>setMemberForm(f=>({...f,name:e.target.value}))} placeholder="Nytt medlem"/><TF label="Stilling" id="tm-r" value={memberForm.role} onChange={e=>setMemberForm(f=>({...f,role:e.target.value}))} placeholder="Backend"/><SF label="Løype" id="tm-t" value={memberForm.track} onChange={e=>setMemberForm(f=>({...f,track:e.target.value}))}>{TRACKS.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}</SF><TF label="%" id="tm-a" type="number" value={memberForm.availability} onChange={e=>setMemberForm(f=>({...f,availability:parseInt(e.target.value)||0}))}/><Btn onClick={()=>{if(!memberForm.name)return;setTeam(p=>[...p,{...memberForm,id:`m${Date.now()}`,skills:[memberForm.role]}]);setMemberForm({name:"",role:"",availability:100,skills:[],track:"sysdev"});notify("Lagt til.");}}>+</Btn></div></Card>
        <div className={s.capGrid} style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:10}}>{team.map(m=>{const hrs=autoHours(m.availability,sprintWeeks);const tr=TRACKS.find(x=>x.id===m.track);const isEd=editMember===m.id;return <Card key={m.id}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><div style={{width:34,height:34,borderRadius:8,background:C.surfaceAlt,border:`2px solid ${tr?.color||C.primaryLight}`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:12,color:C.primary}}>{m.name.split(" ").map(n=>n[0]).join("")}</div><div style={{flex:1}}>{isEd?<div style={{display:"flex",flexDirection:"column",gap:3}}><input value={m.name} onChange={e=>setTeam(p=>p.map(x=>x.id===m.id?{...x,name:e.target.value}:x))} style={{fontSize:12,fontWeight:700,border:`1px solid ${C.border}`,borderRadius:4,padding:"2px 6px",background:C.surface,color:C.text}}/><input value={m.role} onChange={e=>setTeam(p=>p.map(x=>x.id===m.id?{...x,role:e.target.value}:x))} style={{fontSize:10,border:`1px solid ${C.border}`,borderRadius:4,padding:"2px 6px",background:C.surface,color:C.text}}/><div style={{display:"flex",gap:3}}><select value={m.track||""} onChange={e=>setTeam(p=>p.map(x=>x.id===m.id?{...x,track:e.target.value}:x))} style={{fontSize:10,border:`1px solid ${C.border}`,borderRadius:4,padding:"2px 4px",background:C.surface,color:C.text}}>{TRACKS.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}</select><input type="number" value={m.availability} onChange={e=>setTeam(p=>p.map(x=>x.id===m.id?{...x,availability:parseInt(e.target.value)||0}:x))} style={{width:50,fontSize:10,border:`1px solid ${C.border}`,borderRadius:4,padding:"2px 4px",background:C.surface,color:C.text}}/></div><div style={{display:"flex",gap:2,flexWrap:"wrap"}}>{SKILLS_LIST.map(sk=>{const has=(m.skills||[]).includes(sk);return <button key={sk} type="button" onClick={()=>setTeam(p=>p.map(x=>x.id===m.id?{...x,skills:has?(x.skills||[]).filter(s=>s!==sk):[...(x.skills||[]),sk]}:x))} style={{padding:"1px 6px",borderRadius:4,border:`1px solid ${has?C.primary:C.border}`,background:has?C.primary+"10":"transparent",color:has?C.primary:C.textMuted,fontSize:9,cursor:"pointer"}}>{sk}{has&&" ✓"}</button>;})}</div></div>:<div><div style={{fontSize:12,fontWeight:700}}>{m.name}</div><div style={{fontSize:10,color:C.textMuted}}>{m.role} · {m.availability}% · {tr&&<span style={{color:tr.color}}>{tr.icon} {tr.label}</span>}</div></div>}</div><div style={{display:"flex",flexDirection:"column",gap:3,alignItems:"flex-end"}}><div style={{fontSize:16,fontWeight:800,color:C.primary}}>{hrs}t</div><div style={{display:"flex",gap:3}}><Btn variant="ghost" onClick={()=>setEditMember(isEd?null:m.id)} style={{fontSize:9,padding:"2px 6px",color:C.textSec}}>{isEd?"✓":"✏️"}</Btn><Btn variant="ghost" onClick={()=>{if(confirm(`Fjerne ${m.name}?`))setTeam(p=>p.filter(x=>x.id!==m.id));}} style={{fontSize:9,padding:"2px 6px",color:C.danger}}>🗑️</Btn></div></div></div><div style={{display:"flex",gap:2,flexWrap:"wrap"}}>{(m.skills||[]).map(s=><Badge key={s} color={C.primary} bg={C.surfaceAlt} style={{fontSize:8}}>{s}</Badge>)}</div></Card>;})}</div>
        {/* D.9: Ressursutnyttelse */}
        <Card style={{marginTop:14}}><SH>👥 Ressursutnyttelse — {viewSprint?.name}</SH>{(()=>{const util=calcResourceUtilization(team,tasks,viewSprintId,sprintWeeks);const avgUtil=util.length?Math.round(util.reduce((s,u)=>s+u.utilization,0)/util.length):0;const overCount=util.filter(u=>u.overAllocated).length;const underCount=util.filter(u=>u.utilization<50).length;return <div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}><div style={{padding:10,background:C.surfaceAlt,borderRadius:8,textAlign:"center"}}><div style={{fontSize:8,color:C.textMuted,textTransform:"uppercase",fontWeight:600}}>Gj.snitt utnyttelse</div><div style={{fontSize:18,fontWeight:800,color:avgUtil>=80?C.success:avgUtil>=50?C.warning:C.danger}}>{avgUtil}%</div></div><div style={{padding:10,background:overCount?C.dangerBg:C.surfaceAlt,borderRadius:8,textAlign:"center"}}><div style={{fontSize:8,color:C.textMuted,textTransform:"uppercase",fontWeight:600}}>Overallokerte</div><div style={{fontSize:18,fontWeight:800,color:overCount?C.danger:C.textMuted}}>{overCount}</div></div><div style={{padding:10,background:underCount?C.warningBg:C.surfaceAlt,borderRadius:8,textAlign:"center"}}><div style={{fontSize:8,color:C.textMuted,textTransform:"uppercase",fontWeight:600}}>Under 50%</div><div style={{fontSize:18,fontWeight:800,color:underCount?C.warning:C.textMuted}}>{underCount}</div></div></div>{util.length>0&&<div style={{overflowX:"auto"}}><svg viewBox={`0 0 ${util.length*60+40} 120`} style={{width:Math.max(util.length*60+40,300),height:120}}>{util.map((u,i)=>{const allocH=Math.min((u.allocatedHours/Math.max(...util.map(x=>x.allocatedHours),1))*80,80);const actH=Math.min((u.actualHours/Math.max(...util.map(x=>x.allocatedHours),1))*80,80);return <React.Fragment key={u.memberId}><rect x={i*60+20} y={100-allocH} width={22} height={allocH} fill={C.surfaceAlt} stroke={C.border} rx={2}/><rect x={i*60+20} y={100-actH} width={22} height={actH} fill={u.overAllocated?C.danger:u.utilization>=80?C.success:u.utilization>=50?C.warning:C.textMuted} rx={2} opacity={.7}/><text x={i*60+31} y={112} textAnchor="middle" fontSize={7} fill={C.textMuted}>{u.name.split(" ")[0]}</text><text x={i*60+31} y={96-Math.max(allocH,actH)} textAnchor="middle" fontSize={7} fill={C.textSec}>{u.utilization}%</text></React.Fragment>;})}</svg></div>}{util.length>0&&<div style={{display:"flex",gap:6,marginTop:6,fontSize:8,color:C.textMuted}}><span style={{display:"flex",alignItems:"center",gap:3}}><span style={{width:8,height:8,background:C.surfaceAlt,border:`1px solid ${C.border}`,borderRadius:2,display:"inline-block"}}/> Allokert</span><span style={{display:"flex",alignItems:"center",gap:3}}><span style={{width:8,height:8,background:C.success,borderRadius:2,display:"inline-block",opacity:.7}}/> Faktisk</span></div>}</div>;})()}</Card></div>}

      {tab==="dashboard"&&<div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:6}}><h1 style={{fontSize:20,fontWeight:700,color:C.primary,margin:0}}>Dashboard</h1><div style={{display:"flex",gap:4,alignItems:"center"}}>
        <details style={{position:"relative"}}><summary style={{cursor:"pointer",fontSize:10,padding:"5px 12px",background:C.surfaceAlt,borderRadius:6,color:C.primary,fontWeight:600}}>⚙️ Velg widgets</summary><div style={{position:"absolute",right:0,top:"100%",zIndex:50,background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:10,minWidth:220,boxShadow:"0 8px 24px rgba(0,0,0,.15)"}}>{DASHBOARD_WIDGETS.map(w=><label key={w.id} style={{display:"flex",alignItems:"center",gap:6,fontSize:11,padding:"3px 0",cursor:"pointer"}}><input type="checkbox" checked={dashWidgets.includes(w.id)} onChange={()=>setDashWidgets(p=>p.includes(w.id)?p.filter(x=>x!==w.id):[...p,w.id])}/>{w.icon} {w.label}</label>)}</div></details>
        <Btn variant="secondary" onClick={()=>setModal({type:"export"})} style={{fontSize:10,padding:"5px 12px",background:C.surfaceAlt,color:C.primary}}>📥 Eksporter</Btn></div></div>
        {/* KPI-kort */}
        {dashWidgets.includes("sprintProgress")&&<div className={s.dashTop} style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>{(()=>{const done=sprints.filter(s=>s.status==="completed");const lastVel=done.length>0?done[done.length-1].delivered:0;const avgVel=done.length>0?Math.round(done.reduce((s,x)=>s+x.delivered,0)/done.length):0;const backlogSP=tasks.filter(t=>!t.archived&&t.status!=="done"&&t.status!=="archived"&&t.status!=="rejected").reduce((s,t)=>s+t.size,0);const forecast=avgVel>0?Math.ceil(backlogSP/avgVel):null;return [{l:"Velocity",v:`${lastVel} SP`,sub:`snitt: ${avgVel}`,t:TIP.Velocity},{l:"Sprint",v:`${sprintPct}%`},{l:"Kapasitet",v:`${Math.round(totalCap)}t`},{l:"Backlog",v:`${backlogSP} SP`,sub:forecast?`~${forecast} sprinter`:""}];})().map((k,i)=><Card key={i} style={{borderTop:`3px solid ${C.primary}`}}><div style={{fontSize:8,color:C.textMuted,fontWeight:600,textTransform:"uppercase",marginBottom:3,cursor:k.t?"help":"default",borderBottom:k.t?`1px dashed ${C.textMuted}55`:"none",display:"inline-block"}} title={k.t||""}>{k.l}</div><span style={{fontSize:22,fontWeight:800,color:C.primary,display:"block"}}>{k.v}</span>{k.sub&&<span style={{fontSize:9,color:C.textMuted}}>{k.sub}</span>}</Card>)}</div>}
        {dashWidgets.includes("statusDist")&&<Card style={{marginBottom:14}}><h2 style={{fontSize:12,fontWeight:700,color:C.primary,margin:"0 0 10px"}}>Status-fordeling</h2><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{STATUSES.filter(st=>st.id!=="archived").map(st=>{const c=tasks.filter(t=>!t.archived&&t.status===st.id).length;return <div key={st.id} style={{flex:1,minWidth:80,padding:"8px 10px",background:st.bg,borderRadius:8,border:`1px solid ${st.color}20`,textAlign:"center"}}><div style={{fontSize:18,fontWeight:800,color:st.color}}>{c}</div><div style={{fontSize:9,color:st.color,fontWeight:600}}>{st.label}</div></div>;})}</div></Card>}
        <div className={s.dashMid} style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        {dashWidgets.includes("trackDist")&&<Card><h2 style={{fontSize:12,fontWeight:700,color:C.primary,margin:"0 0 10px"}}>Per løype</h2>{TRACKS.map(tr=>{const c=tasks.filter(t=>(t.tracks||[]).includes(tr.id)&&!t.archived).length;const p=Math.round(c/Math.max(tasks.filter(t=>!t.archived).length,1)*100);return <div key={tr.id} style={{marginBottom:5}}><div style={{display:"flex",justifyContent:"space-between",fontSize:10,marginBottom:1}}><span>{tr.icon} {tr.label}</span><span style={{fontWeight:700}}>{c}</span></div><div style={{height:5,borderRadius:3,background:C.surfaceAlt}}><div style={{height:5,borderRadius:3,background:tr.color,width:p+"%"}}/></div></div>;})}</Card>}
        {dashWidgets.includes("velocity")&&<Card><h2 style={{fontSize:12,fontWeight:700,color:C.primary,margin:"0 0 10px"}} title={TIP.Velocity}><Tip k="Velocity">Velocity</Tip></h2>{(()=>{const done=sprints.filter(s=>s.status==="completed");const maxD=Math.max(...done.map(s=>s.delivered),1);const avg=done.length?done.reduce((s,x)=>s+x.delivered,0)/done.length:0;const trend=done.length>=2?(done[done.length-1].delivered-done[0].delivered)>0?"📈":"📉":"";return <div><div style={{display:"flex",alignItems:"flex-end",gap:5,height:100,position:"relative"}}>{avg>0&&<div style={{position:"absolute",left:0,right:0,bottom:(avg/maxD)*80,borderBottom:`2px dashed ${C.accent}`,zIndex:1}}><span style={{position:"absolute",right:0,top:-14,fontSize:8,color:C.accent,background:C.surface,padding:"0 4px"}}>snitt {Math.round(avg)}</span></div>}{done.map((ss,i)=><div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2,zIndex:2}}><span style={{fontSize:9,fontWeight:700,color:C.textSec}}>{ss.delivered}</span><div style={{width:"100%",maxWidth:32,borderRadius:"3px 3px 0 0",background:C.primary,height:(ss.delivered/maxD)*80}}/><span style={{fontSize:8,color:C.textMuted}}>{ss.id}</span></div>)}</div>{done.length>=2&&<div style={{marginTop:6,fontSize:10,color:C.textSec,display:"flex",justifyContent:"space-between"}}><span>{trend} Trend: {trend==="📈"?"Stigende":"Synkende"}</span><span>Snitt: {Math.round(avg)} SP</span></div>}</div>;})()}</Card>}
        </div>
        {/* D.1: Velocity-trend */}
        {dashWidgets.includes("velocityTrend")&&(()=>{const vt=calcVelocityTrend(sprints);if(!vt.data.length)return null;const maxV=Math.max(...vt.data.map(d=>d.delivered),1);const chartH=80;const chartW=vt.data.length*40;return <Card style={{marginBottom:14}}><h2 style={{fontSize:12,fontWeight:700,color:C.primary,margin:"0 0 10px"}}>📉 Velocity-trend</h2><div style={{fontSize:10,color:C.textSec,marginBottom:6}}>Snitt: {vt.avg} SP · Std.avvik: {vt.stdDev} · Trend: {vt.trend==="up"?"📈 Stigende":vt.trend==="down"?"📉 Synkende":"➡️ Flat"} (slope: {vt.slope})</div><div style={{overflowX:"auto"}}><svg viewBox={`0 0 ${chartW} ${chartH+20}`} style={{width:Math.max(chartW,200),height:chartH+20}}><line x1={0} y1={chartH-(vt.avg/maxV)*chartH} x2={chartW} y2={chartH-(vt.avg/maxV)*chartH} stroke={C.accent} strokeWidth={1} strokeDasharray="4 3" opacity={.5}/><rect x={0} y={chartH-((vt.avg+vt.stdDev)/maxV)*chartH} width={chartW} height={((2*vt.stdDev)/maxV)*chartH} fill={C.accent} opacity={.08}/><polyline fill="none" stroke={C.primary} strokeWidth={2} points={vt.data.map((d,i)=>`${i*40+20},${chartH-(d.delivered/maxV)*chartH}`).join(" ")}/>{vt.data.map((d,i)=><React.Fragment key={i}><circle cx={i*40+20} cy={chartH-(d.delivered/maxV)*chartH} r={3} fill={C.primary}/><text x={i*40+20} y={chartH+14} textAnchor="middle" fontSize={8} fill={C.textMuted}>{d.id}</text></React.Fragment>)}</svg></div></Card>;})()}
        {/* D.1: Cycle Time-trend */}
        {dashWidgets.includes("cycleTimeTrend")&&(()=>{const ct=calcCycleTimeTrend(tasks,sprints).filter(s=>s.avgLeadTime!==null||s.avgCycleTime!==null);if(!ct.length)return null;const maxT=Math.max(...ct.map(s=>Math.max(s.avgLeadTime||0,s.avgCycleTime||0)),1);const chartH=80;return <Card style={{marginBottom:14}}><h2 style={{fontSize:12,fontWeight:700,color:C.primary,margin:"0 0 10px"}}>⏱📉 Cycle Time-trend</h2><div style={{display:"flex",gap:10,fontSize:9,marginBottom:6}}><span style={{display:"flex",alignItems:"center",gap:3}}><span style={{width:12,height:3,borderRadius:2,background:C.primary,display:"inline-block"}}/> Lead Time</span><span style={{display:"flex",alignItems:"center",gap:3}}><span style={{width:12,height:3,borderRadius:2,background:C.accent,display:"inline-block"}}/> Cycle Time</span></div><svg viewBox={`0 0 ${ct.length*40} ${chartH+20}`} style={{width:Math.max(ct.length*40,200),height:chartH+20}}><polyline fill="none" stroke={C.primary} strokeWidth={2} points={ct.map((s,i)=>`${i*40+20},${chartH-((s.avgLeadTime||0)/maxT)*chartH}`).join(" ")}/><polyline fill="none" stroke={C.accent} strokeWidth={2} points={ct.map((s,i)=>`${i*40+20},${chartH-((s.avgCycleTime||0)/maxT)*chartH}`).join(" ")}/>{ct.map((s,i)=><text key={i} x={i*40+20} y={chartH+14} textAnchor="middle" fontSize={8} fill={C.textMuted}>{s.sprintName?.replace("Sprint ","S")}</text>)}</svg></Card>;})()}
        {/* D.1: Gjennomstrømning per løype */}
        {dashWidgets.includes("throughputTrack")&&(()=>{const tp=calcThroughputByTrack(tasks,sprints);if(!tp.length)return null;const maxT=Math.max(...tp.map(s=>s.total),1);const chartH=80;return <Card style={{marginBottom:14}}><h2 style={{fontSize:12,fontWeight:700,color:C.primary,margin:"0 0 10px"}}>🔄 Gjennomstrømning per løype</h2><svg viewBox={`0 0 ${tp.length*50} ${chartH+20}`} style={{width:Math.max(tp.length*50,200),height:chartH+20}}>{tp.map((s,si)=>{let y=chartH;return <React.Fragment key={si}>{TRACKS.map(tr=>{const c=s.tracks[tr.id]||0;if(!c)return null;const h=(c/maxT)*chartH;y-=h;return <rect key={tr.id} x={si*50+10} y={y} width={30} height={h} fill={tr.color} rx={2}/>;})}<text x={si*50+25} y={chartH+14} textAnchor="middle" fontSize={8} fill={C.textMuted}>{s.sprintName?.replace("Sprint ","S")}</text></React.Fragment>;})}</svg><div style={{display:"flex",gap:8,marginTop:4,flexWrap:"wrap"}}>{TRACKS.map(tr=><span key={tr.id} style={{fontSize:9,display:"flex",alignItems:"center",gap:3}}><span style={{width:8,height:8,borderRadius:2,background:tr.color,display:"inline-block"}}/>{tr.label}</span>)}</div></Card>;})()}
        {/* D.2: Kumulativt flytdiagram (CFD) */}
        {dashWidgets.includes("cfd")&&(()=>{const cfd=buildCfdData(tasks);if(cfd.length<2)return null;const statusIds=["submitted","under-review","assessed","ready","in-progress","blocked","done","rejected"];const maxTotal=Math.max(...cfd.map(d=>statusIds.reduce((s,id)=>s+(d[id]||0),0)),1);const chartH=100;const chartW=cfd.length*12;return <Card style={{marginBottom:14}}><h2 style={{fontSize:12,fontWeight:700,color:C.primary,margin:"0 0 10px"}}>📊 Kumulativt flytdiagram</h2><div style={{overflowX:"auto"}}><svg viewBox={`0 0 ${chartW} ${chartH+20}`} style={{width:Math.max(chartW,300),height:chartH+20}}>{statusIds.map((sid,si)=>{const stObj=stMap[sid];const points=cfd.map((d,di)=>{const cumBelow=statusIds.slice(0,si).reduce((s,id)=>s+(d[id]||0),0);const cumIncl=cumBelow+(d[sid]||0);return{x:di*12,yTop:chartH-(cumIncl/maxTotal)*chartH,yBot:chartH-(cumBelow/maxTotal)*chartH};});const path=`M${points.map(p=>`${p.x},${p.yTop}`).join(" L")} L${[...points].reverse().map(p=>`${p.x},${p.yBot}`).join(" L")} Z`;return <path key={sid} d={path} fill={stObj?.color||"#999"} opacity={.6}/>;})}{cfd.filter((_,i)=>i%Math.max(1,Math.floor(cfd.length/6))===0||i===cfd.length-1).map((d,i)=><text key={i} x={cfd.indexOf(d)*12} y={chartH+14} fontSize={7} fill={C.textMuted}>{d.date?.slice(5)}</text>)}</svg></div><div style={{display:"flex",gap:6,marginTop:4,flexWrap:"wrap"}}>{statusIds.filter(id=>stMap[id]).map(id=><span key={id} style={{fontSize:8,display:"flex",alignItems:"center",gap:3}}><span style={{width:8,height:8,borderRadius:2,background:stMap[id].color,display:"inline-block"}}/>{stMap[id].label}</span>)}</div></Card>;})()}
        {/* D.3: Prognose */}
        {dashWidgets.includes("predictive")&&(()=>{const backlogSP=tasks.filter(t=>!t.archived&&t.status!=="done"&&t.status!=="archived"&&t.status!=="rejected").reduce((s,t)=>s+t.size,0);const pred=calcPredictiveCompletion(backlogSP,sprints);if(!pred)return null;return <Card style={{marginBottom:14}}><h2 style={{fontSize:12,fontWeight:700,color:C.primary,margin:"0 0 10px"}}>🔮 Prognose — Ferdigstillelse av backlog</h2><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}><div style={{padding:12,background:C.successBg,borderRadius:8,textAlign:"center"}}><div style={{fontSize:9,color:C.textMuted,textTransform:"uppercase",fontWeight:600}}>Optimistisk</div><div style={{fontSize:18,fontWeight:800,color:C.success}}>{pred.optimistic} sprinter</div><div style={{fontSize:9,color:C.textMuted}}>{pred.dates.optimistic}</div></div><div style={{padding:12,background:C.surfaceAlt,borderRadius:8,textAlign:"center",border:`2px solid ${C.primary}`}}><div style={{fontSize:9,color:C.textMuted,textTransform:"uppercase",fontWeight:600}}>Mest sannsynlig</div><div style={{fontSize:18,fontWeight:800,color:C.primary}}>{pred.mostLikely} sprinter</div><div style={{fontSize:9,color:C.textMuted}}>{pred.dates.mostLikely}</div></div><div style={{padding:12,background:C.dangerBg,borderRadius:8,textAlign:"center"}}><div style={{fontSize:9,color:C.textMuted,textTransform:"uppercase",fontWeight:600}}>Pessimistisk</div><div style={{fontSize:18,fontWeight:800,color:C.danger}}>{pred.pessimistic} sprinter</div><div style={{fontSize:9,color:C.textMuted}}>{pred.dates.pessimistic}</div></div></div><div style={{fontSize:10,color:C.textMuted,marginTop:8}}>Basert på velocity: snitt {pred.velocity.avg} SP, stddev {pred.velocity.stdDev}. Backlog: {backlogSP} SP.</div></Card>;})()}
        {dashWidgets.includes("leadCycleTime")&&<Card style={{marginBottom:14}}><h2 style={{fontSize:12,fontWeight:700,color:C.primary,margin:"0 0 10px"}}>Gjennomløpstider</h2>{(()=>{const doneTasks=tasks.filter(t=>t.status==="done"||t.status==="archived");const leads=doneTasks.map(calcLeadTime).filter(Boolean);const cycles=doneTasks.map(calcCycleTime).filter(Boolean);const avgLead=leads.length?Math.round(leads.reduce((s,x)=>s+x,0)/leads.length):null;const avgCycle=cycles.length?Math.round(cycles.reduce((s,x)=>s+x,0)/cycles.length):null;return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}><div style={{textAlign:"center",padding:12,background:C.surfaceAlt,borderRadius:8}}><div style={{fontSize:9,color:C.textMuted,textTransform:"uppercase",fontWeight:600}}>Gj.snittlig Lead Time</div><div style={{fontSize:24,fontWeight:800,color:C.primary}}>{avgLead!==null?`${avgLead}d`:"—"}</div><div style={{fontSize:9,color:C.textMuted}}>Innmeldt → Ferdig ({leads.length} oppgaver)</div></div><div style={{textAlign:"center",padding:12,background:C.surfaceAlt,borderRadius:8}}><div style={{fontSize:9,color:C.textMuted,textTransform:"uppercase",fontWeight:600}}>Gj.snittlig Cycle Time</div><div style={{fontSize:24,fontWeight:800,color:C.accent}}>{avgCycle!==null?`${avgCycle}d`:"—"}</div><div style={{fontSize:9,color:C.textMuted}}>Pågår → Ferdig ({cycles.length} oppgaver)</div></div></div>;})()}</Card>}
        {dashWidgets.includes("goalProgress")&&<Card><h2 style={{fontSize:12,fontWeight:700,color:C.primary,margin:"0 0 10px"}}>Mål-fremgang</h2>{goals.filter(g=>!g.parent).map(main=>{const allIds=[main.id,...goals.filter(g=>g.parent===main.id).map(g=>g.id)];const linked=tasks.filter(t=>!t.archived&&(t.goals||[]).some(g=>allIds.includes(g)));const doneT=linked.filter(t=>t.status==="done"||t.status==="archived");const taskPct=linked.length?Math.round(doneT.length/linked.length*100):0;const tSP=linked.reduce((s,t)=>s+(t.size||0),0);const dSP=doneT.reduce((s,t)=>s+(t.size||0),0);const spPct=tSP?Math.round(dSP/tSP*100):0;const benefitPct=calcGoalBenefitRealization(linked);return <div key={main.id} style={{marginBottom:12}}>
          <div style={{fontSize:11,fontWeight:600,marginBottom:4}}>🎯 {main.title}</div>
          {[{label:"Oppgaver",pct:taskPct,detail:`${doneT.length}/${linked.length}`,color:C.accent},{label:"SP",pct:spPct,detail:`${dSP}/${tSP}`,color:C.primary},{label:"Nytte",pct:benefitPct!==null?Math.min(benefitPct,100):0,detail:benefitPct!==null?`${benefitPct}%`:"Ikke målt",color:benefitPct!==null?(benefitPct>=100?C.success:benefitPct>=50?C.warning:C.danger):C.border}].map(row=><div key={row.label} style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
            <span style={{fontSize:9,color:C.textMuted,width:55}}>{row.label}</span>
            <div style={{flex:1,height:5,borderRadius:3,background:C.surfaceAlt}}><div style={{height:5,borderRadius:3,background:row.color,width:`${row.pct}%`,transition:"width .3s"}}/></div>
            <span style={{fontSize:9,fontWeight:700,width:70,textAlign:"right",color:C.textSec}}>{row.detail} ({row.pct}%)</span>
          </div>)}
        </div>;})}</Card>}
      </div>}

      {tab==="goals"&&<div><h1 style={{fontSize:20,fontWeight:700,color:C.primary,margin:"0 0 4px"}}>Målregister</h1>
        <Card style={{marginBottom:12}}><SH>Nytt mål</SH><div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr auto",gap:8,alignItems:"end"}}><TF label="Tittel" id="g-t" value={goalForm.title} onChange={e=>setGoalForm(f=>({...f,title:e.target.value}))} placeholder="Nytt mål"/><SF label="Type" id="g-ty" value={goalForm.type} onChange={e=>setGoalForm(f=>({...f,type:e.target.value}))}><option value="Hovedmål">Hovedmål</option><option value="Delmål">Delmål</option></SF><SF label="Over" id="g-p" value={goalForm.parent} onChange={e=>setGoalForm(f=>({...f,parent:e.target.value}))}><option value="">Topp</option>{goals.filter(g=>!g.parent).map(g=><option key={g.id} value={g.id}>{g.title}</option>)}</SF><Btn onClick={()=>{if(!goalForm.title)return;setGoals(p=>[...p,{id:`G-${String(p.length+1).padStart(2,"0")}`,title:goalForm.title,type:goalForm.type,parent:goalForm.parent||null,metric:"",baseline:"",target:"",current:"",deadline:"",kpiStatus:"on-track"}]);setGoalForm({title:"",type:"Hovedmål",parent:""});notify("Mål opprettet.");}}>+</Btn></div></Card>
        <Card>{goals.filter(g=>!g.parent).map(main=>{const subs=goals.filter(g=>g.parent===main.id);const allIds=[main.id,...subs.map(g=>g.id)];const linked=tasks.filter(t=>!t.archived&&(t.goals||[]).some(g=>allIds.includes(g)));const done=linked.filter(t=>t.status==="done"||t.status==="archived").length;const kpiCol={["on-track"]:C.success,["at-risk"]:C.warning,["off-track"]:C.danger,["completed"]:C.success};const renderGoalKpi=(g,indent)=>{const kc=kpiCol[g.kpiStatus]||C.textMuted;const base=parseFloat(g.baseline)||0;const tgt=parseFloat(g.target)||0;const cur=parseFloat(g.current)||0;const range=Math.abs(tgt-base)||1;const pctDone=Math.min(100,Math.round(Math.abs(cur-base)/range*100));return <div key={g.id} style={{padding:"8px 10px",paddingLeft:indent?34:10,borderBottom:`1px solid ${C.border}15`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            <span style={{fontWeight:indent?400:700,fontSize:indent?12:13,color:indent?C.text:C.primary}}>{indent?"↳ ":"🎯 "}{g.title}</span>
            <div style={{display:"flex",gap:4,alignItems:"center"}}>
              <select value={g.kpiStatus||"on-track"} onChange={e=>setGoals(p=>p.map(x=>x.id===g.id?{...x,kpiStatus:e.target.value}:x))} style={{fontSize:9,padding:"2px 6px",borderRadius:4,border:`1px solid ${kc}40`,background:kc+"10",color:kc,fontWeight:600}}><option value="on-track">På sporet</option><option value="at-risk">Risiko</option><option value="off-track">Avvik</option><option value="completed">Oppnådd</option></select>
              <Btn variant="ghost" onClick={()=>setGoals(p=>p.filter(x=>indent?x.id!==g.id:(x.id!==g.id&&x.parent!==g.id)))} style={{fontSize:9,padding:"1px 4px",color:C.danger}}>🗑️</Btn>
            </div>
          </div>
          <div className={s.goalKpi} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr",gap:6,marginTop:6,alignItems:"end"}}>
            <input value={g.metric||""} onChange={e=>setGoals(p=>p.map(x=>x.id===g.id?{...x,metric:e.target.value}:x))} placeholder="KPI / Metrikk" style={{fontSize:10,padding:"3px 6px",borderRadius:4,border:`1px solid ${C.border}`,background:C.surface,color:C.text}}/>
            <input value={g.baseline||""} onChange={e=>setGoals(p=>p.map(x=>x.id===g.id?{...x,baseline:e.target.value}:x))} placeholder="Baseline" style={{fontSize:10,padding:"3px 6px",borderRadius:4,border:`1px solid ${C.border}`,background:C.surface,color:C.text}}/>
            <input value={g.target||""} onChange={e=>setGoals(p=>p.map(x=>x.id===g.id?{...x,target:e.target.value}:x))} placeholder="Mål" style={{fontSize:10,padding:"3px 6px",borderRadius:4,border:`1px solid ${C.border}`,background:C.surface,color:C.text}}/>
            <input value={g.current||""} onChange={e=>setGoals(p=>p.map(x=>x.id===g.id?{...x,current:e.target.value}:x))} placeholder="Nåverdi" style={{fontSize:10,padding:"3px 6px",borderRadius:4,border:`1px solid ${kc}40`,background:kc+"08",color:C.text,fontWeight:600}}/>
            <input type="date" value={g.deadline||""} onChange={e=>setGoals(p=>p.map(x=>x.id===g.id?{...x,deadline:e.target.value}:x))} style={{fontSize:10,padding:"3px 6px",borderRadius:4,border:`1px solid ${C.border}`,background:C.surface,color:C.text}}/>
          </div>
          {g.metric&&<div style={{marginTop:4}}><div style={{height:4,borderRadius:2,background:C.surfaceAlt}}><div style={{height:4,borderRadius:2,background:kc,width:`${pctDone}%`,transition:"width .3s"}}/></div><div style={{display:"flex",justifyContent:"space-between",fontSize:8,color:C.textMuted,marginTop:1}}><span>{g.baseline}</span><span style={{fontWeight:600,color:kc}}>{g.current||"?"}</span><span>{g.target}</span></div></div>}
          {/* C.8: Nytterealisering per mål */}
          {(()=>{const goalTasks=tasks.filter(t=>!t.archived&&(t.goals||[]).includes(g.id));const bPct=calcGoalBenefitRealization(goalTasks);const owners=[...new Set(goalTasks.map(t=>t.benefitOwner).filter(Boolean))];return (bPct!==null||owners.length>0)?<div style={{marginTop:3,display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>{bPct!==null&&<><div style={{flex:1,maxWidth:200}}><div style={{height:3,borderRadius:2,background:C.surfaceAlt}}><div style={{height:3,borderRadius:2,width:`${Math.min(bPct,100)}%`,background:bPct>=100?C.success:bPct>=50?C.warning:C.danger}}/></div></div><span style={{fontSize:9,fontWeight:600,color:bPct>=100?C.success:bPct>=50?C.warning:C.danger}}>Nytte: {bPct}%</span></>}{owners.length>0&&<span style={{fontSize:8,color:C.textMuted}}>Nytteeiere: {owners.join(", ")}</span>}</div>:null;})()}
          {/* D.8: KPI-trend */}
          {g.current&&<div style={{marginTop:4,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}><Btn variant="ghost" onClick={()=>setGoals(p=>p.map(x=>x.id===g.id?addGoalKpiSnapshot(x,g.current):x))} style={{fontSize:9,padding:"2px 8px",color:C.accent}}>📏 Registrer måling</Btn>{(g.kpiHistory||[]).length>=2&&(()=>{const hist=g.kpiHistory;const vals=hist.map(h=>parseFloat(h.value)||0);const tgt=parseFloat(g.target)||0;const minV=Math.min(...vals,tgt);const maxV=Math.max(...vals,tgt);const range=maxV-minV||1;const w=200;const h2=40;return <svg viewBox={`0 0 ${w} ${h2}`} style={{width:w,height:h2}}>{tgt>0&&<line x1={0} y1={h2-((tgt-minV)/range)*h2} x2={w} y2={h2-((tgt-minV)/range)*h2} stroke={C.success} strokeWidth={1} strokeDasharray="3 2" opacity={.5}/>}<polyline fill="none" stroke={C.primary} strokeWidth={1.5} points={vals.map((v,i)=>`${i*(w/(vals.length-1||1))},${h2-((v-minV)/range)*h2}`).join(" ")}/>{vals.map((v,i)=><circle key={i} cx={i*(w/(vals.length-1||1))} cy={h2-((v-minV)/range)*h2} r={2} fill={C.primary}/>)}<text x={w-2} y={8} textAnchor="end" fontSize={7} fill={C.textMuted}>{vals[vals.length-1]}</text>{tgt>0&&<text x={w-2} y={h2-((tgt-minV)/range)*h2-3} textAnchor="end" fontSize={6} fill={C.success}>mål: {tgt}</text>}</svg>;})()}<span style={{fontSize:8,color:C.textMuted}}>{(g.kpiHistory||[]).length} målinger</span></div>}
        </div>;};return <div key={main.id} style={{marginBottom:8}}>{renderGoalKpi(main,false)}{subs.map(sub=>renderGoalKpi(sub,true))}</div>;})}</Card></div>}

      {tab==="portfolio"&&<div>
        <h1 style={{fontSize:20,fontWeight:700,color:C.primary,margin:"0 0 12px"}}>Porteføljevisning</h1>
        {/* C.9: Nytterealisering – porteføljeaggregering */}
        {(()=>{const active=tasks.filter(t=>!t.archived&&!t.parentId);const done=active.filter(t=>t.status==="done");const totalEstCost=active.reduce((s,t)=>s+(parseFloat(t.estimatedCost)||0),0);const totalEstSaving=active.reduce((s,t)=>s+(parseFloat(t.estimatedAnnualSaving)||0),0);const totalRealizedSaving=done.reduce((s,t)=>s+(parseFloat(t.estimatedAnnualSaving)||0),0);const payback=calcAggregatePayback(active);const measurable=active.filter(t=>t.benefitBaseline&&t.benefitTarget&&t.benefitActual);const avgRealization=measurable.length>0?Math.round(measurable.reduce((s,t)=>s+(calcRealizationPct(t.benefitBaseline,t.benefitTarget,t.benefitActual)||0),0)/measurable.length):null;return <Card style={{marginBottom:14}}><h2 style={{fontSize:13,fontWeight:700,color:C.primary,margin:"0 0 10px"}}>📊 Nytterealisering — Portefølje</h2><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:SP.md}}>
          <div style={{padding:12,background:C.surfaceAlt,borderRadius:8,textAlign:"center"}}><div style={{fontSize:9,color:C.textMuted,textTransform:"uppercase",fontWeight:600}}>Est. total kostnad</div><div style={{fontSize:20,fontWeight:800,color:C.primary}}>{totalEstCost>0?`${Math.round(totalEstCost/1000)}k kr`:"—"}</div></div>
          <div style={{padding:12,background:C.surfaceAlt,borderRadius:8,textAlign:"center"}}><div style={{fontSize:9,color:C.textMuted,textTransform:"uppercase",fontWeight:600}}>Est. årlig besparelse</div><div style={{fontSize:20,fontWeight:800,color:C.success}}>{totalEstSaving>0?`${Math.round(totalEstSaving/1000)}k kr`:"—"}</div></div>
          <div style={{padding:12,background:C.surfaceAlt,borderRadius:8,textAlign:"center"}}><div style={{fontSize:9,color:C.textMuted,textTransform:"uppercase",fontWeight:600}}>Realisert besparelse</div><div style={{fontSize:20,fontWeight:800,color:C.accent}}>{totalRealizedSaving>0?`${Math.round(totalRealizedSaving/1000)}k kr`:"—"}</div></div>
          <div style={{padding:12,background:payback!==null?(payback<=1?C.successBg:payback<=3?C.warningBg:C.dangerBg):C.surfaceAlt,borderRadius:8,textAlign:"center"}}><div style={{fontSize:9,color:C.textMuted,textTransform:"uppercase",fontWeight:600}}>Tilbakebetalingstid</div><div style={{fontSize:20,fontWeight:800,color:payback!==null?(payback<=1?C.success:payback<=3?C.warning:C.danger):C.textMuted}}>{payback!==null?`${payback} år`:"—"}</div></div>
          <div style={{padding:12,background:C.surfaceAlt,borderRadius:8,textAlign:"center"}}><div style={{fontSize:9,color:C.textMuted,textTransform:"uppercase",fontWeight:600}}>Nytterealisering</div><div style={{fontSize:20,fontWeight:800,color:avgRealization!==null?(avgRealization>=100?C.success:avgRealization>=50?C.warning:C.danger):C.textMuted}}>{avgRealization!==null?`${avgRealization}%`:"—"}</div><div style={{fontSize:9,color:C.textMuted}}>{measurable.length} målt av {active.length}</div></div>
        </div></Card>;})()}
        {/* C3: Mål × Løype-matrise */}
        <Card style={{marginBottom:14,padding:0,overflow:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
          <thead><tr style={{background:C.surfaceAlt,borderBottom:`2px solid ${C.primary}`}}>
            <th style={{padding:"8px 10px",textAlign:"left",fontSize:10,fontWeight:700,color:C.primary}}>Mål</th>
            {TRACKS.map(tr=><th key={tr.id} style={{padding:"8px 6px",textAlign:"center",fontSize:9,fontWeight:700,color:tr.color}}>{tr.icon} {tr.label}</th>)}
            <th style={{padding:"8px 6px",textAlign:"center",fontSize:9,fontWeight:700,color:C.textSec}}>Totalt</th>
          </tr></thead>
          <tbody>{goals.filter(g=>!g.parent).map(main=>{
            const allIds=[main.id,...goals.filter(g=>g.parent===main.id).map(g=>g.id)];
            const linked=tasks.filter(t=>!t.archived&&(t.goals||[]).some(g=>allIds.includes(g)));
            return <tr key={main.id} style={{borderBottom:`1px solid ${C.border}`}}>
              <td style={{padding:"8px 10px",fontWeight:600,fontSize:12}}><span>🎯 {main.title}</span>
                <div style={{fontSize:9,color:C.textMuted}}>{linked.length} oppgaver · {linked.filter(t=>t.status==="done"||t.status==="archived").length} ferdig</div></td>
              {TRACKS.map(tr=>{const c=linked.filter(t=>(t.tracks||[]).includes(tr.id));const d=c.filter(t=>t.status==="done"||t.status==="archived").length;const sp=c.reduce((s,t)=>s+(t.size||0),0);const dSP=c.filter(t=>t.status==="done"||t.status==="archived").reduce((s,t)=>s+(t.size||0),0);const spPct=sp?Math.round(dSP/sp*100):0;return <td key={tr.id} style={{padding:"6px",textAlign:"center",verticalAlign:"middle"}}>
                {c.length>0?<div><div style={{fontSize:16,fontWeight:800,color:tr.color}}>{c.length}</div><div style={{fontSize:8,color:C.textMuted}}>{d}/{c.length} ferdig</div><div style={{fontSize:8,color:C.textMuted}}>{dSP}/{sp} SP ({spPct}%)</div>{c.length>0&&<div style={{height:3,borderRadius:2,background:C.surfaceAlt,marginTop:2}}><div style={{height:3,borderRadius:2,background:tr.color,width:`${spPct}%`}}/></div>}</div>
                :<span style={{fontSize:10,color:C.textMuted}}>—</span>}
              </td>;})}
              <td style={{padding:"6px",textAlign:"center"}}><div style={{fontSize:16,fontWeight:800,color:C.primary}}>{linked.length}</div><div style={{fontSize:8,color:C.textMuted}}>{linked.reduce((s,t)=>s+t.size,0)} SP</div></td>
            </tr>;})}</tbody>
        </table></Card>

        {/* Ressursallokering per løype */}
        <Card style={{marginBottom:14}}><h2 style={{fontSize:13,fontWeight:700,color:C.primary,margin:"0 0 10px"}}>Ressursallokering per løype</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
            {TRACKS.map(tr=>{const members=team.filter(m=>m.track===tr.id);const trkTasks=tasks.filter(t=>!t.archived&&(t.tracks||[]).includes(tr.id));const openTasks=trkTasks.filter(t=>t.status!=="done"&&t.status!=="archived"&&t.status!=="rejected");const totalSP=openTasks.reduce((s,t)=>s+t.size,0);return <div key={tr.id} style={{padding:12,background:tr.color+"06",borderRadius:8,border:`1px solid ${tr.color}20`}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}><span style={{fontSize:16}}>{tr.icon}</span><span style={{fontSize:12,fontWeight:700,color:tr.color}}>{tr.label}</span></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4,fontSize:10}}>
                <div><span style={{color:C.textMuted}}>Medlemmer:</span> <strong>{members.length}</strong></div>
                <div><span style={{color:C.textMuted}}>Åpne:</span> <strong>{openTasks.length}</strong></div>
                <div><span style={{color:C.textMuted}}>Total SP:</span> <strong>{totalSP}</strong></div>
                <div><span style={{color:C.textMuted}}>Kapasitet:</span> <strong>{Math.round(members.reduce((s,m)=>s+autoHours(m.availability,config.defaultSprintWeeks||2),0))}t</strong></div>
              </div>
              <div style={{marginTop:6,display:"flex",gap:2,flexWrap:"wrap"}}>{members.map(m=><Badge key={m.id} color={tr.color} bg={tr.color+"10"} style={{fontSize:8}}>{m.name}</Badge>)}</div>
            </div>;})}
          </div>
        </Card>

        {/* Statusoversikt portefølje */}
        <Card><h2 style={{fontSize:13,fontWeight:700,color:C.primary,margin:"0 0 10px"}}>Porteføljestatus</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:8}}>
            {STATUSES.filter(s=>s.id!=="archived").map(st=>{const c=tasks.filter(t=>!t.archived&&t.status===st.id);const sp=c.reduce((s,t)=>s+t.size,0);return <div key={st.id} style={{padding:"10px 12px",background:st.bg,borderRadius:8,border:`1px solid ${st.color}20`}}>
              <div style={{fontSize:20,fontWeight:800,color:st.color}}>{c.length}</div>
              <div style={{fontSize:10,fontWeight:600,color:st.color}}>{st.label}</div>
              <div style={{fontSize:9,color:C.textMuted}}>{sp} SP</div>
            </div>;})}
          </div>
        </Card>
      </div>}

      {tab==="benefit-report"&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}>
          <h1 style={{fontSize:20,fontWeight:700,color:C.primary,margin:0}}>Nytterapport</h1>
          <div style={{display:"flex",gap:4}}>
            <Btn variant="secondary" onClick={()=>{const tks=tasks.filter(t=>!t.archived&&!t.parentId);exportCsvAdvanced(tks,["id","title","status","cost","saving","benefitType","benefitActual","benefitOwner"],composite,"hemit-nytterapport.csv");notify("CSV eksportert");}} style={{fontSize:10,padding:"5px 12px",background:C.surfaceAlt,color:C.primary}}>📥 CSV</Btn>
            <Btn variant="secondary" onClick={()=>{const byTrack=calcBenefitByTrack(tasks);const byGoal=calcBenefitByGoal(tasks,goals);const gaps=calcBenefitGaps(tasks);let html="<h2>Nytte per mål</h2><table><tr><th>Mål</th><th>Oppgaver</th><th>Est.kostnad</th><th>Est.besparelse</th><th>Realisering</th></tr>";byGoal.forEach(g=>{html+=`<tr><td>${g.goalTitle}</td><td>${g.taskCount}</td><td>${g.totalEstCost>0?Math.round(g.totalEstCost/1000)+"k kr":"—"}</td><td>${g.totalEstSaving>0?Math.round(g.totalEstSaving/1000)+"k kr":"—"}</td><td>${g.avgRealization!==null?g.avgRealization+"%":"—"}</td></tr>`;});html+="</table><h2>Nytte per løype</h2><table><tr><th>Løype</th><th>Oppgaver</th><th>Est.kostnad</th><th>Est.besparelse</th><th>Realisering</th></tr>";byTrack.forEach(tr=>{html+=`<tr><td>${tr.trackLabel}</td><td>${tr.taskCount}</td><td>${tr.totalEstCost>0?Math.round(tr.totalEstCost/1000)+"k kr":"—"}</td><td>${tr.totalEstSaving>0?Math.round(tr.totalEstSaving/1000)+"k kr":"—"}</td><td>${tr.avgRealization!==null?tr.avgRealization+"%":"—"}</td></tr>`;});html+="</table>";if(gaps.length){html+="<h2>Gap-analyse</h2><table><tr><th>Oppgave</th><th>Baseline</th><th>Mål</th><th>Faktisk</th><th>Gap</th><th>Nytteeier</th></tr>";gaps.forEach(g=>{html+=`<tr><td>${g.title}</td><td>${g.baseline}</td><td>${g.target}</td><td>${g.actual}</td><td>${g.gap}%</td><td>${g.benefitOwner}</td></tr>`;});html+="</table>";}exportPrintReport("Nytterapport",html);}} style={{fontSize:10,padding:"5px 12px",background:C.surfaceAlt,color:C.primary}}>🖨️ Skriv ut</Btn>
          </div>
        </div>
        {/* KPI-oppsummering */}
        {(()=>{const active=tasks.filter(t=>!t.archived&&!t.parentId);const done=active.filter(t=>t.status==="done");const totalEstCost=active.reduce((s,t)=>s+(parseFloat(t.estimatedCost)||0),0);const totalEstSaving=active.reduce((s,t)=>s+(parseFloat(t.estimatedAnnualSaving)||0),0);const totalRealizedSaving=done.reduce((s,t)=>s+(parseFloat(t.estimatedAnnualSaving)||0),0);const payback=calcAggregatePayback(active);const measurable=active.filter(t=>t.benefitBaseline&&t.benefitTarget&&t.benefitActual);const avgRealization=measurable.length>0?Math.round(measurable.reduce((s,t)=>s+(calcRealizationPct(t.benefitBaseline,t.benefitTarget,t.benefitActual)||0),0)/measurable.length):null;return <Card style={{marginBottom:14}}><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:SP.md}}>
          <div style={{padding:12,background:C.surfaceAlt,borderRadius:8,textAlign:"center"}}><div style={{fontSize:9,color:C.textMuted,textTransform:"uppercase",fontWeight:600}}>Est. total kostnad</div><div style={{fontSize:20,fontWeight:800,color:C.primary}}>{totalEstCost>0?`${Math.round(totalEstCost/1000)}k kr`:"—"}</div></div>
          <div style={{padding:12,background:C.surfaceAlt,borderRadius:8,textAlign:"center"}}><div style={{fontSize:9,color:C.textMuted,textTransform:"uppercase",fontWeight:600}}>Est. årlig besparelse</div><div style={{fontSize:20,fontWeight:800,color:C.success}}>{totalEstSaving>0?`${Math.round(totalEstSaving/1000)}k kr`:"—"}</div></div>
          <div style={{padding:12,background:C.surfaceAlt,borderRadius:8,textAlign:"center"}}><div style={{fontSize:9,color:C.textMuted,textTransform:"uppercase",fontWeight:600}}>Realisert besparelse</div><div style={{fontSize:20,fontWeight:800,color:C.accent}}>{totalRealizedSaving>0?`${Math.round(totalRealizedSaving/1000)}k kr`:"—"}</div></div>
          <div style={{padding:12,background:payback!==null?(payback<=1?C.successBg:payback<=3?C.warningBg:C.dangerBg):C.surfaceAlt,borderRadius:8,textAlign:"center"}}><div style={{fontSize:9,color:C.textMuted,textTransform:"uppercase",fontWeight:600}}>Tilbakebetalingstid</div><div style={{fontSize:20,fontWeight:800,color:payback!==null?(payback<=1?C.success:payback<=3?C.warning:C.danger):C.textMuted}}>{payback!==null?`${payback} år`:"—"}</div></div>
          <div style={{padding:12,background:C.surfaceAlt,borderRadius:8,textAlign:"center"}}><div style={{fontSize:9,color:C.textMuted,textTransform:"uppercase",fontWeight:600}}>Nytterealisering</div><div style={{fontSize:20,fontWeight:800,color:avgRealization!==null?(avgRealization>=100?C.success:avgRealization>=50?C.warning:C.danger):C.textMuted}}>{avgRealization!==null?`${avgRealization}%`:"—"}</div><div style={{fontSize:9,color:C.textMuted}}>{measurable.length} målt av {active.length}</div></div>
        </div></Card>;})()}
        {/* Nytte per mål */}
        <Card style={{marginBottom:14}}><details open><summary style={{fontSize:13,fontWeight:700,color:C.primary,cursor:"pointer",marginBottom:10}}>🎯 Nytte per mål</summary>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}><thead><tr style={{background:C.surfaceAlt,borderBottom:`2px solid ${C.primary}`}}>{["Mål","Oppgaver","Målt","Est.kostnad","Est.besparelse","Realisering"].map(h=><th key={h} style={{padding:"6px 4px",textAlign:"left",fontSize:8,fontWeight:700,textTransform:"uppercase",color:C.textSec}}>{h}</th>)}</tr></thead><tbody>
          {calcBenefitByGoal(tasks,goals).map(g=><tr key={g.goalId} style={{borderBottom:`1px solid ${C.border}`}}>
            <td style={{padding:"6px 4px",fontWeight:600}}>🎯 {g.goalTitle}</td>
            <td style={{padding:"6px 4px"}}>{g.taskCount}</td>
            <td style={{padding:"6px 4px"}}>{g.measuredCount}/{g.taskCount}</td>
            <td style={{padding:"6px 4px"}}>{g.totalEstCost>0?`${Math.round(g.totalEstCost/1000)}k kr`:"—"}</td>
            <td style={{padding:"6px 4px",color:C.success,fontWeight:600}}>{g.totalEstSaving>0?`${Math.round(g.totalEstSaving/1000)}k kr`:"—"}</td>
            <td style={{padding:"6px 4px"}}>{g.avgRealization!==null?<span style={{fontWeight:700,color:g.avgRealization>=100?C.success:g.avgRealization>=50?C.warning:C.danger}}>{g.avgRealization}%</span>:<span style={{color:C.textMuted}}>—</span>}</td>
          </tr>)}
          </tbody></table></details></Card>
        {/* Nytte per løype */}
        <Card style={{marginBottom:14}}><details open><summary style={{fontSize:13,fontWeight:700,color:C.primary,cursor:"pointer",marginBottom:10}}>🔀 Nytte per løype</summary>
          {calcBenefitByTrack(tasks).filter(tr=>tr.taskCount>0).map(tr=><div key={tr.trackId} style={{marginBottom:10,padding:10,background:tr.trackColor+"06",borderRadius:8,border:`1px solid ${tr.trackColor}20`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <span style={{fontSize:12,fontWeight:700,color:tr.trackColor}}>{tr.trackLabel}</span>
              <span style={{fontSize:10,color:C.textMuted}}>{tr.taskCount} oppgaver · {tr.measuredCount} målt</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,fontSize:10}}>
              <div><span style={{color:C.textMuted}}>Est. kostnad:</span> <strong>{tr.totalEstCost>0?`${Math.round(tr.totalEstCost/1000)}k kr`:"—"}</strong></div>
              <div><span style={{color:C.textMuted}}>Est. besparelse:</span> <strong style={{color:C.success}}>{tr.totalEstSaving>0?`${Math.round(tr.totalEstSaving/1000)}k kr`:"—"}</strong></div>
              <div><span style={{color:C.textMuted}}>Realisering:</span> <strong style={{color:tr.avgRealization!==null?(tr.avgRealization>=100?C.success:tr.avgRealization>=50?C.warning:C.danger):C.textMuted}}>{tr.avgRealization!==null?`${tr.avgRealization}%`:"—"}</strong></div>
            </div>
            {tr.avgRealization!==null&&<div style={{height:4,borderRadius:2,background:C.surfaceAlt,marginTop:6}}><div style={{height:4,borderRadius:2,background:tr.avgRealization>=100?C.success:tr.avgRealization>=50?C.warning:C.danger,width:`${Math.min(tr.avgRealization,100)}%`}}/></div>}
          </div>)}
        </details></Card>
        {/* Gap-analyse */}
        {(()=>{const gaps=calcBenefitGaps(tasks);return gaps.length>0&&<Card style={{marginBottom:14}}><details open><summary style={{fontSize:13,fontWeight:700,color:C.primary,cursor:"pointer",marginBottom:10}}>⚠️ Gap-analyse — avvik mellom mål og faktisk</summary>
          <table className={s.gapTable} style={{width:"100%",borderCollapse:"collapse",fontSize:11}}><thead><tr style={{background:C.surfaceAlt,borderBottom:`2px solid ${C.primary}`}}>{["Oppgave","Baseline","Mål","Faktisk","Realisering","Gap","Nytteeier"].map(h=><th key={h} style={{padding:"6px 4px",textAlign:"left",fontSize:8,fontWeight:700,textTransform:"uppercase",color:C.textSec}}>{h}</th>)}</tr></thead><tbody>
          {gaps.map(g=><tr key={g.id} style={{borderBottom:`1px solid ${C.border}`,background:g.gap>50?C.dangerBg+"40":"transparent"}}>
            <td style={{padding:"6px 4px",fontWeight:600}}>{g.title}</td>
            <td style={{padding:"6px 4px"}}>{g.baseline}</td>
            <td style={{padding:"6px 4px"}}>{g.target}</td>
            <td style={{padding:"6px 4px",fontWeight:600}}>{g.actual}</td>
            <td style={{padding:"6px 4px",fontWeight:700,color:g.realization>=100?C.success:g.realization>=50?C.warning:C.danger}}>{g.realization}%</td>
            <td style={{padding:"6px 4px",fontWeight:700,color:C.danger}}>{g.gap>0?`${g.gap}%`:"✓"}</td>
            <td style={{padding:"6px 4px",fontSize:10,color:C.textMuted}}>{g.benefitOwner||"—"}</td>
          </tr>)}
          </tbody></table></details></Card>;})()}
        {/* Realiseringstidslinje */}
        {(()=>{const withPlan=tasks.filter(t=>!t.archived&&(t.benefitPlan||[]).length>0);return withPlan.length>0&&<Card><details><summary style={{fontSize:13,fontWeight:700,color:C.primary,cursor:"pointer",marginBottom:10}}>📋 Realiseringstidslinje ({withPlan.length} oppgaver)</summary>
          {withPlan.map(t=><div key={t.id} style={{marginBottom:10,padding:10,background:C.surfaceAlt,borderRadius:8}}>
            <div style={{fontSize:12,fontWeight:600,marginBottom:6}}>{t.title} <span style={{fontSize:10,color:C.textMuted}}>({t.id})</span></div>
            <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4}}>
              {(t.benefitPlan||[]).map((p,i)=><div key={i} style={{minWidth:120,padding:8,background:C.surface,borderRadius:6,border:`1px solid ${p.measured?C.success:C.border}`,textAlign:"center"}}>
                <div style={{width:12,height:12,borderRadius:"50%",background:p.measured?C.success:C.border,margin:"0 auto 4px"}}/>
                <div style={{fontSize:10,fontWeight:600}}>{p.milestone||p.date}</div>
                <div style={{fontSize:9,color:C.textMuted}}>{p.date}</div>
                {p.measured&&p.value&&<div style={{fontSize:10,fontWeight:700,color:C.success,marginTop:2}}>{p.value}</div>}
                {!p.measured&&<div style={{fontSize:9,color:C.warning,marginTop:2}}>Ikke målt</div>}
              </div>)}
            </div>
          </div>)}
        </details></Card>;})()}
      </div>}

      {tab==="config"&&<div style={{maxWidth:760,margin:"0 auto"}}><h1 style={{fontSize:20,fontWeight:700,color:C.primary,margin:"0 0 12px"}}>Konfigurasjon</h1>
        {!configUnlocked?<Card style={{marginBottom:12,textAlign:"center",padding:"40px 20px"}}><SH>🔒 Passordbeskytta</SH><p style={{fontSize:12,color:C.textMuted,margin:"8px 0 16px"}}>Skriv inn passord for å få tilgang til konfigurasjonen.</p>
          <div style={{display:"flex",gap:8,justifyContent:"center",alignItems:"center"}}><input type="password" value={configPw} onChange={e=>setConfigPw(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){if(configPw==="22navenena"){setConfigUnlocked(true);setConfigPw("");}else{setConfigPw("");alert("Feil passord");}}}} placeholder="Passord..." style={{fontSize:13,padding:"8px 14px",borderRadius:8,border:`1px solid ${C.border}`,background:C.surface,color:C.text,width:220}}/><Btn onClick={()=>{if(configPw==="22navenena"){setConfigUnlocked(true);setConfigPw("");}else{setConfigPw("");alert("Feil passord");}}} style={{padding:"8px 18px"}}>Lås opp</Btn></div>
        </Card>:<>
        <Card style={{marginBottom:12}}><SH>Generelt</SH>
          <TF label="Appnavn (vises i headingen)" id="cfg-appTitle" value={config.appTitle||"Hemit Nyttestyring"} onChange={e=>setConfig(c=>({...c,appTitle:e.target.value}))} placeholder="Hemit Nyttestyring"/>
          <div style={{marginTop:10}}><TF label="Gemini API-nøkkel (for AI-assistanse)" id="cfg-aiKey" type="password" value={config.geminiApiKey||""} onChange={e=>setConfig(c=>({...c,geminiApiKey:e.target.value}))} placeholder="AIza..."/></div>
        </Card>
        <Card style={{marginBottom:12}}><SH>Sprinter</SH><p style={{fontSize:10,color:C.textMuted,margin:"-4px 0 10px"}}>Administrer sprinter. Kun én sprint kan være aktiv om gangen.</p>
          <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:10}}>{sprints.map(s=>{const sc={completed:{c:C.textMuted,bg:C.surfaceAlt},active:{c:C.success,bg:C.successBg},planned:{c:C.accent,bg:C.accent+"10"}}[s.status]||{c:C.accent,bg:C.accent+"10"};return <div key={s.id} style={{display:"grid",gridTemplateColumns:"auto 2fr 1fr 1fr auto auto",gap:6,alignItems:"center",padding:"6px 10px",background:C.surface,borderRadius:7,border:`1px solid ${C.border}`}}>
            <Badge color={sc.c} bg={sc.bg} style={{fontSize:8}}>{s.status==="completed"?"Avsluttet":s.status==="active"?"Aktiv":"Planlagt"}</Badge>
            <input value={s.name} onChange={e=>setSprints(p=>p.map(x=>x.id===s.id?{...x,name:e.target.value}:x))} style={{fontSize:11,fontWeight:600,border:`1px solid ${C.border}`,borderRadius:4,padding:"3px 6px",background:C.surface,color:C.text}}/>
            <input type="date" value={s.start} onChange={e=>setSprints(p=>p.map(x=>x.id===s.id?{...x,start:e.target.value}:x))} style={{fontSize:10,border:`1px solid ${C.border}`,borderRadius:4,padding:"3px 6px",background:C.surface,color:C.text}}/>
            <input type="date" value={s.end} onChange={e=>setSprints(p=>p.map(x=>x.id===s.id?{...x,end:e.target.value}:x))} style={{fontSize:10,border:`1px solid ${C.border}`,borderRadius:4,padding:"3px 6px",background:C.surface,color:C.text}}/>
            <select value={s.status} onChange={e=>{const ns=e.target.value;setSprints(p=>p.map(x=>{if(x.id===s.id){if(ns==="completed"){const sTasks=tasks.filter(t=>t.sprintId===s.id&&!t.archived);return{...x,status:ns,planned:sTasks.reduce((a,t)=>a+t.size,0),delivered:sTasks.filter(t=>t.status==="done").reduce((a,t)=>a+t.size,0)};}return{...x,status:ns};}if(ns==="active"&&x.status==="active")return{...x,status:"completed",planned:tasks.filter(t=>t.sprintId===x.id&&!t.archived).reduce((a,t)=>a+t.size,0),delivered:tasks.filter(t=>t.sprintId===x.id&&t.status==="done"&&!t.archived).reduce((a,t)=>a+t.size,0)};return x;}));}} style={{fontSize:10,padding:"3px 6px",borderRadius:4,border:`1px solid ${sc.c}`,background:sc.bg,color:sc.c}}>
              <option value="planned">Planlagt</option><option value="active">Aktiv</option><option value="completed">Avsluttet</option>
            </select>
            <Btn variant="ghost" onClick={()=>{if(confirm(`Slette ${s.name}?`))setSprints(p=>p.filter(x=>x.id!==s.id));}} style={{fontSize:9,padding:"2px 5px",color:C.danger}}>🗑️</Btn>
          </div>;})}</div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}><Btn onClick={()=>{const num=sprints.length>0?parseInt(sprints[sprints.length-1].id.replace("S-",""))+1:29;setSprints(p=>[...p,{id:`S-${num}`,name:`Sprint ${num}`,start:"",end:"",weeks:config.defaultSprintWeeks||2,status:"planned",planned:0,delivered:0}]);notify("Ny sprint opprettet");}} style={{fontSize:11}}>+ Ny sprint</Btn><div style={{display:"flex",alignItems:"center",gap:4}}><label style={{fontSize:10,color:C.textMuted}}>Standard uker:</label><input type="number" value={config.defaultSprintWeeks||2} onChange={e=>setConfig(c=>({...c,defaultSprintWeeks:parseInt(e.target.value)||2}))} style={{width:50,padding:"3px 6px",borderRadius:4,border:`1px solid ${C.border}`,fontSize:10,background:C.surface,color:C.text}} min={1} max={8}/></div></div>
          <p style={{fontSize:10,color:C.textMuted,marginTop:6}}>Timer = allokering% × 37,5 × sprintens uker</p>
        </Card>
        <Card style={{marginBottom:12}}><SH>E-postvarsling</SH><div style={{display:"flex",gap:12,marginBottom:8,flexWrap:"wrap"}}>{[["emailNotifications","Aktiver"],["emailOnStatusChange","Statusendring"],["emailOnReview","Vurdering"],["notifyProcessOwner","Varsle prosesseier"]].map(([k,l])=><label key={k} style={{display:"flex",alignItems:"center",gap:4,fontSize:12,cursor:"pointer"}}><input type="checkbox" checked={config[k]} onChange={e=>setConfig(c=>({...c,[k]:e.target.checked}))}/>{l}</label>)}</div><TF label="Adresser (komma)" id="c-em" value={config.notifyEmails.join(", ")} onChange={e=>setConfig(c=>({...c,notifyEmails:e.target.value.split(",").map(s=>s.trim()).filter(Boolean)}))}/></Card>
        <Card style={{marginBottom:12}}><SH>DPIA / Personvern</SH><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><TF label="DPIA-mal lenke" id="c-dp" value={config.dpiaLink} onChange={e=>setConfig(c=>({...c,dpiaLink:e.target.value}))}/><TF label="EQS DPIA-ref" id="c-de" value={config.dpiaEqsRef} onChange={e=>setConfig(c=>({...c,dpiaEqsRef:e.target.value}))}/></div><p style={{fontSize:10,color:C.textMuted,marginTop:4}}>Vises automatisk ved persondata=Ja.</p></Card>
        <Card style={{marginBottom:12}}><SH>Scoringsvekter</SH><input type="range" min={10} max={90} value={config.scoringWeights.wsjf} onChange={e=>setConfig(c=>({...c,scoringWeights:{wsjf:parseInt(e.target.value),trackSpecific:100-parseInt(e.target.value)}}))} style={{width:"100%",accentColor:C.primary}}/><div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.textMuted}}><span>WSJF: {config.scoringWeights.wsjf}%</span><span>Løype: {config.scoringWeights.trackSpecific}%</span></div></Card>

        {/* ══ Faste deloppgaver per løype ══ */}
        <Card style={{marginBottom:12}}><SH>📋 Faste deloppgaver per løype</SH><p style={{fontSize:10,color:C.textMuted,margin:"-4px 0 10px"}}>Definer standardoppgaver som kan opprettes automatisk for hver løype.</p>
          {TRACKS.map(tr=>{const items=config.trackSubtasks?.[tr.id]||[];return <div key={tr.id} style={{marginBottom:10,border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden"}}>
            <div style={{display:"flex",alignItems:"center",gap:6,padding:"8px 12px",background:C.surfaceAlt,borderBottom:`1px solid ${C.border}`,cursor:"pointer"}} onClick={()=>setExpandedTrack(p=>p===tr.id?null:tr.id)}>
              <span style={{fontSize:14}}>{tr.icon}</span><span style={{fontSize:12,fontWeight:700,color:tr.color}}>{tr.label}</span>
              <Badge color={C.textMuted} bg={C.surface} style={{fontSize:9,marginLeft:"auto"}}>{items.length} maler</Badge>
              <span style={{fontSize:10,color:C.textMuted}}>{expandedTrack===tr.id?"▲":"▼"}</span>
            </div>
            {expandedTrack===tr.id&&<div style={{padding:10}}>
              {items.map((item,idx)=>{const updateTpl=(patch)=>setConfig(c=>({...c,trackSubtasks:{...c.trackSubtasks,[tr.id]:(c.trackSubtasks?.[tr.id]||[]).map((it,i)=>i===idx?{...it,...patch}:it)}}));return <div key={idx} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 8px",marginBottom:4,background:C.surface,borderRadius:6,border:`1px solid ${C.border}`}}>
                <input value={item.title} onChange={e=>updateTpl({title:e.target.value})} style={{flex:1,fontSize:11,padding:"3px 6px",borderRadius:4,border:`1px solid ${C.border}`,background:C.surface,color:C.text,fontFamily:"inherit",outline:"none"}}/>
                <select value={item.size} onChange={e=>updateTpl({size:parseInt(e.target.value)})} style={{fontSize:10,padding:"3px 4px",borderRadius:4,border:`1px solid ${C.border}`,background:C.surface,color:C.text,fontWeight:600}}>{FIBONACCI.map(f=><option key={f.v} value={f.v}>{f.l}</option>)}</select>
                <Btn variant="ghost" onClick={()=>setConfig(c=>({...c,trackSubtasks:{...c.trackSubtasks,[tr.id]:(c.trackSubtasks?.[tr.id]||[]).filter((_,i)=>i!==idx)}}))} style={{fontSize:9,padding:"2px 5px",color:C.danger}}>🗑️</Btn>
              </div>;})}
              <div style={{display:"grid",gridTemplateColumns:"3fr 1fr auto",gap:6,alignItems:"end",marginTop:6}}>
                <TF label="" id={`tpl-${tr.id}-t`} value={tplForm[tr.id]?.title||""} onChange={e=>setTplForm(f=>({...f,[tr.id]:{...(f[tr.id]||{title:"",size:3}),title:e.target.value}}))} placeholder="Ny deloppgavemal..."/>
                <SF label="" id={`tpl-${tr.id}-sp`} value={tplForm[tr.id]?.size||3} onChange={e=>setTplForm(f=>({...f,[tr.id]:{...(f[tr.id]||{title:"",size:3}),size:parseInt(e.target.value)}}))}>
                  {FIBONACCI.map(f=><option key={f.v} value={f.v}>{f.l}</option>)}
                </SF>
                <Btn onClick={()=>{const t=tplForm[tr.id]?.title?.trim();if(!t)return;setConfig(c=>({...c,trackSubtasks:{...c.trackSubtasks,[tr.id]:[...(c.trackSubtasks?.[tr.id]||[]),{title:t,size:tplForm[tr.id]?.size||3}]}}));setTplForm(f=>({...f,[tr.id]:{title:"",size:3}}));notify(`Mal "${t}" lagt til for ${tr.label}`);}}>+ Legg til</Btn>
              </div>
            </div>}
          </div>;})}
        </Card>

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
            <div style={{padding:"8px 12px",background:config.auth?.tenantId&&config.auth?.clientId?C.successBg:C.warningBg,borderRadius:7,marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:16}}>{config.auth?.tenantId&&config.auth?.clientId?"✅":"⚠️"}</span>
              <div><div style={{fontSize:11,fontWeight:700,color:config.auth?.tenantId&&config.auth?.clientId?C.success:C.warning}}>{config.auth?.tenantId&&config.auth?.clientId?"Konfigurert – klar til aktivering":"Mangler påkrevde felter"}</div><div style={{fontSize:10,color:C.textMuted}}>Provider: Microsoft Entra ID (Azure AD)</div></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <div title="Directory (tenant) ID fra Azure Portal → App-registreringer"><TF label="Tenant ID (Katalog-ID) *" id="c-tenant" value={config.auth?.tenantId||""} onChange={e=>setConfig(c=>({...c,auth:{...c.auth,tenantId:e.target.value}}))} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"/></div>
              <div title="Application (client) ID fra Azure Portal → App-registreringer"><TF label="Client ID (Applikasjons-ID) *" id="c-client" value={config.auth?.clientId||""} onChange={e=>setConfig(c=>({...c,auth:{...c.auth,clientId:e.target.value}}))} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"/></div>
            </div>
            <div style={{marginBottom:10}}><TF label="Tillatte e-postdomener (komma)" id="c-domains" value={(config.auth?.allowedDomains||[]).join(", ")} onChange={e=>setConfig(c=>({...c,auth:{...c.auth,allowedDomains:e.target.value.split(",").map(s=>s.trim()).filter(Boolean)}}))} placeholder="hemit.no, helse-midt.no"/><p style={{fontSize:9,color:C.textMuted,margin:"3px 0 0"}}>Kun brukere med disse domenene kan logge inn. La stå tomt for å tillate alle.</p></div>
            <div style={{display:"flex",gap:14,marginBottom:12,flexWrap:"wrap"}}>
              <label style={{display:"flex",alignItems:"center",gap:5,fontSize:12,cursor:"pointer"}}><input type="checkbox" checked={config.auth?.requireMfa||false} onChange={e=>setConfig(c=>({...c,auth:{...c.auth,requireMfa:e.target.checked}}))}/>Krev MFA (multifaktor)</label>
              <label style={{display:"flex",alignItems:"center",gap:5,fontSize:12,cursor:"pointer"}}><input type="checkbox" checked={config.auth?.autoProvision!==false} onChange={e=>setConfig(c=>({...c,auth:{...c.auth,autoProvision:e.target.checked}}))}/>Auto-opprett brukere ved første innlogging</label>
              <div style={{display:"flex",alignItems:"center",gap:5}}><label style={{fontSize:12}} htmlFor="c-timeout">Sesjonstid (min):</label><input type="number" id="c-timeout" value={config.auth?.sessionTimeout||480} onChange={e=>setConfig(c=>({...c,auth:{...c.auth,sessionTimeout:parseInt(e.target.value)||480}}))} style={{width:60,padding:"4px 6px",borderRadius:6,border:`1px solid ${C.border}`,fontSize:12,background:C.surface,color:C.text}} min={15} max={1440}/></div>
            </div>
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
            <div style={{padding:"8px 12px",background:config.azureDevOps?.orgUrl&&config.azureDevOps?.pat?C.successBg:C.warningBg,borderRadius:7,marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:16}}>{config.azureDevOps?.orgUrl&&config.azureDevOps?.pat?"✅":"⚠️"}</span>
              <div><div style={{fontSize:11,fontWeight:700,color:config.azureDevOps?.orgUrl&&config.azureDevOps?.pat?C.success:C.warning}}>{config.azureDevOps?.orgUrl&&config.azureDevOps?.pat?"Tilkoblingsinfo konfigurert":"Mangler påkrevde felter"}</div><div style={{fontSize:10,color:C.textMuted}}>Synkroniserer forbedringsforslag → Azure DevOps Work Items</div></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:10,marginBottom:10}}>
              <TF label="Organisasjons-URL *" id="c-ado-org" value={config.azureDevOps?.orgUrl||""} onChange={e=>setConfig(c=>({...c,azureDevOps:{...c.azureDevOps,orgUrl:e.target.value}}))} placeholder="https://dev.azure.com/hemit"/>
              <TF label="Standardprosjekt" id="c-ado-proj" value={config.azureDevOps?.defaultProject||""} onChange={e=>setConfig(c=>({...c,azureDevOps:{...c.azureDevOps,defaultProject:e.target.value}}))} placeholder="Nyttestyring"/>
            </div>
            <div style={{marginBottom:10}}>
              <TF label="Personal Access Token (PAT) *" id="c-ado-pat" value={config.azureDevOps?.pat||""} onChange={e=>setConfig(c=>({...c,azureDevOps:{...c.azureDevOps,pat:e.target.value}}))} placeholder="Lim inn PAT fra Azure DevOps"/>
              <p style={{fontSize:9,color:C.textMuted,margin:"3px 0 0"}}>Krever tillatelse: Work Items (Read & Write). Opprett via Azure DevOps → User Settings → Personal Access Tokens.</p>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
              <SF label="Work Item-type" id="c-ado-wit" value={config.azureDevOps?.workItemType||"User Story"} onChange={e=>setConfig(c=>({...c,azureDevOps:{...c.azureDevOps,workItemType:e.target.value}}))}>
                <option value="User Story">User Story</option><option value="Bug">Bug</option><option value="Task">Task</option><option value="Feature">Feature</option><option value="Epic">Epic</option>
              </SF>
              <TF label="Area Path" id="c-ado-area" value={config.azureDevOps?.areaPath||""} onChange={e=>setConfig(c=>({...c,azureDevOps:{...c.azureDevOps,areaPath:e.target.value}}))} placeholder="Prosjekt\Team"/>
              <TF label="Iteration Path" id="c-ado-iter" value={config.azureDevOps?.iterationPath||""} onChange={e=>setConfig(c=>({...c,azureDevOps:{...c.azureDevOps,iterationPath:e.target.value}}))} placeholder="Prosjekt\Sprint 27"/>
            </div>
            <div style={{display:"flex",gap:14,marginBottom:12,flexWrap:"wrap"}}>
              <label style={{display:"flex",alignItems:"center",gap:5,fontSize:12,cursor:"pointer"}}><input type="checkbox" checked={config.azureDevOps?.syncWorkItems!==false} onChange={e=>setConfig(c=>({...c,azureDevOps:{...c.azureDevOps,syncWorkItems:e.target.checked}}))}/>Synkroniser work items</label>
              <label style={{display:"flex",alignItems:"center",gap:5,fontSize:12,cursor:"pointer"}}><input type="checkbox" checked={config.azureDevOps?.syncOnStatusChange!==false} onChange={e=>setConfig(c=>({...c,azureDevOps:{...c.azureDevOps,syncOnStatusChange:e.target.checked}}))}/>Synk ved statusendring</label>
            </div>
            <div style={{border:`1px solid ${C.border}`,borderRadius:8,padding:12,marginBottom:10,background:C.bg}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><h4 style={{fontSize:12,fontWeight:700,color:C.primary,margin:0}}>Statusmapping – App → DevOps</h4><Btn style={{fontSize:10,padding:"4px 10px"}} onClick={()=>setConfig(c=>({...c,azureDevOps:{...c.azureDevOps,statusMapping:[...(c.azureDevOps?.statusMapping||[]),{id:`sm${Date.now()}`,appStatus:"",devOpsState:""}]}}))}>+ Legg til</Btn></div>
              <p style={{fontSize:10,color:C.textMuted,margin:"0 0 8px"}}>Koble applikasjonsstatus til Azure DevOps work item-tilstander.</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:6,marginBottom:4,fontSize:9,fontWeight:700,color:C.textMuted,textTransform:"uppercase",padding:"0 2px"}}><span>App-status</span><span>DevOps State</span><span></span></div>
              {(config.azureDevOps?.statusMapping||[]).map((sm,si)=><div key={sm.id} style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:6,marginBottom:4,alignItems:"center"}}>
                <select value={sm.appStatus} onChange={e=>{const m=[...(config.azureDevOps?.statusMapping||[])];m[si]={...m[si],appStatus:e.target.value};setConfig(c=>({...c,azureDevOps:{...c.azureDevOps,statusMapping:m}}));}} style={{padding:"5px 6px",borderRadius:5,border:`1px solid ${C.border}`,fontSize:11,background:C.surface,color:C.text}}>
                  <option value="">Velg...</option>{STATUSES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                <input value={sm.devOpsState} onChange={e=>{const m=[...(config.azureDevOps?.statusMapping||[])];m[si]={...m[si],devOpsState:e.target.value};setConfig(c=>({...c,azureDevOps:{...c.azureDevOps,statusMapping:m}}));}} placeholder="f.eks. Active, Resolved" style={{padding:"5px 8px",borderRadius:5,border:`1px solid ${C.border}`,fontSize:11,background:C.surface,color:C.text}}/>
                <Btn variant="ghost" onClick={()=>setConfig(c=>({...c,azureDevOps:{...c.azureDevOps,statusMapping:(c.azureDevOps?.statusMapping||[]).filter((_,j)=>j!==si)}}))} style={{fontSize:10,padding:"3px 8px",color:C.danger}}>🗑️</Btn>
              </div>)}
            </div>
            <details style={{marginBottom:4}}>
              <summary style={{fontSize:11,fontWeight:700,color:C.accent,cursor:"pointer",padding:"4px 0"}}>📋 Oppsettguide – Azure DevOps</summary>
              <div style={{fontSize:11,color:C.textSec,lineHeight:1.6,padding:"8px 12px",background:C.surfaceAlt,borderRadius:7,marginTop:4}}>
                <strong>1. Opprett PAT</strong><br/>Azure DevOps → User Settings → Personal Access Tokens → New Token<br/>Scope: Work Items – Read & Write<br/><br/>
                <strong>2. Finn organisasjons-URL</strong><br/>URL: <code style={{fontSize:10,background:C.bg,padding:"1px 4px",borderRadius:3}}>https://dev.azure.com/din-org</code><br/><br/>
                <strong>3. Prosjektoppsett</strong><br/>Opprett et prosjekt i Azure DevOps for å motta work items.<br/><br/>
                <strong>4. Statusmapping</strong><br/>Map applikasjonsstatus til gyldige DevOps-tilstander.
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
            <div style={{padding:"8px 12px",background:config.serviceNow?.instanceUrl?C.successBg:C.warningBg,borderRadius:7,marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:16}}>{config.serviceNow?.instanceUrl?"✅":"⚠️"}</span>
              <div><div style={{fontSize:11,fontWeight:700,color:config.serviceNow?.instanceUrl?C.success:C.warning}}>{config.serviceNow?.instanceUrl?"Tilkoblingsinfo konfigurert":"Mangler instans-URL"}</div><div style={{fontSize:10,color:C.textMuted}}>Synkroniserer forbedringsforslag → ServiceNow-poster</div></div>
            </div>
            <div style={{marginBottom:10}}><TF label="Instans-URL *" id="c-sn-url" value={config.serviceNow?.instanceUrl||""} onChange={e=>setConfig(c=>({...c,serviceNow:{...c.serviceNow,instanceUrl:e.target.value}}))} placeholder="https://hemit.service-now.com"/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 2fr 2fr",gap:10,marginBottom:10}}>
              <SF label="Autentisering" id="c-sn-auth" value={config.serviceNow?.authMethod||"basic"} onChange={e=>setConfig(c=>({...c,serviceNow:{...c.serviceNow,authMethod:e.target.value}}))}>
                <option value="basic">Basic Auth</option><option value="oauth">OAuth 2.0</option>
              </SF>
              {config.serviceNow?.authMethod==="basic"&&<><TF label="Brukernavn" id="c-sn-user" value={config.serviceNow?.username||""} onChange={e=>setConfig(c=>({...c,serviceNow:{...c.serviceNow,username:e.target.value}}))} placeholder="integrasjonsbruker"/><TF label="Passord" id="c-sn-pass" value={config.serviceNow?.password||""} onChange={e=>setConfig(c=>({...c,serviceNow:{...c.serviceNow,password:e.target.value}}))} placeholder="••••••••"/></>}
              {config.serviceNow?.authMethod==="oauth"&&<><TF label="Client ID" id="c-sn-cid" value={config.serviceNow?.clientId||""} onChange={e=>setConfig(c=>({...c,serviceNow:{...c.serviceNow,clientId:e.target.value}}))} placeholder="OAuth Client ID"/><TF label="Client Secret" id="c-sn-csec" value={config.serviceNow?.clientSecret||""} onChange={e=>setConfig(c=>({...c,serviceNow:{...c.serviceNow,clientSecret:e.target.value}}))} placeholder="OAuth Client Secret"/></>}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
              <SF label="Tabell" id="c-sn-table" value={config.serviceNow?.table||"incident"} onChange={e=>setConfig(c=>({...c,serviceNow:{...c.serviceNow,table:e.target.value}}))}>
                <option value="incident">Incident</option><option value="change_request">Change Request</option><option value="sc_req_item">Requested Item</option><option value="problem">Problem</option>
              </SF>
              <TF label="Assignment Group" id="c-sn-ag" value={config.serviceNow?.assignmentGroup||""} onChange={e=>setConfig(c=>({...c,serviceNow:{...c.serviceNow,assignmentGroup:e.target.value}}))} placeholder="IT Utvikling"/>
              <SF label="Kategori" id="c-sn-cat" value={config.serviceNow?.category||"Software"} onChange={e=>setConfig(c=>({...c,serviceNow:{...c.serviceNow,category:e.target.value}}))}>
                <option value="Software">Software</option><option value="Hardware">Hardware</option><option value="Network">Network</option><option value="Database">Database</option><option value="Inquiry / Help">Inquiry / Help</option>
              </SF>
            </div>
            <div style={{display:"flex",gap:14,marginBottom:12,flexWrap:"wrap"}}>
              <label style={{display:"flex",alignItems:"center",gap:5,fontSize:12,cursor:"pointer"}}><input type="checkbox" checked={config.serviceNow?.syncIncidents!==false} onChange={e=>setConfig(c=>({...c,serviceNow:{...c.serviceNow,syncIncidents:e.target.checked}}))}/>Synkroniser incidents</label>
              <label style={{display:"flex",alignItems:"center",gap:5,fontSize:12,cursor:"pointer"}}><input type="checkbox" checked={config.serviceNow?.syncChangeRequests||false} onChange={e=>setConfig(c=>({...c,serviceNow:{...c.serviceNow,syncChangeRequests:e.target.checked}}))}/>Synkroniser change requests</label>
              <label style={{display:"flex",alignItems:"center",gap:5,fontSize:12,cursor:"pointer"}}><input type="checkbox" checked={config.serviceNow?.syncOnStatusChange!==false} onChange={e=>setConfig(c=>({...c,serviceNow:{...c.serviceNow,syncOnStatusChange:e.target.checked}}))}/>Synk ved statusendring</label>
            </div>
            <div style={{border:`1px solid ${C.border}`,borderRadius:8,padding:12,marginBottom:10,background:C.bg}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><h4 style={{fontSize:12,fontWeight:700,color:C.primary,margin:0}}>Statusmapping – App → ServiceNow</h4><Btn style={{fontSize:10,padding:"4px 10px"}} onClick={()=>setConfig(c=>({...c,serviceNow:{...c.serviceNow,statusMapping:[...(c.serviceNow?.statusMapping||[]),{id:`sn${Date.now()}`,appStatus:"",snowState:""}]}}))}>+ Legg til</Btn></div>
              <p style={{fontSize:10,color:C.textMuted,margin:"0 0 8px"}}>Koble applikasjonsstatus til ServiceNow-tilstander.</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:6,marginBottom:4,fontSize:9,fontWeight:700,color:C.textMuted,textTransform:"uppercase",padding:"0 2px"}}><span>App-status</span><span>ServiceNow State</span><span></span></div>
              {(config.serviceNow?.statusMapping||[]).map((sm,si)=><div key={sm.id} style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:6,marginBottom:4,alignItems:"center"}}>
                <select value={sm.appStatus} onChange={e=>{const m=[...(config.serviceNow?.statusMapping||[])];m[si]={...m[si],appStatus:e.target.value};setConfig(c=>({...c,serviceNow:{...c.serviceNow,statusMapping:m}}));}} style={{padding:"5px 6px",borderRadius:5,border:`1px solid ${C.border}`,fontSize:11,background:C.surface,color:C.text}}>
                  <option value="">Velg...</option>{STATUSES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                <input value={sm.snowState} onChange={e=>{const m=[...(config.serviceNow?.statusMapping||[])];m[si]={...m[si],snowState:e.target.value};setConfig(c=>({...c,serviceNow:{...c.serviceNow,statusMapping:m}}));}} placeholder="f.eks. New, In Progress, Resolved" style={{padding:"5px 8px",borderRadius:5,border:`1px solid ${C.border}`,fontSize:11,background:C.surface,color:C.text}}/>
                <Btn variant="ghost" onClick={()=>setConfig(c=>({...c,serviceNow:{...c.serviceNow,statusMapping:(c.serviceNow?.statusMapping||[]).filter((_,j)=>j!==si)}}))} style={{fontSize:10,padding:"3px 8px",color:C.danger}}>🗑️</Btn>
              </div>)}
            </div>
            <details style={{marginBottom:4}}>
              <summary style={{fontSize:11,fontWeight:700,color:C.purple,cursor:"pointer",padding:"4px 0"}}>📋 Oppsettguide – ServiceNow</summary>
              <div style={{fontSize:11,color:C.textSec,lineHeight:1.6,padding:"8px 12px",background:C.surfaceAlt,borderRadius:7,marginTop:4}}>
                <strong>1. Integrasjonsbruker</strong><br/>ServiceNow → Brukeradministrasjon → Opprett dedikert integrasjonsbruker<br/>Tildel rollen <code style={{fontSize:10,background:C.bg,padding:"1px 4px",borderRadius:3}}>itil</code><br/><br/>
                <strong>2. OAuth-oppsett (valgfritt)</strong><br/>System OAuth → Application Registry → Opprett OAuth-applikasjon<br/><br/>
                <strong>3. Instans-URL</strong><br/>URL: <code style={{fontSize:10,background:C.bg,padding:"1px 4px",borderRadius:3}}>https://din-instans.service-now.com</code><br/><br/>
                <strong>4. Assignment Group</strong><br/>Definer hvilken gruppe som mottar saker.<br/><br/>
                <strong>5. Statusmapping</strong><br/>Map applikasjonsstatus til gyldige ServiceNow-tilstander.
              </div>
            </details>
          </div>}
        </Card>

        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><Btn variant="secondary" onClick={loadConfig} style={{background:C.surfaceAlt,color:C.primary}}>📥 Last inn</Btn><Btn onClick={saveConfig}>💾 Lagre</Btn></div></>}</div>}

    </main>
    <footer style={{borderTop:`1px solid ${C.border}`,padding:"10px 18px",textAlign:"center",fontSize:10,color:C.textMuted}}>Hemit HF – Nyttestyringsverktøy v7.0 · 37,5 t/uke</footer>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700;800&display=swap');*,*::before,*::after{box-sizing:border-box;}input[type="range"]{height:5px;-webkit-appearance:none;background:transparent;}input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:${C.primary};cursor:pointer;border:2px solid ${C.surface};box-shadow:0 1px 3px rgba(0,0,0,.2);margin-top:-5px;}input[type="range"]::-webkit-slider-runnable-track{height:5px;border-radius:3px;background:${C.border};}`}</style>
  </div></ThemeContext.Provider>;
}
