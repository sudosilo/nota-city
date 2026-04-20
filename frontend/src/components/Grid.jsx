// NOTA CITY - src/components/Grid.jsx
// The shared 32x32 tile grid renderer.
// Used by every page that shows a map.
//
// Props:
//   tiles       - array of 1024 tile objects from the database
//   onTileClick - function called when a tile is clicked (x, y)
//   layer       - which layer to visualize: 'overview','zones','roads','power','water'
//   readonly    - if true, clicks do nothing (used by Overview page)

const GRID_SIZE = 32

// Color map for each layer type
const ZONE_COLORS = {
  empty:       '#1a1a1a',
  residential: '#2a5a2a',
  commercial:  '#2a2a7a',
  industrial:  '#7a5a2a',
}

const ROAD_COLORS = {
  none:   null,
  paved:  '#555555',
  dirt:   '#7a6a4a',
}

const POWER_COLORS = {
  none:    null,
  line:    '#7a7a00',
  plant:   '#aaaa00',
}

const WATER_COLORS = {
  none:   null,
  pipe:   '#004a7a',
  tower:  '#0077aa',
}

const TERRAIN_COLORS = {
  grass: '#1a2a1a',
  water: '#0a1a2a',
  dirt:  '#2a1a0a',
}

function getTileColor(tile, layer) {
  if (!tile) return '#0a0a0a'

  if (layer === 'zones') {
    return ZONE_COLORS[tile.zone_type] || ZONE_COLORS.empty
  }
  if (layer === 'roads') {
    return ROAD_COLORS[tile.road_type] || TERRAIN_COLORS[tile.terrain] || '#1a1a1a'
  }
  if (layer === 'power') {
    return POWER_COLORS[tile.power_type] || TERRAIN_COLORS[tile.terrain] || '#1a1a1a'
  }
  if (layer === 'water') {
    return WATER_COLORS[tile.water_type] || TERRAIN_COLORS[tile.terrain] || '#1a1a1a'
  }

  // Overview: stack all layers, priority: road > zone > terrain
  if (tile.road_type && tile.road_type !== 'none') {
    return ROAD_COLORS[tile.road_type] || '#555'
  }
  if (tile.zone_type && tile.zone_type !== 'empty') {
    return ZONE_COLORS[tile.zone_type] || '#1a1a1a'
  }
  return TERRAIN_COLORS[tile.terrain] || '#1a1a1a'
}

export default function Grid({ tiles = [], onTileClick, layer = 'overview', readonly = false }) {

  // Build a lookup map so we can find tiles by x,y quickly
  const tileMap = {}
  tiles.forEach(t => { tileMap[`${t.x},${t.y}`] = t })

  function handleClick(x, y) {
    if (readonly) return
    if (onTileClick) onTileClick(x, y)
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${GRID_SIZE}, 16px)`,
      gridTemplateRows: `repeat(${GRID_SIZE}, 16px)`,
      gap: '1px',
      background: '#111',
      border: '1px solid #2a4a2a',
      width: 'fit-content',
    }}>
      {Array.from({ length: GRID_SIZE }, (_, y) =>
        Array.from({ length: GRID_SIZE }, (_, x) => {
          const tile = tileMap[`${x},${y}`]
          const color = getTileColor(tile, layer)
          return (
            <div
              key={`${x},${y}`}
              onClick={() => handleClick(x, y)}
              title={`${x},${y}`}
              style={{
                width: 16,
                height: 16,
                background: color,
                cursor: readonly ? 'default' : 'pointer',
                transition: 'filter 0.1s',
              }}
              onMouseEnter={e => { if (!readonly) e.target.style.filter = 'brightness(1.8)' }}
              onMouseLeave={e => { e.target.style.filter = 'brightness(1)' }}
            />
          )
        })
      )}
    </div>
  )
}
