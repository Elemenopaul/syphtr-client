import calculateStabilityScore from './stabilityScoreCalculation';
import { calculateComfortZoneScore } from './comfortzonescore';
import { calculateCategoryScore } from './calculateCompetitiveScore';
import { calculateRecentCategoryScore } from './recentCategoryScore';
import getPrismaClient from '../utils/prisma'; // Adjust the path as needed

interface CompanyProductCategory {
  id: number;
  companyId: number;
  productId: number;
  categoryId: number;
  percentage: number;
}

// Function to calculate the overall score with weighted values
const calculateOverallScore = async (profile: any, selectedCategories: string[], stabilityWeight: number, comfortZoneWeight: number, categoryWeight: number, recentCategoryWeight: number, stableTenure: number, comfortZoneThreshold: number, recentYears: number, yearsInCompany: number): Promise<number> => {
  
  // Check if the weights add up to 1
  if (stabilityWeight + comfortZoneWeight + categoryWeight + recentCategoryWeight !== 1) {
    throw new Error('The weights must add up to 1');
  }

  // Get the user's experiences from the profile
  const userExperiences = profile.experiences;

  // Calculate the stability score
  const stabilityScore = calculateStabilityScore(profile, stableTenure);

  // Calculate the comfort zone score
  const comfortZoneScore = calculateComfortZoneScore(userExperiences, comfortZoneThreshold);
  

  // Define fetchCompaniesForCategory function
  const fetchCompaniesForCategory = async (category: string): Promise<string[]> => {
    const categoryWithCompanies = await prisma.category.findUnique({
      where: { name: category },
      include: { companyProductCategories: true }
    });

    if (!categoryWithCompanies) throw new Error(`Category not found: ${category}`);

    const companies = (await Promise.all(categoryWithCompanies.companyProductCategories.map(async (companyProductCategory: CompanyProductCategory) => {
      const company = await prisma.company.findUnique({
        where: { id: companyProductCategory.companyId }
      });
      return company?.name;
    }))).filter((company): company is string => company !== undefined);
    return companies;
  };

  // Calculate the category score and convert it to a percentage
  const categoryScore = await calculateCategoryScore(userExperiences, selectedCategories);

  // Calculate the recent category score
  const recentCategoryScore = await calculateRecentCategoryScore(userExperiences, selectedCategories, recentYears, yearsInCompany);

  // Calculate the overall score
  const overallScore = (stabilityWeight * stabilityScore) + (comfortZoneWeight * comfortZoneScore) + (categoryWeight * categoryScore.score) + (recentCategoryWeight * recentCategoryScore);
  return overallScore;
};

export default calculateOverallScore;