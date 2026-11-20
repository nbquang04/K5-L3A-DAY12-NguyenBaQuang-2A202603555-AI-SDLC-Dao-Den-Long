import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { dirname } from 'node:path';
import { validateSubmission, rankEntries } from '../src/shared/leaderboard.mjs';
export async function loadBoard(path){
 let raw;try{raw=await readFile(path,'utf8');}catch(e){if(e.code==='ENOENT')return {entries:[]};throw e;}
 const data=JSON.parse(raw);if(!Array.isArray(data.entries))throw new Error('Corrupt leaderboard');
 for(const e of data.entries){validateSubmission(e);if(typeof e.achieved_at!=='string'||!/(Z|[+-]\d\d:\d\d)$/.test(e.achieved_at)||!Number.isFinite(Date.parse(e.achieved_at)))throw new Error('Invalid achieved_at');}
 return {entries:rankEntries(data.entries)};
}
let queue=Promise.resolve();
export function saveEntry(path,input){
 const entry={...validateSubmission(input),achieved_at:new Date().toISOString()};
 const operation=queue.catch(()=>{}).then(async()=>{const board=await loadBoard(path);board.entries=rankEntries([...board.entries,entry]);await mkdir(dirname(path),{recursive:true});const temp=`${path}.${process.pid}.tmp`;await writeFile(temp,JSON.stringify(board,null,2)+'\n');await rename(temp,path);return board;});queue=operation;return operation;
}
