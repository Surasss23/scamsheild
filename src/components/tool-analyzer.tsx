"use client";
import {useRef,useState} from "react";
import Link from "next/link";
import {ArrowLeft,ArrowUpRight,AlertTriangle,CheckCircle2,ShieldAlert,Upload,ScanSearch,Copy,RotateCcw,Volume2,FileText,LoaderCircle} from "lucide-react";
import jsQR from "jsqr";
import {analyzeText,checkUrlThreatIntel,toolInfo} from "@/lib/tools";
type Result=ReturnType<typeof analyzeText>;
export function ToolAnalyzer({slug}:{slug:string}){
 const info=toolInfo[slug];const [value,setValue]=useState("");const [result,setResult]=useState<Result|null>(null);const [busy,setBusy]=useState(false);const [progress,setProgress]=useState(0);const [note,setNote]=useState("");const fileRef=useRef<HTMLInputElement>(null);
 async function run(text=value){
  if(!text.trim()){setNote("Enter some content first.");return;}
  setNote("");setResult(null);setBusy(true);setProgress(0);
  const started=Date.now();
  const progressTimer=window.setInterval(()=>setProgress(Math.min(94,Math.floor(((Date.now()-started)/5000)*100))),100);
  try{
   const local=analyzeText(text,info.kind);
   let intel=null;
   if(info.kind==="url"){
    const candidate=text.match(/(?:https?:\/\/|www\.)[^\s<>"']+/i)?.[0]||text.trim();
    if(candidate)intel=await checkUrlThreatIntel(candidate);
   }
   const remaining=Math.max(0,5000-(Date.now()-started));
   await new Promise(resolve=>window.setTimeout(resolve,remaining));
   const signals=[...local.signals];
   if(intel&&!signals.some(s=>s.title===intel?.title))signals.push(intel);
   const raw=signals.reduce((n,s)=>n+s.weight,0);
   const score=Math.min(99,Math.round(100*(1-Math.exp(-raw/48))));
   const level=score>=75?"High":score>=45?"Elevated":score>=20?"Caution":"Few warning signs found";
   const recommendation=score>=75?"Do not proceed. Do not click links, pay, share credentials or install apps. Verify through an official channel and report suspected fraud.":score>=45?"Pause. Do not pay or share information until you verify the sender, organization and destination independently.":score>=20?"Be cautious. Check the details using an official app, website or phone number you find independently.":"No strong warning pattern was found in the supplied content. This is not proof that it is genuine; verify independently.";
   setResult({...local,signals,score,level,recommendation});
   if(info.kind==="url"&&!intel)setNote("Live reputation lookup was unavailable or returned no known match. Local checks were still completed; an unknown result is not a safe verdict.");
  }catch{
   setResult(analyzeText(text,info.kind));
   setNote("Live lookup was unavailable. Showing local pattern analysis only; this is not a clean bill of health.");
  }finally{window.clearInterval(progressTimer);setProgress(100);setBusy(false);}
 }
 async function handleFile(file?:File){if(!file)return;setBusy(true);setNote("Reading image in your browser…");try{
  const image=await createImageBitmap(file);const canvas=document.createElement("canvas");canvas.width=image.width;canvas.height=image.height;const ctx=canvas.getContext("2d");if(!ctx)throw new Error("Image unavailable");ctx.drawImage(image,0,0);
  let qrText="";try{const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);const qr=jsQR(pixels.data,pixels.width,pixels.height);if(qr)qrText=qr.data;}catch{}
  let extracted="";try{const Tesseract=await import("tesseract.js");const ocr=await Tesseract.recognize(file,"eng");extracted=ocr.data.text.trim();}catch{}
  const combined=[qrText?"QR content (not opened): "+qrText:"",extracted?"Text detected in image:\n"+extracted:""].filter(Boolean).join("\n\n");
  if(combined){setValue(combined);setResult(null);setNote(qrText?"QR content and visible text extracted locally. Review the destination; it has not been opened.":"Text extracted locally. Please review OCR for mistakes.");}
  else setNote("No readable QR code or text was detected. You can type the visible content manually.");
 }catch{setNote("Could not read this image. Try a clear JPG or PNG, or type the text manually.");}finally{setBusy(false);}}
 function speak(){if(!("speechSynthesis"in window)){setNote("Audio playback is not supported in this browser.");return;}window.speechSynthesis.cancel();const speech=result?"Risk score "+result.score+" out of 100. "+result.level+" risk. "+result.signals.map(s=>s.title+". "+s.detail).join(". ")+". "+result.recommendation:info.description;const u=new SpeechSynthesisUtterance(speech);u.lang="en-IN";window.speechSynthesis.speak(u);}
 const color=result?(result.score>=75?"#f87171":result.score>=45?"#fbbf24":"#72d6aa"):"#72d6aa";
 return <main className="tool-page"><header className="tool-nav"><Link className="brand" href="/"><span className="brand-mark"><ShieldAlert size={18}/></span>scam<span className="brand-light">shield</span><b>.</b></Link><Link href="/" className="back-link"><ArrowLeft size={15}/> Back to home</Link></header>
 <section className="tool-shell"><div className="eyebrow"><i/> PRIVATE IN-BROWSER ANALYSIS</div><h1>{info.title}</h1><p className="tool-intro">{info.description}</p>
 <div className="analyzer-layout"><section className="analyzer-card"><label className="field-label" htmlFor="scan-input">Paste the content you want to check</label><textarea id="scan-input" value={value} onChange={e=>{setValue(e.target.value);setResult(null);setNote("");}} placeholder={info.placeholder} rows={8}/><div className="input-actions"><button className="button-secondary" onClick={()=>fileRef.current?.click()}><Upload size={15}/> Upload screenshot / QR</button><input ref={fileRef} hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>handleFile(e.target.files?.[0])}/><span>Text stays in this browser</span></div><button className="button-primary analyze-button" disabled={busy} onClick={()=>run()}>{busy?<LoaderCircle className="spin" size={17}/>:<ScanSearch size={17}/>}{busy?"Analyzing signals…":"Analyze now"}<ArrowUpRight size={16}/></button>{busy&&<div className="analysis-progress" aria-live="polite"><div className="analysis-progress-top"><span>Checking message patterns and threat signals</span><strong>{progress}%</strong></div><div className="analysis-progress-track"><span style={{width:progress+"%"}}/></div><small>Allowing time for local checks and available threat-intelligence lookup.</small></div>}{note&&<p className="inline-note">{note}</p>}<p className="privacy-note"><ShieldAlert size={14}/> {info.tip}</p></section>
 <aside className="what-card"><span className="mini-icon"><FileText size={18}/></span><h3>What this tool checks</h3><ul><li>Urgent or threatening language</li><li>Requests for OTPs, PINs or passwords</li><li>Payment pressure and suspicious offers</li><li>Impersonation and account-verification tactics</li><li>Hindi and Telugu scam phrases</li><li>Context-specific warning signs</li></ul><div className="what-foot"><CheckCircle2 size={15}/> No login. No scan history. No database.</div></aside></div>
 {result&&<section className="result-card" aria-live="polite"><div className="result-head"><div><div className="eyebrow"><i/> ANALYSIS COMPLETE</div><h2>Analysis findings</h2></div><button className="icon-button" onClick={speak} title="Listen to result"><Volume2 size={18}/></button></div><h3>What we noticed</h3>{result.signals.length?result.signals.map((s,i)=><article className="signal" key={s.title}><span>{String(i+1).padStart(2,"0")}</span><div><strong>{s.title}</strong><p>{s.detail}</p></div><b>+{s.weight}</b></article>):<div className="no-signals"><CheckCircle2 size={18}/> No common warning patterns were detected. This does not confirm that it is safe.</div>}<div className="recommendation"><strong><ShieldAlert size={16}/> Recommended next step</strong><p>{result.recommendation}</p></div><div className="score-summary" style={{borderColor:color}}><div><span className="eyebrow">FINAL RISK SCORE</span><strong style={{color}}>{result.score}<small>/100</small></strong><b style={{color}}>{result.level} risk indicators</b></div><div className="score-track"><span style={{width:result.score+"%",background:color}}/></div><p>This is a heuristic assessment, not a probability of fraud. An unknown or unlisted item can still be dangerous.</p></div><div className="result-actions"><button className="button-secondary" onClick={()=>navigator.clipboard?.writeText("ScamShield assessment\nScore: "+result.score+"/100 ("+result.level+")\n"+result.signals.map(s=>"- "+s.title+": "+s.detail).join("\n")+"\nRecommendation: "+result.recommendation+"\nNote: heuristic assessment, not proof.")}><Copy size={15}/> Copy report</button><button className="button-secondary" onClick={()=>{setValue("");setResult(null);setNote("");setProgress(0);}}><RotateCcw size={15}/> New analysis</button></div></section>}
 <div className="tool-disclaimer"><AlertTriangle size={15}/> ScamShield combines local pattern matching with a public domain-threat lookup for URLs. It cannot inspect message sender infrastructure or guarantee detection. A low score never guarantees safety.</div>
 <section className="report-strip"><div><strong>Think you have been scammed?</strong><p>Contact your bank or payment provider immediately. For financial cyber fraud in India, call 1930.</p></div><a href="https://cybercrime.gov.in/" target="_blank" rel="noreferrer">Official reporting portal <ArrowUpRight size={15}/></a></section>
 </section><footer className="tool-footer"><span>SCAMSHIELD · DIGITAL SAFETY FOR EVERYONE</span><Link href="/">Return to home</Link></footer></main>;
}
