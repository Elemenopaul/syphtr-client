import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Job } from '../interfaces/job.interface';
import { UserButton, useUser } from "@clerk/nextjs";

interface Profile {
  id: number;
  name: string;
  jobs: number[];
}

const isValidDate = (dateString: string) => {
  const regEx = /^\d{4}-\d{2}-\d{2}$/;
  return dateString.match(regEx) != null;
}

export default function JobsPage() {
  const { user } = useUser();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [newJob, setNewJob] = useState<{
    userId: string,
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
    userId: user ? user.id : '', // Check if user is defined before accessing user.id
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

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Add the useEffect hook here
useEffect(() => {
  if (user) {
    setNewJob(prevJob => ({
      ...prevJob,
      userId: user.id,
    }));
  }
}, [user]);


  function handleNewJobChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.name === 'clientId' ? parseInt(e.target.value, 10) : e.target.value;
    setNewJob({
      ...newJob,
      [e.target.name]: value
    });
  }
  
  const handleNewJobSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValidDate(newJob.openSince)) {
      console.error('Date is not in the correct format');
      return;
    }

    console.log('Submitting new job:', newJob);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newJob),
    });
    console.log('Response status:', response.status, response.statusText);
    const job = await response.json();
    console.log('Response data:', job);
    setJobs([...jobs, job]);
  };

  useEffect(() => {
    const fetchJobs = async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs?userId=${user?.id}`);
      const jobs = await response.json();
      if (Array.isArray(jobs)) {
        setJobs(jobs);
      } else {
        setJobs([]);
      }
    };
  
    if (user) {
      fetchJobs();
    }
  }, [user]); // Add user as a dependency
  
  useEffect(() => {
    const fetchProfiles = async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profiles`);
      const profiles = await response.json();
      Array.isArray(profiles) ? setProfiles(profiles) : setProfiles([]);
    };
  
    fetchProfiles();
  }, []);

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


      <div className="flex flex-col flex-grow ml-4 text-gray-400 font-bold">
  {jobs.map((job, index) => (
    <div
      key={index}
      className="border-1 border-solid border-gray-300 rounded-md p-4 mb-4 shadow-md text-gray-400 font-bold"
    >
      <h2 className="text-xl font-bold mb-2">{job.title}</h2>
      <p><strong>Department:</strong> {job.department}</p>
      <p><strong>Business Unit:</strong> {job.businessUnit}</p>
      <p><strong>Hiring Team:</strong> {job.hiringTeam}</p>
      <p><strong>Salary:</strong> {job.salary}</p>
      <p><strong>Currency:</strong> {job.currency}</p>
      <p><strong>Client:</strong> {job.client ? job.client.name : 'Unknown'}</p>
      <p><strong>Job ID:</strong> {job.id}</p>
      <p><strong>Open Since:</strong> {new Date(job.openSince).toLocaleDateString()}</p>
      <p><strong>Number of profiles:</strong> {job.candidates ? job.candidates.length : 0}</p>
      <Link href={`/editjob?id=${job.id}`} className="text-green-500 hover:underline">Edit Job</Link>
      <Link href={`/jobDetails/${job.id}`} className="text-blue-500 hover:underline ml-2">View Candidates</Link>
    </div>

        ))}
      </div>
    </div>
  
  
);
  
}