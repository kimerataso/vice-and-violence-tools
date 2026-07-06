import spellsData from './data/spells.json'
import { rollSpell, type SpellRollType, type SpellRollLevel } from './lib/spellRoll'
import { RollPanel, type FilterConfig } from './RollPanel'

type Spell = {
  name: string
  level: number
  school: string
  description: string
}

const spells = (spellsData as any).spells as Spell[]

const spellFilters: FilterConfig[] = [
  {
    key: 'school',
    label: 'Type',
    options: [
      { value: 'Any', label: 'Any' },
      { value: 'Death', label: 'Death' },
      { value: 'Light', label: 'Light' },
    ],
  },
  {
    key: 'level',
    label: 'Level',
    options: [
      { value: 'Any', label: 'Any' },
      { value: '1', label: '1' },
      { value: '5', label: '5' },
    ],
  },
]

const filterSpell = (spell: Spell, filters: Record<string, string>): boolean => {
  if (filters.school !== 'Any' && spell.school !== filters.school) return false
  if (filters.level !== 'Any' && spell.level !== Number(filters.level)) return false
  return true
}

const rollSpellItem = (_items: Spell[], filters: Record<string, string>): { item: Spell; roll: number } | null => {
  const types: SpellRollType[] = ['Death', 'Light']
  const levels: SpellRollLevel[] = [1, 5]
  const type = filters.school === 'Any' ? types[Math.floor(Math.random() * types.length)] : filters.school as SpellRollType
  const level = filters.level === 'Any' ? levels[Math.floor(Math.random() * levels.length)] : Number(filters.level) as SpellRollLevel
  const result = rollSpell(type, level)
  return result ? { item: result.spell, roll: result.roll } : null
}

interface SpellRollPanelProps {
  onAddSpell?: (spell: Spell) => void
  onClose?: () => void
}

export function SpellRollPanel({ onAddSpell, onClose }: SpellRollPanelProps) {
  return (
    <RollPanel
      title="Spell Roller"
      items={spells}
      filters={spellFilters}
      filterItem={filterSpell}
      rollItem={rollSpellItem}
      getLabel={(s) => s.name}
      renderPreview={(s) => (
        <>
          <strong>{s.name}</strong>
          <ul className="modal-description-list">
            {s.description.split('\n').map((line, i) => (
              <li key={i}>{line.trim().replace(/^- /, '')}</li>
            ))}
          </ul>
        </>
      )}
      onAdd={onAddSpell ? (s) => onAddSpell(s) : undefined}
      onClose={onClose}
    />
  )
}
