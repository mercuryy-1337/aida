export const questions = [
 {title:'What’s my name?',chapter:'THE ALTER EGO',placeholder:'Your best guess',reveal:'Superman'},
 {title:'Dogs, cats… or both?',chapter:'THE PET QUESTION',options:['Dogs','Cats','Both'],reveal:'both'},
 {title:'My favourite flower?',chapter:'IN FULL BLOOM',placeholder:'Name that bloom',reveal:'sakura / cherry blossoms'},
 {title:'My greatest fear?',chapter:'THE KRYPTONITE',placeholder:'What gives me the shivers?',reveal:'spiders'},
 {title:'Guess my age.',chapter:'THE NUMBERS GAME',placeholder:'Your guess',reveal:'24'},
 {title:'Are we going to Cape Town?',chapter:'THE NEXT ADVENTURE',options:['Yes','No'],reveal:'yes'},
 {title:'My dream car brand?',chapter:'THE DREAM GARAGE',placeholder:'Your answer',reveal:'Porsche'},
 {title:"One random thing that you'd like me to know",chapter:'QUICK BREAK',placeholder:'Share something…',reveal:''},
];
export type Attempt={question:number;answer:string;correct:boolean|null;at:string};
// Keep question IDs stable so previously saved responses retain their labels.
export const roundOrder = [0, 7, 1, 6, 2, 3, 4, 5];
export function isSharingQuestion(q:number){return q===7;}
export const quizRoundCount=questions.length-1;
function normalize(answer:string){return answer.toLowerCase().trim().replace(/[.!?]+$/g,'').replace(/\s+/g,' ');}
export function isInstantWin(q:number,answer:string){return q===6&&/^(?:porsche )?911\s*gt3\s*rs$/.test(normalize(answer));}
export function isCorrect(q:number,a:string){return isInstantWin(q,a)||([['superman'],['both'],['sakura','cherry blossom','cherry blossoms','sakura / cherry blossoms'],['spider','spiders'],['24'],['yes'],['porsche']][q]?.includes(normalize(a))??false);}
export function validateAttempts(input:unknown):Attempt[]{
 if(!Array.isArray(input)||input.length===0||input.length>questions.length*3)throw Error('invalid');
 let round=0,count=0,won=false;
 const attempts=input.map((a)=>{
  if(won||!a||!Number.isInteger(a.question)||round>=roundOrder.length||a.question!==roundOrder[round]||typeof a.answer!=='string'||!a.answer.trim()||a.answer.length>(isSharingQuestion(a.question)?2000:100)||typeof a.at!=='string'||!Number.isFinite(Date.parse(a.at)))throw Error('invalid');
  const correct=isSharingQuestion(a.question)?null:isCorrect(a.question,a.answer);count++;
  if(isInstantWin(a.question,a.answer))won=true;
  if(isSharingQuestion(a.question)||correct||count===3){round++;count=0;}
  return {question:a.question,answer:a.answer,at:a.at,correct};
 });
 if(!won&&round!==roundOrder.length)throw Error('invalid');
 return attempts;
}
