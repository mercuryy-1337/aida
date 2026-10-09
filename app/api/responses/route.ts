import {saveResponse,listResponses,deleteResponse} from '../../../lib/responses';
import {validateAttempts} from '../../../lib/game';
import {validSession,sameOrigin,readJson} from '../../../lib/auth';
import {isPaymentDate} from '../../../lib/payment-date';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST(request:Request){
 if(!sameOrigin(request)||!await validSession(request))return Response.json({error:'Please unlock the game first'},{status:403});
 try{const data=await readJson(request);
 if(typeof data.id!=='string'||!/^[0-9a-f-]{36}$/.test(data.id)||typeof data.startedAt!=='string'||!Number.isFinite(Date.parse(data.startedAt))||typeof data.accepted!=='boolean'||!Number.isInteger(data.chases)||data.chases<0||data.chases>10)throw Error('invalid');
 if(data.accepted&&!isPaymentDate(data.paymentDate))return Response.json({error:'Choose a valid payment date'},{status:400});
 const attempts=validateAttempts(data.attempts);
 const row={id:data.id,startedAt:data.startedAt,completedAt:new Date().toISOString(),attempts:JSON.stringify(attempts),accepted:data.accepted,chases:data.chases,paymentDate:data.accepted?data.paymentDate:null};
 await saveResponse(row);
 return Response.json({saved:true});
 }catch(e){if(e instanceof Error&&e.message==='deleted')return Response.json({error:'This response was deleted'},{status:410});if(e instanceof SyntaxError||(e instanceof Error&&e.message==='invalid'))return Response.json({error:'Invalid record'},{status:400});console.error(JSON.stringify({message:'Response save failed'}));return Response.json({error:'Unable to save'},{status:503});}
}
async function authorizedAdmin(request:Request){
 const secret=process.env.ADMIN_KEY,provided=request.headers.get('authorization')?.replace(/^Bearer /,'')??'';
 if(!secret||!provided)return false;
 const hash=async(s:string)=>new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)));
 const[a,b]=await Promise.all([hash(secret),hash(provided)]);let diff=0;for(let i=0;i<a.length;i++)diff|=a[i]^b[i];return diff===0;
}
export async function GET(request:Request){
 if(!await authorizedAdmin(request))return Response.json({error:'Unauthorized'},{status:401});
 try{return Response.json(await listResponses(),{headers:{'Cache-Control':'no-store'}});}catch{return Response.json({error:'Unable to load responses'},{status:503});}
}
export async function DELETE(request:Request){
 if(!await authorizedAdmin(request))return Response.json({error:'Unauthorized'},{status:401});
 if(!sameOrigin(request))return Response.json({error:'Forbidden'},{status:403});
 try{
  const {id}=await readJson(request);
  if(typeof id!=='string'||!/^[0-9a-f-]{36}$/.test(id))return Response.json({error:'Invalid response ID'},{status:400});
  await deleteResponse(id);
  return Response.json({deleted:true});
 }catch(e){if(e instanceof SyntaxError||(e instanceof Error&&e.message==='invalid'))return Response.json({error:'Invalid request'},{status:400});return Response.json({error:'Unable to delete response. Please retry.'},{status:503});}
}
