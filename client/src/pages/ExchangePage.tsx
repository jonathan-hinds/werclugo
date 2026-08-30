import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDownUp, Gauge, ShieldAlert } from 'lucide-react';
import type { ExchangeOperation, UserProfile } from '@wurcluego/shared';
import { ECONOMY } from '../../../shared/src/constants';
import { api } from '../api/client';
import { GlitchButton } from '../components/GlitchButton';
import { StatusMarquee } from '../components/StatusMarquee';
import { StrangeTooltip } from '../components/StrangeTooltip';
import { messages, sample } from '../content/messages';
import { clueAudio } from '../services/audio';
import { useProfileStore } from '../state/profileStore';

const operations: { id: ExchangeOperation; title: string; formula: string; source: keyof UserProfile; danger?: boolean }[] = [
  { id: 'coins_to_points', title: 'Interpret Coins as Points', formula: `${ECONOMY.coinsPerPuzzlePoint} coins → 1 point`, source: 'clueCoins' },
  { id: 'jig_to_coins', title: 'Pulverize Jig into Coins', formula: `1 jig → ${ECONOMY.jigToCoins} coins`, source: 'jickerJigs', danger: true },
  { id: 'jig_to_points', title: 'Liquefy Jig into Points', formula: `1 jig → ${ECONOMY.jigToPuzzlePoints} points`, source: 'jickerJigs', danger: true },
  { id: 'points_to_jig_attempt', title: 'Buy Possible Jig Event', formula: `${ECONOMY.jigAttemptCost} points → 28% Jig attempt`, source: 'puzzlePoints' },
];

export default function ExchangePage() {
  const profile = useProfileStore((state) => state.profile)!; const setProfile = useProfileStore((state) => state.setProfile);
  const [operation, setOperation] = useState<ExchangeOperation>('coins_to_points'); const [amount, setAmount] = useState(5); const [stage, setStage] = useState<'idle' | 'prepared' | 'confirm-destructive'>('idle'); const [status, setStatus] = useState<string>(sample(messages.exchangeInstructions)); const [busy, setBusy] = useState(false);
  const chosen = operations.find(({ id }) => id === operation)!;
  const pressure = useMemo(() => Math.min(100, 16 + profile.clueCoins * .7 + profile.puzzlePoints * 1.3 + profile.jickerJigs * 9), [profile]);
  const prepare = () => { clueAudio.play('select'); setStage(chosen.danger ? 'confirm-destructive' : 'prepared'); setStatus(chosen.danger ? 'DESTRUCTIVE JIG INTERPRETATION REQUIRES MATERIAL CONFIRMATION.' : 'PREPARED. PREPARATION IS NOW AVAILABLE FOR EXCHANGE.'); };
  const execute = async () => { setBusy(true); setStatus('EXCHANGING PREPARED EXCHANGE THROUGH EXCHANGE...'); try { const result = await api<{ profile: UserProfile; acquiredJigs: number }>('/exchange', { method: 'POST', body: JSON.stringify({ operation, amount }) }); setProfile(result.profile); clueAudio.play(result.acquiredJigs ? 'jig' : 'coin'); setStatus(result.acquiredJigs ? `JIG ATTEMPTS CONCLUDED: ${result.acquiredJigs} HISTORICAL OCCURRENCES.` : 'YOUR MATERIAL HAS BEEN SUCCESSFULLY RE-INTERPRETED AS DIFFERENT MATERIAL.'); setStage('idle'); } catch (error) { clueAudio.play('error'); setStatus(error instanceof Error ? error.message : 'EXCHANGE EXCHANGED NOTHING'); } finally { setBusy(false); } };
  const spew = async () => { setBusy(true); for (const line of ['PURCHASE SPEW?', 'PREPARING GOBBLER.', 'GOBBLER PRESSURE NOMINAL.', 'SPEW PERMITTED.']) { setStatus(line); await new Promise((resolve) => setTimeout(resolve, 350)); } try { const result = await api<{ loot: { kind: string; amount: number; effect?: string }; profile: UserProfile }>('/gobbler/spew', { method: 'POST' }); setProfile(result.profile); clueAudio.play('spew'); setStatus(`SPEW VERIFIED: ${result.loot.kind.toUpperCase()} ${result.loot.amount || result.loot.effect || 'APPROXIMATELY'}`); } catch (error) { setStatus(error instanceof Error ? error.message : 'GOBBLER DECLINED LIQUIDITY'); } finally { setBusy(false); } };

  return <section className="exchange-page">
    <header className="page-title"><small>AUTHORIZED CIRCULAR ECONOMY TERMINAL</small><h1>THE CLUE<br/><em>EXCHANGE</em></h1><p>Exchange readiness does not imply readiness to exchange.</p></header>
    <StatusMarquee text={status}/>
    <div className="market-ticker"><span>CC/PZL ▲ 0.0004</span><span>JIG/MOIST ▼ 8.2</span><span>GOB/GBP SUSPENDED</span><span>CLUE PRESSURE {pressure.toFixed(1)}</span></div>
    <div className="exchange-grid">
      <aside className="operation-list" aria-label="Exchange operation"><small>01 / SELECT INTERPRETATION PATH</small>{operations.map((entry) => <button key={entry.id} className={operation === entry.id ? 'active' : ''} onClick={() => { setOperation(entry.id); setStage('idle'); setAmount(entry.id === 'coins_to_points' ? 5 : 1); }}><span>{entry.title}</span><b>{entry.formula}</b>{entry.danger && <ShieldAlert size={17}/>}</button>)}</aside>
      <div className="exchange-machine">
        <div className="pressure-gauge"><Gauge/><span><i style={{ transform: `rotate(${(-92 + pressure * 1.84)}deg)` }}/></span><b>{pressure.toFixed(0)}<small>% PRESSURE</small></b></div>
        <div className="amount-control"><label htmlFor="amount">02 / QUANTITY TO BECOME PREPARED</label><div><button onClick={() => setAmount(Math.max(1, amount - (operation === 'coins_to_points' ? 5 : 1)))}>-</button><input id="amount" type="number" min="1" max="100" step={operation === 'coins_to_points' ? 5 : 1} value={amount} onChange={(event) => { setAmount(Math.max(1, Number(event.target.value))); setStage('idle'); }}/><button onClick={() => setAmount(amount + (operation === 'coins_to_points' ? 5 : 1))}>+</button></div><p>AVAILABLE SOURCE UNITS: <b>{String(profile[chosen.source])}</b></p></div>
        <div className="exchange-arrow"><ArrowDownUp/><span>MEANINGLESS DIRECTIONALITY</span><ArrowDownUp/></div>
        <AnimatePresence mode="wait"><motion.div key={stage} className="exchange-action" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          {stage === 'idle' && <GlitchButton onClick={prepare} disabled={busy}>PREPARE EXCHANGE<small>THIS DOES NOT EXCHANGE</small></GlitchButton>}
          {stage === 'confirm-destructive' && <><p><ShieldAlert/> This permanently consumes {amount} Jicker Jig{amount === 1 ? '' : 's'} and their unlinked Big Clue material.</p><GlitchButton variant="danger" onClick={() => setStage('prepared')}>CONFIRM JIG CEASEMENT</GlitchButton><button className="text-button" onClick={() => setStage('idle')}>KEEP JIG PHYSICALLY JIG-LIKE</button></>}
          {stage === 'prepared' && <GlitchButton variant="danger" disabled={busy} onClick={() => void execute()}>{busy ? 'EXCHANGING EXCHANGE' : 'EXCHANGE PREPARED EXCHANGE'}<small>THE ACTUAL PART</small></GlitchButton>}
        </motion.div></AnimatePresence>
      </div>
    </div>
    <section className="spew-purchase"><div><small>ALTERNATIVE LIQUIDITY MECHANISM</small><h2>MAKE GOBBLER SPEW</h2><p>Cost: {ECONOMY.gobblerSpewCost} Puzzle Points. Outcome determined beyond this device.</p></div><GlitchButton variant="danger" disabled={busy} onClick={() => void spew()}>PURCHASE SPEW</GlitchButton></section>
    <div className="exchange-footnote"><StrangeTooltip text={sample(messages.exchangeInstructions)}/> REGULATION CC-14: Puzzle Points permit the Jig to become redeemably obtainable but do not require it to do so.</div>
  </section>;
}
