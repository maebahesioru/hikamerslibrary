import type { Question, AnswerState } from '../types'

export function checkAnswer(q: Question, ans: AnswerState): boolean {
  switch (q.type) {
    case 'choice4':
      return ans.selectedChoice === q.answer
    case 'truefalse':
      return ans.selectedTF === q.answer
    case 'fillin': {
      const userAns = ans.fillInAnswer.trim().toLowerCase()
      const correctAns = q.answer.toLowerCase()
      const alts = q.alternatives.map(a => a.toLowerCase())
      return userAns === correctAns || alts.includes(userAns)
    }
    case 'order':
      return JSON.stringify(ans.orderAnswer) === JSON.stringify(q.correctOrder)
    case 'matching':
      return JSON.stringify(ans.matchingAnswer) === JSON.stringify(q.correctMatches)
    case 'multiselect': {
      const sorted = [...ans.multiSelectAnswer].sort((a, b) => a - b)
      return JSON.stringify(sorted) === JSON.stringify(q.correctAnswers)
    }
    case 'association': {
      const userAns = ans.associationAnswer.trim().toLowerCase()
      const correctAns = q.answer.toLowerCase()
      return userAns === correctAns || correctAns.includes(userAns) || userAns.includes(correctAns)
    }
    case 'number': {
      const userNum = parseInt(ans.numberAnswer)
      return !isNaN(userNum) && Math.abs(userNum - q.answer) <= q.tolerance
    }
    case 'categorize':
      return ans.categorizeAnswer.every((a, idx) => a === q.correctCategories[idx])
    case 'speedquiz': {
      const userAns = ans.speedQuizAnswer.trim().toLowerCase()
      const correctAns = q.answer.toLowerCase()
      return userAns === correctAns || correctAns.includes(userAns) || userAns.includes(correctAns)
    }
    case 'findmistake':
      return ans.mistakeAnswer.trim().toLowerCase() === q.wrongPart.toLowerCase()
    case 'ranking':
      return JSON.stringify(ans.rankingAnswer) === JSON.stringify(q.correctOrder)
    case 'fillmulti':
      return ans.fillMultiAnswers.every((a, idx) => a.trim().toLowerCase() === q.answers[idx]?.toLowerCase())
    case 'timeline': {
      const userDate = ans.timelineAnswer.trim()
      const correctDate = q.answer
      if (!userDate || !correctDate) return false
      const [uy, um] = userDate.split('-').map(Number)
      const [cy, cm] = correctDate.split('-').map(Number)
      return Math.abs((uy * 12 + um) - (cy * 12 + cm)) <= q.tolerance
    }
    case 'quotesource':
    case 'hashtag':
    case 'replyto':
    case 'fillselect':
      return ans.selectedChoice === q.answer
    case 'followers': {
      const userNum = parseInt(ans.numberAnswer)
      return !isNaN(userNum) && Math.abs(userNum - q.answer) <= q.tolerance
    }
    case 'crossword':
      return ans.crosswordAnswer1.trim().toLowerCase() === q.answer1.toLowerCase() &&
             ans.crosswordAnswer2.trim().toLowerCase() === q.answer2.toLowerCase()
    case 'anagram':
      return ans.anagramAnswer.trim().toLowerCase() === q.answer.toLowerCase()
    case 'compare':
      return ans.compareAnswer === q.answer
    case 'graph': {
      const userNum = parseInt(ans.graphAnswer)
      return !isNaN(userNum) && Math.abs(userNum - q.answer) <= q.tolerance
    }
    case 'calculation': {
      const userNum = parseInt(ans.calculationAnswer)
      return !isNaN(userNum) && Math.abs(userNum - q.answer) <= q.tolerance
    }
    case 'memory':
      return ans.memoryMatched.length === q.pairs.length * 2
    case 'deduction':
      return ans.selectedChoice === q.answer
    case 'dragfill':
      return ans.dragFillAnswers.every((a, idx) => a === q.answers[idx])
    case 'related': {
      const sortedUser = [...ans.relatedAnswer].sort()
      const sortedCorrect = [...q.correctAnswers].sort()
      return JSON.stringify(sortedUser) === JSON.stringify(sortedCorrect)
    }
    case 'oddone':
      return ans.selectedChoice === q.answer
    case 'complete': {
      const userAns = ans.completeAnswer.trim().toLowerCase()
      const correctAns = q.answer.toLowerCase()
      const alts = q.alternatives.map(a => a.toLowerCase())
      return userAns === correctAns || alts.includes(userAns)
    }
    case 'reverse':
      return ans.selectedChoice === q.answer
    default:
      return false
  }
}

export function isAnswerComplete(q: Question, ans: AnswerState): boolean {
  switch (q.type) {
    case 'choice4': return ans.selectedChoice !== null
    case 'truefalse': return ans.selectedTF !== null
    case 'fillin': return !!ans.fillInAnswer.trim()
    case 'order': return ans.orderAnswer.length === q.items.length
    case 'matching': return ans.matchingAnswer.length === q.lefts.length
    case 'multiselect': return ans.multiSelectAnswer.length > 0
    case 'association': return !!ans.associationAnswer.trim()
    case 'number': return !!ans.numberAnswer.trim()
    case 'categorize': return ans.categorizeAnswer.filter(Boolean).length === q.items.length
    case 'speedquiz': return !!ans.speedQuizAnswer.trim()
    case 'findmistake': return !!ans.mistakeAnswer.trim()
    case 'ranking': return ans.rankingAnswer.length === q.items.length
    case 'fillmulti': return ans.fillMultiAnswers.filter(a => a?.trim()).length === q.answers.length
    case 'timeline': return !!ans.timelineAnswer.trim()
    case 'quotesource':
    case 'hashtag':
    case 'replyto':
    case 'fillselect': return ans.selectedChoice !== null
    case 'followers': return !!ans.numberAnswer.trim()
    case 'crossword': return !!ans.crosswordAnswer1.trim() && !!ans.crosswordAnswer2.trim()
    case 'anagram': return !!ans.anagramAnswer.trim()
    case 'compare': return ans.compareAnswer !== null
    case 'graph': return !!ans.graphAnswer.trim()
    case 'calculation': return !!ans.calculationAnswer.trim()
    case 'memory': return ans.memoryMatched.length === q.pairs.length * 2
    case 'deduction': return ans.selectedChoice !== null
    case 'dragfill': return ans.dragFillAnswers.filter(Boolean).length === q.answers.length
    case 'related': return ans.relatedAnswer.length > 0
    case 'oddone': return ans.selectedChoice !== null
    case 'complete': return !!ans.completeAnswer.trim()
    case 'reverse': return ans.selectedChoice !== null
    default: return false
  }
}
