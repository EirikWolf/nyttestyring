import React, { useState, useRef } from "react";
import { useTheme } from "../ThemeContext";
import { ATTACH_ACCEPT, ATTACH_MAX_BYTES, fmtSize, ts } from "../constants";
import { Badge } from "../atoms";

const AttachArea=({attachments=[],onChange,readOnly=false})=>{
  const C=useTheme();
  const [reading,setReading]=useState(false);
  const inputRef=useRef(null);
  const openFile=a=>{if(!a.dataUrl)return;if(a.type&&a.type.startsWith("image/")){window.open(a.dataUrl,"_blank");}else{const l=document.createElement("a");l.href=a.dataUrl;l.download=a.name;document.body.appendChild(l);l.click();document.body.removeChild(l);}};
  const handleFiles=fl=>{if(!fl||!fl.length)return;setReading(true);Promise.all(Array.from(fl).map(f=>new Promise(res=>{const r=new FileReader();r.onload=()=>res({name:f.name,size:fmtSize(f.size),sizeBytes:f.size,time:ts(),type:f.type,dataUrl:r.result});r.onerror=()=>res(null);r.readAsDataURL(f);}))).then(results=>{const valid=results.filter(Boolean);if(valid.length)onChange([...attachments,...valid]);setReading(false);});};
  const totalBytes=attachments.reduce((s,a)=>s+(a.sizeBytes||0),0);
  return <div style={{display:"flex",flexDirection:"column",gap:3}}>
    <label style={{fontSize:11,fontWeight:600,color:C.textSec}}>Vedlegg{attachments.length>0&&` (${attachments.length})`}{totalBytes>0&&<span style={{fontWeight:400,color:C.textMuted}}> — {fmtSize(totalBytes)}</span>}</label>
    {!readOnly&&<><input ref={inputRef} type="file" accept={ATTACH_ACCEPT} multiple style={{display:"none"}} onChange={e=>{handleFiles(e.target.files);e.target.value="";}}/><div style={{border:`1px dashed ${C.border}`,borderRadius:8,padding:10,textAlign:"center",cursor:reading?"wait":"pointer",background:C.surfaceAlt}} onClick={()=>!reading&&inputRef.current?.click()}><span style={{fontSize:11,color:"#8896A6"}}>{reading?"⏳ Leser filer...":"📎 Klikk for å legge til vedlegg (.png, .jpg, .gif, .docx, .xls, .pptx)"}</span></div></>}
    {totalBytes>ATTACH_MAX_BYTES&&<div style={{fontSize:10,color:C.warning,padding:"3px 8px",background:C.warningBg,borderRadius:6}}>⚠️ Vedlegg overskrider {fmtSize(ATTACH_MAX_BYTES)} — kan påvirke ytelse</div>}
    {attachments.length>0&&<div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:3}}>{attachments.map((a,i)=><Badge key={i} color={C.accent} bg={C.accent+"10"}><span onClick={()=>openFile(a)} style={{cursor:a.dataUrl?"pointer":"default",textDecoration:a.dataUrl?"underline":"none"}} title={a.dataUrl?"Klikk for å åpne/laste ned":""}>📄 {a.name}</span><span style={{fontSize:9,color:C.textMuted,marginLeft:3}}>({a.size})</span>{!readOnly&&<button type="button" onClick={e=>{e.stopPropagation();onChange(attachments.filter((_,j)=>j!==i));}} style={{background:"none",border:"none",color:C.danger,cursor:"pointer",fontWeight:700,fontSize:11,marginLeft:3}}>×</button>}</Badge>)}</div>}
  </div>;
};

export default AttachArea;
