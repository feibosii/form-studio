export function parseRangeValue(text:string,min:number,max:number,step:number):number|null{
 const trimmed=text.trim();if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(trimmed))return null;
 const value=Number(trimmed);if(!Number.isFinite(value))return null;
 const clamped=Math.max(min,Math.min(max,value));
 return Math.max(min,Math.min(max,Number((min+Math.round((clamped-min)/step)*step).toFixed(8))));
}
