import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSettings } from '../api/index'
import styles from './PinScreen.module.css'

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫']

export default function PinScreen() {
  const navigate = useNavigate()
  const [pin, setPin] = useState(null)
  const [entered, setEntered] = useState([])
  const [shake, setShake] = useState(false)

  useEffect(() => {
    getSettings().then((s) => {
      if (!s || !s.name_person_1 || !s.name_person_2) {
        navigate('/config')
        return
      }
      setPin(s.pin)
    })
  }, [navigate])

  const handleDigit = (d) => {
    if (d === '' || shake) return
    if (d === '⌫') {
      setEntered((prev) => prev.slice(0, -1))
      return
    }
    const next = [...entered, d]
    setEntered(next)
    if (next.length === 4) {
      if (next.join('') === pin) {
        sessionStorage.setItem('authenticated', 'true')
        navigate('/plan')
      } else {
        setShake(true)
        setTimeout(() => {
          setShake(false)
          setEntered([])
        }, 420)
      }
    }
  }

  return (
    <div className={styles.screen}>
      <h1 className={styles.title}>Weekend Planner</h1>
      <p className={styles.subtitle}>Enter PIN</p>

      <div className={`${styles.dots} ${shake ? styles.shake : ''}`}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`${styles.dot} ${entered[i] !== undefined ? styles.filled : ''}`} />
        ))}
      </div>

      <div className={styles.pad}>
        {DIGITS.map((d, i) => (
          <button
            key={i}
            className={`${styles.key} ${d === '' ? styles.invisible : ''}`}
            onClick={() => handleDigit(d)}
            disabled={d === ''}
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  )
}
