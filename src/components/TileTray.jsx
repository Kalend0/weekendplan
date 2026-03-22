import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import styles from './TileTray.module.css'

function DraggableTile({ tile, isUsed }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `tile-${tile.id}`,
    data: { tile },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : isUsed ? 0.35 : 1,
    touchAction: 'none',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.tile} ${isUsed ? styles.used : ''}`}
      {...listeners}
      {...attributes}
    >
      {tile.name}
    </div>
  )
}

export default function TileTray({ tiles, allocations, onAddClick }) {
  // A tile is "used up" if multi_slot=false and it has at least one allocation this week
  const usedTileIds = new Set(
    allocations
      .filter((a) => {
        const tile = tiles.find((t) => t.id === a.tile_id)
        return tile && !tile.multi_slot
      })
      .map((a) => a.tile_id)
  )

  return (
    <div className={styles.wrapper}>
      <div className={styles.tray}>
        {tiles.map((tile) => (
          <DraggableTile key={tile.id} tile={tile} isUsed={usedTileIds.has(tile.id)} />
        ))}
        <button className={styles.addBtn} onClick={onAddClick} aria-label="Add tile">
          +
        </button>
      </div>
    </div>
  )
}
