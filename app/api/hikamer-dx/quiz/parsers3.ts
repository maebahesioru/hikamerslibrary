// Quiz question parsers - Part 3 (types 21-31)

import { ParsedQuestion } from './parsers'

// 21: 穴埋め選択
export function parseFillSelect(parts: string[], category: string): ParsedQuestion | null {
  if (parts.length < 8) return null
  const [, sentence, correct, a, b, c, d, ...rest] = parts
  
  const correctTrimmed = correct?.trim() || ''
  let choices = [a, b, c, d].map(s => s?.trim() || '').filter(Boolean)
  
  // 正解が番号の場合
  const correctNum = parseInt(correctTrimmed)
  let actualCorrect = correctTrimmed
  if (!isNaN(correctNum) && correctNum >= 1 && correctNum <= 4 && choices[correctNum - 1]) {
    actualCorrect = choices[correctNum - 1]
  }
  
  if (!choices.includes(actualCorrect) && actualCorrect) {
    choices = [actualCorrect, ...choices.slice(0, 3)]
  }
  
  if (choices.length < 4) return null
  
  const shuffled = [...choices].sort(() => Math.random() - 0.5)
  const answerIdx = shuffled.indexOf(actualCorrect)
  if (answerIdx === -1) return null
  
  return {
    type: 'fillselect',
    question: sentence?.trim() || '',
    choices: shuffled,
    answer: answerIdx,
    explanation: rest.join('|')?.trim() || '',
    category
  }
}

// 22: 比較
export function parseCompare(parts: string[], category: string): ParsedQuestion | null {
  if (parts.length < 6) return null
  const [, question, itemA, itemB, ans, ...rest] = parts
  return {
    type: 'compare',
    question: question?.trim() || '',
    itemA: itemA?.trim() || '',
    itemB: itemB?.trim() || '',
    answer: ans?.trim()?.toUpperCase() === 'A' ? 'A' : 'B',
    explanation: rest.join('|')?.trim() || '',
    category
  }
}

// 23: グラフ
export function parseGraph(parts: string[], category: string): ParsedQuestion | null {
  if (parts.length < 9) return null
  const [, question, ...rest] = parts
  const data: { label: string; value: number }[] = []
  let correctAnswer = 0
  let tolerance = 0
  const explanationParts: string[] = []
  let dataDone = false
  
  for (let i = 0; i < rest.length; i++) {
    const part = rest[i]
    if (!dataDone && part.includes(':') && data.length < 4) {
      const colonIdx = part.lastIndexOf(':')
      const label = part.slice(0, colonIdx).trim()
      const valStr = part.slice(colonIdx + 1).trim()
      const val = parseInt(valStr)
      if (label && !isNaN(val)) {
        data.push({ label, value: val })
      } else {
        dataDone = true
        const num = parseInt(part)
        if (!isNaN(num) && correctAnswer === 0) {
          correctAnswer = num
        } else if (!isNaN(num) && tolerance === 0) {
          tolerance = num
        } else {
          explanationParts.push(part)
        }
      }
    } else {
      dataDone = true
      const num = parseInt(part)
      if (!isNaN(num) && correctAnswer === 0) {
        correctAnswer = num
      } else if (!isNaN(num) && tolerance === 0 && correctAnswer > 0) {
        tolerance = num
      } else {
        explanationParts.push(part)
      }
    }
  }
  
  if (data.length < 2) return null
  
  return {
    type: 'graph',
    question: question?.trim() || '',
    data,
    answer: correctAnswer,
    tolerance,
    explanation: explanationParts.join('|')?.trim() || '',
    category
  }
}

// 24: 計算
export function parseCalculation(parts: string[], category: string): ParsedQuestion | null {
  if (parts.length < 5) return null
  const [, question, ans, tolerance, ...rest] = parts
  return {
    type: 'calculation',
    question: question?.trim() || '',
    answer: parseInt(ans) || 0,
    tolerance: parseInt(tolerance) || 0,
    explanation: rest.join('|')?.trim() || '',
    category
  }
}

// 25: 神経衰弱
export function parseMemory(parts: string[], category: string): ParsedQuestion | null {
  if (parts.length < 5) return null
  const [, question, ...rest] = parts
  const pairs: { left: string; right: string }[] = []
  const explanationParts: string[] = []
  let pairsDone = false
  
  for (const part of rest) {
    if (!pairsDone && part.includes(':') && pairs.length < 4) {
      const colonIdx = part.indexOf(':')
      const left = part.slice(0, colonIdx).trim()
      const right = part.slice(colonIdx + 1).trim()
      if (left && right && left.length < 50 && right.length < 50) {
        pairs.push({ left, right })
      } else {
        pairsDone = true
        explanationParts.push(part)
      }
    } else {
      pairsDone = true
      explanationParts.push(part)
    }
  }
  
  if (pairs.length < 2) return null
  
  return {
    type: 'memory',
    question: question?.trim() || '',
    pairs,
    explanation: explanationParts.join('|')?.trim() || '',
    category
  }
}

// 26: 推理
export function parseDeduction(parts: string[], category: string): ParsedQuestion | null {
  if (parts.length < 12) return null
  const [, situation, h1, h2, h3, q, correct, a, b, c, d, ...rest] = parts
  const choices = [a, b, c, d].map(s => s?.trim() || '')
  const shuffled = [...choices].sort(() => Math.random() - 0.5)
  return {
    type: 'deduction',
    question: q?.trim() || '',
    situation: situation?.trim() || '',
    hints: [h1, h2, h3].map(h => h?.trim()).filter(Boolean),
    choices: shuffled,
    answer: shuffled.indexOf(correct?.trim() || ''),
    explanation: rest.join('|')?.trim() || '',
    category
  }
}

// 27: ドラッグ穴埋め
export function parseDragFill(parts: string[], category: string): ParsedQuestion | null {
  if (parts.length < 7) return null
  const [, sentence, ans1, ans2, d1, d2, ...rest] = parts
  const options = [ans1, ans2, d1, d2].map(s => s?.trim() || '').sort(() => Math.random() - 0.5)
  return {
    type: 'dragfill',
    question: sentence?.trim() || '',
    answers: [ans1?.trim() || '', ans2?.trim() || ''],
    options,
    explanation: rest.join('|')?.trim() || '',
    category
  }
}

// 28: 関連語
export function parseRelated(parts: string[], category: string): ParsedQuestion | null {
  if (parts.length < 8) return null
  const [, keyword, r1, r2, r3, nr1, nr2, ...rest] = parts
  const related = [r1, r2, r3].map(s => s?.trim() || '')
  const notRelated = [nr1, nr2].map(s => s?.trim() || '')
  const allOptions = [...related, ...notRelated].sort(() => Math.random() - 0.5)
  return {
    type: 'related',
    question: `「${keyword?.trim()}」に関連する言葉を全て選べ`,
    keyword: keyword?.trim() || '',
    options: allOptions,
    correctAnswers: related,
    explanation: rest.join('|')?.trim() || '',
    category
  }
}

// 29: 仲間はずれ
export function parseOddOne(parts: string[], category: string): ParsedQuestion | null {
  if (parts.length < 6) return null
  const [, question, m1, m2, m3, odd, ...rest] = parts
  const choices = [m1, m2, m3, odd].map(s => s?.trim() || '').sort(() => Math.random() - 0.5)
  return {
    type: 'oddone',
    question: question?.trim() || '',
    choices,
    answer: choices.indexOf(odd?.trim() || ''),
    explanation: rest.join('|')?.trim() || '',
    category
  }
}

// 30: 文章完成
export function parseComplete(parts: string[], category: string): ParsedQuestion | null {
  if (parts.length < 5) return null
  const [, prefix, answer, alternatives, ...rest] = parts
  return {
    type: 'complete',
    question: `「${prefix?.trim()}」の続きは？`,
    prefix: prefix?.trim() || '',
    answer: answer?.trim() || '',
    alternatives: (alternatives || '').split(',').map(s => s.trim()).filter(Boolean),
    explanation: rest.join('|')?.trim() || '',
    category
  }
}

// 31: 逆引き
export function parseReverse(parts: string[], category: string): ParsedQuestion | null {
  if (parts.length < 7) return null
  const [, answer, correct, d1, d2, d3, ...rest] = parts
  const choices = [correct, d1, d2, d3].map(s => s?.trim() || '').sort(() => Math.random() - 0.5)
  return {
    type: 'reverse',
    question: `「${answer?.trim()}」が答えになる問題は？`,
    givenAnswer: answer?.trim() || '',
    choices,
    answer: choices.indexOf(correct?.trim() || ''),
    explanation: rest.join('|')?.trim() || '',
    category
  }
}
