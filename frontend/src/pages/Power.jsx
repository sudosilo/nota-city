// NOTA CITY - src/pages/Power.jsx
// Editable power layer. Place power lines and power plants.
// Power supply vs demand is calculated in the fast tick.

import { useEffect, useState } from 'react'
import Grid from '../components/Grid'
import '../pages/pages.css'
import { getTiles, updateTile } from '../lib/api'

const POWER_TYPES = ['none', 'line', 'plant']

export default function Power() {
  const [tiles, setTiles] = useState([])
  const [selected, setSelected] = useState('line')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTiles().then(res => {
      setTiles(res.data)
      setLoading(false)
    })
  }, [])

  async function handleTileClick(x, y) {
    try {
      const res = await updateTile(x, y, { power_type: selected })
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
        <h2>POWER LAYER</h2>
      </div>

      <div className="tool-bar">
        <span className="tool-label">PAINT:</span>
        {POWER_TYPES.map(type => (
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
        <Grid tiles={tiles} layer="power" onTileClick={handleTileClick} />
      </div>

      <div className="layer-legend">
        <span style={{color:'#aaaa00'}}>■ Plant</span>
        <span style={{color:'#7a7a00'}}>■ Line</span>
      </div>
    </div>
  )
}
