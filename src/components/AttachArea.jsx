import React, { useState, useRef } from "react";
import { useTheme } from "../ThemeContext";
import { ATTACH_ACCEPT, ATTACH_MAX_BYTES, fmtSize, ts, isImageAttachment, getAttachIcon } from "../constants";
import { Badge } from "../atoms";

const AttachArea=({attachments=[],onChange,readOnly=false})=>{
  const C=useTheme();
  const [reading,setReading]=useState(false);
  const [dragOver,setDragOver]=useState(false);
  const [progress,setProgress]=useState(0);
  const inputRef=useRef(null);
  const openFile=a=>{if(!a.dataUrl)return;if(isImageAttachment(a)){window.open(a.dataUrl,"_blank");}else{const l=document.createElement("a");l.href=a.dataUrl;l.download=a.name;document.body.appendChild(l);l.click();document.body.removeChild(l);}};
  const handleFiles=fl=>{if(!fl||!fl.length)return;
    // E.7: Enforce size limit per file
    const validFiles=Array.from(fl).filter(f=>{if(f.size>ATTACH_MAX_BYTES){alert(`Filen "${f.name}" (${fmtSize(f.size)}) overskrider maks ${fmtSize(ATTACH_MAX_BYTES)}`);return false;}return true;});
    if(!validFiles.length)return;
    setReading(true);setProgress(0);
    let done=0;
    Promise.all(validFiles.map(f=>new Promise(res=>{const r=new FileReader();r.onload=()=>{done++;setProgress(Math.round(done/validFiles.length*100));res({name:f.name,size:fmtSize(f.size),sizeBytes:f.size,time:ts(),type:f.type,dataUrl:r.result});};r.onerror=()=>{done++;setProgress(Math.round(done/validFiles.length*100));res(null);};r.readAsDataURL(f);}))).then(results=>{const valid=results.filter(Boolean);if(valid.length)onChange([...attachments,...valid]);setReading(false);setProgress(0);});};
  return <div style={{display:"flex",flexDirection:"column",gap:3}}>
    <label style={{fontSize:11,fontWeight:600,color:C.textSec}}>Vedlegg{attachments.length>0&&` (${attachments.length})`}{attachments.reduce((s,a)=>s+(a.sizeBytes||0),0)>0&&<span style={{fontWeight:400,color:C.textMuted}}> — {fmtSize(attachments.reduce((s,a)=>s+(a.sizeBytes||0),0))}</span>}</label>
    {!readOnly&&<><input ref={inputRef} type="file" accept={ATTACH_ACCEPT} multiple style={{display:"none"}} onChange={e=>{handleFiles(e.target.files);e.target.value="";}}/><div
      onDragOver={e=>{e.preventDefault();setDragOver(true);}}
      onDragLeave={()=>setDragOver(false)}
      onDrop={e=>{e.preventDefault();setDragOver(false);handleFiles(e.dataTransfer.files);}}
      onClick={()=>!reading&&inputRef.current?.click()}
      style={{border:`2px dashed ${dragOver?C.primary:C.border}`,borderRadius:8,padding:14,textAlign:"center",cursor:reading?"wait":"pointer",background:dragOver?C.primary+"08":C.surfaceAlt,transition:"all .15s"}}>
      <span style={{fontSize:11,color:dragOver?C.primary:"#8896A6"}}>{reading?`⏳ Leser filer... ${progress}%`:dragOver?"📥 Slipp filer her":"📎 Dra og slipp filer, eller klikk for å velge"}</span>
      {reading&&progress>0&&<div style={{marginTop:6,height:3,borderRadius:2,background:C.surfaceAlt,overflow:"hidden"}}><div style={{height:3,borderRadius:2,background:C.primary,width:`${progress}%`,transition:"width .2s"}}/></div>}
    </div></>}
    {attachments.length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:4}}>{attachments.map((a,i)=>
      isImageAttachment(a)&&a.dataUrl?
      <div key={i} style={{position:"relative",width:60,height:60,borderRadius:6,overflow:"hidden",border:`1px solid ${C.border}`,cursor:"pointer"}} onClick={()=>openFile(a)}>
        <img src={a.dataUrl} alt={a.name} style={{width:60,height:60,objectFit:"cover"}} title={`${a.name} (${a.size})`}/>
        {!readOnly&&<button type="button" onClick={e=>{e.stopPropagation();onChange(attachments.filter((_,j)=>j!==i));}} style={{position:"absolute",top:1,right:1,background:C.danger,color:"#fff",border:"none",borderRadius:"50%",width:16,height:16,fontSize:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>×</button>}
      </div>:
      <Badge key={i} color={C.accent} bg={C.accent+"10"}>
        <span onClick={()=>openFile(a)} style={{cursor:a.dataUrl?"pointer":"default",textDecoration:a.dataUrl?"underline":"none"}} title={a.dataUrl?"Klikk for å åpne/laste ned":""}>{getAttachIcon(a)} {a.name}</span>
        <span style={{fontSize:9,color:C.textMuted,marginLeft:3}}>({a.size})</span>
        {!readOnly&&<button type="button" onClick={e=>{e.stopPropagation();onChange(attachments.filter((_,j)=>j!==i));}} style={{background:"none",border:"none",color:C.danger,cursor:"pointer",fontWeight:700,fontSize:11,marginLeft:3}}>×</button>}
      </Badge>
    )}</div>}
  </div>;
};

export default AttachArea;
