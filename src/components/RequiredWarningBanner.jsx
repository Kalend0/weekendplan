import styles from './RequiredWarningBanner.module.css'

export default function RequiredWarningBanner({ tiles }) {
  if (!tiles || tiles.length === 0) return null
  const names = tiles.map((t) => t.name).join(', ')
  return (
    <div className={styles.banner}>
      Not yet planned: <strong>{names}</strong>
    </div>
  )
}
