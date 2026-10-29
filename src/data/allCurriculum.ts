import { 놀이차시붙이기 } from './games';
import { curriculum as curriculum2 } from './curriculum';
import { curriculum5 } from './curriculum5';
import { curriculum51 } from './curriculum51';
import { curriculum31 } from './curriculum31';
import { curriculum11 } from './curriculum11';
import { curriculum12 } from './curriculum12';
import { curriculum41 } from './curriculum41';
import { curriculum42 } from './curriculum42';
import { curriculum61 } from './curriculum61';
import { curriculum62 } from './curriculum62';
import { curriculum32 } from './curriculum32';
import type { Unit } from '../types';

// 1~6학년 모든 학기의 단원과 차시입니다. 놀이 화면(App)과 교사용 학습 기록장이 함께 씁니다.
// 학년마다 파일을 따로 두어 각 학년 문항을 지키는 시험이 자기 학년만 훑게 하고, 여기서만 이어 붙입니다.
// 단원마다 맨 앞에 놀이 차시를 붙입니다(data/games). 교과 차시 자료는 그대로 둡니다.
export const curriculum: Unit[] = 놀이차시붙이기([...curriculum11, ...curriculum12, ...curriculum2, ...curriculum31, ...curriculum32, ...curriculum41, ...curriculum42, ...curriculum51, ...curriculum5, ...curriculum61, ...curriculum62]);
