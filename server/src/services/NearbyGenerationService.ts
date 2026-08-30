import { createHash, createHmac } from 'crypto';
import { LOCATION_CELL_PRECISION, NEARBY_TIME_WINDOW_MS, type NearbyItem } from '@wurcluego/shared';

export class NearbyGenerationService {
  constructor(private readonly secret: string) {}

  cellFor(lat: number, lon: number): string {
    const qLat = Math.round(lat / LOCATION_CELL_PRECISION) * LOCATION_CELL_PRECISION;
    const qLon = Math.round(lon / LOCATION_CELL_PRECISION) * LOCATION_CELL_PRECISION;
    return `${qLat.toFixed(3)}:${qLon.toFixed(3)}`;
  }

  generate(lat: number, lon: number, at = Date.now()): NearbyItem[] {
    const cellId = this.cellFor(lat, lon);
    const window = Math.floor(at / NEARBY_TIME_WINDOW_MS);
    const seed = createHash('sha256').update(`${this.secret}:${cellId}:${window}`).digest();
    const jigIndex = seed[0] % 10;
    return Array.from({ length: 10 }, (_, index) => {
      const offset = index * 3 + 1;
      const type = index === jigIndex ? 'jig' as const : 'coin' as const;
      const unsigned = `${cellId}|${window}|${index}|${type}`;
      const signature = createHmac('sha256', this.secret).update(unsigned).digest('hex').slice(0, 20);
      return {
        id: `${window}.${index}.${type}.${signature}`,
        type,
        distanceMeters: 8 + (seed[offset % seed.length] / 255) * 82,
        bearing: (seed[(offset + 1) % seed.length] / 255) * 360,
        altitude: -12 + (seed[(offset + 2) % seed.length] / 255) * 34,
        rarity: type === 'jig' ? 'historical' : (index % 4 === 0 ? 'worrying' : 'ordinary'),
        cellId,
        window,
      };
    });
  }

  verify(itemId: string, lat: number, lon: number, now = Date.now()): NearbyItem | undefined {
    const current = Math.floor(now / NEARBY_TIME_WINDOW_MS);
    for (const window of [current, current - 1]) {
      const match = this.generate(lat, lon, window * NEARBY_TIME_WINDOW_MS + 1).find((item) => item.id === itemId);
      if (match) return match;
    }
    return undefined;
  }
}
