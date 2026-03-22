import { useDroppable } from '@dnd-kit/core'
import AllocationChip from './AllocationChip'
import styles from './DroppableCell.module.css'

export default function DroppableCell({ id, allocations, onRemove }) {
  const { isOver, setNodeRef } = useDroppable({ id })

  return (
    <div ref={setNodeRef} className={`${styles.cell} ${isOver ? styles.over : ''}`}>
      {allocations.map((a) => (
        <AllocationChip key={a.id} allocation={a} onRemove={onRemove} />
      ))}
    </div>
  )
}
