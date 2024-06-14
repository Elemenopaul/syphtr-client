const calculateStabilityScore = (profile: any, stableTenure: number) => {
  let totalExperienceTime = 0;
  let stableExperienceTime = 0;

  if (Array.isArray(profile.experiences)) {
    const experiencesByCompany = profile.experiences.reduce((acc: any, exp: any) => {
      if (!acc[exp.company]) {
        acc[exp.company] = [];
      }
      acc[exp.company].push(exp);
      return acc;
    }, {});

    Object.values(experiencesByCompany).forEach((experiences: any) => {
      const sortedExperiences = experiences.sort((a: any, b: any) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
      let currentStintStart = new Date(sortedExperiences[0].starts_at);
      let currentStintEnd = sortedExperiences[0].ends_at ? new Date(sortedExperiences[0].ends_at) : new Date();

      for (let i = 1; i < sortedExperiences.length; i++) {
        const experience = sortedExperiences[i];
        const experienceStart = new Date(experience.starts_at);
        const experienceEnd = experience.ends_at ? new Date(experience.ends_at) : new Date();

        if (experienceStart.getTime() - currentStintEnd.getTime() <= 1000 * 60 * 60 * 24 * 90) {
          currentStintEnd = new Date(Math.max(currentStintEnd.getTime(), experienceEnd.getTime()));
        } else {
          const diffTime = Math.abs(currentStintEnd.getTime() - currentStintStart.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          totalExperienceTime += diffDays;
          if (diffDays >= stableTenure * 365) { // Use stableTenure here
            stableExperienceTime += diffDays;
          }

          currentStintStart = experienceStart;
          currentStintEnd = experienceEnd;
        }
      }

      const diffTime = Math.abs(currentStintEnd.getTime() - currentStintStart.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      totalExperienceTime += diffDays;
      if (diffDays >= stableTenure * 365) { // Use stableTenure here
        stableExperienceTime += diffDays;
      }
    });
  }

  return totalExperienceTime ? (stableExperienceTime / totalExperienceTime) * 100 : 0;
};

export default calculateStabilityScore;