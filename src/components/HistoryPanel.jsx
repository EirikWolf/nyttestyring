import React, { useState } from "react";
import { useTheme } from "../ThemeContext";
import { fmtDate } from "../constants";

const HistoryPanel=({task})=>{const C=useTheme();
  const[expanded,setExpanded]=useState(false);
  const hist=(task.history||[]).slice().reverse();
  return <div style={{marginTop:8}}>
  <div style={{fontSize:11,fontWeight:700,color:C.primary,marginBottom:4}}>Endringshistorikk ({hist.length})</div>
  {hist.length===0?<p style={{fontSize:11,color:C.textMuted,margin:0}}>Ingen endringer registrert.</p>
  :<div style={{maxHeight:expanded?"none":300,overflow:"auto"}}>{hist.map((h,i)=><div key={i} style={{padding:"3px 0",borderBottom:`1px solid ${C.border}33`,fontSize:10,display:"flex",justifyContent:"space-between"}}>
    <span><strong style={{color:C.primary}}>{h.who}</strong>: {h.what}</span><span style={{color:C.textMuted,flexShrink:0,marginLeft:6}} title={h.time}>{fmtDate(h.time)}</span>
  </div>)}</div>}
  {hist.length>8&&<button onClick={()=>setExpanded(!expanded)} style={{fontSize:10,color:C.accent,background:"none",border:"none",cursor:"pointer",marginTop:4,padding:0}}>{expanded?`▲ Vis mindre`:`▼ Vis alle (${hist.length})`}</button>}
</div>;};

export default HistoryPanel;
