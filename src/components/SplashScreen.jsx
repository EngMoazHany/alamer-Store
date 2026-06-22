import { useEffect, useState } from 'react'
import styles from '../styles/SplashScreen.module.css'
import logo from '../assets/logo/alamer-logo.png'

const SplashScreen = () => {
  const [hide, setHide] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setHide(true), 4000)
    return () => clearTimeout(timer)
  }, [])

  if (hide) return null

  return (
    <div className={styles.splash}>
      <div className={styles.logoWrap}>
        <img src={logo} alt="مكة العامر" className={styles.splashLogo} />
      </div>
      <div className={styles.brandText}>
        <h1>مكة العامر</h1>
        <p>لتجهيز العرائس</p>
      </div>
    </div>
  )
}

export default SplashScreen
