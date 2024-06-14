import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Job } from '../interfaces/job.interface';
import { UserButton, useUser } from "@clerk/nextjs";
import CustomerHeader from '../components/CustomerHeader';
import { useSession } from '@clerk/nextjs';
import jwt from 'jsonwebtoken';
import CreateJob from '../components/createJobComponent';

export class CreateTalentPoolDto {
  readonly orgId!: string;
  readonly name!: string;
  readonly profileIds?: number[];
}



interface Profile {
  id: number;
  name: string;
  jobs: number[];
}

const isValidDate = (dateString: string) => {
  const regEx = /^\d{4}-\d{2}-\d{2}$/;
  return dateString.match(regEx) != null;
}

const getDaysOpen = (createdAt: string | Date) => {
  const currentDate = new Date();
  const createdDate = new Date(createdAt);
  const differenceInTime = currentDate.getTime() - createdDate.getTime();
  return Math.floor(differenceInTime / (1000 * 3600 * 24));
}

export default function JobsPage() {
  const { user } = useUser();
  const { session } = useSession();
  const currentUserId = user?.id;
  const [jobs, setJobs] = useState<Job[]>([]);
  const [notifications, setNotifications] = useState([]);
  const [orgId, setOrgId] = useState(null);
  const [token, setToken] = useState('');
  const [talentPool, setTalentPool] = useState<CreateTalentPoolDto | null>(null);
  const [filters, setFilters] = useState<{ [key: string]: string }>(() => {
    if (typeof window !== 'undefined') {
      // Load the filters from local storage
      const savedFilters = localStorage.getItem('jobFilters');
  
      return savedFilters ? JSON.parse(savedFilters) : {
        title: '',
        userId: '', // Initialize to an empty string
        department: '',
        businessUnit: '',
        hiringTeam: '',
        salary: '',
        currency: '',
        client: '',
        openSince: '',
        numberOfProfiles: '',
      };
    } else {
      return {
        title: '',
        userId: '', // Initialize to an empty string
        department: '',
        businessUnit: '',
        hiringTeam: '',
        salary: '',
        currency: '',
        client: '',
        openSince: '',
        numberOfProfiles: '',
      };
    }
  });
  const [showForm, setShowForm] = useState(false);
  const [newJob, setNewJob] = useState<{
    userId: string,
    orgId: string;
    clientId: string, 
    department: string, 
    businessUnit: string, 
    hiringTeam: string[], 
    title: string, 
    salary: string, 
    currency: string, 
    openSince: string, 
    id: number, 
    candidates: Profile[],
    clientName: string
  }>({
    userId: user?.id || '',
    orgId: orgId || '',
    clientId: '',
    department: '',
    businessUnit: '',
    hiringTeam: [],
    title: '',
    salary: '',
    currency: '',
    openSince: '',
    id: 0,
    candidates: [],
    clientName: ''
  });
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isModalOpen, setIsModalOpen] = useState(false);

const openModal = () => {
  setIsModalOpen(true);
};

const closeModal = () => {
  setIsModalOpen(false);
};

  useEffect(() => {
  const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
  console.log(allNotifications);
  setNotifications(allNotifications);
}, []);

useEffect(() => {
  console.log('session:', session);
  if (session) {
    const getOrgId = async () => {
      const token = await session.getToken();
      console.log('Token:', token); // Log the token
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/orgId`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Include the Authorization header
        },
      });
      console.log('Response status:', response.status, response.statusText); // Log the response status
      const data = await response.json();
      console.log('Response data:', data); // Log the response data
      setOrgId(data.orgId);
    };

    getOrgId();
  }
}, [session]);

useEffect(() => {
  const sessionToken = sessionStorage.getItem('token');
  console.log('sessionToken:', sessionToken);
  if (sessionToken) {
    setToken(sessionToken);
  }
}, []);

useEffect(() => {
  console.log('user:', user);
  console.log('token:', token);
  if (user && token) {
    const decodedToken = jwt.decode(token);
    console.log('decodedToken:', decodedToken);
    let orgId = '';
    if (typeof decodedToken === 'object' && decodedToken !== null) {
      orgId = 'org_id' in decodedToken ? decodedToken.org_id : '';
    }
    console.log('orgId:', orgId);
    setNewJob(prevJob => ({
      ...prevJob,
      userId: user.id,
      orgId: orgId,
    }));
  }
}, [user, token]);


const handleNewTalentPoolSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  const target = event.target as typeof event.target & {
    name: { value: string };
  };

  const name = target.name.value; // The value of the input field with the name "name"

  console.log('orgId:', orgId); // Log the value of orgId

  const createTalentPoolDto = { name, orgId }; // Include orgId in the DTO

  // Fetch the token
  if (session) {
    const token = await session.getToken();

    console.log('Submitting new talent pool:', createTalentPoolDto);
    console.log('Authorization header:', `Bearer ${token}`); // Log Authorization header
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${orgId}/talentPools`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Include the Authorization header
      },
      body: JSON.stringify(createTalentPoolDto),
    });

    const talentPool = await response.json();
    console.log('Created talent pool:', talentPool);
  }
};




const handleNewJobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.name === 'clientId' ? parseInt(e.target.value, 10) : e.target.value;
  setNewJob({
    ...newJob,
    [e.target.name]: value,
  });
}
  
const handleNewJobSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  if (!isValidDate(newJob.openSince)) {
    console.error('Date is not in the correct format');
    return;
  }

  const userId = user ? user.id : '';

  console.log('orgId:', orgId);
  console.log('userId:', userId);
  console.log('newJob before update:', newJob);

  // Update orgId and userId in newJob
  const updatedJob = {
    ...newJob,
    orgId: orgId,
    userId: userId,
  };

  console.log('updatedJob:', updatedJob);

  // Fetch the token
  if (session) {
    const token = await session.getToken();

    console.log('Submitting new job:', updatedJob);
    console.log('Authorization header:', `Bearer ${token}`); // Log Authorization header
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Include the Authorization header
      },
      body: JSON.stringify(updatedJob), // Send updatedJob instead of newJob
    });
    console.log('Response status:', response.status, response.statusText);
    const job = await response.json();
    console.log('Response data:', job);
    setJobs([...jobs, job]);
  }
};



useEffect(() => {
  const fetchTalentPool = async () => {
    if (session) {
      const token = await session.getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/talentPool`, {
        headers: {
          'Authorization': `Bearer ${token}`, // Include the Authorization header
        },
      });

      const data = await response.json();
      setTalentPool(data);
    }
  };

  if (user) {
    fetchTalentPool();
  }
}, [user, session]); // Add user and session as dependencies



  useEffect(() => {
    const fetchJobs = async () => {
      if (session) {
        const token = await session.getToken();
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs`, {
          headers: {
            'Authorization': `Bearer ${token}`, // Include the Authorization header
          },
        });

        const jobs = await response.json();
        if (Array.isArray(jobs)) {
          setJobs(jobs);
        } else {
          setJobs([]);
        }
      }
    };
  
    if (user) {
      fetchJobs();
    }
  }, [user, session]); // Add user and session as dependencies

  const filterJobs = () => {
    let filteredJobs = jobs;
    for (const key in filters) {
      if (filters[key]) {
        if (key === 'client') {
          filteredJobs = filteredJobs.filter(job => job.client?.name?.toLowerCase().includes(filters[key].toLowerCase()));
        } else {
          filteredJobs = filteredJobs.filter(job => job[key as keyof Job]?.toString().toLowerCase().includes(filters[key].toLowerCase()));
        }
      }
    }
    // Sort the filtered jobs according to the selected sort order
    filteredJobs.sort((a, b) => {
      const dateA = new Date(a.openSince);
      const dateB = new Date(b.openSince);
      return sortOrder === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    });
    return filteredJobs;
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, column: string) => {
    const value = e.target.value;
    setFilters(prevFilters => {
      const newFilters = {
        ...prevFilters,
        [column]: value,
      };
  
      // Save the new filters to local storage
      localStorage.setItem('jobFilters', JSON.stringify(newFilters));
  
      return newFilters;
    });
  };

  const handleDeleteJob = async (id: number) => {
    // Show confirmation dialog
    const confirmDelete = window.confirm('Are you sure you want to delete this job? All associated candidates will also be deleted.');
    if (!confirmDelete) {
      return; // If user cancels, exit function
    }
  
    // Fetch the token
    if (session) {
      const token = await session.getToken();
  
      // If user confirms deletion, proceed with deletion
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`, // Include the Authorization header
        },
      });
      if (response.ok) {
        const updatedJobs = jobs.filter(job => job.id !== id);
        setJobs(updatedJobs);
      } else {
        console.error('Failed to delete job');
      }
    }
  };

  // Define the users object
const users: Record<string, string> = {
  'user_2cLXikcZM5Fcy8LguV6TTONAwBd': 'Paul Woodfall',
  'user_2f7zpZoUrXBsOZtNn5GWzvC3HMl': 'Daniel Bennet',
  'user_2cLY5QfIpuBjrtKWET48H6bgQSF': 'Bobby Smiffy'
  // Add more users as needed
};

const clearFilters = () => {
  const clearedFilters = {
    title: '',
    userId: '',
    department: '',
    businessUnit: '',
    hiringTeam: '',
    salary: '',
    currency: '',
    client: '',
    openSince: '',
    numberOfProfiles: '',
  };
  setFilters(clearedFilters);
  localStorage.setItem('jobFilters', JSON.stringify(clearedFilters));  // Save cleared filters to local storage
};

// Extract unique clients from the jobs list
const clientsArray = Array.from(new Set(jobs.map(job => job.client.name))).map(name => {
  return {
    id: jobs.find(job => job.client.name === name)?.client.id,
    name: name
  };
});

return (
  <div className="flex flex-col pt-20">
    <CustomerHeader userId={currentUserId} notifications={notifications} setNotifications={setNotifications} />

    


   {/* } <button onClick={() => setShowForm(!showForm)}>
      {showForm ? 'Close Talent Pool Form' : 'Create a new Talent Pool'}
    </button>

    {showForm && (
      <div className="flex text-gray-400 font-bold">
        <form onSubmit={handleNewTalentPoolSubmit} className="bg-white p-8 rounded-md shadow-md w-96">
          <h1 className="text-2xl font-bold mb-4">Create a new Talent Pool</h1>

          <input
            name="name"
            placeholder="Name"
            className="border p-2 rounded-md w-full mb-4"
          />

          <button
            type="submit"
            className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600 transition duration-300"
          >
            Create Talent Pool
          </button>
        </form>
      </div>
    )} */}



      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Close Job Form' : 'Create a new job'}
      </button>

      {showForm && (
        <div className="flex text-gray-400 font-bold">
         <form onSubmit={handleNewJobSubmit} className="bg-white p-8 rounded-md shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4">Create a new job</h1>
       
        <input
          name="department"
          value={newJob.department}
          onChange={handleNewJobChange}
          placeholder="Department"
          className="border p-2 rounded-md w-full mb-4"
        />
        <input
          name="businessUnit"
          value={newJob.businessUnit}
          onChange={handleNewJobChange}
          placeholder="Business Unit"
          className="border p-2 rounded-md w-full mb-4"
        />
        <input
          name="hiringTeam"
          value={newJob.hiringTeam}
          onChange={handleNewJobChange}
          placeholder="Hiring Team"
          className="border p-2 rounded-md w-full mb-4"
        />
        <input
          name="title"
          value={newJob.title}
          onChange={handleNewJobChange}
          placeholder="Title"
          className="border p-2 rounded-md w-full mb-4"
        />
        <input
          name="salary"
          value={newJob.salary}
          onChange={handleNewJobChange}
          placeholder="Salary"
          className="border p-2 rounded-md w-full mb-4"
        />
        <input
          name="currency"
          value={newJob.currency}
          onChange={handleNewJobChange}
          placeholder="Currency"
          className="border p-2 rounded-md w-full mb-4"
        />
        <input
          type="date"
          name="openSince"
          value={newJob.openSince}
          onChange={handleNewJobChange}
          className="border p-2 rounded-md w-full mb-4"
        />
        <input
          name="clientName"
          value={newJob.clientName}
          onChange={handleNewJobChange}
          placeholder="Client Name"
          className="border p-2 rounded-md w-full mb-4"
        />

        <button
          type="submit"
          className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600 transition duration-300"
        >
          Create Job
        </button>
      </form>
        </div>
      )}

<button onClick={clearFilters}>Clear Filters</button>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title <input type="text" value={filters.title} onChange={e => handleFilterChange(e, 'title')} />
              </th>
              
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
  Job Owner 
  <select value={filters.userId} onChange={e => handleFilterChange(e, 'userId')}>
    <option value="">All</option>
    {Object.entries(users).map(([userId, userName]) => (
      <option key={userId} value={userId}>
        {userName}
      </option>
    ))}
  </select>
</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department <input type="text" value={filters.department} onChange={e => handleFilterChange(e, 'department')} />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Business Unit <input type="text" value={filters.businessUnit} onChange={e => handleFilterChange(e, 'businessUnit')} />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hiring Team <input type="text" value={filters.hiringTeam} onChange={e => handleFilterChange(e, 'hiringTeam')} />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Salary <input type="text" value={filters.salary} onChange={e => handleFilterChange(e, 'salary')} />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Currency <input type="text" value={filters.currency} onChange={e => handleFilterChange(e, 'currency')} />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
  Client 
  <select value={filters.client} onChange={e => handleFilterChange(e, 'client')}>
    <option value="">All</option>
    {clientsArray.map(client => (
      <option key={client.id} value={client.name}>
        {client.name}
      </option>
    ))}
  </select>
</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Open Since 
                <input type="text" value={filters.openSince} onChange={e => handleFilterChange(e, 'openSince')} />
                <select value={sortOrder} onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')}>
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Number of Profiles <input type="text" value={filters.numberOfProfiles} onChange={e => handleFilterChange(e, 'numberOfProfiles')} />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>


          
        {/*  <tbody className="bg-white divide-y divide-gray-200">
  {talentPool && (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-bold">
        {talentPool.name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{talentPool.orgId}</td>      
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{talentPool.profileIds ? talentPool.profileIds.length : 0}</td>
    </tr>
  )}
</tbody> */}


          <tbody className="bg-white divide-y divide-gray-200">
            {filterJobs().map((job, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-bold">
                    <Link href={`/candidatePipelinePage/${job.id}`}>
                    {job.title}
                  </Link>
                </td>  
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{users[job.userId] || job.userId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.department}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.businessUnit}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.hiringTeam ? job.hiringTeam.join(', ') : ''}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.salary}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.currency}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.client ? job.client.name : 'Unknown'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(job.openSince).toLocaleDateString()} 
                ({getDaysOpen(job.openSince)} days open)
              </td>             
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.candidates ? job.candidates.length : 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-bold">
                <Link href={`/newEditJob?id=${job.id}`}>
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500 hover:text-orange-600 cursor-pointer mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5v4a1 1 0 001 1h4m-5 4a2 2 0 00-2 2v5a2 2 0 002 2h5a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0013 3H9a2 2 0 00-2 2v12a2 2 0 002 2h2" />
  </svg>
</Link>
                <svg onClick={() => handleDeleteJob(job.id)} xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 hover:text-red-600 cursor-pointer mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <Link href={`/candidatePipelinePage/${job.id}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 hover:text-blue-600 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14a4 4 0 100-8 4 4 0 000 8zm0 2a6 6 0 00-6 6h12a6 6 0 00-6-6z" />
                </svg>
              </Link>
              </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
