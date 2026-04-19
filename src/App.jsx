import { useEffect, useState, useRef} from 'react'

function App() {
  const [games, setGames] = useState([])
  const [selectedGameId, setSelectedGameId] = useState(null)
  const hasSelected = useRef(false)
  const [plays, setPlays] = useState([])

  useEffect(() => {
    const fetchScores = () => {
      fetch ('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard')
        .then(response => response.json())
        .then(data => {
          setGames(data.events)
          if (!hasSelected.current && data.events.length > 0) {
            setSelectedGameId(data.events[0].id)
            hasSelected.current = true
          }
        })
    }
    fetchScores()
    const interval = setInterval(fetchScores, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!selectedGameId) return

    const fetchPlays = () => {
      fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${selectedGameId}`)
        .then(res => res.json())
        .then(data => {
          console.log('summary data:', data)
          setPlays(data.plays || [])
        })
    }

    fetchPlays()
    const interval = setInterval(fetchPlays, 10000)
    return () => clearInterval(interval)
  }, [selectedGameId])

  const selectedGame = games.find(game => game.id === selectedGameId)

  return (
    <div>
      {/* Tabs */}
      <div>
        {games.map(game => (
          <button key={game.id} onClick={() => setSelectedGameId(game.id)}>
            {game.shortName}
          </button>
        ))}
      </div>

      {/* Selected Game Score */}
      {selectedGame && (() => {
        const competition = selectedGame.competitions[0]
        const home = competition.competitors.find(c => c.homeAway === 'home')
        const away = competition.competitors.find(c => c.homeAway === 'away')
        return (
          <div>
            <p>{competition.status.type.description}</p>
            <p>{away.team.location} {away.score} @ {home.team.location} {home.score}</p>
          </div>
        )
      })()}

      {/* Play by Play */}
      <div>
        {plays.slice().reverse().slice(0, 1).map((play, index) => (
          <div key={index}>
            <p>{play.clock?.displayValue} - {play.period?.number}Q | {play.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App