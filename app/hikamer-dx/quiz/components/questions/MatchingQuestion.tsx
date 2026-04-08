import styles from '../../quiz.module.css'
import type { MatchingQuestion as Q } from '../../types'

interface Props {
  question: Q
  matchingAnswer: number[]
  isCorrect: boolean | null
  answered: boolean
  onChange: (idx: number, val: number) => void
}

export function MatchingQuestionUI({ question, matchingAnswer, isCorrect, answered, onChange }: Props) {
  return (
    <div className={styles.matchingArea}>
      {question.lefts.map((left, idx) => (
        <div key={idx} className={styles.matchingRow}>
          <span className={styles.matchingLeft}>{left}</span>
          <span className={styles.matchingArrow}>→</span>
          <select
            aria-label={`${left}の対応を選択`}
            className={`${styles.matchingSelect} ${answered ? (matchingAnswer[idx] === question.correctMatches[idx] ? styles.correct : styles.wrong) : ''}`}
            value={matchingAnswer[idx] ?? ''}
            onChange={e => onChange(idx, parseInt(e.target.value))}
            disabled={answered}
          >
            <option value="">選択...</option>
            {question.rights.map((right, rIdx) => (
              <option key={rIdx} value={rIdx}>{right}</option>
            ))}
          </select>
        </div>
      ))}
      {answered && !isCorrect && (
        <div className={styles.correctAnswer}>
          正解: {question.lefts.map((l, i) => `${l}→${question.rights[question.correctMatches[i]]}`).join(', ')}
        </div>
      )}
    </div>
  )
}
