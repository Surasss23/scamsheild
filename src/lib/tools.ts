export type ToolKind = "url" | "message" | "email" | "job" | "upi" | "phone" | "general";
export type Signal = { title:string; detail:string; weight:number };
const rules:{re:RegExp;title:string;detail:string;weight:number}[]=[
{re:/\b(urgent|immediately|act now|last warning|final notice|account.*(block|suspend|freeze))\b/i,title:"Urgency or threat language",detail:"The sender pressures you to act before you have time to verify the claim.",weight:18},
{re:/\b(otp|one.?time password|upi pin|cvv|card number|password|net.?banking password)\b/i,title:"Sensitive credential mentioned",detail:"Never share an OTP, UPI PIN, CVV or password with another person or through a link.",weight:28},
{re:/\b(kyc|pan update|aadhaar update|account verification|reactivate account)\b/i,title:"Account verification pretext",detail:"Scammers impersonate banks and services and use KYC threats to steal credentials.",weight:17},
{re:/\b(prize|winner|won|lottery|cashback|gift card|free gift|reward)\b/i,title:"Unexpected reward",detail:"Unexpected prizes can lure people into paying fees or sharing information.",weight:15},
{re:/\b(registration fee|processing fee|security deposit|training fee|pay to apply|refundable fee)\b/i,title:"Upfront payment request",detail:"Legitimate employers generally do not require candidates to pay to receive a job offer.",weight:25},
{re:/\b(police|cbi|customs|ed|court|digital arrest|arrest warrant)\b/i,title:"Authority or digital-arrest claim",detail:"Real authorities do not conduct a so-called digital arrest or demand money over video calls.",weight:25},
{re:/\b(remote access|anydesk|teamviewer|screen sharing|install this app)\b/i,title:"Remote-access request",detail:"Unsolicited remote-access apps can let criminals control your device.",weight:24},
{re:/\b(refund|parcel|courier|delivery failed|customs fee|electricity.*disconnect)\b/i,title:"Delivery, refund or utility pretext",detail:"Scammers impersonate delivery companies and utility providers to prompt payment or link clicks.",weight:13},
{re:/\b(double your money|guaranteed return|daily income|risk.?free profit)\b/i,title:"Unrealistic financial promise",detail:"Guaranteed or unusually high returns are a major warning sign.",weight:22},
{re:/\b(click here|verify now|login here|update now|claim now)\b/i,title:"External action requested",detail:"Avoid links in unexpected messages. Open the official app or type its known address yourself.",weight:10},
{re:/\b(send money|transfer now|pay now|collect request|approve payment)\b/i,title:"Payment pressure",detail:"Pause and independently verify any unexpected payment or money-collection request.",weight:17},
{re:/\b(whatsapp|telegram).{0,35}\b(job|investment|task|like and earn)\b/i,title:"Unsolicited task or messaging-app offer",detail:"Task scams often begin with small rewards and later demand deposits to unlock earnings.",weight:16}
];
export function analyzeText(input:string,kind:ToolKind){
 const text=input.trim();const signals:Signal[]=[];
 for(const r of rules)if(r.re.test(text))signals.push({title:r.title,detail:r.detail,weight:r.weight});
 if(kind==="url"){
  try{const u=new URL(text.includes("://")?text:"https://"+text);
   if(u.protocol!=="https:")signals.push({title:"No HTTPS encryption",detail:"The address does not use HTTPS. Do not enter personal or payment information.",weight:18});
   if(u.username||u.password)signals.push({title:"Credentials embedded in URL",detail:"User information inside a URL can disguise the true destination.",weight:22});
   if(u.hostname.split(".").some(x=>x.startsWith("xn--")))signals.push({title:"Internationalized domain name",detail:"Punycode domains can imitate familiar brand names. Inspect the exact spelling.",weight:17});
   if(/^\d{1,3}(\.\d{1,3}){3}$/.test(u.hostname))signals.push({title:"IP address used as host",detail:"A raw IP address instead of a recognizable domain deserves extra scrutiny.",weight:20});
   if(u.hostname.split(".").length>4)signals.push({title:"Unusually nested subdomains",detail:"The actual registered domain may differ from the brand mentioned in the address.",weight:12});
   if(/(login|verify|secure|update|kyc|bank|wallet)/i.test(u.hostname))signals.push({title:"Sensitive-service wording in domain",detail:"A brand-like or security-related word in a domain does not prove it is official.",weight:10});
  }catch{signals.push({title:"Invalid or incomplete web address",detail:"The value could not be parsed as a valid web address.",weight:18});}
 }
 if(kind==="upi"&&/\b(enter|share|tell|send).{0,20}\b(upi pin|otp)\b/i.test(text))signals.push({title:"Request to disclose UPI PIN or OTP",detail:"A UPI PIN authorizes payments. Never share it with anyone.",weight:30});
 if(kind==="upi"&&/\b(collect request|request money|approve.*upi|pay.*receive)\b/i.test(text))signals.push({title:"Possible collect request",detail:"Approving a collect request can send money from your account. Read the screen before approving.",weight:22});
 if(kind==="phone"&&/\b(otp|kyc|bank|police|cbi|parcel|loan|investment|refund)\b/i.test(text))signals.push({title:"High-risk caller claim or topic",detail:"A phone number can be spoofed. Verify claims using an official number you find independently.",weight:15});
 if(kind==="job"&&/\b(job|salary|hiring|work from home|vacancy)\b/i.test(text)&&!signals.some(s=>s.title==="Upfront payment request"))signals.push({title:"Verify the employer independently",detail:"Check the company's official careers page and contact details before sharing documents.",weight:6});
 const raw=signals.reduce((n,s)=>n+s.weight,0);const score=Math.min(98,Math.round(100*(1-Math.exp(-raw/58))));
 const level=score>=75?"High":score>=45?"Elevated":score>=20?"Caution":"Few warning signs found";
 const recommendation=score>=75?"Do not proceed. Do not click links, pay, share credentials or install apps. Verify through an official channel and report suspected fraud.":score>=45?"Pause and independently verify the sender, organization and destination before taking action.":score>=20?"Be cautious. Check the details using an official app, website or phone number you find independently.":"No strong warning pattern was found in the text provided. This is not proof that it is genuine; verify independently.";
 return {score,level,signals,recommendation};
}
export const toolInfo:Record<string,{title:string;description:string;kind:ToolKind;placeholder:string;tip:string}>={
"url-checker":{title:"Website & link checker",description:"Inspect a suspicious URL for common structural warning signs before visiting it.",kind:"url",placeholder:"Paste a website address, for example https://example.com",tip:"Local structural checks only. This tool does not visit the site or query a live malware database."},
"message-checker":{title:"SMS & message analyzer",description:"Paste a suspicious SMS or chat message to understand its warning signs.",kind:"message",placeholder:"Paste the complete SMS or chat message…",tip:"Remove personal details, phone numbers and account information before analysis."},
"whatsapp-checker":{title:"WhatsApp scam analyzer",description:"Review suspicious WhatsApp messages, forwarded warnings, payment requests and offers.",kind:"message",placeholder:"Paste the WhatsApp message…",tip:"Never share an OTP, PIN, password or payment QR with an unknown person."},
"email-checker":{title:"Email phishing analyzer",description:"Review email text, sender details and links for common phishing indicators.",kind:"email",placeholder:"Paste email text and, if available, From and Reply-To details…",tip:"Do not paste passwords, one-time codes or confidential attachments."},
"job-checker":{title:"Fake job offer checker",description:"Review recruitment messages for fee requests, unrealistic promises and impersonation patterns.",kind:"job",placeholder:"Paste the job offer or recruiter message…",tip:"Verify the vacancy on the company's official careers website. Never pay to secure an interview."},
"upi-checker":{title:"UPI & payment request checker",description:"Understand risky UPI instructions, collect requests and payment messages.",kind:"upi",placeholder:"Paste the payment message or describe what the UPI app asks you to approve…",tip:"You do not enter a UPI PIN to receive money. A PIN authorizes a debit."},
"phone-checker":{title:"Suspicious caller guide",description:"Review a number and caller claim for warning signs. This is not a caller-ID lookup.",kind:"phone",placeholder:"Enter the number and paste what the caller claimed…",tip:"A phone number can be spoofed. Call the organization back using its official published number."},
"general-checker":{title:"Scam message analyzer",description:"Analyze suspicious online messages and learn which tactics they may be using.",kind:"general",placeholder:"Paste a suspicious message, offer or payment request…",tip:"Analysis happens in your browser. Do not enter personal or financial information."},
"screenshot-analyzer":{title:"Screenshot scam analyzer",description:"Upload a screenshot to extract visible text and inspect common warning signs.",kind:"general",placeholder:"Review the extracted screenshot text here…",tip:"OCR is performed in your browser. Check extracted text for recognition mistakes."},
"qr-checker":{title:"QR code safety checker",description:"Decode a QR code locally and inspect its contents before deciding whether to open it.",kind:"url",placeholder:"Upload a QR screenshot or paste the decoded QR content…",tip:"QR contents are decoded locally. The destination is never opened automatically."}
};