// utils/profilePicColourCalculation.ts

export const calculateBorderColor = (stabilityScore: number): string => {
    // Normalize the stability score to be in the range [0, 1]
    const normalizedScore = Math.min(1, Math.max(0, stabilityScore / 100));
  
    // Interpolate color between bright red and bright orange (up to 100%)
    const red = [255, 0, 0]; // RGB values for bright red
    const orange = [255, 165, 0]; // RGB values for bright orange
  
    // Interpolate color between bright orange and bright green (from 50% to 0%)
    const green = [0, 255, 0]; // RGB values for bright green
  
    let interpolatedColor: number[];
  
    if (normalizedScore <= 0.5) {
      interpolatedColor = red.map((channel, i) => Math.round(channel + 2 * normalizedScore * (orange[i] - channel)));
    } else {
      interpolatedColor = orange.map((channel, i) => Math.round(channel + 2 * (normalizedScore - 0.5) * (green[i] - channel)));
    }
  
    return `rgb(${interpolatedColor.join(',')})`;
  };
  