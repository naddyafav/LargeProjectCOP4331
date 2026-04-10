import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import Home from "./pages/Home";
import Quiz from "./pages/Quiz";
import Friends from "./pages/Friends";
 
// Wraps any route that requires the user to be logged in.
// If no token is found in localStorage, redirects to /login.
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}
 
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/"            element={<Login />} />
        <Route path="/login"       element={<Login />} />
        <Route path="/registration" element={<Registration />} />
 
        {/* Protected routes */}
        <Route path="/home"    element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/quiz"    element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
        <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
 
export default App;
 