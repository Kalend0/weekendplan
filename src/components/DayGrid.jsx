import DroppableCell from './DroppableCell'
import styles from './DayGrid.module.css'

const SLOTS = ['morning', 'noon', 'afternoon', 'evening']
const SLOT_LABELS = { morning: 'Morning', noon: 'Noon', afternoon: 'Afternoon', evening: 'Evening' }

export default function DayGrid({ day, allocations, nameP1, nameP2, onRemove }) {
  const allocs = allocations.filter((a) => a.day === day)

  const cellAllocs = (person, slot) =>
    allocs.filter((a) => a.person === person && a.slot === slot)

  return (
    <div className={styles.grid}>
      {/* Header row */}
      <div className={styles.rowLabel} />
      <div className={styles.colHeader}>{nameP1 || 'Person 1'}</div>
      <div className={styles.colHeader}>{nameP2 || 'Person 2'}</div>

      {/* Data rows */}
      {SLOTS.map((slot) => (
        <>
          <div key={`label-${slot}`} className={styles.rowLabel}>
            {SLOT_LABELS[slot]}
          </div>
          <DroppableCell
            key={`p1-${slot}`}
            id={`person_1-${slot}-${day}`}
            allocations={cellAllocs('person_1', slot)}
            onRemove={onRemove}
          />
          <DroppableCell
            key={`p2-${slot}`}
            id={`person_2-${slot}-${day}`}
            allocations={cellAllocs('person_2', slot)}
            onRemove={onRemove}
          />
        </>
      ))}
    </div>
  )
}
