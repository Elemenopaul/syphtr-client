import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';
import { UserButton } from "@clerk/nextjs";
import { useSession } from '@clerk/nextjs';
import { useUser } from '@clerk/clerk-react';
import io from 'socket.io-client';
import CustomerHeader from '../../components/CustomerHeader';
import jwt from 'jsonwebtoken';
import ComposeEmail from '../../components/emailComponent';
import SensitiveDataForm from '../../components/sensitiveDataComponent';
import Calendar from '../../components/calendarComponent';


const AuthorizeButton = () => {
  const handleAuthorize = () => {
    // Call the /auth/authorize endpoint
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/authorize`);
  };

  return (
    <button onClick={handleAuthorize} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300">Authorize Email Service</button>
  );
};




function FullProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const [profile, setProfile] = useState(null);
  const [experienceVisible, setExperienceVisible] = useState(false); // Set default to false
  const [educationVisible, setEducationVisible] = useState(false); // Set default to false
  const [file, setFile] = useState(null);
  const [token, setToken] = useState(null);
  // Define state variables for the form fields
const [phone, setPhone] = useState('');
const [email, setEmail] = useState('');
const [notes, setNotes] = useState('');
const { session, loading } = useSession();
const { user } = useUser();
const [jobs, setJobs] = useState([]);
const [stages, setStages] = useState([]);
const [showScoring, setShowScoring] = useState({});
const currentUserId = user?.id;
const [isUpdated, setIsUpdated] = useState(false);
const [notifications, setNotifications] = useState([]);
const [interviewDates, setInterviewDates] = useState({});
const [interviewers, setInterviewers] = useState({});
const [outcomes, setOutcomes] = useState({});
const [interviewTimes, setInterviewTimes] = useState({});
const [interviewId, setInterviewId] = useState({});
const [interviews, setInterviews] = useState([]);
const [showInterviewUpdateForms, setShowInterviewUpdateForms] = useState({});
const [showCreateInterviewForm, setShowCreateInterviewForm] = useState({});
const [interviewStartTimes, setInterviewStartTimes] = useState({});
const [interviewEndTimes, setInterviewEndTimes] = useState({});
const [attendees, setAttendees] = useState({});
const [messages, setMessages] = useState({});
const [eventId, setEventId] = useState(null);
const [events, setEvents] = useState([]);
const handleEventData = (fetchedEvents) => {
  setEvents(fetchedEvents);
};

const [orgId, setOrgId] = useState(null); // Define state variable for orgId
console.log(currentUserId); // Log currentUserId

useEffect(() => {
  console.log('interviewId:', interviewId);
}, [interviewId]);

useEffect(() => {
  if (!user) {
    return;
  }

  const allNotifications = JSON.parse(localStorage.getItem('notifications')) || [];
  const userNotifications = allNotifications.filter(notification => notification.userId === user.id);
  console.log(userNotifications);
  setNotifications(userNotifications);
}, [user]); // Add user as a dependency

useEffect(() => {
  const fetchToken = async () => {
    if (session) {
      const jwt = await session.getToken('idToken');
      setToken(jwt);
    }
  };

  fetchToken();
}, [session]);

 // Function to toggle the update form for a specific job/stage
 const toggleUpdateForm = (interviewId) => {
  setShowInterviewUpdateForms(prevState => ({
    ...prevState,
    [interviewId]: !prevState[interviewId]
  }));
};

 // Function to toggle the create new interview form for a specific job/stage
 const toggleCreateForm = (index) => {
  setShowCreateInterviewForm(prevState => ({
    ...prevState,
    [index]: !prevState[index]
  }));
};

useEffect(() => {
  if (session) {
    const getOrgId = async () => {
      const token = await session.getToken();
      console.log('Token:', token); // Log the token

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
    };

    getOrgId();
  }
}, [session]);


const socket = io(process.env.NEXT_PUBLIC_API_URL, { transports: ['websocket'] });
// Only set up a new listener if one doesn't already exist
if (!socket.hasListeners('notification')) {
  socket.on('notification', (message) => {
    console.log('Notification received:', message);
  });
}

useEffect(() => {
  console.log('Component mounted');

  let socket = io(process.env.NEXT_PUBLIC_API_URL, { transports: ['websocket'] });

  if (!socket.connected) {
    socket.on('connect', () => {
      console.log('connected to server');
    });

    socket.on('connect_error', (error) => {
      console.log('Connection Error', error);
    });

    
  }

  // Clean up the effect by disconnecting when the component unmounts
  return () => {
    console.log('Component unmounted');

    socket.disconnect();
  };
}, []);



useEffect(() => {
  const fetchProfileAndJobs = async () => {
    if (loading || !session || !user) {
      console.error('Session is still loading, not available, or user is not set');
      return;
    }

    try {
      const token = await session.getToken(); // Get the token from the session

      // Fetch profile
      const profileUrl = `${process.env.NEXT_PUBLIC_API_URL}/profiles/${id}/sensitive-data?include=jobs.candidateStages`;
      const headers = {
        'Authorization': `Bearer ${token}`, // Include the Authorization header
        'X-User-Id': user.id, // Send the user ID in the headers
      };
      const profileResponse = await fetch(profileUrl, { headers });
  
      if (!profileResponse.ok) {
        throw new Error(`Error fetching profile: ${profileResponse.status} ${profileResponse.statusText}`);
      }
  
      const profileData = await profileResponse.json();
      const sensitiveData = profileData.sensitiveData[0];
        setPhone(sensitiveData?.phone || '');
        setEmail(sensitiveData?.email || '');
        setNotes(sensitiveData?.notes || '');

      // Fetch jobs
const jobsUrl = `${process.env.NEXT_PUBLIC_API_URL}/jobs?UserId=${user.orgId}&include=candidateStages`;
const jobsResponse = await fetch(jobsUrl, { headers });

      if (!jobsResponse.ok) {
        throw new Error(`Error fetching jobs: ${jobsResponse.status} ${jobsResponse.statusText}`);
      }

      const jobsData = await jobsResponse.json();

      // Filter jobs that the current profile is a candidate for
      const candidateJobs = jobsData.filter(job => job.candidates.some(candidate => candidate.id === profileData.id));

      // Set the jobs state
      setJobs(candidateJobs || []);

      // Extract candidateStages and interviews from the jobs
const candidateStages = candidateJobs.flatMap(job => 
  job.candidates.flatMap(candidate => candidate.candidateStages)
);
const interviews = candidateStages.flatMap(stage => stage ? stage.interview || [] : []);
// Set the stages and interviews state
setStages(candidateStages || []);
setInterviews(interviews || []);

    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (user) { // Check if the user is set
    fetchProfileAndJobs();
  }
}, [loading, session, user]);  // Add user as a dependency




// Add a new state for the CV file
const [cvFile, setCvFile] = useState(null);
const [cvUrl, setCvUrl] = useState(null);






  // Add a new function to handle file changes
  const handleFileChange = (event) => {
    setCvFile(event.target.files[0]);
  };
  
  // In handleFormSubmit, append cvFile to formData
  // In handleFormSubmit, call uploadCv function
  const handleFormSubmit = async (event) => {
    event.preventDefault();
  
    const formData = new FormData();
    formData.append('cv', cvFile);
    formData.append('id', id);
    formData.append('orgId', orgId);

  
    if (loading || !session) {
      console.error('Session is still loading or not available');
      return;
    }
  
    try {
      // Call the uploadCv function
      const updatedSensitiveData = await uploadCv(id, token, formData);
      console.log('Updated sensitive data:', updatedSensitiveData);
  
      // Show a popup message
      window.alert('CV has been updated');
    } catch (error) {
      console.error('Error:', error);
    }
    
    // Use the token state variable instead of calling session.getToken('idToken')
    axios.post(`${process.env.NEXT_PUBLIC_API_URL}/profiles/upload-cv`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        setProfile(response.data);
        console.log('Profile after CV upload:', response.data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
  
  const handleSensitiveDataFormSubmit = async (event) => {
    event.preventDefault();
  
    if (loading || !session) {
      console.error('Session is still loading or not available');
      return;
    }
  
    // Define userId here
    const userId = session.user.id; // Adjust this line to match the structure of your session object
  
    for (const job of profile.jobs) {
      // Check if the job's user id matches the session user id
      if (job.userId === userId) {
        try {
          // Ask the user if they want to send emails and notifications
          const sendEmailAndNotification = window.confirm('Do you want to send emails and notifications?');
  
          // Define data here
          const data = {
            phone: phone,
            email: email,
            notes: notes,
          };
  
          // Use id from router.query to update sensitive profile data
          // This is called regardless of the value of sendEmailAndNotification
          const updatedData = await updateSensitiveProfileData(id, token, { ...data, sendEmailAndNotification }, true, setIsUpdated);
          console.log('Updated sensitive data for job:', job.id, updatedData);
  
          // Show a popup message
          window.alert(`Sensitive data for job ${job.id} has been updated`);
  
          // If the user chose to send emails and notifications, create a new notification
          if (sendEmailAndNotification) {
            const newNotification = {
              profileName: profile.full_name,
              userName: session.user.name,
              userId: session.user.id,
              profilePicUrl: `${process.env.NEXT_PUBLIC_API_URL}/profileimages/${profile.public_identifier}_profile_pic.jpg`,
              profileId: profile.id, // Use the profile ID
              message: 'This profile has new contact info'
            };
  
            // Make a POST request to your NotificationController
            try {
              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${session.user.id}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}` // Include the session token in the request headers
                },
                body: JSON.stringify(newNotification)
              });
  
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
  
              const data = await response.json();
              console.log('Notification created:', data);
            } catch (error) {
              console.error('Error creating notification:', error);
            }
          }
        } catch (error) {
          console.error('Error updating sensitive data for job:', job.id, error);
        }
      }
    }
  };

  const updateSensitiveProfileData = async (id, token, data, isUpdate, setIsUpdated) => {

  if (!token) {
    throw new Error('Token is undefined');
  }

  const url = `${process.env.NEXT_PUBLIC_API_URL}/profiles/${id}/sensitive-data`;
  const response = await fetch(url, {
    method: isUpdate ? 'PUT' : 'POST', // Use PUT for update, POST for create
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error('Error updating sensitive data');
  }

  const updatedData = await response.json();

// Emit a 'notification' event to the server
socket.emit('notification', `User ${updatedData.userId} updated their sensitive data: ${JSON.stringify(updatedData)}`);

// Set isUpdated to true after successful update
setIsUpdated(true);

return updatedData;
};

useEffect(() => {
  if (id && token) {
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/profiles/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        setProfile(response.data);
        console.log('Profile:', response.data);
      })
      .catch(error => {
        console.error('Error:', error);
      });

    // Fetch the CV
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/profiles/${id}/cv`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      responseType: 'blob' // Important for dealing with binary data
    })
      .then(response => {
        const cvUrl = URL.createObjectURL(response.data);
        setCvUrl(cvUrl); // Set cvUrl instead of cvFile
        console.log('CV URL:', cvUrl);
      })
      .catch(error => {
        console.error('Error:', error);
      });

   

     // Clean up the effect by disconnecting when the component unmounts
     return () => {
      socket.off('notification');
    };
  }
}, [id, token]);

  const toggleExperience = () => {
    setExperienceVisible(!experienceVisible);
  };

  const toggleEducation = () => {
    setEducationVisible(!educationVisible);
  };

  if (!profile) {
    return <div>Loading...</div>;
  }


  
  
  

  const handleInterviewSubmit = async (event, session, user, interviewDate, interviewStartTime, interviewEndTime, interviewers, attendees, messages, outcome, candidateStageId, interviewId, setInterviewId, setEventId) => {
    console.log('candidateStageId:', candidateStageId);
  
    if (!candidateStageId) {
      console.error('candidateStageId is undefined');
      return;
    }
  
    event.preventDefault();
  
    if (!session || !user) {
      console.error('Session is not available or user is not set');
      return;
    }
  
    if (typeof attendees !== 'string') {
      attendees = String(attendees);
    }
  
    const interviewData = {
      startTime: new Date(`${interviewDate}T${interviewStartTime}`),
      endTime: new Date(`${interviewDate}T${interviewEndTime}`),
      interviewers: interviewers.split(',').map(s => s.trim()), // Assuming interviewers are comma-separated
      attendees: attendees.split(',').map(s => s.trim()), // Assuming attendees are comma-separated
      messages: messages,
      outcome: outcome,
    };
  
    try {
      const token = await session.getToken(); // Get the token from the session
  
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Include the Authorization header
        'X-User-Id': user.id, // Send the user ID in the headers
      };
  
      console.log('interviewId:', interviewId);
  
      let response;
  if (interviewId) {
    // Update existing interview
response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/interviews/${interviewId}`, {
  method: 'PUT',
  headers: headers,
  body: JSON.stringify(interviewData),
});

const updatedInterviewData = await response.json();


if (!response.ok) {
  throw new Error('Failed to save interview');
}

console.log('Interview updated:', updatedInterviewData);

// Show a popup message
alert('Interview updated successfully');

// Update the corresponding event
const updatedEventDetails = {
      subject: `Interview with ${interviewers}`,
      start: {
        dateTime: `${interviewDate}T${interviewStartTime}`,
        timeZone: 'Pacific Standard Time'
      },
      end: {
        dateTime: `${interviewDate}T${interviewEndTime}`,
        timeZone: 'Pacific Standard Time'
      },
      attendees: attendees.split(',').map(email => ({
        emailAddress: {
          address: email.trim(),
        },
        type: 'required'
      })),
      body: {
        contentType: "Text",
        content: messages
      },
      isOnlineMeeting: true,
      onlineMeetingProvider: "teamsForBusiness"
    };

    response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/update-event/${updatedInterviewData.eventId}`, {
  method: 'PUT',
  headers: headers,
  body: JSON.stringify(updatedEventDetails),
  credentials: 'include', // Include credentials in the request
});

if (!response.ok) {
  throw new Error('Failed to update the event');
}

const updatedEventData = await response.json(); // Store the response data in a variable
console.log('Event updated:', updatedEventData); // Use the variable here
  } else {
        // Create new interview
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/interviews`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({ ...interviewData, candidateStage: { connect: { id: candidateStageId } } }),
        });
      }
  
      const data = await response.json();


      if (!response.ok) {
        throw new Error('Failed to save interview');
      }
  
      console.log('Interview saved:', data);
      // Show a popup message
  alert('Interview created successfully');
  
      // Set the interviewId state variable when a new interview is created
      if (!interviewId) {
        setInterviewId(data.id);
      }
  
      // After the interview is successfully created or updated, create the event and online meeting
      const eventDetails = {
        subject: `Interview with ${interviewers}`,
        start: {
          dateTime: `${interviewDate}T${interviewStartTime}`,
          timeZone: 'Pacific Standard Time'
        },
        end: {
          dateTime: `${interviewDate}T${interviewEndTime}`,
          timeZone: 'Pacific Standard Time'
        },
        attendees: attendees.split(',').map(email => ({
          emailAddress: {
            address: email.trim(),
          },
          type: 'required'
        })),
        body: {
          contentType: "Text",
          content: messages
        },
        isOnlineMeeting: true,
        onlineMeetingProvider: "teamsForBusiness"
      };
  
      response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/create-event`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(eventDetails),
        credentials: 'include', // Include credentials in the request
      });

      const eventData = await response.json();

  
      if (!response.ok) {
        throw new Error('Failed to create the event');
      }
  
      console.log('Event created:', eventData);
  
      // Set the eventId state variable
      setEventId(eventData.event.id);

      // Update the interview with the eventId
response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/interviews/${data.id}`, {
  method: 'PUT',
  headers: headers,
  body: JSON.stringify({ ...interviewData, eventId: eventData.event.id }),
});
  
      if (!response.ok) {
        throw new Error('Failed to update interview with eventId');
      }
  
      console.log('Interview updated with eventId:', await response.json());
    } catch (error) {
      console.error('Error saving interview:', error);
    }
  };


  const handleInterviewDelete = async (id, session) => {
    if (!session) {
      throw new Error('Session is undefined');
    }
  
    const token = await session.getToken(); // Get the token from the session
  
    // Fetch the interview data first
    let response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/interviews/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });
  
    if (!response.ok) {
      throw new Error('Error fetching interview');
    }
  
    const interviewData = await response.json();
    const eventId = interviewData.eventId; // Get the event ID from the interview data
  
    // Confirm before deleting
    if (!window.confirm('Are you sure you want to delete this interview?')) {
      return;
    }
  
    // Delete the event
    response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/delete-event/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include', // Include credentials in the request
    });
  
    if (!response.ok) {
      throw new Error('Error deleting event');
    }
  
    console.log('Event deleted:', eventId);
  
    // Delete the interview
    response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/interviews/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include', // Include credentials in the request
    });
  
    if (!response.ok) {
      throw new Error('Error deleting interview');
    }
  
    console.log('Interview deleted:', id);
  
    // Show a popup message
    alert('Interview deleted successfully');
  
    // Refresh the component
    // This depends on your data management strategy
    // For example, if you're using React state to store the interviews, you can update the state here
    // If you're using a library like react-query or SWR, you can trigger a refetch here
  };
  
  return (
    <div className="flex flex-col pt-20">
      <CustomerHeader userId={currentUserId} notifications={notifications} setNotifications={setNotifications} />
  
      <div className="bg-white p-8 rounded-md shadow-md flex flex-col md:flex-row md:space-x-4">
        {/* Profile Information */}
        <div className="w-full md:w-1/2">
          {/* Profile Picture */}
          <div className="w-32 h-32 bg-gray-300 rounded-full overflow-hidden self-center mb-4">
            {profile.profile_pic_url ? (
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}/profileimages/${profile.public_identifier}_profile_pic.jpg`}
                alt={`Profile Pic for ${profile.full_name}`}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAE0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='; }}
              />
            ) : null}
          </div>
  
          <div className="flex flex-col">
            {/* Profile Name and Location */}
            <h1 className="text-2xl font-bold mb-2">{profile.full_name}</h1>
            <p className="text-sm mb-4">{[profile.city, profile.state, profile.country].filter(Boolean).join(', ')}</p>
            <div className="text-xs text-gray-600">
              {profile.linkedin_profile_url ? (
                <a href={profile.linkedin_profile_url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                  <img src="/logos/LI-In-Bug.png" alt="LinkedIn Logo" className="w-4 h-4 mr-1" />
                  View
                </a>
              ) : (
                "No LinkedIn profile"
              )}
            </div>
          </div>
          <SensitiveDataForm 
            phone={phone} 
            setPhone={setPhone} 
            email={email} 
            setEmail={setEmail} 
            notes={notes} 
            setNotes={setNotes} 
            handleSensitiveDataFormSubmit={handleSensitiveDataFormSubmit} 
          />




<ComposeEmail recipientEmail={email} />
<Calendar recipientEmail={email} onFetchEvents={handleEventData} />

  </div>
  {/* Jobs Section */}
<div className="w-full md:w-1/2">
{/* Display candidate stages */}
{(profile.candidateStages || []).map((candidateStage) => (
    <div key={candidateStage.id} className="mb-4 p-4 border border-gray-300 rounded">
      <p className="font-bold text-gray-600 mb-2">
        Currently at {candidateStage.stage} for{' '}
        <button className="text-blue-500 hover:text-blue-700 hover:underline" onClick={(event) => { event.stopPropagation(); window.open(`/candidatePipelinePage/${candidateStage.jobId}`, '_blank'); }}>
          {profile.jobs.find(job => job.id === candidateStage.jobId)?.title || 'Unknown'}
        </button>
      </p>
     {/*  <button onClick={() => setShowScoring({ ...showScoring, [candidateStage.id]: !showScoring[candidateStage.id] })} className="text-blue-500 hover:text-blue-700 mb-2 focus:outline-none">
        {showScoring[candidateStage.id] ? 'Hide Scoring Match for this Job' : 'Show Scoring Match for this Job'}
      </button>
      {showScoring[candidateStage.id] && (
        <div className="space-y-2">
          <div className="flex items-center">
            <span className="w-20 text-sm font-medium">Comfort:</span>
            <div className="h-2 bg-gray-200 rounded-md overflow-hidden flex-grow">
              <div className="h-full bg-blue-500" style={{ width: `${candidateStage.comfortZoneScore || 0}%` }}></div>
            </div>
            <span className="ml-2 text-sm text-gray-600">{typeof candidateStage.comfortZoneScore === 'number' ? `${candidateStage.comfortZoneScore.toFixed(1)}%` : 'N/A'}</span>
          </div>

          <div className="flex items-center">
            <span className="w-20 text-sm font-medium">Stability:</span>
            <div className="h-2 bg-gray-200 rounded-md overflow-hidden flex-grow">
              <div className="h-full bg-blue-500" style={{ width: `${candidateStage.stabilityScore || 0}%` }}></div>
            </div>
            <span className="ml-2 text-sm text-gray-600">{typeof candidateStage.stabilityScore === 'number' ? `${candidateStage.stabilityScore.toFixed(1)}%` : 'N/A'}</span>
          </div>

          <div className="flex items-center">
            <span className="w-20 text-sm font-medium">Overall:</span>
            <div className="h-2 bg-gray-200 rounded-md overflow-hidden flex-grow">
              <div className="h-full bg-blue-500" style={{ width: `${candidateStage.overallScore || 0}%` }}></div>
            </div>
            <span className="ml-2 text-sm text-gray-600">{typeof candidateStage.overallScore === 'number' ? `${candidateStage.overallScore.toFixed(1)}%` : 'N/A'}</span>
          </div>

          <div className="flex items-center">
            <span className="w-20 text-sm font-medium">Category:</span>
            <div className="h-2 bg-gray-200 rounded-md overflow-hidden flex-grow">
              <div className="h-full bg-blue-500" style={{ width: `${candidateStage.categoryScore || 0}%` }}></div>
            </div>
            <span className="ml-2 text-sm text-gray-600">{typeof candidateStage.categoryScore === 'number' ? `${candidateStage.categoryScore.toFixed(1)}%` : 'N/A'}</span>
          </div>

          <div className="flex items-center">
            <span className="w-20 text-sm font-medium">Recent:</span>
            <div className="h-2 bg-gray-200 rounded-md overflow-hidden flex-grow">
              <div className="h-full bg-blue-500" style={{ width: `${candidateStage.recentCategoryScore || 0}%` }}></div>
            </div>
            <span className="ml-2 text-sm text-gray-600">{typeof candidateStage.recentCategoryScore === 'number' ? `${candidateStage.recentCategoryScore.toFixed(1)}%` : 'N/A'}</span>
          </div>
        </div>
      )} */}
 {/* Interview Details */}
{candidateStage.interview && candidateStage.interview.map((interview, index) => (
  <div key={index} className="mt-4 p-3 bg-white shadow rounded-lg">
    <h3 className="text-base font-medium text-gray-900">Upcoming Interview for this role:</h3>
    
    <p className="mt-1 text-xs text-gray-500">
  <strong>Start Time:</strong> {new Date(interview.startTime).toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}
</p>
<p className="mt-1 text-xs text-gray-500">
  <strong>End Time:</strong> {new Date(interview.endTime).toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}
</p>
    <p className="mt-1 text-xs text-gray-500">
    <strong>Attendees:</strong> {interview.attendees.map((attendeeEmail, index) => {
  // Find the corresponding event
  const event = events.find(event => event.id === interview.eventId);
  if (!event) {
    return null;
  }
  // Find the corresponding attendee
  const attendee = event.attendees.find(attendee => attendee.email === attendeeEmail);
  if (!attendee) {
    return null;
  }

  // Determine the color and symbol based on the acceptance status
  let color, symbol;
  switch (attendee.acceptanceStatus) {
    case 'accepted':
      color = '#32CD32'; // Less bright green
      symbol = '✓';
      break;
    case 'declined':
      color = '#FF0000'; // Bright red
      symbol = '✗';
      break;
    default:
      color = '#0000FF'; // Bright blue
      symbol = '?';
  }

  return (
    <span key={index}>
      {attendee.email} (Accepted?: <strong style={{ color }}>{symbol}</strong>)
    </span>
  );
})}
</p>
    <p className="mt-1 text-xs text-gray-500">
      <strong>Message:</strong> {interview.messages}
    </p>
    <p className="mt-1 text-xs text-gray-500">
      <strong>Outcome:</strong> {interview.outcome}
    </p>

  {/* Conditional rendering of Update Interview Form */}
{showInterviewUpdateForms[interview.id] ? (
  <form onSubmit={(event) => handleInterviewSubmit(
    event,
    session,
    user,
    interviewDates[candidateStage.id] || '',
    interviewStartTimes[candidateStage.id] || '',
    interviewEndTimes[candidateStage.id] || '',
    interviewers[candidateStage.id] || '',
    attendees[candidateStage.id] || '',
    messages[candidateStage.id] || '',
    outcomes[candidateStage.id] || '',
    candidateStage.id,
    interview.id, // pass the id of the current interview
    setInterviewId
  )} className="space-y-1 text-xs">
    <label>
      Interview Date
      <input 
        type="date" 
        value={interviewDates[candidateStage.id] || ''} 
        onChange={e => setInterviewDates({ ...interviewDates, [candidateStage.id]: e.target.value })} 
        required 
        className="block w-1/2 py-1 px-1 border border-gray-300 rounded-md"
      />
    </label>
    <label>
      Interview Start Time
      <input 
        type="time" 
        value={interviewStartTimes[candidateStage.id] || ''} 
        onChange={e => setInterviewStartTimes({ ...interviewStartTimes, [candidateStage.id]: e.target.value })} 
        required 
        className="block w-1/2 py-1 px-1 border border-gray-300 rounded-md"
      />
    </label>
    <label>
      Interview End Time
      <input 
        type="time" 
        value={interviewEndTimes[candidateStage.id] || ''} 
        onChange={e => setInterviewEndTimes({ ...interviewEndTimes, [candidateStage.id]: e.target.value })} 
        required 
        className="block w-1/2 py-1 px-1 border border-gray-300 rounded-md"
      />
    </label>
    <label>
      Interviewers
      <input 
        type="text" 
        value={interviewers[candidateStage.id] || ''} 
        onChange={e => setInterviewers({ ...interviewers, [candidateStage.id]: e.target.value })} 
        required 
        className="block w-1/2 py-1 px-1 border border-gray-300 rounded-md"
      />
    </label>
    <label>
      Attendees
      <input 
        type="text" 
        value={attendees[candidateStage.id] || ''} 
        onChange={e => setAttendees({ ...attendees, [candidateStage.id]: e.target.value.split(',') })} // split into array
        required 
        className="block w-1/2 py-1 px-1 border border-gray-300 rounded-md"
      />
    </label>
    <label>
      Messages
      <textarea 
        value={messages[candidateStage.id] || ''} 
        onChange={e => setMessages({ ...messages, [candidateStage.id]: e.target.value })} 
        required 
        className="block w-1/2 py-1 px-1 border border-gray-300 rounded-md"
      />
    </label>
    <label>
      Outcome
      <select 
        value={outcomes[candidateStage.id] || ''} 
        onChange={e => setOutcomes({ ...outcomes, [candidateStage.id]: e.target.value })} 
        required
        className="block w-1/2 py-1 px-1 border border-gray-300 rounded-md"
      >
        <option value="">Select outcome...</option>
        <option value="ONE">One</option>
        <option value="TWO">Two</option>
        <option value="THREE">Three</option>
        <option value="FOUR">Four</option>
        <option value="FIVE">Five</option>
      </select>
    </label>
    <div className="flex justify-between">
      <button type="submit" className="py-1 px-2 bg-blue-500 text-white rounded-md text-xs">Update Interview</button>
      <button onClick={() => toggleUpdateForm(interview.id)} className="ml-1 py-1 px-2 bg-gray-500 text-white rounded-md text-xs">Cancel</button>
    </div>
  </form>
) : (
  <button onClick={() => toggleUpdateForm(interview.id)} className="py-1 px-2 bg-green-500 text-white rounded-md text-xs">Update Interview</button>
)}

    {/* Delete Interview Button */}
    <button onClick={() => handleInterviewDelete(interview.id, session)} className="mt-1 py-1 px-2 bg-red-500 text-white rounded-md text-xs">Delete Interview</button>
  </div>
))}

{/* Form for creating a new interview */}
{showCreateInterviewForm[candidateStage.id] ? (
  <form onSubmit={(event) => handleInterviewSubmit(
    event,
    session,
    user,
    interviewDates[candidateStage.id] || '',
    interviewStartTimes[candidateStage.id] || '', // new field
    interviewEndTimes[candidateStage.id] || '', // new field
    interviewers[candidateStage.id] || '',
    attendees[candidateStage.id] || '', // new field
    messages[candidateStage.id] || '', // new field
    outcomes[candidateStage.id] || '',
    candidateStage.id,
    undefined, // pass undefined as the interviewId to create a new interview
    setInterviewId,
    setEventId // add this line

  )} className="space-y-1 text-xs">
    
    <label>
      Interview Date
      <input 
        type="date" 
        value={interviewDates[candidateStage.id] || ''} 
        onChange={e => setInterviewDates({ ...interviewDates, [candidateStage.id]: e.target.value })} 
        required 
        className="block w-1/2 py-1 px-1 border border-gray-300 rounded-md"
      />
    </label>
    
    <label>
      Interviewers
      <input 
        type="text" 
        value={interviewers[candidateStage.id] || ''} 
        onChange={e => setInterviewers({ ...interviewers, [candidateStage.id]: e.target.value })} 
        required 
        className="block w-1/2 py-1 px-1 border border-gray-300 rounded-md"
      />
    </label>
    <label>
      Start Time
      <input 
        type="time" 
        value={interviewStartTimes[candidateStage.id] || ''} 
        onChange={e => setInterviewStartTimes({ ...interviewStartTimes, [candidateStage.id]: e.target.value })} 
        required 
        className="block w-1/2 py-1 px-1 border border-gray-300 rounded-md"
      />
    </label>
    <label>
      End Time
      <input 
        type="time" 
        value={interviewEndTimes[candidateStage.id] || ''} 
        onChange={e => setInterviewEndTimes({ ...interviewEndTimes, [candidateStage.id]: e.target.value })} 
        required 
        className="block w-1/2 py-1 px-1 border border-gray-300 rounded-md"
      />
    </label>
    <label>
      Attendees
      <input 
        type="text" 
        value={attendees[candidateStage.id] || ''} 
        onChange={e => setAttendees({ ...attendees, [candidateStage.id]: e.target.value.split(',') })} // split into array
        required 
        className="block w-1/2 py-1 px-1 border border-gray-300 rounded-md"
      />
    </label>
    <label>
      Messages
      <textarea 
        value={messages[candidateStage.id] || ''} 
        onChange={e => setMessages({ ...messages, [candidateStage.id]: e.target.value })} 
        required 
        className="block w-1/2 py-1 px-1 border border-gray-300 rounded-md"
      />
    </label>
    <label>
      Outcome
      <select 
        value={outcomes[candidateStage.id] || ''} 
        onChange={e => setOutcomes({ ...outcomes, [candidateStage.id]: e.target.value })} 
        required
        className="block w-1/2 py-1 px-1 border border-gray-300 rounded-md"
      >
        <option value="">Select outcome...</option>
        <option value="ONE">One</option>
        <option value="TWO">Two</option>
        <option value="THREE">Three</option>
        <option value="FOUR">Four</option>
        <option value="FIVE">Five</option>
      </select>
    </label>
    <div className="flex justify-between">
      <button type="submit" className="py-1 px-2 bg-blue-500 text-white rounded-md text-xs">Create Interview</button>
      <button onClick={() => toggleCreateForm(candidateStage.id)} className="ml-1 py-1 px-2 bg-gray-500 text-white rounded-md text-xs">Cancel</button>
    </div>
  </form>
) : (
  <button onClick={() => toggleCreateForm(candidateStage.id)} className="py-1 px-2 bg-blue-500 text-white rounded-md text-xs">Add Interview</button>
)}

    </div>
  ))}


        {/* Upload CV Section */}
    <div className="w-full">
      <h2 className="text-xl font-bold mb-4">Upload CV</h2>
      <form onSubmit={handleFormSubmit} className="mb-4">
        <input type="file" onChange={handleFileChange} className="mb-2" />
        <button type="submit" disabled={!token || loading || !session} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-300">Upload</button>
      </form>

      {/* CV Preview */}
      {cvUrl && (
        <div>
          <h2 className="text-xl font-bold mb-2">CV Preview</h2>
          <iframe src={cvUrl} width="150" height="125" className="mb-4" />  
        </div>
      )}

      {/* Download CV */}
      {cvUrl && (
        <div>
          <h2 className="text-xl font-bold mb-2">CV</h2>
          <a href={cvUrl} download className="mr-4 text-blue-500 hover:text-blue-700">Download</a>
          <a href={cvUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">View</a>
        </div>
      )}
    </div>
 

   {/* Experience Section */}
    <div className="w-full">
      <h2 className="text-xl font-bold mb-4 cursor-pointer" onClick={toggleExperience}>Show Experience</h2>
      {experienceVisible && profile.experiences && profile.experiences.map((experience, index) => (
        <div key={index} className="mb-4">
          <h3 className="text-lg font-bold">{experience.company}</h3>
          <p>{experience.title}</p>
          <p>Starts at: {experience.starts_at ? new Date(experience.starts_at).toLocaleDateString() : 'N/A'}</p>
          <p>Ends at: {experience.ends_at ? new Date(experience.ends_at).toLocaleDateString() : 'N/A'}</p>
          <p>{experience.description || 'N/A'}</p>
        </div>
      ))}
    </div>

    {/* Education Section */}
    <div className="w-full">
      <h2 className="text-xl font-bold mb-4 cursor-pointer" onClick={toggleEducation}>Show Education</h2>
      {educationVisible && profile.education && profile.education.map((education, index) => (
        <div key={index} className="mb-4">
          <h3 className="text-lg font-bold">{education.school}</h3>
          <p>{education.degree_name}</p>
          <p>Starts at: {education.starts_at ? new Date(education.starts_at).toLocaleDateString() : 'N/A'}</p>
          <p>Ends at: {education.ends_at ? new Date(education.ends_at).toLocaleDateString() : 'N/A'}</p>
        </div>
      ))}
    </div> 

    
  </div>
</div>

    </div>
  );
}

export default FullProfilePage;


