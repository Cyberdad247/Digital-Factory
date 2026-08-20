/**
 * Constrained static resource allocation baseline for sandbox isolation.
 * No continuous background animations or CPU-wasting loops.
 */
export function useWorkcellMetrics() {
  return [
    { time: 'T-0', cpu: 22, memory: 180 },
    { time: 'T-1', cpu: 25, memory: 210 }
  ];
}
