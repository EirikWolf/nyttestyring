import React from "react";
import { useTheme } from "../ThemeContext";

export const SkeletonLine=({width="100%",height=12,style={}})=>{
  const C=useTheme();
  return <div style={{width,height,borderRadius:4,background:`linear-gradient(90deg,${C.surfaceAlt} 25%,${C.border}30 50%,${C.surfaceAlt} 75%)`,backgroundSize:"200% 100%",animation:"shimmer 1.5s infinite",...style}}/>;
};

export const SkeletonCard=()=>{
  const C=useTheme();
  return <div style={{padding:16,borderRadius:12,border:`1px solid ${C.border}`,background:C.surface}}>
    <SkeletonLine width="60%" height={14}/>
    <SkeletonLine width="40%" style={{marginTop:8}}/>
    <SkeletonLine width="80%" style={{marginTop:8}}/>
  </div>;
};

export const SkeletonTable=({rows=5,cols=6})=>{
  const C=useTheme();
  return <div style={{borderRadius:12,border:`1px solid ${C.border}`,overflow:"hidden"}}>
    <div style={{padding:"8px 10px",background:C.surfaceAlt}}><SkeletonLine width="30%" height={10}/></div>
    {Array.from({length:rows}).map((_,r)=><div key={r} style={{display:"flex",gap:8,padding:"8px 10px",borderBottom:`1px solid ${C.border}20`}}>
      {Array.from({length:cols}).map((_,c)=><SkeletonLine key={c} width={c===0?"10%":c===1?"30%":"15%"} height={10}/>)}
    </div>)}
  </div>;
};
