import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { loadBoard, saveEntry } from './leaderboard-store.mjs';
export function startServer({root=resolve('dist'),port=Number(process.env.PORT||4173),dataPath=resolve(process.env.LEADERBOARD_PATH||'.data/leaderboard.json')}={}){
 const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.txt':'text/plain'};
 const server=createServer(async(req,res)=>{
  const json=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
  try{
   const url=new URL(req.url,'http://localhost');
   if(url.pathname==='/api/leaderboard'){
    if(req.method==='GET')return json(200,await loadBoard(dataPath));
    if(req.method!=='POST')return json(405,{error:'Method not allowed'});
    if(req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host)return json(403,{error:'Origin rejected'});
    let body='';for await(const chunk of req){body+=chunk;if(body.length>4096)return json(413,{error:'Too large'});}
    try{return json(200,await saveEntry(dataPath,JSON.parse(body)));}catch(e){return json(400,{error:e.message});}
   }
   const path=resolve(root,'.'+decodeURIComponent(url.pathname));if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end();}
   const file=(await stat(path)).isDirectory()?resolve(path,'index.html'):path,data=await readFile(file);
   res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);
  }catch{if(req.url==='/api/leaderboard')return json(500,{error:'Leaderboard file unreadable; preserved'});res.writeHead(404);res.end('Not found. Run npm ci and npm run build.');}
 });return new Promise((done,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',()=>done(server));});
}
