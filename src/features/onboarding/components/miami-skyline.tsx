import { useId } from 'react'

import { cn } from '../../../lib/cn'

interface MiamiSkylineProps {
  className?: string
}

interface Building {
  readonly x: number
  readonly width: number
  readonly top: number
}

interface WindowCell {
  readonly key: string
  readonly x: number
  readonly y: number
  readonly fill: string
  readonly opacity: number
}

interface Star {
  readonly key: string
  readonly cx: number
  readonly cy: number
  readonly r: number
  readonly opacity: number
}

interface Ripple {
  readonly key: string
  readonly y: number
  readonly height: number
  readonly opacity: number
}

const skylineWidth = 440
const skylineHeight = 300
const groundY = 190
const waterHeight = skylineHeight - groundY

// The reflection mirrors about the waterline and stretches slightly, the way a
// still bay elongates what it copies.
const reflectionStretch = 1.12
const reflectionOrigin = groundY * (1 + reflectionStretch)

const windowFills = [
  'var(--color-mint)',
  'var(--color-aqua)',
  'var(--color-magenta-deep)',
]

const distantBuildings: readonly Building[] = [
  { x: 2, width: 26, top: 150 },
  { x: 30, width: 18, top: 138 },
  { x: 50, width: 28, top: 128 },
  { x: 80, width: 20, top: 144 },
  { x: 102, width: 30, top: 118 },
  { x: 134, width: 22, top: 132 },
  { x: 158, width: 34, top: 108 },
  { x: 194, width: 24, top: 124 },
  { x: 220, width: 30, top: 100 },
  { x: 252, width: 20, top: 120 },
  { x: 274, width: 32, top: 112 },
  { x: 308, width: 22, top: 134 },
  { x: 332, width: 28, top: 118 },
  { x: 362, width: 20, top: 140 },
  { x: 384, width: 30, top: 126 },
  { x: 416, width: 24, top: 148 },
]

const nearBuildings: readonly Building[] = [
  { x: -4, width: 36, top: 168 },
  { x: 28, width: 26, top: 176 },
  { x: 50, width: 40, top: 160 },
  { x: 86, width: 30, top: 172 },
  { x: 112, width: 36, top: 156 },
  { x: 144, width: 28, top: 170 },
  { x: 168, width: 44, top: 164 },
  { x: 208, width: 30, top: 174 },
  { x: 234, width: 38, top: 158 },
  { x: 268, width: 32, top: 170 },
  { x: 296, width: 42, top: 166 },
  { x: 334, width: 30, top: 176 },
  { x: 360, width: 36, top: 162 },
  { x: 392, width: 52, top: 172 },
]

const spires = [
  { key: 'spire-a', x: 173, width: 3, top: 86 },
  { key: 'spire-b', x: 233, width: 3.4, top: 74 },
  { key: 'spire-c', x: 288, width: 2.6, top: 94 },
]

const leftPalmFronds = [
  'M20 152C2 138-14 136-28 144',
  'M20 152C8 130 4 112 12 96',
  'M20 152C34 128 52 120 68 122',
  'M20 152C40 148 56 152 68 164',
  'M20 152C2 156-12 166-18 182',
  'M20 152C26 130 38 114 54 106',
  'M20 152C6 146-8 142-20 130',
]

const rightPalmFronds = [
  'M420 194C406 182 392 180 380 186',
  'M420 194C414 176 414 162 420 150',
  'M420 194C432 178 444 172 456 174',
  'M420 194C434 192 444 196 452 204',
  'M420 194C406 196 396 202 390 212',
]

// A fixed hash keeps the skyline identical between renders and between the city
// and its reflection, so nothing shimmers on re-render.
function hashUnit(seed: number): number {
  const value = Math.sin(seed * 127.1) * 43758.5453
  return value - Math.floor(value)
}

function round(value: number, places: number): number {
  return Number(value.toFixed(places))
}

function buildWindows(
  buildings: readonly Building[],
  group: string,
  litRatio: number,
): readonly WindowCell[] {
  const cells: WindowCell[] = []

  buildings.forEach((building, buildingIndex) => {
    const columns = Math.max(1, Math.floor((building.width - 4) / 6))
    const rows = Math.floor((groundY - building.top - 8) / 9)

    for (let column = 0; column < columns; column += 1) {
      for (let row = 0; row < rows; row += 1) {
        const seed = buildingIndex * 977 + column * 53 + row * 7 + 1

        if (hashUnit(seed) > litRatio) {
          continue
        }

        cells.push({
          key: `${group}-${buildingIndex}-${column}-${row}`,
          x: building.x + 3 + column * 6,
          y: building.top + 7 + row * 9,
          fill: windowFills[Math.floor(hashUnit(seed + 311) * windowFills.length)],
          opacity: round(0.42 + hashUnit(seed + 733) * 0.52, 2),
        })
      }
    }
  })

  return cells
}

const distantWindows = buildWindows(distantBuildings, 'far', 0.46)
const nearWindows = buildWindows(nearBuildings, 'near', 0.3)

const stars: readonly Star[] = Array.from({ length: 24 }, (_, index) => {
  const seed = index + 3

  return {
    key: `star-${index}`,
    cx: round(hashUnit(seed * 3.1) * 434 + 3, 1),
    cy: round(hashUnit(seed * 7.7) * 92 + 6, 1),
    r: round(0.7 + hashUnit(seed * 11.3) * 0.85, 2),
    opacity: round(0.28 + hashUnit(seed * 5.9) * 0.58, 2),
  }
})

const ripples: readonly Ripple[] = Array.from({ length: 14 }, (_, index) => ({
  key: `ripple-${index}`,
  y: round(193 + index * 7.8, 1),
  height: round(0.9 + hashUnit(index + 51) * 1.1, 2),
  opacity: round(0.34 + hashUnit(index + 91) * 0.3, 2),
}))

export function MiamiSkyline({ className }: MiamiSkylineProps) {
  const rawId = useId()
  const skyId = `${rawId}-sky`
  const horizonId = `${rawId}-horizon`
  const waterId = `${rawId}-water`
  const fadeId = `${rawId}-fade`
  const reflectionMaskId = `${rawId}-reflection`
  const moonMaskId = `${rawId}-moon`
  const cityId = `${rawId}-city`

  return (
    <svg
      viewBox={`0 0 ${skylineWidth} ${skylineHeight}`}
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
      className={cn(
        'block size-full',
        '[mask-image:linear-gradient(to_bottom,black_0%,black_66%,transparent_100%)]',
        className,
      )}
    >
      <defs>
        <linearGradient id={skyId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-midnight-950)" />
          <stop offset="46%" stopColor="var(--color-midnight-900)" />
          <stop offset="100%" stopColor="var(--color-midnight-850)" />
        </linearGradient>

        <radialGradient id={horizonId} cx="50%" cy="100%" r="76%">
          <stop
            offset="0%"
            stopColor="var(--color-magenta-deep)"
            stopOpacity="0.5"
          />
          <stop
            offset="52%"
            stopColor="var(--color-violet-deep)"
            stopOpacity="0.22"
          />
          <stop
            offset="100%"
            stopColor="var(--color-violet-deep)"
            stopOpacity="0"
          />
        </radialGradient>

        <linearGradient id={waterId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-midnight-900)" />
          <stop offset="100%" stopColor="var(--color-midnight-950)" />
        </linearGradient>

        <linearGradient id={fadeId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.4" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>

        <mask
          id={reflectionMaskId}
          maskUnits="userSpaceOnUse"
          x="0"
          y={groundY}
          width={skylineWidth}
          height={waterHeight}
        >
          <rect
            x="0"
            y={groundY}
            width={skylineWidth}
            height={waterHeight}
            fill={`url(#${fadeId})`}
          />
        </mask>

        <mask
          id={moonMaskId}
          maskUnits="userSpaceOnUse"
          x="348"
          y="48"
          width="52"
          height="52"
        >
          <circle cx="372" cy="74" r="18" fill="white" />
          <circle cx="381" cy="65" r="16" fill="black" />
        </mask>

        <g id={cityId}>
          {distantBuildings.map((building) => (
            <rect
              key={`far-${building.x}`}
              x={building.x}
              y={building.top}
              width={building.width}
              height={groundY - building.top}
              className="fill-midnight-700"
            />
          ))}

          {spires.map((spire) => (
            <g key={spire.key}>
              <rect
                x={spire.x}
                y={spire.top}
                width={spire.width}
                height={groundY - spire.top}
                className="fill-midnight-700"
              />
              <circle
                cx={spire.x + spire.width / 2}
                cy={spire.top - 2}
                r="1.8"
                className="fill-magenta-neon"
                opacity="0.85"
              />
            </g>
          ))}

          {distantWindows.map((cell) => (
            <rect
              key={cell.key}
              x={cell.x}
              y={cell.y}
              width="2.4"
              height="3.2"
              fill={cell.fill}
              opacity={cell.opacity}
            />
          ))}

          <rect
            x="0"
            y="181"
            width={skylineWidth}
            height="9"
            className="fill-aqua"
            opacity="0.14"
          />

          {nearBuildings.map((building) => (
            <rect
              key={`near-${building.x}`}
              x={building.x}
              y={building.top}
              width={building.width}
              height={groundY - building.top + 1}
              className="fill-midnight-800"
            />
          ))}

          {nearWindows.map((cell) => (
            <rect
              key={cell.key}
              x={cell.x}
              y={cell.y}
              width="2.4"
              height="3.2"
              fill={cell.fill}
              opacity={cell.opacity}
            />
          ))}
        </g>
      </defs>

      <rect width={skylineWidth} height={skylineHeight} fill={`url(#${skyId})`} />
      <ellipse cx="220" cy="198" rx="256" ry="100" fill={`url(#${horizonId})`} />

      {stars.map((star) => (
        <circle
          key={star.key}
          cx={star.cx}
          cy={star.cy}
          r={star.r}
          className="fill-midnight-50"
          opacity={star.opacity}
        />
      ))}

      <circle cx="372" cy="74" r="34" className="fill-mint" opacity="0.07" />
      <circle
        cx="372"
        cy="74"
        r="18"
        className="fill-midnight-100"
        mask={`url(#${moonMaskId})`}
      />

      <use href={`#${cityId}`} />

      <rect
        y={groundY}
        width={skylineWidth}
        height={waterHeight}
        fill={`url(#${waterId})`}
      />

      <g mask={`url(#${reflectionMaskId})`}>
        <g
          transform={`translate(0 ${reflectionOrigin}) scale(1 -${reflectionStretch})`}
        >
          <use href={`#${cityId}`} />
        </g>
      </g>

      {ripples.map((ripple) => (
        <rect
          key={ripple.key}
          x="0"
          y={ripple.y}
          width={skylineWidth}
          height={ripple.height}
          className="fill-midnight-950"
          opacity={ripple.opacity}
        />
      ))}

      <rect
        x="0"
        y="188.6"
        width={skylineWidth}
        height="1.4"
        className="fill-aqua"
        opacity="0.36"
      />

      <g
        fill="none"
        strokeLinecap="round"
        className="stroke-midnight-950"
        opacity="0.94"
      >
        <path d="M26 300C18 246 12 200 20 152" strokeWidth="6" />
        {leftPalmFronds.map((frond) => (
          <path key={frond} d={frond} strokeWidth="3.4" />
        ))}
        <path d="M424 300C428 258 428 224 420 194" strokeWidth="4.6" />
        {rightPalmFronds.map((frond) => (
          <path key={frond} d={frond} strokeWidth="2.8" />
        ))}
      </g>

      <g className="fill-midnight-950" opacity="0.94">
        <circle cx="16" cy="156" r="2.6" />
        <circle cx="24" cy="159" r="2.2" />
        <circle cx="416" cy="197" r="2" />
      </g>
    </svg>
  )
}
