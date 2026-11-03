# Firebase 보안 연동 적용 준비

운영에는 미적용입니다. 관리자 권한이 없다는 사용자 확인에 따라 코드·로컬 검증만 준비했습니다.

## 구성

- `database.rules.json`: 기본 거부. 새 `secureRooms`만 소유 교사 읽기, 개별 학생 답안 쓰기, 만료·학생 해제 확인을 허용합니다.
- `functions/index.mjs`: `mathTeacher` 권한과 App Check를 확인한 교사만 방을 만들고 개별 학생용 Custom Token을 발급합니다. 학생 토큰은 공용 QR에 넣지 않습니다.
- `functions/policy.mjs`: 교사·입력·방 소유권·보존기한 정책입니다.
- `../src/secureCloudRelay.ts`: 메모리에만 인증 상태를 유지하는 학생 전송 계층과 교사 페이지 조회·초기화 API입니다. 현재 게임의 기존 `/rooms` 전송에는 자동 연결하지 않습니다.
- 수업 접근 기본값 12시간, 새 방 자료 보존 기본값 30일. 배포 전 기관 정책으로 확정해야 하며 기존 `/rooms` 자료는 정리하지 않습니다.

## 로컬 검증

Java 21 이상과 Node 22를 설치하고 저장소 루트에서 실행합니다. 운영 로그인은 필요 없습니다.

```sh
pnpm install --frozen-lockfile
node --test firebase/tests/policy.test.mjs
pnpm dlx firebase-tools@15.34.2 emulators:exec --config firebase/firebase.json --project demo-math-board --only database "node --test firebase/tests/rules.test.mjs"
```

검사: 비로그인 거부, 소유 교사만 조회·답안 초기화, 학생 본인 등록·답안 쓰기와 중복 재전송, 다른 방·출석번호·학생 사칭과 덮어쓰기 거부, 불완전 답안·음수 시간 거부, 방 만료·학생 해제 즉시 차단. 정책 검사는 교사 권한과 자동 정리 대상을 따로 확인합니다.

## 관리자가 진행할 운영 전환

1. 기존 데이터 백업과 기관의 보존 기간을 먼저 확정합니다. 별도 검증용 Firebase 프로젝트를 사용합니다.
2. Authentication의 교사 로그인 공급자와 App Check를 설정합니다. 신뢰하는 관리 환경에서 승인한 UID에만 `mathTeacher: true` Custom Claim을 부여합니다. 기존 Custom Claim은 보존합니다.
3. `functions` 폴더의 의존성을 설치하고, 검증용 프로젝트에 함수·규칙을 배포합니다. 배포 프로젝트 ID를 반드시 명시합니다. 예약 함수는 유료 요금제/결제 설정과 사용량 검토가 필요할 수 있습니다.
4. 교사 로그인·방 생성·학생별 토큰 전달 화면을 연동하고 `openSecureCloud`를 전송 대기열의 전송기로 연결합니다. 교사에게만 `secureTeacherRoom`을 연결합니다. 현재 UI에는 이 인증 전환을 활성화하지 않았습니다.
5. Auth·Functions·Database를 함께 사용하는 통합 검증, 만료 후 재로그인, 학생 기기 변경·해제, 실기기 오프라인 복구를 확인합니다.
6. 운영에 전환할 때 기존 익명 REST 경로를 함께 종료합니다. **이 규칙만 현재 DB에 먼저 배포하면 기존 익명 QR 연동이 중단됩니다.**

관리자 권한·정책·개별 토큰 전달 화면의 연동 없이 운영 전환 완료로 보지 않습니다. 로컬 규칙 검사는 실제 프로젝트 설정·App Check·예약 함수 배포 성공을 검증하지 않습니다.

공식 참고: [규칙 단위 검사](https://firebase.google.com/docs/rules/unit-tests), [Custom Claims](https://firebase.google.com/docs/auth/admin/custom-claims).
