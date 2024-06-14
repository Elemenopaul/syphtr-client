import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import { UserButton } from "@clerk/nextjs";
import FullProfileModal from '../FullProfileModal';

const JobDetailsPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [job, setJob] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [newProfile, setNewProfile] = useState('');
  const [showFullProfileModal, setShowFullProfileModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const responseJob = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${id}?include=candidateStages`);
        const jobData = await responseJob.json();
        if (!jobData) return;
        
        setJob(jobData);
        const addedCandidates = jobData.candidates.filter(candidate => 
          candidate.candidateStages && candidate.candidateStages.some(stage => stage.stage === "ADDED")
        );

        const profilesWithScoring = await Promise.all(addedCandidates.map(async candidate => {
          try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/candidateStages/${candidate.id}/${id}`);
            const stageData = response.data;
            return { 
              ...candidate, 
              comfortZoneScore: stageData.comfortZoneScore,
              categoryScore: stageData.categoryScore,
              overallScore: stageData.overallScore,
              stabilityScore: stageData.stabilityScore,
              recentCategoryScore: stageData.recentCategoryScore // Add this line
            };
          } catch (error) {
            console.error('Error fetching candidate stage:', error);
            // If there's an error, return the candidate without scores
            return candidate;
          }
        }));

        setProfiles(profilesWithScoring);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching job details:', error);
        setLoading(false);
      }
    };
  
    if (id) {
      fetchData();
    }
  }, [id]);

  const deleteProfileFromJob = async (profileId) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidateStages/${profileId}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Failed to delete profile from job ${id}`);
      }
      setProfiles(profiles.filter(profile => profile.id !== profileId));
    } catch (error) {
      console.error('Error deleting profile from job:', error);
    }
  };

  const addProfileToJob = async (profileId, stage = 'ADDED') => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidateStages/${profileId}/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stage }),
      });
      if (!response.ok) {
        throw new Error(`Failed to add profile to job ${id}`);
      }
      const profile = await response.json();
      setProfiles([...profiles, profile]);
    } catch (error) {
      console.error('Error adding profile to job:', error);
    }
  };

  const toggleCandidateAction = (profileId) => {
    // Find the candidate by ID and toggle their action state
    setProfiles(profiles.map(profile => {
      if (profile.id === profileId) {
        return { ...profile, actionNeeded: !profile.actionNeeded };
      }
      return profile;
    }));
  };

  const updateCandidateStatus = (profileId, status) => {
    // Find the candidate by ID and update their response status
    setProfiles(profiles.map(profile => {
      if (profile.id === profileId) {
        return { ...profile, responseStatus: status };
      }
      return profile;
    }));
  };

  const JobCandidateStage = ({ profileId, jobId, stage: currentStage }) => {
    const [stage, setStage] = useState(null);

    useEffect(() => {
      // Fetch the stage for this job-candidate pair when the component mounts
      const fetchStage = async () => {
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/candidateStages/${profileId}/${jobId}`);
          setStage(response.data.stage);
        } catch (error) {
          console.error('Error fetching stage:', error);
        }
      };

      fetchStage();
    }, [profileId, jobId]);

    // Render the stage
    return (
      <div>
        {stage === currentStage ? `Stage: ${formatStageName(stage)}` : null}
      </div>
    );
  };

  useEffect(() => {
    const searchProfiles = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/profiles`, {
          params: { 
            name: searchQuery,  
            // Include other search parameters as needed
          } 
        });
        console.log('Search response:', response.data);
        if (response.data && Array.isArray(response.data)) {
          setSearchResults(response.data);
        } else {
          console.error('Unexpected response data:', response.data);
        }
      } catch (error) {
        console.error('Error searching profiles:', error);
      }
    };
  
    if (searchQuery) {
      searchProfiles();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const formatStageName = (stage) => {
    return stage
      .replace(/_/g, ' ') // Replace underscores with spaces
      .split(' ') // Split on spaces
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter of each word and make the rest of the letters lowercase
      .join(' '); // Join the words back together with spaces
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col">
       <header className="bg-green-400 text-white p-4 mb-4 w-full flex justify-between items-center">
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
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  
    <div className="p-6 bg-white shadow rounded-lg text-gray-400 font-bold">
  <h2 className="text-2xl font-bold mb-4">{job.title}</h2>
  <div className="grid grid-cols-2 gap-4 text-gray-400 font-bold">
    <div>
      <p className="font-semibold">Department:</p>
      <p>{job.department}</p>
    </div>
    <div>
      <p className="font-semibold">Business Unit:</p>
      <p>{job.businessUnit}</p>
    </div>
    <div>
      <p className="font-semibold">Hiring Team:</p>
      <p>{job.hiringTeam.join(', ')}</p>
    </div>
    <div>
      <p className="font-semibold">Salary:</p>
      <p>{job.salary}</p>
    </div>
    <div>
      <p className="font-semibold">Currency:</p>
      <p>{job.currency}</p>
    </div>
    <div>
      <p className="font-semibold">Open Since:</p>
      <p>{new Date(job.openSince).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
    </div>
    <div>
      <p className="font-semibold">Created At:</p>
      <p>{new Date(job.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
    </div>
    <div>
      <p className="font-semibold">Updated At:</p>
      <p>{new Date(job.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
    </div>
  </div>
</div>
  
<div className="p-6 bg-white shadow rounded-lg mt-6">
  <h2 className="text-2xl font-bold mb-4">Added Candidates</h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
    {profiles.map((profile, index) => (
      <div key={index} className="bg-gray-100 shadow rounded-lg p-4">
        <div className="flex items-center mb-4">
          <div className="h-16 w-16 rounded-md overflow-hidden mr-4">
            <img
              className="h-full w-full object-cover"
              src={`${process.env.NEXT_PUBLIC_API_URL}/profileimages/${profile.public_identifier}_profile_pic.jpg`}
              alt={`Profile Pic for ${profile.full_name}`}
              onError={(e) => {
                e.currentTarget.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAE0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
              }}
            />
          </div>
          <div>
            <div className="text-lg font-bold text-gray-800">{profile.first_name} {profile.last_name}</div>
            <div className="text-sm text-gray-600">{profile.email ? profile.email : "No email"}</div>
            <div className="text-sm text-gray-600">{profile.phone ? profile.phone : "No phone number"}</div>
          </div>
        </div>
        <div className="mb-4">
          <div className="text-sm text-gray-600">
            {profile.city}{profile.city && ', '}
            {profile.state}{profile.state && ', '}
            {profile.country}
          </div>
          <button 
            className="text-sm text-blue-500 mt-1 underline"
            onClick={() => window.open(profile.linkedin_profile_url, '_blank')}
          >
            <img src="/logos/LI-In-Bug.png" alt="LinkedIn" className="w-4 h-auto inline-block mr-2" />
            LinkedIn Profile
          </button>
        </div>
      
        <div className="flex flex-col space-y-2">
          <div className="flex items-center">
            <span className="mr-2 w-16">Dynamic:</span>
            <div className="h-3 bg-gray-200 rounded-md overflow-hidden flex-grow">
              <div className="h-full bg-blue-500" style={{ width: `${profile.comfortZoneScore || 0}%` }}></div>
            </div>
            <span className="ml-2 text-xs text-gray-600">
            {typeof profile.comfortZoneScore === 'number' ? `${profile.comfortZoneScore.toFixed(1)}%` : 'N/A'}
          </span>          
          </div>
          <div className="flex items-center">
            <span className="mr-2 w-16">Compete:</span>
            <div className="h-3 bg-gray-200 rounded-md overflow-hidden flex-grow">
              <div className="h-full bg-blue-500" style={{ width: `${profile.categoryScore || 0}%` }}></div>
            </div>
            <span className="ml-2 text-xs text-gray-600">
            {typeof profile.categoryScore === 'number' ? `${profile.categoryScore.toFixed(1)}%` : 'N/A'}
          </span>          
          </div>
          <div className="flex items-center">
            <span className="mr-2 w-16">Tenure:</span>
            <div className="h-3 bg-gray-200 rounded-md overflow-hidden flex-grow">
              <div className="h-full bg-blue-500" style={{ width: `${profile.stabilityScore || 0}%` }}></div>
            </div>
            <span className="ml-2 text-xs text-gray-600">
            {typeof profile.stabilityScore === 'number' ? `${profile.stabilityScore.toFixed(1)}%` : 'N/A'}
          </span>         
           </div>
          <div className="flex items-center">
          <span className="mr-2 w-16">Recent:</span>
          <div className="h-3 bg-gray-200 rounded-md overflow-hidden flex-grow">
            <div className="h-full bg-blue-500" style={{ width: `${profile.recentCategoryScore || 0}%` }}></div>
          </div>
          <span className="ml-2 text-xs text-gray-600">
          {typeof profile.recentCategoryScore === 'number' ? `${profile.recentCategoryScore.toFixed(1)}%` : 'N/A'}
        </span>        
        </div>
        <div className="flex items-center">
            <span className="mr-2 w-16">Overall:</span>
            <div className="h-3 bg-gray-200 rounded-md overflow-hidden flex-grow">
              <div className="h-full bg-blue-500" style={{ width: `${profile.overallScore || 0}%` }}></div>
            </div>
            <span className="ml-2 text-xs text-gray-600">
            {typeof profile.overallScore === 'number' ? `${profile.overallScore.toFixed(1)}%` : 'N/A'}
          </span>          
          </div>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <button
            className="text-red-600 hover:text-red-900 text-sm"
            onClick={() => deleteProfileFromJob(profile.id)}
          >
            Delete
          </button>
          <button
            className="text-blue-600 hover:text-blue-900 text-sm"
            onClick={() => {
              setNewProfile(profile.id);
              setShowFullProfileModal(true);
            }}
          >
            Expand
          </button>
        </div>
        <div className="mt-2 flex items-center">
          <input
            type="checkbox"
            checked={profile.actionNeeded}
            onChange={() => toggleCandidateAction(profile.id)}
            className="h-5 w-5 text-green-500 rounded focus:ring-green-500 border-gray-300 mr-2"
          />
          <span className="text-sm text-gray-600">Ask Syphtr to reach out?</span>
          {profile.actionNeeded && (
            <select
              value={profile.responseStatus || ''}
              onChange={(e) => updateCandidateStatus(profile.id, e.target.value)}
              className="ml-2 p-1 border border-gray-300 rounded text-sm"
            >
              <option value="">Preparing outreach/awaiting response</option>
              <option value="positive">Interested - Details provided</option>
              <option value="negative">Not currently interested</option>
            </select>
          )}
        </div>
      </div>
    ))}
  </div>
  {showFullProfileModal && (
    <FullProfileModal
      profileId={newProfile}
      onClose={() => setShowFullProfileModal(false)}
    />
  )}
</div>
    </div>
  );
};

export default JobDetailsPage;
