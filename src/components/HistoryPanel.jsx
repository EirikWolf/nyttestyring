import React from "react";
import { useTheme } from "../ThemeContext";

const HistoryPanel=({task})=>{const C=useTheme();return <div style={{marginTop:8}}>
  <div style={{fontSize:11,fontWeight:700,color:C.primary,marginBottom:4}}>Endringshistorikk ({task.history?.length||0})</div>
  {(task.history||[]).length===0?<p style={{fontSize:11,color:C.textMuted,margin:0}}>Ingen endringer registrert.</p>
  :<div style={{maxHeight:160,overflow:"auto"}}>{(task.history||[]).slice().reverse().map((h,i)=><div key={i} style={{padding:"3px 0",borderBottom:`1px solid ${C.border}33`,fontSize:10,display:"flex",justifyContent:"space-between"}}>
    <span><strong style={{color:C.primary}}>{h.who}</strong>: {h.what}</span><span style={{color:C.textMuted,flexShrink:0,marginLeft:6}}>{h.time}</span>
  </div>)}</div>}
</div>;};

export default HistoryPanel;
