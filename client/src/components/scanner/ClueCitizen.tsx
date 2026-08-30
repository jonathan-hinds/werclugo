import { useEffect, useState } from 'react';
import { messages, sample } from '../../content/messages';
export function ClueCitizen() {
  const [citizen, setCitizen] = useState(() => Math.floor(Math.random() * 3));
  const [speech, setSpeech] = useState(() => sample(messages.citizenDialogue));
  useEffect(() => { const timer = window.setInterval(() => { setCitizen(Math.floor(Math.random() * 3)); setSpeech(sample(messages.citizenDialogue)); }, 11_000); return () => clearInterval(timer); }, []);
  return <div className={`clue-citizen citizen-${citizen}`}><div className="citizen-sprite" role="img" aria-label="A Clue Citizen watches the scan"/><p>{speech}</p><span>CITIZEN SIGNAL {citizen + 17}</span></div>;
}
