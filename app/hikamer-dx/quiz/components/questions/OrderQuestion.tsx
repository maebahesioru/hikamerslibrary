import styles from '../../quiz.module.css'
import type { OrderQuestion as Q } from '../../types'

interface Props {
  question: Q
  orderAnswer: number[]
  answered: boolean
  onToggle: (idx: number) => void
  onClear: () => void
}

export function OrderQuestionUI({ question, orderAnswer, answered, onToggle, onClear }: Props) {
  return (
    <div className={styles.orderArea}>
      <div className={styles.orderItems}>
        {question.items.map((item, idx) => {
          const orderNum = orderAnswer.indexOf(idx) + 1
          let itemClass = styles.orderItem
          if (answered) {
            const correctPos = question.correctOrder.indexOf(idx)
            const userPos = orderAnswer.indexOf(idx)
            if (correctPos === userPos) itemClass += ` ${styles.correct}`
            else itemClass += ` ${styles.wrong}`
          }
          return (
            <button key={idx} className={itemClass} onClick={() => onToggle(idx)} disabled={answered}>
              {orderNum > 0 && <span className={styles.orderNum}>{orderNum}</span>}
              {item}
            </button>
          )
        })}
      </div>
      {orderAnswer.length > 0 && !answered && (
        <button className={styles.clearOrderBtn} onClick={onClear}>クリア</button>
      )}
    </div>
  )
}
