import React, { useState, useEffect } from 'react';
import { Box, List, ListItem, ListItemAvatar, Avatar, ListItemText, Typography, TextField, IconButton, Paper, useTheme } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
// import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
// import { db } from '../../config/firebase'; // Updated path
import { useAuth } from '../../contexts/AuthContext'; // Updated path and hook usage
import { User } from '../../types/user'; // Assuming User type exists
import { Message } from '../../types/message'; // Assuming Message type exists

// Define more specific types based on assumed structure or existing types
interface SampleUser extends Pick<User, 'id' | 'displayName'> { // Use User type fields if they match
  avatar?: string; // Keep avatar optional or use a default
}

interface SampleMessage extends Message { // Extend existing Message type
  // Add any specific fields if needed, otherwise Message type should suffice
  // Ensure Message type has id, senderId, text, timestamp
}

// Sample Data (Typed)
const sampleUsers: SampleUser[] = [
  { id: '1', displayName: 'Alice' /* avatar: '/api/placeholder/300/300' - Removed */ },
  { id: '2', displayName: 'Bob' /* avatar: '/api/placeholder/301/301' - Removed */ },
  { id: '3', displayName: 'Charlie' /* avatar: '/api/placeholder/302/302' - Removed */ },
];

// Type for the messages state object
type MessagesState = {
  [userId: string]: SampleMessage[];
};

const sampleMessages: MessagesState = {
  '1': [
    { id: 'm1', senderId: 'user', text: 'Hi Alice!', timestamp: new Date(Date.now() - 100000) },
    { id: 'm2', senderId: '1', text: 'Hey there!', timestamp: new Date(Date.now() - 90000) },
  ],
  '2': [
    { id: 'm3', senderId: 'user', text: 'Morning Bob', timestamp: new Date(Date.now() - 50000) },
  ],
  '3': [],
};

function MessagesPage(): React.ReactElement {
  const theme = useTheme();
  const { user } = useAuth(); // Use the hook

  const [selectedUserId, setSelectedUserId] = useState<string | null>(sampleUsers[0]?.id || null);
  const [messages, setMessages] = useState<MessagesState>(sampleMessages);
  const [newMessage, setNewMessage] = useState<string>('');

  // useEffect(() => {
  //   if (!user || !selectedUserId) return;
  //   // Construct a unique chat ID (e.g., combining user IDs sorted alphabetically)
  //   const chatId = [user.uid, selectedUserId].sort().join('_');
  //   const messagesRef = collection(db, 'chats', chatId, 'messages');
  //   const q = query(messagesRef, orderBy('timestamp'));

  //   const unsubscribe = onSnapshot(q, (querySnapshot) => {
  //     const msgs: SampleMessage[] = []; // Type the array
  //     querySnapshot.forEach((doc) => {
  //       const data = doc.data();
  //       // Ensure timestamp is converted correctly if using Firebase
  //       const timestamp = data.timestamp?.toDate ? data.timestamp.toDate() : new Date();
  //       msgs.push({ id: doc.id, ...data, timestamp } as SampleMessage); // Assert type if necessary
  //     });
  //     // Update state - This needs careful handling with sample data
  //     // setMessages(prev => ({ ...prev, [selectedUserId]: msgs }));
  //     console.log("Firebase messages:", msgs)
  //   });

  //   return () => unsubscribe();
  // }, [user, selectedUserId]);

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !selectedUserId) return;

    // Ensure user object has uid (adjust based on your actual User type)
    const senderId = user?.uid || 'unknown_user';

    const messageData: Omit<SampleMessage, 'id'> = { // Omit id as it's generated
      senderId: senderId,
      text: newMessage,
      timestamp: new Date(), // Use client time for sample data
    };

    // Sample data update
    setMessages(prev => {
      const userMessages = prev[selectedUserId] || [];
      // Create the full message object including a temporary ID
      const fullMessage: SampleMessage = { ...messageData, id: `msg_${Date.now()}` };
      return {
        ...prev,
        [selectedUserId]: [...userMessages, fullMessage]
      };
    });

    // // Firebase update
    // const chatId = [senderId, selectedUserId].sort().join('_');
    // const messagesRef = collection(db, 'chats', chatId, 'messages');
    // try {
    //   await addDoc(messagesRef, {
    //     ...messageData,
    //     timestamp: serverTimestamp() // Use server timestamp for Firebase
    //   });
    //   setNewMessage('');
    // } catch (error) {
    //   console.error("Error sending message: ", error);
    // }

    setNewMessage(''); // Clear input after sample data update
  };

  const selectedUserMessages = selectedUserId ? messages[selectedUserId] || [] : [];
  const selectedUserDetails = sampleUsers.find(u => u.id === selectedUserId);
  const currentUserSenderId = user?.uid || 'unknown_user'; // Consistent sender ID check

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', // Adjust height based on header/layout
              border: `1px solid ${theme.palette.divider}` }}>
      {/* User List */}
      <Box sx={{
        width: { xs: '100%', sm: '30%' }, // Responsive width
        borderRight: { sm: `1px solid ${theme.palette.divider}` },
        overflowY: 'auto',
        bgcolor: theme.palette.background.paper,
        display: { xs: selectedUserId ? 'none' : 'block', sm: 'block' } // Hide list on mobile when chat is open
      }}>
        <List>
          {sampleUsers.map((u) => (
            <ListItem
              key={u.id}
              onClick={() => handleSelectUser(u.id)}
              selected={selectedUserId === u.id}
              sx={{
                 cursor: 'pointer',
                '&.Mui-selected': {
                  backgroundColor: theme.palette.action.selected,
                },
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                }
              }}
            >
              <ListItemAvatar>
                {/* Use Avatar without src for placeholder */}
                <Avatar alt={u.displayName}>
                  {u.displayName ? u.displayName.charAt(0).toUpperCase() : '?'}
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={u.displayName} />
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Chat Area */}
      <Box sx={{
          width: { xs: '100%', sm: '70%' },
          display: 'flex',
          flexDirection: 'column',
          bgcolor: theme.palette.background.default,
          display: { xs: selectedUserId ? 'flex' : 'none', sm: 'flex' } // Show chat on mobile only when selected
         }}>
        {selectedUserDetails ? (
          <>
            {/* Chat Header */}
            <Paper square elevation={1} sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
               {/* Use Avatar without src for placeholder */}
               <Avatar alt={selectedUserDetails.displayName} sx={{ mr: 2 }}>
                 {selectedUserDetails.displayName ? selectedUserDetails.displayName.charAt(0).toUpperCase() : '?'}
               </Avatar>
               <Typography variant="h6">{selectedUserDetails.displayName}</Typography>
               {/* Add a back button for mobile? */}
            </Paper>

            {/* Messages */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
              {selectedUserMessages.map((msg) => (
                <Box
                  key={msg.id}
                  sx={{
                    display: 'flex',
                    justifyContent: msg.senderId === currentUserSenderId ? 'flex-end' : 'flex-start',
                    mb: 1,
                  }}
                >
                  <Paper
                    elevation={1}
                    sx={{
                      p: 1.5,
                      bgcolor: msg.senderId === currentUserSenderId ? theme.palette.primary.light : theme.palette.background.paper, // Lighter shade for user messages
                      color: msg.senderId === currentUserSenderId ? theme.palette.primary.contrastText : theme.palette.text.primary,
                      maxWidth: '70%',
                      borderRadius: msg.senderId === currentUserSenderId ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                      wordBreak: 'break-word', // Prevent long words from overflowing
                    }}
                  >
                    <Typography variant="body1">{msg.text}</Typography>
                    {msg.timestamp && ( // Check if timestamp exists
                       <Typography variant="caption" display="block" sx={{ textAlign: 'right', opacity: 0.7, mt: 0.5 }}>
                         {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </Typography>
                    )}
                  </Paper>
                </Box>
              ))}
              {/* Add ref for scrolling to bottom */}
            </Box>

            {/* Input Area */}
            <Paper square elevation={2} sx={{ p: 1, borderTop: `1px solid ${theme.palette.divider}`, mt: 'auto' /* Push to bottom */ }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMessage(e.target.value)}
                  onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && !e.shiftKey && (handleSendMessage(), e.preventDefault())} // Send on Enter, allow Shift+Enter for newline
                  multiline // Allow multiline input
                  maxRows={4} // Limit rows
                  sx={{ mr: 1 }}
                />
                <IconButton color="primary" onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <SendIcon />
                </IconButton>
              </Box>
            </Paper>
          </>
        ) : (
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">Select a chat to start messaging</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default MessagesPage;