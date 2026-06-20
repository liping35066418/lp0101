import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import ProductCatalog from "@/pages/customer/ProductCatalog";
import PlaceOrder from "@/pages/customer/PlaceOrder";
import MyOrders from "@/pages/customer/MyOrders";
import OrderDetail from "@/pages/customer/OrderDetail";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/customer" element={<ProductCatalog />} />
        <Route path="/customer/cart" element={<PlaceOrder />} />
        <Route path="/customer/orders" element={<MyOrders />} />
        <Route path="/customer/orders/:id" element={<OrderDetail />} />
        <Route path="/admin/sorter" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}
