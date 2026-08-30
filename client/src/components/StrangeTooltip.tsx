import { CircleHelp } from 'lucide-react';
import { useState } from 'react';
export function StrangeTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return <span className="strange-tooltip"><button aria-label="Explain this clue operation" aria-expanded={open} onClick={() => setOpen(!open)}><CircleHelp size={18}/></button>{open && <span role="tooltip">{text}</span>}</span>;
}
