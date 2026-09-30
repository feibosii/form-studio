import {presets,type Settings} from './state';
type Registry={registerTool:(tool:{name:string,title:string,description:string,inputSchema:object,annotations:object,execute:(input:any)=>unknown},options:{signal:AbortSignal})=>unknown};
export function registerEditorTools(get:()=>{s:Settings,source:{width:number,height:number}|null},apply:(name:string)=>void){
 const registry=(document as Document&{modelContext?:Registry}).modelContext;
 if(!registry?.registerTool)return;
 const lifecycle=new AbortController();
 try{registry.registerTool({name:'read_editor',title:'Read editor settings',description:'Read the current local photo editor settings and source dimensions. Does not transmit image pixels.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>{const v=get();return {settings:v.s,source:v.source?{width:v.source.width,height:v.source.height}:null};}},{signal:lifecycle.signal});
 registry.registerTool({name:'apply_photo_preset',title:'Apply photo preset',description:'Apply an existing visual preset to the local artwork while preserving its source and crop. Can be undone.',inputSchema:{type:'object',properties:{name:{type:'string',enum:Object.keys(presets)}},required:['name'],additionalProperties:false},annotations:{readOnlyHint:false},execute:async(input)=>{if(!input||typeof input.name!=='string'||!Object.hasOwn(presets,input.name)||Object.keys(input).some(k=>k!=='name'))throw new Error('Choose a valid named photo preset.');apply(input.name);await new Promise(resolve=>setTimeout(resolve,80));return {preset:input.name,status:'applied'};}},{signal:lifecycle.signal});}catch{lifecycle.abort();}
 return()=>lifecycle.abort();
}
