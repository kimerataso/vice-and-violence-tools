import spellsData from '../data/spells.json'

type Spell = {
  name: string
  level: number
  school: string
  description: string
}

type SpellRollType = 'Death' | 'Light'
type SpellRollLevel = 1 | 5

const allSpells = (spellsData as any).spells as Spell[]

const catalog: Record<SpellRollType, Record<SpellRollLevel, string[]>> = {
  Death: {
    1: ['Fireball', 'Lightning', 'Force Pull', 'Force Push', 'Paralyse', 'Free Choice'],
    5: ['Flash Freeze', 'Adrenaline', 'Raise Dead', 'Magic Shackles', 'Mass Paralyse', 'Double to Damage'],
  },
  Light: {
    1: ['Heal', 'Group Heal', 'Shield', 'Charm', 'Sleep', 'Free Choice'],
    5: ['Sunbeam', 'Enchant Weapon / Armour', 'Resurrect', 'Enthrall', 'Big Sleep', 'Free Choice'],
  },
}

export const getSpellOptions = (type: SpellRollType, level: SpellRollLevel): Spell[] => {
  const names = catalog[type][level] ?? []

  return names.map((name) => {
    if (name === 'Free Choice' || name === 'Double to Damage') {
      return {
        name,
        level,
        school: type,
        description:
          name === 'Free Choice'
            ? `Choose any ${type} spell of level ${level}.`
            : 'Special effect: double damage dice for a level 1 spell.',
      }
    }

    const found = allSpells.find((s) => s.name.toLowerCase() === name.toLowerCase())

    return (
      found ?? {
        name,
        level,
        school: type,
        description: '',
      }
    )
  })
}

export const rollSpell = (type: SpellRollType, level: SpellRollLevel): { roll: number; spell: Spell } | null => {
  const roll = Math.floor(Math.random() * 6) + 1
  const options = getSpellOptions(type, level)
  const index = roll - 1

  const picked = options[index] ?? null

  if (!picked) return null

  return { roll, spell: picked }
}

export type { Spell as SpellType, SpellRollType, SpellRollLevel }
