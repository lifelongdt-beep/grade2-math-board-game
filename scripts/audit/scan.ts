import { writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { auditLessons } from './lessons';
import { inspectQuestion, type Finding } from './rules';
import type { Difficulty, Question, Unit } from '../../src/types';
import { 놀이차시붙이기, 놀이차시인가 } from '../../src/data/games';
const runtime = process.argv.includes('--runtime');
const output = `output/audit/${runtime ? 'runtime' : 'static'}`;
if(runtime) await (await import('../../src/data/loadQuestionEngine')).loadQuestionEngine(auditLessons);
else await import('../../src/data/questionFactory');
const { generateQuestions, generateClassQuestions } = await import('../../src/data/questionRuntime');
const { 조작섞기, 놀이문항 } = await import('../../src/data/engine');
const summary: Array<{lesson:string;semester:string;unit:string;title:string;level:Difficulty;round:number;path:string;count:number;thinking:number[];hash:string;flags:number}>=[];
const findings: Finding[]=[];
const counts:Record<string,number>={};
const units = new Map<string,Unit>();
for(const l of auditLessons) { const key=`${l.semester}-${l.unitNo}`; if(!units.has(key)) units.set(key,{semester:l.semester,unitNo:l.unitNo,title:l.unitTitle,lessons:[]}); units.get(key)!.lessons.push(l); }
const games = 놀이차시붙이기([...units.values()]).flatMap(u=>u.lessons).filter(놀이차시인가);
const levels:Difficulty[]=['하','중','상'];
let previousSemester='';
function record(lesson:typeof auditLessons[number],level:Difficulty,round:number,path:string,qs:Question[]) {
  const issues=qs.flatMap(q=>inspectQuestion(lesson,level,round,path,q));
  if(!round&&!qs.length) issues.push({code:'empty-first-bank',lesson:lesson.id,level,round,path,id:'',prompt:''});
  const thinking=[0,0,0,0]; qs.forEach(q=>thinking[q.thinkingLevel??3]++);
  summary.push({lesson:lesson.id,semester:lesson.semester,unit:lesson.unitTitle,title:lesson.title,level,round,path,count:qs.length,thinking,hash:createHash('sha256').update(JSON.stringify(qs)).digest('hex'),flags:issues.length});
  findings.push(...issues); for(const issue of issues) counts[issue.code]=(counts[issue.code]??0)+1;
}
for(const lesson of auditLessons) {
  if(previousSemester!==lesson.semester) { previousSemester=lesson.semester; console.log(`검토 중: ${lesson.semester}`); }
  for(const level of levels) for(const round of [0,1]) {
    record(lesson,level,round,'raw',generateQuestions(lesson,level,{판:round}));
    record(lesson,level,round,'classroom',조작섞기(lesson,level,generateClassQuestions(lesson,level,{판:round}),round));
  }
}
for(const game of games) for(const level of levels) record(game,level,0,'game',놀이문항(game,level,12345));
mkdirSync(output,{recursive:true});
writeFileSync(`${output}/summary.json`,JSON.stringify(summary,null,2));
writeFileSync(`${output}/findings.json`,JSON.stringify(findings,null,2));
const result={mode:runtime?'runtime':'static',lessons:auditLessons.length,units:units.size,games:games.length,banks:summary.length,questionInstances:summary.reduce((n,r)=>n+r.count,0),rawInstances:summary.filter(r=>r.path==='raw').reduce((n,r)=>n+r.count,0),flags:counts};
writeFileSync(`${output}/result.json`,JSON.stringify(result,null,2)); console.log(JSON.stringify(result));
for(const code of Object.keys(counts)) console.log(code,JSON.stringify(findings.filter(f=>f.code===code).slice(0,8)));
