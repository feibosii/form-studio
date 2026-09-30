import assert from 'node:assert/strict';
import {LatestFrameQueue} from '../src/frameQueue.ts';
const settle=async()=>{for(let i=0;i<10;i++)await Promise.resolve();};
async function test(){
 for(const hz of [60,120]){
  let now=0,id=0;const frames=new Map<number,FrameRequestCallback>(),seen:number[]=[];
  const queue=new LatestFrameQueue<number>(async value=>{seen.push(value);},error=>{throw error;},fn=>{frames.set(++id,fn);return id;},id=>{frames.delete(id);});
  for(let n=0;n<hz;n++){queue.enqueue(n);now+=1000/hz;const next=[...frames.values()];frames.clear();next.forEach(fn=>fn(now));await settle();}
  assert.equal(seen.length,hz,`No timer cap at ${hz} Hz`);queue.dispose();
 }
 let id=0;const frames=new Map<number,FrameRequestCallback>(),seen:number[]=[],errors:unknown[]=[];let release:()=>void=()=>{};
 const queue=new LatestFrameQueue<number>(async value=>{seen.push(value);if(value===1)await new Promise<void>(resolve=>release=resolve);if(value===5)throw Error('test failure');},e=>errors.push(e),fn=>{frames.set(++id,fn);return id;},id=>{frames.delete(id);});
 const tick=async()=>{const next=[...frames.values()];frames.clear();next.forEach(fn=>fn(0));await settle();};
 queue.enqueue(0);queue.enqueue(1);await tick();assert.deepEqual(seen,[1]);
 queue.enqueue(2);queue.enqueue(3);queue.enqueue(4);await tick();assert.deepEqual(seen,[1]);
 release();await settle();await tick();assert.deepEqual(seen,[1,4]);
 queue.enqueue(5);await tick();assert.equal(errors.length,1);queue.enqueue(6);await tick();assert.deepEqual(seen,[1,4,5,6]);
 queue.enqueue(7);queue.dispose();await tick();assert.deepEqual(seen,[1,4,5,6]);
 console.log('PASS: 60/120 Hz scheduling, input coalescing, one in-flight render, latest final value, recovery, disposal');
}
void test();
