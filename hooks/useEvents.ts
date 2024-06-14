// Import necessary hooks
import { useState, useEffect } from 'react';
import axios from 'axios';

interface EmailAddress {
  name: string;
  address: string;
}

interface Attendee {
  type: string;
  emailAddress: EmailAddress;
  status: { response: string; time: string };
}

interface Body {
    contentType: string;
    content: string;
  }

interface Location {
    displayName: string;
    }  


  
interface Event {
  id: string;
  subject: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  organizer: { emailAddress: EmailAddress };
  attendees: Attendee[];
  body: Body; // Add this line
  location: { displayName: string };

}

// Define the custom hook
function useEvents(recipientEmail: string): Event[] {
  // Define the state variable
  const [events, setEvents] = useState<Event[]>([]);

  // Fetch the events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/get-events`, { withCredentials: true });
        const events: Event[] = response.data.filter((event: Event) => 
          event.organizer.emailAddress.address === recipientEmail || 
          (event.attendees && event.attendees.some((attendee: Attendee) => attendee.emailAddress.address === recipientEmail))
        ).map((event: Event) => {
          const eventDate = new Date(event.start.dateTime);
          const formattedDate = `${eventDate.getDate()} ${eventDate.toLocaleString('default', { month: 'long' })} ${eventDate.getFullYear()} at ${eventDate.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })} (GMT)`;
          const organizer = event.organizer.emailAddress.name;
          const attendees = event.attendees.map((attendee: Attendee) => ({
            email: attendee.emailAddress.address,
            acceptanceStatus: attendee.status.response,
          }));

          return {
            id: event.id,
            title: `${event.subject} on ${formattedDate}. Organizer: ${organizer}. Attendees: ${attendees.map(attendee => attendee.email).join(', ')}`,
            start: event.start.dateTime,
            end: event.end.dateTime,
            subject: event.subject,
            attendees,
            message: event.body.content,
            organizer: organizer,
            location: event.location.displayName,
          };
        });
        setEvents(events);
      } catch (error) {
        console.error(error);
      }
    };
    fetchEvents();
  }, [recipientEmail]);

  // Return the events
  return events;
}

export default useEvents;