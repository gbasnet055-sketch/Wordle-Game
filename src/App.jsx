import { useState, useEffect } from 'react'
import './App.css'

const solutionWord = 'CRANE'

const keyboardRows = [
  'QWERTYUIOP',
  'ASDFGHJKL',
  'ZXCVBNM'
]

function checkGuess(guess, answer) {
  const result = Array(5).fill('absent')
  const answerLetters = answer.split('')
  const guessLetters = guess.split('')

  // First check letters in the correct position
  guessLetters.forEach((letter, index) => {
    if (letter === answerLetters[index]) {
      result[index] = 'correct'
      answerLetters[index] = null
      guessLetters[index] = null
    }
  })

  // Then check letters in the wrong position
  guessLetters.forEach((letter, index) => {
    if (letter && answerLetters.includes(letter)) {
      result[index] = 'present'
      answerLetters[answerLetters.indexOf(letter)] = null
    }
  })

  return result
}

function App() {
  const [currentGuess, setCurrentGuess] = useState('')
  const [pastGuesses, setPastGuesses] = useState([])
  const [gameStatus, setGameStatus] = useState('IN_PROGRESS')

  function handleKeyPress(key) {
    if (gameStatus !== 'IN_PROGRESS') return

    if (key === 'ENTER') {
      if (currentGuess.length !== 5) return

      const feedback = checkGuess(currentGuess, solutionWord)
      const newGuesses = [
        ...pastGuesses,
        { word: currentGuess, feedback }
      ]

      setPastGuesses(newGuesses)
      setCurrentGuess('')

      if (currentGuess === solutionWord) {
        setGameStatus('WON')
      } else if (newGuesses.length === 6) {
        setGameStatus('LOST')
      }
    } else if (key === 'BACKSPACE') {
      setCurrentGuess(currentGuess.slice(0, -1))
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < 5) {
      setCurrentGuess(currentGuess + key)
    }
  }

  useEffect(() => {
    function handlePhysicalKeyboard(event) {
      if (event.key === 'Enter') {
        handleKeyPress('ENTER')
      } else if (event.key === 'Backspace') {
        handleKeyPress('BACKSPACE')
      } else if (/^[a-zA-Z]$/.test(event.key)) {
        handleKeyPress(event.key.toUpperCase())
      }
    }

    window.addEventListener('keydown', handlePhysicalKeyboard)

    return () => {
      window.removeEventListener('keydown', handlePhysicalKeyboard)
    }
  })

  function getKeyboardStatus(letter) {
    let status = ''

    pastGuesses.forEach((guess) => {
      guess.word.split('').forEach((character, index) => {
        if (character === letter) {
          const feedback = guess.feedback[index]

          if (feedback === 'correct') {
            status = 'correct'
          } else if (feedback === 'present' && status !== 'correct') {
            status = 'present'
          } else if (feedback === 'absent' && status === '') {
            status = 'absent'
          }
        }
      })
    })

    return status
  }

  function restartGame() {
    setCurrentGuess('')
    setPastGuesses([])
    setGameStatus('IN_PROGRESS')
  }

  return (
    <main className="game-container">
      <header className="game-header">
        <h1>WORDLE</h1>
        <p>Guess the hidden 5-letter word!</p>
      </header>

      <section className="game-board">
        {Array.from({ length: 6 }).map((_, rowIndex) => {
          const submittedGuess = pastGuesses[rowIndex]
          const isCurrentRow = rowIndex === pastGuesses.length

          return (
            <div className="board-row" key={rowIndex}>
              {Array.from({ length: 5 }).map((_, tileIndex) => {
                const letter = submittedGuess
                  ? submittedGuess.word[tileIndex]
                  : isCurrentRow
                    ? currentGuess[tileIndex] || ''
                    : ''

                const tileStatus = submittedGuess
                  ? submittedGuess.feedback[tileIndex]
                  : ''

                return (
                  <div
                    className={`tile ${tileStatus}`}
                    key={tileIndex}
                  >
                    {letter}
                  </div>
                )
              })}
            </div>
          )
        })}
      </section>

      <section className="keyboard">
        {keyboardRows.map((row, index) => (
          <div className="keyboard-row" key={index}>
            {index === 2 && (
              <button
                className="special-key"
                onClick={() => handleKeyPress('ENTER')}
              >
                ENTER
              </button>
            )}

            {row.split('').map((letter) => (
              <button
                key={letter}
                className={`key ${getKeyboardStatus(letter)}`}
                onClick={() => handleKeyPress(letter)}
              >
                {letter}
              </button>
            ))}

            {index === 2 && (
              <button
                className="special-key"
                onClick={() => handleKeyPress('BACKSPACE')}
              >
                ⌫
              </button>
            )}
          </div>
        ))}
      </section>

      {gameStatus !== 'IN_PROGRESS' && (
        <div className="result-message">
          <h2>
            {gameStatus === 'WON' ? 'Congratulations!' : 'Game Over!'}
          </h2>
          <p>
            {gameStatus === 'WON'
              ? 'You guessed the correct word!'
              : `The correct word was ${solutionWord}.`}
          </p>
          <button onClick={restartGame}>Play Again</button>
        </div>
      )}
    </main>
  )
}

export default App