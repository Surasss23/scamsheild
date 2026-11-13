import { notFound } from "next/navigation";
import { toolInfo } from "@/lib/tools";
import { ToolAnalyzer } from "@/components/tool-analyzer";
export function generateStaticParams(){return Object.keys(toolInfo).map(slug=>({slug}));}
export default async function ToolPage({params}:{params:Promise<{slug:string}>}) {
 const {slug}=await params;
 if(!toolInfo[slug])notFound();
 return <ToolAnalyzer slug={slug}/>;
}