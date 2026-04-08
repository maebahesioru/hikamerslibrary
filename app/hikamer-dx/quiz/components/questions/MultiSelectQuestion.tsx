import styles from '../../quiz.module.css'
import type { MultiSelectQuestion as Q } from '../../types'

interface Props {
  question: Q
  multiSelectAnswer: number[]
  answered: boolean
  onToggle: (idx: number) => void
}

export function MultiSelectQuestionUI({ question, multiSelectAnswer, answered, onToggle }: Props) {
  return (
    <div className={styles.choices}>
      {question.choices.map((choice, idx) => {
        const isSelected = multiSelectAnswer.includes(idx)
        const isCorrectChoice = question.correctAnswers.includes(idx)
        let choiceClass = styles.choice
        if (answered) {
          if (isCorrectChoice) choiceClass += ` ${styles.correct}`
          else if (isSelected) choiceClass += ` ${styles.wrong}`
        } else if (isSelected) {
          choiceClass += ` ${styles.selected}`
        }
        return (
          <button key={idx} className={choiceClass} onClick={() => onToggle(idx)} disabled={answered}>
            <span className={styles.choiceLabel}>{isSelected ? '✓' : ['A', 'B', 'C', 'D'][idx]}</span>
            <span className={styles.choiceText}>{choice}</span>
          </button>
        )
      })}
      <p className={styles.multiSelectHint}>※複数選択可</p>
    </div>
  )
}
