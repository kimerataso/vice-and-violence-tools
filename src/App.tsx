import { useState, useRef, useCallback } from 'react'
import backgroundsData from './data/backgrounds.json'
import spellsData from './data/spells.json'
import vicesData from './data/vices.json'
import { getRandomSamples, rollViceSelection } from './lib/viceRoll'
import { SpellRollPanel } from './SpellRollPanel'
import { ViceRollPanel } from './ViceRollPanel'
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

type Character = {
  name: string
  race: string
  health: number
  baseStats: Record<string, number>
  raceStats: Record<string, number>
  background?: Background
  spells: Spell[]
  vices: Vice[]
}

const races = [
  'Gobbo',
  'Dragonkin',
  'Elf',
  'Human',
  'Orc',
  'Dwarf',
  'Centaur',
  'Satyr',
  'Dweller',
  'Relmer',
  'Alloyan',
  'Otherling',
] as const

const names = ['Ari', 'Nara', 'Kael', 'Iris', 'Finn', 'Tala']

const backgrounds = backgroundsData.backgrounds as Background[]
const spells = spellsData.spells as Spell[]
const vices = vicesData.vices as Vice[]

// Spell roll logic moved to src/lib/spellRoll.ts

const getRandomItem = <T,>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)]

const makeCharacter = (): Character => {
  const race = getRandomItem(races)
  const background = getRandomItem(backgrounds)
  const spellsSelection = getRandomSamples(spells, 3)
  const vicesSelection = rollViceSelection(vices, 2)

  return {
    name: `${getRandomItem(names)} ${getRandomItem(['Swift', 'Stone', 'Vale', 'Wren'])}`,
    race,
    health: 24 + Math.floor(Math.random() * 5),
    baseStats: {
      SM: 2,
      BR: 3,
      MX: 1,
      HT: 2,
    },
    raceStats: {
      SM: 0,
      BR: 0,
      MX: 0,
      HT: 0,
    },
    background,
    spells: spellsSelection,
    vices: vicesSelection,
  }
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
        { source: character.race, amount: race },
        { source: character.background?.name ?? 'Background', amount: background },
        { source: 'Vices', amount: vices },
      ],
    }
  })

  return (
    <main className="app-shell">
      <header className="hero-card">
        <div>
          <p className="eyebrow">Character Sheet</p>
          <h1>{character.name}</h1>
          <p className="subtitle">
            <span>{character.race}</span>
            <span>•</span>
            <span>Health {character.health}</span>
          </p>
        </div>
        <div className="hero-actions">
          <button type="button" className="button button-primary" onClick={rollNewCharacter}>
            Roll New Character
          </button>
        </div>
        <div className="background-chip">
          <strong>Background</strong>
          {character.background ? (
            <Tooltip
              label={character.background.name}
              text={character.background.description}
            />
          ) : (
            <span>None selected</span>
          )}
        </div>
      </header>

      <section className="stats-grid" aria-label="Character stats">
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
                .filter((item) => item.amount !== 0)
                .map((item, index, items) => (
                  <span key={item.source}>
                    {item.source} {item.amount >= 0 ? '+' : ''}{item.amount}
                    {index < items.length - 1 ? ' · ' : ''}
                  </span>
                ))}
              {stat.breakdown.every((item) => item.amount === 0) && 'Base only'}
            </div>
          </article>
        ))}
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
    </main>
  )
}

export default App
