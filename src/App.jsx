import { lazy, Suspense } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import MobileBottomNav from './components/MobileBottomNav'
import CartDrawer from './components/CartDrawer'
import FloatingWhatsApp from './components/FloatingWhatsApp'
import SplashScreen from './components/SplashScreen'
import Footer from './components/Footer'
import { pageTransition } from './utils/animations'

const Home = lazy(() => import('./pages/Home'))
const Products = lazy(() => import('./pages/Products'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-cream px-4">
      <div className="h-12 w-12 rounded-full border-4 border-gold/25 border-t-burgundy motion-safe:animate-spin" />
    </div>
  )
}

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
              <Suspense fallback={<PageLoader />}>
                <Routes location={location}>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                </Routes>
              </Suspense>
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
