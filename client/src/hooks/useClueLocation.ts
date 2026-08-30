import { useCallback, useEffect, useState } from 'react';

const fallback = { lat: 40.7128, lon: -74.006, simulated: true };
export function useClueLocation() {
  const [location, setLocation] = useState(fallback);
  const [status, setStatus] = useState<'requesting' | 'real' | 'simulated'>('requesting');
  const request = useCallback(() => {
    if (!navigator.geolocation) { setStatus('simulated'); return; }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { setLocation({ lat: coords.latitude, lon: coords.longitude, simulated: false }); setStatus('real'); },
      () => setStatus('simulated'), { enableHighAccuracy: true, timeout: 8_000, maximumAge: 60_000 },
    );
  }, []);
  useEffect(request, [request]);
  return { location, status, request };
}
