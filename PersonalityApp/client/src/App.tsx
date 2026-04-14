import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import Home from "./pages/Home";
import Quiz from "./pages/Quiz";
import Friends from "./pages/Friends";
import VerifyEmail from "./pages/VerifyEmail";
import ResetPasswordEmail from "./pages/ResetPasswordEmail";
import ResetPassword from "./pages/ResetPassword";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/home" element={<Home />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/password/reset/email" element={<ResetPasswordEmail />} />
        <Route path="/password/reset/:token" element={<ResetPassword />} />

        {/* ✅ 修复拼写：verify */}
        <Route path="/register/verify/:token" element={<VerifyEmail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
