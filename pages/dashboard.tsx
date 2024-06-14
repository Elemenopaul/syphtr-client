import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';
import { UserButton } from "@clerk/nextjs";
import { useSession } from '@clerk/nextjs';
import { useUser } from '@clerk/clerk-react';
import io from 'socket.io-client';
import CustomerHeader from '../components/CustomerHeader';
import jwt from 'jsonwebtoken';
import ComposeEmail from '../components/emailComponent';
import SensitiveDataForm from '../components/sensitiveDataComponent';
import Calendar from '../components/calendarComponent';
import UnfilteredCalendar from '../components/unfilteredCalendarComponent';

// Define the Interview interface
interface Interview {
  startTime: string;
  endTime: string;
  attendees: string[];
  messages: string;
  outcome: string;
  candidateStage: {
    job: {
      title: string;
      userId: string;
    };
    profile: {
      full_name: string;
    };
  };
}

const DashBoard = () => {
  const router = useRouter();
  const { id } = router.query;
  const [profile, setProfile] = useState(null);
  const [experienceVisible, setExperienceVisible] = useState(false); // Set default to false
  const [educationVisible, setEducationVisible] = useState(false); // Set default to false
  const [file, setFile] = useState(null);
  const [token, setToken] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const { user } = useUser();
  const [jobs, setJobs] = useState([]);
  const [stages, setStages] = useState([]);
  const [showScoring, setShowScoring] = useState({});
  const currentUserId = user?.id;
  const [isUpdated, setIsUpdated] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [orgId, setOrgId] = useState<string | null>(null);
  const { session } = useSession();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const handleUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    console.log('Selected User ID:', selectedValue); // Log the selected user ID
    setSelectedUserId(selectedValue);
  };

  useEffect(() => {
    if (session) {
      const getOrgId = async () => {
        const token = await session.getToken();
        console.log('Token:', token); // Log the token

        if (token) {
          // Decode the token
          const decodedToken = jwt.decode(token);
          console.log('decodedToken:', decodedToken);
          let orgId = '';
          if (typeof decodedToken === 'object' && decodedToken !== null) {
            orgId = 'org_id' in decodedToken ? decodedToken.org_id : '';
            // Check if the user is an admin
            if ('org_role' in decodedToken && decodedToken.org_role === 'org:admin') {
              setIsAdmin(true);
            }
          }
          console.log('orgId:', orgId);

          // Set orgId as a state variable
          setOrgId(orgId);
          // Set token as a state variable
          setToken(token);
        }
      };

      getOrgId();
    }
  }, [session]);

  useEffect(() => {
    if (user && orgId && token) {
      // Define headers
      const headers = {
        'Authorization': `Bearer ${token}`, // Use the JWT token
      };

      // Fetch interviews from API
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/interviews`, {
        method: 'GET',
        headers: headers,
      })
        .then(response => response.json())
        .then(data => {
          console.log('Fetched interviews:', data); // Log fetched interviews
          // Set the interviews state
          setInterviews(data);
        })
        .catch(error => {
          console.error('Error fetching interviews:', error);
        });
    }
  }, [orgId, user, token]); // Dependency array

  // Define the users object
  const users: Record<string, string> = {
    'user_2cLXikcZM5Fcy8LguV6TTONAwBd': 'Paul Woodfall',
    'user_2f7zpZoUrXBsOZtNn5GWzvC3HMl': 'Daniel Bennet',
    'user_2cLY5QfIpuBjrtKWET48H6bgQSF': 'Bobby Smiffy'
    // Add more users as needed
  };

  return (
    <div className="flex flex-col pt-20">
      <CustomerHeader userId={currentUserId} notifications={notifications} setNotifications={setNotifications} />
      <Link href="/customer-organization-profile" passHref>
        <button className="font-bold transition duration-300 ease-in-out cursor-pointer text-green-500">
          Your Team
        </button>
      </Link>
      <div>
        {/* }  <UnfilteredCalendar/> */}
      </div>
      <select value={selectedUserId || ''} onChange={handleUserChange}>
        <option value="">Filter Interviews by Team Member</option>
        {Object.keys(users).map(userId => (
          <option key={userId} value={userId}>{users[userId]}</option>
        ))}
      </select>
      {/* Display interviews */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {interviews
          .filter(interview => {
            // Check if the interview should be displayed
            const isOwner = interview.candidateStage.job.userId === currentUserId;
            const isSelectedUser = interview.candidateStage.job.userId === selectedUserId;
            console.log('Interview:', interview);
            console.log('isAdmin:', isAdmin, 'isOwner:', isOwner, 'isSelectedUser:', isSelectedUser);
            // Admins see all interviews if no user is selected, otherwise filter by selected user
            if (isAdmin) {
              return selectedUserId ? isSelectedUser : true;
            }
            // Non-admin users see their own interviews
            return isOwner;
          })
          .map((interview, index) => (
            <div key={index} className="mt-4 p-3 bg-white shadow rounded-lg">
              <h3 className="text-base font-medium text-gray-900">Upcoming Interview:</h3>
              <p className="mt-1 text-xs text-gray-500">
                <strong>Job:</strong> {interview.candidateStage.job.title}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                <strong>Candidate:</strong> {interview.candidateStage.profile.full_name}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                <strong>Starts:</strong> {new Date(interview.startTime).toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                <strong>Ends:</strong> {new Date(interview.endTime).toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                <strong>Attendees:</strong> {interview.attendees.join(', ')}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                <strong>Job Owner:</strong> {users[interview.candidateStage.job.userId]}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default DashBoard;
