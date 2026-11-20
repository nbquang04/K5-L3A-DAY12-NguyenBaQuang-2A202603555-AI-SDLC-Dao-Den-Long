export function edgeIndicator(ndcX,ndcY,width,height,behind=false){
 let x=ndcX*width/2*(behind?-1:1),y=-ndcY*height/2*(behind?-1:1);if(Math.hypot(x,y)<.001)y=1;
 const scale=1/Math.max(Math.abs(x)/(width/2-35),Math.abs(y)/(height/2-35));x*=scale;y*=scale;
 return {x:width/2+x,y:height/2+y,angle:Math.atan2(y,x)};
}
