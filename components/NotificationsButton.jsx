import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';

const NotificationsButton = ({ currentUserId }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [userNotifications, setUserNotifications] = useState([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${currentUserId}`)
      .then(response => response.json())
      .then(data => setUserNotifications(data))
      .catch(error => console.error('Error:', error));
  }, [currentUserId]);

  const handleNotificationsButtonClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleDelete = (id) => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}`, {
      method: 'DELETE',
    })
      .then(() => {
        // Remove the deleted notification from the state
        setUserNotifications(userNotifications.filter(notification => notification.id !== id));
      })
      .catch(error => console.error('Error:', error));
  };

  return (
    <div className="relative">
      <button onClick={handleNotificationsButtonClick}>
  <FontAwesomeIcon icon={faBell} />
  {userNotifications.length > 0 && (
    <div className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
      {userNotifications.length}
    </div>
  )}
</button>
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 overflow-hidden z-50">
          {userNotifications.map((notification, index) => (
            <Link href={`/fullProfilePage/${notification.profileId}`} key={index}>
              <div className="px-4 py-3 border-b last:border-b-0 flex items-center cursor-pointer" onClick={() => handleDelete(notification.id)}>
                <img src={notification.profilePicUrl} alt="Profile" className="h-10 w-10 rounded-full mr-3" onError={(e) => { e.currentTarget.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAE0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='; }} />
                <div>
                  <p className="font-bold text-black">{notification.profileName}&apos;s contact details have been added and they are ready to talk! {notification.userName}</p>
                  <p className="text-sm text-gray-600">{notification.message}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsButton;