import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import Medicines from "./components/Medicines";
import Cart from "./components/Cart";
import Payment from "./components/Payment";
import PaymentSuccess from "./components/PaymentSuccess";
import Orders from "./components/Orders";
import Chatbot from "./components/Chatbot";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Dashboard />} />
        <Route path="/medicines" element={<Medicines />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/orders" element={<Orders />} />
      </Routes>
      <Chatbot />
    </BrowserRouter>
  );
}

export default App;
