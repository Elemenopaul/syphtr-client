import React, { useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const Callback = () => {
  const router = useRouter();

  useEffect(() => {
    const handleAuthorizationResponse = async () => {
      // Extract the authorization code from the query parameters
      const { code } = router.query;

      if (code) {
        // Send a GET request to the /auth/callback endpoint with the authorization code in the query parameters
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/callback`, { params: { code } });

        // Handle the response
        console.log(response);
      }
    };

    handleAuthorizationResponse();
  }, [router.query]);

  return <div>Processing...</div>;
};

export default Callback;