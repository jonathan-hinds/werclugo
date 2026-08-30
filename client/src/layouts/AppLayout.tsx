import { Home, Volume2, VolumeX } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { CurrencyDock } from '../components/CurrencyDock';
import { usePreferencesStore } from '../state/preferencesStore';
import { clueAudio } from '../services/audio';

export function AppLayout() {
  const location = useLocation();
  const { muted, toggleMute } = usePreferencesStore();
  const onMute = () => { toggleMute(); clueAudio.setMuted(!muted); };
  return <div className="app-shell">
    <div className="noise" aria-hidden />
    <header className="app-header">
      {location.pathname !== '/' ? <Link className="home-switch" to="/" aria-label="Return to Wurcluego home"><Home/><span>RE-ORIENT</span></Link> : <span className="seal">WC-45M</span>}
      <div className="mini-brand"><b>WURCLUEGO</b><small>GET A CLUE.</small></div>
      <button className="mute-switch" onClick={onMute} aria-label={muted ? 'Enable clue sounds' : 'Mute clue sounds'}>{muted ? <VolumeX/> : <Volume2/>}</button>
    </header>
    <main><Outlet /></main>
    <CurrencyDock />
  </div>;
}
