type Experience = {
    starts_at: string;
    ends_at?: string | null;
    // Add other fields as needed
  };
  
  export const calculateTotalExperience = (experiences: Experience[]): string => {
    if (experiences.length === 0) {
      return 'No experience';
    }
  
    const currentDate = new Date();
  
    // Find the earliest starts_at date
    const earliestStartsAt = experiences.reduce((earliest, experience) => {
      const startsAt = new Date(experience.starts_at);
      return startsAt < earliest ? startsAt : earliest;
    }, new Date(currentDate));
  
    // Calculate the totalExperience as the difference between the earliest starts_at date and today's date
    const totalExperienceInMilliseconds = currentDate.getTime() - earliestStartsAt.getTime();
  
    // Convert the totalExperience to years and months
    const totalExperienceInMonths = totalExperienceInMilliseconds / (1000 * 60 * 60 * 24 * 30.44);
    const years = Math.floor(totalExperienceInMonths / 12);
    const months = Math.floor(totalExperienceInMonths % 12);
  
    return `${years} years, ${months} months`;
  };
  