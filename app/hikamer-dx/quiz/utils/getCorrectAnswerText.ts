import type { Question } from '../types'

export function getCorrectAnswerText(q: Question): string {
  switch (q.type) {
    case 'choice4': return q.choices[q.answer]
    case 'truefalse': return q.answer ? '○' : '×'
    case 'fillin': return q.answer
    case 'order': return q.correctOrder.map(i => q.items[i]).join(' → ')
    case 'matching': return q.lefts.map((l, i) => `${l}→${q.rights[q.correctMatches[i]]}`).join(', ')
    case 'multiselect': return q.correctAnswers.map(i => q.choices[i]).join(', ')
    case 'association': return q.answer
    case 'number': return String(q.answer)
    case 'categorize': return q.items.map((item, i) => `${item}→${q.correctCategories[i] === 'A' ? q.categoryA : q.categoryB}`).join(', ')
    case 'speedquiz': return q.answer
    case 'findmistake': return `${q.wrongPart}→${q.correctPart}`
    case 'ranking': return q.correctOrder.map(i => q.items[i]).join(' > ')
    case 'fillmulti': return q.answers.join(', ')
    case 'timeline': return q.answer
    case 'quotesource':
    case 'hashtag':
    case 'replyto':
    case 'fillselect': return q.choices[q.answer]
    case 'followers': return `約${q.answer}人`
    case 'crossword': return `${q.answer1}, ${q.answer2}`
    case 'anagram': return q.answer
    case 'compare': return q.answer === 'A' ? q.itemA : q.itemB
    case 'graph': return String(q.answer)
    case 'calculation': return String(q.answer)
    case 'memory': return q.pairs.map(p => `${p.left}↔${p.right}`).join(', ')
    case 'deduction': return q.choices[q.answer]
    case 'dragfill': return q.answers.join(', ')
    case 'related': return q.correctAnswers.join(', ')
    case 'oddone': return q.choices[q.answer]
    case 'complete': return q.answer
    case 'reverse': return q.choices[q.answer]
    default: return ''
  }
}

export function getTypeBadgeText(type: string): string {
  const map: Record<string, string> = {
    choice4: '4択', truefalse: '○×', fillin: '穴埋め', order: '並べ替え',
    matching: 'マッチング', multiselect: '複数選択', association: '連想',
    number: '数値入力', categorize: '分類', speedquiz: '早押し',
    findmistake: '間違い探し', ranking: 'ランキング', fillmulti: '穴埋め複数',
    timeline: 'タイムライン', quotesource: '引用元当て', hashtag: 'タグ当て',
    replyto: 'リプ先当て', followers: 'フォロワー数', crossword: 'クロスワード',
    anagram: 'アナグラム', fillselect: '穴埋め選択', compare: '比較',
    graph: 'グラフ', calculation: '計算', memory: '神経衰弱',
    deduction: '推理', dragfill: 'ドラッグ穴埋め', related: '関連語',
    oddone: '仲間はずれ', complete: '文章完成', reverse: '逆引き'
  }
  return map[type] || type
}
