# 🚀 빠른 시작 가이드

## 1️⃣ 설치 준비물

- Node.js (v18 이상) 설치 확인
  ```bash
  node --version
  ```

- OpenAI API 키 준비
  - https://platform.openai.com/api-keys 에서 생성

## 2️⃣ 설치 단계

### Step 1: 프로젝트 폴더 이동
```bash
cd ai-native-backend-demo
```

### Step 2: 패키지 설치
```bash
npm install
```

설치되는 패키지:
- express: 백엔드 서버 프레임워크
- cors: CORS 처리
- dotenv: 환경 변수 관리
- openai: OpenAI API 클라이언트
- nodemon: 개발 모드 자동 재시작 (dev dependency)

### Step 3: 환경 변수 설정
```bash
# .env 파일 생성
cp .env.example .env

# 편집기로 열기 (Windows: notepad .env)
nano .env
```

`.env` 파일에 API 키 입력:
```
OPENAI_API_KEY=sk-your-actual-api-key-here
PORT=3000
```

⚠️ **중요**: `.env` 파일은 절대 Git에 커밋하지 마세요!

### Step 4: 서버 실행
```bash
# 일반 실행
npm start

# 또는 개발 모드 (코드 변경 시 자동 재시작)
npm run dev
```

서버가 성공적으로 시작되면 다음과 같은 메시지가 표시됩니다:
```
서버가 http://localhost:3000 에서 실행 중입니다.
```

### Step 5: 브라우저에서 확인
```
http://localhost:3000
```

## 3️⃣ 기능 테스트

### 시연 1: 상태 메시지 감정 추측
1. "상태 메시지 입력" 필드에 텍스트 입력
   - 예: "오늘 너무 행복해요!"
   - 예: "일이 너무 많아서 힘들다..."
2. "감정 추측하기" 버튼 클릭
3. AI가 분석한 감정(positive/negative/neutral) 확인

### 시연 2-1: 수동 상태 변경
1. 상단의 현재 상태 확인
2. "온라인", "회의 중", "휴가 중" 버튼 클릭
3. 상태가 즉시 변경되는 것 확인

### 시연 2-2: AI Agent 상태 변경
1. "자연어 명령 입력" 필드에 명령 입력
   - 예: "오늘은 회의 중으로 바꿔줘"
   - 예: "휴가 갈 거니까 휴가 중으로 설정해줘"
   - 예: "이제 다시 일할 수 있어. 온라인으로 해줘"
2. "AI 요청하기" 버튼 클릭
3. AI가 선택한 툴과 이유 확인
4. 상태가 자동으로 변경되는 것 확인

## 4️⃣ 문제 해결

### 🔴 "Cannot find module 'express'" 오류
```bash
npm install
```
다시 실행하여 의존성 재설치

### 🔴 "OPENAI_API_KEY is not defined" 오류
- `.env` 파일이 올바르게 생성되었는지 확인
- API 키가 정확히 입력되었는지 확인
- 서버를 재시작

### 🔴 포트 3000이 이미 사용 중
`.env` 파일에서 포트 변경:
```
PORT=3001
```
그 후 `http://localhost:3001`로 접속

### 🔴 CORS 오류
- `server.js`에 이미 CORS 설정이 포함되어 있습니다
- 브라우저 캐시를 지우고 다시 시도

### 🔴 OpenAI API 오류
- API 키가 유효한지 확인
- OpenAI 계정에 크레딧이 있는지 확인
- API 사용량 한도를 초과하지 않았는지 확인

## 5️⃣ 개발 팁

### 로그 확인
서버 콘솔에서 다음을 확인할 수 있습니다:
- 감정 추측 요청과 결과
- AI Agent 명령과 선택한 툴
- 상태 변경 로그

### 코드 수정
- `server.js`: 백엔드 로직 수정
- `public/app.js`: 프론트엔드 로직 수정
- `public/style.css`: 스타일 수정
- `public/index.html`: UI 구조 수정

개발 모드(`npm run dev`)에서 실행하면 코드 변경 시 자동으로 서버가 재시작됩니다.

## 6️⃣ 배포 시 주의사항

### 환경 변수
- `.env` 파일은 Git에 포함되지 않습니다
- 배포 환경에서 환경 변수를 별도로 설정해야 합니다

### 프로덕션 모드
```bash
NODE_ENV=production npm start
```

### 보안
- API 키를 코드에 직접 작성하지 마세요
- CORS 설정을 프로덕션 환경에 맞게 조정하세요
- Rate limiting을 고려하세요

## 7️⃣ 추가 리소스

- [Express.js 공식 문서](https://expressjs.com/)
- [OpenAI API 문서](https://platform.openai.com/docs)
- [Node.js 공식 문서](https://nodejs.org/docs/)

---

**즐거운 개발 되세요! 🎉**
