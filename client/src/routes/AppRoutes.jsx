import { Routes, Route } from 'react-router-dom';
import Main from '../components/layout/Main';
import Services from '../pages/Services';
import LaundryServices from '../pages/LaundryServices';
import LaundryBook from '../pages/LaundryBook';
import CleaningServices from '../pages/CleaningServices';
import Products from '../pages/Products';
import ProductDetail from '../pages/ProductDetail';
import Cart from '../pages/Cart';
import Booking from '../pages/Booking';
import Pricing from '../pages/Pricing';
import Contact from '../pages/Contact';
import HowItWorks from '../pages/HowItWorks';
import Faq from '../pages/Faq';
import Orders from '../pages/Orders';
import Profile from '../pages/Profile';
import Checkout from '../pages/Checkout';
import OrderConfirmed from '../pages/OrderConfirmed';
import Invoice from '../pages/Invoice';
import AdminLayout from '../components/admin/AdminLayout';
import AdminDashboard from '../pages/admin/Dashboard';
import AdminServices from '../pages/admin/Services';
import AdminCleaning from '../pages/admin/Cleaning';
import AdminProducts from '../pages/admin/Products';
import AdminOrders from '../pages/admin/Orders';
import AdminOrderDetail from '../pages/admin/OrderDetail';
import AdminSchedule from '../pages/admin/Schedule';
import AdminCustomers from '../pages/admin/Customers';
import AdminCustomerDetail from '../pages/admin/CustomerDetail';
import AdminMessages from '../pages/admin/Messages';
import AdminSettings from '../pages/admin/Settings';
import Auth from '../pages/Auth';
import NotFound from '../pages/NotFound';
import PrivateRoute from './PrivateRoute';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Main />} />
      <Route path="/services" element={<Services />} />
      <Route path="/laundry" element={<LaundryServices />} />
      <Route path="/laundry/book" element={<LaundryBook />} />
      <Route path="/cleaning" element={<CleaningServices />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/book" element={<Booking />} />
      <Route path="/book/:service" element={<Booking />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/faq" element={<Faq />} />

      {/* Auth-only (booking payment + confirmation) */}
      <Route
        path="/checkout/:orderId"
        element={
          <PrivateRoute>
            <Checkout />
          </PrivateRoute>
        }
      />
      <Route
        path="/order/:id/confirmed"
        element={
          <PrivateRoute>
            <OrderConfirmed />
          </PrivateRoute>
        }
      />

      {/* Auth-only (customer account) */}
      <Route
        path="/account/orders"
        element={
          <PrivateRoute>
            <Orders />
          </PrivateRoute>
        }
      />
      <Route
        path="/account/invoices/:id"
        element={
          <PrivateRoute>
            <Invoice />
          </PrivateRoute>
        }
      />
      <Route
        path="/account/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />

      {/* Admin — guarded shell (admins only), nested sections via <Outlet /> */}
      <Route
        path="/admin"
        element={
          <PrivateRoute requireAdmin>
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/:id" element={<AdminOrderDetail />} />
        <Route path="schedule" element={<AdminSchedule />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="customers/:id" element={<AdminCustomerDetail />} />
        <Route path="messages" element={<AdminMessages />} />
        <Route path="services" element={<AdminServices />} />
        <Route path="cleaning" element={<AdminCleaning />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Auth — one screen, the route picks which tab opens */}
      <Route path="/login" element={<Auth mode="login" />} />
      <Route path="/register" element={<Auth mode="register" />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
