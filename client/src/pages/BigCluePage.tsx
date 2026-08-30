import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Network, Unplug } from 'lucide-react';
import type { BigCluePieceDto, UserProfile } from '@wurcluego/shared';
import { api } from '../api/client';
import { BigClueViewport } from '../components/bigclue/BigClueViewport';
import { GlitchButton } from '../components/GlitchButton';
import { StatusMarquee } from '../components/StatusMarquee';
import { messages, sample } from '../content/messages';
import { clueAudio } from '../services/audio';
import { useProfileStore } from '../state/profileStore';

interface ClueStatus { totalPieces: number; discovered: number; linked: number; percentage: number; coherence: number }
export default function BigCluePage() {
  const [status, setStatus] = useState<ClueStatus | null>(null); const [pieces, setPieces] = useState<BigCluePieceDto[]>([]); const [selected, setSelected] = useState<string[]>([]); const [message, setMessage] = useState<string>(sample(messages.bigClueMessages)); const [busy, setBusy] = useState(false); const setProfile = useProfileStore((state) => state.setProfile);
  const load = () => Promise.all([api<ClueStatus>('/big-clue/status'), api<{ pieces: BigCluePieceDto[] }>('/big-clue/pieces')]).then(([world, personal]) => { setStatus(world); setPieces(personal.pieces); }).catch((error: Error) => setMessage(error.message));
  useEffect(() => { void load(); }, []);
  const select = (pieceId: string) => setSelected((current) => current.includes(pieceId) ? current.filter((id) => id !== pieceId) : [...current, pieceId].slice(-2));
  const link = async () => { if (selected.length !== 2) return; setBusy(true); setMessage('NEGOTIATING CONNECTOR TEMPERATURES ACROSS THE GLOBAL JIG...'); try { const result = await api<{ linked: boolean; reason?: string; reward?: number; profile?: UserProfile }>('/big-clue/link', { method: 'POST', body: JSON.stringify({ firstId: selected[0], secondId: selected[1] }) }); if (result.linked) { clueAudio.play('link'); setMessage(`ADJACENCY RATIFIED. ${result.reward} CLUE COINS ISSUED FOR STRUCTURAL BRAVERY.`); if (result.profile) setProfile(result.profile); setSelected([]); await load(); } else { clueAudio.play('error'); setMessage(`LINK REJECTED: ${result.reason}. ROTATION REMAINS THEORETICAL.`); } } catch (error) { setMessage(error instanceof Error ? error.message : 'THE BIG CLUE DISAGREED WITHOUT EXPLANATION'); } finally { setBusy(false); } };
  const pct = status?.percentage ?? 0;
  return <section className="big-clue-page">
    <header className="big-clue-header"><div><small>COLLABORATIVE OBJECT / INSUFFICIENTLY RESOLVED</small><h1>THE<br/><em>BIG CLUE</em></h1></div><div className="global-count"><strong>{(status?.totalPieces ?? 45_000_000).toLocaleString()}</strong><span>APPROVED PIECES</span></div></header>
    <StatusMarquee text={message}/>
    <div className="global-progress"><div><span>GLOBAL CLUE COMPLETION</span><b>{pct.toFixed(6)}% CLUED</b></div><i><motion.span initial={{ width: 0 }} animate={{ width: `${Math.max(.3, Math.min(100, pct))}%` }}/></i><footer><span>{status?.discovered.toLocaleString() ?? '—'} DISCOVERED</span><span>{status?.linked.toLocaleString() ?? '—'} LINKED</span><span>{status?.coherence.toFixed(2) ?? '—'} COHERENCE</span></footer></div>
    <BigClueViewport pieces={pieces} selected={selected} onSelect={select}/>
    <section className="link-console"><div><small>LOCAL ADJACENCY AUTHORITY</small><h2>{selected.length === 2 ? 'TWO JIGS ARE PROVISIONALLY BESIDE' : `${2 - selected.length} MORE JIG${selected.length ? '' : 'S'} REQUIRED`}</h2><p>Select two personal unlinked pieces. East and west signatures will be privately compared by the global apparatus.</p></div><div className="selected-jigs">{[0, 1].map((slot) => <span key={slot}>{selected[slot] ? <><Network/> {selected[slot]}</> : <><Unplug/> UNSELECTED JIG</>}</span>)}</div><GlitchButton disabled={selected.length !== 2 || busy} onClick={() => void link()}>{busy ? 'LINKING THE UNLINKED' : 'ATTEMPT PROCEDURAL ADJACENCY'}</GlitchButton></section>
  </section>;
}
