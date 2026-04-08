'use client'

import styles from './WordleLogo.module.css'

export default function WordleLogo() {
  const letters = [
    { char: 'H', color: 'green' },
    { char: 'i', color: 'yellow' },
    { char: 'k', color: 'gray' },
    { char: 'a', color: 'green' },
    { char: 'm', color: 'yellow' },
    { char: 'e', color: 'green' },
    { char: 'r', color: 'gray' },
    { char: 's', color: 'yellow' }
  ]

  return (
    <div className={styles.wordleLogo}>
      {letters.map((letter, index) => (
        <div key={index} className={`${styles.letter} ${styles[letter.color]}`}>
          {letter.char}
        </div>
      ))}
    </div>
  )
}
