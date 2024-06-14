import React from 'react';
import Select from 'react-select';

const FullProfileModal = ({
  profile,
  onClose,
  showModal,
  companyCategories,
  specifiedWordsPerCompany,
  allHugeCompanyProducts,
  jobs,
  selectedJobsByProfile,
  handleJobSelection,
  handleSaveProfile,
  token,
  orgId
}) => {
  if (!profile) {
    return <div>Loading...</div>;
  }

  const renderBadges = (companyExp) => {
    return Object.keys(companyCategories).flatMap(categoryCompany => {
      const companyExpCompanyLower = companyExp.company.toLowerCase();
      const categoryCompanyLower = categoryCompany.toLowerCase();
      const specifiedWords = specifiedWordsPerCompany[categoryCompanyLower] || [];
      
      let foundSpecifiedWords = [];

      const wordFoundInCompany = specifiedWords.find(word => {
        const wordRegex = new RegExp(`\\b${word.toLowerCase()}\\b`);
        const isWordInCompany = wordRegex.test(companyExpCompanyLower);
        const isWordInCategory = allHugeCompanyProducts[word]?.categories[categoryCompanyLower] !== undefined;
        
        return isWordInCompany && !isWordInCategory;
      });

      if (wordFoundInCompany) {
        foundSpecifiedWords.push(wordFoundInCompany);
      }

      if (Array.isArray(companyExp.roles)) {
        for (let role of companyExp.roles) {
          const titleLowerCase = role.title.toLowerCase();

          const wordFoundInRole = specifiedWords.find(word => {
            const wordRegex = new RegExp(`\\b${word.toLowerCase()}\\b`);
            const isWordInTitle = wordRegex.test(titleLowerCase);
            const isWordInCategory = allHugeCompanyProducts[word]?.categories[categoryCompanyLower] !== undefined;
            
            return isWordInTitle && !isWordInCategory;
          });

          if (wordFoundInRole) {
            foundSpecifiedWords.push(wordFoundInRole);
          }
        }
      }

      foundSpecifiedWords = Array.from(new Set(foundSpecifiedWords));

      const isCategoryMatch = foundSpecifiedWords.some(word => allHugeCompanyProducts[word]?.categories[categoryCompanyLower] !== undefined);
      const isTitleSpecified = foundSpecifiedWords.length > 0;

      return companyExpCompanyLower.includes(categoryCompanyLower) ? companyCategories[categoryCompany].map(category => {
        const isMainBadgeGreen = foundSpecifiedWords.some(word => Object.keys(allHugeCompanyProducts[word].categories).includes(category)) || !['sap', 'oracle', 'ibm', 'microsoft'].includes(categoryCompanyLower);
        return (
          <React.Fragment key={category}>
            <span className="badge" style={{
              marginLeft: '5px',
              padding: '2px 5px',
              fontSize: '80%',
              fontWeight: '600',
              lineHeight: '1',
              color: '#fff',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              verticalAlign: 'baseline',
              borderRadius: '0.25em',
              backgroundColor: isMainBadgeGreen ? '#008000' : isCategoryMatch ? '#008000' : isTitleSpecified ? '#ff0000' : foundSpecifiedWords.length > 0 || ['sap', 'oracle', 'ibm', 'microsoft'].includes(categoryCompanyLower) ? '#007bff' : '#ff0000',
            }}>
              {category}{((foundSpecifiedWords.length > 0 || ['sap', 'oracle', 'ibm', 'microsoft'].includes(categoryCompanyLower)) && !(isMainBadgeGreen)) && '*'}
            </span>
            {foundSpecifiedWords.length > 0 && foundSpecifiedWords.map(word => (
              <span key={word} className="small-badge" style={{
                marginLeft: '5px',
                padding: '1px 3px',
                fontSize: '60%',
                fontWeight: '600',
                lineHeight: '1',
                color: '#fff',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                verticalAlign: 'baseline',
                borderRadius: '0.25em',
                backgroundColor: isMainBadgeGreen ? (
                  Object.keys(allHugeCompanyProducts[word].categories).includes(category) ? '#008000' : '#007bff'
                ) : '#007bff',
              }}>
                {Object.keys(allHugeCompanyProducts[word].categories).join(', ')}
              </span>
            ))}
          </React.Fragment>
        );
      }) : [];
    });
  };

  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'short' };
    return new Date(date).toLocaleDateString('en-US', options);
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalMonths = (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth();
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    return `(${years} years, ${months} months)`;
  };

  const calculateTotalDuration = (roles) => {
    const totalMonths = roles.reduce((acc, role) => {
      const start = new Date(role.starts_at);
      const end = new Date(role.ends_at || Date.now());
      return acc + ((end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth());
    }, 0);
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    return `(${years} years, ${months} months)`;
  };

  const groupedExperiences = profile.experiences.reduce((acc, exp) => {
    const existing = acc.find(item => item.company === exp.company);
    if (existing) {
      existing.roles.push({
        title: exp.title,
        starts_at: exp.starts_at,
        ends_at: exp.ends_at,
        description: exp.description
      });
    } else {
      acc.push({
        company: exp.company,
        roles: [{
          title: exp.title,
          starts_at: exp.starts_at,
          ends_at: exp.ends_at,
          description: exp.description
        }]
      });
    }
    return acc;
  }, []);

  const sortedExperiences = groupedExperiences.sort((a, b) => {
    const latestA = new Date(Math.max(...a.roles.map(role => new Date(role.ends_at || Date.now()))));
    const latestB = new Date(Math.max(...b.roles.map(role => new Date(role.ends_at || Date.now()))));
    return latestB - latestA;
  });

  const handleSave = () => {
    if (token && orgId) {
      handleSaveProfile(profile.id, selectedJobsByProfile[profile.id] || [], orgId, token);
    } else {
      console.error('Token or orgId is null');
    }
  };

  return (
    <div className="fixed inset-0 overflow-y-auto z-50 flex justify-end items-center" onClick={onClose}>
      <div className="fixed inset-0 bg-black opacity-50"></div>
      <div className={showModal ? "modal show" : "modal"} onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col justify-end mb-2">
          <div onClick={(e) => e.stopPropagation()}>
            <Select
              options={jobs.map(job => ({ value: job.id, label: job.title }))}
              value={selectedJobsByProfile[profile.id]?.map(jobId => ({ value: jobId, label: jobs.find(job => job.id === jobId)?.title })) || []}
              onChange={(selectedOptions) => handleJobSelection(selectedOptions.map(option => option.value), profile.id)}
              isMulti
              placeholder="Your open Jobs"
              className="w-full sm:w-1/2"
            />
          </div>
          <button onClick={handleSave} className="text-green-500 rounded-sm p-1 mt-2">
            Save to Job(s)
          </button>
        </div>
        <div className="bg-gray-300 rounded-full h-24 w-24 mb-4"></div>
  
        <h1 className="text-xl font-bold mb-4">{profile.full_name}</h1>
        <p className="text-sm">
          {profile.city ? profile.city + ', ' : ''}
          {profile.state ? profile.state + ', ' : ''}
          {profile.country}
        </p>
  
        <h2 className="text-xl font-bold mb-2"></h2>
        {sortedExperiences.map((experience, index) => (
          <div key={index} className="mb-4 text-xs">
            <h3 className="text-lg font-bold">{experience.company} {renderBadges(experience)}</h3>
            <p><strong>{calculateTotalDuration(experience.roles)}</strong></p>
            {experience.roles.map((role, roleIndex) => (
  <div key={roleIndex} style={{ marginLeft: '20px', marginBottom: '10px', marginTop: roleIndex === 0 ? '20px' : '0' }}>
    <p><strong>{role.title}</strong></p>
    <p>{formatDate(role.starts_at)} - {role.ends_at ? formatDate(role.ends_at) : 'Present'} - <strong>{calculateDuration(role.starts_at, role.ends_at || Date.now())}</strong></p>
    <p className="text-xs sm:text-sm">{role.description || 'N/A'}</p>
  </div>
))}
          </div>
        ))}
  
        <h2 className="text-xl font-bold mb-2">Education</h2>
        {profile.education && profile.education.map((education, index) => (
  <div key={index} className="mb-4 text-xs">
    <h3 className="text-lg font-bold">{education.school}</h3>
    <p>{education.degree_name}</p>
    <p>Starts at: {education.starts_at ? formatDate(education.starts_at) : 'N/A'}</p>
    <p>Ends at: {education.ends_at ? formatDate(education.ends_at) : 'N/A'}</p>
    <p className="text-xs sm:text-sm">{education.description || 'N/A'}</p>
  </div>
))}
      </div>
    </div>
  );
  };
  
  export default FullProfileModal;
