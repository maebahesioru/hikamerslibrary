import PeriodicTable3D from './PeriodicTable3D'
import Calculator from './Calculator'
import Minesweeper from './Minesweeper'
import TicTacToe from './TicTacToe'
import Breakout from './Breakout'
import KatamariDamacy from './KatamariDamacy'
import InkSplatter from './InkSplatter'
import PrideEffect from './PrideEffect'
import MeteorShower from './MeteorShower'
import CherryBlossoms from './CherryBlossoms'
import AutumnLeaves from './AutumnLeaves'
import SolarEclipse from './SolarEclipse'
import TomatoFestival from './TomatoFestival'
import PawStamps from './PawStamps'
import MinecraftBlocks from './MinecraftBlocks'
import Fireworks from './Fireworks'
import SnakeGame from './SnakeGame'
import LoyKrathong from './LoyKrathong'
import PacmanGame from './PacmanGame'
import PaddingtonToast from './PaddingtonToast'
import WizardOfOz from './WizardOfOz'

interface EasterEggEffectsProps {
  isLoading: boolean
  submittedQuery: string
  showRecursion: boolean
  showPeriodicTable: boolean
  showCalculator: boolean
  calculatorAnswer: string
  showMinesweeper: boolean
  showTicTacToe: boolean
  showBreakout: boolean
  showKatamari: boolean
  setShowKatamari: (show: boolean) => void
  showInkSplatter: 'splatoon' | 'holi' | null
  setShowInkSplatter: (show: 'splatoon' | 'holi' | null) => void
  showPride: boolean
  setShowPride: (show: boolean) => void
  showMeteorShower: boolean
  setShowMeteorShower: (show: boolean) => void
  showCherryBlossoms: boolean
  setShowCherryBlossoms: (show: boolean) => void
  showAutumnLeaves: boolean
  setShowAutumnLeaves: (show: boolean) => void
  showSolarEclipse: boolean
  setShowSolarEclipse: (show: boolean) => void
  showTomatoFestival: boolean
  setShowTomatoFestival: (show: boolean) => void
  showPawStamps: 'dog' | 'cat' | null
  setShowPawStamps: (show: 'dog' | 'cat' | null) => void
  showMinecraftBlocks: boolean
  setShowMinecraftBlocks: (show: boolean) => void
  showFireworks: boolean
  setShowFireworks: (show: boolean) => void
  showMeteors: boolean
  showSnakeGame: boolean
  showLoyKrathong: boolean
  showPacmanGame: boolean
  showPaddingtonToast: boolean
  setShowPaddingtonToast: (show: boolean) => void
  showWizardOfOz: boolean
  setShowWizardOfOz: (show: boolean) => void
}

export default function EasterEggEffects(props: EasterEggEffectsProps) {
  const { isLoading, submittedQuery } = props

  return (
    <>
      {props.showRecursion && !isLoading && (
        <div style={{ 
          padding: '20px', 
          textAlign: 'left',
          fontSize: '16px',
          color: 'var(--text-secondary)'
        }}>
          もしかして: <a 
            href={`/search?q=${encodeURIComponent(submittedQuery)}`}
            style={{ color: 'var(--link-color)', textDecoration: 'none' }}
          >
            {submittedQuery}
          </a>
        </div>
      )}

      {props.showPeriodicTable && !isLoading && <PeriodicTable3D />}
      {props.showCalculator && !isLoading && <Calculator initialValue={props.calculatorAnswer} />}
      {props.showMinesweeper && !isLoading && <Minesweeper />}
      {props.showTicTacToe && !isLoading && <TicTacToe />}
      {props.showBreakout && !isLoading && <Breakout />}
      {props.showKatamari && !isLoading && <KatamariDamacy onClose={() => props.setShowKatamari(false)} />}
      {props.showInkSplatter && !isLoading && <InkSplatter type={props.showInkSplatter} onClose={() => props.setShowInkSplatter(null)} />}
      {props.showPride && !isLoading && <PrideEffect onClose={() => props.setShowPride(false)} />}
      {props.showMeteorShower && <MeteorShower onClose={() => props.setShowMeteorShower(false)} />}
      {props.showCherryBlossoms && !isLoading && <CherryBlossoms onClose={() => props.setShowCherryBlossoms(false)} />}
      {props.showAutumnLeaves && !isLoading && <AutumnLeaves onClose={() => props.setShowAutumnLeaves(false)} />}
      {props.showSolarEclipse && !isLoading && <SolarEclipse onClose={() => props.setShowSolarEclipse(false)} />}
      {props.showTomatoFestival && !isLoading && <TomatoFestival onClose={() => props.setShowTomatoFestival(false)} />}
      {props.showPawStamps && !isLoading && <PawStamps type={props.showPawStamps} onClose={() => props.setShowPawStamps(null)} />}
      {props.showMinecraftBlocks && !isLoading && <MinecraftBlocks onClose={() => props.setShowMinecraftBlocks(false)} />}
      {props.showFireworks && <Fireworks onClose={() => props.setShowFireworks(false)} />}
      {props.showLoyKrathong && <LoyKrathong />}
      {props.showPacmanGame && !isLoading && <PacmanGame />}
      {props.showPaddingtonToast && !isLoading && <PaddingtonToast onClose={() => props.setShowPaddingtonToast(false)} />}
      {props.showWizardOfOz && !isLoading && <WizardOfOz onClose={() => props.setShowWizardOfOz(false)} />}

      {props.showMeteors && (
        <div className="meteors">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="meteor" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${1 + Math.random() * 2}s`
            }}></div>
          ))}
        </div>
      )}
    </>
  )
}
