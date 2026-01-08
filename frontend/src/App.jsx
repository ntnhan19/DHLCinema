import { Routes, Route, Navigate } from "react-router-dom";
import { BookingProvider } from "./context/BookingContext";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { App as AntApp, ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN"; 
import { ErrorBoundary } from "react-error-boundary";
// Trigger rebuild vercel 1
// Pages
import HomePage from "./pages/HomePage";
import MoviePage from "./pages/MoviePage";
import MovieDetailPage from "./components/Movies/MovieDetailPage";
import BookingPage from "./pages/BookingPage";
import UserProfilePage from "./pages/UserProfilePage";
import PromotionPage from "./pages/PromotionPage";
import PromotionDetails from "./components/Promotions/PromotionDetails";
import PaymentPage from "./pages/PaymentPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import ConcessionPage from "./pages/ConcessionPage";
import PaymentCompletionPage from "./pages/PaymentCompletionPage";

// Components
import PrivateRoute from "./components/common/PrivateRoute";
import SeatSelectionPage from "./components/Payments/SeatSelectionPage";
import AppHeader from "./components/common/AppHeader";
import Footer from "./components/common/Footer";
import AuthModal from "./components/common/AuthModal";

// Styles
import "./index.css";
import "./styles/auth-styles.css";

// Error Fallback Component
const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 text-center bg-white rounded-lg shadow-lg">
        <h2 className="mb-4 text-2xl font-bold text-red-600">
          Đã có lỗi xảy ra
        </h2>
        <p className="mb-6 text-gray-600">
          Xin lỗi, ứng dụng gặp sự cố. Vui lòng thử lại.
        </p>
        <div className="space-y-4">
          <button
            onClick={resetErrorBoundary}
            className="w-full px-4 py-2 text-white transition-colors bg-red-500 rounded hover:bg-red-600"
          >
            Thử lại
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="w-full px-4 py-2 text-white transition-colors bg-gray-500 rounded hover:bg-gray-600"
          >
            Về trang chủ
          </button>
        </div>
        {process.env.NODE_ENV === "development" && (
          <details className="mt-4 text-left">
            <summary className="text-sm text-gray-500 cursor-pointer">
              Chi tiết lỗi (Dev only)
            </summary>
            <pre className="p-2 mt-2 overflow-auto text-xs text-red-500 rounded bg-red-50">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error("App Error:", error, errorInfo);
        // Có thể gửi lỗi lên monitoring service ở đây
      }}
    >
      <ConfigProvider
        locale={viVN}
        theme={{
          token: {
            colorPrimary: "#ef4444", // Red-500
            colorLink: "#ef4444",
            colorSuccess: "#22c55e",
            colorWarning: "#f59e0b",
            colorError: "#ef4444",
            borderRadius: 8,
          },
        }}
      >
        <ThemeProvider>
          <AuthProvider>
            <BookingProvider>
              <AntApp>
                <div className="flex flex-col min-h-screen app-container">
                  <AppHeader className="fixed top-0 left-0 right-0 z-50" />
                  <main className="flex-grow main-content-wrapper">
                    <ErrorBoundary
                      FallbackComponent={({ resetErrorBoundary }) => (
                        <div className="flex items-center justify-center min-h-screen">
                          <div className="p-8 text-center">
                            <h3 className="mb-4 text-xl font-bold text-red-600">
                              Lỗi tải trang
                            </h3>
                            <p className="mb-4 text-gray-600">
                              Không thể tải nội dung. Vui lòng thử lại.
                            </p>
                            <button
                              onClick={resetErrorBoundary}
                              className="px-6 py-2 text-white bg-red-500 rounded hover:bg-red-600"
                            >
                              Thử lại
                            </button>
                          </div>
                        </div>
                      )}
                    >
                      <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/movies" element={<MoviePage />} />
                        <Route
                          path="/movies/:id"
                          element={<MovieDetailPage />}
                        />
                        <Route path="/promotions" element={<PromotionPage />} />
                        <Route
                          path="/promotions/:id"
                          element={<PromotionDetails />}
                        />
                        <Route
                          path="/concessions"
                          element={<ConcessionPage />}
                        />
                        <Route
                          path="/concessions/:id"
                          element={<ConcessionPage />}
                        />
                        <Route
                          path="/reset-password/:token"
                          element={<ResetPasswordPage />}
                        />
                        <Route
                          path="/unauthorized"
                          element={<UnauthorizedPage />}
                        />
                        <Route
                          path="/verify-email/:token"
                          element={<EmailVerificationPage />}
                        />

                        {/* Protected Routes */}
                        <Route
                          path="/booking"
                          element={
                            <PrivateRoute>
                              <BookingPage />
                            </PrivateRoute>
                          }
                        />
                        <Route
                          path="/booking/seats/:showtimeId"
                          element={
                            <PrivateRoute>
                              <SeatSelectionPage />
                            </PrivateRoute>
                          }
                        />
                        <Route
                          path="/booking/payment"
                          element={
                            <PrivateRoute>
                              <PaymentPage />
                            </PrivateRoute>
                          }
                        />
                        <Route
                          path="/payment-completion"
                          element={
                            <PrivateRoute>
                              <PaymentCompletionPage />
                            </PrivateRoute>
                          }
                        />

                        {/* User Routes */}
                        <Route
                          path="/user/profile"
                          element={
                            <PrivateRoute>
                              <UserProfilePage />
                            </PrivateRoute>
                          }
                        />

                        {/* Admin Routes */}
                        <Route
                          path="/admin/*"
                          element={
                            <PrivateRoute allowedRoles={["admin"]}>
                              <Navigate to="http://localhost:3001" replace />
                            </PrivateRoute>
                          }
                        />

                        {/* Fallback Route */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </ErrorBoundary>
                  </main>
                  <Footer />
                  <AuthModal />
                </div>
              </AntApp>
            </BookingProvider>
          </AuthProvider>
        </ThemeProvider>
      </ConfigProvider>
    </ErrorBoundary>
  );
}

export default App;
