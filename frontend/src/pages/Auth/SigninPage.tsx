// src/pages/Auth/SigninPage.tsx
import { useState } from "react";
import type { FormEvent } from "react";

import "./signin.css";
import {
    isValidEmail,
    tryLogin,
    tryRegister,
    signInWithGoogle,
} from "../../auth/authService";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { FaGoogle } from "react-icons/fa";

export const SigninPage = () => {
    const [isSignup, setIsSignup] = useState(false);

    // ✅ Google 로그인 후 TMDB Key가 없을 때 입력 UI를 띄우기 위한 상태
    const [needTmdbKey, setNeedTmdbKey] = useState(false);
    const [tmdbKeyInput, setTmdbKeyInput] = useState("");

    // 로그인 폼 상태
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(true);

    // 로그인 인풋 에러 상태
    const [loginEmailError, setLoginEmailError] = useState(false);
    const [loginPasswordError, setLoginPasswordError] = useState(false);

    // 회원가입 폼 상태
    const [signEmail, setSignEmail] = useState("");
    const [signPassword, setSignPassword] = useState("");
    const [signPasswordConfirm, setSignPasswordConfirm] = useState("");
    const [agreeTerms, setAgreeTerms] = useState(false);

    // 회원가입 인풋 에러 상태
    const [signEmailError, setSignEmailError] = useState(false);
    const [signPasswordError, setSignPasswordError] = useState(false);
    const [signPasswordConfirmError, setSignPasswordConfirmError] =
        useState(false);

    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // 비밀번호 보기/숨기기 토글 상태
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showSignPassword, setShowSignPassword] = useState(false);
    const [showSignPasswordConfirm, setShowSignPasswordConfirm] =
        useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLoginSubmit = (e: FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);

        // 에러 상태 초기화
        setLoginEmailError(false);
        setLoginPasswordError(false);

        if (!isValidEmail(loginEmail)) {
            setErrorMsg("올바른 이메일 형식을 입력해주세요.");
            setLoginEmailError(true);
            return;
        }
        if (!loginPassword) {
            setErrorMsg("비밀번호(TMDB API Key)를 입력해주세요.");
            setLoginPasswordError(true);
            return;
        }

        tryLogin(
            loginEmail,
            loginPassword,
            (user) => {
                // ✅ 로컬 로그인: uid 없음 → null
                login(null, user.id);

                if (rememberMe) localStorage.setItem("keepLogin", "true");
                else localStorage.removeItem("keepLogin");

                toast.success("로그인에 성공했습니다!");
                navigate("/profiles", { replace: true });
            },
            (message) => {
                setErrorMsg(message);
                toast.error(message);
            }
        );
    };

    const handleSignupSubmit = (e: FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);

        // 에러 상태 초기화
        setSignEmailError(false);
        setSignPasswordError(false);
        setSignPasswordConfirmError(false);

        if (!isValidEmail(signEmail)) {
            setErrorMsg("올바른 이메일 형식을 입력해주세요.");
            setSignEmailError(true);
            return;
        }
        if (!signPassword) {
            setErrorMsg("비밀번호(TMDB API Key)를 입력해주세요.");
            setSignPasswordError(true);
            return;
        }
        if (signPassword !== signPasswordConfirm) {
            setErrorMsg("비밀번호 확인이 일치하지 않습니다.");
            setSignPasswordConfirmError(true);
            return;
        }
        if (!agreeTerms) {
            setErrorMsg("필수 약관에 동의해야 회원가입이 가능합니다.");
            return;
        }

        tryRegister(
            signEmail,
            signPassword,
            (user) => {
                toast.success("회원가입이 완료되었습니다. 이제 로그인해 주세요!");
                setIsSignup(false);
                setLoginEmail(user.id);
                setLoginPassword(user.password);
            },
            (message) => {
                setErrorMsg(message);
                toast.error(message);
            }
        );
    };

    // ✅ Google 로그인 핸들러
    const handleGoogleLogin = async () => {
        setErrorMsg(null);

        try {
            const gUser = await signInWithGoogle();

            // Remember me 처리
            if (rememberMe) localStorage.setItem("keepLogin", "true");
            else localStorage.removeItem("keepLogin");

            // ✅ Firebase 로그인: uid + email 저장
            login(gUser.uid, gUser.email);

            // TMDB Key 없으면 입력 UI 띄우기
            const existingKey = (localStorage.getItem("TMDb-Key") ?? "").trim();
            if (!existingKey) {
                setNeedTmdbKey(true);
                toast("TMDB API Key를 한 번만 입력하면 저장됩니다.");
                return;
            }

            toast.success("Google 로그인 성공!");
            navigate("/profiles", { replace: true });
        } catch (err: unknown) {
            console.error("Google login error:", err);
            const msg =
                err instanceof Error ? err.message : "Google 로그인 중 오류가 발생했습니다.";
            setErrorMsg(msg);
            toast.error(msg);
        }
    };

    // ✅ TMDB Key 저장 후 진행
    const handleSaveTmdbKeyAndContinue = () => {
        const trimmed = tmdbKeyInput.trim();
        if (!trimmed) {
            toast.error("TMDB API Key를 입력해주세요.");
            return;
        }

        localStorage.setItem("TMDb-Key", trimmed);
        setNeedTmdbKey(false);
        toast.success("TMDB API Key 저장 완료!");
        navigate("/profiles", { replace: true });
    };

    return (
        <div className="auth-page page-fade">
            <div className={`auth-card ${isSignup ? "mode-signup" : "mode-login"}`}>
                {/* 좌측 패널 */}
                <aside className="auth-side-panel">
                    <div>
                        <div className="auth-side-badge">
                            <span>NETFLIX DEMO</span>
                        </div>
                        <h2 className="auth-side-title">
                            나만의 넷플릭스 데모에
                            <br />
                            로그인하세요
                        </h2>
                        <p className="auth-side-text">
                            TMDB API Key를 비밀번호처럼 사용해서
                            <br />
                            인기 영화 / 검색 / 위시리스트 기능을 체험해볼 수 있어요.
                        </p>
                        <ul className="auth-side-list">
                            <li>· 추천 영화는 LocalStorage에 자동 저장</li>
                            <li>· /popular, /search, /wishlist 라우팅 지원</li>
                            <li>· 반응형 + 애니메이션까지 모두 포함</li>
                        </ul>
                    </div>
                    <p className="auth-side-footnote">
                        새로 가입해도 실제 TMDB 계정과는 연결되지 않으며,
                        <br />
                        이 데모 내에서만 사용되는 학습용 계정입니다.
                    </p>
                </aside>

                {/* 우측 메인 폼 */}
                <main className="auth-main">
                    {/* 탭 */}
                    <div className="auth-tabs">
                        <button
                            type="button"
                            className={`auth-tab ${!isSignup ? "active" : ""}`}
                            onClick={() => setIsSignup(false)}
                        >
                            로그인
                        </button>
                        <button
                            type="button"
                            className={`auth-tab ${isSignup ? "active" : ""}`}
                            onClick={() => setIsSignup(true)}
                        >
                            회원가입
                        </button>
                    </div>

                    {/* ✅ Google 로그인 버튼 */}
                    {!isSignup && (
                        <button
                            type="button"
                            className="auth-button"
                            onClick={handleGoogleLogin}
                            style={{ marginBottom: 10 }}
                        >
                            <FaGoogle style={{ marginRight: 8 }} />
                            Google로 로그인
                        </button>
                    )}

                    {/* ✅ Google 로그인 후 TMDB 키가 없으면 입력 UI 표시 */}
                    {!isSignup && needTmdbKey && (
                        <div className="auth-form" style={{ marginBottom: 12 }}>
                            <h2 style={{ marginBottom: 8 }}>TMDB API Key 입력</h2>

                            <div className="auth-field">
                                <label htmlFor="tmdb-key">TMDB API Key</label>
                                <div className="field-highlight">
                                    <input
                                        id="tmdb-key"
                                        type="password"
                                        placeholder="TMDB API Key를 입력 후 저장"
                                        value={tmdbKeyInput}
                                        onChange={(e) => setTmdbKeyInput(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                type="button"
                                className="auth-button"
                                onClick={handleSaveTmdbKeyAndContinue}
                            >
                                TMDB Key 저장하고 계속하기
                            </button>
                        </div>
                    )}

                    {/* 슬라이딩 폼 */}
                    <div className="auth-forms-wrapper">
                        <div className={`auth-forms ${isSignup ? "show-signup" : ""}`}>
                            {/* 로그인 폼 */}
                            <form className="auth-form" onSubmit={handleLoginSubmit}>
                                <h2>로그인</h2>

                                {/* 이메일 */}
                                <div className="auth-field">
                                    <label htmlFor="login-email">이메일</label>
                                    <div className="field-highlight">
                                        <input
                                            id="login-email"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={loginEmail}
                                            onChange={(e) => {
                                                setLoginEmail(e.target.value);
                                                if (loginEmailError) setLoginEmailError(false);
                                            }}
                                            className={loginEmailError ? "input-error" : ""}
                                        />
                                    </div>
                                </div>

                                {/* 비밀번호 */}
                                <div className="auth-field">
                                    <label htmlFor="login-password">비밀번호 (TMDB API Key)</label>
                                    <div className="field-highlight password-highlight">
                                        <input
                                            id="login-password"
                                            type={showLoginPassword ? "text" : "password"}
                                            placeholder="발급받은 TMDB API 키를 입력"
                                            value={loginPassword}
                                            onChange={(e) => {
                                                setLoginPassword(e.target.value);
                                                if (loginPasswordError) setLoginPasswordError(false);
                                            }}
                                            className={loginPasswordError ? "input-error" : ""}
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle-btn"
                                            onClick={() => setShowLoginPassword((prev) => !prev)}
                                            aria-label={
                                                showLoginPassword ? "비밀번호 숨기기" : "비밀번호 보기"
                                            }
                                        >
                                            {showLoginPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                                        </button>
                                    </div>
                                </div>

                                {/* Remember me */}
                                <div className="auth-field">
                                    <label className="auth-checkbox-row">
                                        <input
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                        />
                                        <span>로그인 상태 유지 (Remember me)</span>
                                    </label>
                                </div>

                                <button type="submit" className="auth-button">
                                    로그인
                                </button>

                                <div className="auth-helper">
                                    <span>아직 계정이 없나요? 위 탭에서 회원가입을 선택하세요.</span>
                                </div>
                            </form>

                            {/* 회원가입 폼 */}
                            <form className="auth-form" onSubmit={handleSignupSubmit}>
                                <h2>회원가입</h2>

                                {/* 이메일 */}
                                <div className="auth-field">
                                    <label htmlFor="sign-email">이메일</label>
                                    <div className="field-highlight">
                                        <input
                                            id="sign-email"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={signEmail}
                                            onChange={(e) => {
                                                setSignEmail(e.target.value);
                                                if (signEmailError) setSignEmailError(false);
                                            }}
                                            className={signEmailError ? "input-error" : ""}
                                        />
                                    </div>
                                </div>

                                {/* 비밀번호 */}
                                <div className="auth-field">
                                    <label htmlFor="sign-password">비밀번호 (TMDB API Key)</label>
                                    <div className="field-highlight password-highlight">
                                        <input
                                            id="sign-password"
                                            type={showSignPassword ? "text" : "password"}
                                            placeholder="TMDB API 키를 비밀번호처럼 사용"
                                            value={signPassword}
                                            onChange={(e) => {
                                                setSignPassword(e.target.value);
                                                if (signPasswordError) setSignPasswordError(false);
                                            }}
                                            className={signPasswordError ? "input-error" : ""}
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle-btn"
                                            onClick={() => setShowSignPassword((prev) => !prev)}
                                            aria-label={
                                                showSignPassword ? "비밀번호 숨기기" : "비밀번호 보기"
                                            }
                                        >
                                            {showSignPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                                        </button>
                                    </div>
                                </div>

                                {/* 비밀번호 확인 */}
                                <div className="auth-field">
                                    <label htmlFor="sign-password-confirm">비밀번호 확인</label>
                                    <div className="field-highlight password-highlight">
                                        <input
                                            id="sign-password-confirm"
                                            type={showSignPasswordConfirm ? "text" : "password"}
                                            placeholder="위와 동일한 값을 입력"
                                            value={signPasswordConfirm}
                                            onChange={(e) => {
                                                setSignPasswordConfirm(e.target.value);
                                                if (signPasswordConfirmError)
                                                    setSignPasswordConfirmError(false);
                                            }}
                                            className={signPasswordConfirmError ? "input-error" : ""}
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle-btn"
                                            onClick={() =>
                                                setShowSignPasswordConfirm((prev) => !prev)
                                            }
                                            aria-label={
                                                showSignPasswordConfirm
                                                    ? "비밀번호 숨기기"
                                                    : "비밀번호 보기"
                                            }
                                        >
                                            {showSignPasswordConfirm ? (
                                                <FaRegEyeSlash />
                                            ) : (
                                                <FaRegEye />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* 약관 동의 */}
                                <div className="auth-field">
                                    <label className="auth-checkbox-row">
                                        <input
                                            type="checkbox"
                                            checked={agreeTerms}
                                            onChange={(e) => setAgreeTerms(e.target.checked)}
                                        />
                                        <span>필수 약관에 동의합니다.</span>
                                    </label>
                                </div>

                                <button type="submit" className="auth-button">
                                    회원가입
                                </button>

                                <div className="auth-helper">
                                    <span>이미 계정이 있나요? 위 탭에서 로그인으로 전환하세요.</span>
                                </div>
                            </form>
                        </div>
                    </div>

                    {errorMsg && <div className="auth-error">{errorMsg}</div>}
                </main>
            </div>
        </div>
    );
};
