const getRandomItem = <T,>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)]

const monikerFirst = [
  'Throb', 'Shady', 'Lovli', 'Buns', 'Liften', 'Rezmi', 'Tiddi', 'Axe', 'Crassen', 'Gamble', 'Nimbul',
  'Swift', 'Stone', 'Vale', 'Wren', 'Brick', 'Chub', 'Crisp', 'Dusty', 'Flint', 'Grim', 'Hack',
  'Jolt', 'Knack', 'Limber', 'Mirth', 'Nimble', 'Pluck', 'Quake', 'Rusty', 'Slink', 'Toast',
]

const monikerLast = [
  'Longcock', 'Deelins', 'Donuts', 'Aplenty', 'Carry', 'Soon', 'Wobblins', 'Mad', 'Vulgar', 'Daili', 'Fingas',
  'Gutspiller', 'Greatbelly', 'Bonesnapper', 'Thunderclap', 'Nightwalker', 'Dragonfist', 'Silvertongue',
  'Ironhide', 'Goldtooth', 'Stormchaser', 'Firebreath', 'Shadowstep', 'Ravenclaw', 'Moonshine',
]

const monikerThe = [
  'Slaughterer', 'Wanderer', 'Brewer', 'Dancer', 'Fiddler', 'Gambler', 'Hunter', 'Jester', 'Knitter',
  'Lurker', 'Mumbler', 'Prowler', 'Roamer', 'Screamer', 'Tinker', 'Wrangler',
]

function generateMoniker(): string {
  if (Math.random() < 0.3) {
    return `${getRandomItem(monikerFirst)} the ${getRandomItem(monikerThe)}`
  }
  return `${getRandomItem(monikerFirst)} ${getRandomItem(monikerLast)}`
}

const dragonkinPrefix = [
  'Kar', 'Ran', 'Fen', 'Gar', 'Ken', 'Kal', 'Zen', 'Tan', 'Wut', 'Red',
  'Bra', 'Dra', 'Gri', 'Kro', 'Nal', 'Sar', 'The', 'Vor', 'Yor', 'Zor',
  'Drac', 'Quet', 'Wyv', 'Kobo', 'Bel', 'Chro', 'Eth', 'Gor', 'Jor', 'Mith',
]

const dragonkinSuffix = [
  'ran', 'du', 'trei', 'for', 'fi', 'sais', 'en', 'ayt', 'dii', 'tun',
]

function generateDragonkinName(): string {
  const prefix = getRandomItem(dragonkinPrefix)
  const suffix = getRandomItem(dragonkinSuffix)
  return `${prefix}'${suffix}`
}

const elfStems = [
  'Alar', 'Elr', 'Aeal', 'Yul', 'Oli', 'Ul', 'Ith', 'Ael', 'Ril', 'Thir',
  'Lun', 'Mir', 'Fal', 'Gal', 'Hel', 'Lor', 'Mel', 'Nil', 'Sil', 'Val',
  'Anar', 'Cele', 'Eari', 'Iri', 'Lauri', 'Nari', 'Sari', 'Tari', 'Vari', 'Wari',
]

function generateElfName(): string {
  const stem = getRandomItem(elfStems)
  const feminine = Math.random() < 0.5
  if (feminine) {
    const suffix = getRandomItem(['i', 'ia', 'iel', 'a'])
    return `${stem}${suffix}`
  }
  const suffix = getRandomItem(['on', 'ion', 'ron'])
  return `${stem}${suffix}`
}

const orcPersonal = [
  'Gaz', 'Krud', 'Fuzzi', 'Rend', 'Guzlin', 'Grok', 'Muz', 'Thrak', 'Ugg', 'Zog',
  'Bruk', 'Drok', 'Grum', 'Krag', 'Lug', 'Mogg', 'Shug', 'Trok', 'Warg', 'Yurk',
  'Blud', 'Gash', 'Kroosh', 'Mash', 'Snag', 'Splint', 'Stomp', 'Thug', 'Wreck',
]

const orcTitle = [
  'Gutspiller', 'Neverbather', 'Greatbelly', 'Bonesnapper', 'Longcock', 'Axehand',
  'Skullcrusher', 'Ripjaw', 'Foulbreath', 'Redeye', 'Splittongue', 'Ironfist',
  'Gutripper', 'Toothbreaker', 'Bloodspiller', 'Stonehead', 'Tuskbiter', 'Fleshhook',
]

function generateOrcName(): string {
  const personal = getRandomItem(orcPersonal)
  if (Math.random() < 0.2) {
    const title = getRandomItem(monikerThe)
    return `${personal} the ${title}`
  }
  const title = getRandomItem(orcTitle)
  return `${personal} ${title}`
}

const goblinNames = [
  'Grabbim', 'Ouch', 'Lookit', 'Nikka', 'Yizzy', 'Atchu', 'Sniz', 'Pockit', 'Kikkim',
  'Shit', 'Bugga', 'Jim', 'Clank', 'Drib', 'Fizz', 'Gack', 'Muck', 'Nib',
  'Plop', 'Snot', 'Spork', 'Tink', 'Wob', 'Greeb', 'Klunk', 'Ping', 'Squeek', 'Zap',
  'Blinky', 'Chomp', 'Dobby', 'Fingle', 'Gobbo', 'Jib', 'Knuck', 'Midge', 'Pip', 'Ricka',
  'Splodge', 'Titch', 'Wot', 'Yip', 'Zing',
]

function generateGoblinName(): string {
  return getRandomItem(goblinNames)
}

const dwarfBirthNoise = [
  'Doof', 'Kaara', 'Aragh', 'Owyn', 'Agarag', 'Bof', 'Durg', 'Gar', 'Hrog', 'Krag',
  'Lor', 'Morg', 'Norn', 'Rork', 'Thor', 'Vorn', 'Yorn', 'Argh', 'Bash', 'Clang',
  'Drub', 'Gnash', 'Grind', 'Hack', 'Klunk', 'Mash', 'Rasp', 'Scrape', 'Thump', 'Wheeze',
]

const dwarfKinsnamePart = [
  'Owargh', 'Ango', 'Arghyabastard', 'Oowarn', 'Aran', 'Ryn', 'Throk', 'Gron', 'Borin',
  'Durin', 'Farin', 'Gimli', 'Kili', 'Nori', 'Ori', 'Thrain', 'Balin', 'Dwalin', 'Oin', 'Gloin',
]

const dwarfSurface = [
  'Nickel', 'Pumice', 'Rock', 'Pebble', 'Flint', 'Granite', 'Slate', 'Copper', 'Iron', 'Tin',
  'Gold', 'Silver', 'Bronze', 'Steel', 'Gem', 'Onyx', 'Jade', 'Opal', 'Rust', 'Stone',
]

function generateDwarfName(): string {
  const aboveGround = Math.random() < 0.3
  if (aboveGround) {
    return getRandomItem(dwarfSurface)
  }
  const first = getRandomItem(dwarfBirthNoise)
  const kin = getRandomItem(dwarfKinsnamePart)
  return `${first} ${kin}kin`
}

const humanPersonal = [
  'Darrin', 'Erik', 'Dayv', 'Ulran', 'Arlen', 'Borin', 'Corin', 'Doran', 'Eldrin', 'Farren',
  'Garret', 'Harold', 'Kaelen', 'Lorik', 'Maren', 'Naren', 'Orrin', 'Pellin', 'Roran', 'Torin',
  'Annali', 'Briar', 'Caeli', 'Dessa', 'Elara', 'Fenna', 'Gessa', 'Helda', 'Irma', 'Jessa',
  'Kara', 'Lena', 'Mara', 'Nessa', 'Orla', 'Pella', 'Rina', 'Sara', 'Tessa', 'Vella',
]

const humanClan = [
  'Karkan', 'Erik', 'Filia', 'Ulran', 'Arlen', 'Borin', 'Corin', 'Doran', 'Eldrin', 'Farren',
  'Dirk', 'Rika', 'Ulla', 'Desmin', 'Darrin', 'Erik', 'Rikan', 'Desi', 'Korik', 'Nari',
]

const humanSuffix = ['slad', 'slass', 'skin']

function generateHumanName(): string {
  const personal = getRandomItem(humanPersonal)
  const clan = getRandomItem(humanClan)
  const suffix = getRandomItem(humanSuffix)
  return `${personal} ${clan}${suffix}`
}

function generateCentaurName(): string {
  return generateHumanName()
}

const satyrNames = [
  'Rosie', 'Daisie', 'Sandy', 'Rocky', 'Shroomie', 'Grassy', 'Rattie', 'Stoney', 'Foodie',
  'Berry', 'Bramby', 'Clover', 'Dewey', 'Floppy', 'Gilly', 'Hoppy', 'Ivy', 'Juniper', 'Leafy',
  'Mossy', 'Nettle', 'Piney', 'Rooty', 'Sage', 'Thorny', 'Viney', 'Willow', 'Yarrow', 'Zesty',
  'Buzzy', 'Dandy', 'Fernie', 'Hazel', 'Lilac', 'Maple', 'Ollie', 'Poppy', 'Rusty', 'Sunny', 'Tully',
]

function generateSatyrName(): string {
  return getRandomItem(satyrNames)
}

const relmerElfStems = [
  'Illar', 'Yur', 'Eler', 'Rail', 'Annal', 'Alar', 'Elr', 'Aeal', 'Yul', 'Oli',
  'Laur', 'Mir', 'Fal', 'Gal', 'Hel', 'Lor', 'Mel', 'Nil', 'Sil', 'Val',
]

const relmerHumanClan = [
  'Onili', 'Wolanion', 'Relani', 'Unalion', 'Onli', 'Alarion', 'Elrion', 'Yulion', 'Olion', 'Thalion',
  'Karkan', 'Filia', 'Eldrin', 'Borin', 'Corin', 'Doran', 'Farren', 'Lorik', 'Maren', 'Torin',
]

function generateRelmerName(): string {
  const elfStem = getRandomItem(relmerElfStems)
  const feminine = Math.random() < 0.5
  const elfName = feminine
    ? `${elfStem}${getRandomItem(['i', 'ia', 'iel'])}`
    : `${elfStem}${getRandomItem(['on', 'ion', 'ron'])}`
  const clan = getRandomItem(relmerHumanClan)
  return `${elfName} ${clan}`
}

const dwellerPersonal = [
  'Den', 'Rett', 'Jym', 'Kan', 'Khyn', 'Emmi', 'Karn', 'Rhyn', 'Luu', 'Kris',
  'Fenn', 'Dyn', 'Bren', 'Cadd', 'Dell', 'Gren', 'Hedd', 'Jynn', 'Kell', 'Lenn',
  'Mott', 'Nell', 'Pell', 'Quin', 'Renn', 'Sydd', 'Tinn', 'Venn', 'Wyll', 'Yenn',
]

const dwellerTrade = [
  'Farmer', 'Weaver', 'Fiddler', 'Planter', 'Tallor', 'Carver', 'Buttons', 'Brewer', 'Dancer', 'Courier',
  'Baker', 'Chandler', 'Draper', 'Fletcher', 'Glover', 'Hatter', 'Jeweller', 'Knapper', 'Mason',
  'Porter', 'Roper', 'Skinner', 'Tanner', 'Turner', 'Wheeler', 'Woods',
]

function generateDwellerName(): string {
  const personal = getRandomItem(dwellerPersonal)
  const trade = getRandomItem(dwellerTrade)
  return `${personal} ${trade}`
}

const alloyanPersonal = [
  'Len', 'Rhod', 'Gerri', 'Tarn', 'Drej', 'Kren', 'Perki', 'Bren', 'Cadd', 'Dell',
  'Gren', 'Hedd', 'Jynn', 'Kell', 'Lenn', 'Mott', 'Nell', 'Pell', 'Quin', 'Renn',
]

const alloyanKinPart = [
  'Ryn', 'Ran', 'Olan', 'Pom', 'Drej', 'Yorn', 'Kran', 'Throk', 'Gron', 'Borin',
  'Durin', 'Farin', 'Argh', 'Thrain', 'Balin', 'Dwalin', 'Rik', 'Tor', 'Var', 'Zor',
]

function generateAlloyanName(): string {
  const personal = getRandomItem(alloyanPersonal)
  const kin = getRandomItem(alloyanKinPart)
  return `${personal} ${kin}kin`
}

const otherlingPersonal = [
  'Renni', 'Wyllin', 'Yullyn', 'Turia', 'Samni', 'Suli', 'Vyll', 'Brinna', 'Caddi', 'Dellin',
  'Emmil', 'Fenni', 'Grenna', 'Heddyn', 'Jymmi', 'Kellin', 'Lennon', 'Mottin', 'Nellis', 'Pellin',
  'Quinna', 'Rennyn', 'Syddin', 'Tinnan', 'Venna', 'Wyllan', 'Yennin',
]

const otherlingTrade = [
  'Piper', 'Cook', 'Wheeler', 'Miller', 'Potter', 'Sadler', 'Carpenter', 'Baker', 'Chandler',
  'Cooper', 'Draper', 'Fletcher', 'Glover', 'Hatter', 'Mason', 'Painter', 'Porter', 'Roper',
  'Shearer', 'Skinner', 'Smith', 'Tanner', 'Thatcher', 'Turner', 'Walker', 'Weaver',
]

function generateOtherlingName(): string {
  const personal = getRandomItem(otherlingPersonal)
  const trade = getRandomItem(otherlingTrade)
  return `${personal} ${trade}`
}

export type RaceName = string

export function generateName(raceName: string): string {
  switch (raceName) {
    case 'Dragonkin':
      return generateDragonkinName()
    case 'Elf':
      return generateElfName()
    case 'Orc':
      return generateOrcName()
    case 'Goblin':
      return generateGoblinName()
    case 'Dwarf':
      return generateDwarfName()
    case 'Human':
      return generateHumanName()
    case 'Centaur':
      return generateCentaurName()
    case 'Satyr':
      return generateSatyrName()
    case 'Relmer':
      return generateRelmerName()
    case 'Dweller':
      return generateDwellerName()
    case 'Alloyan':
      return generateAlloyanName()
    case 'Otherling':
      return generateOtherlingName()
    default:
      return generateMoniker()
  }
}

export function generateNameWithMoniker(raceName: string): string {
  if (Math.random() < 0.15) {
    return generateMoniker()
  }
  return generateName(raceName)
}
