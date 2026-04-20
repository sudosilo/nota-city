// NOTA CITY - src/lib/rules.js
// Placement validation rules. All zone/road/power/water placement
// goes through these functions before hitting the API.
// Returns { allowed: bool, reason: string }

// Build a tile lookup map from the tiles array
export function buildTileMap(tiles) {
  const map = {}
  tiles.forEach(t => { map[`${t.x},${t.y}`] = t })
  return map
}

// Get the 4 cardinal neighbors of a tile
export function getNeighbors(x, y, tileMap) {
  return [
    tileMap[`${x},${y-1}`],
    tileMap[`${x},${y+1}`],
    tileMap[`${x-1},${y}`],
    tileMap[`${x+1},${y}`],
  ].filter(Boolean)
}

// ZONE PLACEMENT RULES
// - Cannot place on a road tile
// - Must have at least one adjacent road tile
export function canPlaceZone(x, y, zoneType, tileMap) {
  if (zoneType === 'empty') return { allowed: true }

  const tile = tileMap[`${x},${y}`]

  // Cannot zone a road tile
  if (tile && tile.road_type !== 'none') {
    return { allowed: false, reason: 'Cannot zone a road tile' }
  }

  // Must have adjacent road
  const neighbors = getNeighbors(x, y, tileMap)
  const hasRoad = neighbors.some(n => n.road_type && n.road_type !== 'none')
  if (!hasRoad) {
    return { allowed: false, reason: 'Zone requires an adjacent road' }
  }

  return { allowed: true }
}

// ROAD PLACEMENT RULES
// - Cannot place on a zone tile
export function canPlaceRoad(x, y, roadType, tileMap) {
  if (roadType === 'none') return { allowed: true }

  const tile = tileMap[`${x},${y}`]

  // Cannot road a zone tile
  if (tile && tile.zone_type !== 'empty') {
    return { allowed: false, reason: 'Cannot place road on a zone tile' }
  }

  return { allowed: true }
}

// POWER PLACEMENT RULES
// - Power can share tiles with roads
// - Cannot place on a zone tile
export function canPlacePower(x, y, powerType, tileMap) {
  if (powerType === 'none') return { allowed: true }

  const tile = tileMap[`${x},${y}`]

  if (tile && tile.zone_type !== 'empty') {
    return { allowed: false, reason: 'Cannot place power infrastructure on a zone tile' }
  }

  return { allowed: true }
}

// WATER PLACEMENT RULES
// - Water can share tiles with roads
// - Cannot place on a zone tile
export function canPlaceWater(x, y, waterType, tileMap) {
  if (waterType === 'none') return { allowed: true }

  const tile = tileMap[`${x},${y}`]

  if (tile && tile.zone_type !== 'empty') {
    return { allowed: false, reason: 'Cannot place water infrastructure on a zone tile' }
  }

  return { allowed: true }
}

// CONNECTIVITY CHECK - flood fill
// Used to determine if a zone tile is connected to a source
// (power plant or water tower) through roads or adjacent served tiles
// Returns a Set of "x,y" strings that are connected to any source tile
export function getConnectedTiles(tiles, sourceCheck, conductorCheck) {
  const tileMap = buildTileMap(tiles)
  const visited = new Set()
  const queue = []

  // Seed the queue with all source tiles
  tiles.forEach(t => {
    if (sourceCheck(t)) {
      queue.push(t)
      visited.add(`${t.x},${t.y}`)
    }
  })

  // BFS flood fill through conductors and zones
  while (queue.length > 0) {
    const current = queue.shift()
    const neighbors = getNeighbors(current.x, current.y, tileMap)
    neighbors.forEach(n => {
      const key = `${n.x},${n.y}`
      if (!visited.has(key) && conductorCheck(n)) {
        visited.add(key)
        queue.push(n)
      }
    })
  }

  return visited
}

// Check which zones have power
// Source: power plant tiles
// Conductor: road tiles with power, or zone tiles adjacent to powered tiles
export function getPoweredZones(tiles) {
  return getConnectedTiles(
    tiles,
    t => t.power_type === 'plant',
    t => t.power_type !== 'none' || t.zone_type !== 'empty'
  )
}

// Check which zones have water
// Source: water tower tiles
// Conductor: road tiles with water pipe, or zone tiles adjacent to served tiles
export function getWaterServedZones(tiles) {
  return getConnectedTiles(
    tiles,
    t => t.water_type === 'tower',
    t => t.water_type !== 'none' || t.zone_type !== 'empty'
  )
}
