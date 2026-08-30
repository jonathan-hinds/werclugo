import { useMemo } from 'react';
export function SystemReadings() {
  const readings = useMemo(() => [
    ['CLUE PRESSURE', `${47 + Math.floor(Math.random() * 39)} kSNF`], ['GOBBLER PROXIMITY', `${Math.floor(Math.random() * 900) + 100} GRIM`],
    ['JIG INDEX', `0.${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`], ['CHOICE CONFIDENCE', `${61 + Math.floor(Math.random() * 31)}%?`],
  ], []);
  return <div className="system-readings">{readings.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong><i /></div>)}</div>;
}
