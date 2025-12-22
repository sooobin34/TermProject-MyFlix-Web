# 🎬 MyFlix – Netflix Demo Web App

MyFlix는 Netflix UI를 모티브로 한 영화 탐색 웹 애플리케이션입니다.
TMDB(The Movie Database) API를 활용하여 인기 영화 탐색, 검색, 찜하기 기능을 제공하며
React + Vite 기반의 SPA(Single Page Application) 구조로 구현되었습니다.

---

## 📌 프로젝트 소개

- Netflix 스타일 UI를 적용한 영화 콘텐츠 탐색 서비스

- TMDB API 기반의 실시간 영화 데이터 연동

- Table View / Infinite Scroll View 지원

- 찜하기(Wishlist) 기능을 LocalStorage로 관리

- 반응형 디자인 (Desktop / Tablet / Mobile)

---

## 🛠 사용 기술 스택

### Frontend
- React 18
- TypeScript
- Vite
- React Router v6
- Axios

### API & Data

- TMDB API
- LocalStorage (찜 목록 관리)

### Styling & UI
- CSS Modules 기반 커스텀 스타일링
- Netflix 스타일 UI/UX
- Responsive Web Design (Media Query)

---

## 📄 페이지 구성
| 경로          | 설명                                                               |
| ----------- | ---------------------------------------------------------------- |
| `/`         | 메인 홈 화면 (Featured 콘텐츠, 프로필 선택)                                   |
| `/popular`  | 인기 영화 페이지 <br/>• Table View (페이지네이션) <br/>• Infinite Scroll View |
| `/search`   | 영화 검색 페이지 <br/>• 장르 / 정렬 / 평점 필터 지원                              |
| `/wishlist` | 찜한 영화 목록 페이지 (LocalStorage 기반)                                   |
| `/signin`   | 로그인 / 프로필 선택 페이지 (Demo UI)                                       |

---

## 🚀 설치 및 실행 방법

### 1️⃣ 프로젝트 클론
```bash
git clone https://github.com/your-repo-name/myflix.git
cd myflix
```

### 2️⃣ 패키지 설치
```bash
npm install
```

### 3️⃣ 개발 서버 실행
```bash
npm run dev
```

### 브라우저에서 아래 주소로 접속:
```bash
http://localhost:5173
```

### #️⃣ 프로덕션 빌드
```bash 
npm run build
```

---


## 🔐 환경 변수 설정 (TMDB API)

### .env 파일을 프로젝트 루트에 생성 후 아래와 같이 추가:
```bash
VITE_TMDB_API_KEY=your_tmdb_api_key_here
```

---

## 🌿 Gitflow 전략 (간단 소개)

### 본 프로젝트는 Gitflow 기반 브랜치 전략을 사용합니다.

- main : 최종 배포 브랜치
- develop : 기능 통합 브랜치
- feature/* : 기능 단위 개발 브랜치
    - 예) feature/popular-page
    - 예) feature/infinite-scroll
- fix/* : 버그 수정 브랜치

### 👉 기능 개발 후 feature → develop → main 순으로 병합

---

## 📌 주요 기능 요약

- 🎞 인기 영화 탐색 (TMDB)
- 🔄 Table / Infinite Scroll View 전환
- 🔎 영화 검색 + 필터링
- ❤️ 찜하기 (Wishlist)
- ⬆️ TOP 버튼을 통한 빠른 이동
- 📱 모바일 대응 반응형 UI

---

## ✅ 참고

### 본 프로젝트는 학습 및 과제 제출용 데모 프로젝트이며 실제 Netflix 서비스와는 무관합니다.