import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getSettings,
  updateSettings,
  getTiles,
  createTile,
  updateTile,
  deleteTile,
} from '../api/index'
import styles from './ConfigScreen.module.css'

function TileRow({ tile, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(tile.name)

  const saveName = () => {
    if (name.trim() && name.trim() !== tile.name) {
      onUpdate(tile.id, { ...tile, name: name.trim() })
    }
    setEditing(false)
  }

  const toggleProp = (prop) => {
    onUpdate(tile.id, { ...tile, [prop]: !tile[prop] })
  }

  return (
    <div className={styles.tileRow}>
      <div className={styles.tileTop}>
        {editing ? (
          <input
            className={styles.nameInput}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={saveName}
            onKeyDown={(e) => e.key === 'Enter' && saveName()}
            autoFocus
          />
        ) : (
          <span className={styles.tileName} onClick={() => setEditing(true)}>{tile.name}</span>
        )}
        <button className={styles.deleteBtn} onClick={() => onDelete(tile.id)}>Delete</button>
      </div>
      <div className={styles.tileToggles}>
        <label className={styles.toggleLabel}>
          <input
            type="checkbox"
            checked={tile.text_configurable}
            onChange={() => toggleProp('text_configurable')}
          />
          Text editable
        </label>
        <label className={styles.toggleLabel}>
          <input
            type="checkbox"
            checked={tile.multi_slot}
            onChange={() => toggleProp('multi_slot')}
          />
          Multi-slot
        </label>
        <label className={styles.toggleLabel}>
          <input
            type="checkbox"
            checked={tile.required}
            onChange={() => toggleProp('required')}
          />
          Required
        </label>
      </div>
    </div>
  )
}

export default function ConfigScreen() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState({ pin: '', name_person_1: '', name_person_2: '' })
  const [tiles, setTiles] = useState([])
  const [newTileName, setNewTileName] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    Promise.all([getSettings(), getTiles()]).then(([s, t]) => {
      if (s) setSettings(s)
      setTiles(t || [])
    })
  }, [])

  const saveSettings = async () => {
    await updateSettings(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const handleUpdateTile = async (id, data) => {
    await updateTile(id, data)
    const fresh = await getTiles()
    setTiles(fresh || [])
  }

  const handleDeleteTile = async (id) => {
    await deleteTile(id)
    const fresh = await getTiles()
    setTiles(fresh || [])
  }

  const handleAddTile = async (e) => {
    e.preventDefault()
    if (!newTileName.trim()) return
    await createTile({ name: newTileName.trim(), text_configurable: false, multi_slot: false, required: false })
    setNewTileName('')
    const fresh = await getTiles()
    setTiles(fresh || [])
  }

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <button className={styles.back} onClick={() => navigate('/plan')}>← Back</button>
        <h1 className={styles.title}>Settings</h1>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Parent names</h2>
        <label className={styles.fieldLabel}>Person 1 name</label>
        <input
          className={styles.input}
          type="text"
          value={settings.name_person_1 || ''}
          onChange={(e) => setSettings({ ...settings, name_person_1: e.target.value })}
        />
        <label className={styles.fieldLabel}>Person 2 name</label>
        <input
          className={styles.input}
          type="text"
          value={settings.name_person_2 || ''}
          onChange={(e) => setSettings({ ...settings, name_person_2: e.target.value })}
        />
        <label className={styles.fieldLabel}>PIN (4 digits)</label>
        <input
          className={styles.input}
          type="text"
          inputMode="numeric"
          maxLength={4}
          value={settings.pin || ''}
          onChange={(e) => setSettings({ ...settings, pin: e.target.value.replace(/\D/, '') })}
        />
        <button className={styles.saveBtn} onClick={saveSettings}>
          {saved ? 'Saved ✓' : 'Save'}
        </button>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Tiles</h2>
        {tiles.map((tile) => (
          <TileRow
            key={tile.id}
            tile={tile}
            onUpdate={handleUpdateTile}
            onDelete={handleDeleteTile}
          />
        ))}
        <form onSubmit={handleAddTile} className={styles.addRow}>
          <input
            className={styles.input}
            type="text"
            placeholder="New tile name…"
            value={newTileName}
            onChange={(e) => setNewTileName(e.target.value)}
          />
          <button type="submit" className={styles.addBtn}>Add</button>
        </form>
      </section>
    </div>
  )
}
