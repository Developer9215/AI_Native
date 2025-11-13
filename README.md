# 🤖 AI-Native 백엔드 시연 데모: 지능형 상태 관리

AI(LLM)가 백엔드 시스템에서 정보 분석 및 자율적 의사결정을 수행하는 두 가지 핵심 AI-Native 패턴을 시연하는 데모 프로젝트입니다. 개발자 친화적인 다크 테마와 실시간 API 로그 뷰어를 제공합니다.

## 📋 프로젝트 개요

### 핵심 시연 기능

#### 시연 1: 상태 메시지 감정 추측 (백엔드 → AI 호출)
- 카카오톡 프로필 스타일의 UI
- 사용자가 입력한 상태 메시지를 AI가 분석
- Positive/Negative/Neutral 감정 분류
- 백엔드에서 AI API를 호출하는 패턴 시연
- 실시간 API Request/Response 로그 표시

#### 시연 2: AI Agent 기반 상태 변경 (AI → 백엔드 호출)
- 7가지 상태 관리 (온라인, 오프라인, 회의 중, 휴가 중, 점심시간, 재택근무, 방해금지)
- 자연어 명령을 AI가 해석하여 적절한 API 선택
- 수동 상태 변경과 비교하여 AI의 자율적 의사결정 능력 강조
- 메신저 스타일 채팅 UI
- AI 툴 선택 과정 및 API 호출 로그 실시간 표시

## 🛠️ 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **AI Service**: OpenAI API (GPT-4o-mini)
- **Design**: GitHub Dark Theme 기반

## 🎨 UI 특징

- **다크 테마**: 개발자 친화적인 GitHub 스타일 다크 모드
- **분할 화면**: 왼쪽은 UI, 오른쪽은 실시간 API 로그 뷰어
- **메신저 스타일**: 카카오톡과 유사한 프로필 및 채팅 인터페이스
- **API 로그 뷰어**: 
  - JSON Syntax Highlighting
  - Request/Response 실시간 표시
  - 복사 기능
  - 타임스탬프
  - 성공/실패 상태 표시

## 📁 프로젝트 구조

```
ai-native-backend-demo/
├── server.js              # Express 백엔드 서버
├── public/
│   ├── index.html         # 프론트엔드 UI (분할 화면 + API 로그)
│   ├── style.css          # GitHub 다크 테마 스타일
│   └── app.js             # 프론트엔드 로직 + API 로그 기능
├── package.json
├── .env.example           # 환경 변수 예제
├── .gitignore
└── README.md
```

## 🚀 설치 및 실행 방법

### 1. 저장소 클론 및 의존성 설치

```bash
# 프로젝트 폴더로 이동
cd ai-native-backend-demo

# 의존성 설치
npm install
```

### 2. 환경 변수 설정

`.env.example` 파일을 복사하여 `.env` 파일을 생성하고 OpenAI API 키를 설정합니다.

```bash
# .env.example 복사
cp .env.example .env

# .env 파일 편집
nano .env
```

`.env` 파일 내용:
```
OPENAI_API_KEY=your_actual_openai_api_key_here
PORT=3000
```

### 3. 서버 실행

```bash
# 프로덕션 모드
npm start

# 개발 모드 (nodemon - 자동 재시작)
npm run dev
```

### 4. 브라우저에서 접속

```
http://localhost:3000
```

## 🎯 API 엔드포인트

### 1. 상태 조회
```http
GET /status
```
현재 상태를 조회합니다.

**응답 예시:**
```json
{
  "status": "online"
}
```

### 2. 수동 상태 변경
```http
POST /set-status
Content-Type: application/json

{
  "status": "online" | "offline" | "meeting" | "vacation" | "lunch" | "remote" | "dnd"
}
```

**응답 예시:**
```json
{
  "success": true,
  "message": "상태가 변경되었습니다.",
  "status": "meeting"
}
```

### 3. 상태 메시지 감정 추측
```http
POST /analyze-mood
Content-Type: application/json

{
  "message": "오늘 너무 행복해요!"
}
```

**응답 예시:**
```json
{
  "success": true,
  "message": "오늘 너무 행복해요!",
  "sentiment": "positive",
  "analysis": {
    "positive": true,
    "negative": false,
    "neutral": false
  }
}
```

### 4. AI Agent 상태 변경
```http
POST /agent
Content-Type: application/json

{
  "command": "오늘은 회의 중으로 바꿔줘"
}
```

**응답 예시:**
```json
{
  "success": true,
  "message": "AI Agent가 상태를 변경했습니다.",
  "command": "오늘은 회의 중으로 바꿔줘",
  "selectedTool": "setStatus_Meeting",
  "reasoning": "사용자가 회의 중 상태로 변경을 요청했습니다.",
  "status": "meeting"
}
```

## 🎨 주요 기능

### 1. 실시간 상태 표시
- 현재 상태를 시각적으로 표시
- 사이드바와 메인 화면에 동시 반영
- 상태 변경 시 애니메이션 효과

### 2. 감정 추측 시스템
- 카카오톡 프로필 스타일 UI
- 사용자의 상태 메시지를 AI가 분석
- Positive/Negative/Neutral 분류
- 감정별 이모지와 설명 표시

### 3. 7가지 상태 관리
- 🟢 온라인
- ⚫ 오프라인
- 🔴 회의 중
- 🏖️ 휴가 중
- 🍽️ 점심시간
- 🏠 재택근무
- 🔕 방해금지

### 4. 수동 상태 변경
- 버튼 클릭으로 직접 상태 변경
- 3x3 그리드 레이아웃 (7개 버튼)

### 5. AI Agent 자율 상태 변경
- 자연어 명령을 입력하면 AI가 해석
- AI가 자율적으로 적절한 툴 선택
- 선택 이유와 함께 결과 표시
- 메신저 스타일 채팅 UI

### 6. 실시간 API 로그 뷰어 ⚡
- VS Code 스타일 다크 테마
- JSON Syntax Highlighting
- Request/Response 실시간 표시
- 타임스탬프 및 성공/실패 상태
- 복사 기능 (클립보드)
- Clear 버튼

## 💡 AI-Native 패턴 설명

### 패턴 1: 백엔드 → AI 호출
```
사용자 입력 → 백엔드 → AI 분석 → 결과 반환 → UI 표시
```
백엔드가 AI를 도구로 활용하여 데이터를 분석하는 패턴

### 패턴 2: AI → 백엔드 호출
```
사용자 명령 → 백엔드 → AI 해석 → 툴 선택 → API 실행 → 결과 반환
```
AI가 자율적으로 판단하여 백엔드 API를 선택하고 실행하는 패턴

## 🧪 AI Agent 테스트 명령어 예시

```
"밥 먹으러 갈게" → 🍽️ 점심시간
"집에서 일할게" → 🏠 재택근무
"지금 집중 좀 해야해" → 🔕 방해금지
"퇴근합니다" → ⚫ 오프라인
"회의 들어갑니다" → 🔴 회의 중
"휴가 갑니다" → 🏖️ 휴가 중
"출근했어요" → 🟢 온라인
```

## 🔧 트러블슈팅

### CORS 오류
프론트엔드와 백엔드가 다른 포트에서 실행될 경우 CORS 오류가 발생할 수 있습니다. 
`server.js`에 이미 CORS 설정이 포함되어 있습니다.

### OpenAI API 키 오류
`.env` 파일의 API 키가 올바른지 확인하세요.
- OpenAI 대시보드에서 API 키 확인: https://platform.openai.com/api-keys

### 포트 충돌
기본 포트 3000이 사용 중인 경우 `.env` 파일에서 포트를 변경할 수 있습니다.

### API 로그가 표시되지 않음
- 브라우저 콘솔에서 JavaScript 오류 확인
- 네트워크 탭에서 API 호출 상태 확인
- 서버가 정상적으로 실행 중인지 확인

## 🎯 개발 목표

이 프로젝트는 다음을 시연하기 위해 만들어졌습니다:

1. **AI-Native 아키텍처**: AI가 단순한 기능이 아닌 시스템의 핵심 구성요소로 작동
2. **자율적 의사결정**: AI가 상황을 판단하고 적절한 API를 선택
3. **개발자 경험**: 실시간 API 로그로 백엔드 동작을 투명하게 표시
4. **실용성**: 실제 메신저 앱과 유사한 UI/UX

## 📝 라이센스

ISC

## 👨‍💻 개발자

AI Academy 부트캠프 프로젝트

---

**문의사항이 있으시면 이슈를 등록해주세요!** 🙋‍♂️