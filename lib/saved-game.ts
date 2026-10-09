import {isCorrect,isInstantWin,isSharingQuestion,roundOrder,type Attempt} from './game';
import {isPaymentDate} from './payment-date';
export const SESSION_KEY='wonder-woman-game-v1';
export type SavedGame={version:1;revision:string;id:string;startedAt:string;attempts:Attempt[];stage:'quiz'|'invoice'|'payment'|'done';chases:number;paymentDate:string};
export function gameProgress(attempts:Attempt[]){
 let index=0,tries=0,complete=false;
 for(const a of attempts){
  if(complete||!a||a.question!==roundOrder[index]||typeof a.answer!=='string'||!a.answer.trim()||a.answer.length>(isSharingQuestion(a.question)?2000:100)||!Number.isFinite(Date.parse(a.at)))throw Error('Invalid saved game');
  tries++;
  if(isInstantWin(a.question,a.answer))complete=true;
  if(isSharingQuestion(a.question)||isCorrect(a.question,a.answer)||tries===3){index++;tries=0;}
  if(index===roundOrder.length)complete=true;
 }
 return {index:Math.min(index,roundOrder.length-1),complete};
}
export function parseSavedGame(raw:string):SavedGame{
 const s=JSON.parse(raw);
 if(s.version!==1||typeof s.revision!=='string'||typeof s.id!=='string'||!/^[0-9a-f-]{36}$/.test(s.id)||!Number.isFinite(Date.parse(s.startedAt))||!Array.isArray(s.attempts)||s.attempts.length>roundOrder.length*3||!Number.isInteger(s.chases)||s.chases<0||s.chases>10||typeof s.paymentDate!=='string'||!['quiz','invoice','payment','done'].includes(s.stage))throw Error('Invalid saved game');
 const progress=gameProgress(s.attempts);
 if(s.stage!=='quiz'&&!progress.complete)throw Error('Invalid saved game');
 if(s.stage==='done'&&!isPaymentDate(s.paymentDate))throw Error('Invalid saved date');
 // Restore past an answered round even if a reload interrupted its animation.
 if(progress.complete&&s.stage==='quiz')s.stage='invoice';
 return s;
}
