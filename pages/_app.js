import React from 'react';
import { Tooltip } from 'react-tooltip'; // Import Tooltip as a named import
import '../styles/styles.css'; // Import your global styles
import { ClerkProvider } from '@clerk/nextjs';

function MyApp({ Component, pageProps }) {
  return (
    <>
      {/* Add Tooltip component */}
      <Tooltip />

      {/* ClerkProvider for authentication */}
      <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
        <Component {...pageProps} />
      </ClerkProvider>
    </>
  );
}

export default MyApp;
