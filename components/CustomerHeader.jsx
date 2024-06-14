import Link from 'next/link';
import { useRouter } from 'next/router';
import NotificationsButton from './NotificationsButton';
import { UserButton, useSession } from '@clerk/nextjs';
import jwt from 'jsonwebtoken';
import { useState, useEffect } from 'react';

function CustomerHeader({ userId, notifications, setNotifications }) {
  const router = useRouter();
  const { session } = useSession();
  const [orgId, setOrgId] = useState('');

  useEffect(() => {
    const getOrgId = async () => {
      if (session) {
        const token = await session.getToken();
        console.log('Token:', token); // Log the token

        if (token) {
          // Decode the token
          const decodedToken = jwt.decode(token);
          console.log('decodedToken:', decodedToken);
          let orgId = '';
          if (typeof decodedToken === 'object' && decodedToken !== null) {
            orgId = 'org_id' in decodedToken ? decodedToken.org_id : '';
          }
          console.log('orgId:', orgId);

          // Set orgId as a state variable
          setOrgId(orgId);
        } else {
          console.error('Token is null');
        }
      }
    };

    getOrgId();
  }, [session]);

  const allowedUserId = 'user_2cLXikcZM5Fcy8LguV6TTONAwBd';
  const isAllowedUser = userId === allowedUserId;

  const isSharedRawProfileSearchPage = router.pathname === '/sharedRawProfileSearch';
  const isProxyCurlSearchForm = router.pathname === '/ProxyCurlSearchForm';

  return (
    <header style={{ backgroundColor: isSharedRawProfileSearchPage ? '#3D4F6B' : '#81B29A', color: isSharedRawProfileSearchPage ? 'black' : 'white' }} className="p-2 sm:p-4 mb-4 w-full flex flex-wrap justify-between items-center fixed top-0 z-50">
      <h1 className="text-xs sm:text-sm font-bold">
        <a href="https://syphtr.com" target="_blank" rel="noopener noreferrer">
          <img src="/logos/Color logo - no background.png" alt="Syphtr" className="w-32 sm:w-40 h-auto cursor-pointer" />
        </a>
      </h1>
      <div className="flex space-x-2 sm:space-x-4">
      {isAllowedUser && (
  <Link href="/ProxyCurlSearchForm" passHref>
    <span className="text-xs sm:text-base font-bold hover:text-blue-500 transition duration-300 ease-in-out cursor-pointer" 
      style={{ color: isSharedRawProfileSearchPage ? 'white' : (isProxyCurlSearchForm ? 'darkblue' : 'white') }}>
      ProxyCurl
    </span>
  </Link>
)}

<Link href="/sharedRawProfileSearch" passHref>
  <span className="text-xs sm:text-base font-bold hover:text-blue-500 transition duration-300 ease-in-out cursor-pointer" 
    style={{ color: router.pathname === '/sharedRawProfileSearch' ? 'lightblue' : 'white' }}>
    New Candidates
  </span>
</Link>
<Link href="/newDbSearchForm" passHref>
  <span className="text-xs sm:text-base font-bold hover:text-blue-500 transition duration-300 ease-in-out cursor-pointer" 
    style={{ color: router.pathname === '/newDbSearchForm' ? 'darkblue' : 'white' }}>
    Your Candidates
  </span>
</Link>
      <Link href="/newJobsPage" passHref>
        <span className="text-xs sm:text-base font-bold hover:text-green-500 transition duration-300 ease-in-out cursor-pointer" style={{ color: (router.pathname === '/newJobsPage' || router.pathname.startsWith('/candidatePipelinePage') || router.pathname.startsWith('/newEditJob') || router.pathname.startsWith('/fullProfilePage')) ? 'darkblue' : 'white' }}>
          Jobs
        </span>
      </Link>
      <Link href="/dashboard" passHref>
        <span className="text-xs sm:text-base font-bold transition duration-300 ease-in-out cursor-pointer hover:text-dark-green" style={{ color: router.pathname.startsWith('/dashboard') ? 'darkblue' : 'white' }}>
          Dashboard
        </span>
      </Link>
      <NotificationsButton currentUserId={userId} notifications={notifications} setNotifications={setNotifications} />        
      <UserButton afterSignOutUrl="/" />
    </div>
  </header>
  );
}

export default CustomerHeader;