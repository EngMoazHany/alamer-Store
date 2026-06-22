import { AnimatePresence, motion } from 'framer-motion'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import MobileBottomNav from './components/MobileBottomNav'
import CartDrawer from './components/CartDrawer'
import FloatingWhatsApp from './components/FloatingWhatsApp'
import SplashScreen from './components/SplashScreen'
import Footer from './components/Footer'
import Home from './pages/Home'
import Products from './pages/Products'
import About from './pages/About'
import Contact from './pages/Contact'
import { pageTransition } from './utils/animations'

function App() {
  const location = useLocation()

  return (
    <>
      <SplashScreen />
      <div className="min-h-screen overflow-hidden bg-cream text-purpleDark">
        <Navbar />
        <main>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={pageTransition.initial}
              animate={pageTransition.animate}
              exit={pageTransition.exit}
            >
              <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
        <Footer />
        <CartDrawer />
        <FloatingWhatsApp />
        <MobileBottomNav />
      </div>
    </>
  )
}

export default App
