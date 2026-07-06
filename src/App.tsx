import { useState, useRef, useCallback } from 'react'
import vicesData from './data/vices.json'
import racesData from './data/races.json'
import backgroundsData from './data/backgrounds.json'
import { SpellRollPanel } from './SpellRollPanel'
import { ViceRollPanel } from './ViceRollPanel'
import { RaceRollPanel } from './RaceRollPanel'
import { RenamePanel } from './RenamePanel'
import { generateNameWithMoniker } from './lib/nameGenerator'
import './App.css'

type Spell = {
  name: string
  level: number
  school: string
  description: string
}

type Vice = {
  name: string
  stats?: Record<string, number>
  description: string
}

type Background = {
  name: string
  races?: string
  description: string
  stats?: Record<string, number>
  starting?: string
}

type RaceData = {
  name: string
  stats: Record<string, number>
  subraces?: { name: string; roll: number; stats: Record<string, number>; description: string }[]
  statChoice?: { type: 'simple'; amount: number } | { type: 'paired'; bonus: number; penalty: number }
  traits: string[]
}

type Character = {
  name: string
  raceName: string
  race: string
  subrace?: string
  life: number
  maxLife: number
  rawLifeRoll: number
  exertion: number
  maxExertion: number
  baseStats: Record<string, number>
  raceStats: Record<string, number>
  background?: Background
  spells: Spell[]
  vices: Vice[]
  traits: [string, string]
  statChoiceTarget?: string
  statChoicePenaltyTarget?: string
}

const racesDataList = (racesData as any).races as RaceData[]
const backgroundsDataList = (backgroundsData as any).backgrounds as Background[]

const vices = vicesData.vices as Vice[]

function normalizeRace(name: string): string {
  const map: Record<string, string> = {
    humans: 'human', elves: 'elf', dragonkin: 'dragonkin',
    dwarfs: 'dwarf', dwarf: 'dwarf', goblin: 'goblin', orc: 'orc',
    satyr: 'satyr', dweller: 'dweller', relmer: 'relmer', relmers: 'relmer',
    alloyan: 'alloyan', alloyans: 'alloyan', alloyani: 'alloyan',
    otherling: 'otherling', otherlings: 'otherling', centaur: 'centaur',
    elf: 'elf', human: 'human',
  }
  return map[name.toLowerCase().trim()] ?? name.toLowerCase().trim()
}

function isBackgroundAllowed(bg: Background, raceName: string): boolean {
  const races = bg.races ?? 'All Races'
  if (races === 'All Races') return true
  if (races.startsWith('All Races except')) {
    const excluded = races.replace('All Races except ', '').split(' & ').map((s) => s.trim())
    return !excluded.some((r) => normalizeRace(r) === normalizeRace(raceName))
  }
  const allowed = races.split(/[,&]/).map((s) => s.trim())
  return allowed.some((r) => normalizeRace(r) === normalizeRace(raceName))
}

const getRandomItem = <T,>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)]

const rollStat = () => Math.floor(Math.random() * 6) + 1 - 4

const makeCharacter = (): Character => {
  const raceData = getRandomItem(racesDataList)
  let raceName = raceData.name
  let subrace: string | undefined
  let raceStats: Record<string, number>

  if (raceData.subraces) {
    const roll = Math.floor(Math.random() * 4) + 1
    const picked = raceData.subraces.find((s) => s.roll === roll) ?? raceData.subraces[0]
    subrace = picked.name
    raceName = `${raceData.name} (${picked.name})`
    raceStats = { ...picked.stats }
  } else if (raceData.statChoice) {
    if (raceData.statChoice.type === 'simple') {
      raceStats = { SM: 1, BR: 0, MX: 0, HT: 0 }
    } else {
      raceStats = { SM: 2, BR: -1, MX: 0, HT: 0 }
    }
  } else {
    raceStats = { ...raceData.stats }
  }

  const baseStats = {
    SM: rollStat(),
    BR: rollStat(),
    MX: rollStat(),
    HT: rollStat(),
  }

  const totalMX = baseStats.MX + (raceStats.MX ?? 0)
  const maxLifeRolls = Array.from({ length: 5 }, () => Math.floor(Math.random() * 6) + 1)
  const rawLifeRoll = maxLifeRolls.reduce((a, b) => a + b, 0)
  const maxLife = Math.max(1, rawLifeRoll + totalMX)

  const traitRolls = [
    Math.floor(Math.random() * raceData.traits.length),
    Math.floor(Math.random() * raceData.traits.length),
  ]
  const traits: [string, string] = [raceData.traits[traitRolls[0]] ?? '', raceData.traits[traitRolls[1]] ?? '']

  return {
    name: generateNameWithMoniker(raceData.name),
    raceName: raceData.name,
    race: raceName,
    subrace,
    life: maxLife,
    maxLife,
    rawLifeRoll,
    exertion: 5,
    maxExertion: 5,
    baseStats,
    raceStats,
    spells: [],
    vices: [],
    traits,
    statChoiceTarget: raceData.statChoice ? (raceData.statChoice.type === 'simple' ? 'SM' : 'SM') : undefined,
    statChoicePenaltyTarget: raceData.statChoice?.type === 'paired' ? 'BR' : undefined,
  }
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  )
}

function Tooltip({ label, text }: { label: string; text: string }) {
  const [placement, setPlacement] = useState<'top' | 'bottom'>('top')
  const triggerRef = useRef<HTMLSpanElement>(null)
  const tooltipRef = useRef<HTMLSpanElement>(null)

  const updatePlacement = useCallback(() => {
    const trigger = triggerRef.current
    const tooltip = tooltipRef.current
    if (!trigger || !tooltip) return

    const triggerRect = trigger.getBoundingClientRect()
    const tooltipRect = tooltip.getBoundingClientRect()
    const requiredHeight = tooltipRect.height + 12
    const spaceAbove = triggerRect.top
    const spaceBelow = window.innerHeight - triggerRect.bottom

    setPlacement(spaceAbove >= requiredHeight || spaceBelow < requiredHeight ? 'top' : 'bottom')
  }, [])

  return (
    <span
      className={`tooltip tooltip--${placement}`}
      tabIndex={0}
      aria-label={text}
      ref={triggerRef}
      onMouseEnter={updatePlacement}
      onFocus={updatePlacement}
    >
      {label}
      <span className="tooltip-text" ref={tooltipRef}>
        {text}
      </span>
    </span>
  )
}

const statInfo = {
  SM: {
    name: 'Smarts',
    description:
      'Cast spells, pick locks, decipher text, disarm traps, investigate.',
  },
  BR: {
    name: 'Brawn',
    description:
      'Fight, carry, push, break, arm wrestle, interrogate, intimidate.',
  },
  MX: {
    name: 'Moxie',
    description: 'Defend, resist poison, stay sober, survive torture.',
  },
  HT: {
    name: 'Hotness',
    description:
      'Seduce, bribe, get laid, get paid, blend in, stand out.',
  },
} as const

function AbilityEditPanel({
  baseStats,
  onConfirm,
  onClose,
}: {
  baseStats: Record<string, number>
  onConfirm: (stats: Record<string, number>) => void
  onClose?: () => void
}) {
  const [stats, setStats] = useState({ ...baseStats })
  const statKeys = Object.keys(statInfo) as Array<keyof typeof statInfo>

  return (
    <>
      <div className="modal-header">
        <div>
          <h3>Edit Abilities</h3>
          <p>Set base stats. Range -3 to 2.</p>
        </div>
        {onClose && (
          <button type="button" className="button button-ghost" onClick={onClose}>
            Close
          </button>
        )}
      </div>
      <div className="modal-body">
        {statKeys.map((key) => (
          <div className="modal-field-row" key={key}>
            <label className="modal-label" htmlFor={`ability-${key}`}>
              {statInfo[key].name}
            </label>
            <input
              id={`ability-${key}`}
              type="number"
              className="base-input"
              value={stats[key] ?? 0}
              min={-3}
              max={2}
              onChange={(e) =>
                setStats((prev) => ({
                  ...prev,
                  [key]: Math.max(-3, Math.min(2, parseInt(e.target.value) || 0)),
                }))
              }
            />
          </div>
        ))}
      </div>
      <div className="modal-footer">
        {onClose && (
          <button type="button" className="button button-ghost" onClick={onClose}>
            Cancel
          </button>
        )}
        <button type="button" className="button button-primary" onClick={() => onConfirm(stats)}>
          Confirm
        </button>
      </div>
    </>
  )
}

function BackgroundEditPanel({
  currentBackground,
  raceName,
  onConfirm,
  onClose,
}: {
  currentBackground?: Background
  raceName: string
  onConfirm: (background?: Background) => void
  onClose?: () => void
}) {
  const [selected, setSelected] = useState(currentBackground?.name ?? '')
  const bg = selected ? backgroundsDataList.find((b) => b.name === selected) : undefined
  const warning = bg && !isBackgroundAllowed(bg, raceName)
    ? `"${bg.name}" is not available for ${raceName}`
    : null

  return (
    <>
      <div className="modal-header">
        <div>
          <h3>Background</h3>
          <p>Choose a background for your character.</p>
        </div>
        {onClose && (
          <button type="button" className="button button-ghost" onClick={onClose}>
            Close
          </button>
        )}
      </div>
      <div className="modal-body">
        <div className="modal-field-row">
          <label className="modal-label" htmlFor="bg-select">
            Background
          </label>
          <select
            id="bg-select"
            className="panel-select"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="">None</option>
            {backgroundsDataList.map((b) => (
              <option key={b.name} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        {bg && (
          <div className="modal-preview">
            <strong>{bg.name}</strong>
            <p>{bg.description}</p>
            {bg.starting && <p style={{ marginTop: '8px', fontStyle: 'italic' }}>{bg.starting}</p>}
          </div>
        )}
        {warning && <span className="bg-warning">{warning}</span>}
      </div>
      <div className="modal-footer">
        {onClose && (
          <button type="button" className="button button-ghost" onClick={onClose}>
            Cancel
          </button>
        )}
        <button type="button" className="button button-primary" onClick={() => onConfirm(bg)}>
          Confirm
        </button>
      </div>
    </>
  )
}

function App() {
  const statInfo = {
    SM: {
      name: 'Smarts',
      description:
        'Cast spells, pick locks, decipher text, disarm traps, investigate.',
    },
    BR: {
      name: 'Brawn',
      description:
        'Fight, carry, push, break, arm wrestle, interrogate, intimidate.',
    },
    MX: {
      name: 'Moxie',
      description: 'Defend, resist poison, stay sober, survive torture.',
    },
    HT: {
      name: 'Hotness',
      description:
        'Seduce, bribe, get laid, get paid, blend in, stand out.',
    },
  } as const

  const [character, setCharacter] = useState<Character>(makeCharacter())
  const [isViceModalOpen, setIsViceModalOpen] = useState(false)
  const [isSpellModalOpen, setIsSpellModalOpen] = useState(false)
  const [isRaceModalOpen, setIsRaceModalOpen] = useState(false)
  const [isAbilityModalOpen, setIsAbilityModalOpen] = useState(false)
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false)
  const [isBackgroundModalOpen, setIsBackgroundModalOpen] = useState(false)

  const rollNewCharacter = () => {
    setCharacter(makeCharacter())
  }

  const addVice = (vice: Vice) => {
    setCharacter((currentCharacter) => {
      if (currentCharacter.vices.some((existingVice) => existingVice.name === vice.name)) {
        return currentCharacter
      }

      return {
        ...currentCharacter,
        vices: [...currentCharacter.vices, vice],
      }
    })
  }

  const removeVice = (viceName: string) => {
    setCharacter((currentCharacter) => ({
      ...currentCharacter,
      vices: currentCharacter.vices.filter((vice) => vice.name !== viceName),
    }))
  }

  const availableVices = vices.filter((vice) => !character.vices.some((existingVice) => existingVice.name === vice.name))

  const openViceModal = () => {
    setIsViceModalOpen(true)
  }

  const closeViceModal = () => {
    setIsViceModalOpen(false)
  }

  const addSpell = (spell: Spell) => {
    setCharacter((currentCharacter) => {
      if (currentCharacter.spells.some((existingSpell) => existingSpell.name === spell.name)) {
        return currentCharacter
      }

      return {
        ...currentCharacter,
        spells: [...currentCharacter.spells, spell],
      }
    })
  }

  const removeSpell = (spellName: string) => {
    setCharacter((currentCharacter) => ({
      ...currentCharacter,
      spells: currentCharacter.spells.filter((spell) => spell.name !== spellName),
    }))
  }

  const openSpellModal = () => {
    setIsSpellModalOpen(true)
  }

  const closeSpellModal = () => {
    setIsSpellModalOpen(false)
  }

  const openRaceModal = () => {
    setIsRaceModalOpen(true)
  }

  const closeRaceModal = () => {
    setIsRaceModalOpen(false)
  }

  const handleRaceConfirm = (selection: {
    raceName: string
    race: string
    subrace?: string
    raceStats: Record<string, number>
    traits: [string, string]
    statChoiceTarget?: string
    statChoicePenaltyTarget?: string
  }) => {
    setCharacter((prev) => {
      const newTotalMX = prev.baseStats.MX + (selection.raceStats.MX ?? 0)
      const newMaxLife = Math.max(1, prev.rawLifeRoll + newTotalMX)
      return {
        ...prev,
        raceName: selection.raceName,
        race: selection.race,
        subrace: selection.subrace,
        raceStats: selection.raceStats,
        traits: selection.traits,
        statChoiceTarget: selection.statChoiceTarget,
        statChoicePenaltyTarget: selection.statChoicePenaltyTarget,
        maxLife: newMaxLife,
        life: Math.min(prev.life, newMaxLife),
      }
    })
    setIsRaceModalOpen(false)
  }

  const openAbilityModal = () => {
    setIsAbilityModalOpen(true)
  }

  const closeAbilityModal = () => {
    setIsAbilityModalOpen(false)
  }

  const openRenameModal = () => {
    setIsRenameModalOpen(true)
  }

  const closeRenameModal = () => {
    setIsRenameModalOpen(false)
  }

  const handleBackgroundConfirm = (bg?: Background) => {
    setCharacter((prev) => ({ ...prev, background: bg }))
    setIsBackgroundModalOpen(false)
  }

  const openBackgroundModal = () => {
    setIsBackgroundModalOpen(true)
  }

  const closeBackgroundModal = () => {
    setIsBackgroundModalOpen(false)
  }

  const selectedBackground = character.background
  const backgroundWarning = selectedBackground && !isBackgroundAllowed(selectedBackground, character.raceName)
    ? `"${selectedBackground.name}" is not available for ${character.raceName}`
    : null

  const handleRenameConfirm = (name: string) => {
    setCharacter((prev) => ({ ...prev, name }))
    setIsRenameModalOpen(false)
  }

  const handleAbilityConfirm = (newBaseStats: Record<string, number>) => {
    setCharacter((prev) => {
      const newTotalMX = newBaseStats.MX + (prev.raceStats.MX ?? 0)
      const newMaxLife = Math.max(1, prev.rawLifeRoll + newTotalMX)
      return {
        ...prev,
        baseStats: newBaseStats,
        maxLife: newMaxLife,
        life: Math.min(prev.life, newMaxLife),
      }
    })
    setIsAbilityModalOpen(false)
  }

  const adjustLife = (delta: number) => {
    setCharacter((prev) => ({ ...prev, life: Math.max(0, Math.min(prev.maxLife, prev.life + delta)) }))
  }

  const adjustExertion = (delta: number) => {
    setCharacter((prev) => ({
      ...prev,
      exertion: Math.max(0, Math.min(prev.maxExertion, prev.exertion + delta)),
    }))
  }

  const statKeys = Object.keys(statInfo) as Array<keyof typeof statInfo>

  const characterStats = statKeys.map((key) => {
    const base = character.baseStats[key] ?? 0
    const race = character.raceStats[key] ?? 0
    const background = character.background?.stats?.[key] ?? 0
    const vices = character.vices.reduce((sum, vice) => {
      return sum +
        Object.entries(vice.stats ?? {}).reduce((viceSum, [statKey, value]) => {
          const normalized = statKey.toUpperCase() === 'SMARTS' ? 'SM'
            : statKey.toUpperCase() === 'BRAWN' ? 'BR'
            : statKey.toUpperCase() === 'MOXIE' ? 'MX'
            : statKey.toUpperCase() === 'HOTNESS' ? 'HT'
            : statKey.toUpperCase() === key
            ? key
            : ''

          return viceSum + (normalized === key ? value : 0)
        }, 0)
    }, 0)

    return {
      key,
      total: base + race + background + vices,
      breakdown: [
        { source: 'Base', amount: base },
        { source: 'Race', amount: race },
        { source: 'Background', amount: background },
        { source: 'Vices', amount: vices },
      ],
    }
  })

  return (
    <main className="app-shell">
      <div className="page-header">
        <p className="page-title">Character Sheet</p>
        <button type="button" className="button button-primary" onClick={rollNewCharacter}>
          Roll New Character
        </button>
      </div>

      <header className="hero-card">
        <div className="hero-name-row">
          <h1 className="hero-name">
            <span>{character.name}</span>
            <button type="button" className="icon-btn hero-name-edit" onClick={openRenameModal} aria-label="Rename">
              <EditIcon />
            </button>
          </h1>
        </div>
        <p className="subtitle">
          <span className="subtitle-label">Race:</span>
          <span>{character.race}</span>
          <button type="button" className="icon-btn" onClick={openRaceModal} aria-label="Change Race">
            <EditIcon />
          </button>
          <span className="traits-text">{character.traits.filter(Boolean).join(', ')}</span>
        </p>
        <div className="background-row">
          <span className="subtitle-label">Background:</span>
          {character.background ? (
            <Tooltip label={character.background.name} text={character.background.description} />
          ) : (
            <span>None</span>
          )}
          <button type="button" className="icon-btn" onClick={openBackgroundModal} aria-label="Change Background">
            <EditIcon />
          </button>
          {backgroundWarning && <span className="bg-warning">{backgroundWarning}</span>}
        </div>
      </header>

      <section className="panel">
        <div className="panel-heading">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2>Abilities</h2>
            <button type="button" className="icon-btn" onClick={openAbilityModal} aria-label="Edit Abilities">
              <EditIcon />
            </button>
          </div>
        </div>
        <div className="stats-grid">
          {characterStats.map((stat) => (
            <article key={stat.key} className="stat-card">
              <div className="stat-header">
                <Tooltip
                  label={statInfo[stat.key].name}
                  text={statInfo[stat.key].description}
                />
                <span className="stat-value">{stat.total}</span>
              </div>
              <div className="stat-breakdown">
                {stat.breakdown
                  .filter((item) => item.source === 'Base' || item.amount !== 0)
                  .map((item, index, items) => (
                    <span key={item.source}>
                      {item.source} {item.amount >= 0 ? '+' : ''}{item.amount}
                      {index < items.length - 1 ? ' · ' : ''}
                    </span>
                  ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Stats</h2>
          </div>
        </div>
        <div className="vitals-grid">
          <div className="vital-card">
            <span className="vital-label">Life</span>
            <div className="vital-controls">
              <button type="button" className="button button-ghost vital-btn" onClick={() => adjustLife(-1)}>
                −
              </button>
              <span className="vital-value">{character.life}/{character.maxLife}</span>
              <button type="button" className="button button-ghost vital-btn" onClick={() => adjustLife(1)}>
                +
              </button>
            </div>
          </div>
          <div className="vital-card">
            <span className="vital-label">Exertion</span>
            <div className="vital-controls">
              <button type="button" className="button button-ghost vital-btn" onClick={() => adjustExertion(-1)}>
                −
              </button>
              <span className="vital-value">{character.exertion}/{character.maxExertion}</span>
              <button type="button" className="button button-ghost vital-btn" onClick={() => adjustExertion(1)}>
                +
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Spells</h2>
            <p>Tap or hover for details.</p>
          </div>
          <div className="panel-controls">
            <button type="button" className="button button-primary" onClick={openSpellModal}>
              Add Spell
            </button>
          </div>
        </div>
        <ul className="item-list">
          {character.spells.map((spell) => (
            <li key={spell.name}>
              <div>
                <Tooltip label={`${spell.name} (L${spell.level})`} text={spell.description} />
                <span className="item-meta">{spell.school}</span>
              </div>
              <div className="item-actions">
                <button type="button" className="button button-ghost" onClick={() => removeSpell(spell.name)}>
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Vices</h2>
          </div>
          <div className="panel-controls">
            <button type="button" className="button button-primary" onClick={openViceModal}>
              Add Vice
            </button>
          </div>
        </div>
        <ul className="item-list">
          {character.vices.map((vice) => (
            <li key={vice.name}>
              <div>
                <strong>{vice.name}</strong>
                <div className="vice-description">{vice.description}</div>
              </div>
              <div className="item-actions">
                <button type="button" className="button button-ghost" onClick={() => removeVice(vice.name)}>
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {isViceModalOpen && (
        <div className="modal-backdrop" role="presentation" onClick={closeViceModal}>
          <div className="modal-card" role="dialog" aria-modal="true" aria-label="Vice Roller" onClick={(event) => event.stopPropagation()}>
            <ViceRollPanel items={availableVices} onAddVice={addVice} onClose={closeViceModal} />
          </div>
        </div>
      )}

      {isSpellModalOpen && (
        <div className="modal-backdrop" role="presentation" onClick={closeSpellModal}>
          <div className="modal-card" role="dialog" aria-modal="true" aria-label="Spell Roller" onClick={(event) => event.stopPropagation()}>
            <SpellRollPanel onAddSpell={addSpell} onClose={closeSpellModal} />
          </div>
        </div>
      )}

      {isRaceModalOpen && (
        <div className="modal-backdrop" role="presentation" onClick={closeRaceModal}>
          <div className="modal-card" role="dialog" aria-modal="true" aria-label="Race Roller" onClick={(event) => event.stopPropagation()}>
            <RaceRollPanel
              currentRaceName={character.raceName}
              currentSubrace={character.subrace}
              currentTraits={character.traits}
              currentStatChoiceTarget={character.statChoiceTarget}
              currentStatChoicePenaltyTarget={character.statChoicePenaltyTarget}
              onConfirm={handleRaceConfirm}
              onClose={closeRaceModal}
            />
          </div>
        </div>
      )}

      {isAbilityModalOpen && (
        <div className="modal-backdrop" role="presentation" onClick={closeAbilityModal}>
          <div className="modal-card" role="dialog" aria-modal="true" aria-label="Edit Abilities" onClick={(event) => event.stopPropagation()}>
            <AbilityEditPanel
              baseStats={character.baseStats}
              onConfirm={handleAbilityConfirm}
              onClose={closeAbilityModal}
            />
          </div>
        </div>
      )}

      {isRenameModalOpen && (
        <div className="modal-backdrop" role="presentation" onClick={closeRenameModal}>
          <div className="modal-card" role="dialog" aria-modal="true" aria-label="Rename" onClick={(event) => event.stopPropagation()}>
            <RenamePanel
              currentName={character.name}
              raceName={character.raceName}
              onConfirm={handleRenameConfirm}
              onClose={closeRenameModal}
            />
          </div>
        </div>
      )}

      {isBackgroundModalOpen && (
        <div className="modal-backdrop" role="presentation" onClick={closeBackgroundModal}>
          <div className="modal-card" role="dialog" aria-modal="true" aria-label="Background" onClick={(event) => event.stopPropagation()}>
            <BackgroundEditPanel
              currentBackground={character.background}
              raceName={character.raceName}
              onConfirm={handleBackgroundConfirm}
              onClose={closeBackgroundModal}
            />
          </div>
        </div>
      )}
    </main>
  )
}

export default App
