// JSON format parser for quiz questions

export interface ParsedQuestion {
  type: string
  question?: string
  choices?: string[]
  answer?: number | boolean | string | number[] | string[]
  answers?: string[]
  explanation: string
  category: string
  // Type-specific fields
  items?: string[]
  lefts?: string[]
  rights?: string[]
  correctMatches?: number[]
  correctOrder?: number[]
  correctAnswers?: number[] | string[]
  hints?: string[]
  tolerance?: number
  alternatives?: string[]
  categoryA?: string
  categoryB?: string
  correctCategories?: ('A' | 'B')[]
  sentence?: string
  wrongPart?: string
  correctPart?: string
  pairs?: { left: string; right: string }[]
  hint1?: string
  hint2?: string
  answer1?: string
  answer2?: string
  commonInfo?: string
  shuffledText?: string
  hint?: string
  itemA?: string
  itemB?: string
  data?: { label: string; value: number }[]
  situation?: string
  options?: string[]
  keyword?: string
  prefix?: string
  givenAnswer?: string
}

// JSON行をパースしてQuestion型に変換
export function parseJsonQuestion(line: string, category: string): ParsedQuestion | null {
  try {
    const json = JSON.parse(line.trim())
    const t = json.t
    
    switch (t) {
      case 'choice4':
        return {
          type: 'choice4',
          question: json.q,
          choices: json.c,
          answer: json.a,
          explanation: json.e || '',
          category
        }
      
      case 'tf':
        return {
          type: 'truefalse',
          question: json.q,
          answer: json.a,
          explanation: json.e || '',
          category
        }
      
      case 'fillin':
        return {
          type: 'fillin',
          question: json.q,
          answer: json.a,
          alternatives: json.alt || [json.a],
          explanation: json.e || '',
          category
        }
      
      case 'order':
        return {
          type: 'order',
          question: json.q,
          items: json.items,
          correctOrder: json.a,
          explanation: json.e || '',
          category
        }
      
      case 'match':
        return {
          type: 'matching',
          question: json.q,
          lefts: json.left,
          rights: json.right,
          correctMatches: json.a,
          explanation: json.e || '',
          category
        }
      
      case 'multi':
        return {
          type: 'multiselect',
          question: json.q,
          choices: json.c,
          correctAnswers: json.a,
          explanation: json.e || '',
          category
        }
      
      case 'assoc':
        return {
          type: 'association',
          question: 'ヒントから連想される答えは？',
          answer: json.a,
          hints: json.hints,
          explanation: json.e || '',
          category
        }
      
      case 'number':
        return {
          type: 'number',
          question: json.q,
          answer: json.a,
          tolerance: json.tol || 0,
          explanation: json.e || '',
          category
        }
      
      case 'category':
        return {
          type: 'categorize',
          question: json.q,
          categoryA: json.catA,
          categoryB: json.catB,
          items: json.items.map((i: any) => i.n),
          correctCategories: json.items.map((i: any) => i.c),
          explanation: json.e || '',
          category
        }
      
      case 'speed':
        return {
          type: 'speedquiz',
          question: '次の文章から答えを当てよう',
          answer: json.a,
          sentence: json.text,
          explanation: json.e || '',
          category
        }
      
      case 'mistake':
        return {
          type: 'findmistake',
          question: json.q,
          sentence: json.q,
          wrongPart: json.wrong,
          correctPart: json.correct,
          explanation: json.e || '',
          category
        }
      
      case 'rank':
        return {
          type: 'ranking',
          question: json.q,
          items: json.items,
          correctOrder: json.a,
          explanation: json.e || '',
          category
        }
      
      case 'fillmulti':
        return {
          type: 'fillmulti',
          question: json.q,
          answers: json.a,
          explanation: json.e || '',
          category
        }
      
      case 'timeline':
        return {
          type: 'timeline',
          question: json.q,
          answer: json.a,
          tolerance: json.tol || 1,
          explanation: json.e || '',
          category
        }
      
      case 'quote':
        return {
          type: 'quotesource',
          question: json.q,
          choices: json.c,
          answer: json.a,
          explanation: json.e || '',
          category
        }
      
      case 'hashtag': {
        const correctAnswer = json.a
        const allChoices = [json.a, ...json.dummy]
        // シャッフル
        for (let i = allChoices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[allChoices[i], allChoices[j]] = [allChoices[j], allChoices[i]]
        }
        return {
          type: 'hashtag',
          question: json.q,
          answer: allChoices.indexOf(correctAnswer),
          choices: allChoices,
          explanation: json.e || '',
          category
        }
      }
      
      case 'reply':
        return {
          type: 'replyto',
          question: json.q,
          choices: json.c,
          answer: json.a,
          explanation: json.e || '',
          category
        }
      
      case 'followers':
        return {
          type: 'followers',
          question: json.q,
          answer: json.a,
          tolerance: json.tol || 0,
          explanation: json.e || '',
          category
        }
      
      case 'crossword':
        return {
          type: 'crossword',
          question: '2つのヒントに共通する文字を含む答えは？',
          hint1: json.h1,
          answer1: json.a1,
          hint2: json.h2,
          answer2: json.a2,
          commonInfo: json.common || '',
          explanation: json.e || '',
          category
        }
      
      case 'anagram':
        return {
          type: 'anagram',
          question: '文字を並べ替えて正しい言葉にしよう',
          shuffledText: json.shuffled,
          answer: json.a,
          hint: json.hint || '',
          explanation: json.e || '',
          category
        }
      
      case 'fillselect':
        return {
          type: 'fillselect',
          question: json.q,
          choices: json.c,
          answer: json.a,
          explanation: json.e || '',
          category
        }
      
      case 'compare':
        return {
          type: 'compare',
          question: json.q,
          itemA: json.itemA,
          itemB: json.itemB,
          answer: json.a,
          explanation: json.e || '',
          category
        }
      
      case 'graph':
        return {
          type: 'graph',
          question: json.q,
          data: json.data.map((d: any) => ({ label: d.l, value: d.v })),
          answer: json.a,
          tolerance: json.tol || 0,
          explanation: json.e || '',
          category
        }
      
      case 'calc':
        return {
          type: 'calculation',
          question: json.q,
          answer: json.a,
          tolerance: json.tol || 0,
          explanation: json.e || '',
          category
        }
      
      case 'memory':
        return {
          type: 'memory',
          question: json.q,
          pairs: json.pairs.map((p: any) => ({ left: p.l, right: p.r })),
          explanation: json.e || '',
          category
        }
      
      case 'deduct':
        return {
          type: 'deduction',
          situation: json.situation,
          hints: json.hints,
          question: json.q,
          choices: json.c,
          answer: json.a,
          explanation: json.e || '',
          category
        }
      
      case 'dragfill':
        return {
          type: 'dragfill',
          question: json.q,
          answers: json.a,
          options: [...json.a, ...json.dummy],
          explanation: json.e || '',
          category
        }
      
      case 'related':
        return {
          type: 'related',
          question: `「${json.keyword}」に関連するものを全て選べ`,
          keyword: json.keyword,
          correctAnswers: json.correct,
          options: [...json.correct, ...json.wrong],
          explanation: json.e || '',
          category
        }
      
      case 'oddone':
        return {
          type: 'oddone',
          question: json.q,
          choices: json.items,
          answer: json.a,
          explanation: json.e || '',
          category
        }
      
      case 'complete':
        return {
          type: 'complete',
          question: json.q,
          prefix: json.q,
          answer: json.a,
          alternatives: json.alt || [json.a],
          explanation: json.e || '',
          category
        }
      
      case 'reverse':
        return {
          type: 'reverse',
          question: `「${json.a}」が答えになる問題はどれ？`,
          givenAnswer: json.a,
          choices: json.c,
          answer: json.correct,
          explanation: json.e || '',
          category
        }
      
      default:
        console.log(`[Quiz] Unknown type: ${t}`)
        return null
    }
  } catch (e) {
    return null
  }
}

export function isValidQuestion(q: ParsedQuestion | null): boolean {
  if (!q) return false
  
  // 形式別の検証
  switch (q.type) {
    case 'choice4':
    case 'quotesource':
    case 'replyto':
    case 'fillselect':
    case 'oddone':
    case 'deduction':
      return !!(q.question && q.choices && q.choices.length === 4 && typeof q.answer === 'number')
    
    case 'truefalse':
      return !!(q.question && typeof q.answer === 'boolean')
    
    case 'fillin':
    case 'complete':
      return !!(q.question || q.prefix) && !!q.answer
    
    case 'order':
    case 'ranking':
      return !!(q.question && q.items && q.items.length >= 3 && q.correctOrder && q.correctOrder.length >= 3)
    
    case 'matching':
      return !!(q.lefts && q.lefts.length >= 2 && q.rights && q.rights.length >= 2 && q.correctMatches && q.correctMatches.length >= 2)
    
    case 'multiselect':
      return !!(q.question && q.choices && q.choices.length >= 3 && Array.isArray(q.correctAnswers) && q.correctAnswers.length >= 2)
    
    case 'association':
      return !!(q.answer && q.hints && q.hints.length >= 2)
    
    case 'number':
    case 'followers':
    case 'calculation':
    case 'graph':
      return !!(q.question && typeof q.answer === 'number')
    
    case 'categorize':
      return !!(q.question && q.categoryA && q.categoryB && q.items && q.items.length >= 2)
    
    case 'speedquiz':
      return !!(q.answer && q.sentence)
    
    case 'findmistake':
      return !!((q.question || q.sentence) && q.wrongPart && q.correctPart)
    
    case 'fillmulti':
    case 'dragfill':
      return !!(q.question && Array.isArray(q.answers) && q.answers.length >= 2)
    
    case 'timeline':
      return !!(q.question && q.answer)
    
    case 'hashtag':
      return !!(q.question && q.answer && q.choices && q.choices.length >= 2)
    
    case 'crossword':
      return !!(q.hint1 && q.answer1 && q.hint2 && q.answer2)
    
    case 'anagram':
      return !!(q.shuffledText && q.answer)
    
    case 'compare':
      return !!(q.question && q.itemA && q.itemB && (q.answer === 'A' || q.answer === 'B'))
    
    case 'memory':
      return !!(q.pairs && q.pairs.length >= 2)
    
    case 'related':
      return !!(q.keyword && q.correctAnswers && q.correctAnswers.length >= 2)
    
    case 'reverse':
      return !!(q.givenAnswer && q.choices && q.choices.length >= 2)
    
    default:
      return false
  }
}
