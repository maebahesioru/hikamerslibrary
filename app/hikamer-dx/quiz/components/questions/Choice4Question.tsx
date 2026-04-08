import styles from '../../quiz.module.css'
import type { Choice4Question as Q } from '../../types'

interface Props {
  question: Q
  selectedChoice: number | null
  answered: boolean
  onSelect: (idx: number) => void
}

export function Choice4QuestionUI({ question, selectedChoice, answered, onSelect }: Props) {
  return (
    <div className={styles.choices}>
      {question.choices.map((choice, idx) => {
        let choiceClass = styles.choice
        if (answered) {
          if (idx === question.answer) choiceClass += ` ${styles.correct}`
          else if (idx === selectedChoice) choiceClass += ` ${styles.wrong}`
        } else if (idx === selectedChoice) {
          choiceClass += ` ${styles.selected}`
        }
        return (
          <button key={idx} className={choiceClass} onClick={() => onSelect(idx)} disabled={answered}>
            <span className={styles.choiceLabel}>{['A', 'B', 'C', 'D'][idx]}</span>
            <span className={styles.choiceText}>{choice}</span>
          </button>
        )
      })}
    </div>
  )
}
