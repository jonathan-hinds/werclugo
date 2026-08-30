import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GlitchButton } from '../components/GlitchButton';
import { StatusMarquee } from '../components/StatusMarquee';
import { StrangeTooltip } from '../components/StrangeTooltip';
import { SystemReadings } from '../components/SystemReadings';
import { messages, sample } from '../content/messages';
import { clueAudio } from '../services/audio';
import { useProfileStore } from '../state/profileStore';
import { getUnlockState } from '../state/unlockMachine';

export function HomePage() {
  const navigate = useNavigate();
  const { profile, selectMode, choose } = useProfileStore();
  const [ceremony, setCeremony] = useState(profile?.modeUnlocked ? 'CHOSEN. SELECTION SUCCESSFULLY SELECTED.' : 'CLUE SYSTEM: POSSIBLY READY');
  const [busy, setBusy] = useState(false);
  if (!profile) return null;
  const unlockState = getUnlockState(profile.modeSelected, profile.modeUnlocked);
  const staged = unlockState !== 'awaiting-select'; const unlocked = unlockState === 'unlocked';

  const select = async () => {
    setBusy(true); clueAudio.play('select');
    for (const phrase of ['SELECTING SELECTION MODE', 'PRE-CHOOSING', 'MODE ACCEPTED PROVISIONALLY', 'SELECTION REQUIRES CHOICE']) { setCeremony(phrase); await new Promise((resolve) => setTimeout(resolve, 260)); }
    await selectMode(); setCeremony('CHOOSE HAS BECOME CHOOSABLE'); setBusy(false);
  };
  const chooseNow = async () => { setBusy(true); clueAudio.play('jig'); setCeremony('CHOOSING CHOSEN MODE'); await new Promise((resolve) => setTimeout(resolve, 650)); await choose(); setCeremony('CHOSEN. YOU MAY NOW CHOOSE A CLUE OPERATION.'); setBusy(false); };

  return <section className={`home-page ${unlocked ? 'is-unlocked' : ''}`}>
    <div className="hero-mark" aria-labelledby="app-title">
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>OFFICIAL PORTABLE CLUE INTERPRETATION SYSTEM</motion.p>
      <h1 id="app-title" data-ghost="WURCLUEGO">WURCLUEGO</h1><h2>GET A CLUE.</h2>
    </div>
    <StatusMarquee text={ceremony}/>
    <div className="instruction-strip"><span>PROCEDURE 0{unlocked ? '3' : staged ? '2' : '1'} / 03</span><p>{sample(messages.homeInstructions)}</p><StrangeTooltip text="Select is a mode. Choose is the permitted consequence of that mode. Features are neither until both."/></div>
    <motion.div className="action-matrix" animate={busy ? { x: [0, -4, 5, -2, 0] } : {}}>
      <GlitchButton disabled={!unlocked} onClick={() => navigate('/sniffer')} signal="SNIFF">CLUE SNIFFER<small>LOCATE WHAT MAY BE NEAR</small></GlitchButton>
      <GlitchButton disabled={!unlocked} onClick={() => navigate('/exchange')} signal="TRADE">THE CLUE EXCHANGE<small>ALTER ACCOUNTING MATERIALS</small></GlitchButton>
      <GlitchButton disabled={!unlocked} onClick={() => navigate('/big-clue')} signal="45M">THE BIG CLUE<small>0.000000% DEFINITELY BIG</small></GlitchButton>
      <div className="ceremony-row">
        <GlitchButton variant="secondary" disabled={busy} onClick={select}>SELECT MODE<small>{staged ? 'MODE REMAINS SELECTED' : 'REQUIRED FIRST'}</small></GlitchButton>
        <GlitchButton variant={staged ? 'danger' : 'void'} disabled={!staged || busy} onClick={chooseNow}>CHOOSE<small>{unlocked ? 'CHOOSE AGAIN IF NEEDED' : staged ? 'DRAMATICALLY AVAILABLE' : 'AWAITING SELECT'}</small></GlitchButton>
      </div>
    </motion.div>
    <SystemReadings />
  </section>;
}
