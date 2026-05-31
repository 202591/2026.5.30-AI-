import { useState, useRef, useEffect, useCallback } from 'react'
import styles from './Chapters.module.css'

interface Hotspot {
  id: string
  x: number
  y: number
  width: number
  height: number
  title: string
  text: string
}

interface ChapterFoxProps {
  imageUrl: string
  hotspots: Hotspot[]
  onHotspotClick: (hotspot: Hotspot) => void
  onAllFound: () => void
}

export function ChapterFox({ imageUrl, hotspots, onHotspotClick, onAllFound }: ChapterFoxProps) {
  const [found, setFound] = useState<Set<string>>(new Set())
  const [hintPulse, setHintPulse] = useState(false)
  const imageRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 检查是否全部找到
  useEffect(() => {
    if (found.size === hotspots.length && found.size > 0) {
      onAllFound()
    }
  }, [found, hotspots.length, onAllFound])

  // 每15秒显示一次提示脉冲
  useEffect(() => {
    if (found.size === hotspots.length) return
    
    const interval = setInterval(() => {
      setHintPulse(true)
      setTimeout(() => setHintPulse(false), 2000)
    }, 15000)

    return () => clearInterval(interval)
  }, [found.size, hotspots.length])

  const handleClick = useCallback((e: React.MouseEvent, hotspot: Hotspot) => {
    e.stopPropagation()
    
    if (found.has(hotspot.id)) return

    // 创建点击效果
    createClickEffect(e.clientX, e.clientY)
    
    setFound(prev => new Set([...prev, hotspot.id]))
    onHotspotClick(hotspot)
  }, [found, onHotspotClick])

  const createClickEffect = (x: number, y: number) => {
    const effect = document.createElement('div')
    effect.className = styles.clickEffect
    effect.style.left = `${x}px`
    effect.style.top = `${y}px`
    document.body.appendChild(effect)
    
    setTimeout(() => effect.remove(), 600)
  }

  // 创建狐火效果
  useEffect(() => {
    if (!containerRef.current) return
    
    const container = containerRef.current
    const flames: HTMLDivElement[] = []
    
    for (let i = 0; i < 5; i++) {
      const flame = document.createElement('div')
      flame.className = styles.foxFlame
      flame.style.left = `${20 + Math.random() * 60}%`
      flame.style.top = `${20 + Math.random() * 60}%`
      flame.style.animationDelay = `${i * 0.5}s`
      container.appendChild(flame)
      flames.push(flame)
    }

    return () => {
      flames.forEach(f => f.remove())
    }
  }, [])

  return (
    <div ref={containerRef} className={styles.chapterContainer}>
      {/* 进度指示器 */}
      <div className={styles.progressIndicator}>
        <span className={styles.progressText}>
          已寻得 {found.size} / {hotspots.length} 处异象
        </span>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${(found.size / hotspots.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 主图区域 */}
      <div 
        ref={imageRef}
        className={styles.imageContainer}
        style={{ backgroundImage: `url(${imageUrl})` }}
      >
        {/* 点击热点 */}
        {hotspots.map((hotspot) => (
          <button
            key={hotspot.id}
            className={`${styles.hotspot} ${found.has(hotspot.id) ? styles.found : ''} ${hintPulse && !found.has(hotspot.id) ? styles.pulse : ''}`}
            style={{
              left: `${hotspot.x}%`,
              top: `${hotspot.y}%`,
              width: `${hotspot.width}px`,
              height: `${hotspot.height}px`,
            }}
            onClick={(e) => handleClick(e, hotspot)}
            aria-label={hotspot.title}
          >
            {!found.has(hotspot.id) && (
              <span className={styles.hotspotGlow} />
            )}
            {found.has(hotspot.id) && (
              <span className={styles.foundMark}>✓</span>
            )}
          </button>
        ))}

        {/* 卷一特效：灯笼光晕 */}
        <div className={styles.lanternGlow} />
      </div>

      {/* 已发现列表 */}
      {found.size > 0 && (
        <div className={styles.foundList}>
          <h4>已记录的异象：</h4>
          <ul>
            {hotspots
              .filter(h => found.has(h.id))
              .map(h => (
                <li key={h.id} className={styles.foundItem}>
                  <strong>{h.title}</strong>
                  <p>{h.text}</p>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  )
}