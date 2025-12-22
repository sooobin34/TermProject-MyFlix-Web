// src/components/account/AccountMenu.tsx
import "./account-menu.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useProfile } from "../../hooks/useProfile";

interface AccountMenuProps {
    onClose: () => void;
}

export const AccountMenu = ({ onClose }: AccountMenuProps) => {
    const { userEmail, logout } = useAuth();
    const { activeProfile } = useProfile();
    const navigate = useNavigate();

    const handleGoProfiles = () => {
        navigate("/profiles");
        onClose();
    };

    const handleLogout = () => {
        logout();
        onClose();
        navigate("/signin", { replace: true });
    };

    const displayName =
        activeProfile?.name ?? (userEmail?.split("@")[0] ?? "사용자");

    return (
        <div className="account-menu-backdrop" onClick={onClose}>
            <div
                className="account-menu-panel"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="account-menu-header">
                    <h2>계정 설정</h2>
                    <button
                        type="button"
                        className="account-menu-close"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </header>

                <section className="account-menu-section">
                    <p className="account-menu-label">로그인 이메일</p>
                    <p className="account-menu-value">
                        {userEmail ?? "알 수 없음"}
                    </p>
                </section>

                <section className="account-menu-section">
                    <p className="account-menu-label">현재 프로필</p>
                    <p className="account-menu-value">
                        {displayName}
                    </p>
                    <button
                        type="button"
                        className="account-menu-button"
                        onClick={handleGoProfiles}
                    >
                        프로필 전환/관리하기
                    </button>
                </section>

                <section className="account-menu-section">
                    <p className="account-menu-label">구독 정보</p>
                    <p className="account-menu-desc">
                        이 데모는 실제 결제/구독과 연결되어 있지 않은 학습용 프로젝트입니다.
                    </p>
                </section>

                <footer className="account-menu-footer">
                    <button
                        type="button"
                        className="account-menu-logout"
                        onClick={handleLogout}
                    >
                        로그아웃
                    </button>
                </footer>
            </div>
        </div>
    );
};
