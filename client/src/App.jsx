import './App.css'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import BottomTabBar from './components/layout/BottomTabBar'
import AppRoutes from './routes/AppRoutes'

function App() {

  return (
    <>
    <Header />
    <AppRoutes />
    <Footer />
    <BottomTabBar />
    </>
  )
}

export default App
