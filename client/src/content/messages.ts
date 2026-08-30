export const messages = {
  homeInstructions: [
    'First choose Select. Next select Choose. Once Choose has been selected you may choose your selected selection.',
    'Selection cannot begin until selection mode has been selected for choosing.',
    'Do not choose Select after choosing unless a prior selection remains provisionally unchosen.',
    'The operational menu is awaiting the ceremonial ordering of two ordinary verbs.',
  ],
  scannerWarnings: [
    'Clues detected may or may not correspond to currently detectable clues.',
    'Nearby clue humidity has exceeded indoor limits.',
    'The Sniffer cannot guarantee sniffability beyond ninety-one point four four metres.',
    'Hold the apparatus toward whichever direction appears most directional.',
    'Location is being interpreted coarsely and immediately forgotten.',
  ],
  gobblerMessages: [
    'THE GOBBLER IS BETWEEN CLUES.', 'A RIGHT GRIMY OLD GIT HAS ENTERED THE RADIUS.',
    'Do not permit direct Jig contact.', 'Gobbler intent: financially damp.', 'Blaster Balls are non-firearm spherical correction units.',
  ],
  exchangeInstructions: [
    'Do not exchange before exchanging unless exchange has already been selected.',
    'Your Clue Coin may be interpreted as a fractional Puzzle Point after preparation.',
    'Puzzle Points do not represent puzzle completion.',
    'All arrows indicate a direction; none promise improvement.',
    'Exchange readiness is calculated from pressure, confidence, and button availability.',
  ],
  bigClueMessages: [
    'The Big Clue currently remains mostly Big.', 'Global clue coherence is improving without becoming helpful.',
    'Large portions remain aggressively unresolved.', 'This Jicker Jig may belong somewhere.',
    'Adjacency is a privilege, not an orientation.', 'Forty-five million is the approved amount of clue.',
  ],
  loadingMessages: ['Pre-sniffing...', 'Checking clue humidity...', 'Consulting the jig...', 'Gobbler-proofing...', 'Interpreting selection...', 'Normalizing clue pressure...', 'Re-selecting prior choice...'],
  coinMessages: ['CLUE ACQUIRED', 'COIN CONTAINS APPROXIMATELY ONE CLUE UNIT', 'CLUE VALUE: COIN', 'THIS CLUE IS NOT THE BIG CLUE', 'CURRENCY SUCCESSFULLY SNIFFED'],
  citizenDialogue: ['The clue is generally ahead.', 'I exchanged mine before I had it.', 'Choose wisely after selecting.', 'That Gobbler owes me six.', 'My Jig was municipal.', 'The radar is wetter over there.', 'I have been provisionally helpful.'],
  errors: ['MAJOR CLUE DISCREPANCY', 'CLUE NOT PRESENT', 'OPERATION NON-CLUE-COMPLIANT'],
} as const;

export function sample<T>(items: readonly T[]): T { return items[Math.floor(Math.random() * items.length)]; }
