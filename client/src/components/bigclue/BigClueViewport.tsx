import { useRef, useState } from 'react';
import type { BigCluePieceDto } from '@wurcluego/shared';

export function BigClueViewport({ pieces, selected, onSelect }: { pieces: BigCluePieceDto[]; selected: string[]; onSelect: (pieceId: string) => void }) {
  const [view, setView] = useState({ x: 0, y: 0, scale: .85 }); const drag = useRef<{ x: number; y: number; vx: number; vy: number }>();
  const pointerDown = (event: React.PointerEvent) => { drag.current = { x: event.clientX, y: event.clientY, vx: view.x, vy: view.y }; event.currentTarget.setPointerCapture(event.pointerId); };
  const pointerMove = (event: React.PointerEvent) => { if (!drag.current) return; setView((current) => ({ ...current, x: drag.current!.vx + event.clientX - drag.current!.x, y: drag.current!.vy + event.clientY - drag.current!.y })); };
  return <div className="big-clue-viewport" onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={() => { drag.current = undefined; }} onWheel={(event) => setView((current) => ({ ...current, scale: Math.max(.4, Math.min(2.4, current.scale - event.deltaY * .001)) }))}>
    <div className="clue-space" style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}>
      {Array.from({ length: 28 }, (_, index) => <i key={`ghost-${index}`} className="ghost-piece" style={{ left: `${(index * 193) % 880 - 120}px`, top: `${(index * 117) % 620 - 80}px`, '--delay': `${index * -.17}s` } as React.CSSProperties}/>) }
      {pieces.map((piece, index) => <button key={piece.pieceId} className={`big-piece ${selected.includes(piece.pieceId) ? 'selected' : ''} ${piece.linked ? 'linked' : ''}`} style={{ left: `${270 + (index % 4) * 106 + piece.sequence % 7}px`, top: `${36 + Math.floor(index / 4) * 106 + piece.sequence % 9}px`, transform: `rotate(${(piece.weirdness - 50) / 8}deg)` }} onPointerDown={(event) => event.stopPropagation()} onClick={() => onSelect(piece.pieceId)}><span>{piece.pieceId.slice(-6)}</span><small>N{piece.connectors.north} E{piece.connectors.east}<br/>S{piece.connectors.south} W{piece.connectors.west}</small></button>)}
      {!pieces.length && <div className="empty-clue-space">NO PERSONAL JIG MATERIAL HAS BEEN DISCOVERED<br/><small>THE GLOBAL VOID REMAINS AVAILABLE</small></div>}
    </div>
    <div className="viewport-controls"><button onClick={() => setView((v) => ({ ...v, scale: Math.min(2.4, v.scale + .2) }))}>+</button><button onClick={() => setView({ x: 0, y: 0, scale: .85 })}>◎</button><button onClick={() => setView((v) => ({ ...v, scale: Math.max(.4, v.scale - .2) }))}>−</button></div>
  </div>;
}
