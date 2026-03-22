import { useState } from 'react'
import styles from './AddTileModal.module.css'

export default function AddTileModal({ onSave, onClose }) {
  const [name, setName] = useState('')
  const [textConfigurable, setTextConfigurable] = useState(false)
  const [multiSlot, setMultiSlot] = useState(false)
  const [required, setRequired] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave({ name: name.trim(), text_configurable: textConfigurable, multi_slot: multiSlot, required })
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>New tile</h3>
        <form onSubmit={handleSubmit}>
          <input
            className={styles.input}
            type="text"
            placeholder="Tile name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <label className={styles.toggle}>
            <input type="checkbox" checked={textConfigurable} onChange={(e) => setTextConfigurable(e.target.checked)} />
            Text editable when placed
          </label>
          <label className={styles.toggle}>
            <input type="checkbox" checked={multiSlot} onChange={(e) => setMultiSlot(e.target.checked)} />
            Can be placed in multiple slots
          </label>
          <label className={styles.toggle}>
            <input type="checkbox" checked={required} onChange={(e) => setRequired(e.target.checked)} />
            Required this weekend
          </label>
          <div className={styles.actions}>
            <button type="button" className={styles.cancel} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.save}>Add tile</button>
          </div>
        </form>
      </div>
    </div>
  )
}
