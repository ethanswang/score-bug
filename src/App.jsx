import { useEffect, useState, useRef} from 'react'
import './App.css'

function App() {
  const [games, setGames] = useState([])
  const [selectedGameId, setSelectedGameId] = useState(null)
  const hasSelected = useRef(false)
  const [plays, setPlays] = useState([])
  const [showPlays, setShowPlays] = useState(true)

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
  <div className="sb">
    <div className="titlebar">
      <div className="drag-handle">⠿</div>
      <div className="tabs">
        {games.map(game => (
          <button
            key={game.id}
            className={`tab ${game.id === selectedGameId ? 'active' : ''}`}
            onClick={() => setSelectedGameId(game.id)}
          >
            {game.shortName}
          </button>
        ))}
      </div>
      <button className={`toggle-btn ${showPlays ? '' : 'flipped'}`} onClick={() => {
        if (showPlays) {
          setShowPlays(false)
          setTimeout(() => window.electronAPI?.resizeWindow(72), 180)
        } else {
          window.electronAPI?.resizeWindow(110)
          setShowPlays(true)
        }
      }}>▾</button>
      <button className="close-btn" onClick={() => window.electronAPI.closeWindow()}>✕</button>
    </div>

    {selectedGame && (() => {
      const competition = selectedGame.competitions[0]
      const home = competition.competitors.find(c => c.homeAway === 'home')
      const away = competition.competitors.find(c => c.homeAway === 'away')
      const status = competition.status.type.description
      const isLive = status === 'In Progress'
      const isFinal = status === 'Final'
      const formatTime = (dateStr) => {
        const date = new Date(dateStr)
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
      }

      return (
        <>
          <div className="scoreboard">
            <div className="teams">
              <div className="team">
                <div className="team-logo">
                  <img src={`https://a.espncdn.com/i/teamlogos/nba/500/${away.team.abbreviation.toLowerCase()}.png`} alt={away.team.name} />
                </div>
                <div className="team-info">
                  <span className="team-name">{away.team.abbreviation}</span>
                </div>
              </div>
              <div className="scores">
                <span className={`team-score ${home.winner ? 'dim' : ''}`}>{away.score}</span>
                <div className="status-center">
                  <span className={isLive ? 'status-live' : isFinal ? 'status-final' : 'status-scheduled'}>
                    {isLive ? `Q${competition.status.period} ${competition.status.displayClock}`
                    : isFinal ? 'Final'
                    : formatTime(competition.date)}
                  </span>
                </div>
                <span className={`team-score ${away.winner ? 'dim' : ''}`}>{home.score}</span>
              </div>
              <div className="team team-right">
                <div className="team-logo">
                  <img src={`https://a.espncdn.com/i/teamlogos/nba/500/${home.team.abbreviation.toLowerCase()}.png`} alt={home.team.name} />
                </div>
                <div className="team-info">
                  <span className="team-name">{home.team.abbreviation}</span>
                </div>
              </div>
            </div>
          </div>

          <div className={`plays ${showPlays ? 'open' : ''}`}>
            {plays.slice().reverse().slice(0, 1).map((play, index) => (
              <div key={index} className="play">
                <span className="play-time">{play.clock?.displayValue} Q{play.period?.number}</span>
                <span className="play-text">{play.text}</span>
              </div>
            ))}
          </div>
        </>
      )
    })()}
  </div>
)
}

export default App