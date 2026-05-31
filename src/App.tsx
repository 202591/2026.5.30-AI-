import { useEffect, useRef, useState, useCallback } from 'react'
import html2canvas from 'html2canvas'
import { Howl, Howler } from 'howler'
import styles from './App.module.css'
import { PaperGrain } from './components/PaperGrain'
import { ChapterFox } from './components/ChapterFox'
import { ChapterMirror } from './components/ChapterMirror'
import { ChapterRiver } from './components/ChapterRiver'
import { ChapterStation } from './components/ChapterStation'
import { ChapterBook } from './components/ChapterBook'
import {
  chapters,
  coverImage,
  foxLanterns,
  identities,
  innVoices,
  mirrorZones,
  riverSounds,
} from './data/chapters'
import { generateVerdict } from './lib/verdict'

type Stage = 'cover' | 'chapter' | 'share'

type AppState = {
  stage: Stage
  chapterIndex: number
  playerName: string
  completedChapters: Set<string>
  clues: string[]
  foxSelectedId: string | null
  mirrorScannedIds: string[]
  riverAnswers: Record<string, boolean>
  innAnswers: Record<string, boolean>
  ending?: { identityId: string }
}

const STORAGE_KEY = 'xuanshi-v4-state'

const initialState: AppState = {
  stage: 'cover',
  chapterIndex: 0,
  playerName: '',
  completedChapters: new Set(),
  clues: [],
  foxSelectedId: null,
  mirrorScannedIds: [],
  riverAnswers: {},
  innAnswers: {},
}

const loadState = (): AppState => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) return initialState
  try {
    const parsed = JSON.parse(saved)
    return {
      ...parsed,
      completedChapters: new Set(parsed.completedChapters || []),
    }
  } catch {
    return initialState
  }
}

// PLACEHOLDER_APP_CONTINUE

function App() {
  const [state, setState] = useState<AppState>(loadState())
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [verdict, setVerdict] = useState({ text: '', loading: false })
  const [showVerdict, setShowVerdict] = useState(false)
  const [shareImage, setShareImage] = useState<string | null>(null)
  const [isFlipping, setIsFlipping] = useState(false)

  const shareRef = useRef<HTMLDivElement>(null)
  const ambientRef = useRef<Howl | null>(null)

  const chapter = chapters[state.chapterIndex]
  const identity = identities.find((item) => item.id === state.ending?.identityId) ?? identities[0]
  const totalClues = state.clues.length
  const completedCount = state.completedChapters.size

  // Persist state
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...state,
      completedChapters: Array.from(state.completedChapters),
    }))
  }, [state])

  // Ambient audio management
  useEffect(() => {
    if (!audioEnabled) return

    ambientRef.current?.stop()
    ambientRef.current?.unload()

    const audioSrc = state.stage === 'share'
      ? '/audio/ending.mp3'
      : state.stage === 'cover'
        ? '/audio/cover.mp3'
        : chapter?.ambientAudio || '/audio/cover.mp3'

    ambientRef.current = new Howl({
      src: [audioSrc],
      loop: true,
      volume: state.stage === 'share' ? 0.28 : 0.22,
      html5: true,
    })
    ambientRef.current.play()

    return () => {
      ambientRef.current?.stop()
      ambientRef.current?.unload()
    }
  }, [audioEnabled, chapter?.ambientAudio, state.stage])

  const unlockAudio = async () => {
    try {
      if (Howler.ctx && Howler.ctx.state !== 'running') {
        await Howler.ctx.resume()
      }
      setAudioEnabled(true)
    } catch {
      setAudioEnabled(false)
    }
  }

  const startBook = async () => {
    await unlockAudio()
    setIsFlipping(true)
    setTimeout(() => {
      setState(prev => ({ ...prev, stage: 'chapter' }))
      setIsFlipping(false)
    }, 600)
  }

  const restartBook = () => {
    ambientRef.current?.stop()
    localStorage.removeItem(STORAGE_KEY)
    setVerdict({ text: '', loading: false })
    setShowVerdict(false)
    setShareImage(null)
    setState(initialState)
  }

  const goNext = useCallback(() => {
    setIsFlipping(true)
    setTimeout(() => {
      if (state.chapterIndex === chapters.length - 1) {
        setState(prev => ({ ...prev, stage: 'share' }))
      } else {
        setState(prev => ({ ...prev, chapterIndex: prev.chapterIndex + 1 }))
      }
      setIsFlipping(false)
    }, 500)
  }, [state.chapterIndex])

  const goTo = useCallback((index: number) => {
    setIsFlipping(true)
    setTimeout(() => {
      setState(prev => ({ ...prev, chapterIndex: index }))
      setIsFlipping(false)
    }, 400)
  }, [])

  // Chapter handlers
  const handleFoxHotspot = useCallback((hotspot: { id: string; title: string; text: string }) => {
    const lantern = foxLanterns.find(l => l.id === hotspot.id)
    if (!lantern) return
    setState(prev => ({
      ...prev,
      foxSelectedId: lantern.id,
      clues: lantern.clueKey && !prev.clues.includes(lantern.clueKey)
        ? [...prev.clues, lantern.clueKey]
        : prev.clues,
    }))
  }, [])

  const handleFoxComplete = useCallback(() => {
    setState(prev => ({
      ...prev,
      completedChapters: new Set([...prev.completedChapters, 'fox-lantern']),
    }))
  }, [])

  const handleMirrorFound = useCallback((obj: { id: string; title: string; text: string }) => {
    const zone = mirrorZones.find(z => z.id === obj.id)
    if (!zone) return
    setState(prev => ({
      ...prev,
      mirrorScannedIds: [...prev.mirrorScannedIds, zone.id],
      clues: zone.clueKey && !prev.clues.includes(zone.clueKey)
        ? [...prev.clues, zone.clueKey]
        : prev.clues,
    }))
  }, [])

  const handleMirrorComplete = useCallback(() => {
    setState(prev => ({
      ...prev,
      completedChapters: new Set([...prev.completedChapters, 'mirror']),
    }))
  }, [])

  const handleGhostIdentified = useCallback((ghost: { id: string; clueKey?: string }) => {
    setState(prev => ({
      ...prev,
      riverAnswers: { ...prev.riverAnswers, [ghost.id]: true },
      clues: ghost.clueKey && !prev.clues.includes(ghost.clueKey)
        ? [...prev.clues, ghost.clueKey]
        : prev.clues,
    }))
  }, [])

  const handleRiverComplete = useCallback(() => {
    setState(prev => ({
      ...prev,
      completedChapters: new Set([...prev.completedChapters, 'river']),
    }))
  }, [])

  const handleInnAnswer = useCallback((position: 'left' | 'right' | 'center', isCorrect: boolean) => {
    const voiceId = innVoices[Object.keys(state.innAnswers).length]?.id || position
    setState(prev => ({
      ...prev,
      innAnswers: { ...prev.innAnswers, [voiceId]: isCorrect },
    }))
  }, [state.innAnswers])

  const handleInnComplete = useCallback(() => {
    setState(prev => ({
      ...prev,
      completedChapters: new Set([...prev.completedChapters, 'inn']),
    }))
  }, [])

  const handleSignatureSubmit = useCallback(() => {
    setState(prev => ({
      ...prev,
      completedChapters: new Set([...prev.completedChapters, 'ending']),
    }))
  }, [])

  const generateVerdictText = useCallback(async () => {
    setVerdict({ text: '', loading: true })
    const result = await generateVerdict({
      playerName: state.playerName || '无名校异官',
      identityTitle: identity.title,
      chapterTitles: chapters.slice(0, 4).map(c => c.title),
      clueCount: totalClues,
      completedCount,
    })
    setVerdict({ text: result.text, loading: false })
    setShowVerdict(true)
  }, [identity.title, state.playerName, totalClues, completedCount])

  const exportShareCard = async () => {
    if (!shareRef.current) return
    const canvas = await html2canvas(shareRef.current, {
      backgroundColor: '#d4c5a9',
      scale: 2,
      useCORS: true,
    })
    setShareImage(canvas.toDataURL('image/png'))
  }

  // Data transforms for chapter components
  const foxHotspots = foxLanterns.map(l => ({
    id: l.id,
    x: Number.parseFloat(l.position.left),
    y: Number.parseFloat(l.position.top),
    width: 60,
    height: 60,
    title: l.title,
    text: l.evidence,
  }))

  const mirrorObjects = mirrorZones.map(z => ({
    id: z.id,
    x: Number.parseFloat(z.position.left),
    y: Number.parseFloat(z.position.top),
    width: Number.parseFloat(z.position.width) * 10,
    height: Number.parseFloat(z.position.height) * 10,
    title: z.title,
    text: z.description,
  }))

  const riverGhosts = riverSounds.map(r => ({
    id: r.id,
    name: r.title,
    icon: '👻',
    audioSrc: `/audio/river-${r.id}.mp3`,
    poem: r.description,
    description: `正确答案：${r.correct}`,
    clueKey: r.clueKey,
  }))

  const innVoicesData = innVoices.map(v => ({
    id: v.id,
    name: v.title,
    icon: '🔊',
    audioSrc: `/audio/inn-${v.id}.mp3`,
    correctPosition: (v.correct === '前门' ? 'center' : v.correct === '后廊' ? 'right' : 'left') as 'left' | 'right' | 'center',
    story: v.description,
  }))

  // PLACEHOLDER_RENDER

  return (
    <main className={styles.app}>
      {/* ═══ Cover Stage ═══ */}
      {state.stage === 'cover' && (
        <section className={styles.coverShell}>
          <div className={styles.coverScene}>
            <img src={coverImage} alt="宣室异闻录" className={styles.coverImage} />
          </div>
          <div className={styles.coverPanel}>
            <PaperGrain />
            <p className={styles.coverTag}>唐代志怪互动叙事绘本</p>
            <h1 className={styles.coverTitle}>宣室异闻录</h1>
            <p className={styles.coverSubtitle}>
              宣室旧卷，夜半自开；执朱砂，校真伪。
            </p>
            <div className={styles.coverDivider} />
            <div className={styles.coverButtons}>
              <button className={styles.primaryButton} onClick={startBook}>
                开卷试判
              </button>
              <button className={styles.ghostButton} onClick={unlockAudio}>
                {audioEnabled ? '音场已启' : '先启听符'}
              </button>
            </div>
            <div className={styles.coverFootnotes}>
              <span>五卷异闻</span>
              <span>互动绘本</span>
              <span>AI 判词</span>
              <span>卷尾分享</span>
            </div>
          </div>
        </section>
      )}

      {/* ═══ Chapter Stage ═══ */}
      {state.stage === 'chapter' && chapter && (
        <section className={styles.bookShell} style={isFlipping ? { animation: 'pageFlipIn 0.5s var(--ease-out) both' } : undefined}>
          <PaperGrain />

          {/* Header */}
          <header className={styles.bookHeader}>
            <div>
              <p className={styles.bookKicker}>宣室校异官案牍 · {chapter.era}</p>
              <h2 className={styles.bookTitle}>{chapter.title}</h2>
            </div>
            <div className={styles.headerActions}>
              <button className={styles.iconButton} onClick={unlockAudio} aria-label="音频控制">
                {audioEnabled ? '🔊' : '🔇'}
              </button>
              <span className={styles.progressBadge}>
                {chapter.era}
              </span>
            </div>
          </header>

          {/* Book Spread: Left Page + Seam + Right Page */}
          <div className={styles.bookSpread}>
            {/* Left Page — Scene & Interaction */}
            <div className={styles.leftPage}>
              {chapter.id === 'fox-lantern' && (
                <ChapterFox
                  imageUrl={chapter.sceneImage}
                  hotspots={foxHotspots}
                  onHotspotClick={handleFoxHotspot}
                  onAllFound={handleFoxComplete}
                />
              )}
              {chapter.id === 'mirror' && (
                <ChapterMirror
                  imageUrl={chapter.sceneImage}
                  objects={mirrorObjects}
                  onObjectFound={handleMirrorFound}
                  onAllFound={handleMirrorComplete}
                />
              )}
              {chapter.id === 'river' && (
                <ChapterRiver
                  ghosts={riverGhosts}
                  onGhostIdentified={handleGhostIdentified}
                  onAllIdentified={handleRiverComplete}
                />
              )}
              {chapter.id === 'inn' && (
                <ChapterStation
                  sounds={innVoicesData}
                  currentSoundIndex={Object.keys(state.innAnswers).length}
                  onPositionSelected={handleInnAnswer}
                  onAllCompleted={handleInnComplete}
                />
              )}
              {chapter.id === 'ending' && (
                <ChapterBook
                  playerName={state.playerName}
                  onNameChange={(name) => setState(prev => ({ ...prev, playerName: name }))}
                  onSignatureSubmit={handleSignatureSubmit}
                  identityTitle={identity.title}
                  chapterTitles={chapters.slice(0, 4).map(c => c.title)}
                  totalScore={completedCount * 100 + totalClues * 10}
                />
              )}
              {/* Scene image fallback for chapters without full-page components */}
              {!['fox-lantern', 'mirror', 'river', 'inn', 'ending'].includes(chapter.id) && (
                <>
                  <img src={chapter.sceneImage} alt={chapter.title} className={styles.sceneImage} />
                  <div className={styles.sceneOverlay} />
                </>
              )}
              <span className={styles.sceneCaption}>{chapter.sceneLabel}</span>
            </div>

            {/* Center Seam */}
            <div className={styles.seam} />

            {/* Right Page — Case File & Clues */}
            <div className={styles.rightPage}>
              <h3 className={styles.panelTitle}>{chapter.subtitle}</h3>
              <p className={styles.panelSubtitle}>{chapter.sceneHint}</p>

              <div className={styles.promptBox}>
                {chapter.prompt}
              </div>

              {/* Clue Collection Grid */}
              <div className={styles.clueGrid}>
                {chapter.clues.map((clue, i) => (
                  <div
                    key={clue}
                    className={`${styles.clueSlot} ${state.clues.includes(clue) ? styles.clueSlotActive : ''}`}
                  >
                    {state.clues.includes(clue) ? clue : `线索 ${i + 1}`}
                  </div>
                ))}
              </div>

              {/* Narrative */}
              {chapter.narrative.map((para, i) => (
                <p key={i} style={{ color: 'var(--ink-soft)', fontSize: '0.88rem', margin: '6px 0' }}>
                  {para}
                </p>
              ))}

              {/* Verdict (shown when chapter complete) */}
              {state.completedChapters.has(chapter.id) && (
                <div className={styles.verdictBox}>
                  {chapter.verdict}
                </div>
              )}
            </div>
          </div>

          {/* Footer Navigation */}
          <footer className={styles.chapterFooter}>
            <button
              className={styles.navButton}
              onClick={() => goTo(Math.max(0, state.chapterIndex - 1))}
              disabled={state.chapterIndex === 0}
            >
              ← 上一卷
            </button>

            <div className={styles.chapterDots}>
              {chapters.map((c, i) => (
                <span
                  key={c.id}
                  className={`${styles.dot} ${i === state.chapterIndex ? styles.dotActive : ''} ${state.completedChapters.has(c.id) ? styles.dotCompleted : ''}`}
                  onClick={() => goTo(i)}
                >
                  {['一', '二', '三', '四', '五'][i]}
                </span>
              ))}
            </div>

            <button
              className={`${styles.navButton} ${styles.navButtonPrimary}`}
              onClick={goNext}
              disabled={!state.completedChapters.has(chapter.id) && chapter.id !== 'ending'}
            >
              {state.chapterIndex === chapters.length - 1 ? '结局 →' : '下一卷 →'}
            </button>
          </footer>
        </section>
      )}

      {/* ═══ Share Stage ═══ */}
      {state.stage === 'share' && (
        <section className={styles.shareShell}>
          <h2 className={styles.shareHeading}>勘验完成</h2>

          <div ref={shareRef} className={styles.shareCard}>
            <PaperGrain />
            <span className={styles.cardSeal}>异闻</span>
            <h3 className={styles.cardTitle}>宣室异闻录</h3>

            <div className={styles.cardBody}>
              <p>勘验人：{state.playerName || '无名校异官'}</p>
              <p>授予身份：{identity.title}</p>
              <p>勘验得分：{completedCount * 100 + totalClues * 10}</p>
              <div className={styles.cardSeals}>
                {chapters.slice(0, 4).map(c => (
                  state.completedChapters.has(c.id) && (
                    <span key={c.id} className={styles.cardSealMark}>
                      {c.seal.charAt(0)}
                    </span>
                  )
                ))}
              </div>
            </div>

            <div className={styles.cardFooter}>
              五卷异闻，已勘验 {completedCount}/4 卷
            </div>
          </div>

          {/* Verdict */}
          {!showVerdict ? (
            <button
              className={styles.shareButton}
              onClick={generateVerdictText}
              disabled={verdict.loading}
            >
              {verdict.loading ? '判词生成中...' : '生成勘验判词'}
            </button>
          ) : (
            <div className={styles.verdictPanel}>
              <h4>勘验判词</h4>
              <p className={styles.verdictText}>{verdict.text}</p>
            </div>
          )}

          {/* Actions */}
          <div className={styles.shareActions}>
            <button className={styles.shareButton} onClick={exportShareCard}>
              生成分享卡
            </button>
            <button className={styles.restartButton} onClick={restartBook}>
              重新开卷
            </button>
          </div>

          {/* Generated Image */}
          {shareImage && (
            <div className={styles.shareImageContainer}>
              <img src={shareImage} alt="分享卡" className={styles.shareImage} />
              <a
                href={shareImage}
                download={`宣室异闻录-${state.playerName || '无名校异官'}.png`}
                className={styles.downloadLink}
              >
                下载分享卡
              </a>
            </div>
          )}
        </section>
      )}
    </main>
  )
}

export default App
