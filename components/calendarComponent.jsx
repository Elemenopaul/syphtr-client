import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { TextField, PrimaryButton, Stack, Text, Separator } from '@fluentui/react';

const Calendar = ({ recipientEmail, onFetchEvents }) => {
  const [events, setEvents] = useState([]);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [showCreateEventForm, setShowCreateEventForm] = useState(false);
  const router = useRouter();
  const [subject, setSubject] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [attendees, setAttendees] = useState(recipientEmail); // Initialize with recipientEmail
  const [message, setMessage] = useState('');
  const [eventToUpdate, setEventToUpdate] = useState(null);
const [updatedSubject, setUpdatedSubject] = useState('');
const [updatedStart, setUpdatedStart] = useState('');
const [updatedEnd, setUpdatedEnd] = useState('');
const [updatedAttendees, setUpdatedAttendees] = useState('');
const [updatedMessage, setUpdatedMessage] = useState('');


  const handleSubmit = async (event) => {
    event.preventDefault();
  
    const eventDetails = {
      subject,
      start: {
        dateTime: start,
        timeZone: 'Pacific Standard Time'
      },
      end: {
        dateTime: end,
        timeZone: 'Pacific Standard Time'
      },
      attendees: attendees.split(',').map(email => ({
        emailAddress: {
          address: email.trim(),
        },
        type: 'required'
      })),
      body: {
        contentType: "Text",
        content: message
      },
      isOnlineMeeting: true,
      onlineMeetingProvider: "teamsForBusiness"
    };
  
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/create-event`, eventDetails, { withCredentials: true });
  
      if (response.status === 200) {
        const joinUrl = response.data.onlineMeeting.joinUrl;
        // Add the joinUrl to the event details
        eventDetails.joinUrl = joinUrl;
        fetchEvents();
      } else {
        console.error('Failed to create the event');
      }
    } catch (error) {
      console.error(error);
    }
  };

  

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/get-events`, { withCredentials: true });
        const events = response.data.filter(event => 
          event.organizer.emailAddress.address === recipientEmail || 
          (event.attendees && event.attendees.some(attendee => attendee.emailAddress.address === recipientEmail))
        ).map(event => {
          const eventDate = new Date(event.start.dateTime);
          const formattedDate = `${eventDate.getDate()} ${eventDate.toLocaleString('default', { month: 'long' })} ${eventDate.getFullYear()} at ${eventDate.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })} (GMT)`;
          const organizer = event.organizer.emailAddress.name;
          const attendees = event.attendees.map(attendee => ({
            email: attendee.emailAddress.address,
            acceptanceStatus: attendee.status.response, // Change this line
          }));
  
          return {
            id: event.id,
            title: `${event.subject} on ${formattedDate}. Organizer: ${organizer}.`,
            start: event.start.dateTime,
            end: event.end.dateTime,
            subject: event.subject,
            attendees,
            message: event.body.content,
            organizer: organizer, // Add the organizer
            location: event.location.displayName, // Add the location
          };
        });
        setEvents(events);
        onFetchEvents(events);

      } catch (error) {
        console.error(error);
      }
    };
    fetchEvents();
  }, [recipientEmail,]);


  // Add handleUpdateSubmit
const handleUpdateSubmit = async (event) => {
  event.preventDefault();

  const eventDetails = {
    subject: updatedSubject,
    start: {
      dateTime: updatedStart,
      timeZone: 'Pacific Standard Time'
    },
    end: {
      dateTime: updatedEnd,
      timeZone: 'Pacific Standard Time'
    },
    attendees: updatedAttendees.split(',').map(email => ({
      emailAddress: {
        address: email.trim(),
      },
      type: 'required',
    })),
    body: {
      contentType: "Text",
      content: updatedMessage
    },
    isOnlineMeeting: true,
    onlineMeetingProvider: "teamsForBusiness"
  };

  try {
    const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/auth/update-event/${eventToUpdate.id}`, eventDetails, { withCredentials: true });

    if (response.status === 200) {
      fetchEvents();
      setEventToUpdate(null);
    } else {
      console.error('Failed to update the event');
    }
  } catch (error) {
    console.error(error);
  }
};

const handleUpdateClick = (event) => {
  console.log(event); // Log the event object

  if (!event) {
    // handle the case where event is undefined or null
    return;
  }

  setEventToUpdate(event);
  setUpdatedSubject(event.subject || '');
  
  const formatDate = (date) => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    let year = d.getFullYear();
    let hour = d.getHours();
    let minute = d.getMinutes();
    let second = d.getSeconds();
  
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    if (hour < 10) hour = '0' + hour;
    if (minute < 10) minute = '0' + minute;
    if (second < 10) second = '0' + second;
  
    // Convert to ISO string and remove milliseconds
    let isoString = new Date(year, month - 1, day, hour, minute, second).toISOString();
    isoString = isoString.slice(0, isoString.lastIndexOf('.'));
  
    return isoString;
  };

  setUpdatedStart(formatDate(event.start) || '');
  setUpdatedEnd(formatDate(event.end) || '');
  
  // Assuming attendees is a string of emails separated by commas
// Join the array into a string of emails separated by commas
setUpdatedAttendees(event.attendees.join(', ') || '');

  // Assuming message is a string
  setUpdatedMessage(event.message || '');
};
  const handleAuthorize = () => {
    router.push('/authorize');
  };

  const handleSignOut = async () => {
    await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/sign-out`, { withCredentials: true });
  };

  const handleDateClick = (arg) => {
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
    <div>
    {/*  <PrimaryButton
        onClick={() => setShowCreateEventForm(!showCreateEventForm)}
        styles={{
          root: { backgroundColor: 'white', color: 'black' },
          rootHovered: { backgroundColor: 'darkblue', color: 'white' },
        }}
      >
        Create new Event
      </PrimaryButton>
      {showCreateEventForm && (
        <form onSubmit={handleSubmit}>
          <TextField label="Subject" value={subject} onChange={e => setSubject(e.target.value)} required />
          <TextField label="Start" type="datetime-local" value={start} onChange={e => setStart(e.target.value)} required />
          <TextField label="End" type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} required />
          <TextField label="Attendees" value={attendees} onChange={e => setAttendees(e.target.value)} required />
          <TextField label="Message" value={message} onChange={e => setMessage(e.target.value)} required />
          <PrimaryButton
            type="submit"
            styles={{
              root: { backgroundColor: 'white', color: 'black' },
              rootHovered: { backgroundColor: 'darkblue', color: 'white' },
            }}
          >
            Create event
          </PrimaryButton>
        </form>
      )}

<h2>Events for the next week:</h2>

{displayedEvents.map((event, index) => (
  <div key={index} style={{border: '1px solid #ccc', margin: '10px 0', padding: '10px'}}>
    <h3>{event.title}</h3>
    <p>{new Date(event.start).toLocaleDateString()} - {new Date(event.end).toLocaleDateString()}</p>
    <p>Organizer: {event.organizer}</p>
    <p>Location: {event.location}</p>
    <p>Attendees:</p>
    <ul>
      {event.attendees.map((attendee, i) => (
        <li key={i}>{attendee.email} - {attendee.acceptanceStatus}</li>
      ))}
    </ul>
    <button onClick={() => handleUpdateClick(event)}>Update</button>
  </div>
))}

{eventToUpdate && (
  <form onSubmit={handleUpdateSubmit}>
    <TextField label="Subject" value={updatedSubject} onChange={e => setUpdatedSubject(e.target.value)} required />
    <TextField label="Start" type="datetime-local" value={updatedStart} onChange={e => setUpdatedStart(e.target.value)} required />
    <TextField label="End" type="datetime-local" value={updatedEnd} onChange={e => setUpdatedEnd(e.target.value)} required />
    <TextField label="Attendees" value={updatedAttendees} onChange={e => setUpdatedAttendees(e.target.value)} required />
    <TextField label="Message" value={updatedMessage} onChange={e => setUpdatedMessage(e.target.value)} required />
    <PrimaryButton
      type="submit"
      styles={{
        root: { backgroundColor: 'white', color: 'black' },
        rootHovered: { backgroundColor: 'darkblue', color: 'white' },
      }}
    >
      Update event
    </PrimaryButton>
  </form>
)}
      {nextWeekEvents.length > 5 && !showAllEvents && (
        <button onClick={() => setShowAllEvents(true)}>Show all events</button>
      )} */}
      <Stack horizontal tokens={{ childrenGap: 10 }}>
        <PrimaryButton onClick={handleAuthorize} styles={{ root: { backgroundColor: 'white', color: 'black' }, rootHovered: { backgroundColor: 'darkblue', color: 'white' } }}>Authorize Microsoft API</PrimaryButton>
        <PrimaryButton onClick={handleSignOut} styles={{ root: { backgroundColor: 'white', color: 'black' }, rootHovered: { backgroundColor: 'darkblue', color: 'white' } }}>Sign Out</PrimaryButton>
      </Stack>
    </div>
  );
  
};

export default Calendar;
