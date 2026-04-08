import styles from '../hikamer-dx.module.css'

export function ScoreDetails() {
  return (
    <details className={styles.scoreDetails}>
      <summary>📊 総合スコアの計算方法</summary>
      <div className={styles.scoreSection}>
        <h3>🏆 総合スコアとは</h3>
        <p>全ユーザー中の順位（パーセンタイル）と追加指標を組み合わせた総合評価です。単純な数値の大小ではなく、相対的な順位で評価するため公平です。</p>
      </div>
      <div className={styles.scoreGrid}>
        <div className={styles.scoreCategory}>
          <h4>📊 パーセンタイル評価</h4>
          <p>各指標で全ユーザー中何位かを0-100で評価</p>
          <ul>
            <li>💬 リプ獲得 ×2.0</li>
            <li>🔄 引用獲得 ×1.8</li>
            <li>🔁 RT ×1.5</li>
            <li>🔖 ブクマ ×1.2</li>
            <li>❤️ いいね ×1.0</li>
            <li>💬 引用送信 ×1.2</li>
            <li>↩️ リプ送信 ×1.0</li>
            <li>📝 ツイート数 ×0.8</li>
          </ul>
        </div>
        <div className={styles.scoreCategory}>
          <h4>📈 質の指標</h4>
          <p>量より質を重視した追加評価</p>
          <ul>
            <li>🔥 エンゲージ率 - 反応÷閲覧×100</li>
            <li>🚀 バイラル係数 - RT÷いいね</li>
            <li>💪 返報率 - リプ獲得÷送信</li>
            <li>📷 メディア品質 - 反応/投稿数</li>
          </ul>
        </div>
        <div className={styles.scoreCategory}>
          <h4>🌟 活動評価</h4>
          <p>継続的な活動を評価</p>
          <ul>
            <li>📅 継続性 - 活動月数</li>
            <li>✨ オリジナリティ - 通常ツイート率</li>
            <li>🎨 多様性 - 話題の幅</li>
            <li>📈 成長率 - フォロワー増加</li>
          </ul>
        </div>
        <div className={styles.scoreCategory}>
          <h4>⏰ 時間補正</h4>
          <p>最近の活動を重視</p>
          <ul>
            <li>直近30日のいいね・RTは2倍で計算</li>
            <li>古いツイートより最近の活動を評価</li>
          </ul>
        </div>
      </div>
    </details>
  )
}

export function RankingDetails() {
  return (
    <details className={styles.scoreDetails}>
      <summary>📋 各ランキング項目の説明</summary>
      <div className={styles.scoreGrid}>
        <div className={styles.scoreCategory}>
          <h4>📊 基本</h4>
          <ul>
            <li>🏆 総合スコア - 上記の計算式</li>
            <li>❤️ いいね獲得 - 合計いいね数</li>
            <li>🔁 RT獲得 - 合計RT数</li>
            <li>👁️ 閲覧数 - 合計インプレッション</li>
            <li>📝 ツイート数 - DB内の投稿数</li>
          </ul>
        </div>
        <div className={styles.scoreCategory}>
          <h4>🎯 獲得</h4>
          <ul>
            <li>💬 リプ獲得 - もらったリプ数</li>
            <li>🔄 引用獲得 - 引用された数</li>
            <li>🔖 ブクマ獲得 - ブックマーク数</li>
          </ul>
        </div>
        <div className={styles.scoreCategory}>
          <h4>📤 投稿</h4>
          <ul>
            <li>📷 メディア投稿 - 画像/動画付き</li>
            <li>🎬 動画投稿 - 動画の数</li>
            <li>🖼️ 写真投稿 - 画像の数</li>
            <li>📣 メンション使用 - @の数</li>
            <li>#️⃣ ハッシュタグ使用</li>
            <li>🔗 URL投稿 - リンクの数</li>
          </ul>
        </div>
        <div className={styles.scoreCategory}>
          <h4>💬 送信</h4>
          <ul>
            <li>↩️ リプ送信 - 送ったリプ数</li>
            <li>💬 引用送信 - 引用ツイート数</li>
          </ul>
        </div>
        <div className={styles.scoreCategory}>
          <h4>👤 ユーザー</h4>
          <ul>
            <li>👥 フォロワー数 - 最大値</li>
            <li>➡️ フォロー数 - 最大値</li>
            <li>📊 総ツイート数 - 全期間</li>
            <li>🕰️ 古参度 - アカウント作成日順</li>
          </ul>
        </div>
        <div className={styles.scoreCategory}>
          <h4>📈 平均</h4>
          <ul>
            <li>📈 平均いいね - 1ツイートあたり</li>
            <li>📈 平均RT - 1ツイートあたり</li>
            <li>📈 平均閲覧 - 1ツイートあたり</li>
            <li>🔥 エンゲージ率 - 反応÷閲覧×100</li>
          </ul>
        </div>
      </div>
    </details>
  )
}
