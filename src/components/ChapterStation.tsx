import { useState, useRef, useEffect, useCallback } from 'react'
import styles from './Chapters.module.css'

interface Sound {
  id: string
  name: string
  icon: string
  audioSrc: string
  correctPosition: 'left' | 'right' | 'center'
  story: string
}

interface ChapterStationProps {
  sounds: Sound[]
  currentSoundIndex: number
  onPositionSelected: (position: 'left' | 'right' | 'center', isCorrect: boolean) => void
  onAllCompleted: () => void
}

export function ChapterStation({ 
  sounds, 
  currentSoundIndex, 
  onPositionSelected,
  onAllCompleted 
}: ChapterStationProps) {
  const [playing, setPlaying] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<'left' | 'right' | 'center' | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const pannerRef = useRef<StereoPannerNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)

  const currentSound = sounds[currentSoundIndex]

  // 检查是否全部完成
  useEffect(() => {
    if (currentSoundIndex >= sounds.length && sounds.length > 0) {
      onAllCompleted()
    }
  }, [currentSoundIndex, sounds.length, onAllCompleted])

  // 初始化音频上下文
  useEffect(() => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    audioContextRef.current = ctx
    
    return () => {
      ctx.close()
    }
  }, [])

  // 加载新的音频
  useEffect(() => {
    if (!currentSound) return

    // 清理旧的音频
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    // 创建新的音频
    const audio = new Audio(currentSound.audioSrc)
    audio.loop = true
    audioRef.current = audio

    // 创建音频节点
    if (audioContextRef.current) {
      const source = audioContextRef.current.createMediaElementSource(audio)
      const panner = audioContextRef.current.createStereoPanner()
      
      source.connect(panner)
      panner.connect(audioContextRef.current.destination)
      
      sourceRef.current = source
      pannerRef.current = panner
      
      // 根据正确答案设置声像
      switch (currentSound.correctPosition) {
        case 'left':
          panner.pan.value = -0.8
          break
        case 'right':
          panner.pan.value = 0.8
          break
        case 'center':
          panner.pan.value = 0
          break
      }
    }

    setPlaying(false)
    setSelectedPosition(null)
    setShowResult(false)

    return () => {
      audio.pause()
    }
  }, [currentSound])

  // 播放/暂停
  const togglePlay = useCallback(() => {
    if (!audioRef.current) return

    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      // 恢复 AudioContext
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume()
      }
      
      audioRef.current.play().catch(console.error)
      setPlaying(true)
    }
  }, [playing])

  // 选择位置
  const selectPosition = useCallback((position: 'left' | 'right' | 'center') => {
    if (showResult) return
    
    setSelectedPosition(position)
    const correct = position === currentSound.correctPosition
    setIsCorrect(correct)
    setShowResult(true)
    
    // 停止播放
    if (audioRef.current) {
      audioRef.current.pause()
      setPlaying(false)
    }

    onPositionSelected(position, correct)
  }, [currentSound, showResult, onPositionSelected])

  if (!currentSound) {
    return (
      <div className={styles.chapterContainer}>
        <div className={styles.completionMessage}>
          <h3>🌙 你已听遍所有驿站夜声</h3>
          <p>继续前往下一卷...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.chapterContainer}>
      {/* 进度指示 */}
      <div className={styles.progressIndicator}>
        <span className={styles.progressText}>
          夜声 {currentSoundIndex + 1} / {sounds.length}
        </span>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${((currentSoundIndex + 1) / sounds.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 提示 */}
      <div className={styles.stationHint}>
        <p>🎧 戴上耳机，听声辨位：声音从哪个方向传来？</p>
      </div>

      {/* 播放控制 */}
      <div className={styles.audioPlayer}>
        <button 
          className={`${styles.bigPlayButton} ${playing ? styles.playing : ''}`}
          onClick={togglePlay}
        >
          {playing ? (
            <>
              <span className={styles.pauseIcon}>⏸</span>
              <span className={styles.buttonText}>暂停</span>
            </>
          ) : (
            <>
              <span className={styles.playIcon}>▶</span>
              <span className={styles.buttonText}>播放夜声</span>
            </>
          )}
        </button>

        {/* 声波动画 */}
        {playing && (
          <div className={styles.bigWaveform}>
            {[...Array(7)].map((_, i) => (
              <span 
                key={i} 
                className={styles.bigWaveBar}
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* 位置选择 */}
      <div className={styles.positionSelector}>
        <button
          className={`${styles.positionButton} ${selectedPosition === 'left' ? styles.selected : ''} ${showResult && currentSound.correctPosition === 'left' ? styles.correct : ''} ${showResult && selectedPosition === 'left' && !isCorrect ? styles.wrong : ''}`}
          onClick={() => selectPosition('left')}
          disabled={showResult}
        >
          <span className={styles.positionIcon}>◀</span>
          <span className={styles.positionLabel}>左侧</span>
          <span className={styles.positionDesc}>窗外/远处</span>
        </button>

        <button
          className={`${styles.positionButton} ${selectedPosition === 'center' ? styles.selected : ''} ${showResult && currentSound.correctPosition === 'center' ? styles.correct : ''} ${showResult && selectedPosition === 'center' && !isCorrect ? styles.wrong : ''}`}
          onClick={() => selectPosition('center')}
          disabled={showResult}
        >
          <span className={styles.positionIcon}>●</span>
          <span className={styles.positionLabel}>正前方</span>
          <span className={styles.positionDesc}>屋内/近处</span>
        </button>

        <button
          className={`${styles.positionButton} ${selectedPosition === 'right' ? styles.selected : ''} ${showResult && currentSound.correctPosition === 'right' ? styles.correct : ''} ${showResult && selectedPosition === 'right' && !isCorrect ? styles.wrong : ''}`}
          onClick={() => selectPosition('right')}
          disabled={showResult}
        >
          <span className={styles.positionIcon}>▶</span>
          <span className={styles.positionLabel}>右侧</span>
          <span className={styles.positionDesc}>隔壁/角落</span>
        </button>
      </div>

      {/* 结果显示 */}
      {showResult && (
        <div className={`${styles.resultPanel} ${isCorrect ? styles.correctResult : styles.wrongResult}`}>
          <div className={styles.resultIcon}>
            {isCorrect ? '✓' : '✗'}
          </div>
          <h4 className={styles.resultTitle}>
            {isCorrect ? '辨位正确' : '辨位错误'}
          </h4>
          <p className={styles.resultText}>
            {currentSound.story}
          </p>
          <div className={styles.correctAnswer}>
            正确方位：<strong>
              {currentSound.correctPosition === 'left' ? '左侧' : 
               currentSound.correctPosition === 'right' ? '右侧' : '正前方'}
            </strong>
          </div>
        </div>
      )}

      {/* 已完成的记录 */}
      {currentSoundIndex > 0 && (
        <div className={styles.completedSounds}>
          <h4>已听的夜声：</h4>
          <div className={styles.soundTags}>
            {sounds.slice(0, currentSoundIndex).map((s, i) => (
              <span key={s.id} className={styles.soundTag}>
                {s.icon} 夜声{i + 1}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}