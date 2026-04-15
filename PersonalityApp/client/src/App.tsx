import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import Home from "./pages/Home";
import Quiz from "./pages/Quiz";
import Friends from "./pages/Friends";
import VerifyEmail from "./pages/VerifyEmail";
import ResetPasswordEmail from "./pages/ResetPasswordEmail";
import ResetPassword from "./pages/ResetPassword";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
        <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
        <Route path="/password/reset/email" element={<ResetPasswordEmail />} />
        <Route path="/password/reset/:token" element={<ResetPassword />} />

        {/* ✅ 修复拼写：verify */}
        <Route path="/register/verify/:token" element={<VerifyEmail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
