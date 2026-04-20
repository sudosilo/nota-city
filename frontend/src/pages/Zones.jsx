// NOTA CITY - src/pages/Zones.jsx
// Editable zone layer. Click a zone type to select it,
// then click tiles on the grid to paint that zone.
// Zones drive population capacity and commercial revenue in the tick engine.

import { useEffect, useState } from 'react'
import Grid from '../components/Grid'
import '../pages/pages.css'
import { getTiles, updateTile } from '../lib/api'

const ZONE_TYPES = ['empty', 'residential', 'commercial', 'industrial']

const ZONE_COLORS = {
  empty:       '#1a1a1a',
  residential: '#2a5a2a',
  commercial:  '#2a2a7a',
  industrial:  '#7a5a2a',
}

export default function Zones() {
  const [tiles, setTiles] = useState([])
  const [selected, setSelected] = useState('residential')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTiles().then(res => {
      setTiles(res.data)
      setLoading(false)
    })
  }, [])

  async function handleTileClick(x, y) {
    try {
      const res = await updateTile(x, y, { zone_type: selected })
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
        <h2>ZONES LAYER</h2>
      </div>

      <div className="tool-bar">
        <span className="tool-label">PAINT:</span>
        {ZONE_TYPES.map(type => (
          <button
            key={type}
            className={`tool-btn ${selected === type ? 'active' : ''}`}
            style={{ '--btn-color': ZONE_COLORS[type] }}
            onClick={() => setSelected(type)}
          >
            {type.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="grid-wrap">
        <Grid tiles={tiles} layer="zones" onTileClick={handleTileClick} />
      </div>

      <div className="layer-legend">
        <span style={{color:'#2a5a2a'}}>■ Residential</span>
        <span style={{color:'#2a2a7a'}}>■ Commercial</span>
        <span style={{color:'#7a5a2a'}}>■ Industrial</span>
      </div>
    </div>
  )
}
