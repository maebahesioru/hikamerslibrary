import styles from '../../quiz.module.css'
import type { FillInQuestion as Q } from '../../types'

interface Props {
  question: Q
  answer: string
  isCorrect: boolean | null
  answered: boolean
  onChange: (val: string) => void
}

export function FillInQuestionUI({ question, answer, isCorrect, answered, onChange }: Props) {
  return (
    <div className={styles.fillInArea}>
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
