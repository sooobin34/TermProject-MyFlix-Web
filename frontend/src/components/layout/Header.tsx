// src/components/layout/Header.tsx
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import "./header.css";
import { useAuth } from "../../hooks/useAuth";
import { useProfile } from "../../hooks/useProfile";
import { AccountMenu } from "../account/AccountMenu";

export const Header = () => {
    const { userEmail } = useAuth();
    const { activeProfile } = useProfile();

    const [isAccountOpen, setIsAccountOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false); // ✅ 모바일 메뉴 상태

    // 프로필 이름이 있으면 우선 사용, 없으면 이메일 앞부분 사용
    const displayName =
        activeProfile?.name ?? (userEmail?.split("@")[0] ?? "사용자");

    const toggleMenu = () => setIsMenuOpen((prev) => !prev);
    const closeMenu = () => setIsMenuOpen(false);

    return (
        <>
            <header className="app-header">
                {/* 왼쪽 : 햄버거 + 로고 + 네비게이션 */}
                <div className="header-left">
                    {/* ✅ 석삼자 햄버거 버튼 (모바일에서만 보이도록 CSS 처리) */}
                    <button
                        type="button"
                        className="menu-toggle"
                        onClick={toggleMenu}
                        aria-label={isMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
                    >
                        <span className="menu-bar" />
                        <span className="menu-bar" />
                        <span className="menu-bar" />
                    </button>

                    {/* ✅ 노란 달 제거 → 텍스트만 */}
                    <Link to="/" className="logo" onClick={closeMenu}>
                        <span className="logo-text">MyFlix</span>
                    </Link>

                    {/* 데스크탑/태블릿용 메인 네비게이션 */}
                    <nav className="main-nav">
                        <NavLink
                            to="/"
                            end
                            className={({ isActive }) =>
                                "nav-link" + (isActive ? " nav-link-active" : "")
                            }
                        >
                            Home
                        </NavLink>
                        <NavLink
                            to="/popular"
                            className={({ isActive }) =>
                                "nav-link" + (isActive ? " nav-link-active" : "")
                            }
                        >
                            Popular
                        </NavLink>
                        <NavLink
                            to="/search"
                            className={({ isActive }) =>
                                "nav-link" + (isActive ? " nav-link-active" : "")
                            }
                        >
                            Search
                        </NavLink>
                        <NavLink
                            to="/wishlist"
                            className={({ isActive }) =>
                                "nav-link" + (isActive ? " nav-link-active" : "")
                            }
                        >
                            Wishlist
                        </NavLink>
                    </nav>
                </div>

                {/* 오른쪽 : 인사 + 계정 설정 버튼 */}
                <div className="header-right">
                    {userEmail && (
                        <span className="header-welcome">
                            {displayName}님 환영합니다!
                        </span>
                    )}
                    <button
                        type="button"
                        className="header-account-btn"
                        onClick={() => setIsAccountOpen(true)}
                    >
                        계정 설정
                    </button>
                </div>
            </header>

            {/* ✅ 모바일용 드롭다운 네비게이션 (계정 설정 탭 제거) */}
            {isMenuOpen && (
                <nav className="mobile-nav">
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) =>
                            "mobile-nav-link" +
                            (isActive ? " mobile-nav-link-active" : "")
                        }
                        onClick={closeMenu}
                    >
                        Home
                    </NavLink>
                    <NavLink
                        to="/popular"
                        className={({ isActive }) =>
                            "mobile-nav-link" +
                            (isActive ? " mobile-nav-link-active" : "")
                        }
                        onClick={closeMenu}
                    >
                        Popular
                    </NavLink>
                    <NavLink
                        to="/search"
                        className={({ isActive }) =>
                            "mobile-nav-link" +
                            (isActive ? " mobile-nav-link-active" : "")
                        }
                        onClick={closeMenu}
                    >
                        Search
                    </NavLink>
                    <NavLink
                        to="/wishlist"
                        className={({ isActive }) =>
                            "mobile-nav-link" +
                            (isActive ? " mobile-nav-link-active" : "")
                        }
                        onClick={closeMenu}
                    >
                        Wishlist
                    </NavLink>
                </nav>
            )}

            {/* 계정 설정 패널 (공통) */}
            {isAccountOpen && (
                <AccountMenu onClose={() => setIsAccountOpen(false)} />
            )}
        </>
    );
};
