'use client'

import styles from '../quiz.module.css'
import type { Question, AnswerState } from '../types'
import { getTypeBadgeText, getCorrectAnswerText } from '../utils/getCorrectAnswerText'
import { isAnswerComplete } from '../utils/checkAnswer'
import {
  Choice4QuestionUI, TrueFalseQuestionUI, FillInQuestionUI, OrderQuestionUI,
  MatchingQuestionUI, MultiSelectQuestionUI, AssociationQuestionUI,
  NumberQuestionUI, CategorizeQuestionUI, SpeedQuizQuestionUI, FindMistakeQuestionUI,
  RankingQuestionUI, FillMultiQuestionUI, TimelineQuestionUI, ChoiceSelectQuestionUI,
  FollowersQuestionUI, CrosswordQuestionUI, AnagramQuestionUI, CompareQuestionUI,
  GraphQuestionUI, CalculationQuestionUI, MemoryQuestionUI, DeductionQuestionUI,
  DragFillQuestionUI, RelatedQuestionUI, OddOneQuestionUI, CompleteQuestionUI, ReverseQuestionUI
} from './questions'

interface Props {
  question: Question
  questionIndex: number
  totalQuestions: number
  score: number
  answered: boolean
  answerState: AnswerState
  onAnswer: () => void
  onNext: () => void
  setters: {
    setSelectedChoice: (v: number | null) => void
    setSelectedTF: (v: boolean | null) => void
    setFillInAnswer: (v: string) => void
    setOrderAnswer: (v: number[]) => void
    setMatchingAnswer: (v: number[]) => void
    setIsCorrect: (v: boolean | null) => void
    setMultiSelectAnswer: (v: number[]) => void
    setAssociationAnswer: (v: string) => void
    setHintsRevealed: (v: number) => void
    setNumberAnswer: (v: string) => void
    setCategorizeAnswer: (v: ('A' | 'B' | null)[]) => void
    setSpeedQuizAnswer: (v: string) => void
    setRevealedChars: (v: number) => void
    setMistakeAnswer: (v: string) => void
    setRankingAnswer: (v: number[]) => void
    setFillMultiAnswers: (v: string[]) => void
    setTimelineAnswer: (v: string) => void
    setCrosswordAnswer1: (v: string) => void
    setCrosswordAnswer2: (v: string) => void
    setAnagramAnswer: (v: string) => void
    setCompareAnswer: (v: 'A' | 'B' | null) => void
    setGraphAnswer: (v: string) => void
    setCalculationAnswer: (v: string) => void
    setMemoryFlipped: (v: number[]) => void
    setMemoryMatched: (v: number[]) => void
    setDeductionHintsRevealed: (v: number) => void
    setDragFillAnswers: (v: string[]) => void
    setRelatedAnswer: (v: string[]) => void
    setCompleteAnswer: (v: string) => void
  }
}

export function QuizQuestion({ question, questionIndex, totalQuestions, score, answered, answerState, onAnswer, onNext, setters }: Props) {
  const q = question
  const ans = answerState
  const isLast = questionIndex + 1 >= totalQuestions

  const handleMemoryFlip = (id: number, pairId: number, side: string) => {
    if (answered || ans.memoryMatched.includes(id) || ans.memoryFlipped.length >= 2) return
    if (ans.memoryFlipped.includes(id)) return
    
    const newFlipped = [...ans.memoryFlipped, id]
    setters.setMemoryFlipped(newFlipped)
    
    if (newFlipped.length === 2 && q.type === 'memory') {
      const cards = q.pairs.flatMap((p, idx) => [
        { id: idx * 2, pairId: idx, side: 'left' },
        { id: idx * 2 + 1, pairId: idx, side: 'right' }
      ])
      const [first, second] = newFlipped
      const firstCard = cards.find(c => c.id === first)!
      const secondCard = cards.find(c => c.id === second)!
      if (firstCard.pairId === secondCard.pairId && firstCard.side !== secondCard.side) {
        setters.setMemoryMatched([...ans.memoryMatched, first, second])
      }
      setTimeout(() => setters.setMemoryFlipped([]), 1000)
    }
  }

  const renderQuestion = () => {
    switch (q.type) {
      case 'choice4':
        return <Choice4QuestionUI question={q} selectedChoice={ans.selectedChoice} answered={answered} onSelect={setters.setSelectedChoice} />
      case 'truefalse':
        return <TrueFalseQuestionUI question={q} selectedTF={ans.selectedTF} answered={answered} onSelect={setters.setSelectedTF} />
      case 'fillin':
        return <FillInQuestionUI question={q} answer={ans.fillInAnswer} isCorrect={ans.isCorrect} answered={answered} onChange={setters.setFillInAnswer} />
      case 'order':
        return <OrderQuestionUI question={q} orderAnswer={ans.orderAnswer} answered={answered}
          onToggle={idx => ans.orderAnswer.includes(idx) ? setters.setOrderAnswer(ans.orderAnswer.filter(i => i !== idx)) : setters.setOrderAnswer([...ans.orderAnswer, idx])}
          onClear={() => setters.setOrderAnswer([])} />
      case 'matching':
        return <MatchingQuestionUI question={q} matchingAnswer={ans.matchingAnswer} isCorrect={ans.isCorrect} answered={answered}
          onChange={(idx, val) => { const n = [...ans.matchingAnswer]; n[idx] = val; setters.setMatchingAnswer(n) }} />
      case 'multiselect':
        return <MultiSelectQuestionUI question={q} multiSelectAnswer={ans.multiSelectAnswer} answered={answered}
          onToggle={idx => ans.multiSelectAnswer.includes(idx) ? setters.setMultiSelectAnswer(ans.multiSelectAnswer.filter(i => i !== idx)) : setters.setMultiSelectAnswer([...ans.multiSelectAnswer, idx])} />
      case 'association':
        return <AssociationQuestionUI question={q} answer={ans.associationAnswer} hintsRevealed={ans.hintsRevealed} isCorrect={ans.isCorrect} answered={answered}
          onChange={setters.setAssociationAnswer} onRevealHint={() => setters.setHintsRevealed(ans.hintsRevealed + 1)} />
      case 'number':
        return <NumberQuestionUI question={q} answer={ans.numberAnswer} isCorrect={ans.isCorrect} answered={answered} onChange={setters.setNumberAnswer} />
      case 'categorize':
        return <CategorizeQuestionUI question={q} categorizeAnswer={ans.categorizeAnswer} answered={answered}
          onChange={(idx, val) => { const n = [...ans.categorizeAnswer]; n[idx] = val; setters.setCategorizeAnswer(n) }} />
      case 'speedquiz':
        return <SpeedQuizQuestionUI question={q} answer={ans.speedQuizAnswer} revealedChars={ans.revealedChars} isCorrect={ans.isCorrect} answered={answered}
          onChange={setters.setSpeedQuizAnswer} onReveal={() => setters.setRevealedChars(Math.min(ans.revealedChars + 10, q.sentence.length))} />
      case 'findmistake':
        return <FindMistakeQuestionUI question={q} answer={ans.mistakeAnswer} isCorrect={ans.isCorrect} answered={answered} onChange={setters.setMistakeAnswer} />
      case 'ranking':
        return <RankingQuestionUI question={q} rankingAnswer={ans.rankingAnswer} answered={answered}
          onToggle={idx => ans.rankingAnswer.includes(idx) ? setters.setRankingAnswer(ans.rankingAnswer.filter(i => i !== idx)) : setters.setRankingAnswer([...ans.rankingAnswer, idx])}
          onClear={() => setters.setRankingAnswer([])} />
      case 'fillmulti':
        return <FillMultiQuestionUI question={q} answers={ans.fillMultiAnswers} answered={answered}
          onChange={(idx, v) => { const n = [...ans.fillMultiAnswers]; n[idx] = v; setters.setFillMultiAnswers(n) }} />
      case 'timeline':
        return <TimelineQuestionUI question={q} answer={ans.timelineAnswer} isCorrect={ans.isCorrect} answered={answered} onChange={setters.setTimelineAnswer} />
      case 'quotesource':
      case 'hashtag':
      case 'replyto':
      case 'fillselect':
        return <ChoiceSelectQuestionUI question={q} selectedChoice={ans.selectedChoice} answered={answered} onSelect={setters.setSelectedChoice} />
      case 'followers':
        return <FollowersQuestionUI question={q} answer={ans.numberAnswer} isCorrect={ans.isCorrect} answered={answered} onChange={setters.setNumberAnswer} />
      case 'crossword':
        return <CrosswordQuestionUI question={q} answer1={ans.crosswordAnswer1} answer2={ans.crosswordAnswer2} isCorrect={ans.isCorrect} answered={answered}
          onChange1={setters.setCrosswordAnswer1} onChange2={setters.setCrosswordAnswer2} />
      case 'anagram':
        return <AnagramQuestionUI question={q} answer={ans.anagramAnswer} isCorrect={ans.isCorrect} answered={answered} onChange={setters.setAnagramAnswer} />
      case 'compare':
        return <CompareQuestionUI question={q} compareAnswer={ans.compareAnswer} answered={answered} onSelect={setters.setCompareAnswer} />
      case 'graph':
        return <GraphQuestionUI question={q} answer={ans.graphAnswer} isCorrect={ans.isCorrect} answered={answered} onChange={setters.setGraphAnswer} />
      case 'calculation':
        return <CalculationQuestionUI question={q} answer={ans.calculationAnswer} isCorrect={ans.isCorrect} answered={answered} onChange={setters.setCalculationAnswer} />
      case 'memory':
        return <MemoryQuestionUI question={q} memoryFlipped={ans.memoryFlipped} memoryMatched={ans.memoryMatched} answered={answered} onFlip={handleMemoryFlip} />
      case 'deduction':
        return <DeductionQuestionUI question={q} selectedChoice={ans.selectedChoice} hintsRevealed={ans.deductionHintsRevealed} answered={answered}
          onSelect={setters.setSelectedChoice} onRevealHint={() => setters.setDeductionHintsRevealed(ans.deductionHintsRevealed + 1)} />
      case 'dragfill':
        return <DragFillQuestionUI question={q} dragFillAnswers={ans.dragFillAnswers} isCorrect={ans.isCorrect} answered={answered}
          onSelect={opt => { const emptyIdx = ans.dragFillAnswers.length < q.answers.length ? ans.dragFillAnswers.length : ans.dragFillAnswers.findIndex(a => !a); if (emptyIdx !== -1 || ans.dragFillAnswers.length < q.answers.length) { const n = [...ans.dragFillAnswers]; n[emptyIdx === -1 ? ans.dragFillAnswers.length : emptyIdx] = opt; setters.setDragFillAnswers(n) } }}
          onClear={idx => { const n = [...ans.dragFillAnswers]; n[idx] = ''; setters.setDragFillAnswers(n) }} />
      case 'related':
        return <RelatedQuestionUI question={q} relatedAnswer={ans.relatedAnswer} answered={answered}
          onToggle={opt => ans.relatedAnswer.includes(opt) ? setters.setRelatedAnswer(ans.relatedAnswer.filter(a => a !== opt)) : setters.setRelatedAnswer([...ans.relatedAnswer, opt])} />
      case 'oddone':
        return <OddOneQuestionUI question={q} selectedChoice={ans.selectedChoice} answered={answered} onSelect={setters.setSelectedChoice} />
      case 'complete':
        return <CompleteQuestionUI question={q} answer={ans.completeAnswer} isCorrect={ans.isCorrect} answered={answered} onChange={setters.setCompleteAnswer} />
      case 'reverse':
        return <ReverseQuestionUI question={q} selectedChoice={ans.selectedChoice} answered={answered} onSelect={setters.setSelectedChoice} />
      default:
        return null
    }
  }

  return (
    <div className={styles.quizArea}>
      <div className={styles.progress}>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${((questionIndex + 1) / totalQuestions) * 100}%` }} />
        </div>
        <span>{questionIndex + 1} / {totalQuestions}</span>
      </div>

      <div className={styles.questionCard}>
        <div className={styles.questionMeta}>
          <span className={styles.categoryBadge}>{q.category === 'people' ? '👥 人物' : '🎯 全般'}</span>
          <span className={styles.typeBadge}>{getTypeBadgeText(q.type)}</span>
        </div>

        <h2 className={styles.question}>{q.question}</h2>

        {renderQuestion()}

        {!answered && (
          <button type="button" className={styles.submitBtn} onClick={onAnswer} disabled={!isAnswerComplete(q, ans)}>
            回答する
          </button>
        )}

        {answered && (
          <div className={styles.explanation}>
            <div className={styles.resultIcon}>{ans.isCorrect ? '✅ 正解！' : '❌ 不正解...'}</div>
            {!ans.isCorrect && (
              <p className={styles.correctAnswer}>正解: {getCorrectAnswerText(q)}</p>
            )}
            <p>{q.explanation}</p>
            <button type="button" className={styles.nextBtn} onClick={onNext}>
              {isLast ? '結果を見る →' : '次の問題 →'}
            </button>
          </div>
        )}
      </div>

      <div className={styles.scoreDisplay}>
        現在のスコア: {score} / {questionIndex + (answered ? 1 : 0)}
      </div>
    </div>
  )
}
