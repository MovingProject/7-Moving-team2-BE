# **FS-7 2팀 고급 프로젝트**

코드잇 FS 7기 2팀 고급 프로젝트 BE Github입니다.

FE Github : https://github.com/MovingProject/7-Moving-team2-FE

## **팀원 구성 및 R&R**

김제성 : 팀 리더, 스크럼 마스터, 팀 Notion 관리, FE Github 관리

김미정 : readme 작성

이다슬 : 회의록 정리, ppt 제작

이유진 : BE Github 관리

정남영 : Github 이슈 관리

정부광 : 시연 영상 제작

---

## **프로젝트 소개**

### 무빙

- 소개: 이사 소비자와 이사 전문가 매칭 서비스
  > 이사 시장에서는 무분별한 가격 책정과 무책임한 서비스 등으로 인해 정보의 투명성 및 신뢰도가 낮은 문제가 존재합니다. 이러한 문제를 해결하기 위해, 소비자가 원하는 서비스와 주거 정보를 입력하면 이사 전문가들이 견적을 제공하고 사용자가 이를 바탕으로 이사 전문가를 선정할 수 있는 매칭 서비스를 제작합니다. 이를 통해 소비자는 견적과 이사 전문가의 이전 고객들로부터의 후기를 확인하며 신뢰할 수 있는 전문가를 선택할 수 있고, 소비자와 이사 전문가 간의 간편한 매칭이 가능합니다. 실시간 채팅을 추가하여 더욱 세부적인 조율이 가능합니다.

---

## **기술 스택**

- Nest / typescript
- zod
- AWS EC2, RDS
- Nginx
- PM2
- Prisma
- PostgreSQL

---

## **팀원별 구현 기능 상세**

### 정남영

- 프로필 조회 API 구현 (#24)
- 프로필 수정(기사, 고객) 및 기사 기본정보 수정 기능 구현 (#29)
- 기사 견적 요청 조회 및 필터 기능 추가 (#39)
- 견적 요청 반려 기능 구현 (PR #67, 트랜잭션 러너 적용)
- 고객 견적 요청 유무 확인 기능 구현 (#85)
- 고객 견적 리스트 조회 API 구현 (#88)
- 기사 견적 리스트 조회 API 구현 (무한스크롤 방식, #90)
- 견적 수락(고객) 로직 구현 (채팅 내 통합)
- 견적 자동 완료 기능 구현 (node-cron 스케줄러 기반)
- 리뷰 등록 기능 구현 (#69)
- 기사 리뷰 및 평점 조회 기능 구현 (#72)
- 구글 로그인 / 회원가입 (공동작업, Mijung Kim, 정남영)
- 날씨 API 연동 기능 구현 (#95)

### 이유진

- 기반 작업
  - 백엔드 초기 세팅 (폴더 구조, 에러 핸들러, 줄바꿈 통일 등)
  - 데이터베이스 스키마 설계
  - swagger 및 zod 세팅
  - 쿠키 설정
  - 가드 세팅
- 백엔드 API
  - 회원 가입
  - 로그인 및 로그아웃
  - 리프레시 토큰 이용한 엑세스 토큰 재발급
  - 견적 요청 및 지정 견적 요청
  - 좋아요 및 좋아요 취소
  - 좋아요 목록 조회
  - 고객 / 기사 프로필 등록
  - 기사 목록 및 상세 정보 조회
  - 웹소켓 기반 실시간 채팅
  - 웹소켓 기반 알림
- DB 및 배포
  - AWS 세팅 및 관리
  - EC2 배포
- R&R
  - BE Github 총괄

###

---

## **파일 구조**

```
.
├── .DS_Store
├── .editorconfig
├── .env
├── .env.development
├── .env.example
├── .github
│   ├── ISSUE_TEMPLATE
│   │   ├── bug_report.md
│   │   └── feature_issue.md
│   └── PULL_REQUEST_TEMPLATE
│       ├── bug_pr.md
│       └── feature_pr.md
├── .gitignore
├── .prettierignore
├── .prettierrc
├── .vscode
│   └── settings.json
├── dist
│   ├── app.module 2.js
│   ├── app.module.d 2.ts
│   ├── app.module.d.ts
│   ├── app.module.js
│   ├── app.module.js 2.map
│   ├── app.module.js.map
│   ├── main 2.js
│   ├── main.d 2.ts
│   ├── main.d.ts
│   ├── main.js
│   ├── main.js 2.map
│   ├── main.js.map
│   ├── modules
│   │   ├── auth
│   │   ├── chat
│   │   ├── quotations
│   │   ├── requests
│   │   ├── reviews
│   │   ├── users
│   │   └── weather
│   ├── modules 2
│   ├── shared
│   │   ├── config
│   │   ├── constant
│   │   ├── exceptions
│   │   ├── hashing
│   │   ├── interceptors
│   │   ├── jwt
│   │   ├── middlewares
│   │   ├── pipes
│   │   ├── prisma
│   │   ├── types
│   │   └── utils
│   ├── shared 2
│   ├── tsconfig.build 2.tsbuildinfo
│   └── tsconfig.build.tsbuildinfo
├── eslint.config.mjs
├── nest-cli.json
├── package-lock.json
├── package.json
├── prisma
│   ├── migrations
│   │   ├── 20251019150743_init
│   │   ├── 20251023081505_add_chat_sequence_fields
│   │   ├── 20251028092508_update_quotation_status_enum
│   │   └── migration_lock.toml
│   └── schema.prisma
├── README.md
├── src
│   ├── .DS_Store
│   ├── @types
│   │   ├── express.d.ts
│   │   └── socket-io.d.ts
│   ├── app.module.ts
│   ├── main.ts
│   ├── modules
│   │   ├── .DS_Store
│   │   ├── auth
│   │   ├── chat
│   │   ├── quotations
│   │   ├── requests
│   │   ├── reviews
│   │   ├── users
│   │   └── weather
│   └── shared
│       ├── config
│       ├── constant
│       ├── exceptions
│       ├── hashing
│       ├── interceptors
│       ├── jwt
│       ├── middlewares
│       ├── pipes
│       ├── prisma
│       ├── types
│       └── utils
├── tsconfig.build.json
└── tsconfig.json

```

## **배포 주소**

https://7-moving-team2-fe.vercel.app/

## **프로젝트 회고**

### 팀 Notion

https://www.notion.so/26210fb7efeb80278848d8dc5aed615d?v=26210fb7efeb815bb8ee000c38d6e98c&source=copy_link

### 발표 자료

https://drive.google.com/drive/folders/1wIOyfBCJHlj5GlY1ZCT5cjAy5s_9Fkt3
