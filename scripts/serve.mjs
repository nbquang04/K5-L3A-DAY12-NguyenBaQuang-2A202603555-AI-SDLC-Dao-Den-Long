import { resolve } from 'node:path';
import { writeFile } from 'node:fs/promises';
import { loadBoard } from './leaderboard-store.mjs';
import { startServer } from './server.mjs';
try{
 if(process.argv[2]==='--export-leaderboard'){
  if(process.argv.length!==4)throw new Error('Usage: --export-leaderboard out.json');
  await writeFile(process.argv[3],JSON.stringify(await loadBoard(resolve(process.env.LEADERBOARD_PATH||'.data/leaderboard.json')),null,2)+'\n');
 }else{if(process.argv.length!==2)throw new Error('Unknown argument');const server=await startServer();console.log(`Dao Den Long: http://localhost:${server.address().port}`);}
}catch(e){console.error(e.message);process.exitCode=2;}
