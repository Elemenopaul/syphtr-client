// Modal.jsx
import React from 'react';

const Modal = ({ profile, onClose }) => {
  // Customize the modal content based on the profile data
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', maxWidth: '600px' }}>
        <h2>{profile.full_name}</h2>
        <p>Country: {profile.country}</p>
        <p>State: {profile.state}</p>
        <p>City: {profile.city}</p>
        {/* ... (other profile details) */}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default Modal;
