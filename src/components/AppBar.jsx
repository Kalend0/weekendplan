import { useNavigate } from 'react-router-dom'
import styles from './AppBar.module.css'

export default function AppBar() {
  const navigate = useNavigate()
  return (
    <header className={styles.bar}>
      <span className={styles.title}>Weekend Planner</span>
      <button className={styles.gearBtn} onClick={() => navigate('/config')} aria-label="Settings">
        ⚙
      </button>
    </header>
  )
}
