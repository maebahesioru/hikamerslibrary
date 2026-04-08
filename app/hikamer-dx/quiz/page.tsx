'use client'

import { Suspense } from 'react'
import { useRouter } from 'next/navigation'
import styles from './quiz.module.css'
import { useQuizLogic, generateQuarters } from './hooks/useQuizLogic'
import { useAnswerState } from './hooks/useAnswerState'
import { checkAnswer } from './utils/checkAnswer'
import { QuizSetup } from './components/QuizSetup'
import { QuizQuestion } from './components/QuizQuestion'
import { QuizResult } from './components/QuizResult'

function QuizContent() {
  const router = useRouter()
  const quarters = generateQuarters()
  const { quiz, loading, error, resetQuiz, markAnswered, nextQuestion, generateQuiz, currentQuestion } = useQuizLogic()
  const answerState = useAnswerState()

  const handleAnswer = () => {
    if (!currentQuestion || quiz.answered) return
    const correct = checkAnswer(currentQuestion, answerState)
    answerState.setIsCorrect(correct)
    markAnswered(correct)
  }

  const handleNext = () => {
    answerState.reset()
    nextQuestion()
  }

  const handleRetry = () => {
    answerState.reset()
    generateQuiz({
      category: 'all',
      count: quiz.questions.length,
      startDate: '',
      endDate: ''
    })
  }

  const handleReset = () => {
    answerState.reset()
    resetQuiz()
  }

  const handleStart = (params: { category: string; count: number; startDate: string; endDate: string; userId?: string }) => {
    answerState.reset()
    generateQuiz(params)
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.push('/hikamer-dx')}>← 戻る</button>
        <h1>📝 ヒカマニ界隈クイズ</h1>
        <p>AIが生成するヒカマニ・ヒカマー界隈の知識テスト</p>
      </header>

      {quiz.questions.length === 0 && !loading && (
        <QuizSetup quarters={quarters} onStart={handleStart} loading={loading} error={error} />
      )}

      {loading && (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>AIがクイズを生成中...</p>
          <p className={styles.loadingHint}>ツイートデータを分析して問題を作成しています</p>
        </div>
      )}

      {currentQuestion && !quiz.showResult && (
        <QuizQuestion
          question={currentQuestion}
          questionIndex={quiz.currentIndex}
          totalQuestions={quiz.questions.length}
          score={quiz.score}
          answered={quiz.answered}
          answerState={answerState}
          onAnswer={handleAnswer}
          onNext={handleNext}
          setters={{
            setSelectedChoice: answerState.setSelectedChoice,
            setSelectedTF: answerState.setSelectedTF,
            setFillInAnswer: answerState.setFillInAnswer,
            setOrderAnswer: answerState.setOrderAnswer,
            setMatchingAnswer: answerState.setMatchingAnswer,
            setIsCorrect: answerState.setIsCorrect,
            setMultiSelectAnswer: answerState.setMultiSelectAnswer,
            setAssociationAnswer: answerState.setAssociationAnswer,
            setHintsRevealed: answerState.setHintsRevealed,
            setNumberAnswer: answerState.setNumberAnswer,
            setCategorizeAnswer: answerState.setCategorizeAnswer,
            setSpeedQuizAnswer: answerState.setSpeedQuizAnswer,
            setRevealedChars: answerState.setRevealedChars,
            setMistakeAnswer: answerState.setMistakeAnswer,
            setRankingAnswer: answerState.setRankingAnswer,
            setFillMultiAnswers: answerState.setFillMultiAnswers,
            setTimelineAnswer: answerState.setTimelineAnswer,
            setCrosswordAnswer1: answerState.setCrosswordAnswer1,
            setCrosswordAnswer2: answerState.setCrosswordAnswer2,
            setAnagramAnswer: answerState.setAnagramAnswer,
            setCompareAnswer: answerState.setCompareAnswer,
            setGraphAnswer: answerState.setGraphAnswer,
            setCalculationAnswer: answerState.setCalculationAnswer,
            setMemoryFlipped: answerState.setMemoryFlipped,
            setMemoryMatched: answerState.setMemoryMatched,
            setDeductionHintsRevealed: answerState.setDeductionHintsRevealed,
            setDragFillAnswers: answerState.setDragFillAnswers,
            setRelatedAnswer: answerState.setRelatedAnswer,
            setCompleteAnswer: answerState.setCompleteAnswer
          }}
        />
      )}

      {quiz.showResult && (
        <QuizResult
          questions={quiz.questions}
          score={quiz.score}
          onRetry={handleRetry}
          onReset={handleReset}
        />
      )}
    </div>
  )
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div className={styles.loading}><div className={styles.spinner}></div></div>}>
      <QuizContent />
    </Suspense>
  )
}
