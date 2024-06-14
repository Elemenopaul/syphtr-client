// standardDeviation.ts

export const calculateStandardDeviation = (durations: number[]): number => {
    if (durations.length <= 1) {
      return 0;
    }
  
    const mean = durations.reduce((sum, duration) => sum + duration, 0) / durations.length;
  
    const squaredDifferences = durations.map((duration) => Math.pow(duration - mean, 2));
    const variance = squaredDifferences.reduce((sum, squaredDiff) => sum + squaredDiff, 0) / durations.length;
  
    const standardDeviation = Math.sqrt(variance);
  
    return standardDeviation;
  };
  