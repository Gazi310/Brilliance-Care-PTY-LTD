import { Routes, Route } from 'react-router-dom';
import Main from '../components/layout/Main';
import LaundryServices from '../pages/LaundryServices';
import CleaningServices from '../pages/CleaningServices';
import Products from '../pages/Products';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/laundry" element={<LaundryServices />} />
      <Route path="/cleaning" element={<CleaningServices />} />
      <Route path="/products" element={<Products />} />
    </Routes>
  );
}
