import { chromium } from 'playwright';
import { existsSync } from 'node:fs';
import { startServer } from './server.mjs';
export async function browserRuntime(options={}){
 const candidates=[process.env.BROWSER_EXECUTABLE_PATH,'C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','/usr/bin/google-chrome','/usr/bin/chromium',chromium.executablePath()].filter(Boolean);
 const executablePath=candidates.find(existsSync);if(!executablePath)throw new Error('Install Chrome/Edge or run npx playwright install chromium; BROWSER_EXECUTABLE_PATH supported');
 const server=await startServer({port:0,...options.server});let browser;
 try{browser=await chromium.launch({executablePath,headless:false,args:['--window-size=1280,720'],...options.launch});}catch(e){server.close();throw e;}
 return {browser,server,url:`http://127.0.0.1:${server.address().port}`,executablePath,async close(){await browser.close();await new Promise(done=>server.close(done));}};
}
