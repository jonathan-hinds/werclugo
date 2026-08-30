import { SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import { scannerEffects, usePreferencesStore } from '../../state/preferencesStore';
export function EffectDrawer() {
  const [open, setOpen] = useState(false); const { effects, toggleEffect } = usePreferencesStore();
  return <><button className="effect-handle" onClick={() => setOpen(true)}><SlidersHorizontal/> FILTER CONFUSION <b>{effects.length}</b></button>
    <aside className={`effect-drawer ${open ? 'open' : ''}`} aria-hidden={!open}><header><div><small>STACKABLE MISINTERPRETATION</small><h2>CLUE FILTERS</h2></div><button onClick={() => setOpen(false)} aria-label="Close clue filters"><X/></button></header><p>Filters may improve the clue by changing which visual facts are inconvenient.</p><div>{scannerEffects.map((effect) => <button key={effect} className={effects.includes(effect) ? 'active' : ''} onClick={() => toggleEffect(effect)}><i/>{effect}<span>{effects.includes(effect) ? 'APPLIED' : 'AVAILABLE'}</span></button>)}</div></aside>{open && <button className="drawer-scrim" aria-label="Close filter drawer" onClick={() => setOpen(false)}/>}</>;
}
