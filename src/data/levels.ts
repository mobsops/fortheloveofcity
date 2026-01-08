export interface Level {
  id: number;
  name: string;
  era: string;
  location: string;
  riddle: string;
  answerKeywords: string[];
  storyDecryption: string;
  fieldBonus: string;
}

export const LEVELS: Level[] = [
  {
    id: 1,
    name: "THE WHITE SEED",
    era: "1420s",
    location: "Spassky Cathedral (Andronikov Monastery)",
    riddle: "I stood before walls of red baked from clay. A fortress of monks where the great painter lay. Seek the white stone seed from which the city grew, on the banks of the Yauza, where history began anew.",
    answerKeywords: ["andronikov", "spassky", "rublev", "monastery"],
    storyDecryption: "Timeline Node 1 Identified. Before the Empire, this was a place of spirit. The timeline was pure here—faith was the shield. But you can see the cracks forming; the city needed walls to survive.",
    fieldBonus: "Visual confirmation of the 'Holy Arts' era acquired."
  },
  {
    id: 2,
    name: "THE TERRIBLE BIRTH",
    era: "1532",
    location: "Kolomenskoye",
    riddle: "I am a tent of stone, not canvas, reaching for the sky. Built to celebrate a birth that would make the boyars cry. On the high river bank, I broke the ancient rules, a summer tower for the Prince who played the nobles for fools.",
    answerKeywords: ["kolomenskoye", "ascension", "ivan"],
    storyDecryption: "Node 2 Identified. The timeline shifts from Faith to Power. This tower wasn't built for God, but for the birth of Ivan the Terrible. The city began to worship strength.",
    fieldBonus: "Atmospheric audio of the wind from the river acquired."
  },
  {
    id: 3,
    name: "THE LAST FLAME",
    era: "1652",
    location: "Church of the Nativity at Putinki",
    riddle: "My domes are clustered like tongues of frozen fire. I am the final breath of the style the Giant Tsar would retire. Find the snowy masterpiece near the poet's square, the last of the 'old way' before the West was there.",
    answerKeywords: ["nativity", "putinki", "pushkinskaya"],
    storyDecryption: "Node 3 Identified. The 'Identity Crisis.' This was the last time Moscow looked like itself before Peter the Great banned this style. The timeline fractures here: Appearance vs. Reality.",
    fieldBonus: "Unlocked the 'Lost Architecture' database."
  },
  {
    id: 4,
    name: "THE IMPERIAL HILL",
    era: "1786",
    location: "Pashkov House",
    riddle: "I am the white palace that dares to look down on the Red Wall. A monument to an Empress, the grandest of them all. The Devil once sat on my roof to watch the city burn, find the mansion where the pages of a million books turn.",
    answerKeywords: ["pashkov", "library", "mokhovaya"],
    storyDecryption: "Node 4 Identified. The 'Hubris' signal is strong. The nobility built this palace to look down on the Kremlin. This is the peak of the Empire—rich, cultured, and blind to the suffering below.",
    fieldBonus: "Visualizing the 'Great Fire' simulation from the roof."
  },
  {
    id: 5,
    name: "THE YELLOW FORTRESS",
    era: "1920s",
    location: "KGB Building (Lubyanka)",
    riddle: "My walls are yellow, but my history is black as night. I stand on a square where Iron Felix held the might. Men entered my heavy doors and vanished without a sound, to the deepest cellars in the city, hidden underground.",
    answerKeywords: ["kgb", "lubyanka", "fsb"],
    storyDecryption: "Node 5 Identified. The 'Terror' Protocol. The Hubris of the palace led to the basement of this fortress. The city stopped singing and started whispering. Trust was deleted from the city's code.",
    fieldBonus: "Recovered deleted citizen files (Audio Logs)."
  },
  {
    id: 6,
    name: "THE MARBLE GANGSTERS",
    era: "1990s",
    location: "Vagankovskoye Cemetery",
    riddle: "Here lies the chaos of the decade when the Union fell. Where bandits in marble suits have a story to tell. Holding car keys of stone in a permanent pose, walk the avenue of the Brothers where the wild weed grows.",
    answerKeywords: ["vagankovskoye", "cemetery", "presnya"],
    storyDecryption: "Node 6 Identified. The 'Chaos' Era. When the State collapsed, violence filled the vacuum. These marble graves show where the 'Strong' took what they wanted. Lawlessness became the new law.",
    fieldBonus: "Unlocked 'The Wild 90s' newsreel archive."
  },
  {
    id: 7,
    name: "THE GLASS PRISM",
    era: "Future",
    location: "Federation Tower (Moscow City)",
    riddle: "I have no memory, only height and cold blue skin. A shard of glass where the new oil empires begin. Leave the earth behind and pierce the clouds above, in the city of vertical lights, void of history and love.",
    answerKeywords: ["federation", "moscow city", "vostok"],
    storyDecryption: "Node 7 Identified. The Vertical City. High, beautiful, but disconnected from the earth. We have arrived at the result. By mapping the fractures of the past, we ensure this glass does not shatter.",
    fieldBonus: "Agent Promotion: 'Guardian of the Timeline' Badge."
  }
];

export const REQUIRED_STABILITY = 4.0;
export const DECRYPTION_POINTS = 0.5;
export const EXTRACTION_POINTS = 0.5;
