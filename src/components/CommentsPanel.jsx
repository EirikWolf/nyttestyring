import React, { useState } from "react";
import { useTheme } from "../ThemeContext";
import { Btn } from "../atoms";
import { fmtDate } from "../constants";

const CommentsPanel=({task,role,onAdd})=>{
  const C=useTheme();
  const [txt,setTxt]=useState("");
  return <div style={{marginTop:10}}>
    <div style={{fontSize:11,fontWeight:700,color:C.primary,marginBottom:4}}>Kommentarer ({task.comments?.length||0})</div>
    {(task.comments||[]).map((c,i)=><div key={i} style={{padding:"5px 9px",background:C.surfaceAlt,borderRadius:6,marginBottom:3,fontSize:11}}>
      <div style={{display:"flex",justifyContent:"space-between"}}><strong style={{color:C.primary}}>{c.author}</strong><span style={{color:C.textMuted,fontSize:9}} title={c.time}>{fmtDate(c.time)}</span></div>
      <div style={{color:C.textSec,marginTop:1}}>{c.text}</div>
    </div>)}
    {<div style={{display:"flex",gap:5,marginTop:3}}>
      <input value={txt} onChange={e=>setTxt(e.target.value)} placeholder="Legg til kommentar..." style={{flex:1,padding:"5px 9px",borderRadius:6,border:`1px solid ${C.border}`,fontSize:11,outline:"none",background:C.surface,color:C.text}} onKeyDown={e=>{if(e.key==="Enter"&&txt.trim()){onAdd(txt.trim());setTxt("");}}}/>
      <Btn style={{fontSize:10,padding:"5px 10px"}} onClick={()=>{if(txt.trim()){onAdd(txt.trim());setTxt("");}}}>Legg til</Btn>
    </div>}
  </div>;
};

export default CommentsPanel;
