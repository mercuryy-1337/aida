export const questions = [
 {title:'What’s my name?',chapter:'THE ALTER EGO',hint:'A hint: every Wonder Woman needs her…',placeholder:'Your best guess',reveal:'Superman'},
 {title:'Dogs, cats… or both?',chapter:'THE SOFT SPOT',hint:'Which furry friends have my heart?',options:['Dogs','Cats','Both'],reveal:'both'},
 {title:'My favourite flower?',chapter:'IN FULL BLOOM',hint:'Something beautiful, just like you.',placeholder:'Name that bloom',reveal:'sakura / cherry blossoms'},
 {title:'My greatest fear?',chapter:'THE KRYPTONITE',hint:'Even Superman has a weakness.',placeholder:'What gives me the shivers?',reveal:'spiders'},
 {title:'Guess my age.',chapter:'THE NUMBERS GAME',hint:'Old enough to know you’re pretty special.',placeholder:'How many trips around the sun?',reveal:'24'},
 {title:'Are we going to Cape Town?',chapter:'THE NEXT ADVENTURE',hint:'A little sea air. A little us.',options:['Yes','No'],reveal:'yes'},
];
export type Attempt={question:number;answer:string;correct:boolean;at:string};
export function isCorrect(q:number,a:string){return [['superman'],['both'],['sakura','cherry blossom','cherry blossoms','sakura / cherry blossoms'],['spider','spiders'],['24'],['yes']][q]?.includes(a.toLowerCase().trim().replace(/[.!?]+$/g,'').replace(/\s+/g,' '))??false;}
