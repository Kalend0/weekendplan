import { useState, useEffect } from 'react'
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { getWeekStart } from '../utils/weekStart'
import {
  getTiles,
  getAllocations,
  createTile,
  createAllocation,
  deleteAllocation,
} from '../api/index'
import AppBar from '../components/AppBar'
import RequiredWarningBanner from '../components/RequiredWarningBanner'
import SegmentedControl from '../components/SegmentedControl'
import TileTray from '../components/TileTray'
import DayGrid from '../components/DayGrid'
import AddTileModal from '../components/AddTileModal'
import CustomTextPrompt from '../components/CustomTextPrompt'
import { getSettings } from '../api/index'
import styles from './MainScreen.module.css'

function defaultDay() {
  const day = new Date().getDay()
  return day === 0 ? 'sunday' : 'saturday'
}

export default function MainScreen() {
  const weekStart = getWeekStart()
  const [activeDay, setActiveDay] = useState(defaultDay)
  const [tiles, setTiles] = useState([])
  const [allocations, setAllocations] = useState([])
  const [settings, setSettings] = useState({})
  const [showAddModal, setShowAddModal] = useState(false)
  const [pendingDrop, setPendingDrop] = useState(null) // { tile, person, slot, day }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  )

  const loadAll = async () => {
    const [t, a, s] = await Promise.all([
      getTiles(),
      getAllocations(weekStart),
      getSettings(),
    ])
    setTiles(t || [])
    setAllocations(a || [])
    setSettings(s || {})
  }

  useEffect(() => { loadAll() }, [weekStart]) // eslint-disable-line react-hooks/exhaustive-deps

  // Required warning: tiles marked required with zero allocations anywhere this week
  const requiredUnallocated = tiles.filter((tile) => {
    if (!tile.required) return false
    return !allocations.some((a) => a.tile_id === tile.id)
  })

  // Enrich allocations with tile name for display
  const enrichedAllocations = allocations.map((a) => ({
    ...a,
    tile_name: tiles.find((t) => t.id === a.tile_id)?.name || '',
  }))

  async function saveAllocation(tileId, person, slot, day, customText) {
    await createAllocation({
      tile_id: tileId,
      person,
      day,
      slot,
      custom_text: customText,
      week_start: weekStart,
    })
    const fresh = await getAllocations(weekStart)
    setAllocations(fresh || [])
  }

  async function handleRemove(id) {
    await deleteAllocation(id)
    const fresh = await getAllocations(weekStart)
    setAllocations(fresh || [])
  }

  async function handleAddTile(data) {
    await createTile(data)
    setShowAddModal(false)
    const fresh = await getTiles()
    setTiles(fresh || [])
  }

  // Fix over.id parsing — format is "person_1-morning-saturday" or "person_2-afternoon-sunday"
  // person is always person_1 or person_2 (with underscore already in the id)
  function parseCellId(id) {
    // id = "person_1-morning-saturday"
    const match = id.match(/^(person_[12])-(\w+)-(\w+)$/)
    if (!match) return null
    return { person: match[1], slot: match[2], day: match[3] }
  }

  function handleDragEndFixed({ active, over }) {
    if (!over) return
    const tile = active.data.current?.tile
    if (!tile) return

    const parsed = parseCellId(over.id)
    if (!parsed) return
    const { person, slot, day } = parsed

    if (!tile.multi_slot && allocations.some((a) => a.tile_id === tile.id)) return

    if (tile.text_configurable) {
      setPendingDrop({ tile, person, slot, day })
    } else {
      saveAllocation(tile.id, person, slot, day, null)
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEndFixed}>
      <div className={styles.screen}>
        <AppBar />
        <RequiredWarningBanner tiles={requiredUnallocated} />
        <SegmentedControl value={activeDay} onChange={setActiveDay} />
        <TileTray
          tiles={tiles}
          allocations={allocations}
          onAddClick={() => setShowAddModal(true)}
        />
        <div className={styles.scroll}>
          <DayGrid
            day={activeDay}
            allocations={enrichedAllocations}
            nameP1={settings.name_person_1}
            nameP2={settings.name_person_2}
            onRemove={handleRemove}
          />
        </div>

        {showAddModal && (
          <AddTileModal onSave={handleAddTile} onClose={() => setShowAddModal(false)} />
        )}

        {pendingDrop && (
          <CustomTextPrompt
            tileName={pendingDrop.tile.name}
            onConfirm={(text) => {
              saveAllocation(pendingDrop.tile.id, pendingDrop.person, pendingDrop.slot, pendingDrop.day, text)
              setPendingDrop(null)
            }}
            onCancel={() => setPendingDrop(null)}
          />
        )}
      </div>
    </DndContext>
  )
}
