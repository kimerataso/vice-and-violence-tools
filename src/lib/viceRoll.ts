type RollableItem = {
  name: string
}

const VICE_ROLL_RANGE = 50

const VICE_ROLL_TABLE: Array<{ min: number; max: number; name: string }> = [
  { min: 1, max: 2, name: 'Chain Smoker' },
  { min: 3, max: 4, name: 'Giggles when Nervous' },
  { min: 5, max: 6, name: 'Painfully Embarrassed' },
  { min: 7, max: 8, name: 'Wuss' },
  { min: 9, max: 10, name: 'Chronic Horniness' },
  { min: 11, max: 12, name: 'Wine Enthusiast' },
  { min: 13, max: 14, name: 'Constant Daydreaming' },
  { min: 15, max: 16, name: 'Forgetful' },
  { min: 17, max: 18, name: 'Miserable Bastard' },
  { min: 19, max: 20, name: 'Bad Hygiene' },
  { min: 21, max: 22, name: 'Bloodletter' },
  { min: 23, max: 24, name: 'Hothead' },
  { min: 25, max: 26, name: 'Greaseball' },
  { min: 27, max: 28, name: 'Twitchy Eye' },
  { min: 29, max: 30, name: 'Lazy' },
  { min: 31, max: 32, name: 'Monogamous' },
  { min: 33, max: 34, name: 'Dopey' },
  { min: 35, max: 36, name: 'Slutty' },
  { min: 37, max: 38, name: 'Big Softy' },
  { min: 39, max: 40, name: 'Scaredy Cat' },
  { min: 41, max: 42, name: 'Creepy Smile' },
  { min: 43, max: 44, name: 'Shaky Hands' },
  { min: 45, max: 46, name: 'Greedy Sod' },
  { min: 47, max: 48, name: 'Milk Drinker' },
  { min: 49, max: 50, name: 'Nightly Jerker' },
]

export const getRandomSamples = <T,>(items: readonly T[], count: number) => {
  const itemsCopy = [...items]
  const selected: T[] = []

  while (selected.length < count && itemsCopy.length > 0) {
    const index = Math.floor(Math.random() * itemsCopy.length)
    selected.push(itemsCopy.splice(index, 1)[0])
  }

  return selected
}

const getViceByRoll = <T extends RollableItem>(items: readonly T[], roll: number) => {
  const match = VICE_ROLL_TABLE.find(({ min, max }) => roll >= min && roll <= max)

  if (!match) {
    return undefined
  }

  return items.find((item) => item.name === match.name) ?? items[0]
}

export const rollVice = <T extends RollableItem>(items: readonly T[]) => {
  if (items.length === 0) {
    return null
  }

  const roll = Math.floor(Math.random() * VICE_ROLL_RANGE) + 1
  const vice = getViceByRoll(items, roll)

  return vice ? { roll, vice } : null
}

export const rollViceSelection = <T extends RollableItem>(items: readonly T[], count = 1): T[] => {
  if (items.length === 0 || count <= 0) {
    return []
  }

  const selected: T[] = []
  const seenNames = new Set<string>()

  while (selected.length < Math.min(count, items.length)) {
    const rolledVice = rollVice(items)

    if (!rolledVice || seenNames.has(rolledVice.vice.name)) {
      continue
    }

    seenNames.add(rolledVice.vice.name)
    selected.push(rolledVice.vice)
  }

  return selected
}
