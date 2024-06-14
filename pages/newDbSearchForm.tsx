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
import CustomerHeader from '../components/CustomerHeader';
import { useRouter } from 'next/router';
import { set, get, del } from 'idb-keyval';
import { FaThLarge, FaRegWindowMaximize } from 'react-icons/fa';









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

function calculateAverageCategoryScore(categoryScore: number, recentCategoryScore: number): number {
  return (categoryScore + recentCategoryScore) / 2;
}


{/* Helper function to convert years to years and months */}
const convertToYearsAndMonths = (years: number) => {
  const totalMonths = Math.round(years * 12);
  const yearsPart = Math.floor(totalMonths / 12);
  const monthsPart = totalMonths % 12;

  if (monthsPart >= 6) {
    return `${yearsPart}.5+ years`;
  } else if (yearsPart === 0) {
    return `< 1 year`;
  } else {
    return `${yearsPart}+ years`;
  }
};



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
  searchQuery: string; // Add this line
  excludeWords: string; // Add this line
  excludeCurrentCompanyWords: string; // Add this line
  selectedCandidateType: string; // Add this line
  enterprise: boolean;
  otherAccounts: boolean;
  minimumCategoryExperience: number; // Add this line
  isOpen: boolean;
  minimumRecentScore : number;


}




export default function Search() {
    
    const { user } = useUser();
  
    
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
    searchQuery: '', // Add this line
    excludeWords: '', // Add this line
    excludeCurrentCompanyWords: '', // Add this line
    selectedCandidateType: '', // Add this line
    enterprise: false,
  otherAccounts: false,
    minimumCategoryExperience: 0, // Add this line
    isOpen: false,
    minimumRecentScore: 0,
    

  });

  const [isFormCleared, setIsFormCleared] = useState(false); // Add this line

  


// Modify the useEffect hook that loads the form state
useEffect(() => {
  const savedForm = localStorage.getItem('newDbSearchFormSavedForm');
  if (savedForm) {
    setForm(JSON.parse(savedForm));
  }
}, []);

// Save the form state whenever it changes
useEffect(() => {
  localStorage.setItem('newDbSearchFormSavedForm', JSON.stringify(form));
}, [form]);

// Add a function to clear the form state
const clearForm = () => {
    setForm({
      name: '',
      city: '',
      state: '',
      country: '',
      company: '',
      experienceTitle: '',
      experienceCompany: '',
      minExperience: 0,
      maxExperience: 0,
      sortStability: false,
      sortComfortZone: false,
      sortOverall: false,
      selectedCategories: [],
      sortCategory: false,
      sortRecentCategory: false,
      minCompanies: 0,
      onlyCurrentTitle: false,
      onlyCurrentCompany: false,
      pastExperienceTitle: '',
      pastExperienceCompany: '',
      descriptionQuery: '',
      stabilityWeight: 0.25,
      comfortZoneWeight: 0.25,
      categoryWeight: 0.25,
      recentCategoryWeight: 0.25,
      stableTenure: 3,
      comfortZoneThreshold: 9,
      yearsInCompany: 2,
      recentYears: 6,
      searchQuery: '',
        excludeWords: '',
        excludeCurrentCompanyWords: '',
        selectedCandidateType: '', // Add this line
        enterprise: false,
        otherAccounts: false,
        minimumCategoryExperience: 0, // Add this line
        isOpen: true,
        minimumRecentScore: 0,

    });
    setSelectedCategories({}); // Clear selected categories
    setSelectedCandidateType(''); // Clear selected candidate type
    localStorage.removeItem('newDbSearchFormSavedForm');
    setLoadedFromStorage(false);
    setIsFormCleared(true);
  };

// Add a function to clear the candidate type
const clearCandidateType = () => {
  setForm(prevForm => ({
    ...prevForm,
    candidateType: '',
    experienceTitle: '',
    excludeWords: '',
    onlyCurrentTitle: false,
    selectedCandidateType: '',
    enterprise: false, // Add this line
    otherAccounts: false, // Add this line
  }));

  setSelectedCandidateType(''); // Clear selected candidate type
};

  

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

  {/* console.log('Session:', session);
  console.log('Token:', token); */}



  useEffect(() => {
    const getOrgId = async () => {
      if (session) {
        const token = await session.getToken();
        {/* console.log('Token:', token); // Log the token */}
  
        if (token) {
          // Decode the token
          const decodedToken = jwt.decode(token);
          {/* console.log('decodedToken:', decodedToken); */}
          let orgId = '';
          if (typeof decodedToken === 'object' && decodedToken !== null) {
            orgId = 'org_id' in decodedToken ? decodedToken.org_id : '';
          }
          {/* console.log('orgId:', orgId); */}
  
          // Set orgId as a state variable
          setOrgId(orgId);
        } else {
          console.error('Token is null');
        }
      }
    };
  
    getOrgId();
  }, [session]);



  const getTalentPools = async () => {
  if (session && user && user.id) {
    const token = await session.getToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/talentPools`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return data;
  }
};

  const saveCandidateToTalentPool = async (talentPoolId: number, profileId: number) => {
    if (session && user && user.id) { // Check if user and user.id are defined
      const token = await session.getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/talentPools/${talentPoolId}/candidates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`, // Include the Authorization header
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profileId: profileId }),
      });
      const data = await response.json();
      return data;
    }
  };




  const handleSaveProfile = async (profileId: number, jobIds: number[], orgId: string, token: string) => {
  // Check if any jobs have been selected
  if (jobIds.length === 0) {
    window.alert('Please select at least one job.');
    return;
  }

  // Find the profile in the results array
// Find the profile in the results array
const profile = results && results.profiles.find(profile => profile.id === profileId);  if (profile) {
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
const handleCloseModal = () => {
  setShowModal(false);
};
  const loggedInUserId = user ? user.id : null;
  const [results, setResults] = useState<Results>({
    profiles: [],
    total: 0,
    page: 1,
    totalPages: 0,
  });
    const [enableColoredBorder, setEnableColoredBorder] = useState(false);
  const [showStability, setShowStability] = useState(false);
  const [sortedResults, setSortedResults] = useState<any[]>([]);
  // At the top of your component, after other useState declarations
const [selectedCategories, setSelectedCategories] = useState<{ [key: string]: boolean }>({});
// Add new state variables
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(25);
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
  const currentUserId = user?.id;
  const [notifications, setNotifications] = useState([]);
  const [loadedFromStorage, setLoadedFromStorage] = useState(false);
  const [selectedCandidateType, setSelectedCandidateType] = useState('');
  const router = useRouter();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSingleColumn, setIsSingleColumn] = useState<boolean>(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [showDivCategory, setShowDivCategory] = useState(false);

  


  useEffect(() => {
    const savedIsSingleColumn = localStorage.getItem('isSingleColumn');
    if (savedIsSingleColumn) {
      setIsSingleColumn(JSON.parse(savedIsSingleColumn));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('isSingleColumn', JSON.stringify(isSingleColumn));
  }, [isSingleColumn]);
 
  
  
  interface Results {
    profiles: any[];
    total: number;
    page: number;
    totalPages: number;
  }


  
  interface Profile {
    totalExperience: string;
    // other properties...
  }



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
  // Check if results and results.profiles are not null
  if (results && results.profiles) {
    // Get the IDs of all profiles
    const profileIds = results.profiles.map(profile => profile.id);

    // Update the showExperience state
    setShowExperience(prevState => {
      const newState = { ...prevState };
      profileIds.forEach(profileId => {
        newState[profileId] = !newState[profileId];
      });
      return newState;
    });
  }
};

// Toggle the visibility of all education sections
const toggleAllEducation = () => {
  // Check if results and results.profiles are not null
  if (results && results.profiles) {
    // Get the IDs of all profiles
    const profileIds = results.profiles.map(profile => profile.id);

    // Update the showEducation state
    setShowEducation(prevState => {
      const newState = { ...prevState };
      profileIds.forEach(profileId => {
        newState[profileId] = !newState[profileId];
      });
      return newState;
    });
  }
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
  // Check if results and results.profiles are not null
  if (results && results.profiles) {
    const urls = results.profiles.map(profile => JSON.stringify({
      url: profile.linkedin_profile_url,
      comfortZoneScore: profile.comfortZoneScore,
      categoryScore: profile.categoryScore,
      overallScore: profile.overallScore,
      stabilityScore: profile.stabilityScore,
      recentCategoryScore: profile.recentCategoryScore, // Add this line
    }));
    setLinkedInUrls(urls);
  }
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


const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const { name, checked } = event.target;
  setForm(prevForm => ({
    ...prevForm,
    [name]: checked,
  }));

  if (name === 'enterprise') {
    if (checked) {
      // Append 'AND Enterprise' to the form
      setForm(prevForm => ({
        ...prevForm,
        experienceTitle: prevForm.experienceTitle ? `${prevForm.experienceTitle} AND Enterprise` : 'Enterprise'
      }));
    } else {
      // Remove 'AND Enterprise' from the form
      setForm(prevForm => ({
        ...prevForm,
        experienceTitle: prevForm.experienceTitle.replace(/ AND Enterprise|Enterprise/g, '')
      }));
    }
} else if (name === 'otherAccounts') {
    if (checked) {
      // Append 'AND midmarket, Mid-market, commercial' to the form
      setForm(prevForm => ({
        ...prevForm,
        experienceTitle: prevForm.experienceTitle ? `${prevForm.experienceTitle} AND Midmarket, Mid-market, Commercial` : 'Midmarket, Mid-market, Commercial'
      }));
    } else {
      // Remove 'AND midmarket, Mid-market, commercial' from the form, case insensitive
      setForm(prevForm => ({
        ...prevForm,
        experienceTitle: prevForm.experienceTitle.replace(/(\s+AND\s+)?Midmarket, Mid-market, Commercial/gi, '').trim()
      }));
    }
  }
};




const handleSelectAllProfiles = (e: React.ChangeEvent<HTMLInputElement>) => {
  setSelectAllProfiles(e.target.checked);

  if (e.target.checked) {
    // Check if results and results.profiles are not null
    if (results && results.profiles) {
      setSelectedProfiles(results.profiles.map(profile => profile.id));
    }
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
  
    // Check if results and results.profiles are not null
    if (results && results.profiles) {
      for (const profileId of selectedProfiles) {
        const profile = results.profiles.find(profile => profile.id === profileId);
  
        if (profile) {
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
  let newCompanyCategories = { ...companyCategories };
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

        for (const company of companyNames) {
          if (!newCompanyCategories[company]) {
            newCompanyCategories[company] = [];
          }
          if (!newCompanyCategories[company].includes(category)) {
            newCompanyCategories[company].push(category);
          }
          allCompanyNames.add(company);
        }

        // Save the company names to local storage under the category key
        localStorage.setItem(category, JSON.stringify(companyNames));
      } catch (error) {
        console.error(error);
      }
    } else {
      // Remove the category from all companies if it's not selected
      for (const company in newCompanyCategories) {
        newCompanyCategories[company] = newCompanyCategories[company].filter(cat => cat !== category);
        if (newCompanyCategories[company].length === 0) {
          allCompanyNames.delete(company);
        }
      }

      // Remove the category from local storage if it's not selected
      localStorage.removeItem(category);
    }
  }

  // Update the companyCategories state
  setCompanyCategories(newCompanyCategories);

  // Update the form with the company names
  setForm(prevForm => {
    const newCompanies = Array.from(allCompanyNames);
    return { ...prevForm, experienceCompany: newCompanies.join(', ') };
  });
};




useEffect(() => {
  // Set loading to true
  setIsLoading(true);

  // Check if results and results.profiles are not null
  if (results && results.profiles) {
    // Copy the results.profiles array
    let sortedData = [...results.profiles];

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
  }

  // Set loading to false
  setIsLoading(false);

  {/* console.log('Sorted data:', sortedData); */}

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

// Load the currentPage state from the URL when the component mounts
useEffect(() => {
  const { page } = router.query;
  if (page) {
    setCurrentPage(Number(page));
  } else {
    // Load the currentPage state from IndexedDB if it's not in the URL
    const loadFromIndexedDB = async () => {
      const savedCurrentPage = await get('CurrentPage');
      console.log('Loaded currentPage from IndexedDB:', savedCurrentPage);
      if (savedCurrentPage) {
        setCurrentPage(Number(savedCurrentPage));
      }
    };
    loadFromIndexedDB();
  }
}, [router.query]);




// Update IndexedDB whenever the results state changes
useEffect(() => {
  if (results && results.profiles && results.profiles.length > 0) {
    console.log('Saving results to IndexedDB:', results);
    set('Results', results);
  }
}, [results]);

// Load the results state from IndexedDB when the component mounts
useEffect(() => {
  const loadFromIndexedDB = async () => {
    const savedResults = await get('Results');
    console.log('Loaded results from IndexedDB:', savedResults);
    if (savedResults && savedResults.profiles && savedResults.profiles.length > 0) {
      setResults(savedResults);
      setCurrentPage(savedResults.page); // Set the currentPage state to the saved page number
    }
  };

  loadFromIndexedDB();
}, []);


const fetchData = async (page: number): Promise<Results> => {
  setIsLoading(true);
  let results: Results = {
    profiles: [],
    total: 0,
    page: 1,
    totalPages: 0,
  };

  try {
    const { sortStability, ...filledFormFields } = form;
    const selectedCategoryNames = Object.keys(selectedCategories).filter(category => selectedCategories[category]);
    const minimumCategoryExperience = form.minimumCategoryExperience || 0;

    if (!session) {
      throw new Error('Session is not defined');
    }

    const token = await session.getToken();
    const headers = { 'Authorization': `Bearer ${token}` };

    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/profiles/`, { 
      params: { 
        ...filledFormFields, 
        selectedCategoryNames, 
        minimumCategoryExperience, 
        minCompanies: form.minCompanies,
        minExperience: form.minExperience,
        maxExperience: form.maxExperience,
        minimumRecentScore: form.minimumRecentScore, // Add this line

        page, // Include the page parameter in the API request
        pageSize: 25 
      }, 
      headers 
    });
    
    let data = Array.isArray(response.data.profiles) ? response.data.profiles : [];

    data = await Promise.all(data.map(async (profile: any) => {
      const categoryScore = await calculateCategoryScore(profile.experiences, selectedCategoryNames);
      const stabilityScore = calculateStabilityScore(profile, form.stableTenure);
      const recentCategoryScore = await calculateRecentCategoryScore(profile.experiences, selectedCategoryNames, form.recentYears, form.yearsInCompany);
      const comfortZoneScore = calculateComfortZoneScore(profile.experiences, form.comfortZoneThreshold);
      const averageScore = calculateAverageScore(stabilityScore, comfortZoneScore);

      return {
        ...profile,
        totalExperience: calculateTotalExperience(profile.experiences),
       
        totalCombinedExperience: calculateTotalCombinedExperience(profile.experiences),
        comfortZoneScore: comfortZoneScore,
        categoryScore: categoryScore,
        overallScore: await calculateOverallScore(profile, selectedCategoryNames, form.stabilityWeight, form.comfortZoneWeight, form.categoryWeight, form.recentCategoryWeight, form.stableTenure, form.comfortZoneThreshold, form.recentYears, form.yearsInCompany),        
        stabilityScore: stabilityScore,
        recentCategoryScore: recentCategoryScore,
        averageScore: averageScore,
      };
    }));

   {/* if (sortStability) {
      data = data.sort((a: { stabilityScore: number }, b: { stabilityScore: number }) => b.stabilityScore - a.stabilityScore);
    } */}

    results = {
      profiles: data,
      total: response.data.total,
      page: response.data.page,
      totalPages: response.data.totalPages,
    };

    // Store the fetched profiles in IndexedDB
    await set('Profiles', results.profiles);

    setResults(results);
    setCurrentPage(page);

  } catch (error) {
    console.error(error);
  } finally {
    setIsLoading(false);
  }

  return results;
};

const handleSubmit = async (event: FormEvent) => {
  event.preventDefault();

  

  if (isFormCleared) {
    setIsFormCleared(false);
    return;
  }

  {/* // Check if country is selected
   if (!form.country) {
    alert('Please select a country before searching.');
    return;
  } */}
  // Set loading state to true
  setIsLoading(true);

  // Reset the current page to 1
  setCurrentPage(1);

  // Set the formSubmitted flag to true
  setFormSubmitted(true);

  try {
    const { sortStability, ...filledFormFields } = form;
    const selectedCategoryNames = Object.keys(selectedCategories).filter(category => selectedCategories[category]);
    const minimumCategoryExperience = form.minimumCategoryExperience || 0;

    if (!session) {
      throw new Error('Session is not defined');
    }

    const token = await session.getToken();
    const headers = { 'Authorization': `Bearer ${token}` };

    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/profiles/`, { 
      params: { 
        ...filledFormFields, 
        selectedCategoryNames, 
        minimumCategoryExperience, 
        minExperience: form.minExperience,
        maxExperience: form.maxExperience,
        minCompanies: form.minCompanies,
        minimumRecentScore: form.minimumRecentScore, // Add this line

        page: currentPage, 
        pageSize: 25 
      }, 
      headers 
    });

    let data = Array.isArray(response.data.profiles) ? response.data.profiles : [];

    data = await Promise.all(data.map(async (profile: any) => {
      const categoryScore = await calculateCategoryScore(profile.experiences, selectedCategoryNames);
      const stabilityScore = calculateStabilityScore(profile, form.stableTenure);
      const recentCategoryScore = await calculateRecentCategoryScore(profile.experiences, selectedCategoryNames, form.recentYears, form.yearsInCompany);
      const comfortZoneScore = calculateComfortZoneScore(profile.experiences, form.comfortZoneThreshold);
      const averageScore = calculateAverageScore(stabilityScore, comfortZoneScore);

      return {
        ...profile,
        totalExperience: calculateTotalExperience(profile.experiences),
        
        totalCombinedExperience: calculateTotalCombinedExperience(profile.experiences),
        comfortZoneScore: comfortZoneScore,
        categoryScore: categoryScore,
        overallScore: await calculateOverallScore(profile, selectedCategoryNames, form.stabilityWeight, form.comfortZoneWeight, form.categoryWeight, form.recentCategoryWeight, form.stableTenure, form.comfortZoneThreshold, form.recentYears, form.yearsInCompany),        
        stabilityScore: stabilityScore,
        recentCategoryScore: recentCategoryScore,
        averageScore: averageScore,
      };
    }));

   

    let filteredData = Array.isArray(response.data.profiles) ? response.data.profiles : [];

  
  
    // Sorting logic based on stability score
{/* if (sortStability) {
  data = data.sort((a: { stabilityScore: number }, b: { stabilityScore: number }) => b.stabilityScore - a.stabilityScore);
} */}

setResults({
  profiles: data,
  total: response.data.total,
  page: response.data.page,
  totalPages: response.data.totalPages,
});
  } catch (error) {
    console.error(error);
  } finally {
    // Set loading state to false once data has been fetched and processed
    setIsLoading(false);
  }
};

const handleNext = async () => {
  // Check if results is not null and there's a next page
  if (results && currentPage < results.totalPages) {
    // Calculate the next page number
    const nextPage = currentPage + 1;

    console.log('Current page:', currentPage, 'Next page:', nextPage); // Add this line

    // Update the current page state
    setCurrentPage(nextPage);

    // Fetch the next page of results
    const newResults = await fetchData(nextPage);

    // Update the results
    setResults(newResults);

    // Scroll to the top of the page
    window.scrollTo(0, 0);
  }
};

const handlePrevious = async () => {
  // Check if there's a previous page
  if (currentPage > 1) {
    // Calculate the previous page number
    const prevPage = currentPage - 1;

    console.log('Current page:', currentPage, 'Previous page:', prevPage); // Add this line

    // Update the current page state
    setCurrentPage(prevPage);

    // Fetch the previous page of results
    const newResults = await fetchData(prevPage);

    // Update the results
    setResults(newResults);

    // Scroll to the top of the page
    window.scrollTo(0, 0);
  }
};

// Add a useEffect hook that fetches the data when the form is submitted
useEffect(() => {
  if (formSubmitted) {
    fetchData(1);
    setFormSubmitted(false);  // Reset the flag after fetching the data
  }
}, [formSubmitted]);

const toggleMoreInfo = (index: number) => {
  setResults((prevResults) => {
    if (prevResults && prevResults.profiles) {
      const updatedResults = { ...prevResults };
      updatedResults.profiles[index].isExpanded = !updatedResults.profiles[index].isExpanded;
      return updatedResults;
    }
    return prevResults;
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



const paginatedResults = sortedResults;

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

const applyPresetSearchParamsLeadershipSales = () => {
  setForm(prevForm => ({
    ...prevForm,
    ...presetSearchParamsLeadershipSales,
    experienceTitle: presetSearchParamsLeadershipSales.experienceTitle,
    enterprise: false, // Reset the checkbox
    otherAccounts: false, // Reset the checkbox
  }));
};

 // Define your preset search parameters
 const presetSearchParamsSales = {
  experienceTitle: 'Account',
  onlyCurrentTitle: true,
  excludeWords: ['Professional Services', 'Education', 'Healthcare', 'Inside', 'consulting',  'Junior', 'Development', 'PreSales', 'Engineer',  'Customer Success', 'Accounting', 'Accountant', 'Recruiter', 'Recruitment', 'VP', 'Leader', 'Renewal'].join(', ')
  // Add other fields as needed...
};

// Function to apply preset search parameters for sales
const applyPresetSearchParamsSales = () => {
  setForm(prevForm => ({
    ...prevForm,
    ...presetSearchParamsSales,
    experienceTitle: presetSearchParamsSales.experienceTitle,
    enterprise: false, // Reset the checkbox
    otherAccounts: false, // Reset the checkbox
  }));
};

// Define your preset search parameters for pre-sales
const presetSearchParamsPreSales = {
  experienceTitle: ['PreSales', 'Sales Engineer', 'Solutions Engineer'].join(', '), 
  onlyCurrentTitle: true,
  excludeWords: ['Professional Services', 'Manager', 'Director'].join(', ')
  // Add other fields as needed...
};

const applyPresetSearchParamsPreSales = () => {
  setForm(prevForm => ({
    ...prevForm,
    ...presetSearchParamsPreSales,
    experienceTitle: presetSearchParamsPreSales.experienceTitle,
    enterprise: false, // Reset the checkbox
    otherAccounts: false, // Reset the checkbox
  }));
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
  setForm(prevForm => ({
    ...prevForm,
    ...presetSearchParamsProfServices,
    experienceTitle: presetSearchParamsProfServices.experienceTitle,
    enterprise: false, // Reset the checkbox
    otherAccounts: false, // Reset the checkbox
  }));
};

// Define your preset search parameters for Business Development/Sales Development Reps
const presetSearchParamsBDR = {
  experienceTitle: ['BDR', 'SDR', 'Business Development Representative', 'Sales Development Representative', 'Sales Development Rep', 'Business Development Rep'].join(', '),
  onlyCurrentTitle: true,
  excludeWords: ['Professional Services', 'Education', 'Healthcare', 'Inside', 'consulting',  'Junior', 'Development', 'PreSales', 'Engineer',  'Customer Success', 'Accounting', 'Accountant', 'Recruiter', 'Recruitment', 'VP', 'Leader', 'Renewal'].join(', ')
  // Add other fields as needed...
};

// Function to apply preset search parameters for BDR
const applyPresetSearchParamsBDR = () => {
  setForm(prevForm => ({
    ...prevForm,
    ...presetSearchParamsBDR,
    experienceTitle: presetSearchParamsBDR.experienceTitle,
    enterprise: false, // Reset the checkbox
    otherAccounts: false, // Reset the checkbox
  }));
};

function getTicks(score: number) {
  if (score >= 95) return 5;
  if (score >= 80) return 4;
  if (score >= 70) return 3;
  if (score >= 60) return 2;
  if (score >= 50) return 1;
  return 0;
}


  return (
    <div className="flex flex-col pt-20" style={{
      backgroundImage: 'radial-gradient(circle, transparent 1px, #f0f0f0 1px)', // #f0f0f0 is a lighter shade of grey
      backgroundSize: '20px 20px',
      backgroundColor: 'white'
    }}>
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-50 z-50">
          <div className="flex flex-col items-center">
            <BeatLoader color="#123abc" size={24} />
            <p className="mt-2 text-lg font-semibold text-gray-700 px-32 text-center">
              Syphting...
            </p>
          </div>
        </div>
      )}
     <CustomerHeader userId={currentUserId} notifications={notifications} setNotifications={setNotifications} />
     

<div className="flex">
  
{form.isOpen && <div className="fixed inset-0 z-10 block sm:hidden"></div>}
<div className={`lg:w-1/4 md:w-1/2 sm:w-1/2 w-1/2 h-screen bg-gray-300 p-4 sm:p-8 rounded-sm shadow-lg sticky top-0 overflow-auto border-4 border-gray-300 mt-16 ${form.isOpen ? 'open z-20' : 'closed'}`}>
  
  <form onSubmit={handleSubmit} className="space-y-4">
  <div style={{ backgroundColor: '#C0C0C0', padding: '20px', borderRadius: '5px' }}>

    <div className="mt-2">
      <div className="flex flex-col">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select software categories
        </label>
        <Select
          placeholder="Select Categories"
          options={categories.map(category => ({ value: category, label: category }))}
          values={form.selectedCategories.map(category => ({ value: category, label: category }))}
          onChange={(selectedOptions) => {
            const newSelectedCategories = selectedOptions ? selectedOptions.map(option => option.value) : [];
            handleCategorySelection(newSelectedCategories);
            setForm(prevForm => ({
              ...prevForm,
              selectedCategories: newSelectedCategories,
            }));
          }}
          multi
          style={{
            borderColor: 'white',
          }}
        />
      </div>
<button 
  type="button" 
  onClick={() => setShowDivCategory(!showDivCategory)}
  style={{ backgroundColor: showDivCategory ? '#E07A5F' : '#81B29A', color: '#fff' }}
  className="w-full text-white rounded-md p-1 mt-1 text-xxs sm:text-xs font-bold pt-2"
>
  {showDivCategory ? 'Hide' : 'Show'} More Category Options
</button>
{showDivCategory && (
          <>
     <div className="flex items-center pt-4">
  <label className="text-black mr-2">
    Min Years Category Exp:
  </label>
  <input
    type="number"
    name="minimumCategoryExperience"
    value={form.minimumCategoryExperience}
    onChange={event => setForm({ ...form, minimumCategoryExperience: Number(event.target.value) })}
    className="w-16 border p-2 rounded-md hover:border-blue-500 hover:bg-gray-100"
    min="0"
  />
</div>

<div className="pt-4">
  <label htmlFor="minimumRecentScore">Only Show Profiles With Recent Expereince in Chosen Category:</label>
  <input 
    type="checkbox" 
    id="minimumRecentScore" 
    name="minimumRecentScore" 
    checked={form.minimumRecentScore === 50} 
    onChange={e => setForm({ ...form, minimumRecentScore: e.target.checked ? 50 : 0 })}
  />
</div>



<div className="flex flex-col space-y-2 pt-4">
  <p className="text-black">Prioritise people with:</p>
  <div className="flex flex-col space-y-2">
    <label htmlFor="yearsInCompany" className="text-black">At least</label>
    <input
      type="number"
      name="yearsInCompany"
      id="yearsInCompany"
      value={form.yearsInCompany}
      onChange={handleChange}
      step="0.5"
      placeholder="Years"
      className="w-16 border p-2 rounded-md hover:border-blue-500 hover:bg-gray-100"
    />
    <label htmlFor="yearsInCompany" className="text-black">Years of competitive experience in the last</label>
    <input
      type="number"
      name="recentYears"
      id="recentYears"
      value={form.recentYears}
      onChange={handleChange}
      step="0.5"
      placeholder="Years"
      className="w-16 border p-2 rounded-md hover:border-blue-500 hover:bg-gray-100"
    />
    <label htmlFor="recentYears" className="text-black">years.</label>
  </div>
</div>


</>
    )}
</div>

</div>


<div style={{ backgroundColor: '#C0C0C0', padding: '20px', borderRadius: '5px' }}>

<div className="flex flex-col">
  <label className="text-black mb-2">
    Candidate Type
  </label>
  <select 
    value={form.selectedCandidateType}
    onChange={(e) => {
      const newCandidateType = e.target.value;
      setForm(prevForm => ({
        ...prevForm,
        selectedCandidateType: newCandidateType,
      }));
      if (newCandidateType === '') {
        clearCandidateType();
      } else {
        switch(newCandidateType) {
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
          case 'bdr': // Add this case
            applyPresetSearchParamsBDR();
            break;
          default:
            break;
        }
      }
    }}
    className="w-full"
  >
    <option value="">Please Select</option>
    <option value="leadershipSales">Search for Sales Leaders</option>
    <option value="sales">Search for Account Execs</option>
    <option value="preSales">Search for PreSales</option>
    <option value="profServices">Search for Prof Services</option>
    <option value="bdr">Search for BDR/SDR</option> {/* Add this option */}
  </select>
</div>

<div className="flex flex-col">
  <label>
    <input
      type="checkbox"
      name="enterprise"
      checked={form.enterprise}
      onChange={handleCheckboxChange}
    />
    Enterprise
  </label>
  <label>
    <input
      type="checkbox"
      name="otherAccounts"
      checked={form.otherAccounts}
      onChange={handleCheckboxChange}
    />
    Commercial/MidMarket
  </label>
</div>

<div>
  <button 
    type="button" 
    onClick={() => setIsFormVisible(!isFormVisible)}
    style={{ backgroundColor: isFormVisible ? '#E07A5F' : '#81B29A', color: '#fff' }}
    className="w-full text-white rounded-md p-1 mt-1 text-xxs sm:text-xs font-bold pt-2"
  >
    {isFormVisible ? 'Hide' : 'Show'} More Candidate Options
  </button>
  {isFormVisible && (
    <>

<div className="flex space-x-4">
  <div>
    <label className="pr-2" htmlFor="minExperience">Min Exp</label>
    <input 
      className="w-16 border p-2 rounded-md hover:border-blue-500 hover:bg-gray-100" 
      type="number" 
      id="minExperience"
      name="minExperience" 
      placeholder="Min years Experience" 
      onChange={handleChange} 
      min="0" 
      value={form.minExperience || ''} 
    />
  </div>

  <div>
    <label className="pr-2" htmlFor="maxExperience">Max Exp</label>
    <input 
      className="w-16 border p-2 rounded-md hover:border-blue-500 hover:bg-gray-100" 
      type="number" 
      id="maxExperience"
      name="maxExperience" 
      placeholder="Max years Experience" 
      onChange={handleChange} 
      min="0" 
      value={form.maxExperience || ''} 
    />
  </div>
</div>

<div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
  <label 
    style={{ 
      marginRight: '10px', 
      fontSize: '16px', 
      color: '#000' // Change this to make the text black
    }}
  >
    Min Employers On Resume:
  </label>
  <select 
    value={form.minCompanies || ''} // Add this line
    onChange={(e) => {
      const value = Number(e.target.value);
      setMinCompaniesInput(value);
      setForm({ ...form, minCompanies: value });
    }} 
    className="border p-2 rounded-md hover:border-blue-500 hover:bg-gray-100"
  >
    <option value="1">1</option>
    <option value="2">2</option>
    <option value="3">3</option>
    <option value="4">4</option>
    <option value="5">5</option>
    {/* Add more options as needed */}
  </select>
</div>

<div style={{ marginBottom: '20px' }}>
  <div style={{ marginBottom: '10px' }}>
    <label style={{ color: 'black' }}>
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
    <label style={{ color: 'black' }}>
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

   </>
  )}
</div>

</div>





<button 
  onClick={(e) => {
    e.preventDefault();
    setShowDiv(!showDiv);
  }}
  style={{ backgroundColor: '#81B29A', color: '#fff' }}
  className="w-full text-white rounded-md p-1 mt-1 text-xxs sm:text-xs font-bold"
>
  {showDiv ? 'Close Manual Search ▲' : 'Open Manual Search  ▼'}
</button>

<button 
  onClick={clearForm} 
  style={{ backgroundColor: '#81B29A', color: '#fff' }}
  className="w-full text-white rounded-md p-1 mt-1 text-xxs sm:text-xs font-bold"
>
  Clear form
</button>

<button 
  type="button" 
  onClick={() => setForm({ ...form, isOpen: !form.isOpen })} 
  style={{ backgroundColor: '#81B29A', color: '#fff' }}
  className="w-full text-white rounded-md p-1 mt-1 text-xxs sm:text-xs"
>
  {form.isOpen ? '← Close Search Form' : 'Open Search Form'}
</button>

            {showDiv && (
            <div className="shadow-lg p-4">
                <div className="flex flex-col space-y-2">
                <input 
            type="text" 
            name="name" 
            placeholder="Name" 
            onChange={handleChange} 
            value={form.name || ''} // Add this line
            className="border p-2 rounded-md hover:border-blue-700 hover:bg-gray-100"
            />
       <input 
  className="border p-2 rounded-md hover:border-blue-500 hover:bg-gray-100" 
  type="text" 
  name="city" 
  placeholder="City" 
  onChange={handleChange} 
  value={form.city || ''} // Add this line
/>

<input 
  className="border p-2 rounded-md hover:border-blue-500 hover:bg-gray-100" 
  type="text" 
  name="state" 
  placeholder="State" 
  onChange={handleChange} 
  value={form.state || ''} // Add this line
/>

<input 
  className="border p-2 rounded-md hover:border-blue-500 hover:bg-gray-100" 
  type="text" 
  name="country" 
  placeholder="Country" 
  onChange={handleChange} 
  value={form.country || ''} // Add this line
/>

<input 
  className="border p-2 rounded-md hover:border-blue-500 hover:bg-gray-100" 
  type="text" 
  name="pastExperienceTitle" 
  placeholder="Past Job Title" 
  onChange={handleChange} 
  value={form.pastExperienceTitle || ''} // Add this line
/>
<input 
  className="border p-2 rounded-md hover:border-blue-500 hover:bg-gray-100" 
  type="text" 
  name="pastExperienceCompany" 
  placeholder="Past Company Name" 
  onChange={handleChange} 
  value={form.pastExperienceCompany || ''} // Add this line
/>

<div className="flex items-center space-x-2">
  <input 
    className="border p-2 rounded-md hover:border-blue-500 hover:bg-gray-100" 
    type="text" 
    name="experienceTitle" 
    placeholder="Job Title" 
    onChange={handleChange} 
    value={form.experienceTitle || ''} 
  />

  <input
    type="checkbox"
    name="onlyCurrentTitle"
    id="onlyCurrentTitle"
    checked={form.onlyCurrentTitle}
    onChange={handleChange}
  />
  <label htmlFor="onlyCurrentTitle" className={`${form.onlyCurrentTitle ? 'text-blue-500' : 'text-white'} font-bold`}>Current?</label>
</div>

<div className="flex items-center space-x-2">
  <input 
    className="border p-2 rounded-md hover:border-blue-500 hover:bg-gray-100" 
    type="text" 
    name="experienceCompany" 
    placeholder="Company Name" 
    onChange={handleChange} 
    value={form.experienceCompany || ''} 
  />

  <input
    type="checkbox"
    name="onlyCurrentCompany"
    id="onlyCurrentCompany"
    checked={form.onlyCurrentCompany}
    onChange={handleChange}
  />
  <label htmlFor="onlyCurrentCompany" className={`${form.onlyCurrentCompany ? 'text-blue-500' : 'text-white'} font-bold`}>Current?</label>
</div>



<label htmlFor="descriptionQuery" className="text-white font-bold">Search Role Descriptions:</label>

<input
  className="border p-2 rounded-md hover:border-blue-500 hover:bg-gray-100"
  type="text"
  id="descriptionQuery"
  name="descriptionQuery"
  value={form.descriptionQuery || ''} // This line is already correct
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
    value={form.excludeWords || ''} // Add this line
    className="border p-2 rounded-md hover:border-blue-500 hover:bg-gray-100 w-full"
  />

  <label htmlFor="excludeCurrentCompanyWords" className="text-white font-bold">Exclude Words From Current Company:</label>
  <input 
    type="text" 
    id="excludeCurrentCompanyWords" 
    name="excludeCurrentCompanyWords" 
    placeholder="Enter company words to exclude, separated by commas" 
    onChange={handleChange}
    value={form.excludeCurrentCompanyWords || ''} // Add this line
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





{/* <button 
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

*/}






</div>
)}

<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
  <button 
    style={{ backgroundColor: '#81B29A', color: '#fff' }}
    className="w-full text-white rounded-md p-1 mt-1 text-xxs sm:text-xs font-bold" 
    type="submit"
  >
    Search
  </button>
</div>

<span className="text-white font-bold">Upload:</span>
<span className="flex items-center">
  <span 
    className="text-white font-bold hover:text-blue-500 transition duration-300 ease-in-out cursor-pointer text-sm"
    onClick={() => window.open(`${process.env.NEXT_PUBLIC_APP_CV_URL}?orgId=${orgId}`, '_blank', 'height=300,width=400')}
  >
    CVs
  </span>
  <span className="mx-1">/</span>
  <span 
    className="text-white font-bold hover:text-blue-500 transition duration-300 ease-in-out cursor-pointer text-sm"
    onClick={() => window.open(`${process.env.NEXT_PUBLIC_APP_PDF_URL}?orgId=${orgId}`, '_blank', 'height=300,width=400')}
  >
    LinkedIn PDFs
  </span>
</span>

</form>

</div>

{results && results.profiles && results.profiles.length > 0 && (
  <div className="fixed bottom-4 right-4 bg-white p-1 rounded-sm shadow-md z-10 w-36 sm:w-28 md:w-48 lg:w-64 border border-gray-300"> {/* Further reduced width */}
    {/* Select All Profiles checkbox */}
    <div className="mt-1 flex items-center text-xs sm:text-sm">
      <input
        type="checkbox"
        id="select-all-profiles"
        checked={selectAllProfiles}
        onChange={handleSelectAllProfiles}
        className="mr-1"
      />
      <label htmlFor="select-all-profiles">Select Entire Page</label>
    </div>

    {/* Job selection dropdown */}
    <div className="mt-1">
      <select
        id="job-selection"
        value={selectedJob}
        onChange={(e) => setSelectedJob(e.target.value !== '' ? Number(e.target.value) : '')}
        className="w-full border rounded px-1 py-1 text-xs sm:text-sm"
      >
        <option value="">--Your Open Jobs--</option>
        {jobs.map((job) => (
          <option key={job.id} value={job.id}>{job.title}</option>
        ))}
      </select>
    </div>

    {/* Save All button */}
<button 
  onClick={handleSaveAllProfilesToJob} 
  style={{ backgroundColor: '#81B29A', color: '#fff' }}
  className="w-full text-white rounded-md p-1 mt-1 text-xxs sm:text-xs"
>
  Save to Job
</button>

   {/*   <button onClick={toggleAllExperience} className="w-full bg-blue-500 text-white rounded-md p-1 mt-1 text-xs sm:text-sm">
      Show/Hide All Experience
    </button>
    <button onClick={toggleAllEducation} className="w-full bg-blue-500 text-white rounded-md p-1 mt-1 text-xs sm:text-sm">
      Show/Hide All Education
    </button>  */}

    {/*  <button onClick={exportUrls} className="w-full bg-blue-500 text-white rounded-md p-1 mt-1 text-xs sm:text-sm">
      Export URLs
    </button> */}

     {/* Results per page dropdown */}
     <div className="flex justify-between my-1 text-xxs sm:text-xs">
   {/*   <button style={{ fontWeight: 'bold', color: 'white' }} className={`border p-1 rounded-md shadow-sm hover:border-blue-500 hover:bg-gray-300 ${form.sortOverall ? 'bg-green-500 text-white' : 'bg-gray-400'}`} onClick={() => setForm({ ...form, sortOverall: !form.sortOverall })}>
        <img src="/logos/Color logo - no background.png" alt="Syphtr" className="w-12 h-auto inline-block mr-1 sm:w-16 md:w-24 lg:w-40" /> 
        Advanced Sorting
      </button> */}
   {/* <label className="mr-1" htmlFor="itemsPerPage">Results:</label>
      <select 
        id="itemsPerPage" 
        value={itemsPerPage} 
        onChange={(e) => setItemsPerPage(Number(e.target.value))}
        className="border px-1 py-1 rounded"
      >
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="50">50</option>
        <option value="100">100</option>
      </select> */}
    </div> 

    <button 
  onClick={() => setForm({ ...form, isOpen: !form.isOpen })} 
  style={{ backgroundColor: '#81B29A', color: '#fff' }}
  className="w-full text-white rounded-md p-1 mt-1 text-xxs sm:text-xs"
>
  {form.isOpen ? 'Close Search' : 'Open Search'}
</button>

 {/* Pagination controls */}
<div className="flex justify-between my-2 space-x-2 text-xs sm:text-sm">
  <button 
    style={{ backgroundColor: '#81B29A', color: '#fff' }}
    className="border px-2 py-1 rounded text-white"  
    onClick={handlePrevious} 
    disabled={currentPage === 1}
  >
    Prev
  </button>
  <button 
    style={{ backgroundColor: '#81B29A', color: '#fff' }}
    className="border px-2 py-1 rounded text-white"  
    onClick={handleNext} 
    disabled={currentPage === results.totalPages}
  >
    Next
  </button>
</div>

{/* Current page and total pages */}
<div className="my-2 text-xs sm:text-sm">
  <p className="font-bold">Page: {currentPage} / {results.totalPages}</p>
</div>

{/* Profiles range and total results */}
<div className="my-2 text-xs sm:text-sm">
  <p className="font-bold">
    Profiles {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, results.total)} of {results.total} total
  </p>
</div>


</div>
)}

    
<div className="container mx-auto px-4 md:px-15">
  <div className="flex justify-end mb-4">
    <button
      className={`md:block hidden mr-2 ${isSingleColumn ? 'bg-green-500 text-white' : 'bg-white text-green-500'} p-2 rounded`}
      onClick={() => setIsSingleColumn(true)}
    >
      <FaRegWindowMaximize />
    </button>
    <button
      className={`md:block hidden ${!isSingleColumn ? 'bg-green-500 text-white' : 'bg-white text-green-500'} p-2 rounded`}
      onClick={() => setIsSingleColumn(false)}
    >
      <FaThLarge />
    </button>
  </div>
  <div className={`w-full grid grid-cols-1 ${!isSingleColumn ? 'md:grid-cols-3' : ''} gap-4 overflow-auto`}>
    {paginatedResults.map((profile: any, index: number) => {
      const fetchProfile = async (event: React.MouseEvent) => {
        event.stopPropagation();
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profiles/public_identifier/${profile.public_identifier}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
        });
        const existingProfile = await response.json();
        if (existingProfile) {
          window.open(`/fullProfilePage/${existingProfile.id}`, '_blank');
        }
      };

      

      const handleSave = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (token && orgId) {
          handleSaveProfile(profile.id, selectedJobsByProfile[profile.id] || [], orgId, token);
        } else {
          console.error('Token or orgId is null');
        }
      };

      const openLinkedInProfile = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        window.open(profile.linkedin_profile_url, '_blank');
      };

      return (
        <div
          key={profile.id}
          className={`p-0.5 sm:p-2 ${isSingleColumn ? 'sm:w-3/4 sm:mx-auto px-1 sm:px-4' : ''} flex flex-col items-start relative rounded-lg shadow-lg bg-white cursor-pointer`}
          onClick={() => {
            setProfileId(profile.id);
            setShowModal(true);
          }}
        >
          <div className="flex w-full">
            <div className="flex items-start mb-1 sm:mb-4">
              <div className="w-10 h-10 sm:w-24 sm:h-24 bg-gray-400 rounded-lg overflow-hidden border mr-1 sm:mr-4">
                {/* Placeholder for profile picture */}
              </div>
            </div>
      
            <div className="flex flex-col flex-1">
              <div className="text-xxs sm:text-sm flex-1">
                <div className="mb-0.5 font-bold text-gray-600 text-xxs sm:text-sm">{profile.full_name}</div>
                <div className="mb-0.5 font-bold text-gray-600 text-xxs sm:text-xs">
                  {[profile.city, profile.state, profile.country].filter(Boolean).join(', ')}
                </div>
                <div className="mb-0.5 font-bold text-gray-600 text-xxs sm:text-xs line-clamp-2">{profile.headline}</div>
<div className="mb-0.5 font-bold text-blue-500 text-xxs sm:text-xs">
  <a
    href={profile.linkedin_profile_url}
    target="_blank"
    rel="noopener noreferrer"
    onClick={openLinkedInProfile}
    style={{ display: 'inline-block' }} // Add this line
  >
    <img src="/logos/LI-In-Bug.png" alt="LinkedIn Profile" className="w-3 h-2 sm:w-5 sm:h-4" />
  </a>
</div>
      
                {(profile.jobs || [])
                  .filter((job: any) => job.userId === loggedInUserId)
                  .flatMap((job: any) =>
                    job.candidateStages
                      ?.filter((candidateStage: any) => candidateStage.profileId === profile.id)
                      .map((candidateStage: any) => ({ ...candidateStage, jobTitle: job.title, jobId: job.id })) || []
                  )
                  .map((item: any) => {
                    const href = `/candidatePipelinePage/${item.jobId}`;
      
                    return (
                      <p key={item.id} className="font-bold text-gray-500">
                        Currently at {item.stage} for
                        <button
                          className="text-gray-500 hover:text-green-500 hover:shadow-lg"
                          onClick={(event) => {
                            event.stopPropagation();
                            window.open(href, '_blank');
                          }}
                        >
                          {item.jobTitle}
                        </button>
                      </p>
                    );
                  })}
                
              </div>
            </div>
          </div>
      
          <div className="mb-1 sm:mb-4">
            {profile.categoryScore &&
              Object.keys(profile.categoryScore.categoryExperience).map((category) => (
                <div key={category} className="inline-block mr-1 mb-0.5 sm:mb-2">
                  <span style={{ backgroundColor: '#81B29A', color: '#fff' }} className="badge text-xxs sm:text-xs px-2 py-0.5 rounded-full">{category}</span>
                  <span style={{ color: '#81B29A' }} className="text-xxs sm:text-xs font-bold ml-0.5">
                    {convertToYearsAndMonths(profile.categoryScore.categoryExperience[category])}
                  </span>
                </div>
              ))}
      
      {profile.recentCategoryScore > 0 && (
  <div className="mb-0.5 sm:mb-2">
    <span style={{ backgroundColor: '#E07A5F', color: '#fff' }} className="badge text-xxs sm:text-xs px-2 py-0.5 rounded-full">
      Recent
    </span>
    <span style={{ color: '#E07A5F' }} className="text-xxs sm:text-xs font-bold ml-0.5">
      {'⭐'.repeat(getTicks(profile.recentCategoryScore))}
    </span>
  </div>
)}
      
            <div className="mb-0.5 sm:mb-2">
              <span style={{ backgroundColor: '#D81B60', color: '#fff' }} className="badge text-xxs sm:text-xs px-2 py-0.5 rounded-full">
                Tenure
              </span>
              <span style={{ color: '#D81B60' }} className="text-xxs sm:text-xs font-bold ml-0.5">
                {profile.averageTenureScore ? '⭐'.repeat(getTicks(profile.averageTenureScore)) : 'N/A'}
              </span>
            </div>
          </div>

          <Link href={`/fullProfilePage/${profile.id}`}>
                  <span
                    className="mt-0.5 sm:mt-2 mb-0.5 sm:mb-2 bg-green-200 text-green-700 text-xs sm:text-sm px-1 py-0.5 rounded cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Full Profile
                  </span>
                </Link>
      
                <div className="flex flex-col items-start w-full"> {/* Add w-full here */}
  <div className="w-full flex flex-col justify-between">
    <div className="flex justify-end">
      <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          id={`profile-${profile.id}`}
          checked={selectedProfiles.includes(profile.id)}
          onChange={() => handleProfileSelection(profile.id)}
          className="form-checkbox h-4 w-4 text-gray-600 mr-1"
        />
        <label htmlFor={`profile-${profile.id}`} className="text-xxs sm:text-sm">
          Select
        </label>
      </div>
              </div>
            </div>
          </div>
        </div>
      );
      
    })}

      {showModal && profileId && (
        <FullProfileModal
          onClose={handleCloseModal}
          profile={results.profiles.find((profile) => profile.id === Number(profileId))}
          showModal={showModal}
          companyCategories={companyCategories}
          specifiedWordsPerCompany={specifiedWordsPerCompany}
          allHugeCompanyProducts={allHugeCompanyProducts}
          jobs={jobs}
          selectedJobsByProfile={selectedJobsByProfile}
          handleJobSelection={handleJobSelection}
          handleSaveProfile={handleSaveProfile}
          token={token}
          orgId={orgId}
        />
      )}
      
  </div>
</div>



</div>
</div>
);
}