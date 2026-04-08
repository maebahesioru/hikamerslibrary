import { useState, useEffect } from 'react'

export function useEasterEggs(query: string) {
  const [isBarrelRolling, setIsBarrelRolling] = useState(false)
  const [showPeriodicTable, setShowPeriodicTable] = useState(false)
  const [isTilted, setIsTilted] = useState(false)
  const [showCalculator, setShowCalculator] = useState(false)
  const [calculatorAnswer, setCalculatorAnswer] = useState('')
  const [showRecursion, setShowRecursion] = useState(false)
  const [showMeteors, setShowMeteors] = useState(false)
  const [showMinesweeper, setShowMinesweeper] = useState(false)
  const [showTicTacToe, setShowTicTacToe] = useState(false)
  const [showBreakout, setShowBreakout] = useState(false)
  const [showKatamari, setShowKatamari] = useState(false)
  const [showInkSplatter, setShowInkSplatter] = useState<'splatoon' | 'holi' | null>(null)
  const [showPride, setShowPride] = useState(false)
  const [showMeteorShower, setShowMeteorShower] = useState(false)
  const [showCherryBlossoms, setShowCherryBlossoms] = useState(false)
  const [showAutumnLeaves, setShowAutumnLeaves] = useState(false)
  const [showSolarEclipse, setShowSolarEclipse] = useState(false)
  const [showTomatoFestival, setShowTomatoFestival] = useState(false)
  const [showPawStamps, setShowPawStamps] = useState<'dog' | 'cat' | null>(null)
  const [showMinecraftBlocks, setShowMinecraftBlocks] = useState(false)
  const [showFireworks, setShowFireworks] = useState(false)
  const [showSnakeGame, setShowSnakeGame] = useState(false)
  const [showWordleLogo, setShowWordleLogo] = useState(false)
  const [showLoyKrathong, setShowLoyKrathong] = useState(false)
  const [showPacmanGame, setShowPacmanGame] = useState(false)
  const [showPaddingtonToast, setShowPaddingtonToast] = useState(false)
  const [showWizardOfOz, setShowWizardOfOz] = useState(false)

  useEffect(() => {
    const q = query.toLowerCase().trim()
    
    // 一回転
    const barrelRollTriggers = ['一回転', 'do a barrel roll', 'z or r twice']
    if (barrelRollTriggers.includes(q)) {
      setIsBarrelRolling(true)
      setTimeout(() => setIsBarrelRolling(false), 1000)
    }

    // 元素周期表
    const periodicTableTriggers = ['元素周期表', 'periodic table', '周期表']
    setShowPeriodicTable(periodicTableTriggers.includes(q))

    // 傾き
    const tiltTriggers = ['斜め', 'askew']
    setIsTilted(tiltTriggers.includes(q))

    // 電卓
    if (q === '人生、宇宙、すべての答え' || q === 'the answer to life the universe and everything') {
      setShowCalculator(true)
      setCalculatorAnswer('42')
    } else if (q === '電卓' || q === 'calculator') {
      setShowCalculator(true)
      setCalculatorAnswer('')
    } else if (q === 'the number of horns on a unicorn') {
      setShowCalculator(true)
      setCalculatorAnswer('1')
    } else {
      setShowCalculator(false)
      setCalculatorAnswer('')
    }

    // 再帰
    const recursionTriggers = ['再帰', 'recursion']
    setShowRecursion(recursionTriggers.includes(q))

    // 隕石
    const meteorTriggers = ['隕石', 'meteor']
    if (meteorTriggers.includes(q)) {
      setShowMeteors(true)
      setTimeout(() => setShowMeteors(false), 5000)
    }

    // ゲーム
    const minesweeperTriggers = ['マインスイーパ', 'minesweeper']
    setShowMinesweeper(minesweeperTriggers.includes(q))

    const ticTacToeTriggers = ['三目並べ', 'tic tac toe', 'tik tak toe']
    setShowTicTacToe(ticTacToeTriggers.includes(q))

    const breakoutTriggers = ['ブロック崩し', 'atari breakout', 'breakout']
    setShowBreakout(breakoutTriggers.includes(q))

    // 塊魂
    const katamariTriggers = ['塊魂', 'katamari damacy', 'katamari']
    setShowKatamari(katamariTriggers.includes(q))

    // スプラトゥーン / ホーリー祭
    const splatoonTriggers = ['スプラトゥーン', 'splatoon']
    if (splatoonTriggers.includes(q)) {
      setShowInkSplatter('splatoon')
    } else {
      const holiTriggers = ['ホーリー祭り', 'ホーリー祭', 'holi']
      if (holiTriggers.includes(q)) {
        setShowInkSplatter('holi')
      } else {
        setShowInkSplatter(null)
      }
    }

    // PRIDE
    const prideTriggers = ['pride', 'プライド']
    setShowPride(prideTriggers.includes(q))

    // 流星群
    const meteorShowerTriggers = ['流星群', 'meteor shower', 'shooting stars']
    if (meteorShowerTriggers.includes(q)) {
      setShowMeteorShower(true)
      setTimeout(() => setShowMeteorShower(false), 10000)
    }

    // 桜
    const cherryTriggers = ['桜', 'cherry blossoms', 'sakura']
    setShowCherryBlossoms(cherryTriggers.includes(q))

    // 秋
    const autumnTriggers = ['秋', 'autumn', 'fall']
    setShowAutumnLeaves(autumnTriggers.includes(q))

    // 日食
    const eclipseTriggers = ['日食', 'solar eclipse', 'eclipse']
    setShowSolarEclipse(eclipseTriggers.includes(q))

    // トマト祭り
    const tomatoTriggers = ['トマト祭り', 'トマティーナ', 'tomatina', 'la tomatina']
    setShowTomatoFestival(tomatoTriggers.includes(q))

    // 犬・猫
    const dogTriggers = ['犬', 'dog', 'いぬ']
    const catTriggers = ['猫', 'cat', 'ねこ']
    if (dogTriggers.includes(q)) {
      setShowPawStamps('dog')
    } else if (catTriggers.includes(q)) {
      setShowPawStamps('cat')
    } else {
      setShowPawStamps(null)
    }

    // マインクラフト
    const minecraftTriggers = ['マインクラフト', 'minecraft']
    setShowMinecraftBlocks(minecraftTriggers.includes(q))

    // 花火
    const fireworksTriggers = ['metalist']
    if (fireworksTriggers.includes(q)) {
      setShowFireworks(true)
      setTimeout(() => setShowFireworks(false), 15000)
    }

    // ヘビゲーム
    const snakeTriggers = ['ヘビゲーム', 'snake game', 'snake']
    setShowSnakeGame(snakeTriggers.includes(q))

    // Wordle
    const wordleTriggers = ['wordle']
    setShowWordleLogo(wordleTriggers.includes(q))

    // ロイクラトン
    const loyKrathongTriggers = ['ロイクラトン', 'ローイクラトン', 'loy krathong']
    setShowLoyKrathong(loyKrathongTriggers.includes(q))

    // パックマン
    const pacmanTriggers = ['google pacman', 'pacman', 'パックマン']
    setShowPacmanGame(pacmanTriggers.includes(q))

    // パディントン
    const paddingtonTriggers = ['パディントン', 'paddington']
    setShowPaddingtonToast(paddingtonTriggers.includes(q))

    // オズの魔法使い
    const wizardOfOzTriggers = ['the wizard of oz', 'オズの魔法使', 'オズの魔法使い']
    setShowWizardOfOz(wizardOfOzTriggers.includes(q))
  }, [query])

  return {
    isBarrelRolling,
    showPeriodicTable,
    isTilted,
    showCalculator,
    calculatorAnswer,
    showRecursion,
    showMeteors,
    showMinesweeper,
    showTicTacToe,
    showBreakout,
    showKatamari,
    setShowKatamari,
    showInkSplatter,
    setShowInkSplatter,
    showPride,
    setShowPride,
    showMeteorShower,
    setShowMeteorShower,
    showCherryBlossoms,
    setShowCherryBlossoms,
    showAutumnLeaves,
    setShowAutumnLeaves,
    showSolarEclipse,
    setShowSolarEclipse,
    showTomatoFestival,
    setShowTomatoFestival,
    showPawStamps,
    setShowPawStamps,
    showMinecraftBlocks,
    setShowMinecraftBlocks,
    showFireworks,
    setShowFireworks,
    showSnakeGame,
    showWordleLogo,
    showLoyKrathong,
    showPacmanGame,
    showPaddingtonToast,
    setShowPaddingtonToast,
    showWizardOfOz,
    setShowWizardOfOz,
  }
}
