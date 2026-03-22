import { useState } from 'react'
import styles from './CustomTextPrompt.module.css'

export default function CustomTextPrompt({ tileName, onConfirm, onCancel }) {
  const [text, setText] = useState(tileName)

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <p className={styles.label}>Label for this placement:</p>
        <input
          className={styles.input}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
        />
        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onCancel}>Cancel</button>
          <button className={styles.confirm} onClick={() => onConfirm(text.trim() || tileName)}>
            Place
          </button>
        </div>
      </div>
    </div>
  )
}
