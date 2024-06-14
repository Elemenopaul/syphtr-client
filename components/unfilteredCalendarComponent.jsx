import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction'; // needed for dayClick
import { TextField, PrimaryButton, Stack, Text, Separator,} from '@fluentui/react';
import { Card } from '@fluentui/react-cards';

const cardTokens = { childrenMargin: 12 };
const sectionStackTokens = { childrenGap: 10 };
const eventTextStyles = { root: { color: '#025F52' } };
const dateTextStyles = { root: { color: '#025F52', fontWeight: 'bold' } };

const UnfilteredCalendar = () => { // Removed recipientEmail
    const [events, setEvents] = useState([]);
    const [showAllEvents, setShowAllEvents] = useState(false);
    const router = useRouter();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/get-events`, { withCredentials: true });
        const events = response.data.map(event => {
          const eventDate = new Date(event.start.dateTime);
          const formattedDate = `${eventDate.getDate()} ${eventDate.toLocaleString('default', { month: 'long' })} ${eventDate.getFullYear()} at ${eventDate.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })} (GMT)`;
          const organizer = event.organizer.emailAddress.name;
          const attendees = event.attendees.map(attendee => attendee.emailAddress.name).join(', ');
  
          return {
            title: `${event.subject} on ${formattedDate}. Organizer: ${organizer}. Attendees: ${attendees}`,
            start: event.start.dateTime,
            end: event.end.dateTime,
          };
        });
        setEvents(events);
      } catch (error) {
        console.error(error);
      }
    };
  
    fetchEvents();
  }, []); // Remove recipientEmail from the dependency array

  const handleAuthorize = () => {
    // Redirect to the Authorize component
    router.push('/authorize');
  };

  const handleSignOut = async () => {
    // Send a request to your server to clear the access token cookie
    await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/sign-out`, { withCredentials: true });
  };

  const handleDateClick = (arg) => {
    // bind with an [onClick] handler to show some event details
    alert(arg.dateStr)
  }

  const nextWeekEvents = events.filter(event => {
    const eventDate = new Date(event.start);
    const now = new Date();
    const nextWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);
    return now <= eventDate && eventDate <= nextWeek;
  });

  const displayedEvents = showAllEvents ? nextWeekEvents : nextWeekEvents.slice(0, 5);

  return (
    <Stack styles={{ root: { margin: '0 auto', maxWidth: 800, padding: '0 20px' } }}>
      <Text variant="xxLarge" styles={{ root: { textAlign: 'center', marginBottom: 20 } }}>Upcoming Events:</Text>
      {displayedEvents.map((event, index) => (
        <Card key={index} tokens={cardTokens} styles={{ root: { marginBottom: 20, backgroundColor: '#F3F2F1' } }}>
          <Card.Section fill verticalAlign="end" styles={eventTextStyles}>
            <Text variant="large">{event.title}</Text>
          </Card.Section>
          <Card.Section>
            <Text variant="medium" styles={dateTextStyles}>{new Date(event.start).toLocaleDateString()} - {new Date(event.end).toLocaleDateString()}</Text>
          </Card.Section>
        </Card>
      ))}
      {nextWeekEvents.length > 5 && !showAllEvents && (
        <PrimaryButton onClick={() => setShowAllEvents(true)} styles={{ root: { marginTop: 20 } }}>Show all events</PrimaryButton>
      )}
      <Stack horizontal tokens={{ childrenGap: 10 }} styles={{ root: { marginTop: 20 } }}>
      <PrimaryButton onClick={handleAuthorize} styles={{ root: { backgroundColor: 'white', color: 'black' }, rootHovered: { backgroundColor: 'darkblue', color: 'white' } }}>Authorize Microsoft API</PrimaryButton>
        <PrimaryButton onClick={handleSignOut} styles={{ root: { backgroundColor: 'white', color: 'black' }, rootHovered: { backgroundColor: 'darkblue', color: 'white' } }}>Sign Out</PrimaryButton>
      </Stack>
    </Stack>
  );
};

export default UnfilteredCalendar;