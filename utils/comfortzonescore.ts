// Function to calculate the comfort zone score
export const calculateComfortZoneScore = (experiences: Array<{ company: string; starts_at: string; ends_at?: string | null }>, comfortZoneThreshold: number): number => {
    // Initialize total duration for roles exceeding the threshold
    let totalLongRolesDuration = 0;

    // Loop through each company
    const experiencesByCompany: Record<string, Array<{ starts_at: string; ends_at?: string | null }>> = {};

    experiences.forEach((experience) => {
        if (!experiencesByCompany[experience.company]) {
            experiencesByCompany[experience.company] = [];
        }
        experiencesByCompany[experience.company].push(experience);
    });

    Object.values(experiencesByCompany).forEach((companyExperiences: Array<{ starts_at: string; ends_at?: string | null }>) => {
        const sortedExperiences = companyExperiences.sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());

        // Calculate total duration for each company using the first and last entry
        const firstEntry = sortedExperiences[0];
        const lastEntry = sortedExperiences[sortedExperiences.length - 1];

        const startsAt = new Date(firstEntry.starts_at).getTime();
        const endsAt = lastEntry.ends_at ? new Date(lastEntry.ends_at).getTime() : new Date().getTime();

        const durationInYears = (endsAt - startsAt) / (1000 * 60 * 60 * 24 * 365.25);

        // Add the duration to the total long roles duration
        if (durationInYears > comfortZoneThreshold) {
            totalLongRolesDuration += durationInYears;
        }
    });

    // Calculate the total duration of all experiences
    const totalExperienceDuration = calculateTotalDurationFromCompanies(experiencesByCompany);

    // Calculate the comfort zone percentage based on the total time in companies exceeding the threshold
    const comfortZonePercentage = totalExperienceDuration > 0 ? (1 - totalLongRolesDuration / totalExperienceDuration) * 100 : 0;

    // Make sure the percentage is not negative
    return Math.max(0, comfortZonePercentage);
};

// Function to calculate the total duration from company tenure information
const calculateTotalDurationFromCompanies = (experiencesByCompany: Record<string, Array<{ starts_at: string; ends_at?: string | null }>>): number => {
    let totalDuration = 0;

    // Loop through each company and add its duration
    Object.values(experiencesByCompany).forEach((companyExperiences) => {
        const sortedExperiences = companyExperiences.sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());

        // Calculate total duration for each company using the first and last entry
        const firstEntry = sortedExperiences[0];
        const lastEntry = sortedExperiences[sortedExperiences.length - 1];

        const startsAt = new Date(firstEntry.starts_at).getTime();
        const endsAt = lastEntry.ends_at ? new Date(lastEntry.ends_at).getTime() : new Date().getTime();

        const durationInYears = (endsAt - startsAt) / (1000 * 60 * 60 * 24 * 365.25);

        totalDuration += durationInYears;
    });

    return totalDuration;
};

export default calculateComfortZoneScore;
