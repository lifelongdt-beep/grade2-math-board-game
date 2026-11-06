import { readFileSync, writeFileSync } from 'node:fs';
const banks = JSON.parse(readFileSync('output/audit/static/summary.json', 'utf8'));
const result = JSON.parse(readFileSync('output/audit/static/result.json', 'utf8'));
const semesters = [...new Set(banks.map(b => b.semester))].map(semester => {
  const rows = banks.filter(b => b.semester === semester);
  return { semester, lessons: new Set(rows.filter(b => b.path === 'raw').map(b => b.lesson)).size,
    games: new Set(rows.filter(b => b.path === 'game').map(b => b.lesson)).size,
    banks: rows.length, questionInstances: rows.reduce((n,b) => n+b.count,0) };
});
const lessons = [...new Set(banks.map(b => b.lesson))].map(lesson => {
  const rows = banks.filter(b => b.lesson === lesson);
  return { lesson, semester: rows[0].semester, unit: rows[0].unit, title: rows[0].title,
    banks: rows.map(({level,round,path,count,thinking}) => ({level,round,path,count,thinking})) };
});
const { lessons: lessonCount, ...counts } = result;
const header = JSON.stringify({
  date: '2026-11-06', scope: 'generated samples, not every possible seed or independently solved answer',
  ...counts, lessonCount, semesters,
}, null, 2);
// 한 차시를 한 줄에 기록하여 생성 결과를 비교하기 쉽게 유지합니다.
writeFileSync('docs/전학년-검토-coverage.json', `${header.slice(0,-2)},\n  "lessons": [\n${lessons.map(l => `    ${JSON.stringify(l)}`).join(',\n')}\n  ]\n}\n`);
console.log(JSON.stringify({semesters:semesters.length,lessons:lessons.length,...result}));
