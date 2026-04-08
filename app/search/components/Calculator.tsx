'use client'

import { useState } from 'react'
import styles from './Calculator.module.css'

interface CalculatorProps {
  initialValue?: string
}

export default function Calculator({ initialValue = '' }: CalculatorProps) {
  const [display, setDisplay] = useState(initialValue || '0')
  const [equation, setEquation] = useState('')

  const handleNumber = (num: string) => {
    if (display === '0' || display === initialValue) {
      setDisplay(num)
    } else {
      setDisplay(display + num)
    }
  }

  const handleOperator = (op: string) => {
    setEquation(display + ' ' + op)
    setDisplay('0')
  }

  const handleEquals = () => {
    try {
      const result = eval(equation + ' ' + display)
      setDisplay(String(result))
      setEquation('')
    } catch {
      setDisplay('Error')
    }
  }

  const handleClear = () => {
    setDisplay('0')
    setEquation('')
  }

  return (
    <div className={styles.calculator}>
      <div className={styles.display}>
        {equation && <div className={styles.equation}>{equation}</div>}
        <div className={styles.result}>{display}</div>
      </div>
      <div className={styles.buttons}>
        <button onClick={handleClear} className={styles.btnFunction}>C</button>
        <button onClick={() => handleOperator('/')} className={styles.btnOperator}>÷</button>
        <button onClick={() => handleOperator('*')} className={styles.btnOperator}>×</button>
        <button onClick={() => handleOperator('-')} className={styles.btnOperator}>−</button>
        
        <button onClick={() => handleNumber('7')} className={styles.btnNumber}>7</button>
        <button onClick={() => handleNumber('8')} className={styles.btnNumber}>8</button>
        <button onClick={() => handleNumber('9')} className={styles.btnNumber}>9</button>
        <button onClick={() => handleOperator('+')} className={styles.btnOperator}>+</button>
        
        <button onClick={() => handleNumber('4')} className={styles.btnNumber}>4</button>
        <button onClick={() => handleNumber('5')} className={styles.btnNumber}>5</button>
        <button onClick={() => handleNumber('6')} className={styles.btnNumber}>6</button>
        <button onClick={handleEquals} className={`${styles.btnOperator} ${styles.btnEquals}`}>=</button>
        
        <button onClick={() => handleNumber('1')} className={styles.btnNumber}>1</button>
        <button onClick={() => handleNumber('2')} className={styles.btnNumber}>2</button>
        <button onClick={() => handleNumber('3')} className={styles.btnNumber}>3</button>
        <button onClick={() => handleNumber('0')} className={`${styles.btnNumber} ${styles.btnZero}`}>0</button>
        <button onClick={() => handleNumber('.')} className={styles.btnNumber}>.</button>
      </div>
    </div>
  )
}
