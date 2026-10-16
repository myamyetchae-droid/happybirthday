import { useEffect, useRef, useState } from 'react'
import './App.css'

const colors = ['#ff6b81', '#feca57', '#48dbfb', '#ff9ff3', '#1dd1a1', '#ff9f43', '#5f27cd']

const rand = (min, max) => Math.random() * (max - min) + min

function drawHeart(ctx, x, y, s, color) {
  ctx.save()
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(x, y + s * 0.3)
  ctx.bezierCurveTo(x - s, y - s * 0.3, x - s, y + s * 0.6, x, y + s)
  ctx.bezierCurveTo(x + s, y + s * 0.6, x + s, y - s * 0.3, x, y + s * 0.3)
  ctx.fill()
  ctx.restore()
}

function drawBalloon(ctx, x, y, color, twist, scale) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale, scale)
  ctx.translate(-x, -y)
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.ellipse(x, y, 26, 32, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.beginPath()
  ctx.ellipse(x - 8, y - 12, 6, 10, -0.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.75)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(x, y + 32)
  ctx.quadraticCurveTo(x + twist, y + 58, x, y + 86)
  ctx.stroke()
  ctx.restore()
}

function drawCake(ctx, cx, cy, scale) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(scale, scale)
  ctx.translate(-cx, -cy)
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.ellipse(cx, cy + 40, 84, 26, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(0,0,0,0.1)'
  ctx.lineWidth = 2
  ctx.stroke()

  const grad = ctx.createLinearGradient(cx - 70, cy - 30, cx + 70, cy + 40)
  grad.addColorStop(0, '#ff9a9e')
  grad.addColorStop(1, '#fad0c4')
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.moveTo(cx - 70, cy - 10)
  ctx.lineTo(cx + 70, cy - 10)
  ctx.quadraticCurveTo(cx + 76, cy + 40, cx + 60, cy + 40)
  ctx.lineTo(cx - 60, cy + 40)
  ctx.quadraticCurveTo(cx - 76, cy + 40, cx - 70, cy - 10)
  ctx.fill()

  ctx.fillStyle = '#fff5f7'
  ctx.beginPath()
  for (let i = 0; i < 7; i++) {
    ctx.arc(cx - 57 + i * 19, cy - 8, 13, Math.PI, 0)
  }
  ctx.fill()

  const candleX = [cx - 30, cx, cx + 30]
  candleX.forEach(x => {
    ctx.fillStyle = '#5f27cd'
    ctx.fillRect(x - 4, cy - 40, 8, 30)
    ctx.fillStyle = '#ff9f43'
    ctx.beginPath()
    ctx.ellipse(x, cy - 46, 5, 9, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.ellipse(x, cy - 48, 2, 4, 0, 0, Math.PI * 2)
    ctx.fill()
  })
  ctx.restore()
}

function drawLibra(ctx, x, y, scale) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale, scale)
  ctx.translate(-x, -y)

  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 8
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  const r = 16
  const half = 24

  ctx.beginPath()
  ctx.arc(x, y - r, r, 0, Math.PI, true)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(x - half, y)
  ctx.lineTo(x + half, y)
  ctx.stroke()

  ctx.restore()
}

function App() {
  const canvasRef = useRef(null)
  const ctxRef = useRef(null)
  const sizeRef = useRef({ w: 0, h: 0 })
  const starsRef = useRef([])
  const balloonsRef = useRef([])
  const confettiRef = useRef([])
  const rafRef = useRef(null)
  const photoRef = useRef(null)
  const burstRef = useRef([])
  const [showMessage, setShowMessage] = useState(false)

  const setup = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    ctxRef.current = ctx
    sizeRef.current = { w: rect.width, h: rect.height }

    const { w, h } = sizeRef.current
    starsRef.current = Array.from({ length: 40 }, () => ({
      x: rand(0, w),
      y: rand(0, h * 0.5),
      r: rand(1, 2.5),
      a: rand(0.2, 0.8)
    }))
    balloonsRef.current = [
      { x: w * 0.2, y: h * 0.32, color: '#ff6b81', twist: rand(-6, 6) },
      { x: w * 0.8, y: h * 0.28, color: '#48dbfb', twist: rand(-6, 6) },
      { x: w * 0.12, y: h * 0.48, color: '#ff9ff3', twist: rand(-6, 6) },
      { x: w * 0.88, y: h * 0.45, color: '#feca57', twist: rand(-6, 6) }
    ]
    makeConfetti()
  }

  const makeConfetti = () => {
    const { w, h } = sizeRef.current
    confettiRef.current = Array.from({ length: 90 }, () => ({
      x: rand(0, w),
      y: rand(-h, 0),
      r: rand(3, 7),
      color: colors[Math.floor(rand(0, colors.length))],
      speed: rand(1, 3.5),
      sway: rand(0.5, 2),
      phase: rand(0, Math.PI * 2)
    }))
  }

  const drawSky = () => {
    const ctx = ctxRef.current
    const { w, h } = sizeRef.current
    if (!ctx) return

    ctx.clearRect(0, 0, w, h)

    const sky = ctx.createLinearGradient(0, 0, 0, h)
    sky.addColorStop(0, '#2c3e50')
    sky.addColorStop(1, '#fd79a8')
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, w, h)

    starsRef.current.forEach(s => {
      ctx.fillStyle = `rgba(255,255,255,${s.a})`
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
      ctx.fill()
    })

    const sceneScale = Math.max(0.55, Math.min(1, w / 700))

    drawHeart(ctx, w / 2, h * 0.22, 70 * sceneScale, 'rgba(255, 107, 129, 0.35)')

    balloonsRef.current.forEach(b => drawBalloon(ctx, b.x, b.y, b.color, b.twist, sceneScale))
  }

  const drawForeground = () => {
    const ctx = ctxRef.current
    const { w, h } = sizeRef.current
    if (!ctx) return

    const sceneScale = Math.max(0.55, Math.min(1, w / 700))
    const titleSize = Math.max(24, Math.min(44, w * 0.075))
    const captionSize = Math.max(13, Math.min(20, w * 0.04))

    ctx.save()
    ctx.textAlign = 'center'
    ctx.fillStyle = '#fff'
    ctx.font = `bold ${titleSize}px system-ui, sans-serif`
    ctx.shadowColor = 'rgba(0,0,0,0.35)'
    ctx.shadowBlur = 10
    ctx.fillText('Happy Birthday, Chit Tun!', w / 2, h * 0.14)
    ctx.restore()

    const photo = photoRef.current
    if (photo && photo.complete) {
      const r = Math.min(w * 0.19, h * 0.12)
      const s = Math.min(photo.naturalWidth, photo.naturalHeight)
      const sx = (photo.naturalWidth - s) / 2
      const sy = (photo.naturalHeight - s) / 2
      const py = h * 0.45

      ctx.save()
      ctx.beginPath()
      ctx.arc(w / 2, py, r, 0, Math.PI * 2)
      ctx.clip()
      ctx.drawImage(photo, sx, sy, s, s, w / 2 - r, py - r, 2 * r, 2 * r)
      ctx.restore()

      ctx.save()
      ctx.beginPath()
      ctx.arc(w / 2, py, r + 3, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)'
      ctx.lineWidth = 4
      ctx.stroke()
      ctx.restore()
    }

    const cakeY = h * 0.68 + 10
    drawCake(ctx, w / 2, cakeY, sceneScale)

    const clickFont = Math.max(10, 14 * sceneScale)
    ctx.save()
    ctx.textAlign = 'center'
    ctx.font = `bold ${clickFont}px system-ui, sans-serif`
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
    ctx.shadowColor = 'rgba(0,0,0,0.35)'
    ctx.shadowBlur = 5
    ctx.fillText('Click me', w / 2, cakeY + 12 * sceneScale)
    ctx.restore()

    const cakeBottom = cakeY + 66 * sceneScale
    const iconScale = sceneScale * 0.6

    const text = '18 October'
    const padX = 22 * sceneScale
    const padY = 8 * sceneScale
    const radius = 16 * sceneScale

    ctx.save()
    ctx.textAlign = 'center'
    ctx.fillStyle = '#fff'
    ctx.font = `${captionSize}px system-ui, sans-serif`

    const textWidth = ctx.measureText(text).width
    const badgeW = textWidth + padX * 2
    const badgeH = captionSize + padY * 2
    const badgeY = cakeBottom + badgeH / 2 + 10 * sceneScale
    const badgeX = w / 2 - badgeW / 2
    const badgeTop = badgeY - badgeH / 2

    const grad = ctx.createLinearGradient(badgeX, badgeTop, badgeX + badgeW, badgeTop + badgeH)
    grad.addColorStop(0, 'rgba(255, 107, 129, 0.3)')
    grad.addColorStop(1, 'rgba(254, 202, 87, 0.3)')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.roundRect(badgeX, badgeTop, badgeW, badgeH, radius)
    ctx.fill()
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.lineWidth = Math.max(1, 2 * sceneScale)
    ctx.stroke()

    ctx.fillStyle = '#fff'
    ctx.fillText(text, w / 2, badgeY + captionSize * 0.35)
    ctx.restore()

    const iconY = badgeTop + badgeH + captionSize + 20 * iconScale
    drawLibra(ctx, w / 2, iconY, iconScale)
  }

  const draw = () => {
    const ctx = ctxRef.current
    const { w, h } = sizeRef.current
    drawSky()
    confettiRef.current.forEach(p => {
      p.y += p.speed
      p.x += Math.sin(p.phase + p.y / 40) * p.sway
      if (p.y > h + 10) p.y = -10
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fill()
    })
    drawForeground()

    burstRef.current = burstRef.current.filter(p => {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.12
      p.life--
      if (p.x < -20 || p.x > w + 20 || p.y > h + 20 || p.life <= 0) return false
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fill()
      return true
    })

    rafRef.current = requestAnimationFrame(draw)
  }

  const handleResize = () => setup()

  const handleClick = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const { w, h } = sizeRef.current
    const sceneScale = Math.max(0.55, Math.min(1, w / 700))
    const cakeY = h * 0.68 + 10
    const halfW = 85 * sceneScale
    const top = cakeY - 55 * sceneScale
    const bottom = cakeY + 66 * sceneScale

    if (mx >= w / 2 - halfW && mx <= w / 2 + halfW && my >= top && my <= bottom) {
      setShowMessage(true)
      const bx = w / 2
      const by = cakeY
      burstRef.current = Array.from({ length: 100 }, () => {
        const angle = rand(0, Math.PI * 2)
        const speed = rand(4, 11)
        return {
          x: bx,
          y: by,
          r: rand(3, 8),
          color: colors[Math.floor(rand(0, colors.length))],
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: rand(40, 80)
        }
      })
    }
  }

  useEffect(() => {
    setup()
    draw()
    const photo = new Image()
    photo.src = '/viber_image_2026-10-17_00-46-29-497.jpg'
    photo.onload = () => { photoRef.current = photo }
    window.addEventListener('resize', handleResize)
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <>
      <div className="birthday-page">
        <canvas
          ref={canvasRef}
          className="wish-canvas"
          onClick={handleClick}
        />
      </div>
      {showMessage && (
        <div className="modal" onClick={() => setShowMessage(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <p>
              May pure happiness find you on your birthday and never leave.
              Your Gemini will always be right here by your side to support you,
              my Libra, year after year.
            </p>
            <button
              className="close-heart"
              onClick={() => setShowMessage(false)}
              aria-label="Close"
            >
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default App
