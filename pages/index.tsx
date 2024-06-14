import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { UserButton, useUser } from "@clerk/nextjs";
import { useRouter } from 'next/router';

interface JobData {
  id: number;
  userId: string;
  clientId: number;
  department: string;
  businessUnit: string;
  hiringTeam: string[];
  title: string;
  salary: number;
  currency: string;
  openSince: string;
  description: string;
  candidates: any[]; // Replace `any` with the actual type of the candidates
  createdAt: string;
  updatedAt: string;
  candidateStages: any[]; // Replace `any` with the actual type of the candidate stages
}

const FirstSelectionPage = () => {
  const { user } = useUser();
  const [jobsData, setJobsData] = useState<JobData[]>([]); // Use JobData type here
  const totalCandidates = jobsData.reduce((total, job) => total + job.candidates.length, 0);

  const router = useRouter(); // Initialize useRouter

  useEffect(() => {
    router.replace('/dashboard'); // Redirect to /dashboard
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs?userId=${user?.id}`);
      const jobs = await response.json();
      Array.isArray(jobs) ? setJobsData(jobs) : setJobsData([]);
    };

    if (user) {
      fetchJobs();
    }
  }, [user]); // Add user as a dependency

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
      <div className="flex flex-col items-center">
  <div className="card bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
    <h2 className="font-bold text-xl mb-2 text-gray-700">Total Open Jobs</h2>
    <div className="flex items-center text-gray-700 font-bold">
      <p className="mr-2">{jobsData.length}</p>
      <ul className="list-disc list-inside">
        {jobsData.map(job => (
          <li key={job.id} className="text-sm">
            {job.title} - {job.candidates.length} candidates
          </li>
        ))}
      </ul>
    </div>
  </div>
  <div className="card bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
    <h2 className="font-bold text-xl mb-2 text-gray-700">Total Candidates Against All Jobs</h2>
    <p className="text-gray-700 text-base font-bold">{totalCandidates}</p>
  </div>
</div>
    </div>
  );
};

export default FirstSelectionPage;