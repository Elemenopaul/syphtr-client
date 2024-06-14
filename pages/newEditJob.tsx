// pages/editJobPage.tsx
import { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link'; // Import Link from next/link
import { UserButton } from "@clerk/nextjs"; // Add this line
import CustomerHeader from '../components/CustomerHeader';
import { useUser } from '@clerk/nextjs';
import { useSession} from '@clerk/nextjs';



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
  orgId?: string;

  // Add other fields as necessary
}

export default function EditJobPage() {
  const router = useRouter();
  const { id } = router.query; // Get the job ID from the URL parameters
  const [job, setJob] = useState<Job | null>(null);
  const { user } = useUser();
  const currentUserId = user?.id;

  const [notifications, setNotifications] = useState([]);
  const { session } = useSession();



  useEffect(() => {
    const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    console.log(allNotifications);
    setNotifications(allNotifications);
  }, []);

  useEffect(() => {
    // Fetch the current details of the job when the component mounts
    const fetchJob = async () => {
      if (session) {
        const token = await session.getToken();
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`, // Include the Authorization header
          },
        });
        const job = await response.json();
        setJob(job);
  
        // Log the current job state
        console.log(`Current job: ${JSON.stringify(job)}`);
      }
    };
  
    if (id) {
      fetchJob();
    }
  }, [id, session]); // Add session as a dependency

  const handleJobChange = (e: ChangeEvent<HTMLInputElement>) => {
    const fieldName = e.target.name;
    let value: string | number | string[] = e.target.value;

    console.log(`Field name: ${fieldName}`); // Log the field name
    console.log(`Initial value: ${value}`); // Log the initial value

    // If the field is 'salary' or 'clientId', convert the value to a number
    if (fieldName === 'salary' || fieldName === 'clientId') {
      value = parseFloat(value);
    }

    // If the field is 'hiringTeam', convert the value to an array of strings
    if (fieldName === 'hiringTeam') {
      value = (value as string).split(',').map(item => item.trim());
    }

    console.log(`Processed value: ${value}`); // Log the processed value

    // If the field is 'clientName', update the client's name
    if (fieldName === 'clientName') {
      setJob(prevJob => {
        console.log(`Previous job: ${JSON.stringify(prevJob)}`); // Log the previous job
        console.log(`New client name: ${value}`); // Log the new client name

        return {
          ...(prevJob || {}),
          client: {
            ...(prevJob?.client || {}),
            name: value as string,
          },
        };
      });
    } else {
      setJob(prevJob => {
        console.log(`Previous job: ${JSON.stringify(prevJob)}`); // Log the previous job
        console.log(`New ${fieldName}: ${value}`); // Log the new field value

        return {
          ...(prevJob || {}),
          [fieldName]: value
        };
      });
    }

    console.log(`Updated job: ${JSON.stringify(job)}`); // Log the updated job
  };

  const handleJobSubmit = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    // Get the client's name from the form
    const clientNameElement = e.target.elements.namedItem('clientName') as HTMLInputElement;
    const clientName = clientNameElement ? clientNameElement.value : '';
  
    if (session && job) { // Check that job is not null
      const token = await session.getToken();
  
      // Send a PUT request to the server with the updated job details
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Include the Authorization header
        },
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
        router.push('/newJobsPage');
      } else {
        // handle error
      }
    }
  };

const handleJobDelete = async () => {
  if (window.confirm('Are you sure you want to delete this job? All associated candidates will also be deleted.')) {
    if (session && job) { // Check that job is not null
      const token = await session.getToken();

      // Prepare the request URL
      const requestUrl = `${process.env.NEXT_PUBLIC_API_URL}/jobs/${id}`;

      console.log(`Request URL: ${requestUrl}`); // Log the request URL

      // Send a DELETE request to the server with the job's ID
      const response = await fetch(requestUrl, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Include the Authorization header
        },
      });

      console.log(`Response status: ${response.status}`); // Log the response status
      console.log(`Response status text: ${response.statusText}`); // Log the response status text

      // Redirect to the jobs page after the job is deleted
      if (response.ok) {
        router.push('/newJobsPage');
      } else {
        // handle error
      }
    }
  }
};



  // Render the form
return (
  <div className="pt-20">
    <CustomerHeader userId={currentUserId} notifications={notifications} setNotifications={setNotifications} />

    <form onSubmit={handleJobSubmit} className="bg-white p-8 rounded-md shadow-md w-96">
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
    