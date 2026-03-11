'use client'

import { useLayoutEffect, useRef, useState } from 'react'

// ─── Internal SVG coordinate system ───────────────────────────────────────────
const H = 100                         // SVG height units (= 1 "font-size" unit)
const BASELINE = H * 0.82             // text baseline within viewBox
const TRI_X = H * 0.866              // equilateral-triangle apex X  (√3/2 × H)
const SUN_X = TRI_X / 3              // sun centre = centroid of triangle (x)
const SUN_Y = H / 2                  // sun centre (y)
const SUN_R = H * 0.11               // sun inner circle radius
const RAY_LEN = H * 0.235            // ray tip distance from centre
const STAR_R = H * 0.072             // star outer radius
const STAR_R_INNER = STAR_R * 0.382  // star inner radius (golden ratio)
const RAY_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315]

// 3 stars placed at the 3 corners of the white triangle (slightly inset)
const STARS = [
    { x: 13, y: 15 },  // top-left corner
    { x: 13, y: H - 15 },  // bottom-left corner
    { x: TRI_X - 14, y: SUN_Y },  // right apex
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function starPoints(cx: number, cy: number): string {
    return Array.from({ length: 10 }, (_, i) => {
        const angle = (i * 36 - 90) * (Math.PI / 180)
        const r = i % 2 === 0 ? STAR_R : STAR_R_INNER
        return `${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`
    }).join(' ')
}

function rayPoints(angleDeg: number): string {
    const a = angleDeg * (Math.PI / 180)
    const tip = `${SUN_X + Math.cos(a) * RAY_LEN},${SUN_Y + Math.sin(a) * RAY_LEN}`
    const l1 = `${SUN_X + Math.cos(a - 0.20) * SUN_R},${SUN_Y + Math.sin(a - 0.20) * SUN_R}`
    const l2 = `${SUN_X + Math.cos(a + 0.20) * SUN_R},${SUN_Y + Math.sin(a + 0.20) * SUN_R}`
    const mid = SUN_R + (RAY_LEN - SUN_R) * 0.48
    const m1 = `${SUN_X + Math.cos(a - 0.11) * mid},${SUN_Y + Math.sin(a - 0.11) * mid}`
    const m2 = `${SUN_X + Math.cos(a + 0.11) * mid},${SUN_Y + Math.sin(a + 0.11) * mid}`
    return `${l1} ${m1} ${tip} ${m2} ${l2}`
}

// ─── Component ────────────────────────────────────────────────────────────────
export function PhilippinesFlagText() {
    const textRef = useRef<SVGTextElement>(null)
    const [textW, setTextW] = useState(H * 6.5) // reasonable initial estimate

    useLayoutEffect(() => {
        if (textRef.current) {
            const len = textRef.current.getComputedTextLength()
            if (len > 0) setTextW(len)
        }
    }, [])

    // CSS dimensions: height matches surrounding font-size, width scaled proportionally
    const cssWidth = `${(textW / H).toFixed(3)}em`
    const cssHeight = '1em'

    return (
        <svg
            style={{
                display: 'inline-block',
                width: cssWidth,
                height: cssHeight,
                verticalAlign: '-0.12em',   // align baseline to surrounding text
                overflow: 'visible',
            }}
            viewBox={`0 0 ${textW} ${H}`}
            aria-label="Philippines"
        >
            <defs>
                {/*
                 * The <text> here defines the CLIP SHAPE only — not the visible text.
                 * It inherits font-family/weight from the parent <h1> via CSS cascade,
                 * so the letter shapes match the surrounding headline exactly.
                 */}
                <clipPath id="ph-flag-text-clip">
                    <text
                        ref={textRef}
                        x="0"
                        y={BASELINE}
                        fontSize={H}
                        fontFamily="inherit"
                        fontWeight="inherit"
                        letterSpacing="inherit"
                    >
                        Philippines
                    </text>
                </clipPath>
            </defs>

            {/* ── Flag contents, clipped to the text shape ── */}
            <g clipPath="url(#ph-flag-text-clip)">

                {/* 🔴 Red — bottom half */}
                <rect width={textW} height={H} fill="#CE1126" />

                {/* 🔵 Blue — top half */}
                <rect width={textW} height={H / 2} fill="#0038A8" />

                {/* ⬜ White equilateral triangle (left side) */}
                <polygon
                    points={`0,0 0,${H} ${TRI_X},${SUN_Y}`}
                    fill="#FFFFFF"
                />

                {/* ☀️ 8 sun rays */}
                {RAY_ANGLES.map(a => (
                    <polygon key={a} points={rayPoints(a)} fill="#FCD116" />
                ))}

                {/* ☀️ Sun inner circle */}
                <circle cx={SUN_X} cy={SUN_Y} r={SUN_R} fill="#FCD116" />

                {/* ⭐ 3 five-pointed stars at triangle corners */}
                {STARS.map((s, i) => (
                    <polygon key={i} points={starPoints(s.x, s.y)} fill="#FCD116" />
                ))}

            </g>
        </svg>
    )
}
