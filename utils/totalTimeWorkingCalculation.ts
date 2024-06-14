type Experience = {
    starts_at: string;
    ends_at?: string | null;
    // Add other fields as needed
  };
  
  export const calculateTotalCombinedExperience = (experiences: Experience[]): string => {
    if (experiences.length === 0) {
      return 'No experience';
    }
  
    const currentDate = new Date();
  
    // Sort experiences by starts_at date in ascending order
    const sortedExperiences = experiences.slice().sort((a, b) => {
      const dateA = new Date(a.starts_at);
      const dateB = new Date(b.starts_at);
      return dateA.getTime() - dateB.getTime();
    });
  
    // Calculate the total combined experience without adding time for overlapping roles
    let totalCombinedExperienceInMilliseconds = 0;
  
    for (let i = 0; i < sortedExperiences.length; i++) {
      const startsAt = new Date(sortedExperiences[i].starts_at);
      const endsAt = new Date(sortedExperiences[i].ends_at ?? currentDate);
  
      // Check for overlapping roles and adjust the endsAt date accordingly
      for (let j = i + 1; j < sortedExperiences.length; j++) {
        const nextStartsAt = new Date(sortedExperiences[j].starts_at);
  
        if (nextStartsAt <= endsAt) {
          // Adjust endsAt to the start of the next experience if there is an overlap
          endsAt.setTime(nextStartsAt.getTime() - 1);
        } else {
          // No overlap, break the loop
          break;
        }
      }
  
      // Add the adjusted duration to the totalCombinedExperience
      totalCombinedExperienceInMilliseconds += endsAt.getTime() - startsAt.getTime();
    }
  
    // Convert the totalCombinedExperience to years and months
    const totalCombinedExperienceInMonths = totalCombinedExperienceInMilliseconds / (1000 * 60 * 60 * 24 * 30.44);
    const years = Math.floor(totalCombinedExperienceInMonths / 12);
    const months = Math.floor(totalCombinedExperienceInMonths % 12);
  
    return `${years} years, ${months} months`;
  };
  