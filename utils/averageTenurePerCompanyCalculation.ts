type Experience = {
  starts_at: string;
  ends_at?: string | null;
  company: string;
  // ... other fields
};

export const calculateAverageTimeInCompany = (experiences: Experience[]): { average: string; standardDeviation: number } => {
  const totalDurations: { [key: string]: number } = {};
  const uniqueCompanies: Set<string> = new Set();
  const durations: number[] = [];

  experiences.forEach((experience) => {
    const company = experience.company || 'Unknown';
    const startsAt = new Date(experience.starts_at);
    const endsAt = experience.ends_at ? new Date(experience.ends_at) : new Date();

    const durationInMonths = (endsAt.getTime() - startsAt.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
    durations.push(durationInMonths); // Collect durations for standard deviation calculation

    if (totalDurations[company]) {
      totalDurations[company] += durationInMonths;
    } else {
      totalDurations[company] = durationInMonths;
      uniqueCompanies.add(company);
    }
  });

  const totalCompanies = uniqueCompanies.size;

  if (totalCompanies === 0) {
    return { average: 'No experiences to calculate', standardDeviation: 0 };
  }

  const totalDuration = Object.values(totalDurations).reduce((total, duration) => total + duration, 0);
  const averageDuration = totalDuration / totalCompanies;

  // Calculate standard deviation
  const squaredDifferences = durations.map((duration) => Math.pow(duration - averageDuration, 2));
  const variance = squaredDifferences.reduce((total, squaredDiff) => total + squaredDiff, 0) / totalCompanies;
  const standardDeviation = Math.sqrt(variance);

  // Normalize standard deviation to a score between 0 and 1
  const maxDeviation = 48; // This value may need adjustment based on your specific use case
  const deviationScore = 1 - Math.min(1, standardDeviation / maxDeviation);

  return {
    average: `${Math.floor(averageDuration / 12)} years, ${Math.round(averageDuration % 12)} months`,
    standardDeviation: deviationScore,
  };
};
