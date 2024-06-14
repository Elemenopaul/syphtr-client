import axios from 'axios';
import { ChangeEvent, FormEvent, useState, useEffect } from 'react';
import calculateStabilityScore from '../utils/stabilityScoreCalculation';
import { calculateBorderColor } from '../utils/profilePicColourCalculation';
import { calculateTotalExperience } from '../utils/totalExperienceCalculation';
import { calculateAverageTimeInCompany } from '../utils/averageTenurePerCompanyCalculation';
import { calculateAverageTimeInRole } from '../utils/averageTenurePerRoleCalculation';
import { calculateTotalCombinedExperience } from '../utils/totalTimeWorkingCalculation';
import { calculateComfortZoneScore } from '../utils/comfortzonescore';
import { calculateCategoryScore } from '../utils/calculateCompetitiveScore';
import { calculateRecentCategoryScore } from '../utils/recentCategoryScore';
import calculateOverallScore from '../utils/calculateoverallscore';
import React from 'react';
import Link from 'next/link';
import { UserButton } from "@clerk/nextjs"; // Add this line
import { useUser } from '@clerk/clerk-react';
import { OrganizationList } from "@clerk/clerk-react";
import FullProfileModal from './FullProfileModal'; // Import the modal component
import ReactTooltip from 'react-tooltip';
import { BeatLoader } from 'react-spinners';
import { sapProducts } from './productInfo'; // Adjust the path as needed
import { oracleProducts } from './productInfo';
import { microsoftProducts} from './productInfo';
import { ibmProducts } from './productInfo';  
import Modal from 'react-modal';
import Select from 'react-dropdown-select';
import pLimit from 'p-limit';
import { useSession } from "@clerk/clerk-react";
import jwt from 'jsonwebtoken';










export const fetchCompaniesForCategory = async (category: string) => {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/companies`, { params: { category } });
      if (Array.isArray(response.data)) {
      return response.data;
    } else {
      throw new Error('Unexpected response from server');
    }
  } catch (error) {
    console.error(error);
    return [];
  }
};

function calculateAverageScore(stabilityScore: number, comfortZoneScore: number): number {
  
  return (stabilityScore + comfortZoneScore) / 2;
}




interface FormState {
  name: string;
  city: string;
  state: string;
  country: string;
  company: string;
  experienceTitle: string;
  experienceCompany: string;
  minExperience: number;
  maxExperience: number; // Add this line
  sortStability: boolean;
  sortComfortZone: boolean; // Add this line
  sortOverall: boolean; // Add this line
  selectedCategories: string[]; // Add this line
  sortCategory: boolean; // Add this line
  sortRecentCategory: boolean; // Add this line
  minCompanies: number;
  onlyCurrentTitle: boolean;
  onlyCurrentCompany: boolean;
  pastExperienceTitle: string; // Add this line
  pastExperienceCompany: string; 
  descriptionQuery: string; 
  stabilityWeight: number;
  comfortZoneWeight: number;
  categoryWeight: number;
  recentCategoryWeight: number;
  stableTenure: number; // Add this line
  comfortZoneThreshold: number;
  yearsInCompany: number;
  recentYears: number;
  

}




export default function Search() {
  const [form, setForm] = useState<FormState>({
    name: '',
    city: '',
    state: '',
    country: '',
    company: '',
    experienceTitle: '',
    experienceCompany: '',
    minExperience: 0,
    maxExperience: 0, // Add this line
    sortStability: false,
    sortComfortZone: false, // Add this line
    sortOverall: false, // Add this line
    selectedCategories: [], // Add this line
    sortCategory: false,
    sortRecentCategory: false,
    minCompanies: 0,
    onlyCurrentTitle: false,
    onlyCurrentCompany: false,
    pastExperienceTitle: '', // Add this line
    pastExperienceCompany: '',
    descriptionQuery: '',
    stabilityWeight: 0.25,
    comfortZoneWeight: 0.25,
    categoryWeight: 0.25,
    recentCategoryWeight: 0.25, // Add this line
    stableTenure: 3, // Add this line
    comfortZoneThreshold: 9,
    yearsInCompany: 2,
    recentYears: 6,

  });

  const { session } = useSession();
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    const fetchToken = async () => {
      if (session) {
        const jwt = await session.getToken();
        setToken(jwt);
      }
    };

    fetchToken();
  }, [session]);

  console.log('Session:', session);
  console.log('Token:', token);



  useEffect(() => {
    const getOrgId = async () => {
      if (session) {
        const token = await session.getToken();
        console.log('Token:', token); // Log the token
  
        if (token) {
          // Decode the token
          const decodedToken = jwt.decode(token);
          console.log('decodedToken:', decodedToken);
          let orgId = '';
          if (typeof decodedToken === 'object' && decodedToken !== null) {
            orgId = 'org_id' in decodedToken ? decodedToken.org_id : '';
          }
          console.log('orgId:', orgId);
  
          // Set orgId as a state variable
          setOrgId(orgId);
        } else {
          console.error('Token is null');
        }
      }
    };
  
    getOrgId();
  }, [session]);


  const handleSaveProfile = async (profileId: number, jobIds: number[], orgId: string, token: string) => {
  // Check if any jobs have been selected
  if (jobIds.length === 0) {
    window.alert('Please select at least one job.');
    return;
  }

  // Find the profile in the results array
  const profile = results.find(profile => profile.id === profileId);

  if (profile) {
    // Prepare the data to be saved
    const profileData = {
      stage: 'ADDED',
      comfortZoneScore: profile.comfortZoneScore,
      categoryScore: profile.categoryScore,
      overallScore: profile.overallScore,
      stabilityScore: profile.stabilityScore,
      recentCategoryScore: profile.recentCategoryScore,
      orgId: orgId, // Add this line
        // other profile data...
      };
  
      let profilesAdded = 0;
  
      try {
        for (const jobId of jobIds) {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidateStages/${profileId}/${jobId}`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` // Add the token to the request header
            },
            body: JSON.stringify(profileData),
          });
  
          profilesAdded++;
        }
  
        // Uncheck the checkbox for the saved profile
        setSelectedProfiles(prevState => prevState.filter(id => id !== profileId));
  
        // Unselect the job for the saved profile
        setSelectedJobsByProfile(prevState => {
          const newState = { ...prevState };
          delete newState[profileId];
          return newState;
        });
  
        // Show a popup message
        if (profilesAdded > 0) {
          window.alert(`${profilesAdded} profile(s) added to job(s).`);
        }
  
      } catch (error) {
        console.error('An error occurred:', error);
      }
    }
  };
  


  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    let { stabilityWeight, comfortZoneWeight, categoryWeight, recentCategoryWeight } = form;
  
    let newValue = Number(value);
    let remainingWeight = 1 - newValue;
  
    switch (name) {
      case 'stabilityWeight':
        stabilityWeight = newValue;
        comfortZoneWeight = remainingWeight / 3;
        categoryWeight = remainingWeight / 3;
        recentCategoryWeight = remainingWeight / 3;
        break;
      case 'comfortZoneWeight':
        comfortZoneWeight = newValue;
        stabilityWeight = remainingWeight / 3;
        categoryWeight = remainingWeight / 3;
        recentCategoryWeight = remainingWeight / 3;
        break;
      case 'categoryWeight':
        categoryWeight = newValue;
        stabilityWeight = remainingWeight / 3;
        comfortZoneWeight = remainingWeight / 3;
        recentCategoryWeight = remainingWeight / 3;
        break;
      case 'recentCategoryWeight':
        recentCategoryWeight = newValue;
        stabilityWeight = remainingWeight / 3;
        comfortZoneWeight = remainingWeight / 3;
        categoryWeight = remainingWeight / 3;
        break;
    }
  
    setForm({
      ...form,
      stabilityWeight,
      comfortZoneWeight,
      categoryWeight,
      recentCategoryWeight,
    });
  };

const [profileId, setProfileId] = useState(null);
const [showModal, setShowModal] = useState(false);
  const { user } = useUser();
  const loggedInUserId = user ? user.id : null;
  const [results, setResults] = useState<any[]>([]);
  const [enableColoredBorder, setEnableColoredBorder] = useState(false);
  const [showStability, setShowStability] = useState(false);
  const [sortedResults, setSortedResults] = useState<any[]>([]);
  // At the top of your component, after other useState declarations
const [selectedCategories, setSelectedCategories] = useState<{ [key: string]: boolean }>({});
// Add new state variables
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(10);
const [companyCategories, setCompanyCategories] = useState<{ [company: string]: string[] }>({});
const [showExperience, setShowExperience] = useState<Record<string, boolean>>({});
// Initialize showEducation as an empty object
const [showEducation, setShowEducation] = useState<Record<string, boolean>>({});
  const [minCompaniesInput, setMinCompaniesInput] = useState(1);
  const [onlyCurrentTitle, setOnlyCurrentTitle] = useState(false);
  const [onlyCurrentCompany, setOnlyCurrentCompany] = useState(false);
  const [stableTenure, setStableTenure] = useState(3);
  const [comfortZoneThreshold, setComfortZoneThreshold] = useState(9);
  const [linkedInUrls, setLinkedInUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDiv, setShowDiv] = useState(false);
  const [showTenureDiv, setShowTenureDiv] = useState(false);
  const [showRecentScoreDiv, setShowRecentScoreDiv] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);
  
  
  




  interface CandidateStage {
    id: number;
    stage: Stage;
    profileId: number;
  }
  
  enum Stage {
    APPLIED,
    ADDED,
    Ask_Syphtr_To_Reach_Out,
    SCREENING,
    SCREENED,
    FIRST_INTERVIEW,
    MID_INTERVIEWS,
    FINAL_INTERVIEW,
    HIRED
  }
  
  interface Job {
    id: number;
    userId: string;
    title: string;
    hiringTeam: string[];
    department: string;
    businessUnit: string;
    salary: number;
    currency: string;
    openSince: Date;
    candidateStages: CandidateStage[];
  }

  interface CandidateStageWithJobTitle extends CandidateStage {
    jobTitle: string;
    jobId: number;
  }


const [jobs, setJobs] = useState<Job[]>([]);
const [selectedJobsByProfile, setSelectedJobsByProfile] = useState<{ [profileId: string]: number[] }>({});
const [selectedJob, setSelectedJob] = useState<number | ''>('');
const [selectAllProfiles, setSelectAllProfiles] = useState(false);
const [selectedProfiles, setSelectedProfiles] = useState<number[]>([]);

// Toggle the visibility of the experience section for a specific profile
const toggleExperience = (profileId: string) => {
  setShowExperience(prevState => ({
    ...prevState,
    [profileId]: !prevState[profileId],
  }));
};

// Toggle the visibility of the education section for a specific profile
const toggleEducation = (profileId: string) => {
  setShowEducation(prevState => ({
    ...prevState,
    [profileId]: !prevState[profileId],
  }));
};

// Toggle the visibility of all experience sections
const toggleAllExperience = () => {
  // Get the IDs of all profiles
  const profileIds = results.map(profile => profile.id);

  // Update the showExperience state
  setShowExperience(prevState => {
    const newState = { ...prevState };
    profileIds.forEach(profileId => {
      newState[profileId] = !newState[profileId];
    });
    return newState;
  });
};

// Toggle the visibility of all education sections
const toggleAllEducation = () => {
  // Get the IDs of all profiles
  const profileIds = results.map(profile => profile.id);

  // Update the showEducation state
  setShowEducation(prevState => {
    const newState = { ...prevState };
    profileIds.forEach(profileId => {
      newState[profileId] = !newState[profileId];
    });
    return newState;
  });
};

// Replace handleJobSelection to take a profileId
const handleJobSelection = (selectedJobIds: number[], profileId: string) => {
  setSelectedJobsByProfile(prevState => ({ ...prevState, [profileId]: selectedJobIds }));
};

useEffect(() => {
  const fetchJobs = async () => {
    if (session && user && user.id) { // Check if user and user.id are defined
      const token = await session.getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs?userId=${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`, // Include the Authorization header
        },
      });
      const data = await response.json();
      setJobs(data);
    }
  };

  fetchJobs();
}, [user, session]); // Add session and user to the dependency array

useEffect(() => {
  const urls = results.map(profile => JSON.stringify({
    url: profile.linkedin_profile_url,
    comfortZoneScore: profile.comfortZoneScore,
    categoryScore: profile.categoryScore,
    overallScore: profile.overallScore,
    stabilityScore: profile.stabilityScore,
    recentCategoryScore: profile.recentCategoryScore, // Add this line
  }));
  setLinkedInUrls(urls);
}, [results]);

const exportUrls = () => {
  const text = linkedInUrls.map(url => {
    const profile = JSON.parse(url);
    return `${profile.url}, Comfort Zone Score: ${profile.comfortZoneScore}, Category Score: ${JSON.stringify(profile.categoryScore)}, Overall Score: ${profile.overallScore}, Stability Score: ${profile.stabilityScore}, Recent Category Score: ${profile.recentCategoryScore}`; // Update this line
  }).join('\n');
  
  const element = document.createElement('a');
  const file = new Blob([text], {type: 'text/plain'});
  element.href = URL.createObjectURL(file);
  element.download = 'LinkedInURLs.txt';
  document.body.appendChild(element); // Required for this to work in FireFox
  element.click();
};



// Create a paginate function
const paginate = (items: any[], currentPage: number, itemsPerPage: number) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  return items.slice(startIndex, startIndex + itemsPerPage);
};

const handleSelectAllProfiles = (e: React.ChangeEvent<HTMLInputElement>) => {
  setSelectAllProfiles(e.target.checked);

  if (e.target.checked) {
    setSelectedProfiles(results.map(profile => profile.id));
  } else {
    setSelectedProfiles([]);
  }
};

const handleSaveAllProfilesToJob = async () => {
  if (!selectedJob) {
    window.alert('Please select a job first.');
    return;
  }

  let profilesSaved = 0;

  for (const profileId of selectedProfiles) {
    const profile = results.find(profile => profile.id === profileId);

    if (profile) {
      const profileData = {
        stage: 'ADDED',
        comfortZoneScore: profile.comfortZoneScore,
        categoryScore: profile.categoryScore,
        overallScore: profile.overallScore,
        stabilityScore: profile.stabilityScore,
        recentCategoryScore: profile.recentCategoryScore,
        // other profile data...
      };

      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidateStages/${profileId}/${selectedJob}`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Add the token to the request header
          },
          body: JSON.stringify(profileData),
        });

        profilesSaved++;
      } catch (error) {
        console.error('An error occurred:', error);
      }
    }
  }

  if (profilesSaved > 0) {
    window.alert(`${profilesSaved} profile(s) saved to the job.`);
  } else {
    window.alert('No profiles were saved.');
  }

  setSelectedProfiles([]);
};

// Toggle the selection of a specific profile
const handleProfileSelection = (profileId: number) => {
  setSelectedProfiles(prevState => {
    if (prevState.includes(profileId)) {
      // If the profile is already selected, remove it from the selection
      return prevState.filter(id => id !== profileId);
    } else {
      // If the profile is not selected, add it to the selection
      return [...prevState, profileId];
    }
  });
};


const handleCategorySelection = async (selectedCategoryNames: string[]) => {
  const newSelectedCategories = { ...selectedCategories };
  const allCompanyNames = new Set<string>();

  for (const category of categories) {
    newSelectedCategories[category] = selectedCategoryNames.includes(category);
  }

  setSelectedCategories(newSelectedCategories);

  for (const category of categories) {
    if (newSelectedCategories[category]) {
      try {
        const companies = await fetchCompaniesForCategory(category);
        const companyNames = companies.map(company => company.name);
        companyNames.forEach(name => allCompanyNames.add(name));

        setCompanyCategories(prevState => {
          const newState = { ...prevState };
          for (const company of companyNames) {
            if (!newState[company]) {
              newState[company] = [];
            }
            if (!newState[company].includes(category)) {
              newState[company].push(category);
            }
          }
          return newState;
        });
      } catch (error) {
        console.error(error);
      }
    }
  }

  setForm(prevForm => {
    const existingCompanies = prevForm.experienceCompany ? prevForm.experienceCompany.split(', ').filter(name => name) : [];
    const newCompanies = Array.from(allCompanyNames);
    return { ...prevForm, experienceCompany: newCompanies.join(', ') };
  });
};




useEffect(() => {
  // Set loading to true
  setIsLoading(true);

  // Copy the results array
  let sortedData = [...results];

  // Sorting logic based on stability score
  if (form.sortStability) {
    sortedData = sortedData.sort((a, b) => b.stabilityScore - a.stabilityScore);
  }

  // Sorting logic based on comfort zone score
  if (form.sortComfortZone) {
    sortedData = sortedData.sort((a, b) => b.comfortZoneScore - a.comfortZoneScore);
  }

  // Sorting logic based on overall score
  if (form.sortOverall) {
    sortedData = sortedData.sort((a, b) => b.overallScore - a.overallScore);
  }

  // Sorting logic based on category score
  if (form.sortCategory) {
    sortedData = sortedData.sort((a, b) => b.categoryScore.score - a.categoryScore.score);
  }

  // Sorting logic based on recent category score
  if (form.sortRecentCategory) {
    sortedData = sortedData.sort((a, b) => b.recentCategoryScore - a.recentCategoryScore);
  }

  // Set the sorted results state
  setSortedResults(sortedData);

  // Set loading to false
  setIsLoading(false);

  console.log('Sorted data:', sortedData);

}, [results, form.sortStability, form.sortComfortZone, form.sortOverall, form.sortCategory, form.sortRecentCategory]);

const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
  const { name, type, value, checked } = event.target;

  // Set loading to true when a form field changes
  setIsLoading(true);

  if (name === 'sortRecentCategory') {
    setForm({ ...form, sortRecentCategory: checked });
  } else if (name === 'stabilityThreshold') {
    setForm({ ...form, stableTenure: parseFloat(value) });
  } else if (name === 'comfortZoneThreshold') {
    setForm({ ...form, comfortZoneThreshold: parseFloat(value) });
  } else if (name === 'enableColoredBorder') {
    setEnableColoredBorder(checked);
  } else if (name === 'showStability') {
    setShowStability(checked);
  } else if (name === 'descriptionQuery') {
    setForm({ ...form, descriptionQuery: value });
  } else if (name === 'onlyCurrentTitle' || name === 'onlyCurrentCompany') {
    setForm({ ...form, [name]: checked });
  } else if (name === 'pastExperienceTitle' || name === 'pastExperienceCompany') {
    setForm({ ...form, [name]: value });
  } else if (name === 'recentYears' || name === 'yearsInCompany') {
    setForm({ ...form, [name]: parseFloat(value) });
  } else {
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  }

  // Set loading to false after form state has been updated
  setIsLoading(false);
};



{/* local sroage code */}


const handleSubmit = async (event: FormEvent) => {
  event.preventDefault();

  // Set loading state to true
  setIsLoading(true);

  // Reset the current page to 1
  setCurrentPage(1);

  try {
    const { sortStability, ...filledFormFields } = form;

    // Get an array of selected category names
    const selectedCategoryNames = Object.keys(selectedCategories).filter(category => selectedCategories[category]);

    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/profiles`, { params: { ...filledFormFields, selectedCategoryNames } });

    let data = Array.isArray(response.data) ? response.data : [];

    // Use Promise.all to wait for all category scores to be calculated
    data = await Promise.all(data.map(async (profile: any) => {
      const categoryScore = await calculateCategoryScore(profile.experiences, selectedCategoryNames);
      const stabilityScore = calculateStabilityScore(profile, form.stableTenure);
      const recentCategoryScore = await calculateRecentCategoryScore(profile.experiences, selectedCategoryNames, form.recentYears, form.yearsInCompany);
      
      // Calculate the comfort zone score
      const comfortZoneScore = calculateComfortZoneScore(profile.experiences, form.comfortZoneThreshold);

      // Calculate the average score
      const averageScore = calculateAverageScore(stabilityScore, comfortZoneScore);
    
      return {
        ...profile,
        totalExperience: calculateTotalExperience(profile.experiences),
        averageTimeInCompany: calculateAverageTimeInCompany(profile.experiences),
        averageTimeInRole: calculateAverageTimeInRole(profile.experiences),
        totalCombinedExperience: calculateTotalCombinedExperience(profile.experiences),
        comfortZoneScore: comfortZoneScore,
        categoryScore: categoryScore,
        overallScore: await calculateOverallScore(profile, selectedCategoryNames, form.stabilityWeight, form.comfortZoneWeight, form.categoryWeight, form.recentCategoryWeight, form.stableTenure, form.comfortZoneThreshold, form.recentYears, form.yearsInCompany),        
        stabilityScore: stabilityScore,
        recentCategoryScore: recentCategoryScore,
        averageScore: averageScore, // Add this line
      };
    }));

    // Filtering logic based on minExperience
    if (form.minExperience) {
      data = data.filter(profile => {
        const [years] = profile.totalExperience.split(' ').map(Number);
        return years >= form.minExperience;
      });
    }

    // Filtering logic based on maxExperience
    if (form.maxExperience > 0) {
      data = data.filter(profile => {
        const [years] = profile.totalExperience.split(' ').map(Number);
        return years <= form.maxExperience;
      });
    }

    // Filtering logic based on minimum number of companies
    let filteredData: any[] = data.filter((profile: any) => {
      const uniqueCompanies: string[] = Array.from(new Set(profile.experiences.map((exp: { company: string }) => exp.company)));
      return uniqueCompanies.length >= form.minCompanies;
    });

    // Sorting logic based on stability score
    if (sortStability) {
      filteredData = filteredData.sort((a, b) => b.stabilityScore - a.stabilityScore);
    }

    setResults(filteredData);
  } catch (error) {
    console.error(error);
  } finally {
    // Set loading state to false once data has been fetched and processed
    setIsLoading(false);
  }
};

  const toggleMoreInfo = (index: number) => {
    setResults((prevResults) => {
      const updatedResults = [...prevResults];
      updatedResults[index].isExpanded = !updatedResults[index].isExpanded;
      return updatedResults;
    });
  };

  const formatExperienceDate = (dateString?: string | null | undefined): string => {
    const date = dateString ? new Date(dateString) : null;
  
    if (date instanceof Date) {
      // Format the date to "MMM yyyy" (e.g., "Jan 2023")
      const formattedDate = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date);
      return formattedDate;
    } else {
      return 'Not provided';
    }
  };

  

  const formatExperienceDuration = (startDateString?: string | null | undefined, endDateString?: string | null | undefined): string => {
    const startDate = startDateString ? new Date(startDateString) : null;
    const endDate = endDateString ? new Date(endDateString) : null;

    const start = startDate || new Date(0, 0, 0);
    const end = endDate || new Date(0, 0, 0);

    const diffInMonths = (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth();
    const years = Math.floor(diffInMonths / 12);
    const months = diffInMonths % 12;

    const yearString = years > 0 ? `${years} year${years > 1 ? 's' : ''}` : '';
    const monthString = months > 0 ? `${months} month${months > 1 ? 's' : ''}` : '';

    return `${yearString}${years > 0 && months > 0 ? ', ' : ''}${monthString}`;
  };

  function calculateTotalDuration(roles: { starts_at: string; ends_at: string }[]) {
    let earliestStart = new Date(roles[0].starts_at);
    let latestEnd = new Date(roles[0].ends_at);
  
    roles.forEach(role => {
      const start = new Date(role.starts_at);
      const end = role.ends_at ? new Date(role.ends_at) : new Date();
  
      if (start < earliestStart) {
        earliestStart = start;
      }
  
      if (end > latestEnd) {
        latestEnd = end;
      }
    });
    
    const duration = Math.round((latestEnd.getTime() - earliestStart.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
    return `${Math.floor(duration / 12)} years, ${Math.round(duration % 12)} months`;
  } 

  

  const categories = [
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
  "SapIntegration",
  
];



const paginatedResults = paginate(sortedResults, currentPage, itemsPerPage);

const specifiedWordsPerCompany: Record<string, string[]> = {
  'sap': [
    ...Object.keys(sapProducts),
    ...Object.keys(sapProducts).map(product => `sap ${product}`)
  ],
  'oracle': [
    ...Object.keys(oracleProducts),
    ...Object.keys(oracleProducts).map(product => `oracle ${product}`)
  ],
  'ibm': [
    ...Object.keys(ibmProducts),
    ...Object.keys(ibmProducts).map(product => `ibm ${product}`)
  ],
  'microsoft': [
    ...Object.keys(microsoftProducts),
    ...Object.keys(microsoftProducts).map(product => `microsoft ${product}`)
  ],
  // Add more companies and words as needed
};

const allHugeCompanyProducts = { ...sapProducts, ...oracleProducts, ...ibmProducts, ...microsoftProducts };


// Define your preset search parameters for leadership sales
const presetSearchParamsLeadershipSales = {
  experienceTitle: ['Sales Director', 'VP Sales', 'Sales VP', 'Sales Manager', 'Head of Sales', 'Sales Leader', 'Regional Director'].join(', '),
  onlyCurrentTitle: true,
  excludeWords: ['Professional Services', 'Education', 'Healthcare', 'Inside', 'consulting',  'Junior', 'Development', 'PreSales', 'Engineer',  'Customer Success', 'Accounting', 'Accountant', 'Recruiter', 'Recruitment'].join(', ')
  // Add other fields as needed...
};

// Function to apply preset search parameters for leadership sales
const applyPresetSearchParamsLeadershipSales = () => {
  setForm({ ...form, ...presetSearchParamsLeadershipSales });
};

 // Define your preset search parameters
 const presetSearchParamsSales = {
  experienceTitle: 'Account',
  onlyCurrentTitle: true,
  excludeWords: ['Professional Services', 'Education', 'Healthcare', 'Inside', 'consulting',  'Junior', 'Development', 'PreSales', 'Engineer',  'Customer Success', 'Accounting', 'Accountant', 'Recruiter', 'Recruitment', 'VP', 'Leader', 'Renewal'].join(', ')
  // Add other fields as needed...
};

// Function to apply preset search parameters
const applyPresetSearchParamsSales = () => {
  setForm({ ...form, ...presetSearchParamsSales });
};

// Define your preset search parameters for pre-sales
const presetSearchParamsPreSales = {
  experienceTitle: ['PreSales', 'Sales Engineer', 'Solutions Engineer'].join(', '), 
  onlyCurrentTitle: true,
  excludeWords: ['Professional Services', 'Manager', 'Director'].join(', ')
  // Add other fields as needed...
};

// Function to apply preset search parameters for pre-sales
const applyPresetSearchParamsPreSales = () => {
  setForm({ ...form, ...presetSearchParamsPreSales });
};

// Define your preset search parameters for professional services
const presetSearchParamsProfServices = {
  experienceTitle: ['Services Consultant', 'Implementation Consultant', 'Professional Services',].join(', '), // 'Professional Services' is a common title for consulting roles
  onlyCurrentTitle: true,
  excludeWords: ['Sales', 'Manager', 'Director', 'Account'].join(', ')
  // Add other fields as needed...
};

// Function to apply preset search parameters for professional services
const applyPresetSearchParamsProfServices = () => {
  setForm({ ...form, ...presetSearchParamsProfServices });
};

return (
  <div className="flex flex-col" style={{
    backgroundImage: 'radial-gradient(circle, transparent 1px, #f0f0f0 1px)', // #f0f0f0 is a lighter shade of grey
    backgroundSize: '20px 20px',
    backgroundColor: 'white'
  }}>
    {isLoading && (
  <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-50 z-50">
    <div className="flex flex-col items-center">
      <BeatLoader color="#123abc" size={24} />
      <p className="mt-2 text-lg font-semibold text-gray-700 px-32 text-center">
  Syphting.....<br />
  (If you are using Chrome browser, you will need to be extra patient here - Syphtr run much faster on Firefox or Safari for the time being but we are working on the Chrome optimisation!!)
</p>      </div>
  </div>
)}
    <header className="bg-green-500 text-white p-3 mb-4 w-full flex justify-between items-center">
  <Link href="/" passHref>
    <h1 className="text-sm font-bold cursor-pointer">
      <img src="/logos/Color logo - no background.png" alt="Syphtr" className="w-40 h-auto" />
    </h1>
  </Link>
  <div className="flex space-x-4">
    <Link href="/DbSearchForm" passHref><span className="text--white font-bold hover:text-green-500 transition duration-300 ease-in-out cursor-pointer">Search for Candidates</span></Link>
    <Link href="/jobspage" passHref><span className="text-white font-bold hover:text-green-500 transition duration-300 ease-in-out cursor-pointer">Your Jobs</span></Link>
    <Link href="/ProxyCurlSearchForm" passHref><span className="text-white font-bold hover:text-green-500 transition duration-300 ease-in-out cursor-pointer">Proxy Curl Search Form</span></Link>
    <Link href="/create-organization/" passHref><span className="text-white font-bold hover:text-blue-500 transition duration-300 ease-in-out cursor-pointer">Create Organization</span></Link>
    <Link href="/organization-profile/" passHref><span className="text-white font-bold hover:text-blue-500 transition duration-300 ease-in-out cursor-pointer">Your Organization Profile</span></Link>
    <Link href="https://greasy-skirt-production.up.railway.app/" passHref>
  <span 
    className="text-white font-bold hover:text-green-500 transition duration-300 ease-in-out cursor-pointer" 
    onClick={(e) => {
      e.preventDefault();
      window.open('https://greasy-skirt-production.up.railway.app/', '_blank');
    }}
  >
    Upload PDFs
  </span>
</Link>    <UserButton afterSignOutUrl="/" />
  </div>
</header>

    
    <div className="flex">
    <div className="w-1/4 h-screen bg-gray-300 p-4 rounded-sm shadow-lg sticky top-0 overflow-auto border-4 border-gray-300">      
    <form onSubmit={handleSubmit} className="space-y-4">
    <div className="mt-2">
  <Select
    placeholder="Select Software Categories"
    options={categories.map(category => ({ value: category, label: category }))}
    values={Object.entries(selectedCategories).filter(([category, isSelected]) => isSelected).map(([category]) => ({ value: category, label: category }))}
    onChange={(selectedOptions) => handleCategorySelection(selectedOptions.map(option => option.value))}
    multi
    style={{
      borderColor: 'white',
    }}
  />
</div>

<select 
  className="p-2 rounded-full bg-green-500 text-white font-bold"
  onChange={(e) => {
    switch(e.target.value) {
      case 'leadershipSales':
        applyPresetSearchParamsLeadershipSales();
        break;
      case 'sales':
        applyPresetSearchParamsSales();
        break;
      case 'preSales':
        applyPresetSearchParamsPreSales();
        break;
      case 'profServices':
        applyPresetSearchParamsProfServices();
        break;
      default:
        break;
    }
  }}
>
  <option value="">Select Candidate Type</option>
  <option value="leadershipSales">Search for Sales Leaders</option>
  <option value="sales">Search for Account Execs</option>
  <option value="preSales">Search for PreSales</option>
  <option value="profServices">Search for Prof Services</option>
</select>

<button 
  onClick={(e) => {
    e.preventDefault();
    setShowDiv(!showDiv);
  }}
  className="p-2 rounded-full bg-green-500 text-white font-bold" // Add this line
>
  {showDiv ? 'Hide Advanced Search Options ▲' : 'Show Advanced Search Options ▼'}
</button>

{showDiv && (
  <div className="shadow-lg p-4">
      <div className="flex flex-col space-y-2">
        <input className="border p-2 rounded-md hover:border-blue-500 hover:bg-gray-100" type="text" name="name" placeholder="Name" onChange={handleChange} />
        <input className="border p-2 rounded-md hover:border-blue-500 hover:bg-gray-100" type="text" name="city" placeholder="City" onChange={handleChange} />
        <input className="border p-2 rounded-md hover:border-blue-500 hover:bg-gray-100" type="text" name="state" placeholder="State" onChange={handleChange} />
        <input className="border p-2 rounded-md hover:border-blue-500 hover:bg-gray-100" type="text" name="country" placeholder="Country" onChange={handleChange} />
        <input className="border p-2 rounded-md hover:border-blue-500 hover:bg-gray-100" type="text" name="pastExperienceTitle" placeholder="Past Job Title" onChange={handleChange} />
  <input className="border p-2 rounded-md hover:border-blue-500 hover:bg-gray-100" type="text" name="pastExperienceCompany" placeholder="Past Company Name" onChange={handleChange} />
        <div className="flex items-center space-x-2">
          <input className="border p-2 rounded-md hover:border-blue-500 hover:bg-gray-100" type="text" name="experienceTitle" placeholder="Job Title" onChange={handleChange} />
          <input
            type="checkbox"
            name="onlyCurrentTitle"
            id="onlyCurrentTitle"
            checked={form.onlyCurrentTitle}
            onChange={handleChange}
          />
        <label htmlFor="onlyCurrentCompany" className="text-white font-bold">Current?</label>        </div>
        <div className="flex items-center space-x-2">
          <input className="border p-2 rounded-md hover:border-blue-500 hover:bg-gray-100" type="text" name="experienceCompany" placeholder="Company Name" onChange={handleChange} />
          <input
            type="checkbox"
            name="onlyCurrentCompany"
            id="onlyCurrentCompany"
            checked={form.onlyCurrentCompany}
            onChange={handleChange}
          />
        <label htmlFor="onlyCurrentCompany" className="text-white font-bold">Current?</label>
        </div>
        <input className="border p-2 rounded-md hover:border-blue-500 hover:bg-gray-100" type="number" name="minExperience" placeholder="Min years Experience" onChange={handleChange} min="0" />
        <input className="border p-2 rounded-md hover:border-blue-500 hover:bg-gray-100" type="number" name="maxExperience" placeholder="Max years Experience" onChange={handleChange} min="0" />
        <label htmlFor="descriptionQuery" className="text-white font-bold">Search Role Descriptions:</label>
          <input
          className="border p-2 rounded-md hover:border-blue-500 hover:bg-gray-100"
          type="text"
          id="descriptionQuery"
          name="descriptionQuery"
          value={form.descriptionQuery}
          onChange={handleChange}
        />
      </div>
    

      <div className="flex flex-col space-y-2">
  <label htmlFor="excludeWords" className="text-white font-bold">Exclude Words From Current Title:</label>
  <input 
    type="text" 
    id="excludeWords" 
    name="excludeWords" 
    placeholder="Enter words to exclude, separated by commas" 
    onChange={handleChange}
    className="border p-2 rounded-md hover:border-blue-500 hover:bg-gray-100 w-full"
  />
<label htmlFor="excludeCurrentCompanyWords" className="text-white font-bold">Exclude Words From Current Company:</label>
  <input 
    type="text" 
    id="excludeCurrentCompanyWords" 
    name="excludeCurrentCompanyWords" 
    placeholder="Enter company words to exclude, separated by commas" 
    onChange={handleChange}
    className="border p-2 rounded-md hover:border-blue-500 hover:bg-gray-100 w-full"
  />
</div>




{/*}
<div className="flex flex-col space-y-2">
  <button className={`border p-2 rounded-sm shadow-sm hover:border-blue-500 hover:bg-gray-100 ${form.sortStability ? 'bg-green-500 text-white' : 'bg-gray-200'}`} onClick={() => setForm({ ...form, sortStability: !form.sortStability })}>
    Sort by Stability Score
  </button>

  <button className={`border p-2 rounded-md shadow-sm hover:border-blue-500 hover:bg-gray-100 ${form.sortComfortZone ? 'bg-green-500 text-white' : 'bg-gray-200'}`} onClick={() => setForm({ ...form, sortComfortZone: !form.sortComfortZone })}>
    Sort by Comfort Zone Score
  </button> */}


  {/*

  <button className={`border p-2 rounded-md shadow-sm hover:border-blue-500 hover:bg-gray-100 ${enableColoredBorder ? 'bg-green-500 text-white' : 'bg-gray-200'}`} onClick={() => setEnableColoredBorder(!enableColoredBorder)}>
    Enable Colored Border
  </button>

  <button className={`border p-2 rounded-md shadow-sm hover:border-blue-500 hover:bg-gray-100 ${form.sortCategory ? 'bg-green-500 text-white' : 'bg-gray-200'}`} onClick={() => setForm({ ...form, sortCategory: !form.sortCategory })}>
    Sort by Competitive Score
  </button>
</div> */}

<div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
  <label 
    style={{ 
      marginRight: '10px', 
      fontSize: '16px', 
      color: '#fff', // Change this to make the text white
      fontWeight: 'bold' // Add this to make the text bold
    }}
  >
    Min Employers On Resume:
  </label>
  <select 
    value={minCompaniesInput} 
    onChange={(e) => {
      setMinCompaniesInput(Number(e.target.value));
      setForm({ ...form, minCompanies: Number(e.target.value) });
    }} 
    className="border p-2 rounded-md hover:border-blue-500 hover:bg-gray-100"
  >
    <option value="">Select...</option>
    <option value="1">1</option>
    <option value="2">2</option>
    <option value="3">3</option>
    <option value="4">4</option>
    <option value="5">5</option>
    {/* Add more options as needed */}
  </select>
</div>



<button 
  onClick={(event) => {
    event.preventDefault();
    event.stopPropagation();
    setShowDiv(!showDiv);
  }}
  style={{
    color: 'white',
    fontWeight: 'bold',
    border: '1px solid white',
    borderRadius: '5px',
    padding: '10px',
    backgroundColor: 'transparent',
  }}
>
  {showDiv ? 'Hide' : 'Show Weighting Sliders'}
</button>



{showDiv && (
  <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '10px' }}>
    <div style={{ marginBottom: '10px' }}>
      <label style={{ color: 'white', fontWeight: 'bold' }}>Prioritise Tenure</label>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <input type="range" min="0" max="1" step="0.01" name="stabilityWeight" value={form.stabilityWeight} onChange={handleSliderChange} />
        <span style={{ marginLeft: '10px' }}>{form.stabilityWeight}</span>
      </div>
    </div>
    <div style={{ marginBottom: '10px' }}>
      <label style={{ color: 'white', fontWeight: 'bold' }}>Prioritise Dynamism</label>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <input type="range" min="0" max="1" step="0.01" name="comfortZoneWeight" value={form.comfortZoneWeight} onChange={handleSliderChange} />
        <span style={{ marginLeft: '10px' }}>{form.comfortZoneWeight}</span>
      </div>
    </div>
    <div>
      <label style={{ color: 'white', fontWeight: 'bold' }}>Prioritise Historical Competitive Experience:</label>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <input type="range" min="0" max="1" step="0.01" name="categoryWeight" value={form.categoryWeight} onChange={handleSliderChange} />
        <span style={{ marginLeft: '10px' }}>{form.categoryWeight}</span>
      </div>
    </div>
    <div style={{ marginBottom: '10px' }}>
      <label style={{ color: 'white', fontWeight: 'bold' }}>Prioritise Recent Competitive Experience:</label>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <input type="range" min="0" max="1" step="0.01" name="recentCategoryWeight" value={form.recentCategoryWeight} onChange={handleSliderChange} />
        <span style={{ marginLeft: '10px' }}>{form.recentCategoryWeight}</span>
      </div>
    </div>
  </div>
)}




<button 
  onClick={(event) => {
    event.preventDefault();
    event.stopPropagation();
    setShowTenureDiv(!showTenureDiv);
  }}
  style={{
    color: 'white',
    fontWeight: 'bold',
    border: '1px solid white',
    borderRadius: '5px',
    padding: '10px',
    backgroundColor: 'transparent',
  }}
>
  {showTenureDiv ? 'Hide Preferred Tenure Options' : 'Show Preferred Tenure Options'}
</button>

{showTenureDiv && (
  <div style={{ marginBottom: '20px', border: '1px solid white', padding: '10px' }}>
  <div style={{ marginBottom: '10px' }}>
    <label style={{ color: 'white', fontWeight: 'bold' }}>
      Ideal Tenure from: (in years):
      <input
        type="number"
        name="stabilityThreshold"
        value={form.stableTenure}
        onChange={handleChange}
        step="0.5"
        style={{ marginLeft: '10px', border: '1px solid #ddd', padding: '5px', backgroundColor: '#f9f9f9', width: '50px', color: 'grey' }}
      />
    </label>
  </div>
  <div style={{ marginBottom: '10px' }}>
    <label style={{ color: 'white', fontWeight: 'bold' }}>
      Up to: (in years):
      <input
        type="number"
        name="comfortZoneThreshold"
        value={form.comfortZoneThreshold}
        onChange={handleChange}
        style={{ marginLeft: '10px', border: '1px solid #ddd', padding: '5px', backgroundColor: '#f9f9f9', width: '50px', color: 'grey' }}
      />
    </label>
  </div>
</div>
)}

<button 
  onClick={(event) => {
    event.preventDefault();
    event.stopPropagation();
    setShowRecentScoreDiv(!showRecentScoreDiv);
  }}
  style={{
    color: 'white',
    fontWeight: 'bold',
    border: '1px solid white',
    borderRadius: '5px',
    padding: '10px',
    backgroundColor: 'transparent',
  }}
>
  {showRecentScoreDiv ? 'Hide Recent Score Options' : 'Show Recent Score Options'}
</button>

{showRecentScoreDiv && (
  <div className="flex flex-col space-y-2" style={{ border: '1px solid white', padding: '10px' }}>
    <p className="text-white font-bold">Prioritise candidates with:</p>
    <div className="flex items-center space-x-2">
      <label htmlFor="yearsInCompany" className="text-white font-bold">At least</label>
      <input
        type="number"
        name="yearsInCompany"
        id="yearsInCompany"
        value={form.yearsInCompany}
        onChange={handleChange}
        step="0.5"
        placeholder="Years"
        style={{ width: '50px' }}
      />
      <label htmlFor="yearsInCompany" className="text-white font-bold">years of competitive experience within the last</label>
      <input
        type="number"
        name="recentYears"
        id="recentYears"
        value={form.recentYears}
        onChange={handleChange}
        step="0.5"
        placeholder="Years"
        style={{ width: '50px' }}
      />
      <label htmlFor="recentYears" className="text-white font-bold">years.</label>
    </div>
  </div>
)}


</div>
)}

<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
  <button style={{ fontWeight: 'bold', color: 'white' }} className={`border p-2 rounded-md shadow-sm hover:border-blue-500 hover:bg-gray-300 ${form.sortOverall ? 'bg-green-500 text-white' : 'bg-gray-400'}`} onClick={() => setForm({ ...form, sortOverall: !form.sortOverall })}>
    <img src="/logos/Color logo - no background.png" alt="Syphtr" className="w-40 h-auto inline-block mr-2" /> Advanced Sorting
  </button>

  <button className="p-2 rounded-full bg-green-500 text-white font-bold" type="submit">Search</button>
</div>

</form>

</div>

  {results.length > 0 && (
    <div className="fixed bottom-8 right-8 bg-white p-2 rounded-sm shadow-md z-10 w-64 border border-gray-300"> {/* Added border and border-gray-300 classes */}
    {/* Select All Profiles checkbox */}
    <div className="mt-1 flex items-center">
      <input
        type="checkbox"
        id="select-all-profiles"
        checked={selectAllProfiles}
        onChange={handleSelectAllProfiles}
        className="mr-2"
      />
      <label htmlFor="select-all-profiles">Select Enrire Results List</label>
    </div>

    {/* Job selection dropdown */}
    <div className="mt-1">
      
      <select id="job-selection" value={selectedJob} onChange={(e) => setSelectedJob(e.target.value !== '' ? Number(e.target.value) : '')} className="w-full border rounded px-2 py-1">
        <option value="">--Your Open Jobs--</option>
        {jobs.map((job) => (
          <option key={job.id} value={job.id}>{job.title}</option>
        ))}
      </select>
    </div>

    {/* Save All button */}
    <button onClick={handleSaveAllProfilesToJob} className="w-full bg-green-500 text-white rounded-md p-1 mt-1">
      Save Selected Results to Job
    </button>

    <button onClick={toggleAllExperience} className="w-full bg-blue-500 text-white rounded-md p-1 mt-1">
  Show/Hide All Experience
</button>
<button onClick={toggleAllEducation} className="w-full bg-blue-500 text-white rounded-md p-1 mt-1">
  Show/Hide All Education
</button>

    <button onClick={exportUrls}>Export URLs</button>

    {/* Results per page dropdown */}
    <div className="flex justify-between my-2">
      <label className="mr-2" htmlFor="itemsPerPage">Results:</label>
      <select 
        id="itemsPerPage" 
        value={itemsPerPage} 
        onChange={(e) => setItemsPerPage(Number(e.target.value))}
        className="border px-2 py-1 rounded"
      >
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="50">50</option>
        <option value="100">100</option>
      </select>
    </div>

    {/* Pagination controls */}
    <div className="flex justify-between my-2 space-x-2">
      <button 
        className="border px-2 py-1 rounded bg-blue-500 text-white"  
        onClick={() => {
          setCurrentPage(currentPage - 1);
          window.scrollTo(0, 0);
        }} 
        disabled={currentPage === 1}
      >
        Prev
      </button>
      <button 
        className="border px-2 py-1 rounded bg-blue-500 text-white"  
        onClick={() => {
          setCurrentPage(currentPage + 1);
          window.scrollTo(0, 0);
        }} 
        disabled={currentPage === Math.ceil(results.length / itemsPerPage)}
      >
        Next
      </button>
    </div>

    {/* Current page and total pages */}
    <div className="my-2">
      <p className="text-sm font-bold">Page: {currentPage} / {Math.ceil(results.length / itemsPerPage)}</p>
    </div>

    {/* Profiles range and total results */}
    <div className="my-2">
      <p className="text-sm font-bold">
        Profiles {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, results.length)} of {results.length} total
      </p>
    </div>
  </div>
)}

    
<div className="w-1/2 flex flex-wrap justify-between overflow-auto">
  {paginatedResults.map((profile: any, index: number) => (
    <div 
    key={profile.id} 
      className="w-full m-2 p-4 flex flex-col items-start relative rounded shadow-lg bg-white cursor-pointer" 
      onClick={() => {
        setProfileId(profile.id); // Save the profile ID in the state
        setShowModal(true); // Open the modal
      }}
    >
      <div className="flex w-full"> {/* Change to flex and add w-full */}
  <div className="flex flex-col items-start mr-4 flex-1"> {/* Add flex-1 */}
    {/* Profile picture */}
    <div className="w-32 h-32 bg-gray-400 rounded-lg overflow-hidden border mb-4"> {/* Add rounded-lg */}

{profile.profile_pic_url ? (
  <img
    src={`${process.env.NEXT_PUBLIC_API_URL}/profileimages/${profile.public_identifier}_profile_pic.jpg`}
    alt={`Profile Pic for ${profile.full_name}`}
    className="w-full h-full object-cover"
    onError={(e) => {
      e.currentTarget.src =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAE0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
    }}
  />
) : (
  <div className="w-full h-full flex items-center justify-center">
    <div className="w-28 h-28 bg-gray-300 rounded-lg" /> {/* Add rounded-lg */}
  </div>
)}
</div>

  {/* Name and other profile information */}
<div className="text-sm flex-1"> {/* Add flex-1 */}
  <div className="mb-1 font-bold text-gray-600 text-md">{profile.full_name}</div> {/* Make text grey and bold */}
  <div className="mb-1 font-bold text-gray-600 text-xs"> {/* Make text grey and bold */}
    {[profile.city, profile.state, profile.country].filter(Boolean).join(', ')}
  </div>               
  <div className="mb-1 font-bold text-gray-600 text-xs">{profile.headline}</div> {/* Make text grey and bold */}
  {/* <div className="mb-1 text-xs">{`Total Experience: ${calculateTotalExperience(profile.experiences)}`}</div>
  <div className="mb-1 text-xs">{`Total Combined Experience: ${calculateTotalCombinedExperience(profile.experiences)}`}</div> */}
  <div className="mb-1 font-bold text-blue-500 text-xs"> {/* Make text grey and bold */}
  <a 
    href={profile.linkedin_profile_url} 
    target="_blank" 
    rel="noopener noreferrer" 
    onClick={(e) => {
      e.stopPropagation();
      e.preventDefault();
      window.open(profile.linkedin_profile_url, '_blank');
    }}
  >
    <img src="/logos/LI-In-Bug.png" alt="LinkedIn Profile" className="w-5 h-4" />
  </a>

  
  
  {(profile.jobs || []).filter((job: Job) => job.userId === loggedInUserId)
    .flatMap((job: Job) => 
    
    job.candidateStages?.filter((candidateStage: CandidateStage) => candidateStage.profileId === profile.id)
      .map((candidateStage: CandidateStage) => ({...candidateStage, jobTitle: job.title, jobId: job.id})) || []
  )
  .map((item: CandidateStageWithJobTitle) => {
    const href = `/jobDetails/${item.jobId}`;

    return (
      <p key={item.id} className="font-bold text-gray-500">
        Currently at {item.stage} for 
        <button className="text-gray-500 hover:text-green-500 hover:shadow-lg" onClick={(event) => {
          event.stopPropagation();
          window.open(href, '_blank');
        }}>
          {item.jobTitle}
        </button>
      </p>
    );
  })}

</div>
</div>
</div>



      {/* Stability, Comfort Zone, Competitive, Overall Score Bars */}
<div className="ml-4 text-xxs flex-1">
  <div className="flex flex-col">

   {/* Tenure Score Bar */}
<div className="flex flex-col mb-2">
  <p className="mb-1 text-xs font-bold text-gray-700">Tenure:</p>
  <div className="w-full md:w-3/4 lg:w-1/2 xl:w-2/3 bg-gray-400 h-4 overflow-hidden relative shadow-lg rounded-full">
    <div
      className="h-full absolute left-0 bg-blue-500 shadow-lg"
      style={{
        width: `${calculateStabilityScore(profile, form.stableTenure)}%`,
      }}
    />
    <div className="absolute w-full flex items-center justify-center text-white text-xs">
      {`${calculateStabilityScore(profile, form.stableTenure).toFixed(2)}%`}
    </div>
  </div>
</div>

{/* Dynamism Score Bar */}
<div className="flex flex-col mb-2">
  <p className="mb-1 text-xs font-bold text-gray-700">Dynamism:</p>
  <div className="w-full md:w-3/4 lg:w-1/2 xl:w-2/3 bg-gray-400 h-4 overflow-hidden relative shadow-lg rounded-full">
    <div
      className="h-full absolute left-0 bg-blue-500 shadow-lg"
      style={{
        width: `${profile.comfortZoneScore}%`,
      }}
    />
    <div className="absolute w-full flex items-center justify-center text-white text-xs">
      {`${profile.comfortZoneScore.toFixed(2)}%`}
    </div>
  </div>
</div>

{/* Average of Tenure and Dynamism Score Bar */}
<div className="flex flex-col mb-2">
  <p className="mb-1 text-xs font-bold text-gray-700">Average Tenure:</p>
  <div className="w-full md:w-3/4 lg:w-1/2 xl:w-2/3 bg-gray-400 h-4 overflow-hidden relative shadow-lg rounded-full">
    <div
      className="h-full absolute left-0 bg-blue-500 shadow-lg"
      style={{
        width: `${profile.averageScore}%`,
      }}
    />
    <div className="absolute w-full flex items-center justify-center text-white text-xs">
      {`${profile.averageScore.toFixed(2)}%`}
    </div>
  </div>
</div>

{/* Competitive Score Bar */}
<div className="flex flex-col mb-2">
  <p className="mb-1 text-xs font-bold text-gray-700">Competitive:</p>
  <div className="w-full md:w-3/4 lg:w-1/2 xl:w-2/3 bg-gray-400 h-4 overflow-hidden relative shadow-lg rounded-full">
    <div
      className="h-full absolute left-0 bg-blue-500 shadow-lg"
      style={{
        width: `${profile.categoryScore.score}%`,
      }}
    />
    <div className="absolute w-full flex items-center justify-center text-white text-xs">
      {`${profile.categoryScore.score.toFixed(2)}%`}
    </div>
  </div>
</div>

{/* Recent Category Score Bar */}
<div className="flex flex-col mb-2">
  <p className="mb-1 text-xs font-bold text-gray-700">Recent Competitive:</p>
  <div className="w-full md:w-3/4 lg:w-1/2 xl:w-2/3 bg-gray-400 h-4 overflow-hidden relative shadow-lg rounded-full">
    <div
      className="h-full absolute left-0 bg-blue-500 shadow-lg"
      style={{
        width: `${profile.recentCategoryScore ? profile.recentCategoryScore : 0}%`,
      }}
    />
    <div className="absolute w-full flex items-center justify-center text-white text-xs">
      {`${profile.recentCategoryScore ? profile.recentCategoryScore.toFixed(2) : 0}%`}
    </div>
  </div>
</div>


{/* Overall Score Bar */}
<div className="flex flex-col mb-2">
  <p className="mb-1 text-xs font-bold text-gray-700">Overall:</p>
  <div className="w-full md:w-3/4 lg:w-1/2 xl:w-2/3 bg-gray-400 h-4 overflow-hidden relative shadow-lg rounded-full">
    <div
      className="h-full absolute left-0 bg-blue-500 shadow-lg"
      style={{
        width: `${profile.overallScore}%`,
      }}
    />
    <div className="absolute w-full flex items-center justify-center text-white text-xs">
      {`${profile.overallScore.toFixed(2)}%`}
    </div>
  </div>
</div>



</div>
{/* Experience and Education */}
{/* Expandable Experience section */}
<div style={{ marginLeft: '4px', marginTop: '4px', alignSelf: 'flex-start' }}>
<button
      className="text-blue-500 underline mt-2"
      onClick={(e) => {
        e.stopPropagation(); // Prevent the click event from bubbling up
        e.preventDefault(); // Prevent the default action
        toggleExperience(profile.id);
      }}
    >
      {showExperience[profile.id] ? 'Hide Experience' : 'Show Experience'}
    </button>
    {showExperience[profile.id] && (
      <div style={{ marginLeft: '4px', marginTop: '4px' }}>
      {profile.experiences?.sort((a: any, b: any) => {
        // Sorting logic...
        if (a.ends_at === null) return -1;
        if (b.ends_at === null) return 1;
        const dateA = new Date(a.starts_at);
        const dateB = new Date(b.starts_at);
        return dateB.getTime() - dateA.getTime();
      }).reduce((acc: any[], exp: any, expIndex: number) => {
        // Reduction logic...
        const lastExp = acc[acc.length - 1];
        if (lastExp && lastExp.company === exp.company) {
          lastExp.roles.push({
            title: exp.title,
            starts_at: exp.starts_at,
            ends_at: exp.ends_at,
          });
        } else {
          acc.push({
            company: exp.company,
            logo_url: exp.logo_url,
            roles: [
              {
                title: exp.title,
                starts_at: exp.starts_at,
                ends_at: exp.ends_at,
              },
            ],
          });
        }
        return acc;
      }, []).map((companyExp: any, companyExpIndex: number) => (
        <div key={companyExpIndex} className="profile-container" style={{ marginBottom: '8px', borderBottom: '1px solid #ddd' }}>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem' }}>
            {companyExp.logo_url ? (
              <img
                src={companyExp.logo_url}
                alt={`Logo for ${companyExp.company}`}
                style={{
                  width: '30px',
                  height: '30px',
                  marginRight: '4px',
                  backgroundColor: 'grey',
                  borderRadius: '5px',
                  border: '1px solid grey', // Border
                  boxShadow: '1px 1px 2.5px rgba(0, 0, 0, 0.2)', // Shadow
                }}
                onError={(e) => {
                  e.currentTarget.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAE0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
                  e.currentTarget.style.backgroundColor = 'grey';
                }}
              />
            ) : (
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  marginRight: '4px',
                  backgroundColor: 'grey',
                  borderRadius: '5px', // Rounded corners
                  border: '1px solid grey', // Border
                  boxShadow: '1px 1px 2.5px rgba(0, 0, 0, 0.2)', // Shadow
                }}
              />
            )}

            
<div>
  <p style={{ margin: 0, fontWeight: 'bold' }}>
    {companyExp.company}
    {Object.keys(companyCategories).flatMap(categoryCompany => {
      const companyExpCompanyLower = companyExp.company.toLowerCase();
      const categoryCompanyLower = categoryCompany.toLowerCase();
      const specifiedWords = specifiedWordsPerCompany[categoryCompanyLower] || [];
      
      let foundSpecifiedWords: string[] = [];

      const wordFoundInCompany = specifiedWords.find(word => {
        const wordRegex = new RegExp(`\\b${word.toLowerCase()}\\b`);
        const isWordInCompany = wordRegex.test(companyExpCompanyLower);
        const isWordInCategory = allHugeCompanyProducts[word]?.categories[categoryCompanyLower] !== undefined;
        
        return isWordInCompany && !isWordInCategory;
      });

      if (wordFoundInCompany) {
        foundSpecifiedWords.push(wordFoundInCompany);
      }

      for (let role of companyExp.roles) {
        const titleLowerCase = role.title.toLowerCase();

        const wordFoundInRole = specifiedWords.find(word => {
          const wordRegex = new RegExp(`\\b${word.toLowerCase()}\\b`);
          const isWordInTitle = wordRegex.test(titleLowerCase);
          const isWordInCategory = allHugeCompanyProducts[word]?.categories[categoryCompanyLower] !== undefined;
          
          return isWordInTitle && !isWordInCategory;
        });

        if (wordFoundInRole) {
          foundSpecifiedWords.push(wordFoundInRole);
        }
      }

      // Remove duplicates
      foundSpecifiedWords = Array.from(new Set(foundSpecifiedWords));

      const isCategoryMatch = foundSpecifiedWords.some(word => allHugeCompanyProducts[word]?.categories[categoryCompanyLower] !== undefined);
      const isTitleSpecified = foundSpecifiedWords.length > 0;

      return companyExpCompanyLower.includes(categoryCompanyLower) ? companyCategories[categoryCompany].map(category => {
        const isMainBadgeGreen = foundSpecifiedWords.some(word => Object.keys(allHugeCompanyProducts[word].categories).includes(category)) || !['sap', 'oracle', 'ibm', 'microsoft'].includes(categoryCompanyLower);        const isSmallBadgeGreen = isMainBadgeGreen;
        return (
          <>
            <span key={category} className="badge" style={{
              marginLeft: '5px',
              padding: '2px 5px',
              fontSize: '80%',
              fontWeight: '600',
              lineHeight: '1',
              color: '#fff',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              verticalAlign: 'baseline',
              borderRadius: '0.25em',
              backgroundColor: isMainBadgeGreen ? '#008000' : isCategoryMatch ? '#008000' : isTitleSpecified ? '#ff0000' : foundSpecifiedWords.length > 0 || ['sap', 'oracle', 'ibm', 'microsoft'].includes(categoryCompanyLower) ? '#007bff' : '#ff0000',              }}>
              {category}{((foundSpecifiedWords.length > 0 || ['sap', 'oracle', 'ibm', 'microsoft'].includes(categoryCompanyLower)) && !(isMainBadgeGreen && isSmallBadgeGreen)) && '*'}
            </span>
            {foundSpecifiedWords.length > 0 && (
    <>
        {foundSpecifiedWords.length > 0 && (
    <>
        {foundSpecifiedWords.map(word => (
            <span key={word} className="small-badge" style={{
                marginLeft: '5px',
                padding: '1px 3px',
                fontSize: '60%',
                fontWeight: '600',
                lineHeight: '1',
                color: '#fff',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                verticalAlign: 'baseline',
                borderRadius: '0.25em',
                backgroundColor: isMainBadgeGreen ? (
                    Object.keys(allHugeCompanyProducts[word].categories).includes(category) ? '#008000' : '#007bff'
                ) : '#007bff',
            }}>
                {Object.keys(allHugeCompanyProducts[word].categories).join(', ')}
            </span>
        ))}
        <span style={{marginLeft: '5px'}}>({foundSpecifiedWords.join(', ')})</span>
    </>
)}

    </>
            )}
          </>
        );
      }) : [];
    })}
  </p>
  {companyExp.roles.length > 1 && (
    <p style={{ margin: '0 0 0 10px', fontWeight: 'bold' }}>
      - ({calculateTotalDuration(companyExp.roles)})
    </p>
  )}

  {companyExp.roles.map((role: any) => (
    <p key={`${role.title}-${role.starts_at}-${role.ends_at || 'Present'}`} style={{ margin: '0 0 0 10px' }}>
      - {role.title}
      <br />
      {`${formatExperienceDate(role.starts_at)} - ${role.ends_at ? formatExperienceDate(role.ends_at) : 'Present'} - `}
      <span style={{ fontWeight: 'bold' }}>({formatExperienceDuration(role.starts_at, role.ends_at || new Date())})</span>
    </p>
  ))}
</div>

</div>
</div>
))}
</div>
)}
</div>


{/* Education section */}
<div style={{ marginLeft: '4px', marginTop: '4px', alignSelf: 'flex-start' }}>
<button
      className="text-blue-500 underline mt-2"
      onClick={(e) => {
        e.stopPropagation(); // Prevent the click event from bubbling up
        e.preventDefault(); // Prevent the default action
        toggleEducation(profile.id);
      }}
    >
      {showEducation[profile.id] ? 'Hide Education' : 'Show Education'}
    </button>
    {showEducation[profile.id] && (
      <div style={{ marginLeft: '4px', marginTop: '4px' }}>
              <h4 style={{ fontSize: '1rem' }}>Education</h4>
              {profile.education.map((educationItem: any, educationIndex: number) => (
                <div key={educationIndex} className="profile-container" style={{ marginBottom: '8px', borderBottom: '1px solid #ddd' }}>
                  {/* Education Logo */}
                  {educationItem.logo_url ? (
                    <img
                      src={educationItem.logo_url}
                      alt={`Logo for ${educationItem.school}`}
                      style={{ 
                        width: '30px', 
                        height: '30px', 
                        marginRight: '4px', 
                        backgroundColor: 'grey', 
                        borderRadius: '5px', 
                        border: '1px solid grey', // Border
                        boxShadow: '1px 1px 2.5px rgba(0, 0, 0, 0.2)' // Shadow
                      }}
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAE0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
                        e.currentTarget.style.backgroundColor = 'grey';
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '30px',
                        height: '30px',
                        marginRight: '4px',
                        backgroundColor: 'grey',
                        borderRadius: '5px', // Rounded corners
                        border: '1px solid grey', // Border
                        boxShadow: '1px 1px 2.5px rgba(0, 0, 0, 0.2)' // Shadow
                      }}
                    />
                  )}

                  {/* Education Details */}
                  <div style={{ fontSize: '0.8rem' }}>
                    <p style={{ margin: 0, fontWeight: 'normal' }}>{educationItem.school}</p>
                    <p>{educationItem.degree_name}</p>
                    <p>{educationItem.field_of_study}</p>
                    <p>{`${formatExperienceDate(educationItem.starts_at)} - ${educationItem.ends_at ? formatExperienceDate(educationItem.ends_at) : 'Present'}`}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        </div>


        


{/* Jobs dropdown menu and Save button */}
<div onClick={(e) => e.stopPropagation()}>
  <Select
    options={jobs.map(job => ({ value: job.id, label: job.title }))}
    values={selectedJobsByProfile[profile.id]?.map(jobId => ({ value: jobId, label: jobs.find(job => job.id === jobId)?.title })) || []}
    onChange={(selectedOptions) => handleJobSelection(selectedOptions.map(option => option.value), profile.id)}
    multi
  />


<button onClick={(e) => {
  e.stopPropagation();
  if (token && orgId) {
    handleSaveProfile(profile.id, selectedJobsByProfile[profile.id] || [], orgId, token);
  } else {
    // Handle the case where token or orgId is null
    console.error('Token or orgId is null');
  }
}} className="text-green-500 rounded-sm p-1 mt-1">
  Save to Job(s)
</button>

  <div key={profile.id} className="w-full m-2 p-4 flex flex-col items-start relative rounded shadow-lg bg-white cursor-pointer">
  <div className="flex items-center">
    <input
      type="checkbox"
      id={`profile-${profile.id}`}
      checked={selectedProfiles.includes(profile.id)}
      onChange={() => handleProfileSelection(profile.id)}
      className="form-checkbox h-5 w-5 text-gray-600 mr-2"
    />
    <label htmlFor={`profile-${profile.id}`}>Select Profile to Save</label>
  </div>
  {/* Other profile details... */}
  
</div>
  
</div>

  
</div>   
</div>
))}
</div>

</div>
</div>
);
}