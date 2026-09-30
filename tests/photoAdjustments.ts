import assert from 'node:assert/strict';
import {defaults} from '../src/state.ts';
import {adjustPhoto,adjustTones,reduceNoise} from '../src/photoAdjustments.ts';
const neutral={...defaults,contrast:100};
const pixel=(v:number)=>new Uint8ClampedArray([v,v,v,177]);
const original=pixel(87),unchanged=original.slice();adjustTones(unchanged,neutral);assert.deepEqual(unchanged,original);
for(const [key,input,direction] of [['blackPoint',80,-1],['shadows',40,1],['highlights',210,-1]] as const){
 const data=pixel(input);adjustTones(data,{...neutral,[key]:key==='highlights'?-70:70});assert.ok((data[0]-input)*direction>0);assert.equal(data[3],177);
}
const w=12,h=520,raw=new Uint8ClampedArray(w*h*4);
for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=(x<w/2?50:205)+((x+y)%2?8:-8);raw.set([v,v,v,255],i);}
const denoised=raw.slice();reduceNoise(denoised,w,h,100);
const lifted=pixel(0);adjustTones(lifted,{...neutral,blackPoint:-100});assert.ok(lifted[0]>0);assert.equal(lifted[3],177);
const sharpened=raw.slice();reduceNoise(sharpened,w,h,-100);assert.ok(Math.abs(sharpened[0]-50)>Math.abs(raw[0]-50));
const untouched=raw.slice();reduceNoise(untouched,w,h,0);assert.deepEqual(untouched,raw);
assert.ok(Math.abs(denoised[0]-50)<Math.abs(raw[0]-50));
assert.ok(denoised[(w/2)*4]-denoised[(w/2-1)*4]>130,'Preserve strong edges');
for(const amount of [-100,75]){
const s={...neutral,noiseReduction:amount,blackPoint:12,shadows:30,highlights:-20};
const expected=raw.slice();reduceNoise(expected,w,h,s.noiseReduction);adjustTones(expected,s);
const actual=raw.slice();
const context={getImageData(_x:number,y:number,width:number,height:number){return {data:actual.slice(y*width*4,(y+height)*width*4),height};},putImageData(image:any,_x:number,y:number,_dx:number,dy:number,width:number,height:number){actual.set(image.data.subarray(dy*width*4,(dy+height)*width*4),(y+dy)*width*4);}};
adjustPhoto(context as any,w,h,s);assert.deepEqual(actual,expected,'Strip boundaries must match untiled processing');
}
console.log('Photo adjustments passed: neutral defaults, tonal direction, alpha, edge preservation, and seamless full-resolution strips.');
