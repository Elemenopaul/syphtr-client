import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { TextField, PrimaryButton, Stack, Text, Separator } from '@fluentui/react';

const ComposeEmail = ({ recipientEmail }) => {
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [emails, setEmails] = useState([]);
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [emailSent, setEmailSent] = useState(false);



    // Update the recipient when the prop changes
    useEffect(() => {
        setRecipient(recipientEmail);
      }, [recipientEmail]);


      useEffect(() => {
        const fetchEmails = async () => {
          try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/get-emails`, { withCredentials: true });
            
            // Filter the emails based on the sender's and recipient's address
const filteredEmails = response.data.filter(email => 
    (email.from && email.from.emailAddress && email.from.emailAddress.address === recipient) ||
    (email.toRecipients && email.toRecipients.some(recipientObj => recipientObj.emailAddress.address === recipient))
  );
            
    // Sort the emails by sentDateTime in descending order (most recent first)
const sortedEmails = filteredEmails.sort((a, b) => new Date(b.sentDateTime) - new Date(a.sentDateTime));

setEmails(sortedEmails);
          } catch (error) {
            console.error('Error fetching emails:', error.response ? error.response.data : error.message);
          }
        };
      
        fetchEmails();
      }, [recipient]); // Added recipient as a dependency

  

  const handleAuthorize = () => {
    // Redirect to the Authorize component
    router.push('/authorize');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      // Get the session token from the cookies
      const sessionToken = Cookies.get('__session');

      // Send a request to your back-end
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/send-email`,
        { recipient, subject, body, sessionToken },
        { withCredentials: true } // Include cookies in the request
      );
      // Handle the response
      console.log(response);
      alert('Email sent successfully!');
    } catch (error) {
      // Handle the error
      console.error('Error sending email:', error.response ? error.response.data : error.message);
    }
  };
  
  const handleSignOut = async () => {
    // Send a request to your server to clear the access token cookie
    await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/sign-out`, { withCredentials: true });
  };
  return (
    <div>
      <PrimaryButton 
        onClick={() => setIsFormVisible(!isFormVisible)}
        styles={{
          root: { backgroundColor: 'white', color: 'black' },
          rootHovered: { backgroundColor: 'darkblue', color: 'white' },
        }}
      >
        {isFormVisible ? 'Close Email Form' : 'Send Email to this Candidate'}
      </PrimaryButton>
      {isFormVisible && (
        <form onSubmit={handleSubmit}>
          <Stack tokens={{ childrenGap: 10 }}>
            <TextField label="Recipient" value={recipient} onChange={e => setRecipient(e.target.value)} required />
            <TextField label="Subject" value={subject} onChange={e => setSubject(e.target.value)} required />
            <TextField label="Body" multiline autoAdjustHeight value={body} onChange={e => setBody(e.target.value)} required />
            <Stack horizontal tokens={{ childrenGap: 10 }}>
              <PrimaryButton type="submit" styles={{ root: { backgroundColor: 'white', color: 'black' }, rootHovered: { backgroundColor: 'darkblue', color: 'white' } }}>Send</PrimaryButton>
            </Stack>
          </Stack>
        </form>
      )}
      <div>
        <h1>Your emails with this candidate::</h1>
        <div style={{ maxHeight: '200px', overflow: 'auto', border: '1px solid #ccc', padding: '10px' }}>
          {emails.slice(0, 50).map((email, index) => {
            const parser = new DOMParser();
            const htmlDoc = parser.parseFromString(email.body.content, 'text/html');
            const plainText = htmlDoc.body.textContent || "";
  
            return (
              <Stack key={index} styles={{ root: { margin: '10px', maxWidth: '600px' } }}>
                <Text variant="medium">Sender Name: {email.from && email.from.emailAddress ? email.from.emailAddress.name : 'Unknown'}</Text>
                <Text variant="small">Sender Email Address: {email.from && email.from.emailAddress ? email.from.emailAddress.address : 'Unknown'}</Text>
                <Text variant="large">Subject: {email.subject}</Text>
                <Text variant="small">Sent Date and Time: {new Date(email.sentDateTime).toLocaleString()}</Text>
                <Separator/>
                <Text>Email Body: {plainText}</Text>
              </Stack>
            );
          })}
        </div>
      </div>
    </div>
  );
  
};

export default ComposeEmail;