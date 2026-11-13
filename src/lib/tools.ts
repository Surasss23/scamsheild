export type ToolKind = "url" | "message" | "email" | "job" | "upi" | "phone" | "general";
export type Signal = { title:string; detail:string; weight:number };
const rules:{re:RegExp;title:string;detail:string;weight:number}[]=[
{re:/\b(urgent|immediately|act now|last warning|final notice|within \d+ (minute|hour)|account.{0,20}(block|suspend|freeze| बंद)|blocked today)\b/i,title:"Urgency or account-threat language",detail:"The message creates pressure or threatens account access to stop you verifying independently.",weight:22},
{re:/\b(otp|one.?time password|upi pin|cvv|card number|password|net.?banking password|atm pin|mpin)\b/i,title:"Sensitive credential mentioned",detail:"Never disclose an OTP, UPI PIN, CVV, password or banking PIN to another person.",weight:28},
{re:/\b(kyc|re.?kyc|pan update|aadhaar update|account verification|reactivate account|sim will be blocked)\b/i,title:"KYC or account-verification pretext",detail:"Fraudsters impersonate banks, telecom providers and services to steal credentials through fake KYC warnings.",weight:21},
{re:/\b(prize|winner|won|lottery|cashback|gift card|free gift|reward|lucky draw|congratulations.{0,30}(won|selected))\b/i,title:"Unexpected prize or reward",detail:"Unexpected rewards are often used to lure people into paying fees or sharing personal information.",weight:19},
{re:/\b(registration fee|processing fee|security deposit|training fee|pay to apply|refundable fee|joining fee|interview fee|先付|deposit to unlock)\b/i,title:"Upfront payment request",detail:"Requests to pay money to secure a job, prize, loan or task are a strong fraud warning sign.",weight:30},
{re:/\b(police|cbi|customs|enforcement directorate|ed officer|court|digital arrest|arrest warrant|aadhaar.{0,20}(crime|case)|parcel.{0,20}(illegal|drug))\b/i,title:"Authority impersonation or digital-arrest claim",detail:"Scammers impersonate police or agencies and use threats or fake investigations to extort money.",weight:30},
{re:/\b(remote access|anydesk|teamviewer|screen sharing|quick.?support|install this app|apk file|download apk)\b/i,title:"Remote-access app or APK request",detail:"Unsolicited remote-access tools or APK installation can expose your device, messages and banking activity.",weight:28},
{re:/\b(refund|parcel|courier|delivery failed|customs fee|electricity.{0,20}(disconnect|cut)|gas.{0,20}(subsidy|connection))\b/i,title:"Delivery, refund or utility pretext",detail:"Scammers impersonate delivery firms and utility providers to trigger urgent link clicks or payments.",weight:17},
{re:/\b(double your money|guaranteed return|daily income|risk.?free profit|100% profit|sure shot|fixed income|investment.{0,30}guaranteed)\b/i,title:"Unrealistic financial promise",detail:"Guaranteed returns, fixed profits or unusually high income claims are major investment-scam indicators.",weight:28},
{re:/\b(click here|verify now|login here|update now|claim now|tap this link|link below|open this link)\b/i,title:"Unexpected link or action request",detail:"Unexpected links can lead to credential theft or malicious downloads. Open the official app independently.",weight:15},
{re:/\b(send money|transfer now|pay now|collect request|approve payment|scan.{0,15}qr|pay.{0,20}receive|receive.{0,20}money.{0,20}pin)\b/i,title:"Payment or QR-code pressure",detail:"A QR scan, collect request or UPI PIN can authorize money leaving your account. You do not need a PIN to receive money.",weight:24},
{re:/\b(whatsapp|telegram).{0,60}\b(job|investment|task|like and earn|review and earn|rating task)\b/i,title:"Messaging-app task or investment offer",detail:"Task scams often pay a small amount first, then demand deposits to unlock tasks or withdraw fake earnings.",weight:23},
{re:/\b(work from home|part.?time job|easy money|earn.{0,20}(daily|per day|hour)|like.{0,20}subscribe.{0,20}earn|telegram.{0,30}job)\b/i,title:"Unsolicited easy-income offer",detail:"Unverified easy-income offers can lead to task fraud, identity theft or advance-fee demands.",weight:16},
{re:/\b(share.{0,20}(screen|otp|pin)|tell me.{0,20}otp|send.{0,20}otp|verify.{0,20}otp|remote.{0,20}(access|control))\b/i,title:"Request to share a code or screen",detail:"A legitimate support agent should not ask you to disclose an OTP or take control of your banking session.",weight:30},
{re:/\b(account.{0,20}(suspend|blocked|freeze)|sim.{0,20}(block|deactivat)|electricity.{0,20}(disconnect|cut)|police.{0,20}(case|arrest))\b/i,title:"Threat of service suspension or legal action",detail:"Threats paired with immediate instructions are a common social-engineering tactic.",weight:18},
{re:/\b(प्रिय ग्राहक|खाता बंद|तुरंत|अभी क्लिक|केवाईसी|ओटीपी|पिन साझा|डिजिटल अरेस्ट|पुलिस केस|इनाम|लॉटरी|रिफंड|नौकरी शुल्क|पैसे जमा)\b/i,title:"Hindi scam-language indicators",detail:"The message contains Hindi phrases commonly used in account-threat, credential-theft, prize or advance-payment scams.",weight:25},
{re:/\b(ఖాతా బ్లాక్|వెంటనే|ఓటీపీ|యూపీఐ పిన్|కేవైసీ|డిజిటల్ అరెస్ట్|బహుమతి|లాటరీ|డబ్బులు పంపండి|ఉద్యోగ రుసుము)\b/i,title:"Telugu scam-language indicators",detail:"The message contains Telugu phrases associated with account threats, credential theft or suspicious payment demands.",weight:25}
];
export function analyzeText(input:string,kind:ToolKind){
 const text=input.trim();const signals:Signal[]=[];
 for(const r of rules)if(r.re.test(text))signals.push({title:r.title,detail:r.detail,weight:r.weight});
 const urls=text.match(/(?:https?:\/\/|www\.)[^\s<>"']+|\b[a-z0-9-]+\.(?:top|xyz|click|work|support|shop|online|site|info|buzz|live|vip|icu|tk|ml|ga|cf)\b[^\s]*/gi)||[];
 if(urls.length)signals.push({title:"Link or web address included",detail:"Treat links in unexpected messages as untrusted. Check the exact domain independently and do not sign in from the message.",weight:12});
 if(/\b(bit\.ly|tinyurl|t\.co|rb\.gy|cutt\.ly|shorturl)\b/i.test(text))signals.push({title:"Shortened link",detail:"A shortened link hides its final destination. Do not open it unless independently verified.",weight:18});
 if(kind==="url"){
  try{const u=new URL(text.includes("://")?text:"https://"+text);const host=u.hostname.toLowerCase();
   if(u.protocol!=="https:")signals.push({title:"No HTTPS encryption",detail:"The address does not use HTTPS. Do not enter personal or payment information.",weight:18});
   if(u.username||u.password)signals.push({title:"Credentials embedded in URL",detail:"User information inside a URL can disguise the true destination.",weight:25});
   if(host.split(".").some(x=>x.startsWith("xn--")))signals.push({title:"Internationalized domain name",detail:"Punycode domains can imitate familiar brand names. Inspect the exact spelling.",weight:20});
   if(/^\d{1,3}(\.\d{1,3}){3}$/.test(host))signals.push({title:"IP address used as host",detail:"A raw IP address instead of a recognizable domain deserves extra scrutiny.",weight:25});
   if(host.split(".").length>4)signals.push({title:"Unusually nested subdomains",detail:"The actual registered domain may differ from the brand mentioned in the address.",weight:15});
   if(/(login|verify|secure|update|kyc|bank|wallet|support|claim)/i.test(host))signals.push({title:"Sensitive-service wording in domain",detail:"Security-related words in a domain do not prove it belongs to a real bank or service.",weight:12});
   if(/\.(top|xyz|click|work|support|shop|online|site|buzz|vip|icu)$/i.test(host))signals.push({title:"Higher-abuse top-level domain",detail:"Some low-cost domain endings are disproportionately used in abuse. This alone does not prove fraud.",weight:12});
   if(/(paytm|phonepe|googlepay|gpay|sbi|hdfc|icici|axis|amazon|flipkart|aadhaar|income.?tax).{0,25}(verify|kyc|secure|update|login)|(?:verify|kyc|secure|update|login).{0,25}(paytm|phonepe|googlepay|gpay|sbi|hdfc|icici|axis|amazon|flipkart)/i.test(host))signals.push({title:"Possible brand impersonation in domain",detail:"A brand name embedded in an unrelated domain may be an impersonation attempt. Use the brand's official app.",weight:28});
  }catch{signals.push({title:"Invalid or incomplete web address",detail:"The value could not be parsed as a valid web address.",weight:18});}
 }
 if(kind==="upi"&&/\b(enter|share|tell|send|type).{0,20}\b(upi pin|otp|mpin)\b/i.test(text))signals.push({title:"Request to disclose UPI PIN or OTP",detail:"A UPI PIN authorizes payments. Never share it with anyone.",weight:35});
 if(kind==="upi"&&/\b(collect request|request money|approve.{0,15}upi|pay.{0,20}receive|scan.{0,15}qr)\b/i.test(text))signals.push({title:"Possible UPI collect or QR request",detail:"Approving a collect request or entering your PIN can send money from your account.",weight:28});
 if(kind==="phone"&&/\b(otp|kyc|bank|police|cbi|parcel|loan|investment|refund|digital arrest)\b/i.test(text))signals.push({title:"High-risk caller claim or topic",detail:"Phone numbers and caller IDs can be spoofed. Verify through a number you find independently.",weight:18});
 if(kind==="email"){
  if(/\b(reply-to|from:).{0,100}(gmail|yahoo|outlook|protonmail)\b/i.test(text)&&/\b(bank|support|security|official|admin)\b/i.test(text))signals.push({title:"Possible mismatch between claimed brand and sender",detail:"A free email address claiming to represent a bank or official support team needs independent verification.",weight:25});
  if(/\b(attachment|invoice|document|statement).{0,30}\b(enable macros|enable content|download|open immediately)\b/i.test(text))signals.push({title:"Risky attachment instruction",detail:"Unexpected attachments and requests to enable macros can deliver malware.",weight:22});
 }
 if(kind==="job"&&/\b(job|salary|hiring|work from home|vacancy|recruiter)\b/i.test(text)&&!signals.some(s=>s.title==="Upfront payment request"))signals.push({title:"Verify the employer independently",detail:"Check the company's official careers page and contact details before sharing documents.",weight:8});
 const unique=signals.filter((s,i,a)=>a.findIndex(x=>x.title===s.title)===i);
 const raw=unique.reduce((n,s)=>n+s.weight,0);const score=Math.min(99,Math.round(100*(1-Math.exp(-raw/48))));
 const level=score>=75?"High":score>=45?"Elevated":score>=20?"Caution":"Few warning signs found";
 const recommendation=score>=75?"Do not proceed. Do not click links, pay, share credentials or install apps. Verify through an official channel and report suspected fraud.":score>=45?"Pause. Do not pay or share information until you verify the sender, organization and destination independently.":score>=20?"Be cautious. Check the details using an official app, website or phone number you find independently.":"No strong warning pattern was found in the supplied content. This is not proof that it is genuine; verify independently.";
 return {score,level,signals:unique,recommendation};
}
export async function checkUrlThreatIntel(input:string):Promise<Signal|null>{
 try{
  const parsed=new URL(input.includes("://")?input:"https://"+input);
  const response=await fetch("https://api.destroy.tools/v1/check?domain="+encodeURIComponent(parsed.hostname),{method:"GET",headers:{Accept:"application/json"},signal:AbortSignal.timeout(4500),cache:"no-store"});
  if(!response.ok)return null;
  const data=await response.json();
  if(data?.threat===true)return {title:"Threat-intelligence database match",detail:"The domain is listed by PhishDestroy threat intelligence"+(data.matched_domain?" as "+data.matched_domain:"")+". Do not visit it or enter information.",weight:100};
  if(data?.suspicious===true)return {title:"External threat-intelligence warning",detail:"PhishDestroy's domain analysis marked this domain as suspicious. This is a heuristic warning, not a confirmed blocklist match.",weight:28};
  if(data?.whitelisted===true)return {title:"External allowlist match (not a guarantee)",detail:"The domain appears on the provider's allowlist. Still verify the exact URL and requested action.",weight:0};
  return null;
 }catch{return null;}
}
export const toolInfo:Record<string,{title:string;description:string;kind:ToolKind;placeholder:string;tip:string}>={
"url-checker":{title:"Website & link checker",description:"Inspect a suspicious URL for structural warning signs and a live threat-intelligence match.",kind:"url",placeholder:"Paste a website address, for example https://example.com",tip:"The URL hostname is checked against a free external threat-intelligence service. A missing match does not mean safe."},
"message-checker":{title:"SMS & message analyzer",description:"Paste a suspicious SMS or chat message to identify common fraud tactics, including Indian-language patterns.",kind:"message",placeholder:"Paste the complete SMS or chat message…",tip:"Remove personal details, phone numbers and account information before analysis."},
"whatsapp-checker":{title:"WhatsApp scam analyzer",description:"Review suspicious WhatsApp messages, forwarded warnings, payment requests and offers.",kind:"message",placeholder:"Paste the WhatsApp message…",tip:"Never share an OTP, PIN, password or payment QR with an unknown person."},
"email-checker":{title:"Email phishing analyzer",description:"Review email text, sender details and links for common phishing indicators.",kind:"email",placeholder:"Paste email text and, if available, From and Reply-To details…",tip:"Do not paste passwords, one-time codes or confidential attachments."},
"job-checker":{title:"Fake job offer checker",description:"Review recruitment messages for fee requests, unrealistic promises and impersonation patterns.",kind:"job",placeholder:"Paste the job offer or recruiter message…",tip:"Verify the vacancy on the company's official careers website. Never pay to secure an interview."},
"upi-checker":{title:"UPI & payment request checker",description:"Understand risky UPI instructions, collect requests and payment messages.",kind:"upi",placeholder:"Paste the payment message or describe what the UPI app asks you to approve…",tip:"You do not enter a UPI PIN to receive money. A PIN authorizes a debit."},
"phone-checker":{title:"Suspicious caller guide",description:"Review a caller's number and claim for warning signs. This is not a caller-ID lookup.",kind:"phone",placeholder:"Enter the number and paste what the caller claimed…",tip:"A phone number can be spoofed. Call the organization back using its official published number."},
"general-checker":{title:"Scam message analyzer",description:"Analyze suspicious online messages and learn which tactics they may be using.",kind:"general",placeholder:"Paste a suspicious message, offer or payment request…",tip:"Analysis happens in your browser. Do not enter personal or financial information."},
"screenshot-analyzer":{title:"Screenshot scam analyzer",description:"Upload a screenshot to extract visible text and inspect common warning signs.",kind:"general",placeholder:"Review the extracted screenshot text here…",tip:"OCR is performed in your browser. Check extracted text for recognition mistakes."},
"qr-checker":{title:"QR code safety checker",description:"Decode a QR code locally and inspect its contents and destination hostname.",kind:"url",placeholder:"Upload a QR screenshot or paste the decoded QR content…",tip:"QR contents are decoded locally. The destination is never opened automatically."}
};
