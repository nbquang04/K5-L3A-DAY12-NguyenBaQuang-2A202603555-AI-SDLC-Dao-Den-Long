const ring = (n,r,cx=0,cz=0,y=0,start=0) => Array.from({length:n},(_,i)=>{const a=(start+i*360/n)*Math.PI/180;return [cx+r*Math.cos(a),y,cz+r*Math.sin(a)];});
const maps = {
 1:{name:'Đảo Bến',radius:40,centres:[[0,0]],lanterns:[[0,0,25],[23.8,0,7.7],[14.7,0,-20.2],[-14.7,0,-20.2],[-23.8,0,7.7]],motePoints:[...ring(8,12),...ring(16,33)],shadePoints:ring(12,37,0,0,0,15),pads:[],charms:[],shadeInterval:480,maxShades:6},
 2:{name:'Đảo Cau',radius:28,centres:[[0,0],[70,0]],lanterns:[[0,0,20],[17,0,-10],[-17,0,-10],[70,0,20],[87,0,-10],[53,0,-10]],motePoints:[...ring(4,10),...ring(8,22),...ring(4,10,70),...ring(8,22,70)],shadePoints:[...ring(8,26,0,0,0,22.5),...ring(8,26,70,0,0,22.5)],pads:[{pos:[20,0,18],target:[70,0,0],vy:14,speed:24},{pos:[50,0,-18],target:[0,0,0],vy:14,speed:24}],charms:[[35,0,0]],shadeInterval:420,maxShades:8},
 3:{name:'Đảo Chuông',radius:45,centres:[[0,0]],lanterns:[[0,6,6],[18,3,10],[-18,3,10],[35,0,-10],[-35,0,-10],[20,0,-35],[-20,0,-35]],motePoints:[...ring(18,34),...Array.from({length:8},(_,i)=>{const a=(20+i*20)*Math.PI/180;return [18*Math.cos(a),3,18*Math.sin(a)];}),...ring(4,5,0,0,6,45)],shadePoints:ring(16,43),pads:[{pos:[0,3,13],target:[0,3,0],vy:12,speed:8}],charms:[[30,0,25],[-30,0,25]],shadeInterval:360,maxShades:10}
};
export function mapFor(night){if(!maps[night])throw new Error('Unknown night');return structuredClone(maps[night]);}
export function rampHeight(x,z){for(const degrees of [30,150]){const a=degrees*Math.PI/180,u=x*Math.cos(a)+z*Math.sin(a),v=-x*Math.sin(a)+z*Math.cos(a);if(u>=24-1e-9&&u<=30+1e-9&&Math.abs(v)<=1.5)return (30-u)/2;}return null;}
export function surfaces(night,x,z){
 const r=Math.hypot(x,z);
 if(night===1)return r<=40?[0]:[];
 if(night===2)return r<=28||Math.hypot(x-70,z)<=28||(x>=26&&x<=44&&Math.abs(z)<=2)?[0]:[];
 if(r>45)return [];
 const ys=[0],ramp=rampHeight(x,z);if(r>=12&&r<=24&&z>0)ys.push(3);if(r<=8)ys.push(6);if(ramp!==null)ys.push(ramp);return ys.sort((a,b)=>a-b);
}
export function moveHorizontal(night,pos,dx,dz,grounded=false){
 const result=[...pos],count=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.15));
 for(let i=0;i<count;i++){
  const x=result[0]+dx/count,z=result[2]+dz/count,ys=surfaces(night,x,z);
  if(night===3){
   if(Math.hypot(x,z)<2&&result[1]+1.7>6&&result[1]<14)break;
   const old=surfaces(night,result[0],result[2]);
   const wall=ys.some(y=>y>result[1]+.16&&!old.some(v=>Math.abs(v-y)<.01));
   if(wall)break;
  }
  result[0]=x;result[2]=z;
  if(grounded){const near=ys.filter(y=>Math.abs(y-result[1])<=.16);if(near.length)result[1]=Math.max(...near);}
 }
 return result;
}
