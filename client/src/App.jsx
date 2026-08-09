import { useLocation } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import BottomTabBar from './components/layout/BottomTabBar'
import AppRoutes from './routes/AppRoutes'

function App() {
  // The /admin area ships its own bottom bar (AdminBottomTabBar inside
  // AdminLayout) — showing the customer one there too would stack two bars.
  const { pathname } = useLocation()
  const isAdminArea = pathname.startsWith('/admin')

  return (
    <>
    <Header />
    <AppRoutes />
    <Footer />
    {!isAdminArea && <BottomTabBar />}
    </>
  )
}

export default App
