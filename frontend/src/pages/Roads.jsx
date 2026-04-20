// NOTA CITY - src/pages/Roads.jsx
// Editable road layer. Paint paved or dirt roads onto tiles.
// Roads affect traffic flow calculations in the fast tick.

import { useEffect, useState } from 'react'
import Grid from '../components/Grid'
import '../pages/pages.css'
import { getTiles, updateTile } from '../lib/api'

const ROAD_TYPES = ['none', 'paved', 'dirt']

export default function Roads() {
  const [tiles, setTiles] = useState([])
  const [selected, setSelected] = useState('paved')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTiles().then(res => {
      setTiles(res.data)
      setLoading(false)
    })
  }, [])

  async function handleTileClick(x, y) {
    try {
      const res = await updateTile(x, y, { road_type: selected })
      setTiles(prev => prev.map(t =>
        t.x === x && t.y === y ? res.data : t
      ))
    } catch (err) {
      console.error('Tile update failed:', err)
    }
  }

  if (loading) return <div className="page-status">Loading...</div>

  return (
    <div className="page">
      <div className="page-header">
        <h2>ROADS LAYER</h2>
      </div>

      <div className="tool-bar">
        <span className="tool-label">PAINT:</span>
        {ROAD_TYPES.map(type => (
          <button
            key={type}
            className={`tool-btn ${selected === type ? 'active' : ''}`}
            onClick={() => setSelected(type)}
          >
            {type.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="grid-wrap">
        <Grid tiles={tiles} layer="roads" onTileClick={handleTileClick} />
      </div>

      <div className="layer-legend">
        <span style={{color:'#555'}}>■ Paved</span>
        <span style={{color:'#7a6a4a'}}>■ Dirt</span>
      </div>
    </div>
  )
}
