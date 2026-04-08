import styles from '../../quiz.module.css'
import type { NumberQuestion, CategorizeQuestion, SpeedQuizQuestion, FindMistakeQuestion, RankingQuestion, FillMultiQuestion, TimelineQuestion, CrosswordQuestion, AnagramQuestion, CompareQuestion, FollowersQuestion, GraphQuestion, CalculationQuestion, MemoryQuestion, DeductionQuestion, DragFillQuestion, RelatedQuestion, OddOneQuestion, CompleteQuestion, ReverseQuestion, QuoteSourceQuestion, HashtagQuestion, ReplyToQuestion, FillSelectQuestion } from '../../types'

// 数値入力
export function NumberQuestionUI({ question, answer, isCorrect, answered, onChange }: { question: NumberQuestion; answer: string; isCorrect: boolean | null; answered: boolean; onChange: (v: string) => void }) {
  return (
    <div className={styles.fillInArea}>
      <input type="number" className={`${styles.fillInInput} ${answered ? (isCorrect ? styles.correct : styles.wrong) : ''}`} value={answer} onChange={e => onChange(e.target.value)} placeholder="数値を入力..." disabled={answered} />
      {question.tolerance > 0 && !answered && <p className={styles.toleranceHint}>※±{question.tolerance}の誤差OK</p>}
      {answered && !isCorrect && <div className={styles.correctAnswer}>正解: {question.answer}</div>}
    </div>
  )
}

// カテゴリ分類
export function CategorizeQuestionUI({ question, categorizeAnswer, answered, onChange }: { question: CategorizeQuestion; categorizeAnswer: ('A' | 'B' | null)[]; answered: boolean; onChange: (idx: number, val: 'A' | 'B') => void }) {
  return (
    <div className={styles.categorizeArea}>
      <div className={styles.categoryHeaders}>
        <span className={styles.categoryHeader}>{question.categoryA}</span>
        <span className={styles.categoryHeader}>{question.categoryB}</span>
      </div>
      {question.items.map((item, idx) => {
        const userCat = categorizeAnswer[idx]
        const correctCat = question.correctCategories[idx]
        let itemClass = styles.categorizeItem
        if (answered) itemClass += userCat === correctCat ? ` ${styles.correct}` : ` ${styles.wrong}`
        return (
          <div key={idx} className={itemClass}>
            <span className={styles.categorizeItemName}>{item}</span>
            <div className={styles.categorizeButtons}>
              <button className={`${styles.catBtn} ${userCat === 'A' ? styles.selected : ''}`} onClick={() => onChange(idx, 'A')} disabled={answered}>{question.categoryA}</button>
              <button className={`${styles.catBtn} ${userCat === 'B' ? styles.selected : ''}`} onClick={() => onChange(idx, 'B')} disabled={answered}>{question.categoryB}</button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// 早押し風
export function SpeedQuizQuestionUI({ question, answer, revealedChars, isCorrect, answered, onChange, onReveal }: { question: SpeedQuizQuestion; answer: string; revealedChars: number; isCorrect: boolean | null; answered: boolean; onChange: (v: string) => void; onReveal: () => void }) {
  return (
    <div className={styles.speedQuizArea}>
      <div className={styles.revealedText}>
        {question.sentence.slice(0, revealedChars)}
        {revealedChars < question.sentence.length && <span className={styles.cursor}>|</span>}
      </div>
      {!answered && revealedChars < question.sentence.length && <button className={styles.revealBtn} onClick={onReveal}>もっと見る</button>}
      <input type="text" className={`${styles.fillInInput} ${answered ? (isCorrect ? styles.correct : styles.wrong) : ''}`} value={answer} onChange={e => onChange(e.target.value)} placeholder="答えを入力..." disabled={answered} />
      {answered && !isCorrect && <div className={styles.correctAnswer}>正解: {question.answer}</div>}
    </div>
  )
}

// 間違い探し
export function FindMistakeQuestionUI({ question, answer, isCorrect, answered, onChange }: { question: FindMistakeQuestion; answer: string; isCorrect: boolean | null; answered: boolean; onChange: (v: string) => void }) {
  return (
    <div className={styles.findMistakeArea}>
      <div className={styles.mistakeSentence}>{question.sentence}</div>
      <input type="text" className={`${styles.fillInInput} ${answered ? (isCorrect ? styles.correct : styles.wrong) : ''}`} value={answer} onChange={e => onChange(e.target.value)} placeholder="間違っている部分を入力..." disabled={answered} />
      {answered && <div className={styles.correctAnswer}>間違い: {question.wrongPart} → 正しくは: {question.correctPart}</div>}
    </div>
  )
}

// ランキング
export function RankingQuestionUI({ question, rankingAnswer, answered, onToggle, onClear }: { question: RankingQuestion; rankingAnswer: number[]; answered: boolean; onToggle: (idx: number) => void; onClear: () => void }) {
  return (
    <div className={styles.orderArea}>
      <p className={styles.rankingHint}>1位から順にクリックしてください</p>
      <div className={styles.orderItems}>
        {question.items.map((item, idx) => {
          const orderNum = rankingAnswer.indexOf(idx) + 1
          let itemClass = styles.orderItem
          if (answered) {
            const correctPos = question.correctOrder.indexOf(idx)
            const userPos = rankingAnswer.indexOf(idx)
            itemClass += correctPos === userPos ? ` ${styles.correct}` : ` ${styles.wrong}`
          }
          return (
            <button key={idx} className={itemClass} onClick={() => onToggle(idx)} disabled={answered}>
              {orderNum > 0 && <span className={styles.orderNum}>{orderNum}位</span>}
              {item}
            </button>
          )
        })}
      </div>
      {rankingAnswer.length > 0 && !answered && <button className={styles.clearOrderBtn} onClick={onClear}>クリア</button>}
    </div>
  )
}

// 穴埋め複数
export function FillMultiQuestionUI({ question, answers, answered, onChange }: { question: FillMultiQuestion; answers: string[]; answered: boolean; onChange: (idx: number, v: string) => void }) {
  return (
    <div className={styles.fillMultiArea}>
      {question.answers.map((_, idx) => (
        <input key={idx} type="text" className={`${styles.fillInInput} ${answered ? (answers[idx]?.trim().toLowerCase() === question.answers[idx]?.toLowerCase() ? styles.correct : styles.wrong) : ''}`} value={answers[idx] || ''} onChange={e => onChange(idx, e.target.value)} placeholder={`空欄${idx + 1}の答え...`} disabled={answered} />
      ))}
      {answered && answers.some((a, i) => a?.trim().toLowerCase() !== question.answers[i]?.toLowerCase()) && <div className={styles.correctAnswer}>正解: {question.answers.join(', ')}</div>}
    </div>
  )
}

// タイムライン
export function TimelineQuestionUI({ question, answer, isCorrect, answered, onChange }: { question: TimelineQuestion; answer: string; isCorrect: boolean | null; answered: boolean; onChange: (v: string) => void }) {
  return (
    <div className={styles.fillInArea}>
      <input type="text" placeholder="YYYY-MM形式で入力 (例: 2024-07)" className={`${styles.fillInInput} ${answered ? (isCorrect ? styles.correct : styles.wrong) : ''}`} value={answer} onChange={e => onChange(e.target.value)} disabled={answered} />
      {question.tolerance > 0 && !answered && <p className={styles.toleranceHint}>※±{question.tolerance}ヶ月の誤差OK</p>}
      {answered && !isCorrect && <div className={styles.correctAnswer}>正解: {question.answer}</div>}
    </div>
  )
}

// 4択系共通（引用元当て・タグ当て・リプ先当て・穴埋め選択）
export function ChoiceSelectQuestionUI({ question, selectedChoice, answered, onSelect }: { question: QuoteSourceQuestion | HashtagQuestion | ReplyToQuestion | FillSelectQuestion; selectedChoice: number | null; answered: boolean; onSelect: (idx: number) => void }) {
  return (
    <div className={styles.choices}>
      {question.choices.map((choice, idx) => {
        let choiceClass = styles.choice
        if (answered) {
          if (idx === question.answer) choiceClass += ` ${styles.correct}`
          else if (idx === selectedChoice) choiceClass += ` ${styles.wrong}`
        } else if (idx === selectedChoice) choiceClass += ` ${styles.selected}`
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

// フォロワー数
export function FollowersQuestionUI({ question, answer, isCorrect, answered, onChange }: { question: FollowersQuestion; answer: string; isCorrect: boolean | null; answered: boolean; onChange: (v: string) => void }) {
  return (
    <div className={styles.fillInArea}>
      <input type="number" className={`${styles.fillInInput} ${answered ? (isCorrect ? styles.correct : styles.wrong) : ''}`} value={answer} onChange={e => onChange(e.target.value)} placeholder="フォロワー数を入力..." disabled={answered} />
      {question.tolerance > 0 && !answered && <p className={styles.toleranceHint}>※±{question.tolerance}の誤差OK</p>}
      {answered && !isCorrect && <div className={styles.correctAnswer}>正解: 約{question.answer}人</div>}
    </div>
  )
}

// クロスワード
export function CrosswordQuestionUI({ question, answer1, answer2, isCorrect, answered, onChange1, onChange2 }: { question: CrosswordQuestion; answer1: string; answer2: string; isCorrect: boolean | null; answered: boolean; onChange1: (v: string) => void; onChange2: (v: string) => void }) {
  return (
    <div className={styles.crosswordArea}>
      <div className={styles.crosswordHint}>
        <span>ヒント1: {question.hint1}</span>
        <input type="text" className={`${styles.fillInInput} ${answered ? (answer1.trim().toLowerCase() === question.answer1.toLowerCase() ? styles.correct : styles.wrong) : ''}`} value={answer1} onChange={e => onChange1(e.target.value)} placeholder="答え1..." disabled={answered} />
      </div>
      <div className={styles.crosswordHint}>
        <span>ヒント2: {question.hint2}</span>
        <input type="text" className={`${styles.fillInInput} ${answered ? (answer2.trim().toLowerCase() === question.answer2.toLowerCase() ? styles.correct : styles.wrong) : ''}`} value={answer2} onChange={e => onChange2(e.target.value)} placeholder="答え2..." disabled={answered} />
      </div>
      <p className={styles.crosswordCommon}>共通点: {question.commonInfo}</p>
      {answered && !isCorrect && <div className={styles.correctAnswer}>正解: {question.answer1}, {question.answer2}</div>}
    </div>
  )
}

// アナグラム
export function AnagramQuestionUI({ question, answer, isCorrect, answered, onChange }: { question: AnagramQuestion; answer: string; isCorrect: boolean | null; answered: boolean; onChange: (v: string) => void }) {
  return (
    <div className={styles.anagramArea}>
      <div className={styles.shuffledText}>{question.shuffledText}</div>
      <p className={styles.anagramHint}>ヒント: {question.hint}</p>
      <input type="text" className={`${styles.fillInInput} ${answered ? (isCorrect ? styles.correct : styles.wrong) : ''}`} value={answer} onChange={e => onChange(e.target.value)} placeholder="並べ替えた答え..." disabled={answered} />
      {answered && !isCorrect && <div className={styles.correctAnswer}>正解: {question.answer}</div>}
    </div>
  )
}

// 比較
export function CompareQuestionUI({ question, compareAnswer, answered, onSelect }: { question: CompareQuestion; compareAnswer: 'A' | 'B' | null; answered: boolean; onSelect: (v: 'A' | 'B') => void }) {
  return (
    <div className={styles.compareArea}>
      <button className={`${styles.compareBtn} ${answered ? (question.answer === 'A' ? styles.correct : (compareAnswer === 'A' ? styles.wrong : '')) : (compareAnswer === 'A' ? styles.selected : '')}`} onClick={() => onSelect('A')} disabled={answered}>{question.itemA}</button>
      <span className={styles.vsText}>VS</span>
      <button className={`${styles.compareBtn} ${answered ? (question.answer === 'B' ? styles.correct : (compareAnswer === 'B' ? styles.wrong : '')) : (compareAnswer === 'B' ? styles.selected : '')}`} onClick={() => onSelect('B')} disabled={answered}>{question.itemB}</button>
    </div>
  )
}

// グラフ
export function GraphQuestionUI({ question, answer, isCorrect, answered, onChange }: { question: GraphQuestion; answer: string; isCorrect: boolean | null; answered: boolean; onChange: (v: string) => void }) {
  const maxVal = Math.max(...question.data.map(x => x.value))
  return (
    <div className={styles.graphArea}>
      <div className={styles.barChart}>
        {question.data.map((d, idx) => (
          <div key={idx} className={styles.barItem}>
            <div className={styles.barLabel}>{d.label}</div>
            <div className={styles.barContainer}><div className={styles.bar} style={{ width: `${Math.min(100, (d.value / maxVal) * 100)}%` }} /></div>
            <div className={styles.barValue}>{answered ? d.value : '?'}</div>
          </div>
        ))}
      </div>
      <input type="number" className={`${styles.fillInInput} ${answered ? (isCorrect ? styles.correct : styles.wrong) : ''}`} value={answer} onChange={e => onChange(e.target.value)} placeholder="答えを入力..." disabled={answered} />
      {question.tolerance > 0 && !answered && <p className={styles.toleranceHint}>※±{question.tolerance}の誤差OK</p>}
      {answered && !isCorrect && <div className={styles.correctAnswer}>正解: {question.answer}</div>}
    </div>
  )
}

// 計算
export function CalculationQuestionUI({ question, answer, isCorrect, answered, onChange }: { question: CalculationQuestion; answer: string; isCorrect: boolean | null; answered: boolean; onChange: (v: string) => void }) {
  return (
    <div className={styles.fillInArea}>
      <input type="number" className={`${styles.fillInInput} ${answered ? (isCorrect ? styles.correct : styles.wrong) : ''}`} value={answer} onChange={e => onChange(e.target.value)} placeholder="計算結果を入力..." disabled={answered} />
      {question.tolerance > 0 && !answered && <p className={styles.toleranceHint}>※±{question.tolerance}の誤差OK</p>}
      {answered && !isCorrect && <div className={styles.correctAnswer}>正解: {question.answer}</div>}
    </div>
  )
}

// 神経衰弱
export function MemoryQuestionUI({ question, memoryFlipped, memoryMatched, answered, onFlip }: { question: MemoryQuestion; memoryFlipped: number[]; memoryMatched: number[]; answered: boolean; onFlip: (id: number, pairId: number, side: string) => void }) {
  const cards = question.pairs.flatMap((p, idx) => [
    { id: idx * 2, pairId: idx, text: p.left, side: 'left' },
    { id: idx * 2 + 1, pairId: idx, text: p.right, side: 'right' }
  ])
  return (
    <div className={styles.memoryArea}>
      <div className={styles.memoryGrid}>
        {cards.map(card => {
          const isFlipped = memoryFlipped.includes(card.id)
          const isMatched = memoryMatched.includes(card.id)
          return (
            <button key={card.id} className={`${styles.memoryCard} ${isFlipped || isMatched ? styles.flipped : ''} ${isMatched ? styles.matched : ''}`} onClick={() => onFlip(card.id, card.pairId, card.side)} disabled={answered || isMatched}>
              {isFlipped || isMatched ? card.text : '?'}
            </button>
          )
        })}
      </div>
      <p className={styles.memoryHint}>ペアを見つけてください ({memoryMatched.length / 2}/{question.pairs.length})</p>
    </div>
  )
}

// 推理
export function DeductionQuestionUI({ question, selectedChoice, hintsRevealed, answered, onSelect, onRevealHint }: { question: DeductionQuestion; selectedChoice: number | null; hintsRevealed: number; answered: boolean; onSelect: (idx: number) => void; onRevealHint: () => void }) {
  return (
    <div className={styles.deductionArea}>
      <div className={styles.situation}>{question.situation}</div>
      <div className={styles.hints}>
        {question.hints.map((hint, idx) => (
          <div key={idx} className={`${styles.hint} ${idx < hintsRevealed ? styles.revealed : ''}`}>
            {idx < hintsRevealed ? `ヒント${idx + 1}: ${hint}` : `ヒント${idx + 1}: ???`}
          </div>
        ))}
      </div>
      {!answered && hintsRevealed < question.hints.length && <button className={styles.hintBtn} onClick={onRevealHint}>ヒントを見る ({hintsRevealed}/{question.hints.length})</button>}
      <div className={styles.choices}>
        {question.choices.map((choice, idx) => {
          let choiceClass = styles.choice
          if (answered) {
            if (idx === question.answer) choiceClass += ` ${styles.correct}`
            else if (idx === selectedChoice) choiceClass += ` ${styles.wrong}`
          } else if (idx === selectedChoice) choiceClass += ` ${styles.selected}`
          return (
            <button key={idx} className={choiceClass} onClick={() => onSelect(idx)} disabled={answered}>
              <span className={styles.choiceLabel}>{['A', 'B', 'C', 'D'][idx]}</span>
              <span className={styles.choiceText}>{choice}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ドラッグ穴埋め
export function DragFillQuestionUI({ question, dragFillAnswers, isCorrect, answered, onSelect, onClear }: { question: DragFillQuestion; dragFillAnswers: string[]; isCorrect: boolean | null; answered: boolean; onSelect: (opt: string) => void; onClear: (idx: number) => void }) {
  return (
    <div className={styles.dragFillArea}>
      <div className={styles.dragOptions}>
        {question.options.map((opt, idx) => {
          const isUsed = dragFillAnswers.includes(opt)
          return <button key={idx} className={`${styles.dragOption} ${isUsed ? styles.used : ''}`} onClick={() => onSelect(opt)} disabled={answered || isUsed}>{opt}</button>
        })}
      </div>
      <div className={styles.dragSlots}>
        {question.answers.map((_, idx) => (
          <div key={idx} className={`${styles.dragSlot} ${answered ? (dragFillAnswers[idx] === question.answers[idx] ? styles.correct : styles.wrong) : ''}`}>
            {dragFillAnswers[idx] || `空欄${idx + 1}`}
            {dragFillAnswers[idx] && !answered && <button className={styles.clearSlot} onClick={() => onClear(idx)}>×</button>}
          </div>
        ))}
      </div>
      {answered && !isCorrect && <div className={styles.correctAnswer}>正解: {question.answers.join(', ')}</div>}
    </div>
  )
}

// 関連語
export function RelatedQuestionUI({ question, relatedAnswer, answered, onToggle }: { question: RelatedQuestion; relatedAnswer: string[]; answered: boolean; onToggle: (opt: string) => void }) {
  return (
    <div className={styles.choices}>
      {question.options.map((opt, idx) => {
        const isSelected = relatedAnswer.includes(opt)
        const isCorrectOpt = question.correctAnswers.includes(opt)
        let choiceClass = styles.choice
        if (answered) {
          if (isCorrectOpt) choiceClass += ` ${styles.correct}`
          else if (isSelected) choiceClass += ` ${styles.wrong}`
        } else if (isSelected) choiceClass += ` ${styles.selected}`
        return (
          <button key={idx} className={choiceClass} onClick={() => onToggle(opt)} disabled={answered}>
            <span className={styles.choiceLabel}>{isSelected ? '✓' : ['A', 'B', 'C', 'D', 'E'][idx]}</span>
            <span className={styles.choiceText}>{opt}</span>
          </button>
        )
      })}
      <p className={styles.multiSelectHint}>※複数選択可</p>
    </div>
  )
}

// 仲間はずれ
export function OddOneQuestionUI({ question, selectedChoice, answered, onSelect }: { question: OddOneQuestion; selectedChoice: number | null; answered: boolean; onSelect: (idx: number) => void }) {
  return (
    <div className={styles.choices}>
      {question.choices.map((choice, idx) => {
        let choiceClass = styles.choice
        if (answered) {
          if (idx === question.answer) choiceClass += ` ${styles.correct}`
          else if (idx === selectedChoice) choiceClass += ` ${styles.wrong}`
        } else if (idx === selectedChoice) choiceClass += ` ${styles.selected}`
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

// 文章完成
export function CompleteQuestionUI({ question, answer, isCorrect, answered, onChange }: { question: CompleteQuestion; answer: string; isCorrect: boolean | null; answered: boolean; onChange: (v: string) => void }) {
  return (
    <div className={styles.completeArea}>
      <div className={styles.prefix}>「{question.prefix}」</div>
      <input type="text" className={`${styles.fillInInput} ${answered ? (isCorrect ? styles.correct : styles.wrong) : ''}`} value={answer} onChange={e => onChange(e.target.value)} placeholder="続きを入力..." disabled={answered} />
      {answered && !isCorrect && <div className={styles.correctAnswer}>正解: {question.answer}</div>}
    </div>
  )
}

// 逆引き
export function ReverseQuestionUI({ question, selectedChoice, answered, onSelect }: { question: ReverseQuestion; selectedChoice: number | null; answered: boolean; onSelect: (idx: number) => void }) {
  return (
    <div className={styles.reverseArea}>
      <div className={styles.givenAnswer}>答え: 「{question.givenAnswer}」</div>
      <div className={styles.choices}>
        {question.choices.map((choice, idx) => {
          let choiceClass = styles.choice
          if (answered) {
            if (idx === question.answer) choiceClass += ` ${styles.correct}`
            else if (idx === selectedChoice) choiceClass += ` ${styles.wrong}`
          } else if (idx === selectedChoice) choiceClass += ` ${styles.selected}`
          return (
            <button key={idx} className={choiceClass} onClick={() => onSelect(idx)} disabled={answered}>
              <span className={styles.choiceLabel}>{['A', 'B', 'C', 'D'][idx]}</span>
              <span className={styles.choiceText}>{choice}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
