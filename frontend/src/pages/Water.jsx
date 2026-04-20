// NOTA CITY - src/pages/Water.jsx
// Editable water layer. Place water pipes and towers.
// Water coverage is tracked in the fast tick.

import { useEffect, useState } from 'react'
import Grid from '../components/Grid'
import '../pages/pages.css'
import { getTiles, updateTile } from '../lib/api'

const WATER_TYPES = ['none', 'pipe', 'tower']

export default function Water() {
  const [tiles, setTiles] = useState([])
  const [selected, setSelected] = useState('pipe')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTiles().then(res => {
      setTiles(res.data)
      setLoading(false)
    })
  }, [])

  async function handleTileClick(x, y) {
    try {
      const res = await updateTile(x, y, { water_type: selected })
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
        <h2>WATER LAYER</h2>
      </div>

      <div className="tool-bar">
        <span className="tool-label">PAINT:</span>
        {WATER_TYPES.map(type => (
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
        <Grid tiles={tiles} layer="water" onTileClick={handleTileClick} />
      </div>

      <div className="layer-legend">
        <span style={{color:'#0077aa'}}>■ Tower</span>
        <span style={{color:'#004a7a'}}>■ Pipe</span>
      </div>
    </div>
  )
}
