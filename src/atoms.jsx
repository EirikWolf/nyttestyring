import React, { useState } from "react";
import { useTheme } from "./ThemeContext";
import { TRACKS, TIP } from "./constants";

export const Badge=({children,color,bg,style={}})=><span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"2px 10px",borderRadius:20,fontSize:11,fontWeight:600,color,background:bg,border:`1px solid ${color}20`,whiteSpace:"nowrap",...style}}>{children}</span>;

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

export const GoalPicker=({goals,selected=[],onChange})=>{const C=useTheme();return <div style={{display:"flex",flexDirection:"column",gap:3}}>
  <label style={{fontSize:11,fontWeight:600,color:C.textSec}}>Strategiske mål <span style={{fontWeight:400,color:"#8896A6"}}>(handlingsplan)</span></label>
  <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{goals.map(g=>{const sel=selected.includes(g.id);return <button key={g.id} type="button" onClick={()=>onChange(sel?selected.filter(x=>x!==g.id):[...selected,g.id])} style={{padding:"4px 10px",borderRadius:7,border:`1.5px solid ${sel?C.primary:C.border}`,background:sel?C.primary+"0C":"transparent",color:sel?C.primary:C.textMuted,fontSize:10,fontWeight:600,cursor:"pointer",outline:"none",textAlign:"left"}}>{g.type==="Delmål"?"↳ ":""}{g.title}{sel?" ✓":""}</button>;})}</div>
</div>;};
