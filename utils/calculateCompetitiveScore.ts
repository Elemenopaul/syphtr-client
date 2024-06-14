

import { fetchCompaniesForCategory } from '../pages/newDbSearchForm';
import { sapProducts, oracleProducts } from '../pages/productInfo';
import { microsoftProducts } from '../pages/productInfo';
import { ibmProducts } from '../pages/productInfo';

// Define the Experience type
export interface Experience {
  id: number;
  company: string;
  title: string;
  description?: string;
  location?: string;
  starts_at?: string;
  ends_at?: string | null;
  company_linkedin_profile_url?: string;
  logo_url?: string;
  // Other fields related to Experience...
}

const productNamesToCategories = { ...sapProducts, ...oracleProducts, ...microsoftProducts, ...ibmProducts };

const allCategories: string[] = [
    "MDM_PIM",
    "DataQuality",
    "DataCatalogue",
    "IAM",
    "ProcurementSoftware",
    "Databases",
    "BusinessProcessManagement",
    "CRM",
    "SCM",
    "HRM",
    "CMS",
    "ECM",
    "BI",
    "EAM",
    "ERP",
    "DMS",
    "PLM",
    "apiManagement",
    "BigData",
    "ETL",
    "Integration",
    "DataIntegration",
    "DataGovernance",
    "DataEngineering",
    "DataPrivacyManagement",
    "LMS",
    "IoT",
    "AI",
    "Ecommerce",
    "DataScience",
    "DataAnalytics",
    "DataVisualization",
    "DataLake",
    "DataWarehouse",
    "DataMigration",
    "DataReplication",
    "DataVirtualization",
    "DataMasking",
    "DataArchiving",
    "DataSecurity",
    "DataModeling",
    "DataStreaming",
    "DataPreparation",
    "DataOrchestration",
    "DataDiscovery",
    "DataSynchronization",
    "DataTransformation",
    "DataStorage",
    "DataBackup",
    "DataRecovery",
    "DataGovernanceAndCompliance",
    "DataPrivacy",
    "DataManagement",
    "DataProtection",
    "DataLossPrevention",
    "DataRetention",
    "DataClassification",
    "DataEncryption",
    "DataAccessGovernance",
    "DataAccessManagement",  
    "DataAccessControl",
    "DataAccessSecurity",
    "DataAccessPolicy",
    "DataAccessAudit",  
    "DataAccessMonitoring",
    "DataAccessTracking",
  ];


  

// Function to calculate experience duration
const calculateExperienceDuration = (startsAt: string | null | undefined, endsAt: string | null | undefined): number => {
  const start = startsAt ? new Date(startsAt) : new Date();
  const end = endsAt ? new Date(endsAt) : new Date();
  const duration = end.getTime() - start.getTime();
  return duration / (1000 * 60 * 60 * 24 * 365); // Convert milliseconds to years
};

// Function to check if a company name contains a specific word
const companyNameContainsWord = (companyName: string, word: string): boolean => {
  const regex = new RegExp(`(^${word}$|^${word} | ${word}$| ${word} )`, 'i');
  return regex.test(` ${companyName} `);
};

// Function to check if a title contains a specific word
const titleContainsWord = (title: string, word: string): boolean => {
  const regex = new RegExp(`\\b${word}\\b`, 'i');
  return regex.test(title);
};

// Function to get companies from local storage
const getCompaniesFromLocalStorage = (category: string): string[] => {
  const companies = localStorage.getItem(category);
 {/* console.log(`Companies for category ${category}: ${companies}`); */}
  return companies ? JSON.parse(companies) : [];
};

// Function to calculate the score for specific categories
export const calculateCategoryScore = async (experiences: Experience[], selectedCategories: string[]): Promise<{score: number, companies: string[], categoryCompanies: Record<string, string[]>, categoryExperience: Record<string, number>}> => {
  let totalScore = 0;
  const categoryExperience: Record<string, number> = {};

  // Get the companies for the selected categories
  const selectedCompanies: string[] = [];
  const categoryCompanies: Record<string, string[]> = {};

  for (const category of selectedCategories) {
    const companies = getCompaniesFromLocalStorage(category);
    selectedCompanies.push(...companies); // Extract company names
    categoryCompanies[category] = companies; // Map category to companies
  }

  // Loop through each company
  const experiencesByCompany: Record<string, Experience[]> = {};

  experiences.forEach((experience) => {
    if (!experiencesByCompany[experience.company]) {
      experiencesByCompany[experience.company] = [];
    }
    experiencesByCompany[experience.company].push(experience);
  });

  Object.values(experiencesByCompany).forEach((companyExperiences: Experience[]) => {
    companyExperiences.forEach((experience) => {
      const startsAt = experience.starts_at ? new Date(experience.starts_at).toISOString() : new Date().toISOString(); // Using current date as fallback
      const endsAt = experience.ends_at ? new Date(experience.ends_at).toISOString() : new Date().toISOString();       // Using current date as fallback
  
      const durationInYears = calculateExperienceDuration(startsAt, endsAt);
  
      const companyNameLowerCase = experience.company ? experience.company.toLowerCase() : '';
const titleLowerCase = experience.title ? experience.title.toLowerCase() : '';
if (selectedCompanies.some(selectedCompany => companyNameContainsWord(companyNameLowerCase, selectedCompany.toLowerCase())) &&
!Object.keys(sapProducts).some(product => (companyNameLowerCase.includes(product.toLowerCase()) || titleContainsWord(titleLowerCase, product.toLowerCase())) && !selectedCategories.some(category => sapProducts[product].categories[category])) &&
!Object.keys(oracleProducts).some(product => (companyNameLowerCase.includes(product.toLowerCase()) || titleContainsWord(titleLowerCase, product.toLowerCase())) && !selectedCategories.some(category => oracleProducts[product].categories[category])) &&
!Object.keys(microsoftProducts).some(product => (companyNameLowerCase.includes(product.toLowerCase()) || titleContainsWord(titleLowerCase, product.toLowerCase())) && !selectedCategories.some(category => microsoftProducts[product].categories[category])) &&
!Object.keys(ibmProducts).some(product => (companyNameLowerCase.includes(product.toLowerCase()) || titleContainsWord(titleLowerCase, product.toLowerCase())) && !selectedCategories.some(category => ibmProducts[product].categories[category]))) 
{
  totalScore += durationInYears;

        // Add the duration to the total experience for each category the company is in
        for (const category in categoryCompanies) {
         {/* console.log(`Processing category: ${category}`);
          console.log(`Company: ${experience.company}`); */}
          const isCompanyInCategory = categoryCompanies[category].some(company => companyNameContainsWord(experience.company.toLowerCase(), company.toLowerCase()));
        {/* console.log(`Is company in category? ${isCompanyInCategory}`); */}
          if (isCompanyInCategory) {
            if (!categoryExperience[category]) {
              categoryExperience[category] = 0;
            }
            categoryExperience[category] += durationInYears;
           {/* console.log(`Updated categoryExperience[${category}]: ${categoryExperience[category]}`); */}
          }
        }
      }
    });
  });

  // Normalize score to percentage
  const maxScore = experiences.reduce((total, experience) => {
    const startsAt = experience.starts_at ? new Date(experience.starts_at).toISOString() : new Date().toISOString(); // Using current date as fallback
    const endsAt = experience.ends_at ? new Date(experience.ends_at).toISOString() : new Date().toISOString();       // Using current date as fallback
    const durationInYears = calculateExperienceDuration(startsAt, endsAt);
    return total + durationInYears;
  }, 0);

  const score = (totalScore / maxScore) * 100;

  return { score, companies: selectedCompanies, categoryCompanies, categoryExperience };
};