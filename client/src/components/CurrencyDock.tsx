import { motion } from 'framer-motion';
import { Coins, Diamond, Puzzle } from 'lucide-react';
import { useProfileStore } from '../state/profileStore';

export function CurrencyDock() {
  const profile = useProfileStore((state) => state.profile);
  if (!profile) return null;
  const values = [
    { label: 'CLUE COINS', value: profile.clueCoins, Icon: Coins },
    { label: 'PUZZLE POINTS', value: profile.puzzlePoints, Icon: Puzzle },
    { label: 'JICKER JIGS', value: profile.jickerJigs, Icon: Diamond },
  ];
  return <aside className="currency-dock" aria-label="Current clue balances">{values.map(({ label, value, Icon }) => <div className="currency-cell" key={label}><Icon aria-hidden size={16}/><small>{label}</small><motion.strong key={value} initial={{ scale: 1.8, color: '#fff' }} animate={{ scale: 1 }}>{value.toLocaleString()}</motion.strong></div>)}</aside>;
}
