import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import { Stage } from '@prisma/client';
import { UserButton } from "@clerk/nextjs"; // Add this line
import { useUser } from "@clerk/clerk-react";
import { useSession } from "@clerk/clerk-react";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import CustomerHeader from '../../components/CustomerHeader';






const stageDisplayNames = {
  "ADDED": "Newly Added Candidates",
  "ASK_SYPHTR_TO_REACH_OUT": "Request Syphtr to Reach Out?",
  "SCREENING": "Ready to Talk",
  "SCREENED": "Screened",
  "FIRST_INTERVIEW": "First Interview",
  "MID_INTERVIEWS": "Mid Interviews",
  "FINAL_INTERVIEW": "Final Interview",
  "HIRED": "Hired",
  // Add other stages here
};


const displayedStages = [

  "ADDED",
  "ASK_SYPHTR_TO_REACH_OUT",
  "SCREENING",
  "SCREENED",
  "FIRST_INTERVIEW",
  "MID_INTERVIEWS",
  "FINAL_INTERVIEW",
  "HIRED"

  
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
  const { user } = useUser();
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [sensitiveData, setSensitiveData] = useState({});
  const [notifications, setNotifications] = useState([]);
  const currentUserId = user?.id;
  const [sort, setSort] = useState(false);

  const handleSortClick = () => {
    setSort(!sort);
  };


  useEffect(() => {
    setNotifications(JSON.parse(localStorage.getItem('notifications') || '[]'));
  }, []);



  

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
    const fetchSensitiveData = async (profileId) => {
      if (loading || !session || !user) {
        console.error('Session is still loading, not available, or user is not set');
        return;
      }
  
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/profiles/${profileId}/sensitive-data`;
        const headers = {
          'X-User-Id': user.id, // Send the user ID in the headers
        };
        const response = await fetch(url, { headers });
  
        if (!response.ok) {
          console.log('Response status:', response.status); // Log the response status
          console.log('Response status text:', response.statusText); // Log the response status text
          throw new Error(`Error fetching sensitive data: ${response.status} ${response.statusText}`);
        }
  
        const data = await response.json();
        const sensitiveData = data.sensitiveData;
  
        // Update the sensitiveData state to include the sensitive data for this profile
        setSensitiveData(prevSensitiveData => ({
          ...prevSensitiveData,
          [profileId]: sensitiveData,
        }));
      } catch (error) {
        console.error('Error fetching sensitive data:', error);
        if (error.response && error.response.status === 404) {
          console.error('The resource was not found. Check the URL or the resource existence.');
        }
      }
    };
  
    if (user) { // Check if the user is set
      // Fetch sensitive data only for profiles whose sensitive data hasn't been fetched yet
      profiles.forEach(profile => {
        if (!sensitiveData[profile.id]) {
          fetchSensitiveData(profile.id);
        }
      });
    }
    // Remove profiles from the dependency array
  }, [loading, session, user]);






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
        if (session) {
          const token = await session.getToken();
          const responseJob = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${id}?include=candidateStages`, {
            headers: {
              'Authorization': `Bearer ${token}`, // Include the Authorization header
            },
          });
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
        }
      } catch (error) {
        console.error('Error fetching job details:', error);
        setLoading(false);
      }
    };
  
    if (id) {
      fetchData();
    }
  }, [id, session]); // Add session to the dependency array

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
  
      // Check if the candidate was moved to the "ASK_SYPHTR_TO_REACH_OUT" stage
      if (destination.droppableId === 'ASK_SYPHTR_TO_REACH_OUT') {
        // Ask the user if they are sure they want to move the candidate to this stage
        const confirmMove = window.confirm('Are you sure you want to move the candidate to this stage? Doing so will use one of your outreach credits and will send a notification for Syphtr to reach out to this candidate.');
  
        // If the user didn't confirm, don't move the candidate
        if (!confirmMove) return;
      }
  
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
    <div className="pt-20">
      <CustomerHeader userId={currentUserId} notifications={notifications} setNotifications={setNotifications} />
  
      <div className="container mx-auto mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="text-gray-700 border border-gray-300 rounded p-4">
            <h2 className="text-xl font-bold mb-2">{job.title}</h2>
            <div className="text-xs">
              <p><span className="font-semibold">Department:</span> {job.department}</p>
              <p><span className="font-semibold">Business Unit:</span> {job.businessUnit}</p>
              <p><span className="font-semibold">Hiring Team:</span> {job.hiringTeam ? job.hiringTeam.join(', ') : ''}</p>
              <p><span className="font-semibold">Salary:</span> {job.salary}</p>
              <p><span className="font-semibold">Currency:</span> {job.currency}</p>
              <p><span className="font-semibold">Open Since:</span> {new Date(job.openSince).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              <p><span className="font-semibold">Job Description:</span> {job.jobDescription}</p>
              <p><span className="font-semibold">Location:</span> {job.location}</p>
        {/* <p><span className="font-semibold">Created At:</span> {new Date(job.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
        <p>
          <span className="font-semibold">Updated At:</span> 
          {new Date(job.updatedAt).toLocaleString('en-GB', {
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: true,
          })}
        </p> */}
      </div>
    </div>

          <div className="overflow-y-auto h-32 border border-gray-300 rounded">
  <div className="bg-white rounded-lg shadow-md p-4">
    <h2 className="text-xs font-semibold mb-2 text-gray-700">Talent Pipeline History</h2>
    <div className="text-gray-700 text-xs">
      {jobHistory.length > 0 ? (
        jobHistory.map((history, index) => (
          <div key={index} className="mb-1">
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
        <p>No history to show.</p>
      )}
      {jobHistory.length > 10 && (
        <button onClick={() => setShowFullHistory(!showFullHistory)} className="text-blue-500 hover:underline">
          {showFullHistory ? 'Show less history' : 'Show all history'}
        </button>
      )}
    </div>
  </div>
</div>
        </div>

        <DragDropContext onDragEnd={handleOnDragEnd}>
  <div className="grid grid-cols-1 md:grid-cols-8 gap-2 mt-8">
    {displayedStages.map((stage, index) => (
      <Droppable droppableId={stage} key={index}>
        {(provided) => (
          <div 
            {...provided.droppableProps} 
            ref={provided.innerRef} 
            className={`rounded-lg shadow-md p-4 ${stage === 'ADDED' ? 'bg-pink-200' : stage === 'ASK_SYPHTR_TO_REACH_OUT' ? 'bg-blue-200' : 'bg-green-200'}`}
          >
            <h2 className="text-base font-bold mb-4 mt-4 text-gray-700">{stageDisplayNames[stage]}</h2>
            <div>
              {job && job.candidates && job.candidates.map((profile, profileIndex) => {
                        const candidateStage = profile.candidateStages && profile.candidateStages.length > 0 
                          ? profile.candidateStages.find(candidateStage => candidateStage.jobId === job.id) 
                          : null;
                        if (candidateStage && candidateStage.stage === stage) {
                          // Calculate days at stage
                          let daysAtStage = 'N/A';
                          const latestStageChange = jobHistory.find(history => 
                            history.details.includes(`Stage for profile ${profile.id} was updated`)
                          );
                          if (latestStageChange) {
                            const currentDate = new Date();
                            const stageChangeDate = new Date(latestStageChange.timestamp);
                            daysAtStage = Math.floor((currentDate - stageChangeDate) / (1000 * 60 * 60 * 24));
                          }

                          return (
                            <Draggable key={profile.id} draggableId={String(profile.id)} index={profileIndex}>
                              {(provided) => (
                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="bg-gray-50 rounded-lg shadow p-2 mb-2">
                                  {/* Profile content */}
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
                                      <div style={{ fontSize: '10px' }} className="font-bold text-gray-800">{profile.first_name} {profile.last_name}</div>
                                      {/* <div className="text-xs text-gray-600">{sensitiveData[profile.id]?.email ? sensitiveData[profile.id].email : "No email"}</div>
<div className="text-xs text-gray-600">{sensitiveData[profile.id]?.phone ? sensitiveData[profile.id].phone : "No phone number"}</div>
<div className="text-xs text-gray-600">{sensitiveData[profile.id]?.notes ? sensitiveData[profile.id].notes : "No notes"}</div> */}

                                      <div className="text-xs text-gray-600">
                                        {profile.linkedin_profile_url ? (
                                          <a href={profile.linkedin_profile_url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                                            <img src="/logos/LI-In-Bug.png" alt="LinkedIn Logo" className="w-3 h-3 mr-1" />
                                            View
                                          </a>
                                        ) : (
                                          "No LinkedIn profile"
                                        )}
                                      </div>                        
                                    </div>
                                  </div>
                                  <div className="mb-2">
                                    <div className="text-xs text-gray-600">
                                      {profile.city}{profile.city && ', '}
                                      {profile.state}{profile.state && ', '}
                                      {profile.country}
                                    </div>
                                  </div>
                                  <div className="flex flex-col space-y-1">
                                  <div className="flex flex-col space-y-1">
 {/* <div className="flex items-center">
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
  </div> */} 

</div>


                                  </div>
                                  <div className="mt-2 flex justify-between items-center">
                                    <div className="text-xs">Days at stage: <span style={{ fontWeight: 'bold', color: daysAtStage < 5 ? 'green' : daysAtStage < 10 ? 'orange' : 'red' }}>{daysAtStage}</span></div>
                                    <div>
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
                                      <Link href={`/fullProfilePage/${profile.id}`}>
                                        <span className="text-blue-600 hover:text-blue-900 text-xs">
                                          View
                                        </span>
                                      </Link>
                                    </div>
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
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {searchResults.map(profile => (
            <div key={profile.id} className="bg-white rounded-lg shadow-md p-6">
              {/* Search result content */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JobDetailsPage;