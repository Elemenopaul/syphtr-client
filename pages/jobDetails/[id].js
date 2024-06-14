import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import { Stage } from '@prisma/client';
import { UserButton } from "@clerk/nextjs"; // Add this line
import { useUser } from "@clerk/clerk-react";
import { useSession } from "@clerk/clerk-react";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';








const displayedStages = [
  "APPLIED",
  "ADDED",
  "SCREENING",
  "SCREENED",
  "FIRST_INTERVIEW",
  "MID_INTERVIEWS",
  "FINAL_INTERVIEW",
  "HIRED",
];

const StageNames = displayedStages.reduce((obj, key) => {
  obj[key] = key;
  return obj;
}, {});



function formatStageName(stage) {
  return stage
    .replace(/_/g, ' ') // Replace underscores with spaces
    .split(' ') // Split on spaces
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter of each word and make the rest of the letters lowercase
    .join(' '); // Join the words back together with spaces
}



const JobDetailsPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [job, setJob] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [newCandidate, setNewCandidate] = useState({}); // New state for the new candidate
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [jobHistory, setJobHistory] = useState([]);
  const { session } = useSession();
  const [token, setToken] = useState(null);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [hasProfilesBeenManuallyUpdated, setHasProfilesBeenManuallyUpdated] = useState(false);


  

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
    if (job) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${job.id}/history`)
        .then(response => response.json())
        .then(data => setJobHistory(data));
    }
  }, [job]);

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const responseJob = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${id}?include=candidateStages`);
        const jobData = await responseJob.json();
        if (!jobData) return;
  
        console.log('Job data:', jobData); // Log the job data
  
        setJob(jobData);
        const addedCandidates = jobData.candidates.map(candidate => {
          // Map over candidateStages and extract scores
          const candidateWithScores = candidate.candidateStages.map(candidateStage => {
            console.log('CandidateStage for candidate', candidate.id, ':', candidateStage);

  
            return { 
              ...candidateStage, 
              comfortZoneScore: candidateStage.comfortZoneScore,
              categoryScore: candidateStage.categoryScore,
              overallScore: candidateStage.overallScore,
              stabilityScore: candidateStage.stabilityScore,
              recentCategoryScore: candidateStage.recentCategoryScore
            };
          });
  
          return {
            ...candidate,
            candidateStages: candidateWithScores
          };
        });
  
        console.log('Candidates with scoring:', addedCandidates); // Log the candidates with scoring
  
        setProfiles(addedCandidates);
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

  const [newProfile, setNewProfile] = useState({});

  const addProfileToJob = async (profileId, stage = 'ADDED') => {
    // Send a POST request to your server to add the profile to the job and update the stage
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
  
    // Update the job object
    setJob(prevJob => {
      const updatedCandidates = [...prevJob.candidates, profile];
      return {...prevJob, candidates: updatedCandidates};
    });
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
    console.log('Profiles after update:', profiles);
  }, [profiles]);

  const updateCandidateStage = async (profileId, jobId, stage, token) => {
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/candidateStages/${profileId}/${jobId}`,
        {
          stage,
          profileId: Number(profileId),
          jobId: Number(jobId),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (response.status !== 200) {
        throw new Error(`Failed to update stage for profile ${profileId} and job ${jobId}`);
      }
  
      // Update the profiles state to reflect the change in stage
      setProfiles(profiles.map(profile => 
        profile.id === profileId ? { ...profile, stage } : profile
      ));
  
      console.log('Stage updated successfully:', response.data);
    } catch (error) {
      console.error('Error updating stage:', error);
    }
  };
  
  const deleteProfileFromJob = async (profileId, token) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidateStages/${profileId}/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error(`Failed to delete profile from job ${id}`);
      }
  
      // Update the job object
      setJob(prevJob => {
        const updatedCandidates = prevJob.candidates.filter(profile => profile.id !== profileId);
        return {...prevJob, candidates: updatedCandidates};
      });
    } catch (error) {
      console.error(error);
    }
  };

const handleOnDragEnd = async (result) => {
  const { source, destination } = result;

  // If the item is dropped outside of any droppable area, destination will be null
  // In this case, we won't change the order of the candidates
  if (!destination) return;

  // If the source and destination droppable ids are the same, this is a reordering within the same droppable
  if (source.droppableId === destination.droppableId) {
    const updatedCandidates = Array.from(job.candidates);

    const [removed] = updatedCandidates.splice(source.index, 1);
    updatedCandidates.splice(destination.index, 0, removed);

    setJob({ ...job, candidates: updatedCandidates });
  } else {
    // If the source and destination droppable ids are different, this is a move from one droppable to another
    // You need to handle this case according to your application's logic

    // Find the candidate that is being moved
    const movedCandidate = job.candidates[source.index];

    // Update the stage of the moved candidate in the database
    await updateCandidateStage(movedCandidate.id, job.id, destination.droppableId, token);

    // Update the stage of the moved candidate in the local state
    movedCandidate.candidateStages = movedCandidate.candidateStages.map(candidateStage => {
      if (candidateStage.jobId === job.id) {
        return { ...candidateStage, stage: destination.droppableId };
      } else {
        return candidateStage;
      }
    });

    setJob({ ...job });
  }
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

    <div className="p-6 bg-white shadow rounded-lg text-gray-400 font-bold grid grid-cols-2 gap-4">
  <div>
    <h2 className="text-2xl font-bold mb-4">{job.title}</h2>
    <p><span className="font-semibold">Department:</span> {job.department}</p>
    <p><span className="font-semibold">Business Unit:</span> {job.businessUnit}</p>
    <p><span className="font-semibold">Hiring Team:</span> {job.hiringTeam.join(', ')}</p>
    <p><span className="font-semibold">Salary:</span> {job.salary}</p>
    <p><span className="font-semibold">Currency:</span> {job.currency}</p>
    <p><span className="font-semibold">Open Since:</span> {new Date(job.openSince).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
    <p><span className="font-semibold">Created At:</span> {new Date(job.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
    <p>
      <span className="font-semibold">Updated At:</span> 
      {new Date(job.updatedAt).toLocaleString('en-GB', {
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true,
      })}
    </p>  
  </div>
  <div>
  <h2 className="text-xs font-normal mb-4 mt-6 text-gray-700">Job History</h2>
  <div className="flex flex-col">
    {jobHistory.length > 0 ? (
      jobHistory.slice(0, showFullHistory ? jobHistory.length : 10).map((history, index) => (
        <div key={index} className="text-xs text-gray-700">
          {history.details} at 
          {new Date(history.timestamp).toLocaleDateString('en-GB', {
            day: '2-digit', 
            month: 'short', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: true,
          })}
        </div>
      ))
    ) : (
      <p className="text-xs text-gray-700">No history to show.</p>
    )}
    {jobHistory.length > 10 && (
      <button onClick={() => setShowFullHistory(!showFullHistory)} className="text-xs text-blue-500">
        {showFullHistory ? 'Show less history' : 'Show all history'}
      </button>
    )}
  </div>
</div>
</div>





<DragDropContext onDragEnd={handleOnDragEnd}>
  <div className="flex justify-between p-4">
    {displayedStages.map((stage, index) => (
      <Droppable droppableId={stage} key={index}>
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-col w-64 h-full p-4 bg-gray-200 rounded-lg shadow-md">
            <h2 className="text-lg font-bold mb-2 mt-4 text-gray-700">{formatStageName(stage)}</h2>
            {job && job.candidates && job.candidates.map((profile, profileIndex) => {
              const candidateStage = profile.candidateStages && profile.candidateStages.length > 0 
                ? profile.candidateStages.find(candidateStage => candidateStage.jobId === job.id) 
                : null;
              if (candidateStage && candidateStage.stage === stage) {
                return (
                  <Draggable key={profile.id} draggableId={String(profile.id)} index={profileIndex}>
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="p-4 bg-white shadow rounded-lg mt-2">
                        <div className="flex items-center mb-2">
                          <div className="h-12 w-12 rounded-md overflow-hidden mr-2">
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
                            <div className="text-base font-bold text-gray-800">{profile.first_name} {profile.last_name}</div>
                            <div className="text-xs text-gray-600">{profile.email ? profile.email : "No email"}</div>
                            <div className="text-xs text-gray-600">{profile.phone ? profile.phone : "No phone number"}</div>
                          </div>
                        </div>
                        <div className="mb-2">
                          <div className="text-xs text-gray-600">
                            {profile.city}{profile.city && ', '}
                            {profile.state}{profile.state && ', '}
                            {profile.country}
                          </div>
                          <button 
                            className="text-xs text-blue-500 mt-1 underline"
                            onClick={() => window.open(profile.linkedin_profile_url, '_blank')}
                          >
                            <img src="/logos/LI-In-Bug.png" alt="LinkedIn" className="w-3 h-auto inline-block mr-1" />
                            LinkedIn Profile
                          </button>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center">
                            <span className="mr-1 w-12 text-xs">Dynamic:</span>
                            <div className="h-2 bg-gray-200 rounded-md overflow-hidden flex-grow">
                              <div className="h-full bg-blue-500" style={{ width: `${candidateStage.comfortZoneScore || 0}%` }}></div>
                            </div>
                            <span className="ml-1 text-xs text-gray-600">
                              {typeof candidateStage.comfortZoneScore === 'number' ? `${candidateStage.comfortZoneScore.toFixed(1)}%` : 'N/A'}
                            </span>          
                          </div>
                          <div className="flex items-center">
                            <span className="mr-1 w-12 text-xs">Compete:</span>
                            <div className="h-2 bg-gray-200 rounded-md overflow-hidden flex-grow">
                              <div className="h-full bg-blue-500" style={{ width: `${candidateStage.categoryScore || 0}%` }}></div>
                            </div>
                            <span className="ml-1 text-xs text-gray-600">
                              {typeof candidateStage.categoryScore === 'number' ? `${candidateStage.categoryScore.toFixed(1)}%` : 'N/A'}
                            </span>          
                          </div>
                          <div className="flex items-center">
                            <span className="mr-1 w-12 text-xs">Tenure:</span>
                            <div className="h-2 bg-gray-200 rounded-md overflow-hidden flex-grow">
                              <div className="h-full bg-blue-500" style={{ width: `${candidateStage.stabilityScore || 0}%` }}></div>
                            </div>
                            <span className="ml-1 text-xs text-gray-600">
                              {typeof candidateStage.stabilityScore === 'number' ? `${candidateStage.stabilityScore.toFixed(1)}%` : 'N/A'}
                            </span>         
                          </div>
                          <div className="flex items-center">
                            <span className="mr-1 w-12 text-xs">Recent:</span>
                            <div className="h-2 bg-gray-200 rounded-md overflow-hidden flex-grow">
                              <div className="h-full bg-blue-500" style={{ width: `${candidateStage.recentCategoryScore || 0}%` }}></div>
                            </div>
                            <span className="ml-1 text-xs text-gray-600">
                              {typeof candidateStage.recentCategoryScore === 'number' ? `${candidateStage.recentCategoryScore.toFixed(1)}%` : 'N/A'}
                            </span>        
                          </div>
                          <div className="flex items-center">
                            <span className="mr-1 w-12 text-xs">Overall:</span>
                            <div className="h-2 bg-gray-200 rounded-md overflow-hidden flex-grow">
                              <div className="h-full bg-blue-500" style={{ width: `${candidateStage.overallScore || 0}%` }}></div>
                            </div>
                            <span className="ml-1 text-xs text-gray-600">
                              {typeof candidateStage.overallScore === 'number' ? `${candidateStage.overallScore.toFixed(1)}%` : 'N/A'}
                            </span>          
                          </div>
                        </div>
                        <div className="mt-2 flex justify-between items-center">
                          <button
                            className="text-red-600 hover:text-red-900 text-xs"
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this profile from the job?')) {
                                deleteProfileFromJob(Number(profile.id), token);
                              }
                            }}
                          >
                            Delete
                          </button>
                          
                        </div>
                        
                      </div>
                    )}
                  </Draggable>
                );
              }
              return null;
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    ))}
  </div>
</DragDropContext>


  


      <h2 className="text-2xl font-bold mb-4">Add Profile</h2>
      <form onSubmit={(e) => {
  e.preventDefault();
  // If newProfile.stage is present, call addProfileToJob with the stage
  // Otherwise, call addProfileToJob without the stage
  if (newProfile.id) {
    if (newProfile.stage) {
      addProfileToJob(parseInt(newProfile.id), newProfile.stage);
    } else {
      addProfileToJob(parseInt(newProfile.id));
    }
  } else {
    console.error('Profile ID is missing');
  }
}}>
  <label>
  Search Profiles:
  <input type="text" value={searchQuery} onChange={e => {
    console.log(e.target.value);
    setSearchQuery(e.target.value);
  }} />
</label>
<label>
  Profile:
  <select value={newProfile.id || ''} onChange={e => setNewProfile(prevState => ({ ...prevState, id: e.target.value }))}>
    <option value="">Select a profile</option>
    {searchResults.map(profile => (
      <option key={profile.id} value={profile.id}>{profile.first_name} {profile.last_name}</option>
    ))}
</select>
</label>
<label>
  Stage:
  <select value={newProfile.stage || ''} onChange={e => setNewProfile(prevState => ({ ...prevState, stage: Stage[e.target.value] }))}>
  <option value="">Select a stage</option>
  <option value="APPLIED">Applied</option>
  <option value="FIRST_INTERVIEW">First Interview</option>
  {/* Add more options for each stage */}
</select>
</label>
  <button type="submit">Add Profile</button>
</form>

{searchResults.map(profile => (
  <div key={profile.id}>
    <p>{profile.first_name} {profile.last_name}</p>
    
    
    <button onClick={() => addProfileToJob(profile.id)}>Add to job</button>  
    </div>
))}

</div>


);
};

export default JobDetailsPage;