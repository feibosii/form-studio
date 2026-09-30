export type Effect = 'gridSubject'|'contour'|'mosaic'|'halftone'|'dither'|'pixel'|'grid'|'field'|'flow'|'shapeFill'|'nodeLabels'|'circleChain'|'chainIntersections'|'portraitWindow'|'windowOutline'|'pixelColors'|'windowPixelColors'|'customLinkColor';
export interface Settings {
 halftoneInk:string; halftonePaper:string; ditherInk:string; ditherPaper:string;
 flowColor:string; chainColor:string; fieldInk:string; fieldPaper:string; customLinkColor:boolean; linkColor:string; labelColor:string;
 pixelColors:boolean; pixelInk:string; pixelPaper:string;
 windowHalftoneInk:string; windowHalftonePaper:string; windowDitherInk:string; windowDitherPaper:string; windowFlowColor:string; windowContourColor:string; windowOutlineColor:string;
 windowPixelColors:boolean; windowPixelInk:string; windowPixelPaper:string;
 portraitWindow:boolean; windowOutline:boolean; windowStyle:string; windowX:number; windowY:number; windowWidth:number; windowHeight:number; windowDetail:number;
 blackPoint:number; shadows:number; highlights:number; noiseReduction:number;
 preset:string; ratio:string; x:number; y:number; brightness:number; contrast:number; saturation:number; grayscale:boolean;
 contour:boolean; levels:number; lineWidth:number; contourOpacity:number; contourColor:string;
 mosaic:boolean; cellSize:number; mosaicOpacity:number;
 halftone:boolean; spacing:number; dotScale:number; angle:number;
 dither:boolean; palette:string; ditherSize:number;
 pixel:boolean; pixelSize:number;
 gridSubject:boolean; grid:boolean; gridSpacing:number; gridWidth:number; gridColor:string; gridOpacity:number;
 field:boolean; seed:number; density:number; distribution:string; edgeThreshold:number; shape:string; minShape:number; maxShape:number; variation:number; hierarchy:number; shapeStroke:number; shapeFill:boolean; fieldOpacity:number; fieldColor:string; sourceOpacity:number; connection:string; linkDistance:number; linkWidth:number; linkOpacity:number;
 nodeLabels:boolean; labelCount:number; labelSize:number;
 circleChain:boolean; chainIntersections:boolean; chainCount:number; chainAngle:number; chainRadius:number; chainRatio:number; chainOpacity:number;
 flow:boolean; flowSpacing:number; flowStrength:number; flowWidth:number; flowOpacity:number;
}
export const defaults:Settings={
 gridSubject:true,blackPoint:0,shadows:0,highlights:0,noiseReduction:0,
 halftoneInk:'#000000',halftonePaper:'#ffffff',ditherInk:'#000000',ditherPaper:'#ffffff',flowColor:'#ffffff',chainColor:'#ffffff',fieldInk:'#ffffff',fieldPaper:'#000000',customLinkColor:false,linkColor:'#ffffff',labelColor:'#ffffff',pixelColors:false,pixelInk:'#000000',pixelPaper:'#ffffff',
 windowHalftoneInk:'#000000',windowHalftonePaper:'#ffffff',windowDitherInk:'#000000',windowDitherPaper:'#ffffff',windowFlowColor:'#ffffff',windowContourColor:'#ffffff',windowOutlineColor:'#ffffff',windowPixelColors:false,windowPixelInk:'#000000',windowPixelPaper:'#ffffff',
portraitWindow:false,windowOutline:true,windowStyle:'halftone',windowX:50,windowY:50,windowWidth:36,windowHeight:65,windowDetail:10,preset:'Portrait Study',ratio:'original',x:50,y:50,brightness:100,contrast:110,saturation:100,grayscale:false,contour:false,levels:14,lineWidth:0.8,contourOpacity:70,contourColor:'#ffffff',mosaic:false,cellSize:42,mosaicOpacity:100,halftone:false,spacing:10,dotScale:1,angle:30,dither:true,palette:'mono',ditherSize:2,pixel:false,pixelSize:18,grid:true,gridSpacing:80,gridWidth:1,gridColor:'#ffffff',gridOpacity:40,field:true,seed:381,density:190,distribution:'edge',edgeThreshold:36,shape:'bracket',minShape:3,maxShape:24,variation:65,hierarchy:65,shapeStroke:.9,shapeFill:false,fieldOpacity:85,fieldColor:'paper',sourceOpacity:65,connection:'proximity',linkDistance:85,linkWidth:.7,linkOpacity:45,nodeLabels:true,labelCount:16,labelSize:8,circleChain:false,chainIntersections:true,chainCount:9,chainAngle:42,chainRadius:174,chainRatio:.79,chainOpacity:75,flow:false,flowSpacing:9,flowStrength:18,flowWidth:.8,flowOpacity:85};
export const presets:Record<string,Partial<Settings>>={
 'Portrait Study':{},
 'Contour Atlas':{contour:true},
 'Geometric Portrait':{contour:false,field:true,shape:'triangle',connection:'delaunay',density:240,minShape:4,maxShape:22,fieldColor:'source',sourceOpacity:75,linkDistance:130,linkOpacity:65},
 'Orbital Study':{contour:true,levels:9,contourOpacity:30,circleChain:true,chainCount:9,chainAngle:42,chainRadius:174,chainRatio:.79},
 'Cobalt Dither':{contour:false,dither:true,saturation:0,contrast:115,palette:'cobalt'},
 'Halftone Print':{contour:false,halftone:true,saturation:0,contrast:115,spacing:10,dotScale:1.1,angle:30},
 'Pixel Memory':{contour:false,pixel:true,pixelSize:24,saturation:145,contrast:115},
 'Edge Architecture':{contour:false,field:true,shape:'bracket',connection:'orthogonal',density:350,sourceOpacity:45,saturation:0},
 'Ghost Constellation':{contour:false,field:true,shape:'circle',minShape:1,maxShape:7,connection:'proximity',density:650,sourceOpacity:12,linkDistance:65,saturation:0},
 'Delaunay Mesh':{contour:false,field:true,shape:'circle',minShape:1,maxShape:3,connection:'delaunay',linkDistance:170,density:420,sourceOpacity:25,fieldColor:'source',linkOpacity:80},
 'Radial Specimen':{contour:false,field:true,shape:'diamond',connection:'radial',linkDistance:400,density:160,distribution:'uniform',sourceOpacity:30,linkOpacity:50},
 'Ortho Blueprint':{contour:false,field:true,shape:'square',connection:'orthogonal',fieldColor:'cobalt',sourceOpacity:10,density:300,linkDistance:100,maxShape:35,linkOpacity:80},
 'Mixed Geometry':{contour:false,field:true,shape:'mixed',connection:'hybrid',distribution:'luminance',density:240,minShape:5,maxShape:35,sourceOpacity:35,fieldColor:'source'},
 'Flow Engraving':{contour:false,flow:true,flowSpacing:7,flowStrength:22,saturation:0,contrast:125},
 'Glyph Study':{contour:false,field:true,shape:'glyph',connection:'none',distribution:'uniform',density:1000,minShape:8,maxShape:18,sourceOpacity:5,fieldColor:'paper'},
 'Technical Grid':{contour:true,levels:8,contourOpacity:30,grid:true,gridSpacing:100,gridOpacity:50,saturation:55,contrast:110},
};
export const palettes:Record<string,[string,string]>={mono:['#000000','#ffffff'],cobalt:['#1736b9','#eeeddd'],ink:['#242622','#f3ecd9'],forest:['#234439','#e3e4bf'],rust:['#8d3628','#f2dfc1']};
export function presetState(name:string,current:Settings):Settings{return {...defaults,...(name==='Portrait Study'?{}:{dither:false,grid:false,gridSubject:false,field:false,nodeLabels:false,density:350,edgeThreshold:10,labelCount:12}),...presets[name],preset:name,ratio:current.ratio,x:current.x,y:current.y};}
export function dimensions(w:number,h:number,s:Settings,mult=1){const ratio=({'square':1,'portrait':4/5,'story':9/16,'landscape':16/9} as Record<string,number>)[s.ratio]||w/h;let cw=w,ch=h;if(cw/ch>ratio)cw=ch*ratio;else ch=cw/ratio;const k=Math.min(mult,10000/Math.max(cw,ch),Math.sqrt(50_000_000/(cw*ch)));return {width:Math.max(1,Math.round(cw*k)),height:Math.max(1,Math.round(ch*k))};}
export function validateFile(file:File){if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Choose a JPEG, PNG, or WebP image.');if(file.size>32*1024*1024)throw new Error('This file is too large. Choose an image under 32 MB.');if(file.size===0)throw new Error('This image is empty. Please choose another file.');}

/** Mix only effects exposed by the editor; retain the user's crop. */
export function randomizeSettings(current:Settings,random= Math.random):Settings{
 const n=(min:number,max:number)=>min+Math.floor(random()*(max-min+1));
 const pick=<T,>(values:T[])=>values[Math.floor(random()*values.length)];
 const next:Settings={...defaults,preset:'Custom',ratio:current.ratio,x:current.x,y:current.y,contour:false,field:false,dither:false,grid:false,gridSubject:false,seed:n(0,999999),
  levels:n(6,24),contourOpacity:n(30,80),density:n(120,650),edgeThreshold:n(4,16),shape:pick(['circle','square','diamond','cross','bracket','triangle','mixed','glyph']),connection:pick(['none','proximity','delaunay','chain','radial','orthogonal','hybrid']),distribution:pick(['edge','luminance','uniform']),minShape:n(2,6),maxShape:n(12,36),sourceOpacity:n(55,90),linkDistance:n(70,200),linkOpacity:n(25,70),nodeLabels:random()<.5,labelCount:n(5,18),
  chainCount:n(4,14),chainAngle:n(0,180),chainRadius:n(70,240),chainRatio:n(60,95)/100,chainOpacity:n(35,85),flowSpacing:n(5,16),flowStrength:n(8,35),flowOpacity:n(25,65),gridSpacing:n(45,160),gridOpacity:n(15,40),spacing:n(6,18),dotScale:n(70,125)/100,ditherSize:n(2,6),palette:pick(['cobalt','ink','forest','rust']),pixelSize:n(8,32)};
 const effects:('contour'|'field'|'circleChain'|'flow'|'grid')[]=['contour','field','circleChain','flow','grid'];
 for(let i=effects.length-1;i>0;i--){const j=n(0,i);[effects[i],effects[j]]=[effects[j],effects[i]];}
 const count=n(2,4);for(const key of effects.slice(0,count))next[key]=true;
 // Choose at most one base texture so one opaque effect cannot erase another.
 if(random()<.45)next[pick(['halftone','dither','pixel'] as const)]=true;
 if(!next.field)next.nodeLabels=false;
 return next;
}

export function geometryColors(s:Settings):[string,string]{return s.fieldColor==='custom'?[s.fieldInk,s.fieldPaper]:s.fieldColor==='ink'?['#000000','#ffffff']:s.fieldColor==='cobalt'?['#1f42c4','#f4f3ee']:[ '#ffffff','#000000'];}
