import {getDb} from '../../../db';
import {responses} from '../../../db/schema';
import {isCorrect} from '../../../lib/game';
import {validSession,sameOrigin,readJson} from '../../../lib/auth';
import {desc} from 'drizzle-orm';
import {env} from 'cloudflare:workers';
export async function POST(request:Request){
 if(!sameOrigin(request)||!await validSession(request))return Response.json({error:'Please unlock the game first'},{status:403});
 try{const data=await readJson(request);
 if(typeof data.id!=='string'||!/^[0-9a-f-]{36}$/.test(data.id)||typeof data.startedAt!=='string'||!Number.isFinite(Date.parse(data.startedAt))||typeof data.accepted!=='boolean'||!Number.isInteger(data.chases)||data.chases<0||data.chases>5||!Array.isArray(data.attempts)||data.attempts.length<6||data.attempts.length>18)throw Error('invalid');
 let expected=0,count=0;
 const attempts=data.attempts.map((a:{question:number;answer:string;at:string})=>{if(a.question<0||a.question>5||a.question!==expected||typeof a.answer!=='string'||!a.answer.trim()||a.answer.length>100||typeof a.at!=='string'||!Number.isFinite(Date.parse(a.at)))throw Error('invalid');const correct=isCorrect(a.question,a.answer);count++;if(correct||count===3){expected++;count=0;}return{question:a.question,answer:a.answer,at:a.at,correct};});if(expected!==6)throw Error('invalid');
 const row={id:data.id,startedAt:data.startedAt,completedAt:new Date().toISOString(),attempts:JSON.stringify(attempts),accepted:data.accepted,chases:data.chases};
 await getDb().insert(responses).values(row).onConflictDoUpdate({target:responses.id,set:data.accepted?{accepted:true,chases:data.chases}:{startedAt:data.startedAt}});
 return Response.json({saved:true});
 }catch(e){if(e instanceof SyntaxError||(e instanceof Error&&e.message==='invalid'))return Response.json({error:'Invalid record'},{status:400});console.error(JSON.stringify({message:'Response save failed'}));return Response.json({error:'Unable to save'},{status:503});}
}
export async function GET(request:Request){
 const secret=env.ADMIN_KEY,provided=request.headers.get('authorization')?.replace(/^Bearer /,'')??'';if(!secret||!provided)return Response.json({error:'Unauthorized'},{status:401});
 const hash=async(s:string)=>new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)));const[a,b]=await Promise.all([hash(secret),hash(provided)]);let diff=0;for(let i=0;i<a.length;i++)diff|=a[i]^b[i];if(diff)return Response.json({error:'Unauthorized'},{status:401});
 try{return Response.json(await getDb().select().from(responses).orderBy(desc(responses.completedAt)).limit(100),{headers:{'Cache-Control':'no-store'}});}catch{return Response.json({error:'Unable to load responses'},{status:503});}
}

