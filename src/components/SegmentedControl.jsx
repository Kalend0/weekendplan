import styles from './SegmentedControl.module.css'

export default function SegmentedControl({ value, onChange }) {
  return (
    <div className={styles.container}>
      <button
        className={`${styles.segment} ${value === 'saturday' ? styles.active : ''}`}
        onClick={() => onChange('saturday')}
      >
        SAT
      </button>
      <button
        className={`${styles.segment} ${value === 'sunday' ? styles.active : ''}`}
        onClick={() => onChange('sunday')}
      >
        SUN
      </button>
    </div>
  )
}
