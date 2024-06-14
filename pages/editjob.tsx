// pages/editJobPage.tsx
import { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link'; // Import Link from next/link
import { UserButton } from "@clerk/nextjs"; // Add this line



interface Client {
  name?: string;
  // Add other fields as necessary
}

interface Job {
  id?: number;
  clientId?: number;
  department?: string;
  businessUnit?: string;
  hiringTeam?: string[];
  title?: string;
  salary?: number;
  currency?: string;
  openSince?: Date;
  client?: Client;
  // Add other fields as necessary
}

export default function EditJobPage() {
  const router = useRouter();
  const { id } = router.query; // Get the job ID from the URL parameters
  const [job, setJob] = useState<Job | null>(null);

  useEffect(() => {
    // Fetch the current details of the job when the component mounts
    const fetchJob = async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${id}`);
      const job = await response.json();
      setJob(job);
    };

    if (id) {
      fetchJob();
    }
  }, [id]);

  const handleJobChange = (e: ChangeEvent<HTMLInputElement>) => {
    const fieldName = e.target.name;
    let value: string | number | string[] = e.target.value;
  
    // If the field is 'salary' or 'clientId', convert the value to a number
    if (fieldName === 'salary' || fieldName === 'clientId') {
      value = parseFloat(value);
    }
  
    // If the field is 'hiringTeam', convert the value to an array of strings
    if (fieldName === 'hiringTeam') {
      value = (value as string).split(',').map(item => item.trim());
    }
  
    // If the field is 'clientName', update the client's name
    if (fieldName === 'clientName') {
      setJob(prevJob => ({
        ...(prevJob || {}),
        client: {
          ...(prevJob?.client || {}),
          name: value as string,
        },
      }));
    } else {
      setJob(prevJob => ({
        ...(prevJob || {}),
        [fieldName]: value
      }));
    }
  };

  const handleJobSubmit = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    // Get the client's name from the form
    const clientNameElement = e.target.elements.namedItem('clientName') as HTMLInputElement;
    const clientName = clientNameElement ? clientNameElement.value : '';
  
    // Send a PUT request to the server with the updated job details
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...job,
        client: {
          name: clientName,
          // include other client fields if necessary
        },
      }),
    });
  
    // Redirect to the jobs page after the job is updated
    if (response.ok) {
      router.push('/jobsPage');
    } else {
      // handle error
    }
  };

  const handleJobDelete = async () => {
    if (window.confirm('Are you sure you want to delete this job? All associated candidates will also be deleted.')) {
      // Send a DELETE request to the server
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${id}`, {
        method: 'DELETE',
      });
    
      // Redirect to the jobs page after the job is deleted
      router.push('/jobsPage');
    }
  };

  // Render the form
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
  
      <form onSubmit={handleJobSubmit} className="bg-white p-8 rounded-md shadow-md w-96">
        <Link href="/jobspage" className="text-blue-500 underline">
          Go Back to Jobs
        </Link>
        <h1 className="text-2xl font-bold mb-4">Edit Job</h1>
  
        
        <label className="block mb-2">
          Client:
          <input
            type="text"
            name="clientName"
            value={job?.client?.name || ''}
            onChange={handleJobChange}
            className="border p-2 rounded-md w-full"
          />
        </label>
      <label className="block mb-2">
        Title:
        <input
          type="text"
          name="title"
          value={job?.title || ''}
          onChange={handleJobChange}
          className="border p-2 rounded-md w-full"
        />
      </label>
      <label className="block mb-2">
        Department:
        <input
          type="text"
          name="department"
          value={job?.department || ''}
          onChange={handleJobChange}
          className="border p-2 rounded-md w-full"
        />
      </label>
      <label className="block mb-2">
        Business Unit:
        <input
          type="text"
          name="businessUnit"
          value={job?.businessUnit || ''}
          onChange={handleJobChange}
          className="border p-2 rounded-md w-full"
        />
      </label>
      <label className="block mb-2">
        Hiring Team:
        <input
          type="text"
          name="hiringTeam"
          value={job?.hiringTeam || ''}
          onChange={handleJobChange}
          className="border p-2 rounded-md w-full"
        />
      </label>
      <label className="block mb-2">
        Salary:
        <input
          type="number"
          name="salary"
          value={job?.salary || ''}
          onChange={handleJobChange}
          className="border p-2 rounded-md w-full"
        />
      </label>
      <label className="block mb-2">
        Currency:
        <input
          type="text"
          name="currency"
          value={job?.currency || ''}
          onChange={handleJobChange}
          className="border p-2 rounded-md w-full"
        />
      </label>
      <label className="block mb-2">
        Open Since:
        <input
          type="date"
          name="openSince"
          value={job?.openSince ? (new Date(job.openSince)).toISOString().split('T')[0] : ''}
          onChange={handleJobChange}
          className="border p-2 rounded-md w-full"
        />
      </label>
      {/* Add a field for adding profiles to the job */}
      <button type="submit" className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600 transition duration-300">
        Update Job
      </button>
      <button type="button" onClick={handleJobDelete} className="bg-red-500 text-white p-2 rounded-md ml-2 hover:bg-red-600 transition duration-300">
  Delete Job
</button>
    </form>
  </div>
);
}
    