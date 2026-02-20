import React, { useState } from "react";
import { useTheme } from "./ThemeContext";
import { TRACKS, TIP } from "./constants";

export const Badge=({children,color,bg,variant,size="default",style={}})=>{
  const C=useTheme();
  const variants={status:{color:color||C.textSec,bg:bg||C.surfaceAlt},track:{color,bg:bg||color+"14"},priority:{color,bg:bg||color+"14"},count:{color:C.textMuted,bg:C.surfaceAlt,borderRadius:14,padding:"1px 7px"},info:{color:C.accent,bg:C.accent+"0C"}};
  const sizes={small:{fontSize:8,padding:"1px 6px"},default:{fontSize:10,padding:"2px 10px"},large:{fontSize:12,padding:"3px 12px"}};
  const v=variants[variant]||{};const sz=sizes[size]||sizes.default;
  return <span style={{display:"inline-flex",alignItems:"center",gap:4,borderRadius:20,fontWeight:600,whiteSpace:"nowrap",color:color||v.color,background:bg||v.bg,border:`1px solid ${(color||v.color||C.border)}20`,...sz,...v,...style}}>{children}</span>;
};

export const TBadge=({id:tid})=>{const t=TRACKS.find(x=>x.id===tid);return t?<Badge color={t.color} bg={t.color+"14"}>{t.icon} {t.label}</Badge>:null;};

export const Card=({children,style={},...p})=>{const C=useTheme();return <div style={{background:C.surface,borderRadius:12,border:`1px solid ${C.border}`,padding:18,...style}} {...p}>{children}</div>;};

export const Btn=({children,variant="primary",onClick,style={},type="button",disabled,...p})=>{
  const C=useTheme();
  const v={primary:{background:C.primary,color:"#fff"},secondary:{background:C.surfaceAlt,color:C.primary,border:`1px solid ${C.border}`},ghost:{background:"transparent",color:C.textSec},danger:{background:C.dangerBg,color:C.danger},success:{background:C.successBg,color:C.success}};
  return <button type={type} onClick={onClick} disabled={disabled} style={{borderRadius:8,fontWeight:600,fontSize:13,cursor:disabled?"not-allowed":"pointer",padding:"7px 16px",border:"none",transition:"all .15s",outline:"none",opacity:disabled?.5:1,...(v[variant]||{}),...style}} onFocus={e=>e.target.style.boxShadow=`0 0 0 3px ${C.focus}44`} onBlur={e=>e.target.style.boxShadow="none"} {...p}>{children}</button>;
};

export const SH=({children})=>{const C=useTheme();return <h3 style={{fontSize:13,fontWeight:700,color:C.primary,margin:"0 0 10px",borderBottom:`2px solid ${C.primaryLight}`,paddingBottom:5}}>{children}</h3>;};

export const TF=({label,id,value,onChange,required,multiline,placeholder,type="text"})=>{
  const C=useTheme();
  const s={padding:"8px 11px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:13,color:C.text,background:C.surface,outline:"none",width:"100%",boxSizing:"border-box",fontFamily:"inherit"};
  return <div style={{display:"flex",flexDirection:"column",gap:2}}><label htmlFor={id} style={{fontSize:11,fontWeight:600,color:C.textSec}}>{label}{required&&<span style={{color:C.danger}}> *</span>}</label>{multiline?<textarea id={id} value={value} onChange={onChange} required={required} placeholder={placeholder} rows={3} style={s}/>:<input type={type} id={id} value={value} onChange={onChange} required={required} placeholder={placeholder} style={s}/>}</div>;
};

export const SF=({label,id,value,onChange,children,required})=>{const C=useTheme();return <div style={{display:"flex",flexDirection:"column",gap:2}}><label htmlFor={id} style={{fontSize:11,fontWeight:600,color:C.textSec}}>{label}{required&&<span style={{color:C.danger}}> *</span>}</label><select id={id} value={value} onChange={onChange} required={required} style={{padding:"8px 11px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:13,color:C.text,background:C.surface,outline:"none"}}>{children}</select></div>;};

export const Sl=({label,id,value,onChange})=>{const C=useTheme();return <div style={{display:"flex",flexDirection:"column",gap:1}}><div style={{display:"flex",justifyContent:"space-between"}}><label htmlFor={id} style={{fontSize:11,fontWeight:600,color:C.textSec}}>{label}</label><span style={{fontSize:14,fontWeight:800,color:C.primary}}>{value}</span></div><input type="range" id={id} min={1} max={5} step={1} value={value} onChange={onChange} style={{width:"100%",accentColor:C.primary}}/></div>;};

export const SBar=({value})=>{const C=useTheme();return <div style={{display:"flex",alignItems:"center",gap:3}}><div style={{display:"flex",gap:1}}>{[1,2,3,4,5].map(i=><div key={i} style={{width:6,height:12,borderRadius:2,background:i<=value?C.primary:C.border}}/>)}</div><span style={{fontSize:10,color:"#8896A6"}}>{value}</span></div>;};

export const Tip=({children,k,style={}})=>{const C=useTheme();return <span title={TIP[k]||""} style={{borderBottom:`1px dashed ${C.textMuted}55`,cursor:"help",...style}}>{children||k}</span>;};

export const KriterieScoring=({label,weight,value,onChange,examples=[],reason,onReasonChange})=>{
  const C=useTheme();
  const pct=Math.round(weight*100);
  const clr=value>=7?C.success:value>=4?C.warning:value>0?C.accent:C.textMuted;
  return <div style={{marginBottom:14,padding:12,background:C.surface,borderRadius:10,border:`1px solid ${C.border}`,borderLeft:`4px solid ${clr}`}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
      <label style={{fontSize:12,fontWeight:700,color:C.text}}>{label}</label>
      <span style={{fontSize:9,fontWeight:600,color:C.textMuted,background:C.surfaceAlt,borderRadius:10,padding:"2px 8px"}}>{pct}%</span>
    </div>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
      <input type="range" min={0} max={10} step={1} value={value} onChange={onChange} style={{flex:1,accentColor:clr}}/>
      <span style={{fontSize:18,fontWeight:800,color:clr,minWidth:28,textAlign:"right"}}>{value}</span>
    </div>
    {examples[value]&&<div style={{padding:"6px 10px",background:clr+"12",borderRadius:6,border:`1px solid ${clr}25`,marginBottom:6}}>
      <span style={{fontSize:10,fontWeight:600,color:clr}}>{value} – {examples[value]}</span>
    </div>}
    <textarea value={reason||""} onChange={onReasonChange} placeholder="Begrunnelse (valgfritt)..." rows={2} style={{width:"100%",boxSizing:"border-box",padding:"6px 8px",borderRadius:6,border:`1px solid ${C.border}`,fontSize:11,color:C.text,background:C.surface,fontFamily:"inherit",outline:"none",resize:"vertical"}}/>
  </div>;
};

export const GoalPicker=({goals,selected=[],onChange})=>{
  const C=useTheme();
  const [expanded,setExpanded]=useState(new Set());
  const mainGoals=goals.filter(g=>!g.parent);
  const toggleExpand=id=>{setExpanded(prev=>{const n=new Set(prev);if(n.has(id))n.delete(id);else n.add(id);return n;});};
  const toggleSelect=(id)=>{onChange(selected.includes(id)?selected.filter(x=>x!==id):[...selected,id]);};
  return <div style={{display:"flex",flexDirection:"column",gap:3}}>
    <label style={{fontSize:11,fontWeight:600,color:C.textSec}}>Strategiske mål <span style={{fontWeight:400,color:"#8896A6"}}>(handlingsplan)</span></label>
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      {mainGoals.map(m=>{
        const subs=goals.filter(g=>g.parent===m.id);
        const isExp=expanded.has(m.id);
        const mSel=selected.includes(m.id);
        const subSelCount=subs.filter(s=>selected.includes(s.id)).length;
        return <div key={m.id} style={{borderRadius:8,border:`1.5px solid ${mSel?C.primary:C.border}`,background:mSel?C.primary+"06":C.surface,overflow:"hidden"}}>
          <div style={{display:"flex",alignItems:"center",gap:0}}>
            {subs.length>0&&<button type="button" onClick={()=>toggleExpand(m.id)} style={{background:"none",border:"none",cursor:"pointer",padding:"6px 6px 6px 10px",fontSize:12,color:C.textMuted,lineHeight:1,flexShrink:0}} title={isExp?"Skjul delmål":"Vis delmål"}>{isExp?"▾":"▸"}</button>}
            <button type="button" onClick={()=>toggleSelect(m.id)} style={{flex:1,padding:subs.length>0?"6px 10px 6px 2px":"6px 10px 6px 10px",background:"none",border:"none",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:11,fontWeight:700,color:mSel?C.primary:C.text}}>🎯 {m.title}</span>
              {mSel&&<span style={{fontSize:10,color:C.primary}}>✓</span>}
              {subs.length>0&&<span style={{fontSize:9,color:C.textMuted,background:C.surfaceAlt,borderRadius:10,padding:"1px 6px",marginLeft:"auto",flexShrink:0}}>{subSelCount>0?`${subSelCount}/`:""}{subs.length} delmål</span>}
            </button>
          </div>
          {isExp&&subs.length>0&&<div style={{borderTop:`1px solid ${C.border}`,padding:"4px 0 4px 0",background:C.surfaceAlt+"66"}}>
            {subs.map(s=>{const sSel=selected.includes(s.id);return <button key={s.id} type="button" onClick={()=>toggleSelect(s.id)} style={{display:"flex",alignItems:"center",gap:5,width:"100%",padding:"5px 10px 5px 28px",background:sSel?C.primary+"0A":"transparent",border:"none",borderLeft:`3px solid ${sSel?C.primary:C.border}`,cursor:"pointer",textAlign:"left",transition:"all .1s"}}>
              <span style={{fontSize:10,fontWeight:600,color:sSel?C.primary:C.textMuted}}>↳ {s.title}</span>
              {sSel&&<span style={{fontSize:10,color:C.primary,marginLeft:"auto"}}>✓</span>}
            </button>;})}
          </div>}
        </div>;
      })}
    </div>
  </div>;
};
