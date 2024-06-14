// pages/authorize.jsx

import React from 'react';
import axios from 'axios';

const Authorize = () => {
  // Redirect the user to the /auth/authorize endpoint
  if (typeof window !== 'undefined') {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/authorize`;
  }

  return (
    <div>
      <h1>Authorizing...</h1>
    </div>
  );
};

export default Authorize;