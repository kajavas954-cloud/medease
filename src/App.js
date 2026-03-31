import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Register from "./components/Register";
import Medicines from "./components/Medicines";
import Cart from "./components/Cart";
import Payment from "./components/Payment";
import PaymentSuccess from "./components/PaymentSuccess";
import Orders from "./components/Orders";
import Chatbot from "./components/Chatbot";
import ForgotPassword from "./components/ForgotPassword";
import AdminDashboard from "./components/AdminDashboard";

function MainWrapper() {
  const location = useLocation();
  const publicPaths = ["/", "/login", "/register", "/forgot-password"];
  const isPublicPath = publicPaths.includes(location.pathname);
  
  // Show chatbot only if user is logged in (has authToken) and not on a public path.
  // This satisfies 'only after login' and ensures it's hidden on the login screen.
  const hasToken = localStorage.getItem("authToken");
  const showChatbot = !!hasToken && !isPublicPath && !location.pathname.startsWith("/admin");

  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Dashboard />} />
        <Route path="/medicines" element={<Medicines />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
      {showChatbot && <Chatbot />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <MainWrapper />
    </BrowserRouter>
  );
}

export default App;
