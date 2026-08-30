import { motion } from 'framer-motion';
import { Crosshair, Droplets } from 'lucide-react';
import type { NearbyItem } from '@wurcluego/shared';
import { GlitchButton } from '../GlitchButton';

export interface GobblerState { encounterId: string; target: NearbyItem; progress: number; stunnedUntil: number; status: string }
export function GobblerEncounter({ state, firing, onFire, onSpew }: { state: GobblerState; firing: boolean; onFire: () => void; onSpew: () => void }) {
  const stunned = state.stunnedUntil > Date.now();
  return <motion.section className={`gobbler-encounter ${stunned ? 'stunned' : ''}`} initial={{ scale: 0, rotate: -12 }} animate={{ scale: 1, rotate: stunned ? [0, -3, 3, 0] : 0 }} aria-live="assertive">
    <div className="gobbler-visual"><div className="gobbler-head"><i/><b>£</b><em/></div><div className="gobbler-route" style={{ '--gobble-progress': `${state.progress}%` } as React.CSSProperties}><span/><i/></div></div>
    <div className="gobbler-copy"><small>RIGHT GRIMY OLD GIT / TARGET LOCK</small><h2>{stunned ? 'GOBBLER HORIZONTALLY CORRECTED' : 'CLUE GOBBLER INBOUND'}</h2><p>Target: {state.target.type === 'jig' ? 'HISTORIC JICKER JIG' : 'unprotected Clue Coin'} · appetite {Math.round(state.progress)}%</p></div>
    <div className="gobbler-actions"><GlitchButton variant="danger" disabled={firing} onClick={onFire}><Crosshair/> {firing ? 'BALL IN FLIGHT' : 'FIRE BLASTER BALL'}</GlitchButton><GlitchButton variant="secondary" onClick={onSpew}><Droplets/> REQUEST SPEW</GlitchButton></div>
  </motion.section>;
}
