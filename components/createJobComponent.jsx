import React, { useState } from 'react';

function CreateJob() {
  const [showForm, setShowForm] = useState(false);
  const [newJob, setNewJob] = useState({
    department: '',
    businessUnit: '',
    hiringTeam: '',
    title: '',
    salary: '',
    currency: '',
    openSince: '',
    clientName: '',
  });

  const handleNewJobChange = (event) => {
    setNewJob({
      ...newJob,
      [event.target.name]: event.target.value,
    });
  };

  const handleNewJobSubmit = (event) => {
    event.preventDefault();
    // Handle the form submission here
  };

  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="py-8 px-4 mx-auto max-w-2xl lg:py-16">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Add a new job</h2>
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Close Job Form' : 'Create a new job'}
        </button>
        {showForm && (
          <form onSubmit={handleNewJobSubmit}>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
            {['title', 'company', 'location', 'department', 'businessUnit', 'hiringTeam', 'salary', 'currency', 'clientName'].map((field, index) => (
              <div className={index === 0 ? "sm:col-span-2" : "w-full"} key={field}>
                <label htmlFor={field} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                <input type="text" name={field} id={field} value={newJob[field]} onChange={handleNewJobChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder={`Type ${field}`} required=""/>
              </div>
            ))}
            <div className="sm:col-span-2">
              <label htmlFor="openSince" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Open Since</label>
              <input type="date" name="openSince" id="openSince" value={newJob.openSince} onChange={handleNewJobChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" required=""/>
            </div>
            <button type="submit" className="inline-flex items-center px-5 py-2.5 mt-4 sm:mt-6 text-sm font-medium text-center text-white bg-primary-700 rounded-lg focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-900 hover:bg-primary-800">
              Add Job
            </button>
          </div>
        </form>
        )}
      </div>
    </section>
  );
}

export default CreateJob;