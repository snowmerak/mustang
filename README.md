# 머스탱 어투 변환기

> **Eeeentertainment!** (Tetra Line)  
> 《승리의 여신: 니케》 머스탱의 화려하고 과장된 엔터테인먼트 CEO 말투로 문장을 변환하는 웹 도구입니다.

---

## ✨ 특징

- **고정된 검증 프롬프트** — 12개의 Few-Shot 예시가 포함된 완성된 시스템 프롬프트 사용
- **OpenAI Compatible API** 지원 (OpenAI, Groq, Ollama, OpenRouter 등)
- **완전 한국어 UI**
- **로컬 변환 기록** (브라우저 localStorage, 최대 8개, 클릭으로 재사용)
- **머스탱 느낌**의 핫핑크 + 골드 스테이지 테마

---

## 🚀 빠른 시작

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example`을 복사해서 `.env.local`을 만드세요:

```bash
cp .env.example .env.local
```

`.env.local`을 열고 실제 값을 채웁니다.

**필수 변수**

| 변수                | 설명                              | 예시                                      |
|---------------------|-----------------------------------|-------------------------------------------|
| `OPENAI_API_KEY`    | API 키                            | `sk-...` 또는 Groq 키                     |
| `OPENAI_BASE_URL`   | OpenAI 호환 엔드포인트            | `https://api.openai.com/v1` 또는 Groq URL |
| `OPENAI_MODEL`      | 사용할 모델                       | `gpt-4o-mini`, `gemma4:e4b`               |

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 을 엽니다.

---

## 🔌 추천 Provider

### OpenAI (기본)
- 모델: `gpt-4o-mini` (가성비 최고)
- Base URL: `https://api.openai.com/v1`

### Groq (강력 추천)
속도가 매우 빠르고 무료 크레딧이 관대합니다.

```env
OPENAI_BASE_URL=https://api.groq.com/openai/v1
OPENAI_MODEL=llama-3.3-70b-versatile
```

### Ollama / LM Studio (로컬 추천)

로컬에서 돌릴 때는 **gemma4:e4b** 모델을 가장 추천합니다.  
한국어 어투 변환 품질이 준수하면서도 속도가 빠르고 가볍습니다.

#### Ollama
```env
OPENAI_BASE_URL=http://localhost:11434/v1
OPENAI_MODEL=gemma4:e4b
```

Ollama 실행 후 OpenAI 호환 서버를 켜야 합니다 (`OLLAMA_HOST`).

#### LM Studio
```env
OPENAI_BASE_URL=http://localhost:1234/v1
OPENAI_MODEL=gemma4:e4b
```

LM Studio에서 모델을 로드한 뒤, 우측 상단의 "Local Server"를 실행하면 됩니다. (기본 포트 1234)

---

## 📝 사용법

1. 입력란에 한국어 문장을 작성합니다.
2. **변환하기** 버튼을 누릅니다 (또는 Enter).
3. 머스탱 스타일 결과가 아래에 나타납니다.
4. 예시 문장들을 클릭하면 바로 입력됩니다.
5. 변환 기록은 자동으로 저장되며, "다시 사용하기"로 불러올 수 있습니다.

**변환 규칙 (간략)**
- 1문장 입력 → 1문장 출력
- 이모지/이모티콘 절대 금지
- 어미는 `Yo`, `Jyo`, `니Da` 중 하나로 깔끔하게 종료

---

## 🛠 기술 스택

- Next.js 16 + App Router
- Tailwind CSS 4 + shadcn/ui
- ky (OpenAI Compatible API 호출)
- TypeScript

---

## 📁 프로젝트 구조

```
app/
├── api/convert/route.ts   # LLM 호출 프록시 (서버 전용)
├── layout.tsx
├── page.tsx               # 메인 변환 UI
└── globals.css
lib/
├── mustangPrompt.ts       # ★ 절대 수정 금지 (검증된 시스템 프롬프트)
└── utils.ts
components/ui/             # shadcn 컴포넌트
```

**중요**: `lib/mustangPrompt.ts` 는 절대 수정하지 마세요.  
사용자가 검증한 프롬프트입니다.

---

## 🧪 테스트 체크리스트 (개발자용)

- [ ] Few-Shot #1: `007퍼스트라이트 가 뭐죠?` → `...무엇인가Yo?`
- [ ] 이모지/추가 문장 절대 발생하지 않음
- [ ] .env 없이 실행 시 명확한 에러 메시지
- [ ] 변환 기록이 새로고침 후에도 유지됨
- [ ] 모바일 레이아웃 정상

---

## 📄 라이선스

개인/팀 내부 사용 목적으로 자유롭게 사용하세요.

**Eeeentertainment!** — Tetra Line
