import styles from './AllocationChip.module.css'

export default function AllocationChip({ allocation, onRemove }) {
  const label = allocation.custom_text || allocation.tile_name || `#${allocation.tile_id}`
  return (
    <div className={styles.chip}>
      <span className={styles.label}>{label}</span>
      <button className={styles.remove} onClick={() => onRemove(allocation.id)} aria-label="Remove">
        ×
      </button>
    </div>
  )
}
