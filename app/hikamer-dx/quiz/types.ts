// 31種類の問題形式
export type QuestionType = 'choice4' | 'truefalse' | 'fillin' | 'order' | 'matching' | 'multiselect' | 'association' | 'number' | 'categorize' | 'speedquiz' | 'findmistake' | 'ranking' | 'fillmulti' | 'timeline' | 'quotesource' | 'hashtag' | 'replyto' | 'followers' | 'crossword' | 'anagram' | 'fillselect' | 'compare' | 'graph' | 'calculation' | 'memory' | 'deduction' | 'dragfill' | 'related' | 'oddone' | 'complete' | 'reverse'

export interface BaseQuestion {
  type: QuestionType
  question: string
  explanation: string
  category: string
}

export interface Choice4Question extends BaseQuestion {
  type: 'choice4'
  choices: string[]
  answer: number
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: 'truefalse'
  answer: boolean
}

export interface FillInQuestion extends BaseQuestion {
  type: 'fillin'
  answer: string
  alternatives: string[]
}

export interface OrderQuestion extends BaseQuestion {
  type: 'order'
  items: string[]
  correctOrder: number[]
}

export interface MatchingQuestion extends BaseQuestion {
  type: 'matching'
  lefts: string[]
  rights: string[]
  correctMatches: number[]
}

export interface MultiSelectQuestion extends BaseQuestion {
  type: 'multiselect'
  choices: string[]
  correctAnswers: number[]
}

export interface AssociationQuestion extends BaseQuestion {
  type: 'association'
  answer: string
  hints: string[]
}

export interface NumberQuestion extends BaseQuestion {
  type: 'number'
  answer: number
  tolerance: number
}

export interface CategorizeQuestion extends BaseQuestion {
  type: 'categorize'
  categoryA: string
  categoryB: string
  items: string[]
  correctCategories: ('A' | 'B')[]
}

export interface SpeedQuizQuestion extends BaseQuestion {
  type: 'speedquiz'
  answer: string
  sentence: string
}

export interface FindMistakeQuestion extends BaseQuestion {
  type: 'findmistake'
  sentence: string
  wrongPart: string
  correctPart: string
}

export interface RankingQuestion extends BaseQuestion {
  type: 'ranking'
  items: string[]
  correctOrder: number[]
}

export interface FillMultiQuestion extends BaseQuestion {
  type: 'fillmulti'
  answers: string[]
}

export interface TimelineQuestion extends BaseQuestion {
  type: 'timeline'
  answer: string
  tolerance: number
}

export interface QuoteSourceQuestion extends BaseQuestion {
  type: 'quotesource'
  choices: string[]
  answer: number
}

export interface HashtagQuestion extends BaseQuestion {
  type: 'hashtag'
  choices: string[]
  answer: number
}

export interface ReplyToQuestion extends BaseQuestion {
  type: 'replyto'
  choices: string[]
  answer: number
}

export interface FollowersQuestion extends BaseQuestion {
  type: 'followers'
  answer: number
  tolerance: number
}

export interface CrosswordQuestion extends BaseQuestion {
  type: 'crossword'
  hint1: string
  answer1: string
  hint2: string
  answer2: string
  commonInfo: string
}

export interface AnagramQuestion extends BaseQuestion {
  type: 'anagram'
  shuffledText: string
  answer: string
  hint: string
}

export interface FillSelectQuestion extends BaseQuestion {
  type: 'fillselect'
  choices: string[]
  answer: number
}

export interface CompareQuestion extends BaseQuestion {
  type: 'compare'
  itemA: string
  itemB: string
  answer: 'A' | 'B'
}

export interface GraphQuestion extends BaseQuestion {
  type: 'graph'
  data: { label: string; value: number }[]
  answer: number
  tolerance: number
}

export interface CalculationQuestion extends BaseQuestion {
  type: 'calculation'
  answer: number
  tolerance: number
}

export interface MemoryQuestion extends BaseQuestion {
  type: 'memory'
  pairs: { left: string; right: string }[]
}

export interface DeductionQuestion extends BaseQuestion {
  type: 'deduction'
  situation: string
  hints: string[]
  choices: string[]
  answer: number
}

export interface DragFillQuestion extends BaseQuestion {
  type: 'dragfill'
  answers: string[]
  options: string[]
}

export interface RelatedQuestion extends BaseQuestion {
  type: 'related'
  keyword: string
  options: string[]
  correctAnswers: string[]
}

export interface OddOneQuestion extends BaseQuestion {
  type: 'oddone'
  choices: string[]
  answer: number
}

export interface CompleteQuestion extends BaseQuestion {
  type: 'complete'
  prefix: string
  answer: string
  alternatives: string[]
}

export interface ReverseQuestion extends BaseQuestion {
  type: 'reverse'
  givenAnswer: string
  choices: string[]
  answer: number
}

export type Question = Choice4Question | TrueFalseQuestion | FillInQuestion | OrderQuestion | MatchingQuestion | MultiSelectQuestion | AssociationQuestion | NumberQuestion | CategorizeQuestion | SpeedQuizQuestion | FindMistakeQuestion | RankingQuestion | FillMultiQuestion | TimelineQuestion | QuoteSourceQuestion | HashtagQuestion | ReplyToQuestion | FollowersQuestion | CrosswordQuestion | AnagramQuestion | FillSelectQuestion | CompareQuestion | GraphQuestion | CalculationQuestion | MemoryQuestion | DeductionQuestion | DragFillQuestion | RelatedQuestion | OddOneQuestion | CompleteQuestion | ReverseQuestion

export interface QuizState {
  questions: Question[]
  currentIndex: number
  score: number
  answered: boolean
  showResult: boolean
}

export interface AnswerState {
  selectedChoice: number | null
  selectedTF: boolean | null
  fillInAnswer: string
  orderAnswer: number[]
  matchingAnswer: number[]
  isCorrect: boolean | null
  multiSelectAnswer: number[]
  associationAnswer: string
  hintsRevealed: number
  numberAnswer: string
  categorizeAnswer: ('A' | 'B' | null)[]
  speedQuizAnswer: string
  revealedChars: number
  mistakeAnswer: string
  rankingAnswer: number[]
  fillMultiAnswers: string[]
  timelineAnswer: string
  crosswordAnswer1: string
  crosswordAnswer2: string
  anagramAnswer: string
  compareAnswer: 'A' | 'B' | null
  graphAnswer: string
  calculationAnswer: string
  memoryFlipped: number[]
  memoryMatched: number[]
  deductionHintsRevealed: number
  dragFillAnswers: string[]
  relatedAnswer: string[]
  completeAnswer: string
}

export interface Quarter {
  value: string
  label: string
  start: string
  end: string
}
