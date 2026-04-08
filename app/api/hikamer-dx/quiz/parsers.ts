// Quiz question parsers for each type

export interface ParsedQuestion {
  type: string
  question: string
  category: string
  [key: string]: unknown
}

// 1: 4択
export function parseChoice4(parts: string[], category: string): ParsedQuestion | null {
  if (parts.length < 8) return null
  const [, question, a, b, c, d, ans, ...rest] = parts
  const ansStr = ans?.trim().toUpperCase() || ''
  let originalAnswer = 0
  if (ansStr === 'A' || ansStr === '1') originalAnswer = 0
  else if (ansStr === 'B' || ansStr === '2') originalAnswer = 1
  else if (ansStr === 'C' || ansStr === '3') originalAnswer = 2
  else if (ansStr === 'D' || ansStr === '4') originalAnswer = 3
  
  const choices = [a?.trim() || '', b?.trim() || '', c?.trim() || '', d?.trim() || '']
  const correctChoice = choices[originalAnswer]
  const shuffled = [...choices].sort(() => Math.random() - 0.5)
  const newAnswer = shuffled.indexOf(correctChoice)
  
  return {
    type: 'choice4',
    question: question?.trim() || '',
    choices: shuffled,
    answer: newAnswer,
    explanation: rest.join('|')?.trim() || '',
    category
  }
}

// 2: ○×
export function parseTrueFalse(parts: string[], category: string): ParsedQuestion | null {
  if (parts.length < 4) return null
  const [, question, ans, ...rest] = parts
  
  const ansTrimmed = ans?.trim() || ''
  
  // ○×以外の回答は無効（AIが形式を間違えている）
  if (ansTrimmed !== '○' && ansTrimmed !== '×' && ansTrimmed !== 'O' && ansTrimmed !== 'X' && ansTrimmed.toLowerCase() !== 'true' && ansTrimmed.toLowerCase() !== 'false') {
    return null
  }
  
  const isTrue = ansTrimmed === '○' || ansTrimmed === 'O' || ansTrimmed.toLowerCase() === 'true'
  
  return {
    type: 'truefalse',
    question: question?.trim() || '',
    answer: isTrue,
    explanation: rest.join('|')?.trim() || '',
    category
  }
}

// 3: 穴埋め
export function parseFillIn(parts: string[], category: string): ParsedQuestion | null {
  if (parts.length < 5) return null
  const [, question, answer, alternatives, ...rest] = parts
  return {
    type: 'fillin',
    question: question?.trim() || '',
    answer: answer?.trim() || '',
    alternatives: (alternatives || '').split(',').map(s => s.trim()).filter(Boolean),
    explanation: rest.join('|')?.trim() || '',
    category
  }
}

// 4: 並べ替え
export function parseOrder(parts: string[], category: string): ParsedQuestion | null {
  if (parts.length < 7) return null
  const [, question, i1, i2, i3, i4, order, ...rest] = parts
  const items = [i1, i2, i3, i4].map(s => s?.trim()).filter(Boolean)
  
  const aiCorrectOrder = (order || '1,2,3,4').split(',').map(n => parseInt(n.trim()) - 1).filter(n => !isNaN(n) && n >= 0 && n < items.length)
  const validCorrectOrder = aiCorrectOrder.length === items.length ? aiCorrectOrder : items.map((_, i) => i)
  
  const shuffleMap = items.map((_, i) => i).sort(() => Math.random() - 0.5)
  const shuffledItems = shuffleMap.map(i => items[i])
  const newCorrectOrder = validCorrectOrder.map(origIdx => shuffleMap.indexOf(origIdx))
  
  return {
    type: 'order',
    question: question?.trim() || '',
    items: shuffledItems,
    correctOrder: newCorrectOrder,
    explanation: rest.join('|')?.trim() || '',
    category
  }
}

// 5: マッチング
export function parseMatching(parts: string[], category: string): ParsedQuestion | null {
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
  
  const rights = pairs.map(p => p.right)
  const shuffledRights = [...rights].sort(() => Math.random() - 0.5)
  const correctMatches = pairs.map(p => shuffledRights.indexOf(p.right))
  
  return {
    type: 'matching',
    question: question?.trim() || '',
    lefts: pairs.map(p => p.left),
    rights: shuffledRights,
    correctMatches,
    explanation: explanationParts.join('|')?.trim() || '',
    category
  }
}

// 6: 複数選択
export function parseMultiSelect(parts: string[], category: string): ParsedQuestion | null {
  if (parts.length < 8) return null
  const [, question, a, b, c, d, ans, ...rest] = parts
  const correctAnswers = (ans || '').split(',').map(n => parseInt(n.trim()) - 1).filter(n => !isNaN(n) && n >= 0 && n < 4)
  const choices = [a?.trim() || '', b?.trim() || '', c?.trim() || '', d?.trim() || '']
  
  // 正解が1つ以下の場合は複数選択として不適切（4択問題として処理すべき）
  if (correctAnswers.length <= 1) {
    return null
  }
  
  const indices = [0, 1, 2, 3]
  const shuffledIndices = [...indices].sort(() => Math.random() - 0.5)
  const shuffledChoices = shuffledIndices.map(i => choices[i])
  const newCorrectAnswers = correctAnswers.map(oldIdx => shuffledIndices.indexOf(oldIdx))
  
  return {
    type: 'multiselect',
    question: question?.trim() || '',
    choices: shuffledChoices,
    correctAnswers: newCorrectAnswers.sort((a, b) => a - b),
    explanation: rest.join('|')?.trim() || '',
    category
  }
}

// 7: 連想
export function parseAssociation(parts: string[], category: string): ParsedQuestion | null {
  if (parts.length < 5) return null
  const [, answer, h1, h2, h3, ...rest] = parts
  return {
    type: 'association',
    question: 'この人物・ものは何？',
    answer: answer?.trim() || '',
    hints: [h1, h2, h3].map(h => h?.trim()).filter(Boolean),
    explanation: rest.join('|')?.trim() || '',
    category
  }
}

// 8: 数値入力
// 形式: 8|質問|正解数値|許容範囲|解説
export function parseNumber(parts: string[], category: string): ParsedQuestion | null {
  if (parts.length < 5) return null
  const [, question, ans, tolerance, ...rest] = parts
  
  // 正解が数値でない場合は無効
  const answer = parseInt(ans)
  if (isNaN(answer)) return null
  
  // 解説文を取得（パイプが多すぎる場合は最後の意味のある部分を使用）
  let explanation = rest.join('|')?.trim() || ''
  
  // 解説にパイプが3つ以上含まれている場合、AIが余計なフィールドを出力した可能性
  // 日本語の説明文らしい部分を探す
  if (rest.length > 2) {
    // 最後の要素が解説文である可能性が高い
    const lastPart = rest[rest.length - 1]?.trim()
    // 日本語を含む、または句読点を含む場合は解説として採用
    if (lastPart && (/[ぁ-んァ-ン一-龥]/.test(lastPart) || /[。、！？]/.test(lastPart))) {
      explanation = lastPart
    }
  }
  
  return {
    type: 'number',
    question: question?.trim() || '',
    answer,
    tolerance: parseInt(tolerance) || 0,
    explanation,
    category
  }
}

// 9: カテゴリ分類
export function parseCategorize(parts: string[], category: string): ParsedQuestion | null {
  if (parts.length < 8) return null
  const [, question, catA, catB, ...rest] = parts
  const items: { name: string; category: 'A' | 'B' }[] = []
  const explanationParts: string[] = []
  let itemsDone = false
  
  for (const part of rest) {
    if (!itemsDone && part.includes(':') && items.length < 6) {
      const colonIdx = part.lastIndexOf(':')
      const name = part.slice(0, colonIdx).trim()
      const cat = part.slice(colonIdx + 1).trim()
      if (name && (cat === 'A' || cat === 'B')) {
        items.push({ name, category: cat as 'A' | 'B' })
      } else {
        itemsDone = true
        explanationParts.push(part)
      }
    } else {
      itemsDone = true
      explanationParts.push(part)
    }
  }
  
  if (items.length < 2) return null
  
  const shuffledItems = [...items].sort(() => Math.random() - 0.5)
  
  return {
    type: 'categorize',
    question: question?.trim() || '',
    categoryA: catA?.trim() || 'A',
    categoryB: catB?.trim() || 'B',
    items: shuffledItems.map(i => i.name),
    correctCategories: shuffledItems.map(i => i.category),
    explanation: explanationParts.join('|')?.trim() || '',
    category
  }
}

// 10: 早押し風
export function parseSpeedQuiz(parts: string[], category: string): ParsedQuestion | null {
  if (parts.length < 4) return null
  const [, answer, sentence, ...rest] = parts
  return {
    type: 'speedquiz',
    question: '誰（何）のことでしょう？',
    answer: answer?.trim() || '',
    sentence: sentence?.trim() || '',
    explanation: rest.join('|')?.trim() || '',
    category
  }
}
