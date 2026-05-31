import { useState, useRef, useEffect, useCallback } from 'react'
import styles from './Chapters.module.css'

interface MirrorObject {
  id: string
  x: number
  y: number
  width: number
  height: number
  title: string
  text: string
}

interface ChapterMirrorProps {
  imageUrl: string
  objects: MirrorObject[]
  onObjectFound: (obj: MirrorObject) => void
  onAllFound: () => void
}

export function ChapterMirror({ imageUrl, objects, onObjectFound, onAllFound }: ChapterMirrorProps) {
  const [found, setFound] = useState<Set<string>>(new Set())
  const [maskPosition, setMaskPosition] = useState({ x: 50, y: 50 })
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const maskRef = useRef<HTMLDivElement>(null)

  // 检查是否全部找到
  useEffect(() => {
    if (found.size === objects.length && found.size > 0) {
      onAllFound()
    }
  }, [found, objects.length, onAllFound])

  // 拖拽逻辑
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true)
    updateMaskPosition(e)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return
    updateMaskPosition(e)
  }, [isDragging])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const updateMaskPosition = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    setMaskPosition({ x: Math.max(10, Math.min(90, x)), y: Math.max(10, Math.min(90, y)) })
    
    // 检查是否覆盖任何物体
    checkCollisions(x, y)
  }

  const checkCollisions = (maskX: number, maskY: number) => {
    objects.forEach(obj => {
      if (found.has(obj.id)) return
      
      const objCenterX = obj.x + (obj.width / 2) / 10 // 近似计算
      const objCenterY = obj.y + (obj.height / 2) / 10
      
      const distance = Math.sqrt(
        Math.pow(maskX - objCenterX, 2) + Math.pow(maskY - objCenterY, 2)
      )
      
      // 如果镜面中心靠近物体中心
      if (distance < 15) {
        setFound(prev => new Set([...prev, obj.id]))
        onObjectFound(obj)
        createDiscoveryEffect(obj)
      }
    })
  }

  const createDiscoveryEffect = (obj: MirrorObject) => {
    if (!containerRef.current) return
    
    const effect = document.createElement('div')
    effect.className = styles.discoveryEffect
    effect.style.left = `${obj.x}%`
    effect.style.top = `${obj.y}%`
    effect.innerHTML = `
      <div class="${styles.mirrorRipple}"></div>
      <span class="${styles.discoveryText}">${obj.title}</span>
    `
    containerRef.current.appendChild(effect)
    
    setTimeout(() => effect.remove(), 2000)
  }

  // 触摸支持
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true)
    updateMaskPositionFromTouch(e.touches[0])
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return
    e.preventDefault()
    updateMaskPositionFromTouch(e.touches[0])
  }, [isDragging])

  const updateMaskPositionFromTouch = (touch: React.Touch) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = ((touch.clientX - rect.left) / rect.width) * 100
    const y = ((touch.clientY - rect.top) / rect.height) * 100

    setMaskPosition({ x: Math.max(10, Math.min(90, x)), y: Math.max(10, Math.min(90, y)) })
    checkCollisions(x, y)
  }

  return (
    <div className={styles.chapterContainer}>
      {/* 进度指示 */}
      <div className={styles.progressIndicator}>
        <span className={styles.progressText}>
          已照见 {found.size} / {objects.length} 个魂影
        </span>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${(found.size / objects.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 提示文字 */}
      <div className={styles.mirrorHint}>
        <p>🔮 拖动古镜，照见隐藏的魂影</p>
      </div>

      {/* 主图区域 */}
      <div 
        ref={containerRef}
        className={styles.mirrorContainer}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >
        {/* 背景图（模糊/暗化版） */}
        <div 
          className={styles.mirrorBackground}
          style={{ backgroundImage: `url(${imageUrl})` }}
        />

        {/* 遮罩层 */}
        <div className={styles.darkOverlay} />

        {/* 镜面效果 */}
        <div
          ref={maskRef}
          className={styles.mirrorMask}
          style={{
            left: `${maskPosition.x}%`,
            top: `${maskPosition.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* 镜面内清晰图像 */}
          <div 
            className={styles.mirrorClearView}
            style={{
              backgroundImage: `url(${imageUrl})`,
              backgroundPosition: `${maskPosition.x}% ${maskPosition.y}%`,
            }}
          />
          {/* 镜框装饰 */}
          <div className={styles.mirrorFrame}>
            <div className={styles.mirrorPattern} />
          </div>
        </div>

        {/* 已发现标记 */}
        {objects.map(obj => (
          found.has(obj.id) && (
            <div
              key={obj.id}
              className={styles.foundMarker}
              style={{
                left: `${obj.x}%`,
                top: `${obj.y}%`,
              }}
            >
              <span className={styles.foundMark}>✓</span>
            </div>
          )
        ))}
      </div>

      {/* 已发现列表 */}
      {found.size > 0 && (
        <div className={styles.foundList}>
          <h4>照见的魂影：</h4>
          <ul>
            {objects
              .filter(o => found.has(o.id))
              .map(o => (
                <li key={o.id} className={styles.foundItem}>
                  <strong>{o.title}</strong>
                  <p>{o.text}</p>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  )
}