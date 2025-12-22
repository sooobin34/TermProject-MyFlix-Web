// src/auth/authService.ts

export interface User {
    id: string;        // email
    password: string;  // TMDB API key (과제용)
}

const USERS_KEY = "users";

function loadUsers(): User[] {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    try {
        return JSON.parse(raw) as User[];
    } catch {
        return [];
    }
}

function saveUsers(users: User[]) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// 이메일 형식 간단 체크
export function isValidEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// 회원가입
export function tryRegister(
    email: string,
    password: string,
    onSuccess: (user: User) => void,
    onFail: (message: string) => void
) {
    const users = loadUsers();
    const exists = users.some((u) => u.id === email);
    if (exists) {
        onFail("이미 가입된 이메일입니다.");
        return;
    }

    const newUser: User = { id: email, password };
    users.push(newUser);
    saveUsers(users);
    onSuccess(newUser);
}

// 로그인
export function tryLogin(
    email: string,
    password: string,
    onSuccess: (user: User) => void,
    onFail: (message: string) => void
) {
    const users = loadUsers();
    const user = users.find((u) => u.id === email && u.password === password);

    if (!user) {
        onFail("이메일 또는 비밀번호가 올바르지 않습니다.");
        return;
    }

    // 과제 요구: 비밀번호를 TMDB API 키처럼 저장
    localStorage.setItem("TMDb-Key", user.password);
    localStorage.setItem("currentUser", user.id);
    localStorage.setItem("isLoggedIn", "true");

    onSuccess(user);
}
