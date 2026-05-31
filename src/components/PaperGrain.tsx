import { useEffect, useRef } from 'react'

export function PaperGrain({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    const parent = canvas.parentElement
    if (!parent) return

    const resize = () => {
      const width = parent.clientWidth
      const height = parent.clientHeight
      const ratio = Math.min(window.devicePixelRatio || 1, 2)

      canvas.width = Math.floor(width * ratio)
      canvas.height = Math.floor(height * ratio)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      context.clearRect(0, 0, width, height)

      // Paper fiber strokes
      for (let i = 0; i < 280; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        const length = 8 + Math.random() * 24
        const angle = Math.random() * Math.PI

        context.strokeStyle = `rgba(92, 69, 46, ${0.02 + Math.random() * 0.035})`
        context.lineWidth = 0.6 + Math.random() * 0.8
        context.beginPath()
        context.moveTo(x, y)
        context.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length)
        context.stroke()
      }

      // Dust specks
      for (let i = 0; i < 800; i++) {
        context.fillStyle = `rgba(54, 39, 24, ${0.012 + Math.random() * 0.025})`
        context.fillRect(Math.random() * width, Math.random() * height, 1.4, 1.4)
      }
    }

    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        opacity: 0.7,
        pointerEvents: 'none',
        mixBlendMode: 'multiply',
      }}
    />
  )
}
