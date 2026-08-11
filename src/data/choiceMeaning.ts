// 틀린 보기를 고른 것이 무엇을 뜻하는지 읽어 봅니다.
//
// 문항마다 보기의 뜻을 손으로 적어 두는 것이 가장 정확하지만, 문항이
// 수천 개라 그럴 수 없습니다. 대신 고른 값과 정답 사이의 관계에서
// 읽어 냅니다. 관계가 분명할 때만 말하고, 아니면 아무 말도 하지
// 않습니다 — 틀린 진단은 진단이 없는 것보다 나쁩니다.
export const meaningOfChoice = (prompt: string, chosen: string, answer: string): string | undefined => {
  const numberIn = (text: string) => {
    const found = text.match(/-?\d+/);
    return found ? Number(found[0]) : NaN;
  };
  const picked = numberIn(chosen);
  const right = numberIn(answer);
  if (!Number.isFinite(picked) || !Number.isFinite(right)) return undefined;

  const shown = (prompt.match(/\d+/g) ?? []).map(Number);
  const gap = picked - right;

  // 문제에 그대로 나온 수를 골랐습니다. 계산하지 않고 눈에 띄는 수를
  // 집은 경우입니다.
  if (shown.includes(picked) && picked !== right) {
    return '문제에 나온 수를 그대로 고름';
  }

  // 두 수를 더해야 할 곳에서 뺀 값(또는 그 반대)을 골랐습니다.
  if (shown.length >= 2) {
    const [a, b] = shown;
    if (picked === a + b && right !== a + b) return '빼야 할 곳에서 더함';
    if (picked === Math.abs(a - b) && right !== Math.abs(a - b)) return '더해야 할 곳에서 뺌';
    if (picked === a * b && right !== a * b) return '더해야 할 곳에서 곱함';
  }

  // 받아올림·받아내림한 1을 빠뜨리면 답과 10만큼 차이가 납니다.
  if (gap === -10 || gap === 10) return '받아올림이나 받아내림을 빠뜨림';

  // 자리를 한 칸 잘못 본 경우입니다(30을 300으로, 300을 30으로).
  if (right !== 0 && (picked === right * 10 || picked * 10 === right)) {
    return '자리를 한 칸 잘못 봄';
  }

  // 하나 더 세거나 덜 센 경우입니다.
  if (gap === 1 || gap === -1) return '하나 더 세거나 덜 셈';

  return undefined;
};
