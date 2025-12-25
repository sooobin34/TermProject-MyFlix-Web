// src/auth/authService.ts
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";

export interface User {
    id: string; // email
    password: string; // TMDB API key (과제용)
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

export function isValidEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// 회원가입 (로컬 데모)
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

// 로그인 (로컬 데모)
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

    // 과제2 요구: 비밀번호를 TMDB API 키처럼 저장
    localStorage.setItem("TMDb-Key", user.password);

    // 기존 동작 유지 (email로 currentUser)
    localStorage.setItem("currentUser", user.id);
    localStorage.setItem("isLoggedIn", "true");

    onSuccess(user);
}

/**
 * ✅ Google 로그인 (Firebase Auth)
 * - Firestore 연동을 위해 uid를 반드시 반환/저장한다.
 */
export async function signInWithGoogle(): Promise<{
    uid: string;
    email: string;
    displayName: string;
}> {
    const provider = new GoogleAuthProvider();

    // (선택) 계정 선택 화면 강제하고 싶으면 주석 해제
    // provider.setCustomParameters({ prompt: "select_account" });

    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const email = user.email;
    if (!email) throw new Error("Google 계정에서 이메일을 가져오지 못했습니다.");

    // ✅ uid 저장 (Firestore의 users/{uid}에 사용)
    localStorage.setItem("uid", user.uid);

    // 기존 표시용 email 저장
    localStorage.setItem("currentUser", email);
    localStorage.setItem("isLoggedIn", "true");

    return { uid: user.uid, email, displayName: user.displayName ?? "" };
}

/**
 * ✅ 로그아웃 (Firebase + localStorage 정리)
 */
export async function logoutAll() {
    try {
        await signOut(auth);
    } catch {
        // Firebase 세션 없으면 무시
    }

    localStorage.removeItem("uid");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("TMDb-Key");
    localStorage.removeItem("keepLogin");
}
