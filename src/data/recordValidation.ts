import type { AnswerRecord, LearningSupport } from '../types';
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const strings = (v: unknown) => Array.isArray(v) && v.length <= 1000 && v.every(x => typeof x === 'string');
const tags = new Set(['number', 'placeValue', 'addition', 'subtraction', 'shape', 'solid', 'measurement', 'classification', 'multiplication', 'time', 'data', 'pattern', 'range', 'rounding', 'fraction', 'decimal', 'congruence', 'average', 'possibility', 'mixedCalc', 'divisor', 'correspondence', 'fractionCompare', 'fractionAdd', 'area', 'estimate', 'division', 'angle', 'transform', 'fractionDiv', 'decimalDiv', 'ratio', 'volume']);
export const validSupport = (v: unknown): v is LearningSupport => object(v)
  && ['studentConcept', 'studentHint', 'coreConcept', 'readStrategy', 'misconceptionTip', 'textbookConnection', 'selfCheck'].every(k => typeof v[k] === 'string') && strings(v.steps);
export const validSemester = (v: unknown) => typeof v === 'string' && /^[1-6]-[12]$/.test(v);
export const finiteNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0;
export const validJsonTree = (v: unknown, depth = 0): boolean => {
  if (depth > 30) return false;
  if (typeof v === 'number') return Number.isFinite(v);
  if (v === null || ['string', 'boolean'].includes(typeof v)) return true;
  if (Array.isArray(v)) return v.length <= 10000 && v.every(x => validJsonTree(x, depth + 1));
  return object(v) && Object.values(v).every(x => x === undefined || validJsonTree(x, depth + 1));
};
export const validAnswer = (v: unknown): v is AnswerRecord => object(v)
  && ['id', 'playerName', 'questionId', 'lessonId', 'unitTitle', 'lessonTitle', 'prompt', 'answer', 'chosen', 'explanation', 'misconception', 'type', 'strategy'].every(k => typeof v[k] === 'string')
  && (v.id as string).length > 0 && (v.id as string).length <= 300
  && finiteNumber(v.playerId) && Number.isInteger(v.playerId)
  && strings(v.choices) && ['하', '중', '상'].includes(v.difficulty as string)
  && typeof v.correct === 'boolean' && validSupport(v.support)
  && tags.has(v.type as string)
  && typeof v.answeredAt === 'string' && Number.isFinite(Date.parse(v.answeredAt))
  && finiteNumber(v.responseMs) && finiteNumber(v.attempts) && Number.isInteger(v.attempts) && v.attempts >= 1
  && (v.hintUsed === undefined || typeof v.hintUsed === 'boolean')
  && (v.hintKinds === undefined || (Array.isArray(v.hintKinds) && v.hintKinds.every(k => ['text', 'steps', 'interactive'].includes(k))))
  && (v.lessonContext === undefined || (object(v.lessonContext) && validSemester(v.lessonContext.semester) && ['id', 'title', 'unitTitle'].every(k => typeof (v.lessonContext as Record<string, unknown>)[k] === 'string') && finiteNumber(v.lessonContext.unitNo) && finiteNumber(v.lessonContext.lessonNo)))
  && validJsonTree(v);
