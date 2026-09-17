// src/katex-layout.css를 다시 만듭니다.
// KaTeX의 배치 규칙만 남기고 @font-face 선언은 덜어 냅니다 — 까닭은
// 만들어진 파일 맨 위에 적혀 있습니다.
import { readFileSync, writeFileSync } from 'node:fs';

export const stripFontFaces = (css) => {
  const out = [];
  let at = 0;
  for (;;) {
    const start = css.indexOf('@font-face{', at);
    if (start < 0) {
      out.push(css.slice(at));
      break;
    }
    out.push(css.slice(at, start));
    let depth = 0;
    let i = css.indexOf('{', start);
    for (;;) {
      if (css[i] === '{') depth += 1;
      else if (css[i] === '}') {
        depth -= 1;
        if (depth === 0) break;
      }
      i += 1;
    }
    at = i + 1;
  }
  return out.join('');
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const css = readFileSync('node_modules/katex/dist/katex.min.css', 'utf8');
  const { version } = JSON.parse(readFileSync('node_modules/katex/package.json', 'utf8'));
  const header = readFileSync('src/katex-layout.css', 'utf8').split('*/')[0] + '*/\n';
  writeFileSync('src/katex-layout.css', header + stripFontFaces(css) + '\n');
  console.log(`katex ${version} 배치 규칙을 다시 적었습니다.`);
}
