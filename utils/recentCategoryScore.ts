import { fetchCompaniesForCategory } from '../pages/newDbSearchForm';
import { sapProducts, oracleProducts, ibmProducts, microsoftProducts } from '../pages/productInfo';


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
  category: string; // Add category field to Experience
  // Other fields related to Experience...
}

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
  
  // Function to get companies from local storage
const getCompaniesFromLocalStorage = (category: string): string[] => {
  const companies = localStorage.getItem(category);
  return companies ? JSON.parse(companies) : [];
};

// Function to calculate the recent category score
export const calculateRecentCategoryScore = async (experiences: Experience[], selectedCategories: string[], recentYears: number, yearsInCompany: number): Promise<number> => {
  let matchingYears = 0;
  const today = new Date();
  
  // Get companies for selected categories from local storage
  const selectedCompanies: string[] = [];
  const companiesByCategory: Record<string, string[]> = {};
  for (const category of selectedCategories) {
    const companies = getCompaniesFromLocalStorage(category);
    companiesByCategory[category] = companies;
    selectedCompanies.push(...companiesByCategory[category]);
  }
    
    const companyDurations: Record<string, number> = {};
    let hasMatchingExperience = false;
    for (const experience of experiences) {
      const startDate = experience.starts_at ? new Date(experience.starts_at) : new Date();
      const endDate = experience.ends_at ? new Date(experience.ends_at) : today;
      
      const duration = calculateExperienceDuration(experience.starts_at, experience.ends_at);
      
      const companyNameLowerCase = experience.company ? experience.company.toLowerCase() : '';
      const titleLowerCase = experience.title ? experience.title.toLowerCase() : '';

const sapProductExcluded = Object.keys(sapProducts).some(product => {
  const productInTitleOrCompany = companyNameContainsWord(titleLowerCase, product.toLowerCase()) || companyNameContainsWord(companyNameLowerCase, product.toLowerCase());
  const excluded = productInTitleOrCompany && !sapProducts[product].categories[experience.category];
  if (excluded) {
    {/* console.log(`SAP product ${product} with categories ${sapProducts[product].categories} excluded experience with category ${experience.category}`); */}
  }
  return excluded;
});

const oracleProductExcluded = Object.keys(oracleProducts).some(product => {
  const productInTitleOrCompany = companyNameContainsWord(titleLowerCase, product.toLowerCase()) || companyNameContainsWord(companyNameLowerCase, product.toLowerCase());
  const excluded = productInTitleOrCompany && !oracleProducts[product].categories[experience.category];
  if (excluded) {
    {/* console.log(`Oracle product ${product} with categories ${oracleProducts[product].categories} excluded experience with category ${experience.category}`); */}
  }
  return excluded;
});

const ibmProductExcluded = Object.keys(ibmProducts).some(product => {
  const productInTitleOrCompany = companyNameContainsWord(titleLowerCase, product.toLowerCase()) || companyNameContainsWord(companyNameLowerCase, product.toLowerCase());
  const excluded = productInTitleOrCompany && !ibmProducts[product].categories[experience.category];
  if (excluded) {
    {/* console.log(`IBM product ${product} with categories ${ibmProducts[product].categories} excluded experience with category ${experience.category}`); */}
  }
  return excluded;
});

const microsoftProductExcluded = Object.keys(microsoftProducts).some(product => {
  const productInTitleOrCompany = companyNameContainsWord(titleLowerCase, product.toLowerCase()) || companyNameContainsWord(companyNameLowerCase, product.toLowerCase());
  const excluded = productInTitleOrCompany && !microsoftProducts[product].categories[experience.category];
  if (excluded) {
    {/* console.log(`Microsoft product ${product} with categories ${microsoftProducts[product].categories} excluded experience with category ${experience.category}`); */}
  }
  return excluded;
});
{/* console.log(`Experience at ${experience.company} from ${experience.starts_at} to ${experience.ends_at}. Duration in years: ${duration}`); */}

if (
  endDate.getTime() >= today.getTime() - recentYears * 365 * 24 * 60 * 60 * 1000 &&
  selectedCompanies.some(selectedCompany => companyNameContainsWord(companyNameLowerCase, selectedCompany.toLowerCase())) &&
  !sapProductExcluded &&
  !oracleProductExcluded &&
  !ibmProductExcluded &&
  !microsoftProductExcluded
) {
  if (!companyDurations[experience.company]) {
    companyDurations[experience.company] = 0;
  }
  companyDurations[experience.company] += duration;
 {/* console.log(`Recent experience at ${experience.company} from ${experience.starts_at} to ${experience.ends_at} is contributing to the score. Duration in years: ${duration}`); */}
}
    }
  
    for (const company in companyDurations) {
      if (companyDurations[company] >= yearsInCompany) {
        matchingYears += companyDurations[company];
        hasMatchingExperience = true;
      }
    }
  
    // Calculate the recent category score
    let score = hasMatchingExperience ? (matchingYears / recentYears) * 50 + 50 : 0; // Scale between 50% and 100% if there's matching experience, otherwise 0%
    score = Math.min(100, score); // Cap score at 100%
    score = Math.max(0, score); // Ensure score is at least 0%
  
   {/* console.log('Recent category score:', score); // Log the score */}
  
    return score;
  };