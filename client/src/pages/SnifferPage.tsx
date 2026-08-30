import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Compass, LocateFixed, Radio, Zap } from 'lucide-react';
import type { NearbyItem, UserProfile } from '@wurcluego/shared';
import { api } from '../api/client';
import { GlitchButton } from '../components/GlitchButton';
import { StatusMarquee } from '../components/StatusMarquee';
import { ClueCitizen } from '../components/scanner/ClueCitizen';
import { EffectDrawer } from '../components/scanner/EffectDrawer';
import { GobblerEncounter, type GobblerState } from '../components/scanner/GobblerEncounter';
import { ScannerScene } from '../components/scanner/ScannerScene';
import { messages, sample } from '../content/messages';
import { useClueLocation } from '../hooks/useClueLocation';
import { clueAudio } from '../services/audio';
import { usePreferencesStore } from '../state/preferencesStore';
import { useProfileStore } from '../state/profileStore';

interface NearbyResponse { items: NearbyItem[]; radiusMeters: number }
export default function SnifferPage() {
  const { location, status: locationStatus } = useClueLocation();
  const { effects } = usePreferencesStore(); const setProfile = useProfileStore((state) => state.setProfile); const profile = useProfileStore((state) => state.profile)!;
  const [items, setItems] = useState<NearbyItem[]>([]); const [loading, setLoading] = useState(true); const [alert, setAlert] = useState<string>(sample(messages.scannerWarnings));
  const [cameraStatus, setCameraStatus] = useState<'idle' | 'active' | 'fallback'>('idle'); const video = useRef<HTMLVideoElement>(null); const stream = useRef<MediaStream>();
  const [heading, setHeading] = useState(0); const [gobbler, setGobbler] = useState<GobblerState | null>(null); const [firing, setFiring] = useState(false); const [spewStage, setSpewStage] = useState('');
  const encounterCount = useRef(0);

  useEffect(() => { let active = true; setLoading(true); api<NearbyResponse>(`/sniffer/nearby?lat=${location.lat}&lon=${location.lon}`).then((data) => { if (active) { setItems(data.items); setLoading(false); } }).catch((error: Error) => { setAlert(error.message); setLoading(false); }); return () => { active = false; }; }, [location.lat, location.lon]);
  useEffect(() => { const handler = (event: DeviceOrientationEvent) => { if (event.alpha !== null) setHeading(event.alpha); }; window.addEventListener('deviceorientation', handler); return () => window.removeEventListener('deviceorientation', handler); }, []);
  useEffect(() => () => { stream.current?.getTracks().forEach((track) => track.stop()); }, []);

  const startCamera = async () => { clueAudio.unlock(); try { const next = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } }, audio: false }); stream.current = next; if (video.current) { video.current.srcObject = next; await video.current.play(); } setCameraStatus('active'); } catch { setCameraStatus('fallback'); setAlert('OPTICAL SNIFF DECLINED. SYNTHETIC SIGHT HAS ASSUMED RESPONSIBILITY.'); } };
  const calibrate = async () => { const Orientation = DeviceOrientationEvent as typeof DeviceOrientationEvent & { requestPermission?: () => Promise<string> }; if (Orientation.requestPermission) await Orientation.requestPermission().catch(() => 'denied'); setAlert('COMPASS HAS BEEN INFORMED OF DIRECTION.'); };
  const collect = useCallback(async (item: NearbyItem) => {
    try { clueAudio.play(item.type === 'jig' ? 'jig' : 'coin'); const result = await api<{ profile: UserProfile }>(`/sniffer/collect`, { method: 'POST', body: JSON.stringify({ itemId: item.id, lat: location.lat, lon: location.lon }) }); setProfile(result.profile); setItems((current) => current.filter(({ id }) => id !== item.id)); if (gobbler?.target.id === item.id) setGobbler(null); setAlert(item.type === 'jig' ? 'JICKER JIG DETECTED. LOCAL HISTORY HAS OCCURRED.' : sample(messages.coinMessages)); navigator.vibrate?.(item.type === 'jig' ? [80, 40, 160, 40, 220] : 45); } catch (error) { clueAudio.play('error'); setAlert(error instanceof Error ? error.message : 'COLLECTION BECAME UNCOLLECTABLE'); }
  }, [gobbler?.target.id, location.lat, location.lon, setProfile]);

  useEffect(() => { if (!items.length || gobbler) return; const delay = encounterCount.current === 0 ? 8_000 + Math.random() * 4_000 : 60_000 + Math.random() * 60_000; const timer = window.setTimeout(() => { const target = items[Math.floor(Math.random() * items.length)]; api<{ encounter: { encounterId: string } }>('/gobbler/start', { method: 'POST', body: JSON.stringify({ targetItemId: target.id, targetType: target.type }) }).then(({ encounter }) => { encounterCount.current += 1; clueAudio.play('gobbler'); setGobbler({ encounterId: encounter.encounterId, target, progress: 3, stunnedUntil: 0, status: 'active' }); setAlert(sample(messages.gobblerMessages)); }).catch(() => undefined); }, delay); return () => clearTimeout(timer); }, [items, gobbler]);
  useEffect(() => { if (!gobbler) return; const timer = window.setInterval(() => setGobbler((current) => { if (!current || current.status === 'gobbling' || current.stunnedUntil > Date.now()) return current; if (current.progress >= 100) { void api<{ gobbled: boolean }>('/gobbler/gobble', { method: 'POST', body: JSON.stringify({ encounterId: current.encounterId }) }).then(({ gobbled }) => { if (gobbled) { setItems((all) => all.filter(({ id }) => id !== current.target.id)); setAlert('GOBBLER THEFT COMPLETE. THE CLUE IS NOW INTERNALLY DISGUSTING.'); } }).finally(() => setGobbler(null)); return { ...current, status: 'gobbling' }; } return { ...current, progress: current.progress + 2.1 }; }), 300); return () => clearInterval(timer); }, [gobbler?.encounterId]);
  const fire = async () => { if (!gobbler) return; setFiring(true); clueAudio.play('blast'); navigator.vibrate?.([20, 20, 60]); try { const result = await api<{ blasterBalls: number }>('/gobbler/fire', { method: 'POST', body: JSON.stringify({ encounterId: gobbler.encounterId }) }); setGobbler({ ...gobbler, stunnedUntil: Date.now() + 4_000, status: 'stunned' }); setProfile({ ...profile, blasterBalls: result.blasterBalls }); setAlert('BLASTER BALL SUCCESSFULLY EXPLAINED TO GOBBLER.'); } catch (error) { setAlert(error instanceof Error ? error.message : 'BALLISTICS UNAVAILABLE'); } finally { setFiring(false); } };
  const spew = async () => { for (const stage of ['PURCHASE SPEW?', 'PREPARING GOBBLER.', 'GOBBLER PRESSURE NOMINAL.', 'SPEW PERMITTED.']) { setSpewStage(stage); await new Promise((resolve) => setTimeout(resolve, 420)); } try { clueAudio.play('spew'); const result = await api<{ loot: { kind: string; amount: number }; profile: UserProfile }>('/gobbler/spew', { method: 'POST' }); setProfile(result.profile); setAlert(`GOBBLER SPEW RESULT: ${result.loot.kind.toUpperCase()} × ${result.loot.amount}`); } catch (error) { setAlert(error instanceof Error ? error.message : 'SPEW WAS NOT FINANCIALLY PERMITTED'); } finally { setSpewStage(''); } };
  const devGrant = async (grant: { clueCoins?: number; puzzlePoints?: number; jickerJigs?: number }) => { try { const result = await api<{ profile: UserProfile }>('/dev/grant', { method: 'POST', body: JSON.stringify({ clueCoins: 0, puzzlePoints: 0, jickerJigs: 0, ...grant }) }); setProfile(result.profile); setAlert('DEVELOPMENT MATERIAL HAS BEEN UNOFFICIALLY CERTIFIED.'); } catch (error) { setAlert(error instanceof Error ? error.message : 'DEVELOPMENT AUTHORITY UNAVAILABLE'); } };
  const forceGobbler = async () => { if (gobbler || !items.length) return; const target = items[0]; try { const { encounter } = await api<{ encounter: { encounterId: string } }>('/gobbler/start', { method: 'POST', body: JSON.stringify({ targetItemId: target.id, targetType: target.type }) }); encounterCount.current += 1; setGobbler({ encounterId: encounter.encounterId, target, progress: 3, stunnedUntil: 0, status: 'active' }); setAlert('DEVELOPMENT GOBBLER HAS BEEN FORCEFULLY SCHEDULED.'); } catch (error) { setAlert(error instanceof Error ? error.message : 'FORCED GRIME WAS REJECTED'); } };
  const filterClass = useMemo(() => effects.map((effect) => `fx-${effect.toLowerCase().replaceAll(' ', '-')}`).join(' '), [effects]);

  return <section className={`sniffer-page ${filterClass}`}>
    <div className="scanner-toolbar"><div><small>CLUE SNIFFER / CELL ACTIVE</small><strong><Radio/> {locationStatus === 'real' ? 'GEO CLUE LOCK' : 'SIMULATED DISTRICT'}</strong></div><span><LocateFixed/> 100 yd</span><span><Zap/> {profile.blasterBalls} BALLS</span></div>
    <StatusMarquee text={alert}/>
    <div className="scanner-viewport">
      <video ref={video} muted playsInline className={cameraStatus === 'active' ? 'camera-feed active' : 'camera-feed'}/><div className="fallback-field"><ScannerScene effects={effects}/></div>
      <div className="scanlines"/><div className="radar-ring"><i/><b>0°</b><span>CLUE RADIUS</span></div>
      <ClueCitizen/>
      <div className="scanner-items" aria-label="Detected nearby clues"><AnimatePresence>{items.map((item, index) => { const relative = ((item.bearing - heading + 540) % 360) - 180; const laneOffset = ((index % 3) - 1) * 7; const x = 50 + Math.max(-40, Math.min(40, relative / 2.5 + laneOffset)); const y = 66 - Math.min(43, item.distanceMeters / 2.25) + (index % 2) * 5; return <motion.button key={item.id} className={`scanner-object ${item.type}`} style={{ left: `${x}%`, top: `${y}%` }} initial={{ scale: 0 }} animate={{ scale: 1, y: [0, -5, 0] }} exit={{ scale: 2.5, opacity: 0 }} onClick={() => void collect(item)} aria-label={`Collect ${item.type === 'jig' ? 'rare Jicker Jig' : 'Clue Coin'}, ${Math.round(item.distanceMeters)} meters`}><i>{item.type === 'jig' ? '◆' : '?'}</i><span>{item.type === 'jig' ? 'JICKER JIG' : 'CLUE COIN'}<small>{Math.round(item.distanceMeters)}m / {Math.round(item.bearing)}°</small></span></motion.button>; })}</AnimatePresence></div>
      {loading && <div className="scanner-loading">SNIFFING CELL<br/><small>INTERPRETING LOCAL CLUE HUMIDITY</small></div>}
      {cameraStatus !== 'active' && <div className="permission-dock"><GlitchButton onClick={() => void startCamera()}><Camera/> ENABLE OPTICAL SNIFF</GlitchButton><GlitchButton variant="secondary" onClick={() => void calibrate()}><Compass/> CALIBRATE</GlitchButton></div>}
    </div>
    {spewStage && <motion.div className="spew-stage" initial={{ scale: 0 }} animate={{ scale: 1 }}>{spewStage}</motion.div>}
    {gobbler && <GobblerEncounter state={gobbler} firing={firing} onFire={() => void fire()} onSpew={() => void spew()}/>} 
    <div className="scanner-telemetry"><span>HEADING <b>{Math.round(heading).toString().padStart(3, '0')}°</b></span><span>VISIBLE <b>{items.length}</b></span><span>FILTERS <b>{effects.length}</b></span><span>JIG PHASE <b>{items.some((item) => item.type === 'jig') ? 'UNSAFE' : 'DRY'}</b></span></div>
    {import.meta.env.DEV && <aside className="dev-panel"><strong>NON-PRODUCTION CLUE AUTHORITY</strong><button onClick={() => void devGrant({ clueCoins: 50 })}>+50 COINS</button><button onClick={() => void devGrant({ puzzlePoints: 50 })}>+50 POINTS</button><button onClick={() => void devGrant({ jickerJigs: 1 })}>MATERIALIZE JIG</button><button disabled={Boolean(gobbler) || !items.length} onClick={() => void forceGobbler()}>FORCE GOBBLER</button></aside>}
    <EffectDrawer/>
  </section>;
}
