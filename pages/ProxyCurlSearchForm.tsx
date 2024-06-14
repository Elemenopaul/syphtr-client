// ProxyCurlSearchForm.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { UserButton } from "@clerk/nextjs"; // Add this line
import { BeatLoader } from 'react-spinners';
import CustomerHeader from '../components/CustomerHeader'; // Add this line
import { useUser } from '@clerk/clerk-react'; // Add this line
import { useRouter } from 'next/router'; // Add this line
import NotificationsButton from '../components/NotificationsButton';



import Link from 'next/link';

import { 
  ResponseData, 
  FormState, 
  Profile, 
  
} from '../interfacesforproxycurlsearch/proxycurlsearchinterface';

// Function to escape special characters in a string
function escapeRegex(inputString: string): string {
  return inputString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


function ProxyCurlSearchForm() {
  const [form, setForm] = useState<FormState>({
    company: '',
    country: '',
    state: '',
    city: '',
    first_name: '',
    last_name: '',
    education_field_of_study: '',
    education_degree_name: '',
    education_school_name: '',
    education_school_linkedin_profile_url: '',
    current_role_title: '',
    past_role_title: '',
    current_role_before: '',
    current_role_after: '',
    current_company_linkedin_profile_url: '',
    past_company_linkedin_profile_url: '',
    current_job_description: '',
    past_job_description: '',
    current_company_name: '',
    past_company_name: '',
    linkedin_groups: '',
    languages: '',
    region: '',
    headline: '',
    summary: '',
    industries: '',
    interests: '',
    skills: '',
    current_company_country: '',
    current_company_region: '',
    current_company_city: '',
    current_company_type: '',
    current_company_follower_count_min: '',
    current_company_follower_count_max: '',
    current_company_industry: '',
    current_company_employee_count_min: '',
    current_company_employee_count_max: '',
    current_company_description: '',
    current_company_founded_after_year: '',
    current_company_founded_before_year: '',
    current_company_funding_amount_min: '',
    current_company_funding_amount_max: '',
    current_company_funding_raised_after: '',
    current_company_funding_raised_before: '',
    public_identifier_in_list: '',
    public_identifier_not_in_list: '',
    enrich: false, // initialize enrich
    page_size: 10, // 
    enrich_profiles: 'enrich',
  });   


  const [results, setResults] = useState<ResponseData | null>({ results: [], next_page: '' });
  const [selectedProfiles, setSelectedProfiles] = useState<Record<string, boolean>>({});
  const [savedProfiles, setSavedProfiles] = useState<Profile[]>([]);
  const [searchParams, setSearchParams] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [showMoreInfo, setShowMoreInfo] = useState<Record<string, boolean>>({});
  const [expandedProfiles, setExpandedProfiles] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { user } = useUser(); // Add this line
  const currentUserId = user?.id; // Add this line

  const toggleMoreInfo = (id: string) => {
    setExpandedProfiles((prevState) => ({ ...prevState, [id]: !prevState[id] }));
  }


  const formatDate = (date?: { day: number; month: number; year: number } | Date | null | undefined): string => {
    if (date instanceof Date) {
      // Handle Date
      const formattedDate = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date);
      return formattedDate;
    } else if (date && 'day' in date && 'month' in date && 'year' in date) {
      // Handle { day, month, year }
      const { day, month, year } = date;
      const formattedDate = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(new Date(year, month - 1, day));
      return formattedDate;
    } else {
      return 'Not provided';
    }
  };

  const formatDuration = (startDate?: { day: number; month: number; year: number } | Date | null | undefined, endDate?: { day: number; month: number; year: number } | Date | null | undefined): string => {
    const start = startDate instanceof Date ? startDate : new Date(startDate?.year || 0, (startDate?.month || 1) - 1, startDate?.day || 1);
    const end = endDate instanceof Date ? endDate : new Date(endDate?.year || 0, (endDate?.month || 1) - 1, endDate?.day || 1);
  
    const diffInMonths = (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth();
    const years = Math.floor(diffInMonths / 12);
    const months = diffInMonths % 12;
  
    const yearString = years > 0 ? `${years} year${years > 1 ? 's' : ''}` : '';
    const monthString = months > 0 ? `${months} month${months > 1 ? 's' : ''}` : '';
  
    return `${yearString}${years > 0 && months > 0 ? ', ' : ''}${monthString}`;
  };

  


  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value: string | number = event.target.value;
  
    if (event.target.name === 'page_size') {
      value = parseInt(event.target.value, 10);
    } else if (
      event.target.name === 'current_company_name' ||
      event.target.name === 'past_company_name' ||
      event.target.name === 'current_role_title' ||
      event.target.name === 'past_role_title' ||
      event.target.name === 'country' ||
      event.target.name === 'city' ||
      event.target.name === 'state' ||
      event.target.name === 'first_name' ||
      event.target.name === 'last_name'
    ) {
      // Convert user-inputted comma-separated list to regex pattern
      const inputValues = value.split(',');
  
      if (inputValues.length === 1) {
        // If there's only one value, use it as is
        value = inputValues[0];
      } else {
        // If there are multiple values, convert to regex pattern
        const regexPattern = inputValues.map(param => `(${escapeRegex(param)})`).join('|');
        value = regexPattern;
      }
    }
  
    setForm((prevForm) => ({ ...prevForm, [event.target.name]: value }));
  };
  

  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
  
    try {
      const headers = { 'Authorization': `Bearer ${process.env.BEARER_TOKEN}` };
      const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/ProxyCurlSearchFormapi`);

      // Create an object for the search parameters
      let searchParamsObj: Record<string, string | number> = {};
  
      Object.entries(form).forEach(([key, value]) => {
        if (value) {
          url.searchParams.append(key, value);
          searchParamsObj[key] = value; // Update searchParamsObj
        }
      });
  
      console.log('Request URL:', url.toString()); // Log the request URL
  
      const response = await axios.get(url.toString(), { headers });
      console.log('Response status:', response.status); // Log the response status
      console.log('Response data:', response.data); // Log the response data
  
      setResults(response.data);
      setSearchParams(searchParamsObj); // Update the searchParams state
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    }
  };
  
  

  const fetchNextPage = async (nextPageUrl = results?.next_page) => {
    if (nextPageUrl) {
      try {
        // Extract the query part of the next_page URL
        const nextPage = new URL(nextPageUrl);
        const nextPageQuery = nextPage.search;
  
        // Create a new URL object with the base path and append the query part
        const requestUrl = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/ProxyCurlSearchFormapi`);
        requestUrl.search = nextPageQuery;
  
        // Append initial search parameters to the next_page URL
        Object.entries(searchParams).forEach(([key, value]) => {
          if (value && key !== 'next_token') {
            requestUrl.searchParams.set(key, value.toString());
          }
        });
  
        // Log the updated URL for verification
        console.log('Next Page URL with Parameters:', requestUrl.toString());
  
        // Make the API request using the updated URL
        const response = await axios.get(requestUrl.toString());
  
        console.log('Response data in fetchNextPage:', response.data);
  
        // Update the results with the new data
        setResults((prevResults) => ({
          results: [...(prevResults?.results || []), ...response.data.results],
          next_page: response.data.next_page,
        }));
  
        // If there's a next page, fetch it
        if (response.data.next_page) {
          await fetchNextPage(response.data.next_page);
        }
  
        // Return the response data
        return response.data;
      } catch (error) {
        console.error('Error in fetchNextPage:', error);
      }
    }
  
    // Return null if there's no next page
    return null;
  };

  const fetchNextPageManually = async () => {
    if (results && results.next_page) {
      try {
        // Extract the query part of the next_page URL
        const nextPageUrl = new URL(results.next_page);
        const nextPageQuery = nextPageUrl.search;
  
        // Create a new URL object with the base path and append the query part
        const requestUrl = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/ProxyCurlSearchFormapi`);
        requestUrl.search = nextPageQuery;
  
        // Append initial search parameters to the next_page URL
        Object.entries(searchParams).forEach(([key, value]) => {
          if (value && key !== 'next_token') {
            requestUrl.searchParams.set(key, value.toString());
          }
        });
  
        // Log the updated URL for verification
        console.log('Next Page URL with Parameters:', requestUrl.toString());
  
        // Make the API request using the updated URL
        const response = await axios.get(requestUrl.toString());
  
        console.log('Response data in fetchNextPage:', response.data);
  
        // Update the results with the new data
        setResults((prevResults) => ({
          results: [...(prevResults?.results || []), ...response.data.results],
          next_page: response.data.next_page,
        }));
  
        // Return the response data
        return response.data;
      } catch (error) {
        console.error('Error in fetchNextPage:', error);
      }
    }
  
    // Return null if there's no next page
    return null;
  };

  const handleSelectProfile = (public_identifier: string) => {
    setSelectedProfiles(prevProfiles => {
      if (prevProfiles.hasOwnProperty(public_identifier)) {
        const { [public_identifier]: removedProfile, ...remainingProfiles } = prevProfiles;
        return remainingProfiles;
      } else {
        return { ...prevProfiles, [public_identifier]: true };
      }
    });
  };


  const handleSelectAllProfiles = () => {
    if (results && Array.isArray(results.results)) {
      const updatedProfiles = results.results.reduce((acc, result) => {
        const profile = result.profile || {};
        const publicIdentifier = profile.public_identifier || ''; // Handle null or undefined
        acc[publicIdentifier] = !selectAll;
        return acc;
      }, {} as Record<string, boolean>);
  
      setSelectAll(!selectAll);
      setSelectedProfiles(updatedProfiles);
    }
  };
  
  const BATCH_SIZE = 2; // Adjust this value based on what your server can handle

 const handleSaveSelectedProfiles = async () => {
  const profilesToSave = Object.keys(selectedProfiles)
    .filter(public_identifier => selectedProfiles[public_identifier])
    .map(public_identifier => results ? results.results.find(data => data.profile.public_identifier === public_identifier) : null)
    .filter((data): data is { profile: Profile; linkedin_profile_url: string; last_updated: string; } => data !== null);

  console.log('Profiles to save:', profilesToSave); // Log the profiles to save

  setSavedProfiles(prevProfiles => [...prevProfiles, ...profilesToSave.map(data => data.profile)]);

  // Split the profiles into batches
  for (let i = 0; i < profilesToSave.length; i += BATCH_SIZE) {
    const batch = profilesToSave.slice(i, i + BATCH_SIZE);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profiles/saveProfiles`, {
                method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batch), // send batch in the body of your request
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.text();
      if (!responseData) {
        console.error("Empty response");
        continue; // Skip to the next iteration
      }

      // Proceed to parse JSON
      const jsonData = JSON.parse(responseData);
      console.log('Response from /api/saveProfiles:', jsonData);
      
      // After saving profiles, save background images
      for (const profile of batch) {
        // Check if the profile has a background image
        if (profile.profile.background_cover_image_url) {
          const responseBackground = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/backgroundimages`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ public_identifier: profile.profile.public_identifier }), // send profile identifier in the body
          });

          if (!responseBackground.ok) {
            throw new Error(`HTTP error! status: ${responseBackground.status}`);
          }

          const responseDataBackground = await responseBackground.text();
          if (!responseDataBackground) {
            console.error("Empty background image response");
            continue; // Skip to the next iteration
          }

          // Proceed to parse JSON
          const jsonDataBackground = JSON.parse(responseDataBackground);
          console.log('Response from /api/saveBackgroundImage:', jsonDataBackground);
        }
      }

    } catch (error) {
      console.error('Error saving profiles:', error);
    }
   }
  };

  
  {console.log('Results:', results)}


  
  const formatValue = (value: string | number | Date | null | undefined): string => {
    if (value === null || value === undefined) {
      return 'Not provided';
    } else if (value instanceof Date) {
      // Handle Date
      const year = value.getFullYear();
      const month = value.getMonth() + 1; // JavaScript months are 0-based
      const day = value.getDate();
      return `${year}-${month}-${day}`;
    } else {
      // Handle string and number types
      return value.toString();
    }
  };

  const fetchAll = async () => {
    setIsLoading(true); // Start loading
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/fetchAll`, {
        params: {
          nextPageUrl: results?.next_page,
          // Add any additional search parameters here
        },
      });
  
      // Do something with the response data
      console.log(response.data);
    } catch (error) {
      console.error('Error in fetchAll:', error);
    } finally {
      setIsLoading(false); // End loading
    }
  };



  return (
    <div className="flex flex-col pt-20">
              <CustomerHeader userId={currentUserId} notifications={notifications} setNotifications={setNotifications} />

  
      <div className="flex">
        <div className="flex-shrink-0 sticky top-0">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              console.log('Form submitted');
              handleSubmit(event);
            }}
            className="bg-white p-8 rounded-md shadow-md w-96"
          >
        <div className="mb-4">
          <input
            type="text"
            name="current_company_name"
            placeholder="Current Company Name"
            onChange={handleChange}
            className="border p-2 rounded-md w-full"
          />
        </div>
        <div className="mb-4">
          <input
            type="text"
            name="past_company_name"
            placeholder="Past Company Name"
            onChange={handleChange}
            className="border p-2 rounded-md w-full"
          />
        </div>
        <div className="mb-4">
          <input
            type="text"
            name="current_role_title"
            placeholder="Current Role Title"
            onChange={handleChange}
            className="border p-2 rounded-md w-full"
          />
        </div>
        <div className="mb-4">
          <input
            type="text"
            name="past_role_title"
            placeholder="Past Role Title"
            onChange={handleChange}
            className="border p-2 rounded-md w-full"
          />
        </div>
        <div className="mb-4">
          <input
            type="text"
            name="country"
            placeholder="Country"
            onChange={handleChange}
            className="border p-2 rounded-md w-full"
          />
        </div>
        <div className="mb-4">
          <input
            type="text"
            name="state"
            placeholder="State"
            onChange={handleChange}
            className="border p-2 rounded-md w-full"
          />
        </div>
        <div className="mb-4">
          <input
            type="text"
            name="city"
            placeholder="City"
            onChange={handleChange}
            className="border p-2 rounded-md w-full"
          />
        </div>
       
        <div className="mb-4">
          <input
            type="text"
            name="first_name"
            placeholder="First Name"
            onChange={handleChange}
            className="border p-2 rounded-md w-full"
          />
        </div>
        <div className="mb-4">
          <input
            type="text"
            name="last_name"
            placeholder="Last Name"
            onChange={handleChange}
            className="border p-2 rounded-md w-full"
          />
        </div>
        <div className="mb-4">
          <input
            type="text"
            name="education_field_of_study"
            placeholder="Education Field of Study"
            onChange={handleChange}
            className="border p-2 rounded-md w-full"
          />
        </div>
        <div className="mb-4">
          <input
            type="text"
            name="education_degree_name"
            placeholder="Education Degree Name"
            onChange={handleChange}
            className="border p-2 rounded-md w-full"
          />
        </div>
        
        <div className="mb-4">
          <input
            type="number"
            name="page_size"
            value={form.page_size}
            placeholder="Page Size"
            onChange={handleChange}
            className="border p-2 rounded-md w-full"
          />
        </div>
        <button
            type="submit"
            className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600 transition duration-300"
          >
            Search
          </button>

          
          <button 
  className="bg-green-500 text-white font-bold hover:bg-green-700 transition duration-300 ease-in-out cursor-pointer text-sm px-4 py-2 rounded"
  onClick={() => window.open('/uploadJson', '_blank')}
>
  Upload Bulk JSON files
</button>
      

        </form>
      </div>

      <div className="flex-grow ml-4">
      {results && Array.isArray(results.results) && results.results.map((result, index) => {

            const profile = result.profile || {};
            const publicIdentifier = profile.public_identifier ?? '';
            const isExpanded = expandedProfiles[publicIdentifier] || false;
            const locationParts = [profile.city, profile.state, profile.country].filter(Boolean).join(', ');

            return (
              <div
                key={index}
                style={{
                  border: '1px solid #ccc',
                  margin: '8px',
                  marginBottom: '64px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
              {/* Displayed fields */}
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
                <img
                  src={profile.profile_pic_url || ''}
                  alt={`Profile Pic for ${profile.full_name}`}
                  style={{
                    width: '120px',
                    height: '120px',
                    marginLeft: '8px',
                    marginTop: '8px',
                    marginBottom: '8px',
                  }}
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAE0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
                  }}
                />
                <div style={{ marginLeft: '8px', marginTop: '8px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>{formatValue(profile.full_name)}</p>
                  {/* Display filtered location information */}
                  {locationParts && <p style={{ margin: 0 }}>{locationParts}</p>}
                  <p style={{ margin: 0, fontStyle: 'italic' }}>{formatValue(profile.headline)}</p>
                </div>
              </div>

        {/* Condensed Experiences */}
<div style={{ marginLeft: '8px', marginTop: '8px', width: '50%' }}>
{profile.experiences?.map((exp, expIndex) => (
  <div key={expIndex} className="profile-container" style={{ marginBottom: '16px', borderBottom: '1px solid #ddd' }}>
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <img
        src={exp.logo_url || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAE0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='}
        alt={`Logo for ${exp.company}`}
        style={{ width: '50px', height: '50px', marginRight: '8px', backgroundColor: 'grey' }}
        onError={(e) => {
          e.currentTarget.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAE0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
          e.currentTarget.style.backgroundColor = 'grey';
        }}
      />
      <div>
        <p style={{ margin: 0, fontWeight: 'bold' }}>{formatValue(exp.title)}</p>
        <p style={{ margin: 0 }}>{formatValue(exp.company)}</p>
        <p style={{ margin: 0 }}>
          {`${formatDate(exp.starts_at)} - ${exp.ends_at ? formatDate(exp.ends_at) : 'Present'} `}
          <span style={{ fontWeight: 'bold' }}>{`(${formatDuration(exp.starts_at, exp.ends_at || new Date())})`}</span>
        </p>
      </div>
    </div>
  </div>
))}
</div>
      
    
        {/* Buttons */}
<div style={{ marginTop: 'auto', marginLeft: '8px', marginBottom: '8px' }}>
  <label>
    <input
      type="checkbox"
      checked={selectedProfiles[publicIdentifier] || false}
      onChange={() => handleSelectProfile(publicIdentifier)}
    />
    Select Profile to Save
  </label>
  <button onClick={() => toggleMoreInfo(publicIdentifier)}>
    Expand Profile
  </button>
</div>
    
        {/* Expanded section */}
        {isExpanded && (
          <div style={{ marginLeft: '8px', marginTop: '8px' }}>
            {/* Additional detailed information */}
            <p>Public Identifier: {formatValue(publicIdentifier)}</p>
            <p>First Name: {formatValue(profile.first_name)}</p>
            <p>Last Name: {formatValue(profile.last_name)}</p>
            <p>City: {formatValue(profile.city)}</p>
            <p>State: {formatValue(profile.state)}</p>
            <p>Country: {formatValue(profile.country)}</p>
            <p>Country Full Name: {formatValue(profile.country_full_name)}</p>
            <p>Headline: {formatValue(profile.headline)}</p>
            <p>Connections: {formatValue(profile.connections)}</p>
            <p>Follower Count: {formatValue(profile.follower_count)}</p>
    
            {/* Detailed Experiences */}
            {profile.experiences?.map((exp, expIndex) => (
              <div key={expIndex} className="profile-container">
                <p>Company: {formatValue(exp.company)}</p>
                <p>Title: {formatValue(exp.title)}</p>
                <p>Description: {formatValue(exp.description)}</p>
                <p>Location: {formatValue(exp.location)}</p>
                <p>Start Date: {formatDate(exp.starts_at)}</p>
                <p>End Date: {formatDate(exp.ends_at)}</p>
                <p>Company LinkedIn Profile URL: {formatValue(exp.company_linkedin_profile_url)}</p>
                {exp.logo_url && (
                  <img
                    src={exp.logo_url}
                    alt={`Logo for ${exp.company}`}
                    style={{ width: '100px', height: '100px' }}
                  />
                )}
                      {/* Include other experience fields as needed */}
                    </div>
                  ))}

                  {/* Education */}
                  {profile.educations?.map((edu, eduIndex) => (
                    <div key={eduIndex}>
                      <p>School: {formatValue(edu.school)}</p>
                      <p>Degree Name: {formatValue(edu.degree_name)}</p>
                      <p>Field of Study: {formatValue(edu.field_of_study)}</p>
                      <p>Start Date: {formatValue(edu.starts_at)}</p>
                      <p>End Date: {formatValue(edu.ends_at)}</p>
                      <p>Description: {formatValue(edu.description)}</p>
                      <p>Activities and Societies: {formatValue(edu.activities_and_societies)}</p>
                      <p>Grade: {formatValue(edu.grade)}</p>
                      <p>Logo URL: {formatValue(edu.logo_url)}</p>
                      <p>School LinkedIn Profile URL: {formatValue(edu.school_linkedin_profile_url)}</p>
                      {/* Include other education fields as needed */}
                    </div>
                  ))}

                  {/* Accomplishments (Courses, Honors, Awards, etc.) */}
                  {profile.accomplishment_courses?.map((course, courseIndex) => (
                    <div key={courseIndex}>
                      <p>Course Name: {formatValue(course.name)}</p>
                      <p>Course Number: {formatValue(course.number)}</p>
                      {/* Include other course fields as needed */}
                    </div>
                  ))}
                  {/* Repeat for other accomplishment types */}

                  {/* Activities */}
                  {profile.activities?.map((activity, actIndex) => (
                    <div key={actIndex}>
                      <p>Activity Status: {formatValue(activity.activity_status)}</p>
                      <p>Link: {formatValue(activity.link)}</p>
                      <p>Title: {formatValue(activity.title)}</p>
                      {/* Include other activity fields as needed */}
                    </div>
                  ))}

                  {/* Articles */}
                  {profile.articles?.map((article, artIndex) => (
                    <div key={artIndex}>
                      <p>Title: {formatValue(article.title)}</p>
                      <p>Link: {formatValue(article.link)}</p>
                      <p>Published Date: {formatValue(article.published_date)}</p>
                      <p>Author: {formatValue(article.author)}</p>
                      <p>Image URL: {formatValue(article.image_url)}</p>
                      {/* Include other article fields as needed */}
                    </div>
                  ))}

                  {/* Certifications */}
                  {profile.certifications?.map((certification, certIndex) => (
                    <div key={certIndex}>
                      <p>Authority: {formatValue(certification.authority)}</p>
                      <p>Display Source: {formatValue(certification.display_source)}</p>
                      <p>End Date: {formatValue(certification.ends_at)}</p>
                      <p>License Number: {formatValue(certification.license_number)}</p>
                      <p>Name: {formatValue(certification.name)}</p>
                      <p>Start Date: {formatValue(certification.starts_at)}</p>
                      {/* Include other certification fields as needed */}
                    </div>
                  ))}

                  {/* Groups */}
                  {profile.groups?.map((group, groupIndex) => (
                    <div key={groupIndex}>
                      <p>Profile Pic URL: {formatValue(group.profile_pic_url)}</p>
                      <p>Name: {formatValue(group.name)}</p>
                      <p>URL: {formatValue(group.url)}</p>
                      {/* Include other group fields as needed */}
                    </div>
                  ))}

                  {/* Languages */}
                  {profile.languages?.map((language, langIndex) => (
                    <p key={langIndex}>Language: {language.language}</p>
                  ))}

                  {/* People Also Viewed */}
                  {profile.people_also_viewed?.map((person, personIndex) => (
                    <div key={personIndex}>
                      <p>Link: {formatValue(person.link)}</p>
                      <p>Name: {formatValue(person.name)}</p>
                      <p>Summary: {formatValue(person.summary)}</p>
                      <p>Location: {formatValue(person.location)}</p>
                      {/* Include other People Also Viewed fields as needed */}
                    </div>
                  ))}

                  {/* Recommendations */}
                  {profile.recommendations?.map((recommendation, recIndex) => (
                    <p key={recIndex}>Recommendation: {recommendation}</p>
                  ))}

                  {/* Similarly Named Profiles */}
                  {profile.similarly_named_profiles?.map((similarProfile, simIndex) => (
                    <div key={simIndex}>
                      <p>Link: {formatValue(similarProfile.link)}</p>
                      <p>Name: {formatValue(similarProfile.name)}</p>
                      <p>Summary: {formatValue(similarProfile.summary)}</p>
                      <p>Location: {formatValue(similarProfile.location)}</p>
                      {/* Include other Similarly Named Profiles fields as needed */}
                    </div>
                  ))}

                  {/* Skills */}
                  {profile.skills?.map((skill, skillIndex) => (
                    <p key={skillIndex}>Skill: {skill}</p>
                  ))}

                  {/* Volunteer Work */}
                  {profile.volunteer_work?.map((volunteer, volIndex) => (
                    <div key={volIndex}>
                      <p>Cause: {formatValue(volunteer.cause)}</p>
                      <p>Company: {formatValue(volunteer.company)}</p>
                      <p>Company LinkedIn Profile URL: {formatValue(volunteer.company_linkedin_profile_url)}</p>
                      <p>Description: {formatValue(volunteer.description)}</p>
                      <p>End Date: {formatValue(volunteer.ends_at)}</p>
                      <p>Logo URL: {formatValue(volunteer.logo_url)}</p>
                      <p>Start Date: {formatValue(volunteer.starts_at)}</p>
                      <p>Title: {formatValue(volunteer.title)}</p>
                      {/* Include other volunteer work fields as needed */}
                    </div>
                  ))}

                  {/* Add sections for AccomplishmentOrg, Publication, HonourAward, etc., following the same pattern */}

                  {/* AccomplishmentOrg */}
                  {profile.accomplishment_organisations?.map((org, orgIndex) => (
                    <div key={orgIndex}>
                      {/* Include other AccomplishmentOrg fields as needed */}
                    </div>
                  ))}

                  {/* Publication */}
                  {profile.accomplishment_publications?.map((publication, pubIndex) => (
                    <div key={pubIndex}> 
                      {/* Include other Publication fields as needed */}
                    </div>
                  ))}

                  {/* HonourAward */}
                  {profile.accomplishment_honors_awards?.map((award, awardIndex) => (
                    <div key={awardIndex}>
                      {/* Include other HonourAward fields as needed */}
                    </div>
                  ))}

                  {/* Patent */}
                  {profile.accomplishment_patents?.map((patent, patentIndex) => (
                    <div key={patentIndex}>
                      {/* Include other Patent fields as needed */}
                    </div>
                  ))}

                  {/* Course */}
                  {profile.accomplishment_courses?.map((course, courseIndex) => (
                    <div key={courseIndex}>
                      {/* Include other Course fields as needed */}
                    </div>
                  ))}

                  {/* TestScore */}
                  {profile.accomplishment_test_scores?.map((testScore, tsIndex) => (
                    <div key={tsIndex}>
                      {/* Include other TestScore fields as needed */}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

<div className="space-y-4">
  <label className="flex items-center space-x-2">
    <input
      type="checkbox"
      checked={selectAll}
      onChange={handleSelectAllProfiles}
      className="form-checkbox"
    />
    <span>Select All</span>
  </label>

  {results && results.next_page && (
    <button 
      onClick={() => fetchNextPage()}
      className="px-4 py-2 bg-blue-500 text-white rounded"
    >
      Fetch all Pages
    </button>
  )}

  {results && (
    <button 
      onClick={handleSaveSelectedProfiles}
      className="px-4 py-2 bg-green-500 text-white rounded"
    >
      Save Selected Profiles ({savedProfiles.length})
    </button>
  )}

  {results && results.next_page && (
    <button 
      onClick={fetchNextPageManually}
      className="px-4 py-2 bg-yellow-500 text-white rounded"
    >
      Fetch Next Page Manually
    </button>
  )}

{results && (
  <button 
    onClick={fetchAll}
    className="px-4 py-2 bg-purple-500 text-white rounded"
    disabled={isLoading}
  >
    {isLoading ? 'Loading...' : 'Fetch and Save All Pages/Results'}
  </button>
)}

{isLoading && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black
  }}>
    <BeatLoader color={"#ffffff"} />
    <p style={{ color: '#ffffff', marginTop: '20px' }}>Fetching and Saving all Pages and Results...</p>
  </div>
)}

</div>
</div>
</div>
</div>
);
};

export default ProxyCurlSearchForm;
