import styles from '../quiz.module.css'
import type { Question } from '../types'
import { getCorrectAnswerText } from '../utils/getCorrectAnswerText'
import { getSiteUrl } from '@/lib/site-url'

interface Props {
  questions: Question[]
  score: number
  onRetry: () => void
  onReset: () => void
}

export function QuizResult({ questions, score, onRetry, onReset }: Props) {
  const percentage = (score / questions.length) * 100

  const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

  const getScoreEmoji = () => {
    if (percentage === 100) return pick(['🏆', '👑', '🥇', '💎', '⭐'])
    if (percentage >= 80) return pick(['🎉', '🔥', '✨', '💪', '🌟'])
    if (percentage >= 60) return pick(['😊', '👍', '🙌', '💫', '🎯'])
    if (percentage >= 40) return pick(['🤔', '😤', '💭', '📚', '🔍'])
    return pick(['😅', '🌱', '🐣', '📖', '🎮'])
  }

  const getScoreMessage = () => {
    if (percentage === 100) return pick([
      '完璧！あなたは真のヒカマニマスター！',
      '全問正解！界隈の生き字引ですね！',
      'パーフェクト！ヒカマニ博士認定！',
      '満点！あなたの知識は本物だ！',
      '完全制覇！界隈の歴史を知り尽くしてる！',
      '神！ヒカマニ界隈の守護者！',
      '伝説級！あなたこそ真のヒカマー！'
    ])
    if (percentage >= 80) return pick([
      'すごい！かなりの界隈通ですね！',
      '素晴らしい！ベテランヒカマーの実力！',
      'お見事！界隈愛が伝わってきます！',
      '流石！ヒカマニ知識が豊富！',
      '優秀！あと少しで完璧！',
      'いい線いってる！界隈マスターまであと一歩！',
      '惜しい！でも十分すごい！'
    ])
    if (percentage >= 60) return pick([
      'なかなか！もっと界隈を知ろう！',
      '良い感じ！まだまだ伸びしろあり！',
      '悪くない！界隈の深みにハマろう！',
      '順調！ヒカマニ道を歩んでいる！',
      'いいぞ！この調子で界隈を探求しよう！',
      '及第点！さらなる高みを目指せ！',
      'まずまず！界隈の奥深さを感じて！'
    ])
    if (percentage >= 40) return pick([
      'まだまだ！界隈の歴史を学ぼう！',
      '発展途上！伸びしろしかない！',
      'これから！界隈沼へようこそ！',
      '修行中！ヒカマニ道は長い！',
      '成長中！もっとツイートを見よう！',
      '挑戦者！界隈の扉を開けたばかり！',
      '見習い！先輩ヒカマーに学ぼう！'
    ])
    return pick([
      '頑張って！ヒカマニ界隈へようこそ！',
      'ドンマイ！これから界隈を知ろう！',
      '新人さん！界隈は奥が深いぞ！',
      'スタート地点！ここから始まる！',
      '初心者歓迎！一緒に界隈を楽しもう！',
      'まずは界隈に浸かろう！',
      '大丈夫！みんな最初はこうだった！',
      'ヒカマニ界隈デビューおめでとう！'
    ])
  }

  const handleShare = (platform: 'twitter' | 'bluesky') => {
    const url = `${getSiteUrl()}/hikamer-dx/quiz`
    const text = `ヒカマニ界隈クイズで ${score}/${questions.length} 問正解しました！ ${getScoreEmoji()}\n#ヒカマニ #HikamersSearch\n${url}`
    
    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
    } else {
      window.open(`https://bsky.app/intent/compose?text=${encodeURIComponent(text)}`, '_blank')
    }
  }

  return (
    <div className={styles.result}>
      <div className={styles.resultEmoji}>{getScoreEmoji()}</div>
      <h2>クイズ終了！</h2>
      <div className={styles.finalScore}>
        <span className={styles.scoreNumber}>{score}</span>
        <span className={styles.scoreDivider}>/</span>
        <span className={styles.scoreTotal}>{questions.length}</span>
      </div>
      <p className={styles.scoreMessage}>{getScoreMessage()}</p>
      
      <div className={styles.resultActions}>
        <button type="button" className={styles.retryBtn} onClick={onRetry}>🔄 同じ設定で再挑戦</button>
        <button type="button" className={styles.newBtn} onClick={onReset}>⚙️ 設定を変えて挑戦</button>
        <button type="button" className={styles.shareBtn} onClick={() => handleShare('twitter')}>𝕏 シェア</button>
        <button type="button" className={styles.shareBskyBtn} onClick={() => handleShare('bluesky')}>🦋 Bluesky</button>
      </div>

      <div className={styles.reviewSection}>
        <h3>📋 問題の振り返り</h3>
        {questions.map((q, idx) => (
          <div key={idx} className={styles.reviewItem}>
            <div className={styles.reviewHeader}>
              <span className={styles.reviewNumber}>Q{idx + 1}</span>
              <span className={styles.reviewQuestion}>{q.question}</span>
            </div>
            <div className={styles.reviewAnswer}>正解: {getCorrectAnswerText(q)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
