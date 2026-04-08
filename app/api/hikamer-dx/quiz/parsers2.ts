// Quiz question parsers - Part 2 (types 11-20)

import { ParsedQuestion } from './parsers'

// 11: 間違い探し
export function parseFindMistake(parts: string[], category: string): ParsedQuestion | null {
  if (parts.length < 5) return null
  const [, sentence, wrong, correct, ...rest] = parts
  return {
    type: 'findmistake',
    question: '以下の文の間違いを見つけてください',
    sentence: sentence?.trim() || '',
    wrongPart: wrong?.trim() || '',
    correctPart: correct?.trim() || '',
    explanation: rest.join('|')?.trim() || '',
    category
  }
}

// 12: ランキング
export function parseRanking(parts: string[], category: string): ParsedQuestion | null {
  if (parts.length < 7) return null
  const [, question, r1, r2, r3, r4, order, ...rest] = parts
  const items = [r1, r2, r3, r4].map(s => s?.trim()).filter(Boolean)
  
  const aiCorrectOrder = (order || '1,2,3,4').split(',').map(n => parseInt(n.trim()) - 1).filter(n => !isNaN(n) && n >= 0 && n < items.length)
  const validCorrectOrder = aiCorrectOrder.length === items.length ? aiCorrectOrder : items.map((_, i) => i)
  
  const shuffleMap = items.map((_, i) => i).sort(() => Math.random() - 0.5)
  const shuffledItems = shuffleMap.map(i => items[i])
  const newCorrectOrder = validCorrectOrder.map(origIdx => shuffleMap.indexOf(origIdx))
  
  return {
    type: 'ranking',
    question: question?.trim() || '',
    items: shuffledItems,
    correctOrder: newCorrectOrder,
    explanation: rest.join('|')?.trim() || '',
    category
  }
}

// 13: 穴埋め複数
export function parseFillMulti(parts: string[], category: string): ParsedQuestion | null {
  if (parts.length < 4) return null
  const [, sentence, answers, ...rest] = parts
  return {
    type: 'fillmulti',
    question: sentence?.trim() || '',
    answers: (answers || '').split(',').map(s => s.trim()),
    explanation: rest.join('|')?.trim() || '',
    category
  }
}

// 14: タイムライン
export function parseTimeline(parts: string[], category: string): ParsedQuestion | null {
  if (parts.length < 5) return null
  const [, event, answer, tolerance, ...rest] = parts
  return {
    type: 'timeline',
    question: `「${event?.trim()}」はいつ？`,
    answer: answer?.trim() || '',
    tolerance: parseInt(tolerance) || 1,
    explanation: rest.join('|')?.trim() || '',
    category
  }
}

// 15: 引用元当て
export function parseQuoteSource(parts: string[], category: string): ParsedQuestion | null {
  if (parts.length < 8) return null
  const [, tweet, correct, a, b, c, d, ...rest] = parts
  
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
    type: 'quotesource',
    question: `この発言は誰？「${tweet?.trim()}」`,
    choices: shuffled,
    answer: answerIdx,
    explanation: rest.join('|')?.trim() || '',
    category
  }
}

// 16: タグ当て
export function parseHashtag(parts: string[], category: string): ParsedQuestion | null {
  if (parts.length < 6) return null
  const [, tweet, correct, d1, d2, d3, ...rest] = parts
  
  const correctTrimmed = correct?.trim() || ''
  let choices = [d1, d2, d3].map(s => s?.trim() || '').filter(Boolean)
  
  // 正解が番号の場合
  const correctNum = parseInt(correctTrimmed)
  let actualCorrect = correctTrimmed
  if (!isNaN(correctNum) && correctNum >= 1 && correctNum <= 3 && choices[correctNum - 1]) {
    actualCorrect = choices[correctNum - 1]
  }
  
  // 正解を選択肢に追加
  choices = [actualCorrect, ...choices].filter(Boolean).slice(0, 4)
  
  if (choices.length < 4) return null
  
  const shuffled = [...choices].sort(() => Math.random() - 0.5)
  const answerIdx = shuffled.indexOf(actualCorrect)
  if (answerIdx === -1) return null
  
  return {
    type: 'hashtag',
    question: `このツイートについていたタグは？「${tweet?.trim()?.slice(0, 50)}...」`,
    choices: shuffled,
    answer: answerIdx,
    explanation: rest.join('|')?.trim() || '',
    category
  }
}

// 17: リプ先当て
export function parseReplyTo(parts: string[], category: string): ParsedQuestion | null {
  if (parts.length < 8) return null
  const [, reply, correct, a, b, c, d, ...rest] = parts
  
  // 正解が選択肢に含まれているか確認
  const correctTrimmed = correct?.trim() || ''
  let choices = [a, b, c, d].map(s => s?.trim() || '').filter(Boolean)
  
  // 正解が番号の場合（AIが「1」「2」などを出力した場合）、選択肢から正解を取得
  const correctNum = parseInt(correctTrimmed)
  let actualCorrect = correctTrimmed
  if (!isNaN(correctNum) && correctNum >= 1 && correctNum <= 4 && choices[correctNum - 1]) {
    actualCorrect = choices[correctNum - 1]
  }
  
  // 正解が選択肢に含まれていない場合、追加
  if (!choices.includes(actualCorrect) && actualCorrect) {
    choices = [actualCorrect, ...choices.slice(0, 3)]
  }
  
  // 選択肢が4つ未満の場合は失敗
  if (choices.length < 4) return null
  
  const shuffled = [...choices].sort(() => Math.random() - 0.5)
  const answerIdx = shuffled.indexOf(actualCorrect)
  
  // 正解が見つからない場合は失敗
  if (answerIdx === -1) return null
  
  return {
    type: 'replyto',
    question: `このリプライは誰宛？「${reply?.trim()}」`,
    choices: shuffled,
    answer: answerIdx,
    explanation: rest.join('|')?.trim() || '',
    category
  }
}

// 18: フォロワー数
export function parseFollowers(parts: string[], category: string): ParsedQuestion | null {
  if (parts.length < 5) return null
  const [, user, ans, tolerance, ...rest] = parts
  return {
    type: 'followers',
    question: `${user?.trim()}のフォロワー数は約何万人？`,
    answer: parseInt(ans) || 0,
    tolerance: parseInt(tolerance) || 10,
    explanation: rest.join('|')?.trim() || '',
    category
  }
}

// 19: クロスワード
export function parseCrossword(parts: string[], category: string): ParsedQuestion | null {
  if (parts.length < 7) return null
  const [, hint1, ans1, hint2, ans2, common, ...rest] = parts
  return {
    type: 'crossword',
    question: '2つの答えを入力してください',
    hint1: hint1?.trim() || '',
    answer1: ans1?.trim() || '',
    hint2: hint2?.trim() || '',
    answer2: ans2?.trim() || '',
    commonInfo: common?.trim() || '',
    explanation: rest.join('|')?.trim() || '',
    category
  }
}

// 20: アナグラム
export function parseAnagram(parts: string[], category: string): ParsedQuestion | null {
  if (parts.length < 5) return null
  const [, shuffled, answer, hint, ...rest] = parts
  return {
    type: 'anagram',
    question: `文字を並べ替えて答えを作ってください: ${shuffled?.trim()}`,
    shuffledText: shuffled?.trim() || '',
    answer: answer?.trim() || '',
    hint: hint?.trim() || '',
    explanation: rest.join('|')?.trim() || '',
    category
  }
}
