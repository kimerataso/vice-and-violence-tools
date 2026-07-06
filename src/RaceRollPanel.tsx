import { useState } from 'react'
import racesData from './data/races.json'

type RaceData = {
  name: string
  stats: Record<string, number>
  subraces?: { name: string; roll: number; stats: Record<string, number>; description: string }[]
  statChoice?: { type: 'simple'; amount: number } | { type: 'paired'; bonus: number; penalty: number }
  traits: string[]
}

type RaceSelection = {
  raceName: string
  race: string
  subrace?: string
  raceStats: Record<string, number>
  traits: [string, string]
  statChoiceTarget?: string
  statChoicePenaltyTarget?: string
}

interface RaceRollPanelProps {
  currentRaceName: string
  currentSubrace?: string
  currentTraits?: [string, string]
  currentStatChoiceTarget?: string
  currentStatChoicePenaltyTarget?: string
  onConfirm: (selection: RaceSelection) => void
  onClose?: () => void
}

const racesDataList = (racesData as any).races as RaceData[]
const statKeys = ['SM', 'BR', 'MX', 'HT'] as const
const statNames: Record<string, string> = { SM: 'Smarts', BR: 'Brawn', MX: 'Moxie', HT: 'Hotness' }
const traitCount = 2

const getRandomItem = <T,>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)]

function rollTraits(data: RaceData): [string, string] {
  const rolls = Array.from({ length: traitCount }, () => Math.floor(Math.random() * data.traits.length))
  return [data.traits[rolls[0]] ?? '', data.traits[rolls[1]] ?? '']
}

function computeRaceStats(
  raceData: RaceData,
  subrace?: string,
  statTarget?: string,
  penaltyTarget?: string
): Record<string, number> {
  if (raceData.subraces) {
    const picked = raceData.subraces.find((s) => s.name === subrace) ?? raceData.subraces[0]
    return { ...picked.stats }
  }
  if (raceData.statChoice) {
    if (raceData.statChoice.type === 'simple') {
      const stats: Record<string, number> = { SM: 0, BR: 0, MX: 0, HT: 0 }
      stats[statTarget ?? 'SM'] = raceData.statChoice.amount
      return stats
    }
    if (raceData.statChoice.type === 'paired') {
      const stats: Record<string, number> = { SM: 0, BR: 0, MX: 0, HT: 0 }
      stats[statTarget ?? 'SM'] = raceData.statChoice.bonus
      stats[penaltyTarget ?? 'BR'] = raceData.statChoice.penalty
      return stats
    }
  }
  return { ...raceData.stats }
}

export function RaceRollPanel({
  currentRaceName,
  currentSubrace,
  currentTraits,
  currentStatChoiceTarget,
  currentStatChoicePenaltyTarget,
  onConfirm,
  onClose,
}: RaceRollPanelProps) {
  const [mode, setMode] = useState<'choose' | 'roll'>('choose')
  const [raceName, setRaceName] = useState(currentRaceName)
  const [subrace, setSubrace] = useState(currentSubrace ?? '')
  const [statTarget, setStatTarget] = useState(currentStatChoiceTarget ?? 'SM')
  const [penaltyTarget, setPenaltyTarget] = useState(currentStatChoicePenaltyTarget ?? 'BR')
  const [traits, setTraits] = useState<[string, string]>(currentTraits ?? ['', ''])
  const [traitRolls, setTraitRolls] = useState<[number | null, number | null]>([null, null])
  const [rollResult, setRollResult] = useState<number | null>(null)

  const raceData = racesDataList.find((r) => r.name === raceName)
  const stats = raceData ? computeRaceStats(raceData, subrace, statTarget, penaltyTarget) : { SM: 0, BR: 0, MX: 0, HT: 0 }
  const displayName = raceData?.subraces ? `${raceData.name} (${subrace})` : raceData?.name ?? ''

  const handleRaceChange = (name: string) => {
    setRaceName(name)
    const data = racesDataList.find((r) => r.name === name)
    if (!data) return

    if (data.subraces) {
      setSubrace(data.subraces[0].name)
    }
    if (data.statChoice) {
      if (data.statChoice.type === 'simple') {
        setStatTarget('SM')
      } else {
        setStatTarget('SM')
        setPenaltyTarget('BR')
      }
    }
    const newTraits = rollTraits(data)
    setTraits(newTraits)
    setTraitRolls([null, null])
  }

  const handleRoll = () => {
    const data = getRandomItem(racesDataList)
    setRaceName(data.name)
    setRollResult(Math.floor(Math.random() * 20) + 1)

    if (data.subraces) {
      const roll = Math.floor(Math.random() * 4) + 1
      const picked = data.subraces.find((s) => s.roll === roll) ?? data.subraces[0]
      setSubrace(picked.name)
    }
    if (data.statChoice) {
      if (data.statChoice.type === 'simple') {
        const keys = ['SM', 'BR', 'MX', 'HT']
        setStatTarget(getRandomItem(keys))
      } else {
        const keys = ['SM', 'BR', 'MX', 'HT']
        const bonus = getRandomItem(keys)
        const penalty = getRandomItem(keys.filter((k) => k !== bonus))
        setStatTarget(bonus)
        setPenaltyTarget(penalty)
      }
    }
    const newTraits = rollTraits(data)
    setTraits(newTraits)
    setTraitRolls([null, null])
    setMode('roll')
  }

  const handleRollSubrace = () => {
    if (!raceData?.subraces) return
    const roll = Math.floor(Math.random() * 4) + 1
    const picked = raceData.subraces.find((s) => s.roll === roll) ?? raceData.subraces[0]
    setSubrace(picked.name)
  }

  const handleRollTrait = (index: number) => {
    if (!raceData) return
    const roll = Math.floor(Math.random() * raceData.traits.length)
    setTraits((prev) => {
      const next = [...prev] as [string, string]
      next[index] = raceData!.traits[roll] ?? ''
      return next
    })
    setTraitRolls((prev) => {
      const next = [...prev] as [number | null, number | null]
      next[index] = roll + 1
      return next
    })
  }

  const handleConfirm = () => {
    onConfirm({
      raceName,
      race: displayName,
      subrace: raceData?.subraces ? subrace : undefined,
      raceStats: stats,
      traits,
      statChoiceTarget: raceData?.statChoice
        ? (raceData.statChoice.type === 'simple' ? statTarget
          : raceData.statChoice.type === 'paired' ? statTarget
          : undefined)
        : undefined,
      statChoicePenaltyTarget: raceData?.statChoice?.type === 'paired' ? penaltyTarget : undefined,
    })
  }

  const isRolled = mode === 'roll'

  return (
    <>
      <div className="modal-header">
        <div>
          <h3>Race Roller</h3>
          <p>Choose a race or roll for one.</p>
        </div>
        {onClose && (
          <button type="button" className="button button-ghost" onClick={onClose}>
            Close
          </button>
        )}
      </div>

      <div className="modal-toggle-row">
        <button
          type="button"
          className={`button ${!isRolled ? 'button-primary' : 'button-ghost'}`}
          onClick={() => {
            const first = getRandomItem(racesDataList)
            handleRaceChange(first.name)
            setRollResult(null)
            setMode('choose')
          }}
        >
          Choose
        </button>
        <button
          type="button"
          className={`button ${isRolled ? 'button-primary' : 'button-ghost'}`}
          onClick={handleRoll}
        >
          Roll
        </button>
      </div>

      <div className="modal-body">
        {!isRolled ? (
          <div className="modal-field-row">
            <label className="modal-label" htmlFor="race-select">
              Race
            </label>
            <select
              id="race-select"
              className="panel-select"
              value={raceName}
              onChange={(event) => handleRaceChange(event.target.value)}
            >
              {racesDataList.map((r) => (
                <option key={r.name} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        ) : rollResult !== null && (
          <p className="modal-roll-result">Rolled {rollResult}</p>
        )}

        {raceData?.subraces && (
          <div className="modal-field-row">
            <label className="modal-label" htmlFor="subrace-select">
              Subrace
            </label>
            <select
              id="subrace-select"
              className="panel-select"
              value={subrace}
              onChange={(event) => setSubrace(event.target.value)}
            >
              {raceData.subraces.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
            <button type="button" className="button button-ghost" onClick={handleRollSubrace}>
              Roll
            </button>
          </div>
        )}

        {raceData?.statChoice?.type === 'simple' && (
          <div className="modal-field-row" style={{ gridTemplateColumns: 'auto 1fr' }}>
            <span className="modal-label">+{raceData.statChoice.amount}</span>
            <div className="stat-choice-buttons">
              {statKeys.map((key) => (
                <button
                  key={key}
                  type="button"
                  className={`stat-choice-btn${statTarget === key ? ' selected' : ''}`}
                  onClick={() => setStatTarget(key)}
                >
                  {statNames[key]}
                </button>
              ))}
            </div>
          </div>
        )}

        {raceData?.statChoice?.type === 'paired' && (
          <>
            <div className="modal-field-row" style={{ gridTemplateColumns: 'auto 1fr' }}>
              <span className="modal-label">+{raceData.statChoice.bonus}</span>
              <div className="stat-choice-buttons">
                {statKeys.map((key) => (
                  <button
                    key={key}
                    type="button"
                    className={`stat-choice-btn${statTarget === key ? ' selected' : ''}`}
                    onClick={() => setStatTarget(key)}
                  >
                    {statNames[key]}
                  </button>
                ))}
              </div>
            </div>
            <div className="modal-field-row" style={{ gridTemplateColumns: 'auto 1fr' }}>
              <span className="modal-label">{raceData.statChoice.penalty}</span>
              <div className="stat-choice-buttons">
                {statKeys.map((key) => (
                  <button
                    key={key}
                    type="button"
                    className={`stat-choice-btn${penaltyTarget === key ? ' selected-penalty' : ''}`}
                    onClick={() => setPenaltyTarget(key)}
                  >
                    {statNames[key]}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="modal-label" style={{ marginBottom: '4px' }}>Traits</div>
        {[0, 1].map((i) => (
          <div className="modal-field-row" key={i}>
            <div className="modal-label" style={{ minWidth: '1.5em' }}>
              {traitRolls[i] ?? '—'}
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', flex: 1 }}>
              <span className="race-trait-text">{traits[i] || 'No trait'}</span>
              <button type="button" className="button button-ghost" onClick={() => handleRollTrait(i)}>
                Roll
              </button>
            </div>
          </div>
        ))}

        <div className="modal-preview">
          <strong>{displayName || 'Select a race'}</strong>
          <div className="race-stats-preview">
            {statKeys.map((key) => {
              const val = stats[key] ?? 0
              return (
                <span key={key}>
                  {statNames[key]} {val >= 0 ? '+' : ''}{val}
                </span>
              )
            })}
          </div>
          {raceData?.subraces && subrace && (
            <p style={{ margin: '4px 0 0', color: 'var(--text)', fontSize: '0.9rem' }}>
              {raceData.subraces.find((s) => s.name === subrace)?.description}
            </p>
          )}
        </div>
      </div>

      <div className="modal-footer">
        {onClose && (
          <button type="button" className="button button-ghost" onClick={onClose}>
            Cancel
          </button>
        )}
        <button type="button" className="button button-primary" onClick={handleConfirm} disabled={!raceData}>
          Confirm
        </button>
      </div>
    </>
  )
}
