import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { SigninPage } from "../pages/Auth/SigninPage";
import { HomePage } from "../pages/Home/HomePage";
import { PopularPage } from "../pages/Popular/PopularPage";
import { SearchPage } from "../pages/Search/SearchPage";
import { WishlistPage } from "../pages/Wishlist/WishlistPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { ProfileSelectPage } from "../pages/Profiles/ProfileSelectPage";

export const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/signin" element={<SigninPage />} />

                <Route element={<Layout />}>
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <HomePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/popular"
                        element={
                            <ProtectedRoute>
                                <PopularPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/search"
                        element={
                            <ProtectedRoute>
                                <SearchPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/wishlist"
                        element={
                            <ProtectedRoute>
                                <WishlistPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/profiles"
                        element={
                            <ProtectedRoute>
                                <ProfileSelectPage />
                            </ProtectedRoute>
                        }
                    />

                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};
