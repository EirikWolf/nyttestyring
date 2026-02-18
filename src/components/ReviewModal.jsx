import React, { useState } from "react";
import { useTheme } from "../ThemeContext";
import { TRACKS, STATUSES, PRIORITIES, FIBONACCI, WSJF_DIMS, COD_DIMS, RPA_DIMS, RICE_DIMS, ICE_DIMS, COTS_DIMS, calcWsjf, calcCod, calcRpa, calcRice, calcIce, calcCots, makeComposite, stMap, TIP, STATUS_TRANSITIONS, validTransition } from "../constants";
import { Badge, Card, Btn, SH, TF, SF, Sl, GoalPicker, Tip } from "../atoms";
import AttachArea from "./AttachArea";
import CommentsPanel from "./CommentsPanel";
import HistoryPanel from "./HistoryPanel";

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
  const tog=id=>sF(p=>({...p,tracks:(p.tracks||[]).includes(id)?(p.tracks||[]).filter(x=>x!==id):[...(p.tracks||[]),id]}));
  const trkD=()=>{let d=[];const tr=f.tracks||[];if(tr.includes("integration"))d.push({s:"Cost of Delay",tip:TIP.CoD,dims:COD_DIMS,calc:calcCod,c:TRACKS[1].color});if(tr.includes("rpa"))d.push({s:"RPA Pipeline",tip:TIP.RPA,dims:RPA_DIMS,calc:calcRpa,c:TRACKS[0].color});if(tr.includes("sysdev"))d.push({s:"RICE",tip:TIP.RICE,dims:RICE_DIMS,calc:calcRice,c:TRACKS[2].color});if(tr.includes("lowcode"))d.push({s:"ICE",tip:TIP.ICE,dims:ICE_DIMS,calc:calcIce,c:TRACKS[3].color});if(tr.includes("cots"))d.push({s:"TCO/Fit",tip:TIP.TCO,dims:COTS_DIMS,calc:calcCots,c:TRACKS[4].color});return d;};

  const saveDraft=()=>{updateTask(task.id,f);if(cmt.trim())addComment(task.id,cmt.trim());setCmt("");notify(`"${f.title}" lagret som utkast.`);};
  const save=()=>{const upd={...f,reviewed:true,status:f.status==="submitted"?((f.tracks||[]).length?"assessed":"under-review"):f.status};updateTask(task.id,upd);if(cmt.trim())addComment(task.id,cmt.trim());onClose();notify(`"${f.title}" vurdert.`);};

  // A5: valid next statuses
  const allowedStatuses=STATUS_TRANSITIONS[task.status]||[];

  // C4: ROI
  const cost=parseFloat(f.estimatedCost)||0;
  const saving=parseFloat(f.estimatedAnnualSaving)||0;
  const payback=cost>0&&saving>0?Math.round(cost/saving*10)/10:null;

  return <div role="dialog" aria-modal="true" aria-label={`Vurdering: ${task.title}`} onKeyDown={e=>{if(e.key==="Escape")onClose();}} style={{position:"fixed",inset:0,zIndex:100,display:"flex",alignItems:"flex-start",justifyContent:"center",background:"rgba(0,0,0,.45)",padding:"3vh 10px",overflow:"auto"}} onClick={onClose}><div className="hemit-modal-inner" onClick={e=>e.stopPropagation()} style={{background:C.surface,borderRadius:14,maxWidth:880,width:"100%",minHeight:600,maxHeight:"94vh",overflow:"auto",padding:22,color:C.text}}>
    {/* Header */}
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><div><h2 style={{fontSize:17,fontWeight:700,color:C.primary,margin:0}}>{task.id}: {task.title}</h2><p style={{fontSize:11,color:C.textMuted,margin:"2px 0"}}>{task.submitterName} · {task.processOwner&&`${task.processOwner} · `}{task.date}</p></div><Btn variant="ghost" onClick={onClose} style={{color:C.textSec}}>✕</Btn></div>
    <Card style={{marginBottom:10,borderLeft:`4px solid ${C.accent}`,background:C.surfaceAlt,padding:12}}><p style={{fontSize:12,color:C.textSec,margin:0}}>{task.desc||"—"}</p><div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:4}}>{task.eqsRef&&<Badge color="#0891B2" bg="#E0F7FA" style={{fontSize:9}}>📋 {task.eqsRef}</Badge>}{task.personalData==="yes"&&<Badge color={C.danger} bg={C.dangerBg} style={{fontSize:9}}>🔒 DPIA – <a href={config.dpiaLink} target="_blank" rel="noopener" style={{color:C.danger}}>Mal</a></Badge>}{(task.goals||[]).map(gid=>{const g=goals.find(x=>x.id===gid);return g?<Badge key={gid} color={C.primary} bg={C.primary+"0C"} style={{fontSize:9}}>🎯 {g.title}</Badge>:null;})}</div></Card>

    {/* Tab bar (B1) */}
    <div style={{display:"flex",gap:1,background:C.surfaceAlt,borderRadius:8,padding:3,marginBottom:14}}>{TABS.filter(t=>t.id!=="subtasks"||!task.parentId).map(t=><button key={t.id} onClick={()=>setActiveTab(t.id)} style={{flex:1,padding:"6px 8px",borderRadius:6,border:"none",cursor:"pointer",fontSize:10,fontWeight:600,background:activeTab===t.id?C.surface:"transparent",color:activeTab===t.id?C.primary:C.textMuted,boxShadow:activeTab===t.id?"0 1px 3px rgba(0,0,0,.08)":"none"}}>{t.icon} {t.label}</button>)}</div>

    {/* ═══ Scoring Tab ═══ */}
    {activeTab==="scoring"&&<div>
      <SH><Tip k="WSJF">WSJF-scoring</Tip></SH>
      <div className="hemit-score-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:4}}>{WSJF_DIMS.map(d=><Sl key={d.key} label={d.label} id={`r-${d.key}`} value={f[d.key]||3} onChange={e=>sF(p=>({...p,[d.key]:parseInt(e.target.value)}))}/>)}</div>
      <div style={{padding:"6px 10px",background:C.surfaceAlt,borderRadius:8,marginBottom:14,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:11,color:C.textSec}}><Tip k="WSJF">WSJF</Tip></span><span style={{fontSize:18,fontWeight:800,color:C.primary}}>{calcWsjf(f)}</span></div>
      <SH>Løype(r)</SH>
      <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:14}}>{TRACKS.map(tr=>{const sel=(f.tracks||[]).includes(tr.id);return <button key={tr.id} type="button" onClick={()=>tog(tr.id)} style={{padding:"7px 14px",borderRadius:9,border:`2px solid ${sel?tr.color:C.border}`,background:sel?tr.color+"0C":"transparent",color:sel?tr.color:C.textMuted,fontWeight:600,fontSize:11,cursor:"pointer"}}>{tr.icon} {tr.label}{sel&&" ✓"}</button>;})}</div>
      {trkD().map(({s,tip,dims,calc,c})=><div key={s} style={{marginBottom:10,padding:10,background:c+"06",borderRadius:8,border:`1px solid ${c}15`}}><h4 style={{fontSize:11,fontWeight:700,color:c,margin:"0 0 6px"}} title={tip}><span style={{borderBottom:`1px dashed ${c}55`,cursor:"help"}}>{s}</span></h4><div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(dims.length,3)},1fr)`,gap:8,marginBottom:4}}>{dims.map(d=><Sl key={d.key} label={d.label} id={`rv-${d.key}`} value={f[d.key]||3} onChange={e=>sF(p=>({...p,[d.key]:parseInt(e.target.value)}))}/>)}</div><div style={{display:"flex",justifyContent:"space-between",padding:"5px 8px",background:C.surface,borderRadius:6}}><span style={{fontSize:10,color:C.textSec}}>Delsum</span><span style={{fontSize:13,fontWeight:800,color:c}}>{Math.round(calc(f))}</span></div></div>)}
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:10,background:C.primary+"08",borderRadius:8,marginTop:6}}><span style={{fontSize:10,color:C.textMuted,marginRight:8}}>SAMLET SCORE</span><span style={{fontSize:28,fontWeight:800,color:C.primary}}>{composite(f)}</span></div>

      {/* Prioritet, Status, Timer, Kommentar */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginTop:14}}>
        <SF label="Prioritet" id="r-prio" value={f.priority||"medium"} onChange={e=>sF(p=>({...p,priority:e.target.value}))}>{PRIORITIES.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</SF>
        <SF label="Status" id="r-status" value={f.status} onChange={e=>sF(p=>({...p,status:e.target.value}))}>{STATUSES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</SF>
        <TF label="Faktisk tidsbruk (t)" id="r-hrs" type="number" value={f.actualHours||0} onChange={e=>sF(p=>({...p,actualHours:parseFloat(e.target.value)||0}))}/>
      </div>
      <div style={{marginTop:8}}><TF label="Kommentar" id="r-cmt" value={cmt} onChange={e=>setCmt(e.target.value)} placeholder="Begrunnelse..."/></div>
      {(task.attachments||[]).length>0&&<div style={{marginTop:10}}><AttachArea attachments={task.attachments} readOnly/></div>}
      {task.parentId&&<div style={{marginTop:10,padding:"6px 10px",background:C.accent+"08",borderRadius:7,border:`1px solid ${C.accent}20`}}><span style={{fontSize:11,color:C.accent}}>🔗 Deloppgave av <strong>{task.parentId}</strong>: {tasks.find(t=>t.id===task.parentId)?.title||"—"}</span></div>}
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

    {/* ═══ Benefit Tab (C1 + C4 + C5) ═══ */}
    {activeTab==="benefit"&&<div>
      <GoalPicker goals={goals} selected={f.goals||[]} onChange={g=>sF(p=>({...p,goals:g}))}/>
      <div style={{marginTop:10}}/>
      <SH>📈 Forventet nytte</SH>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <div style={{gridColumn:"1/-1"}}><TF label="Forventet nytteeffekt" id="r-ben" value={f.expectedBenefit||""} onChange={e=>sF(p=>({...p,expectedBenefit:e.target.value}))} placeholder="Beskrivelse av forventet gevinst..."/></div>
        <TF label="Metrikk / KPI" id="r-metric" value={f.benefitMetric||""} onChange={e=>sF(p=>({...p,benefitMetric:e.target.value}))} placeholder="f.eks. Behandlingstid per faktura"/>
        <TF label="Baseline (nåverdi)" id="r-base" value={f.benefitBaseline||""} onChange={e=>sF(p=>({...p,benefitBaseline:e.target.value}))} placeholder="f.eks. 12 min/stk"/>
        <TF label="Målverdi" id="r-target" value={f.benefitTarget||""} onChange={e=>sF(p=>({...p,benefitTarget:e.target.value}))} placeholder="f.eks. 3 min/stk"/>
        <TF label="Faktisk (etter impl.)" id="r-actual" value={f.benefitActual||""} onChange={e=>sF(p=>({...p,benefitActual:e.target.value}))} placeholder="Fylles ut etter implementering"/>
        <TF label="Nyttevurderings-dato" id="r-bdate" type="date" value={f.benefitReviewDate||""} onChange={e=>sF(p=>({...p,benefitReviewDate:e.target.value}))}/>
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

      {/* PIR-prompt for ferdige oppgaver */}
      {f.status==="done"&&<div style={{marginTop:14,padding:12,background:C.purple+"08",borderRadius:8,border:`1px solid ${C.purple}20`}}>
        <h4 style={{fontSize:12,fontWeight:700,color:C.purple,margin:"0 0 6px"}}>🔍 Post-implementasjonsgjennomgang (PIR)</h4>
        <p style={{fontSize:11,color:C.textSec,margin:"0 0 8px"}}>Oppgaven er ferdig. Vurder om forventet nytte er realisert og fyll ut faktisk verdi over.</p>
        {f.benefitActual&&<Btn onClick={()=>sF(p=>({...p,status:"archived"}))} style={{fontSize:11,padding:"6px 14px",background:C.success+"15",color:C.success,border:`1px solid ${C.success}40`}}>✓ Nyttevurdert – arkiver</Btn>}
      </div>}
    </div>}

    {/* ═══ Subtasks Tab ═══ */}
    {activeTab==="subtasks"&&!task.parentId&&<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><h4 style={{fontSize:13,fontWeight:700,color:C.primary,margin:0}}>🧩 Deloppgaver</h4>{(()=>{const sp=subProgress(task.id);return sp?<Badge color={sp.pct===100?C.success:C.accent} bg={sp.pct===100?C.successBg:C.accent+"10"} style={{fontSize:9}}>{sp.done}/{sp.total} ferdig ({sp.pct}%)</Badge>:null;})()}</div>
      {getSubtasks(task.id).length>0&&<div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:8}}>{getSubtasks(task.id).map(sub=>{const st=stMap[sub.status];return <div key={sub.id} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 10px",background:C.surface,borderRadius:7,border:`1px solid ${C.border}`}}>
        <div style={{width:18,height:18,borderRadius:4,background:sub.status==="done"?C.success:C.surfaceAlt,border:`1.5px solid ${sub.status==="done"?C.success:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#fff",cursor:"pointer"}} onClick={()=>updateTask(sub.id,{status:sub.status==="done"?"ready":"done"})}>{sub.status==="done"&&"✓"}</div>
        <div style={{flex:1,minWidth:0}}><div style={{fontSize:11,fontWeight:600,textDecoration:sub.status==="done"?"line-through":"none",color:sub.status==="done"?C.textMuted:C.text}}>{sub.title}</div><div style={{fontSize:9,color:C.textMuted}}>{sub.id} · {sub.size}SP · {sub.sprintId?(sprintMap||{})[sub.sprintId]?.name||sub.sprintId:"Ikke tildelt sprint"}</div></div>
        <Badge color={st?.color} bg={st?.bg} style={{fontSize:8}}>{st?.label}</Badge>
        <select value={sub.sprintId||""} onChange={e=>updateTask(sub.id,{sprintId:e.target.value||null})} style={{fontSize:9,padding:"2px 4px",borderRadius:4,border:`1px solid ${C.border}`,background:C.surface,color:C.text}}><option value="">Backlog</option>{(sprints||[]).filter(s=>s.status!=="completed").map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>
        <select value={sub.status} onChange={e=>updateTask(sub.id,{status:e.target.value})} style={{fontSize:9,padding:"2px 4px",borderRadius:4,border:`1px solid ${st?.color||C.border}`,background:st?.bg,color:st?.color}}>{STATUSES.filter(s=>s.id!=="archived").map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select>
        <select value={sub.assignee||""} onChange={e=>updateTask(sub.id,{assignee:e.target.value})} style={{fontSize:9,padding:"2px 4px",borderRadius:4,border:`1px solid ${C.border}`,background:C.surface,color:C.text,maxWidth:90}}><option value="">Tildel...</option>{(team||[]).map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select>
        <Btn variant="ghost" onClick={()=>{setTasks(p=>p.filter(t=>t.id!==sub.id));notify(`"${sub.title}" slettet`);}} style={{fontSize:9,padding:"2px 5px",color:C.danger}}>🗑️</Btn>
      </div>;})}
      {(()=>{const sp=subProgress(task.id);return sp?<div style={{marginTop:4}}><div style={{height:4,borderRadius:2,background:C.surfaceAlt}}><div style={{height:4,borderRadius:2,background:sp.pct===100?C.success:C.accent,width:`${sp.pct}%`,transition:"width .3s"}}/></div></div>:null;})()}
      </div>}
      {(()=>{const trackTemplates=(f.tracks||[]).flatMap(tr=>(config.trackSubtasks?.[tr]||[]).map(tpl=>({...tpl,track:tr})));const existingTitles=getSubtasks(task.id).map(s=>s.title);const newTemplates=trackTemplates.filter(t=>!existingTitles.includes(t.title));return newTemplates.length>0?<div style={{marginBottom:8}}><Btn onClick={()=>{updateTask(task.id,f);addSubtasksBatch({...task,...f},newTemplates);}} style={{fontSize:11,padding:"6px 14px",background:C.accent+"15",color:C.accent,border:`1px solid ${C.accent}40`,width:"100%"}}>📋 Opprett faste deloppgaver ({newTemplates.length})</Btn></div>:null;})()}
      <div style={{display:"grid",gridTemplateColumns:"3fr 1fr auto",gap:6,alignItems:"end"}}><TF label="Ny deloppgave" id="sub-t" value={subForm.title} onChange={e=>setSubForm(p=>({...p,title:e.target.value}))} placeholder="Beskriv deloppgaven..."/><SF label="SP" id="sub-sp" value={subForm.size} onChange={e=>setSubForm(p=>({...p,size:e.target.value}))}>{FIBONACCI.map(f=><option key={f.v} value={f.v}>{f.v}</option>)}</SF><Btn onClick={()=>{if(!subForm.title.trim())return;addSubtask({...task,...f},subForm.title.trim(),subForm.size);setSubForm({title:"",size:3,sprintAssign:""});}} style={{fontSize:11}}>+ Legg til</Btn></div>
    </div>}

    {/* ═══ History Tab ═══ */}
    {activeTab==="history"&&<div>
      <CommentsPanel task={task} role={role} onAdd={txt=>addComment(task.id,txt)}/>
      <HistoryPanel task={task}/>
    </div>}

    {/* Footer actions (B7: save draft) */}
    <div style={{display:"flex",justifyContent:"flex-end",gap:6,marginTop:14}}>
      <Btn variant="secondary" onClick={onClose} style={{background:C.surfaceAlt,color:C.primary}}>Avbryt</Btn>
      <Btn variant="secondary" onClick={saveDraft} style={{background:C.accent+"10",color:C.accent,border:`1px solid ${C.accent}30`}}>💾 Lagre utkast</Btn>
      <Btn onClick={save}>Godkjenn</Btn>
    </div>
  </div></div>;
};

export default ReviewModal;
