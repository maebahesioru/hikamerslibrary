import { useState, useCallback } from 'react'
import type { Question, QuizState, Quarter } from '../types'

const initialQuizState: QuizState = {
  questions: [],
  currentIndex: 0,
  score: 0,
  answered: false,
  showResult: false
}

export function generateQuarters(): Quarter[] {
  const quarters: Quarter[] = [{ value: 'all', label: '全期間', start: '', end: '' }]
  const now = new Date()
  const currentYear = now.getFullYear()
  
  for (let year = 2019; year <= currentYear; year++) {
    for (let q = 1; q <= 4; q++) {
      const startMonth = (q - 1) * 3 + 1
      const endMonth = q * 3
      const start = `${year}-${String(startMonth).padStart(2, '0')}-01`
      const lastDay = new Date(year, endMonth, 0).getDate()
      const end = `${year}-${String(endMonth).padStart(2, '0')}-${lastDay}`
      if (new Date(start) > now) break
      quarters.push({ value: `${year}Q${q}`, label: `${year} Q${q}`, start, end })
    }
  }
  return quarters.reverse()
}

export function useQuizLogic() {
  const [quiz, setQuiz] = useState<QuizState>(initialQuizState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resetQuiz = useCallback(() => setQuiz(initialQuizState), [])

  const setQuestions = useCallback((questions: Question[]) => {
    setQuiz(prev => ({ ...prev, questions }))
  }, [])

  const markAnswered = useCallback((correct: boolean) => {
    setQuiz(prev => ({
      ...prev,
      answered: true,
      score: correct ? prev.score + 1 : prev.score
    }))
  }, [])

  const nextQuestion = useCallback(() => {
    setQuiz(prev => {
      if (prev.currentIndex + 1 >= prev.questions.length) {
        return { ...prev, showResult: true }
      }
      return { ...prev, currentIndex: prev.currentIndex + 1, answered: false }
    })
  }, [])

  const generateQuiz = useCallback(async (params: {
    category: string
    count: number
    startDate: string
    endDate: string
    userId?: string
  }) => {
    setLoading(true)
    setError(null)
    setQuiz(initialQuizState)
    
    try {
      const res = await fetch('/api/hikamer-dx/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      })
      
      if (!res.ok) {
        const text = await res.text()
        let errorMsg = 'クイズの生成に失敗しました'
        try {
          const data = JSON.parse(text)
          errorMsg = data.error || errorMsg
        } catch {}
        throw new Error(errorMsg)
      }
      
      // ストリーミングレスポンスを処理
      const reader = res.body?.getReader()
      if (!reader) throw new Error('レスポンスの読み取りに失敗')
      
      const decoder = new TextDecoder()
      let buffer = ''
      const questions: Question[] = []
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        
        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const data = JSON.parse(line)
            if (data.error) {
              throw new Error(data.error)
            }
            questions.push(data as Question)
            // リアルタイムで問題を追加
            setQuiz(prev => ({ ...prev, questions: [...questions] }))
          } catch (e) {
            // JSON以外の行は無視
          }
        }
      }
      
      // 残りのバッファを処理
      if (buffer.trim()) {
        try {
          const data = JSON.parse(buffer)
          if (data.error) throw new Error(data.error)
          questions.push(data as Question)
        } catch {}
      }
      
      if (questions.length === 0) throw new Error('クイズが生成されませんでした')
      
      // 最終的な問題リストをシャッフル
      const shuffled = [...questions].sort(() => Math.random() - 0.5)
      setQuiz(prev => ({ ...prev, questions: shuffled }))
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    quiz,
    loading,
    error,
    resetQuiz,
    setQuestions,
    markAnswered,
    nextQuestion,
    generateQuiz,
    currentQuestion: quiz.questions[quiz.currentIndex] as Question | undefined
  }
}
