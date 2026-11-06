import type { Difficulty, Lesson, Question } from '../../src/types';
export interface Finding { code: string; lesson: string; level: Difficulty; round: number; path: string; id: string; prompt: string; }
export function inspectQuestion(lesson: Lesson, level: Difficulty, round: number, path: string, q: Question): Finding[] {
 const codes: string[]=[];
 const grade=Number(lesson.semester[0]);
 const text=[q.prompt,...q.choices,q.support.studentConcept,q.support.studentHint,q.support.coreConcept,q.support.readStrategy,...q.support.steps,q.support.misconceptionTip].join(' ');
 if((!q.manipulate && (q.choices.length<2||q.choices.length>4||new Set(q.choices).size!==q.choices.length))||q.choices[q.answerIndex]!==q.answer||q.choices.filter(x=>x===q.answer).length!==1) codes.push('invalid-choices');
 if(/NaN|Infinity|undefined|null/.test(text)) codes.push('invalid-value');
 if(grade===1 && /\d+\s*[×÷]\s*\d+|\d+\s*\/\s*\d+|\d+\.\d+/.test(text)) codes.push('grade1-symbol-review');
 if(grade===1 && lesson.semester==='1-2' && lesson.unitNo===3 && q.type==='time') {
   if([...text.matchAll(/(\d+)\s*분(?!의)/g)].some(m=>![0,30].includes(Number(m[1])))) codes.push('grade1-minute-scope-review');
   if(lesson.lessonNo===5 && /30\s*분|삼십\s*분/.test(text)) codes.push('half-hour-before-lesson-review');
 }
 if(grade===2 && /÷|분자|분모|약분|통분|소수점/.test(text)) codes.push('grade2-prerequisite-review');
 if(grade===2 && [...text.matchAll(/(\d+)\s*×\s*(\d+)/g)].some(m=>Number(m[1])>9||Number(m[2])>9)) codes.push('grade2-large-product-review');
 if(grade===2 && lesson.semester==='2-1' && lesson.unitNo<6 && /\d+\s*×\s*\d+/.test(text)) codes.push('multiplication-before-unit-review');
 if(grade===3 && /\d+\/\d+\s*[+×÷-]\s*\d+\/\d+/.test(text)) codes.push('grade3-fraction-operation-review');
 if(grade<=2 && /시차|빨라지는 시계|느려지는 시계|원주율|제곱|부피|백분율/.test(text)) codes.push('early-advanced-review');
 if(path!=='game' && lesson.title!=='단원 도입' && !q.manipulate) {
   if(level==='하' && q.thinkingLevel===2) codes.push('easy-reasoning-review');
   if(level==='상' && q.thinkingLevel===0) codes.push('hard-recall-review');
 }
 return codes.map(code=>({code,lesson:lesson.id,level,round,path,id:q.id,prompt:q.prompt}));
}
