import { useState, useRef, useEffect, useCallback } from 'react'
import styles from './Chapters.module.css'

interface Ghost {
  id: string
  name: string
  icon: string
  audioSrc: string
  poem: string
  description: string
}

interface ChapterRiverProps {
  ghosts: Ghost[]
  onGhostIdentified: (ghost: Ghost) => void
  onAllIdentified: () => void
}

export function ChapterRiver({ ghosts, onGhostIdentified, onAllIdentified }: ChapterRiverProps) {
  const [identified, setIdentified] = useState<Set<string>>(new Set())
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [showPoem, setShowPoem] = useState(false)
  const [currentPoem, setCurrentPoem] = useState<Ghost | null>(null)
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map())

  // 检查是否全部识别
  useEffect(() => {
    if (identified.size === ghosts.length && identified.size > 0) {
      onAllIdentified()
    }
  }, [identified, ghosts.length, onAllIdentified])

  // 播放/暂停音频
  const togglePlay = useCallback((ghost: Ghost) => {
    let audio = audioRefs.current.get(ghost.id)
    
    if (!audio) {
      audio = new Audio(ghost.audioSrc)
      audioRefs.current.set(ghost.id, audio)
      
      audio.addEventListener('ended', () => {
        setPlayingId(null)
      })
    }

    if (playingId === ghost.id) {
      audio.pause()
      setPlayingId(null)
    } else {
      // 停止其他音频
      audioRefs.current.forEach((a, id) => {
        if (id !== ghost.id) {
          a.pause()
          a.currentTime = 0
        }
      })
      
      audio.play().catch(console.error)
      setPlayingId(ghost.id)
    }
  }, [playingId])

  // 识别鬼魂
  const identifyGhost = useCallback((ghost: Ghost) => {
    if (identified.has(ghost.id)) return

    // 停止音频
    const audio = audioRefs.current.get(ghost.id)
    if (audio) {
      audio.pause()
      setPlayingId(null)
    }

    setIdentified(prev => new Set([...prev, ghost.id]))
    setCurrentPoem(ghost)
    setShowPoem(true)
    onGhostIdentified(ghost)

    // 创建识别效果
    createIdentifyEffect()
  }, [identified, onGhostIdentified])

  const createIdentifyEffect = () => {
    const effect = document.createElement('div')
    effect.className = styles.identifyEffect
    effect.innerHTML = '<div class="ripple"></div>'
    document.body.appendChild(effect)
    
    setTimeout(() => effect.remove(), 1500)
  }

  return (
    <div className={styles.chapterContainer}>
      {/* 进度指示 */}
      <div className={styles.progressIndicator}>
        <span className={styles.progressText}>
          已辨识 {identified.size} / {ghosts.length} 个魂灵
        </span>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${(identified.size / ghosts.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 提示 */}
      <div className={styles.riverHint}>
        <p>🌊 点击听声，辨别是哪位亡魂</p>
      </div>

      {/* 鬼魂列表 */}
      <div className={styles.ghostGrid}>
        {ghosts.map((ghost, index) => (
          <div
            key={ghost.id}
            className={`${styles.ghostCard} ${identified.has(ghost.id) ? styles.identified : ''} ${playingId === ghost.id ? styles.playing : ''}`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* 鬼魂图标 */}
            <div className={styles.ghostIcon}>
              <span className={styles.ghostEmoji}>{ghost.icon}</span>
              {identified.has(ghost.id) && (
                <span className={styles.identifiedBadge}>✓</span>
              )}
            </div>

            {/* 播放按钮 */}
            <button
              className={styles.playButton}
              onClick={() => togglePlay(ghost)}
              aria-label={playingId === ghost.id ? '暂停' : '播放'}
            >
              {playingId === ghost.id ? (
                <span className={styles.pauseIcon}>⏸</span>
              ) : (
                <span className={styles.playIcon}>▶</span>
              )}
            </button>

            {/* 音频波形动画 */}
            {playingId === ghost.id && (
              <div className={styles.waveform}>
                {[...Array(5)].map((_, i) => (
                  <span 
                    key={i} 
                    className={styles.waveBar}
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            )}

            {/* 识别按钮 */}
            {!identified.has(ghost.id) ? (
              <button
                className={styles.identifyButton}
                onClick={() => identifyGhost(ghost)}
              >
                辨魂
              </button>
            ) : (
              <div className={styles.ghostName}>{ghost.name}</div>
            )}
          </div>
        ))}
      </div>

      {/* 已识别列表 */}
      {identified.size > 0 && (
        <div className={styles.identifiedList}>
          <h4>已辨识的魂灵：</h4>
          <div className={styles.ghostTags}>
            {ghosts
              .filter(g => identified.has(g.id))
              .map(g => (
                <span key={g.id} className={styles.ghostTag}>
                  {g.icon} {g.name}
                </span>
              ))}
          </div>
        </div>
      )}

      {/* 诗歌弹窗 */}
      {showPoem && currentPoem && (
        <div className={styles.poemModal} onClick={() => setShowPoem(false)}>
          <div className={styles.poemContent} onClick={e => e.stopPropagation()}>
            <button 
              className={styles.closeButton}
              onClick={() => setShowPoem(false)}
            >
              ×
            </button>
            <div className={styles.poemIcon}>{currentPoem.icon}</div>
            <h3 className={styles.poemTitle}>{currentPoem.name}</h3>
            <div className={styles.poemText}>{currentPoem.poem}</div>
            <p className={styles.poemDescription}>{currentPoem.description}</p>
          </div>
        </div>
      )}
    </div>
  )
}