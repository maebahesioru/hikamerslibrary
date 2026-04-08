import styles from '../../quiz.module.css'
import type { AssociationQuestion as Q } from '../../types'

interface Props {
  question: Q
  answer: string
  hintsRevealed: number
  isCorrect: boolean | null
  answered: boolean
  onChange: (val: string) => void
  onRevealHint: () => void
}

export function AssociationQuestionUI({ question, answer, hintsRevealed, isCorrect, answered, onChange, onRevealHint }: Props) {
  return (
    <div className={styles.associationArea}>
      <div className={styles.hints}>
        {question.hints.map((hint, idx) => (
          <div key={idx} className={`${styles.hint} ${idx < hintsRevealed ? styles.revealed : ''}`}>
            {idx < hintsRevealed ? `ヒント${idx + 1}: ${hint}` : `ヒント${idx + 1}: ???`}
          </div>
        ))}
      </div>
      {!answered && hintsRevealed < question.hints.length && (
        <button className={styles.hintBtn} onClick={onRevealHint}>
          ヒントを見る ({hintsRevealed}/{question.hints.length})
        </button>
      )}
      <input
        type="text"
        className={`${styles.fillInInput} ${answered ? (isCorrect ? styles.correct : styles.wrong) : ''}`}
        value={answer}
        onChange={e => onChange(e.target.value)}
        placeholder="答えを入力..."
        disabled={answered}
      />
      {answered && !isCorrect && (
        <div className={styles.correctAnswer}>正解: {question.answer}</div>
      )}
    </div>
  )
}
