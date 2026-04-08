import styles from '../../quiz.module.css'
import type { TrueFalseQuestion as Q } from '../../types'

interface Props {
  question: Q
  selectedTF: boolean | null
  answered: boolean
  onSelect: (val: boolean) => void
}

export function TrueFalseQuestionUI({ question, selectedTF, answered, onSelect }: Props) {
  return (
    <div className={styles.tfChoices}>
      {[true, false].map(val => {
        let btnClass = styles.tfBtn
        if (answered) {
          if (val === question.answer) btnClass += ` ${styles.correct}`
          else if (val === selectedTF) btnClass += ` ${styles.wrong}`
        } else if (val === selectedTF) {
          btnClass += ` ${styles.selected}`
        }
        return (
          <button key={String(val)} className={btnClass} onClick={() => onSelect(val)} disabled={answered}>
            {val ? '○' : '×'}
          </button>
        )
      })}
    </div>
  )
}
