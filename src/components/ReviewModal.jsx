import React, { useState } from "react";
import { useTheme } from "../ThemeContext";
import { TRACKS, STATUSES, PRIORITIES, FIBONACCI, SCORING_CRITERIA, SCORE_EXAMPLES, calcWeightedScore, makeComposite, stMap, TIP, STATUS_TRANSITIONS, validTransition, BENEFIT_UNITS, BENEFIT_CATEGORIES, calcRealizationPct, BENEFIT_TYPES, BENEFIT_CLASSIFICATIONS, PIR_LESSON_CATEGORIES, SP, td, buildPirReport, ENTERPRISES, SOLUTION_CATEGORIES } from "../constants";
import { Badge, Card, Btn, SH, TF, SF, Sl, GoalPicker, Tip, KriterieScoring } from "../atoms";
import AttachArea from "./AttachArea";
import CommentsPanel from "./CommentsPanel";
import HistoryPanel from "./HistoryPanel";
import { suggestBenefitEstimate } from "../ai";

const TABS=[
  {id:"scoring",label:"Vurdering",icon:"📊"},
  {id:"benefit",label:"Nytte",icon:"📈"},
  {id:"subtasks",label:"Deloppgaver",icon:"🧩"},
  {id:"history",label:"Historikk",icon:"📜"},
];

const ReviewModal=({task,onClose,config,goals,role,updateTask,addComment,notify,getSubtasks,subProgress,addSubtask,addSubtasksBatch,setTasks,tasks,team,sprints,sprintMap})=>{
  const C=useTheme();
  const composite=makeComposite(config);
  const[f,sF]=useState({...task});
  const[cmt,setCmt]=useState("");
  const[subForm,setSubForm]=useState({title:"",size:3,sprintAssign:""});
  const[activeTab,setActiveTab]=useState("scoring");
  const[aiLoading,setAiLoading]=useState(false);
  const[aiError,setAiError]=useState(null);
  const tog=id=>sF(p=>({...p,tracks:(p.tracks||[]).includes(id)?(p.tracks||[]).filter(x=>x!==id):[...(p.tracks||[]),id]}));
  /* B.4: dirty-tracking for unsaved changes warning */
  const dirty=JSON.stringify(f)!==JSON.stringify(task)||cmt.trim().length>0;
  const handleClose=()=>{if(dirty){if(window.confirm("Du har ulagrede endringer. Vil du forkaste dem?"))onClose();}else onClose();};

  const saveDraft=()=>{updateTask(task.id,f);if(cmt.trim())addComment(task.id,cmt.trim());setCmt("");notify(`"${f.title}" lagret som utkast.`);};
  const save=()=>{const upd={...f,reviewed:true,status:f.status==="submitted"?((f.tracks||[]).length?"assessed":"under-review"):f.status};updateTask(task.id,upd);if(cmt.trim())addComment(task.id,cmt.trim());onClose();notify(`"${f.title}" vurdert.`);};

  // A5: valid next statuses
  const allowedStatuses=STATUS_TRANSITIONS[task.status]||[];

  // C4: ROI
  const cost=parseFloat(f.estimatedCost)||0;
  const saving=parseFloat(f.estimatedAnnualSaving)||0;
  const payback=cost>0&&saving>0?Math.round(cost/saving*10)/10:null;

  return <div role="dialog" aria-modal="true" aria-label={`Vurdering: ${task.title}`} onKeyDown={e=>{if(e.key==="Escape")handleClose();}} style={{position:"fixed",inset:0,zIndex:100,display:"flex",alignItems:"flex-start",justifyContent:"center",background:"rgba(0,0,0,.45)",padding:"3vh 10px",overflow:"auto"}} onClick={handleClose}><div className="hemit-modal-inner" onClick={e=>e.stopPropagation()} style={{background:C.surface,borderRadius:14,maxWidth:880,width:"100%",minHeight:600,maxHeight:"94vh",overflow:"auto",padding:22,color:C.text}}>
    {/* Header */}
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><div><h2 style={{fontSize:17,fontWeight:700,color:C.primary,margin:0}}>{task.id}: {task.title}</h2><p style={{fontSize:11,color:C.textMuted,margin:"2px 0"}}>{task.submitterName} · {task.processOwner&&`${task.processOwner} · `}{task.date}</p></div><Btn variant="ghost" onClick={handleClose} style={{color:C.textSec}}>✕</Btn></div>
    <Card style={{marginBottom:10,borderLeft:`4px solid ${C.accent}`,background:C.surfaceAlt,padding:12}}><p style={{fontSize:12,color:C.textSec,margin:0}}>{task.desc||"—"}</p>
      <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:4}}>
        {task.enterprise&&<Badge color={C.primary} bg={C.primary+"0C"} style={{fontSize:9}}>🏥 {ENTERPRISES.find(e=>e.id===task.enterprise)?.label||task.enterprise}</Badge>}
        {task.solutionCategory&&task.solutionCategory!=="unknown"&&<Badge color={C.accent} bg={C.accent+"0C"} style={{fontSize:9}}>🔧 {SOLUTION_CATEGORIES.find(c=>c.id===task.solutionCategory)?.label||task.solutionCategory}</Badge>}
        {task.eqsRef&&<Badge color="#0891B2" bg="#E0F7FA" style={{fontSize:9}}>📋 {task.eqsRef}</Badge>}
        {task.serviceNowRef&&<Badge color="#7C3AED" bg="#EDE9FE" style={{fontSize:9}}>🎫 {task.serviceNowRef}</Badge>}
        {task.pilotUnit&&<Badge color={C.warning} bg={C.warningBg} style={{fontSize:9}}>🧪 Pilot: {task.pilotUnit}</Badge>}
        {(task.goals||[]).map(gid=>{const g=goals.find(x=>x.id===gid);return g?<Badge key={gid} color={C.primary} bg={C.primary+"0C"} style={{fontSize:9}}>🎯 {g.title}</Badge>:null;})}
        {task.benefitOwner&&<Badge color={C.accent} bg={C.accent+"0C"} style={{fontSize:9}}>👤 Nytteeier: {task.benefitOwner}</Badge>}
        {task.personalData==="yes"&&<Badge color={C.danger} bg={C.dangerBg} style={{fontSize:9}}>🔒 DPIA</Badge>}
        {task.personalData==="unknown"&&<Badge color={C.warning} bg={C.warningBg} style={{fontSize:9}}>❓ Persondata?</Badge>}
      </div>
    </Card>

    {/* Innmeldingsdetaljer — alle felt fra skjemaet */}
    <details style={{marginBottom:10}}><summary style={{fontSize:11,fontWeight:700,color:C.accent,cursor:"pointer",padding:"4px 0"}}>📋 Innmeldingsdetaljer</summary>
      <Card style={{marginTop:4,background:C.surfaceAlt,padding:12}}>
        {/* Personopplysninger */}
        {task.personalData&&<div style={{marginBottom:10}}>
          <div style={{fontSize:10,fontWeight:700,color:C.primary,marginBottom:4,textTransform:"uppercase"}}>Personopplysninger</div>
          <div style={{fontSize:11,color:C.textSec}}><span style={{fontWeight:600,color:C.textMuted}}>Behandles personopplysninger:</span> {task.personalData==="yes"?"Ja":task.personalData==="no"?"Nei":"Vet ikke"}</div>
          {task.personalData==="yes"&&<div style={{marginTop:4,padding:"4px 8px",background:C.dangerBg,borderRadius:6,fontSize:10,color:C.danger}}>🔒 DPIA påkrevd{config?.dpiaLink&&<> – <a href={config.dpiaLink} target="_blank" rel="noopener" style={{color:C.danger}}>Mal</a></>}</div>}
        </div>}
        {/* Nå-situasjon */}
        {(task.manualTask||task.taskPerformer||task.frequency||task.volumePerTime||task.annualTimeSaving||task.involvedSystems)&&<div style={{marginBottom:10}}>
          <div style={{fontSize:10,fontWeight:700,color:C.primary,marginBottom:4,textTransform:"uppercase"}}>Nå-situasjon</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4,fontSize:11,color:C.textSec}}>
            {task.manualTask&&<div><span style={{fontWeight:600,color:C.textMuted}}>Manuell oppgave:</span> {task.manualTask==="yes"?"Ja":"Nei"}</div>}
            {task.taskPerformer&&<div><span style={{fontWeight:600,color:C.textMuted}}>Utfører:</span> {task.taskPerformer}</div>}
            {task.frequency&&<div><span style={{fontWeight:600,color:C.textMuted}}>Frekvens:</span> {task.frequency}</div>}
            {task.volumePerTime&&<div><span style={{fontWeight:600,color:C.textMuted}}>Volum:</span> {task.volumePerTime}</div>}
            {task.annualTimeSaving&&<div><span style={{fontWeight:600,color:C.textMuted}}>Forventet tidsbesparelse:</span> {task.annualTimeSaving} t/år</div>}
            {task.involvedSystems&&<div style={{gridColumn:"1/-1"}}><span style={{fontWeight:600,color:C.textMuted}}>Involerte systemer:</span> {task.involvedSystems}</div>}
          </div>
        </div>}
        {/* Behov og bakgrunn */}
        {(task.needSummary||task.background)&&<div style={{marginBottom:10}}>
          <div style={{fontSize:10,fontWeight:700,color:C.primary,marginBottom:4,textTransform:"uppercase"}}>Behov og bakgrunn</div>
          {task.needSummary&&<div style={{fontSize:11,color:C.textSec,marginBottom:4}}><span style={{fontWeight:600,color:C.textMuted}}>Behov:</span> {task.needSummary}</div>}
          {task.background&&<div style={{fontSize:11,color:C.textSec}}><span style={{fontWeight:600,color:C.textMuted}}>Bakgrunn:</span> {task.background}</div>}
        </div>}
        {/* Gevinster */}
        {(task.qualitativeBenefits||task.quantitativeBenefits)&&<div style={{marginBottom:10}}>
          <div style={{fontSize:10,fontWeight:700,color:C.primary,marginBottom:4,textTransform:"uppercase"}}>Gevinster (innmeldt)</div>
          {task.qualitativeBenefits&&<div style={{fontSize:11,color:C.textSec,marginBottom:4}}><span style={{fontWeight:600,color:C.textMuted}}>Kvalitative:</span> {task.qualitativeBenefits}</div>}
          {task.quantitativeBenefits&&<div style={{fontSize:11,color:C.textSec}}><span style={{fontWeight:600,color:C.textMuted}}>Kvantitative:</span> {task.quantitativeBenefits}</div>}
        </div>}
        {/* Alternativer og annet */}
        {(task.alternativeSolutions||task.otherInfo)&&<div>
          <div style={{fontSize:10,fontWeight:700,color:C.primary,marginBottom:4,textTransform:"uppercase"}}>Tilleggsinformasjon</div>
          {task.alternativeSolutions&&<div style={{fontSize:11,color:C.textSec,marginBottom:4}}><span style={{fontWeight:600,color:C.textMuted}}>Alternative løsninger:</span> {task.alternativeSolutions}</div>}
          {task.otherInfo&&<div style={{fontSize:11,color:C.textSec}}><span style={{fontWeight:600,color:C.textMuted}}>Annet:</span> {task.otherInfo}</div>}
        </div>}
        {/* Scoring-begrunnelser */}
        {SCORING_CRITERIA.some(c=>task[c.key+"Reason"])&&<div style={{marginTop:10}}>
          <div style={{fontSize:10,fontWeight:700,color:C.primary,marginBottom:4,textTransform:"uppercase"}}>Scoring-begrunnelser (innmeldt)</div>
          {SCORING_CRITERIA.filter(c=>task[c.key+"Reason"]).map(c=><div key={c.key} style={{fontSize:11,color:C.textSec,marginBottom:3}}><span style={{fontWeight:600,color:C.textMuted}}>{c.label} ({task[c.key]||0}/10):</span> {task[c.key+"Reason"]}</div>)}
        </div>}
      </Card>
    </details>

    {/* ═══ Forenklet visning for deloppgaver ═══ */}
    {task.parentId&&<div>
      <div style={{marginBottom:10,padding:"6px 10px",background:C.accent+"08",borderRadius:7,border:`1px solid ${C.accent}20`}}><span style={{fontSize:11,color:C.accent}}>🔗 Deloppgave av <strong>{task.parentId}</strong>: {tasks.find(t=>t.id===task.parentId)?.title||"—"}</span></div>

      <SH>Løype(r)</SH>
      <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:14}}>{TRACKS.map(tr=>{const sel=(f.tracks||[]).includes(tr.id);return <button key={tr.id} type="button" onClick={()=>tog(tr.id)} style={{padding:"7px 14px",borderRadius:9,border:`2px solid ${sel?tr.color:C.border}`,background:sel?tr.color+"0C":"transparent",color:sel?tr.color:C.textMuted,fontWeight:600,fontSize:11,cursor:"pointer"}}>{tr.icon} {tr.label}{sel&&" ✓"}</button>;})}</div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
        <SF label="Prioritet" id="r-prio" value={f.priority||"medium"} onChange={e=>sF(p=>({...p,priority:e.target.value}))}>{PRIORITIES.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</SF>
        <SF label="Status" id="r-status" value={f.status} onChange={e=>sF(p=>({...p,status:e.target.value}))}>{STATUSES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</SF>
        <TF label="Faktisk tidsbruk (t)" id="r-hrs" type="number" value={f.actualHours||0} onChange={e=>sF(p=>({...p,actualHours:parseFloat(e.target.value)||0}))}/>
      </div>
      <div style={{marginTop:8}}><TF label="Kommentar" id="r-cmt" value={cmt} onChange={e=>setCmt(e.target.value)} placeholder="Begrunnelse..."/></div>
      {(task.attachments||[]).length>0&&<div style={{marginTop:10}}><AttachArea attachments={task.attachments} readOnly/></div>}
      {/* Avhengigheter */}
      <div style={{marginTop:10}}>
        <label style={{fontSize:11,fontWeight:600,color:C.textSec}}>🔗 Blokkert av (avhengigheter)</label>
        <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:4}}>
          {(f.blockedBy||[]).map(depId=>{const dep=tasks.find(t=>t.id===depId);const done=dep&&(dep.status==="done"||dep.status==="archived");return <span key={depId} style={{display:"inline-flex",alignItems:"center",gap:3,padding:"3px 8px",borderRadius:6,fontSize:10,fontWeight:600,border:`1px solid ${done?C.success+"40":C.danger+"40"}`,background:done?C.successBg:C.dangerBg,color:done?C.success:C.danger}}>{depId}: {dep?.title||"?"}{done?" ✓":" ⏳"}<button type="button" onClick={()=>sF(p=>({...p,blockedBy:(p.blockedBy||[]).filter(x=>x!==depId)}))} style={{background:"none",border:"none",cursor:"pointer",fontSize:10,color:C.danger,padding:0,marginLeft:2}}>✕</button></span>;})}
        </div>
        <div style={{display:"flex",gap:4,marginTop:4}}>
          <select onChange={e=>{const v=e.target.value;if(v&&!(f.blockedBy||[]).includes(v)&&v!==task.id)sF(p=>({...p,blockedBy:[...(p.blockedBy||[]),v]}));e.target.value="";}} style={{fontSize:10,padding:"3px 6px",borderRadius:4,border:`1px solid ${C.border}`,background:C.surface,color:C.text,flex:1}}>
            <option value="">+ Legg til avhengighet...</option>
            {tasks.filter(t=>t.id!==task.id&&!(f.blockedBy||[]).includes(t.id)).map(t=><option key={t.id} value={t.id}>{t.id}: {t.title}</option>)}
          </select>
        </div>
      </div>
      <div style={{marginTop:14}}>
        <CommentsPanel task={task} role={role} onAdd={txt=>addComment(task.id,txt)}/>
        <HistoryPanel task={task}/>
      </div>
    </div>}

    {/* ═══ Fane-visning for hovedoppgaver ═══ */}
    {!task.parentId&&<>
    {/* Tab bar (B1) */}
    <div style={{display:"flex",gap:1,background:C.surfaceAlt,borderRadius:8,padding:3,marginBottom:14}}>{TABS.map(t=><button key={t.id} onClick={()=>setActiveTab(t.id)} style={{flex:1,padding:"6px 8px",borderRadius:6,border:"none",cursor:"pointer",fontSize:10,fontWeight:600,background:activeTab===t.id?C.surface:"transparent",color:activeTab===t.id?C.primary:C.textMuted,boxShadow:activeTab===t.id?"0 1px 3px rgba(0,0,0,.08)":"none"}}>{t.icon} {t.label}</button>)}</div>

    {/* ═══ Scoring Tab ═══ */}
    {activeTab==="scoring"&&<div>
      <SH>Prioriteringskriterier</SH>
      {SCORING_CRITERIA.map(c=><KriterieScoring key={c.key} label={c.label} weight={c.weight} value={f[c.key]||0} onChange={e=>sF(p=>({...p,[c.key]:parseInt(e.target.value)}))} examples={SCORE_EXAMPLES[c.key]||[]} reason={f[c.key+"Reason"]||""} onReasonChange={e=>sF(p=>({...p,[c.key+"Reason"]:e.target.value}))}/>)}
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:12,background:C.primary+"08",borderRadius:8,marginTop:6}}><span style={{fontSize:10,color:C.textMuted,marginRight:8}}>VEKTET SCORE</span><span style={{fontSize:28,fontWeight:800,color:C.primary}}>{calcWeightedScore(f)}</span><span style={{fontSize:10,color:C.textMuted,marginLeft:4}}>/ 10</span></div>

      <SH>Løype(r)</SH>
      <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:14}}>{TRACKS.map(tr=>{const sel=(f.tracks||[]).includes(tr.id);return <button key={tr.id} type="button" onClick={()=>tog(tr.id)} style={{padding:"7px 14px",borderRadius:9,border:`2px solid ${sel?tr.color:C.border}`,background:sel?tr.color+"0C":"transparent",color:sel?tr.color:C.textMuted,fontWeight:600,fontSize:11,cursor:"pointer"}}>{tr.icon} {tr.label}{sel&&" ✓"}</button>;})}</div>

      {/* Prioritet, Status, Timer, Kommentar */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginTop:14}}>
        <SF label="Prioritet" id="r-prio" value={f.priority||"medium"} onChange={e=>sF(p=>({...p,priority:e.target.value}))}>{PRIORITIES.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</SF>
        <SF label="Status" id="r-status" value={f.status} onChange={e=>sF(p=>({...p,status:e.target.value}))}>{STATUSES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</SF>
        <TF label="Faktisk tidsbruk (t)" id="r-hrs" type="number" value={f.actualHours||0} onChange={e=>sF(p=>({...p,actualHours:parseFloat(e.target.value)||0}))}/>
      </div>
      <div style={{marginTop:8}}><TF label="Kommentar" id="r-cmt" value={cmt} onChange={e=>setCmt(e.target.value)} placeholder="Begrunnelse..."/></div>
      {(task.attachments||[]).length>0&&<div style={{marginTop:10}}><AttachArea attachments={task.attachments} readOnly/></div>}
      {/* A3: Avhengigheter */}
      <div style={{marginTop:10}}>
        <label style={{fontSize:11,fontWeight:600,color:C.textSec}}>🔗 Blokkert av (avhengigheter)</label>
        <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:4}}>
          {(f.blockedBy||[]).map(depId=>{const dep=tasks.find(t=>t.id===depId);const done=dep&&(dep.status==="done"||dep.status==="archived");return <span key={depId} style={{display:"inline-flex",alignItems:"center",gap:3,padding:"3px 8px",borderRadius:6,fontSize:10,fontWeight:600,border:`1px solid ${done?C.success+"40":C.danger+"40"}`,background:done?C.successBg:C.dangerBg,color:done?C.success:C.danger}}>{depId}: {dep?.title||"?"}{done?" ✓":" ⏳"}<button type="button" onClick={()=>sF(p=>({...p,blockedBy:(p.blockedBy||[]).filter(x=>x!==depId)}))} style={{background:"none",border:"none",cursor:"pointer",fontSize:10,color:C.danger,padding:0,marginLeft:2}}>✕</button></span>;})}
        </div>
        <div style={{display:"flex",gap:4,marginTop:4}}>
          <select onChange={e=>{const v=e.target.value;if(v&&!(f.blockedBy||[]).includes(v)&&v!==task.id)sF(p=>({...p,blockedBy:[...(p.blockedBy||[]),v]}));e.target.value="";}} style={{fontSize:10,padding:"3px 6px",borderRadius:4,border:`1px solid ${C.border}`,background:C.surface,color:C.text,flex:1}}>
            <option value="">+ Legg til avhengighet...</option>
            {tasks.filter(t=>t.id!==task.id&&!t.parentId&&!(f.blockedBy||[]).includes(t.id)).map(t=><option key={t.id} value={t.id}>{t.id}: {t.title}</option>)}
          </select>
        </div>
      </div>
    </div>}

    {/* ═══ Benefit Tab (C1 + C4 + C5 + A.11 + A.1 + A.12) ═══ */}
    {activeTab==="benefit"&&(()=>{
      const unitLabel=f.benefitUnit?` (${(BENEFIT_UNITS.find(u=>u.id===f.benefitUnit)||{}).label||""})`:"";
      const realizationPct=calcRealizationPct(f.benefitBaseline,f.benefitTarget,f.benefitActual);
      return <div>
      <GoalPicker goals={goals} selected={f.goals||[]} onChange={g=>sF(p=>({...p,goals:g}))}/>
      {/* C.2: Nytteeier */}
      <div style={{marginTop:SP.sm}}><TF label="Nytteeier" id="r-bowner" value={f.benefitOwner||""} onChange={e=>sF(p=>({...p,benefitOwner:e.target.value}))} placeholder="Hvem er ansvarlig for nytterealisering?"/></div>
      <div style={{marginTop:SP.sm}}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <SH>📈 Forventet nytte</SH>
        <Btn variant="secondary" disabled={aiLoading} onClick={async()=>{
          setAiLoading(true);setAiError(null);
          try{
            const r=await suggestBenefitEstimate(config,f);
            sF(p=>({...p,
              expectedBenefit:r.expectedBenefit||p.expectedBenefit,
              benefitCategory:r.benefitCategory||p.benefitCategory,
              benefitUnit:r.benefitUnit||p.benefitUnit,
              benefitClassification:r.benefitClassification||p.benefitClassification,
              benefitMetric:r.benefitMetric||p.benefitMetric,
              benefitBaseline:r.benefitBaseline||p.benefitBaseline,
              benefitTarget:r.benefitTarget||p.benefitTarget,
              estimatedAnnualSaving:r.estimatedAnnualSaving||p.estimatedAnnualSaving,
            }));
            notify("Nytteforslag fylt ut av KI.");
          }catch(e){setAiError(e.message);}finally{setAiLoading(false);}
        }} style={{fontSize:10,padding:"4px 10px"}}>{aiLoading?"⏳ Vurderer...":"✨ Foreslå nytte"}</Btn>
      </div>
      {aiError&&<div style={{padding:"6px 10px",background:C.dangerBg,borderRadius:7,marginBottom:6,fontSize:11,color:C.danger,display:"flex",alignItems:"center",gap:6}}>⚠️ {aiError}<button onClick={()=>setAiError(null)} style={{background:"none",border:"none",cursor:"pointer",fontSize:10,color:C.danger,padding:0}}>✕</button></div>}
      <TF label="Forventet nytteeffekt" id="r-ben" value={f.expectedBenefit||""} onChange={e=>sF(p=>({...p,expectedBenefit:e.target.value}))} placeholder="Beskrivelse av forventet gevinst..."/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:8,marginBottom:8}}>
        <SF label="Nyttekategori" id="r-bcat" value={f.benefitCategory||""} onChange={e=>sF(p=>({...p,benefitCategory:e.target.value}))}><option value="">— Velg —</option>{BENEFIT_CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}</SF>
        <SF label="Måleenhet" id="r-bunit" value={f.benefitUnit||""} onChange={e=>sF(p=>({...p,benefitUnit:e.target.value}))}><option value="">— Velg —</option>{BENEFIT_UNITS.map(u=><option key={u.id} value={u.id}>{u.label}</option>)}</SF>
      </div>
      {/* C.1: Klassifisering */}
      <div style={{marginBottom:8}}>
        <div><label style={{fontSize:11,fontWeight:600,color:C.textSec,display:"block",marginBottom:3}}>Klassifisering</label><div style={{display:"flex",gap:SP.md}}>{BENEFIT_CLASSIFICATIONS.map(bc=><label key={bc.id} style={{display:"flex",alignItems:"center",gap:4,fontSize:12,cursor:"pointer",color:f.benefitClassification===bc.id?C.primary:C.textMuted,fontWeight:f.benefitClassification===bc.id?600:400}}><input type="radio" name="benefitClassification" value={bc.id} checked={f.benefitClassification===bc.id} onChange={e=>sF(p=>({...p,benefitClassification:e.target.value}))}/>{bc.label}</label>)}</div></div>
      </div>
      <TF label="Metrikk / KPI" id="r-metric" value={f.benefitMetric||""} onChange={e=>sF(p=>({...p,benefitMetric:e.target.value}))} placeholder="f.eks. Behandlingstid per faktura"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:8}}>
        <TF label={`Baseline${unitLabel}`} id="r-base" type="number" value={f.benefitBaseline||""} onChange={e=>sF(p=>({...p,benefitBaseline:e.target.value}))} placeholder="f.eks. 12"/>
        <TF label={`Målverdi${unitLabel}`} id="r-target" type="number" value={f.benefitTarget||""} onChange={e=>sF(p=>({...p,benefitTarget:e.target.value}))} placeholder="f.eks. 5"/>
        <TF label={`Faktisk${unitLabel}`} id="r-actual" type="number" value={f.benefitActual||""} onChange={e=>sF(p=>({...p,benefitActual:e.target.value}))} placeholder="Etter impl."/>
      </div>
      {realizationPct!==null&&<div style={{padding:8,borderRadius:6,marginTop:8,background:realizationPct>=100?C.success+"15":realizationPct>=50?C.warning+"15":C.danger+"15",textAlign:"center",fontSize:11,fontWeight:600,color:realizationPct>=100?C.success:realizationPct>=50?C.warning:C.danger}}>
        Realiseringsgrad: {realizationPct}%
        <div style={{height:6,borderRadius:3,background:C.surfaceAlt,marginTop:4}}><div style={{height:6,borderRadius:3,width:`${Math.min(Math.max(realizationPct,0),100)}%`,background:realizationPct>=100?C.success:realizationPct>=50?C.warning:C.danger}}/></div>
      </div>}
      <div style={{marginTop:8}}><TF label="Nyttevurderings-dato" id="r-bdate" type="date" value={f.benefitReviewDate||""} onChange={e=>sF(p=>({...p,benefitReviewDate:e.target.value}))}/></div>

      {/* C.3: Nytterealisieringsplan */}
      <SH>📋 Nytterealisieringsplan</SH>
      {(f.benefitPlan||[]).length>0&&<div style={{position:"relative",paddingLeft:20,borderLeft:`2px solid ${C.primaryLight}`,marginBottom:SP.sm}}>
        {(f.benefitPlan||[]).map((pt,idx)=><div key={idx} style={{marginBottom:SP.sm,padding:`${SP.sm}px ${SP.md}px`,background:C.surfaceAlt,borderRadius:8,position:"relative"}}>
          <div style={{position:"absolute",left:-26,top:14,width:10,height:10,borderRadius:"50%",background:pt.measured?C.success:C.border,border:`2px solid ${C.surface}`}}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,fontSize:11}}>
            <input type="date" value={pt.date||""} onChange={e=>{const bp=[...(f.benefitPlan||[])];bp[idx]={...bp[idx],date:e.target.value};sF(p=>({...p,benefitPlan:bp}));}} style={{fontSize:10,padding:"3px 6px",borderRadius:4,border:`1px solid ${C.border}`,background:C.surface,color:C.text}}/>
            <input value={pt.responsible||""} onChange={e=>{const bp=[...(f.benefitPlan||[])];bp[idx]={...bp[idx],responsible:e.target.value};sF(p=>({...p,benefitPlan:bp}));}} placeholder="Ansvarlig" style={{fontSize:10,padding:"3px 6px",borderRadius:4,border:`1px solid ${C.border}`,background:C.surface,color:C.text}}/>
            <input value={pt.method||""} onChange={e=>{const bp=[...(f.benefitPlan||[])];bp[idx]={...bp[idx],method:e.target.value};sF(p=>({...p,benefitPlan:bp}));}} placeholder="Målemetode" style={{fontSize:10,padding:"3px 6px",borderRadius:4,border:`1px solid ${C.border}`,background:C.surface,color:C.text}}/>
          </div>
          <input value={pt.milestone||""} onChange={e=>{const bp=[...(f.benefitPlan||[])];bp[idx]={...bp[idx],milestone:e.target.value};sF(p=>({...p,benefitPlan:bp}));}} placeholder="Milepæl" style={{width:"100%",marginTop:4,fontSize:10,padding:"3px 6px",borderRadius:4,border:`1px solid ${C.border}`,background:C.surface,color:C.text,boxSizing:"border-box"}}/>
          <div style={{display:"flex",gap:SP.sm,marginTop:4,alignItems:"center"}}>
            <label style={{fontSize:10,display:"flex",alignItems:"center",gap:3,cursor:"pointer"}}><input type="checkbox" checked={!!pt.measured} onChange={e=>{const bp=[...(f.benefitPlan||[])];bp[idx]={...bp[idx],measured:e.target.checked};sF(p=>({...p,benefitPlan:bp}));}}/> Målt</label>
            {pt.measured&&<input type="number" value={pt.value||""} onChange={e=>{const bp=[...(f.benefitPlan||[])];bp[idx]={...bp[idx],value:e.target.value};sF(p=>({...p,benefitPlan:bp}));}} placeholder="Verdi" style={{width:80,fontSize:10,padding:"3px 6px",borderRadius:4,border:`1px solid ${C.border}`,background:C.surface,color:C.text}}/>}
            <button onClick={()=>{const bp=(f.benefitPlan||[]).filter((_,i)=>i!==idx);sF(p=>({...p,benefitPlan:bp}));}} style={{marginLeft:"auto",fontSize:10,color:C.danger,background:"none",border:"none",cursor:"pointer",padding:0}}>Slett</button>
          </div>
        </div>)}
      </div>}
      <div style={{display:"flex",gap:SP.xs,flexWrap:"wrap",marginBottom:SP.md}}>
        {[3,6,12].map(mo=><Btn key={mo} variant="secondary" onClick={()=>{const d=new Date();d.setMonth(d.getMonth()+mo);sF(p=>({...p,benefitPlan:[...(p.benefitPlan||[]),{date:d.toISOString().split("T")[0],responsible:f.benefitOwner||"",method:"",milestone:`${mo}-mndrs måling`,measured:false,value:""}]}));}} style={{fontSize:10,padding:"3px 8px"}}>+{mo} mnd</Btn>)}
        <Btn variant="secondary" onClick={()=>sF(p=>({...p,benefitPlan:[...(p.benefitPlan||[]),{date:"",responsible:"",method:"",milestone:"",measured:false,value:""}]}))} style={{fontSize:10,padding:"3px 8px"}}>+ Egendefinert</Btn>
      </div>

      <SH>💰 Kostnad / ROI</SH>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
        <TF label="Estimert kostnad (kr)" id="r-cost" type="number" value={f.estimatedCost||""} onChange={e=>sF(p=>({...p,estimatedCost:e.target.value}))} placeholder="0"/>
        <TF label="Estimert årlig besparelse (kr)" id="r-save" type="number" value={f.estimatedAnnualSaving||""} onChange={e=>sF(p=>({...p,estimatedAnnualSaving:e.target.value}))} placeholder="0"/>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:payback!==null?(payback<=1?C.successBg:payback<=3?C.warningBg:C.dangerBg):C.surfaceAlt,borderRadius:8,padding:8}}>
          <span style={{fontSize:9,color:C.textMuted}}>Tilbakebetalingstid</span>
          <span style={{fontSize:20,fontWeight:800,color:payback!==null?(payback<=1?C.success:payback<=3?C.warning:C.danger):C.textMuted}}>{payback!==null?`${payback} år`:"—"}</span>
        </div>
      </div>

      {/* PIR – Strukturert post-implementasjonsgjennomgang (C.4 utvidet) */}
      {f.status==="done"&&<div style={{marginTop:14,padding:14,background:C.purple+"08",borderRadius:8,border:`1px solid ${C.purple}20`}}>
        <h4 style={{margin:0,fontSize:13,color:C.purple}}>🔍 Post-implementasjonsgjennomgang (PIR)</h4>
        <p style={{fontSize:11,color:C.textSec,margin:"6px 0 10px"}}>Vurder om forventet nytte er realisert. Fyll ut faktisk verdi over og vurder hvert punkt under.</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
          <Sl label="Nytterealisering" id="pir-realization" value={f.pirRealization||3} onChange={e=>sF(p=>({...p,pirRealization:+e.target.value}))}/>
          <Sl label="Interessenttilfredshet" id="pir-satisfaction" value={f.pirSatisfaction||3} onChange={e=>sF(p=>({...p,pirSatisfaction:+e.target.value}))}/>
          <Sl label="Prosessforbedring" id="pir-process" value={f.pirProcess||3} onChange={e=>sF(p=>({...p,pirProcess:+e.target.value}))}/>
          <Sl label="Teknisk kvalitet" id="pir-technical" value={f.pirTechnical||3} onChange={e=>sF(p=>({...p,pirTechnical:+e.target.value}))}/>
          <Sl label="Interessentvurdering" id="pir-stakeholder" value={f.pirStakeholderScore||3} onChange={e=>sF(p=>({...p,pirStakeholderScore:+e.target.value}))}/>
        </div>
        {(()=>{const avg=Math.round(((f.pirRealization||3)+(f.pirSatisfaction||3)+(f.pirProcess||3)+(f.pirTechnical||3)+(f.pirStakeholderScore||3))/5*10)/10;return <div style={{textAlign:"center",fontSize:12,fontWeight:700,marginBottom:8,color:avg>=4?C.success:avg>=2.5?C.warning:C.danger}}>PIR-score: {avg}/5</div>;})()}

        {/* C.4: Uventede gevinster/ulemper */}
        <TF label="Uventede gevinster eller ulemper" id="pir-unexpected" value={f.pirUnexpectedBenefits||""} multiline onChange={e=>sF(p=>({...p,pirUnexpectedBenefits:e.target.value}))} placeholder="Ble det oppdaget fordeler eller ulemper som ikke var planlagt?"/>

        {/* C.4: Kategoriserte læringspunkter */}
        <div style={{marginTop:SP.sm}}><label style={{fontSize:11,fontWeight:600,color:C.textSec}}>Læringspunkter per kategori</label>
        {PIR_LESSON_CATEGORIES.map(cat=>{const existing=(f.pirLessonCategories||[]).find(l=>l.category===cat.id);return <div key={cat.id} style={{marginTop:4}}><textarea value={existing?.text||""} onChange={e=>{const cats=(f.pirLessonCategories||[]).filter(l=>l.category!==cat.id);if(e.target.value)cats.push({category:cat.id,text:e.target.value});sF(p=>({...p,pirLessonCategories:cats}));}} placeholder={`${cat.label}...`} rows={2} style={{width:"100%",fontSize:11,padding:"4px 8px",borderRadius:6,border:`1px solid ${C.border}`,background:C.surface,color:C.text,fontFamily:"inherit",boxSizing:"border-box",resize:"vertical"}}/></div>;})}
        {/* Bakoverkompatibel: vis eldre pirLessons hvis ingen kategoriserte */}
        {f.pirLessons&&!(f.pirLessonCategories||[]).length&&<div style={{marginTop:SP.xs}}><TF label="Læringspunkter (tidligere)" id="pir-lessons-legacy" value={f.pirLessons||""} multiline onChange={e=>sF(p=>({...p,pirLessons:e.target.value}))}/></div>}
        </div>

        {/* C.4: Oppfølgingstiltak */}
        <div style={{marginTop:SP.md}}><label style={{fontSize:11,fontWeight:600,color:C.textSec}}>Oppfølgingstiltak</label>
        {(f.pirActionItems||[]).map((item,idx)=><div key={idx} style={{display:"grid",gridTemplateColumns:"3fr 1fr 1fr auto",gap:6,marginTop:4,alignItems:"center"}}>
          <input value={item.action||""} onChange={e=>{const a=[...(f.pirActionItems||[])];a[idx]={...a[idx],action:e.target.value};sF(p=>({...p,pirActionItems:a}));}} placeholder="Tiltak" style={{fontSize:10,padding:"4px 6px",borderRadius:4,border:`1px solid ${C.border}`,background:C.surface,color:C.text}}/>
          <input value={item.responsible||""} onChange={e=>{const a=[...(f.pirActionItems||[])];a[idx]={...a[idx],responsible:e.target.value};sF(p=>({...p,pirActionItems:a}));}} placeholder="Ansvarlig" style={{fontSize:10,padding:"4px 6px",borderRadius:4,border:`1px solid ${C.border}`,background:C.surface,color:C.text}}/>
          <input type="date" value={item.deadline||""} onChange={e=>{const a=[...(f.pirActionItems||[])];a[idx]={...a[idx],deadline:e.target.value};sF(p=>({...p,pirActionItems:a}));}} style={{fontSize:10,padding:"4px 6px",borderRadius:4,border:`1px solid ${C.border}`,background:C.surface,color:C.text}}/>
          <div style={{display:"flex",gap:4,alignItems:"center"}}><input type="checkbox" checked={!!item.done} onChange={e=>{const a=[...(f.pirActionItems||[])];a[idx]={...a[idx],done:e.target.checked};sF(p=>({...p,pirActionItems:a}));}}/><button onClick={()=>{const a=(f.pirActionItems||[]).filter((_,i)=>i!==idx);sF(p=>({...p,pirActionItems:a}));}} style={{fontSize:10,color:C.danger,background:"none",border:"none",cursor:"pointer",padding:0}}>✕</button></div>
        </div>)}
        <Btn variant="secondary" onClick={()=>sF(p=>({...p,pirActionItems:[...(p.pirActionItems||[]),{action:"",responsible:"",deadline:"",done:false}]}))} style={{fontSize:10,padding:"3px 8px",marginTop:SP.xs}}>+ Nytt tiltak</Btn>
        </div>

        {/* C.4: PIR-eksport */}
        <div style={{display:"flex",gap:6,marginTop:SP.md,flexWrap:"wrap",alignItems:"center"}}>
          <Btn onClick={()=>{const blob=new Blob([buildPirReport(f)],{type:"text/plain;charset=utf-8;"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`PIR-${f.id||"rapport"}-${td()}.txt`;a.click();URL.revokeObjectURL(a.href);}} style={{fontSize:10,padding:"4px 10px",background:C.surfaceAlt,color:C.textSec,border:`1px solid ${C.border}`}}>📄 Eksporter PIR-rapport</Btn>
        </div>

        <div style={{display:"flex",gap:6,marginTop:SP.md,flexWrap:"wrap"}}>
          <Btn onClick={()=>sF(p=>({...p,status:"archived",pirOutcome:"realized"}))} style={{fontSize:11,padding:"6px 14px",background:C.success+"15",color:C.success,border:`1px solid ${C.success}40`}}>✅ Nytte realisert – arkiver</Btn>
          <Btn onClick={()=>sF(p=>({...p,pirOutcome:"partial"}))} style={{fontSize:11,padding:"6px 14px",background:C.warning+"15",color:C.warning,border:`1px solid ${C.warning}40`}}>⚠️ Delvis realisert – oppfølging</Btn>
          <Btn onClick={()=>sF(p=>({...p,status:"in-progress",pirOutcome:"not-realized"}))} style={{fontSize:11,padding:"6px 14px",background:C.danger+"15",color:C.danger,border:`1px solid ${C.danger}40`}}>❌ Ikke realisert – gjenåpne</Btn>
        </div>
        {f.pirOutcome==="partial"&&<div style={{marginTop:8}}>
          <TF label="Oppfølgingsplan" id="pir-followup" value={f.pirFollowUp||""} multiline onChange={e=>sF(p=>({...p,pirFollowUp:e.target.value}))} placeholder="Beskriv tiltak for å realisere gjenværende nytte..."/>
          <Btn onClick={()=>sF(p=>({...p,status:"archived"}))} style={{fontSize:11,padding:"6px 12px",marginTop:6,background:C.accent+"15",color:C.accent,border:`1px solid ${C.accent}40`}}>📋 Arkiver med oppfølgingsplan</Btn>
        </div>}
      </div>}
    </div>;})()}

    {/* ═══ Subtasks Tab ═══ */}
    {activeTab==="subtasks"&&!task.parentId&&<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><h4 style={{fontSize:13,fontWeight:700,color:C.primary,margin:0}}>🧩 Deloppgaver</h4>{(()=>{const sp=subProgress(task.id);return sp?<Badge color={sp.pct===100?C.success:C.accent} bg={sp.pct===100?C.successBg:C.accent+"10"} style={{fontSize:9}}>{sp.done}/{sp.total} ferdig ({sp.pct}%)</Badge>:null;})()}</div>
      {getSubtasks(task.id).length>0&&<div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:8}}>{getSubtasks(task.id).map(sub=>{const st=stMap[sub.status];return <div key={sub.id} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 10px",background:C.surface,borderRadius:7,border:`1px solid ${C.border}`}}>
        <div style={{width:18,height:18,borderRadius:4,background:sub.status==="done"?C.success:C.surfaceAlt,border:`1.5px solid ${sub.status==="done"?C.success:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#fff",cursor:"pointer"}} onClick={()=>updateTask(sub.id,{status:sub.status==="done"?"ready":"done"})}>{sub.status==="done"&&"✓"}</div>
        <div style={{flex:1,minWidth:0}}><div style={{fontSize:11,fontWeight:600,textDecoration:sub.status==="done"?"line-through":"none",color:sub.status==="done"?C.textMuted:C.text}}>{sub.title}</div><div style={{fontSize:9,color:C.textMuted}}>{sub.id} · {sub.size} Story Points · {sub.sprintId?(sprintMap||{})[sub.sprintId]?.name||sub.sprintId:"Ikke tildelt sprint"}</div></div>
        <Badge color={st?.color} bg={st?.bg} style={{fontSize:8}}>{st?.label}</Badge>
        <select value={sub.sprintId||""} onChange={e=>updateTask(sub.id,{sprintId:e.target.value||null})} style={{fontSize:9,padding:"2px 4px",borderRadius:4,border:`1px solid ${C.border}`,background:C.surface,color:C.text}}><option value="">Backlog</option>{(sprints||[]).filter(s=>s.status!=="completed").map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>
        <select value={sub.status} onChange={e=>updateTask(sub.id,{status:e.target.value})} style={{fontSize:9,padding:"2px 4px",borderRadius:4,border:`1px solid ${st?.color||C.border}`,background:st?.bg,color:st?.color}}>{STATUSES.filter(s=>s.id!=="archived").map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select>
        <select value={sub.assignee||""} onChange={e=>updateTask(sub.id,{assignee:e.target.value})} style={{fontSize:9,padding:"2px 4px",borderRadius:4,border:`1px solid ${C.border}`,background:C.surface,color:C.text,maxWidth:90}}><option value="">Tildel...</option>{(team||[]).map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select>
        <Btn variant="ghost" onClick={()=>{setTasks(p=>p.filter(t=>t.id!==sub.id));notify(`"${sub.title}" slettet`);}} style={{fontSize:9,padding:"2px 5px",color:C.danger}}>🗑️</Btn>
      </div>;})}
      {(()=>{const sp=subProgress(task.id);return sp?<div style={{marginTop:4}}><div style={{height:4,borderRadius:2,background:C.surfaceAlt}}><div style={{height:4,borderRadius:2,background:sp.pct===100?C.success:C.accent,width:`${sp.pct}%`,transition:"width .3s"}}/></div></div>:null;})()}
      </div>}
      {(()=>{const trackTemplates=(f.tracks||[]).flatMap(tr=>(config.trackSubtasks?.[tr]||[]).map(tpl=>({...tpl,track:tr})));const existingTitles=getSubtasks(task.id).map(s=>s.title);const newTemplates=trackTemplates.filter(t=>!existingTitles.includes(t.title));return newTemplates.length>0?<div style={{marginBottom:8}}><Btn onClick={()=>{updateTask(task.id,f);addSubtasksBatch({...task,...f},newTemplates);}} style={{fontSize:11,padding:"6px 14px",background:C.accent+"15",color:C.accent,border:`1px solid ${C.accent}40`,width:"100%"}}>📋 Opprett faste deloppgaver ({newTemplates.length})</Btn></div>:null;})()}
      <div style={{display:"grid",gridTemplateColumns:"3fr 1fr auto",gap:6,alignItems:"end"}}><TF label="Ny deloppgave" id="sub-t" value={subForm.title} onChange={e=>setSubForm(p=>({...p,title:e.target.value}))} placeholder="Beskriv deloppgaven..."/><SF label="Story Points" id="sub-sp" value={subForm.size} onChange={e=>setSubForm(p=>({...p,size:e.target.value}))}>{FIBONACCI.map(f=><option key={f.v} value={f.v}>{f.l}</option>)}</SF><Btn onClick={()=>{if(!subForm.title.trim())return;addSubtask({...task,...f},subForm.title.trim(),subForm.size);setSubForm({title:"",size:3,sprintAssign:""});}} style={{fontSize:11}}>+ Legg til</Btn></div>
    </div>}

    {/* ═══ History Tab ═══ */}
    {activeTab==="history"&&<div>
      <CommentsPanel task={task} role={role} onAdd={txt=>addComment(task.id,txt)}/>
      <HistoryPanel task={task}/>
    </div>}
    </>}

    {/* Footer actions (B7: save draft) */}
    <div style={{display:"flex",justifyContent:"flex-end",gap:6,marginTop:14}}>
      <Btn variant="secondary" onClick={handleClose} style={{background:C.surfaceAlt,color:C.primary}}>Avbryt</Btn>
      <Btn variant="secondary" onClick={saveDraft} style={{background:C.accent+"10",color:C.accent,border:`1px solid ${C.accent}30`}}>💾 Lagre utkast</Btn>
      <Btn onClick={save}>Godkjenn</Btn>
    </div>
  </div></div>;
};

export default ReviewModal;
