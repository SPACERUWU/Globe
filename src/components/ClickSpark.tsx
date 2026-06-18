import { useRef, useEffect } from 'react'

interface SparkParticle {
  x: number
  y: number
  angle: number
  startTime: number
}

interface ClickSparkProps {
  sparkColor?: string
  sparkSize?: number
  sparkRadius?: number
  sparkCount?: number
  duration?: number
  easing?: string
  extraScale?: number
}

function applyEase(t: number, type: string): number {
  if (type === 'ease-out')    return 1 - (1 - t) ** 3
  if (type === 'ease-in')     return t ** 3
  if (type === 'ease-in-out') return t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2
  return t
}

export function ClickSpark({
  sparkColor  = '#ffffff',
  sparkSize   = 10,
  sparkRadius = 15,
  sparkCount  = 8,
  duration    = 400,
  easing      = 'ease-out',
  extraScale  = 1,
}: ClickSparkProps) {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const particles  = useRef<SparkParticle[]>([])
  const rafRef     = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx    = canvas.getContext('2d')!

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const onClick = (e: MouseEvent) => {
      const now = performance.now()
      for (let i = 0; i < sparkCount; i++) {
        particles.current.push({
          x: e.clientX,
          y: e.clientY,
          angle: (i / sparkCount) * Math.PI * 2,
          startTime: now,
        })
      }
    }
    window.addEventListener('click', onClick)

    const draw = (now: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.current = particles.current.filter(p => {
        const raw = (now - p.startTime) / duration
        if (raw >= 1) return false
        const t    = applyEase(raw, easing)
        const dist = t * sparkRadius * extraScale * 8   // ×8 so sparkRadius=15 → 120px travel

        const px   = p.x + Math.cos(p.angle) * dist
        const py   = p.y + Math.sin(p.angle) * dist
        const size = (sparkSize / 2) * (1 - t)

        // Spark line (tail from 80% back to current pos)
        const prevDist = Math.max(0, applyEase(raw * 0.8, easing)) * sparkRadius * extraScale * 8
        const bx = p.x + Math.cos(p.angle) * prevDist
        const by = p.y + Math.sin(p.angle) * prevDist

        ctx.save()
        ctx.globalAlpha = (1 - t) * 0.9
        ctx.strokeStyle = sparkColor
        ctx.lineWidth   = Math.max(size * 0.9, 0.5)
        ctx.lineCap     = 'round'
        ctx.beginPath()
        ctx.moveTo(bx, by)
        ctx.lineTo(px, py)
        ctx.stroke()

        // Bright tip dot
        ctx.globalAlpha = (1 - t)
        ctx.fillStyle   = sparkColor
        ctx.beginPath()
        ctx.arc(px, py, Math.max(size * 0.55, 0.3), 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()

        return true
      })

      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('click', onClick)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [sparkColor, sparkSize, sparkRadius, sparkCount, duration, easing, extraScale])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9999 }}
      aria-hidden="true"
    />
  )
}
