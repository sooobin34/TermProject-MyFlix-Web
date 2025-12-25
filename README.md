# 🎬🎬 MyFlix – Term Project (Web App)

MyFlix는 Netflix UI를 모티브로 한 영화 탐색 서비스로 기존 과제 2의 WebApp을 확장하여 Mobile App(React Native) 과 함께
Firebase를 통한 인증 및 데이터 연동을 구현한 Term Project입니다.
 
본 프로젝트에서는 WebApp과 Mobile App이 동일한 Firebase 프로젝트를 공유하며 Google 로그인 및 Firestore 기반의 데이터 CRUD 흐름을 확인할 수 있습니다.

---

## 📌 프로젝트 개요

- ### 주제: 넷플릭스 데모 WebApp 확장 + Mobile App 연동

  - ### 목표:

    - WebApp + Mobile App 동시 개발

    - Firebase Authentication (Google Login)

    - Firebase Firestore를 통한 데이터 연동

    - 로그인 및 데이터 CRUD 흐름 구현

---

## 🛠 기술 스택

### Web Application

- React 18
- TypeScript
- Vite
- React Router v6
- Axios

### Mobile Application

- React Native
- Expo (Dev Client)
- Android 실기기 테스트

### Backend / Auth / DB

- Firebase Authentication (Google Login)
- Firebase Firestore

### API & Data

- TMDB(The Movie Database) API

---
## 📂 프로젝트 구성
### Web App

- 영화 탐색 및 검색

- 프로필 선택 (2인 팟)

- 영화 찜하기(Wishlist)

- Firebase Firestore 연동

### Mobile App

- Google 로그인
- Firebase Authentication 연동
- Firestore CRUD 테스트 UI
  - Create / Update / Read / Delete

📌 Web과 Mobile은 동일한 Firebase 프로젝트를 사용합니다.

---

## 📄 Web 페이지 구성
| 경로          | 설명                                  |
| ----------- | ----------------------------------- |
| `/`         | 메인 홈 화면 / 프로필 선택                    |
| `/popular`  | 인기 영화 페이지 (Table / Infinite Scroll) |
| `/search`   | 영화 검색 및 필터                          |
| `/wishlist` | 찜한 영화 목록 (Firestore 기반)             |
| `/signin`   | Google 로그인                          |

---

## 🔥 주요 기능 요약

### 인증
- Google 로그인 (Firebase Authentication)
- 로그인 상태 유지

### 데이터 연동
- Firestore 기반 Wishlist 저장
- 사용자 UID + 프로필별 데이터 관리

### CRUD 흐름
- Web App
    - Create: 영화 찜하기
    - Read: 찜 목록 조회
    - Delete: 찜 해제

- Mobile App
    - Create / Update / Read / Delete 버튼을 통한 Firestore CRUD 시연

---

## 🚀 설치 및 실행 방법


### 1️⃣ Web App 실행
```bash
git clone https://github.com/sooobin34/TermProject-MyFlix-Web.git
cd TermProject-MyFlix
npm install
npm run dev
```

브라우저 접속:
```bash
http://localhost:5173
```

### 2️⃣ Mobile App 실행
```bash
git clone https://github.com/sooobin34/TermProject-MyFlix-Web.git
cd MyFlixMobile
npm install
npx expo start --dev-client
```

- Android Dev Client 설치 후 QR 코드로 실행

### 🔐 환경 변수 설정 (TMDB API)

프로젝트 루트에 .env 파일 생성:
```bash
VITE_TMDB_API_KEY=your_tmdb_api_key_here
```

---

### 🔗 Firebase 연동

- Firebase Authentication (Google Login)
- Firebase Firestore 사용
- Web / Mobile 동일 Firebase 프로젝트 사용
- 사용자 UID 기반 데이터 분리

---

### 🎬 시연 영상

시연 영상은 과제 제출용으로 교수님께 구글 클래스룸에 링크로 제출합니다.

- Web App 시연 영상
- Mobile App 시연 영상

(로그인 → 데이터 CRUD 흐름 → Firebase 연동 확인)

---

### 👤 테스트 계정

- Google 계정 로그인 사용
- 별도 테스트 계정 생성 불필요

---

### 📌 참고 사항

- 본 프로젝트는 학습 및 과제 제출용 데모 프로젝트입니다.
- 실제 Netflix 서비스와는 무관합니다.

---

### 📎 Mobile App Repository

👉 Mobile App GitHub Repository
https://github.com/sooobin34/TermProject-MyFlix-Mobile.git
