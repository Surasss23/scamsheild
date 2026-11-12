# ScamShield

A free, multilingual cyber-safety awareness platform for the public.

## Product principles
- Public access without visitor accounts.
- English by default, with Hindi and Telugu language options.
- Learn how scams work, inspect common warning signs, and find official reporting guidance.
- Privacy-first: analysis inputs are not persisted by default.
- Risk scores are indicators, not proof that something is fraudulent or safe.

## Stack
Next.js, TypeScript, Tailwind CSS, Supabase (content storage and protected admin workflows), and Vercel.

## Browser-only workflow
The project is maintained through GitHub. Connect this repository to Vercel for deployment. Configure the Supabase project URL and publishable key in Vercel Environment Variables when Supabase setup is complete.

## Environment variables
Copy the names from `.env.example` into Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

No secret/service-role key belongs in browser-visible variables.

## Safety note
The initial analyzers use transparent local heuristics. They do not query a complete threat-intelligence database and must never be described as guaranteeing a URL, message, email, phone number, or QR code is safe.
