import { useState, useCallback } from 'react'
import type { AnswerState } from '../types'

const initialState: AnswerState = {
  selectedChoice: null,
  selectedTF: null,
  fillInAnswer: '',
  orderAnswer: [],
  matchingAnswer: [],
  isCorrect: null,
  multiSelectAnswer: [],
  associationAnswer: '',
  hintsRevealed: 0,
  numberAnswer: '',
  categorizeAnswer: [],
  speedQuizAnswer: '',
  revealedChars: 0,
  mistakeAnswer: '',
  rankingAnswer: [],
  fillMultiAnswers: [],
  timelineAnswer: '',
  crosswordAnswer1: '',
  crosswordAnswer2: '',
  anagramAnswer: '',
  compareAnswer: null,
  graphAnswer: '',
  calculationAnswer: '',
  memoryFlipped: [],
  memoryMatched: [],
  deductionHintsRevealed: 0,
  dragFillAnswers: [],
  relatedAnswer: [],
  completeAnswer: ''
}

export function useAnswerState() {
  const [state, setState] = useState<AnswerState>(initialState)

  const reset = useCallback(() => setState(initialState), [])

  const setSelectedChoice = useCallback((v: number | null) => setState(s => ({ ...s, selectedChoice: v })), [])
  const setSelectedTF = useCallback((v: boolean | null) => setState(s => ({ ...s, selectedTF: v })), [])
  const setFillInAnswer = useCallback((v: string) => setState(s => ({ ...s, fillInAnswer: v })), [])
  const setOrderAnswer = useCallback((v: number[]) => setState(s => ({ ...s, orderAnswer: v })), [])
  const setMatchingAnswer = useCallback((v: number[]) => setState(s => ({ ...s, matchingAnswer: v })), [])
  const setIsCorrect = useCallback((v: boolean | null) => setState(s => ({ ...s, isCorrect: v })), [])
  const setMultiSelectAnswer = useCallback((v: number[]) => setState(s => ({ ...s, multiSelectAnswer: v })), [])
  const setAssociationAnswer = useCallback((v: string) => setState(s => ({ ...s, associationAnswer: v })), [])
  const setHintsRevealed = useCallback((v: number) => setState(s => ({ ...s, hintsRevealed: v })), [])
  const setNumberAnswer = useCallback((v: string) => setState(s => ({ ...s, numberAnswer: v })), [])
  const setCategorizeAnswer = useCallback((v: ('A' | 'B' | null)[]) => setState(s => ({ ...s, categorizeAnswer: v })), [])
  const setSpeedQuizAnswer = useCallback((v: string) => setState(s => ({ ...s, speedQuizAnswer: v })), [])
  const setRevealedChars = useCallback((v: number) => setState(s => ({ ...s, revealedChars: v })), [])
  const setMistakeAnswer = useCallback((v: string) => setState(s => ({ ...s, mistakeAnswer: v })), [])
  const setRankingAnswer = useCallback((v: number[]) => setState(s => ({ ...s, rankingAnswer: v })), [])
  const setFillMultiAnswers = useCallback((v: string[]) => setState(s => ({ ...s, fillMultiAnswers: v })), [])
  const setTimelineAnswer = useCallback((v: string) => setState(s => ({ ...s, timelineAnswer: v })), [])
  const setCrosswordAnswer1 = useCallback((v: string) => setState(s => ({ ...s, crosswordAnswer1: v })), [])
  const setCrosswordAnswer2 = useCallback((v: string) => setState(s => ({ ...s, crosswordAnswer2: v })), [])
  const setAnagramAnswer = useCallback((v: string) => setState(s => ({ ...s, anagramAnswer: v })), [])
  const setCompareAnswer = useCallback((v: 'A' | 'B' | null) => setState(s => ({ ...s, compareAnswer: v })), [])
  const setGraphAnswer = useCallback((v: string) => setState(s => ({ ...s, graphAnswer: v })), [])
  const setCalculationAnswer = useCallback((v: string) => setState(s => ({ ...s, calculationAnswer: v })), [])
  const setMemoryFlipped = useCallback((v: number[]) => setState(s => ({ ...s, memoryFlipped: v })), [])
  const setMemoryMatched = useCallback((v: number[]) => setState(s => ({ ...s, memoryMatched: v })), [])
  const setDeductionHintsRevealed = useCallback((v: number) => setState(s => ({ ...s, deductionHintsRevealed: v })), [])
  const setDragFillAnswers = useCallback((v: string[]) => setState(s => ({ ...s, dragFillAnswers: v })), [])
  const setRelatedAnswer = useCallback((v: string[]) => setState(s => ({ ...s, relatedAnswer: v })), [])
  const setCompleteAnswer = useCallback((v: string) => setState(s => ({ ...s, completeAnswer: v })), [])

  return {
    ...state,
    reset,
    setSelectedChoice,
    setSelectedTF,
    setFillInAnswer,
    setOrderAnswer,
    setMatchingAnswer,
    setIsCorrect,
    setMultiSelectAnswer,
    setAssociationAnswer,
    setHintsRevealed,
    setNumberAnswer,
    setCategorizeAnswer,
    setSpeedQuizAnswer,
    setRevealedChars,
    setMistakeAnswer,
    setRankingAnswer,
    setFillMultiAnswers,
    setTimelineAnswer,
    setCrosswordAnswer1,
    setCrosswordAnswer2,
    setAnagramAnswer,
    setCompareAnswer,
    setGraphAnswer,
    setCalculationAnswer,
    setMemoryFlipped,
    setMemoryMatched,
    setDeductionHintsRevealed,
    setDragFillAnswers,
    setRelatedAnswer,
    setCompleteAnswer
  }
}
