type Experience = {
    starts_at: string;
    ends_at?: string | null;
    // ... other fields
  };
  
  export const calculateAverageTimeInRole = (experiences: Experience[]): string => {
    const totalDurations = experiences.map((experience) => {
      const startsAt = new Date(experience.starts_at);
      const endsAt = experience.ends_at ? new Date(experience.ends_at) : new Date();
  
      // Calculate the duration for each experience
      return endsAt.getTime() - startsAt.getTime();
    });
  
    const totalDurationInMilliseconds = totalDurations.reduce((total, duration) => total + duration, 0);
  
    // Calculate the average duration
    const averageDurationInMilliseconds = totalDurationInMilliseconds / experiences.length;
  
    // Convert the average duration to years and months
    const averageDurationInMonths = averageDurationInMilliseconds / (1000 * 60 * 60 * 24 * 30.44);
    const years = Math.floor(averageDurationInMonths / 12);
    const months = Math.floor(averageDurationInMonths % 12);
  
    return `${years} years, ${months} months`;
  };
  