// src/pages/Profiles/ProfileSelectPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../../hooks/useProfile";
import "./profile-select.css";
import { FaPen, FaTrash } from "react-icons/fa";

type ModalMode = "add" | "edit" | null;

const COLOR_OPTIONS = ["#e50914", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7"];
const EMOJI_OPTIONS = ["😀", "😎", "👻", "🐱", "🐶", "🍿"];

export const ProfileSelectPage = () => {
    const {
        profiles,
        setActiveProfile,
        addProfile,
        updateProfile,
        deleteProfile,
        isProfileLimitReached,
    } = useProfile();

    const navigate = useNavigate();

    const [modalMode, setModalMode] = useState<ModalMode>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [color, setColor] = useState(COLOR_OPTIONS[0]);
    const [icon, setIcon] = useState(EMOJI_OPTIONS[0]);

    const openAddModal = () => {
        setModalMode("add");
        setEditingId(null);
        setName("");
        setColor(COLOR_OPTIONS[0]);
        setIcon(EMOJI_OPTIONS[0]);
    };

    const openEditModal = (id: string) => {
        const target = profiles.find((p) => p.id === id);
        if (!target) return;

        setModalMode("edit");
        setEditingId(id);
        setName(target.name);
        setColor(target.color);
        setIcon(target.icon);
    };

    const closeModal = () => {
        setModalMode(null);
        setEditingId(null);
    };

    const handleSelect = (id: string) => {
        try {
            localStorage.setItem("myflix:activeProfileId", id);
        } catch {
            // ignore
        }
        setActiveProfile(id);
        navigate("/", { replace: true });
    };

    const handleSave = () => {
        const trimmed = name.trim();
        if (!trimmed) return;

        if (modalMode === "add") {
            const ok = addProfile(trimmed, color, icon);
            if (!ok) return;
        } else if (modalMode === "edit" && editingId) {
            updateProfile(editingId, { name: trimmed, color, icon });
        }
        closeModal();
    };

    const handleDelete = () => {
        if (modalMode === "edit" && editingId) {
            deleteProfile(editingId);
            closeModal();
        }
    };

    return (
        <div className="profile-select-page">
            <div className="profile-select-inner">
                <h1 className="profile-select-title">프로필을 선택하세요</h1>
                <p className="profile-subtext">
                    이 계정에서는 최대 <strong>2개의 프로필</strong>만 사용할 수 있습니다. (2인팟)
                </p>

                <div className="profile-grid">
                    {profiles.map((p) => (
                        <button
                            key={p.id}
                            className="profile-card"
                            onClick={() => handleSelect(p.id)}
                            style={{ backgroundColor: p.color }}
                        >
                            {/* 수정 버튼 */}
                            <button
                                type="button"
                                className="profile-edit-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openEditModal(p.id);
                                }}
                                aria-label="프로필 수정"
                            >
                                <FaPen size={12} />
                            </button>

                            <div className="profile-icon">{p.icon}</div>
                            <div className="profile-name">{p.name}</div>
                        </button>
                    ))}

                    {!isProfileLimitReached && (
                        <button className="profile-card add-card" onClick={openAddModal}>
                            <span className="profile-icon">+</span>
                            <span className="profile-name">프로필 추가</span>
                        </button>
                    )}
                </div>
            </div>

            {/* 추가 / 수정 모달 */}
            {modalMode && (
                <div className="profile-modal">
                    <div className="profile-modal-box">
                        <h2>{modalMode === "add" ? "새 프로필" : "프로필 수정"}</h2>

                        <div className="profile-modal-field">
                            <label>이름</label>
                            <input
                                type="text"
                                placeholder="프로필 이름"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="profile-modal-field">
                            <label>색상</label>
                            <div className="profile-color-options">
                                {COLOR_OPTIONS.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        className={
                                            "profile-color-dot" + (c === color ? " selected" : "")
                                        }
                                        style={{ backgroundColor: c }}
                                        onClick={() => setColor(c)}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="profile-modal-field">
                            <label>아이콘</label>
                            <div className="profile-emoji-options">
                                {EMOJI_OPTIONS.map((em) => (
                                    <button
                                        key={em}
                                        type="button"
                                        className={
                                            "profile-emoji-btn" + (em === icon ? " selected" : "")
                                        }
                                        onClick={() => setIcon(em)}
                                    >
                                        {em}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="profile-modal-actions">
                            <button type="button" onClick={handleSave}>
                                {modalMode === "add" ? "생성" : "저장"}
                            </button>
                            <button type="button" className="ghost" onClick={closeModal}>
                                취소
                            </button>
                            {modalMode === "edit" && (
                                <button
                                    type="button"
                                    className="danger"
                                    onClick={handleDelete}
                                >
                                    <FaTrash style={{ marginRight: 4 }} />
                                    삭제
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
