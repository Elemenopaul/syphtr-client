import { OrganizationProfile } from "@clerk/nextjs";
import CustomerHeader from '../../components/CustomerHeader';
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { UserButton } from '@clerk/clerk-react';







export default function OrganizationProfilePage() {

    const { user } = useUser();
  const currentUserId = user?.id;

  const [notifications, setNotifications] = useState([]);



  useEffect(() => {
    setNotifications(JSON.parse(localStorage.getItem('notifications') || '[]'));
  }, []);
    return (
      <div className="flex flex-col pt-20">
      <CustomerHeader userId={currentUserId} notifications={notifications} setNotifications={setNotifications} />
    
      <OrganizationProfile />
    </div>
  )
}