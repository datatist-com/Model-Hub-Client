export type LiftRow = { rank: number; liftValue: number; cumLiftValue: number };

export function generateLiftData(count: number, baseLift: number): LiftRow[] {
  let cumSum = 0;
  return Array.from({ length: count }, (_, i) => {
    const rank = i + 1;
    const decay = Math.pow(0.92, i);
    const lift = +(baseLift * decay + (Math.random() - 0.5) * 0.1).toFixed(2);
    const liftValue = Math.max(lift, 0.5);
    cumSum += liftValue;
    const cumLiftValue = +(cumSum / rank).toFixed(2);
    return { rank, liftValue, cumLiftValue };
  });
}
