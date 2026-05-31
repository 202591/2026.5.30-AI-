import { useState, useRef, useCallback } from 'react'
import styles from './Chapters.module.css'

interface ChapterBookProps {
  playerName: string
  onNameChange: (name: string) => void
  onSignatureSubmit: () => void
  identityTitle: string
  chapterTitles: string[]
  totalScore: number
}

export function ChapterBook({
  playerName,
  onNameChange,
  onSignatureSubmit,
  identityTitle,
}: ChapterBookProps) {
  const [isWriting, setIsWriting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = useCallback(() => {
    if (!playerName.trim()) {
      inputRef.current?.focus()
      return
    }
    setIsWriting(true)
    setTimeout(() => {
      setIsWriting(false)
      setSubmitted(true)
      onSignatureSubmit()
    }, 1500)
  }, [playerName, onSignatureSubmit])

  return (
    <div className={styles.endingContainer}>
      <div className={styles.inkVortex} />

      <div className={styles.scrollArea}>
        <h3 className={styles.scrollTitle}>
          {submitted ? '署名已入卷' : '落名入卷'}
        </h3>

        {!submitted ? (
          <>
            <input
              ref={inputRef}
              type="text"
              value={playerName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="请输入你的名字"
              className={styles.nameInput}
              maxLength={8}
              disabled={isWriting}
            />
            <button
              className={styles.submitButton}
              onClick={handleSubmit}
              disabled={!playerName.trim() || isWriting}
              style={{ marginTop: '14px' }}
            >
              {isWriting ? '墨入纸中...' : '署名入卷'}
            </button>
          </>
        ) : (
          <p style={{ color: 'rgba(250, 238, 214, 0.8)', fontSize: '0.9rem', margin: '12px 0 0' }}>
            勘验人：{playerName}，身份：{identityTitle}
          </p>
        )}
      </div>
    </div>
  )
}
