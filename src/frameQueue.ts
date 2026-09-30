/** Keep at most one active job and one replaceable latest job. No fixed frame-rate timer. */
export class LatestFrameQueue<T>{
 private pending:T|undefined;private active=false;private stopped=false;private frame:number|null=null;
 constructor(private run:(job:T)=>Promise<void>,private onError:(error:unknown)=>void,private schedule=(fn:FrameRequestCallback)=>requestAnimationFrame(fn),private cancel=(id:number)=>cancelAnimationFrame(id)){}
 enqueue(job:T){if(this.stopped)return;this.pending=job;this.kick();}
 private kick(){if(this.stopped||this.active||this.frame!==null||this.pending===undefined)return;this.frame=this.schedule(()=>{this.frame=null;const job=this.pending;this.pending=undefined;if(this.stopped||job===undefined)return;this.active=true;Promise.resolve().then(()=>this.run(job)).catch(this.onError).finally(()=>{this.active=false;this.kick();});});}
 dispose(){this.stopped=true;this.pending=undefined;if(this.frame!==null)this.cancel(this.frame);this.frame=null;}
}
