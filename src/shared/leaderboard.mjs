export function validateSubmission(entry){
 if(!entry||typeof entry.name!=='string'||!/^[A-Za-z0-9_]{3,12}$/.test(entry.name))throw new Error('Name: 3-12 letters, digits or underscore');
 for(const k of ['score','seed','nights_won'])if(!Number.isSafeInteger(entry[k]))throw new Error(`Invalid ${k}`);
 if(entry.score<0||entry.nights_won<0||entry.nights_won>3)throw new Error('Invalid score or nights_won');
 return {name:entry.name,score:entry.score,nights_won:entry.nights_won,seed:entry.seed};
}
export function rankEntries(entries){return [...entries].sort((a,b)=>b.score-a.score||Date.parse(a.achieved_at)-Date.parse(b.achieved_at)).slice(0,10);}
