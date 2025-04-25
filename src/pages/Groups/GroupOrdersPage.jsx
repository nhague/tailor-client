import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Divider,
  IconButton,
  Avatar,
  AvatarGroup,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  ListItemSecondaryAction,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Menu,
  Switch,
  Snackbar,
  Alert,
  useMediaQuery,
  Checkbox, // Added Checkbox import
  InputLabel, // Added InputLabel import
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Group as GroupIcon,
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  PendingActions as PendingIcon,
  ExpandMore as ExpandMoreIcon,
  Send as SendIcon,
  Message as MessageIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  PersonAdd as PersonAddIcon,
  FormatColorFill as ColorIcon,
  CollectionsBookmark as FabricIcon,
  AccessTime as TimeIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  CalendarToday as CalendarIcon,
  Email as EmailIcon,
  Poll as PollIcon,
  PhotoLibrary as GalleryIcon,
} from '@mui/icons-material';
import { format, isBefore, isAfter, addDays, formatDistance } from 'date-fns'; // Added formatDistance import
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useNavigate, useLocation } from 'react-router-dom';

// Styled components
const ColorSwatch = styled(Box)(({ color, selected, theme }) => ({
  width: 36,
  height: 36,
  backgroundColor: color,
  borderRadius: '50%',
  cursor: 'pointer',
  border: selected ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
  boxShadow: selected ? theme.shadows[3] : 'none',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.1)',
  },
}));

const FabricSwatch = styled(Box)(({ image, selected, theme }) => ({
  width: 60,
  height: 60,
  backgroundImage: `url(${image})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  borderRadius: theme.shape.borderRadius,
  cursor: 'pointer',
  border: selected ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
  boxShadow: selected ? theme.shadows[3] : 'none',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const ProgressLabel = styled('span')(({ theme, value }) => {
  const color =
    value < 30 ? theme.palette.error.main :
    value < 70 ? theme.palette.warning.main :
    theme.palette.success.main;

  return {
    color,
    fontWeight: 'bold',
  };
});

const GroupOrdersPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [groupOrders, setGroupOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupDetailsOpen, setGroupDetailsOpen] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [inviteMemberOpen, setInviteMemberOpen] = useState(false);
  const [styleCoordinationOpen, setStyleCoordinationOpen] = useState(false);
  const [viewPollOpen, setViewPollOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [activeView, setActiveView] = useState('overview'); // overview, members, timeline, styles, polls

  // Form states
  const [newGroup, setNewGroup] = useState({
    name: '',
    eventType: 'wedding',
    eventDate: '',
    notes: '',
  });

  const [newInvite, setNewInvite] = useState({
    emails: '',
    message: '',
  });

  const [styleSelection, setStyleSelection] = useState({
    selectedColors: [],
    selectedFabrics: [],
    requiredElements: [],
  });

  const [activePoll, setActivePoll] = useState(null);

  // Sample color options and fabric options for style coordination
  const colorOptions = [
    { id: 'color1', value: '#0A2E36', name: 'Navy Blue' },
    { id: 'color2', value: '#27474E', name: 'Teal' },
    { id: 'color3', value: '#32292F', name: 'Charcoal' },
    { id: 'color4', value: '#575366', name: 'Slate Gray' },
    { id: 'color5', value: '#7A6C5D', name: 'Taupe' },
    { id: 'color6', value: '#A47963', name: 'Copper Brown' },
    { id: 'color7', value: '#664E4C', name: 'Dark Brown' },
    { id: 'color8', value: '#4B296B', name: 'Royal Purple' },
  ];

  const fabricOptions = [
    { id: 'fabric1', image: '/api/placeholder/100/100', name: 'Italian Wool Blend' },
    { id: 'fabric2', image: '/api/placeholder/100/100', name: 'Super 120s Wool' },
    { id: 'fabric3', image: '/api/placeholder/100/100', name: 'Linen Cotton Blend' },
    { id: 'fabric4', image: '/api/placeholder/100/100', name: 'Stretch Wool' },
    { id: 'fabric5', image: '/api/placeholder/100/100', name: 'Cashmere Blend' },
    { id: 'fabric6', image: '/api/placeholder/100/100', name: 'Tropical Wool' },
  ];

  const requiredElementOptions = [
    { id: 'elem1', name: 'Same Color Ties' },
    { id: 'elem2', name: 'Matching Pocket Squares' },
    { id: 'elem3', name: 'Same Fabric Suits' },
    { id: 'elem4', name: 'Coordinated Shirt Colors' },
    { id: 'elem5', name: 'Matching Lapel Styles' },
    { id: 'elem6', name: 'Matching Buttons' },
  ];

  // Fetch group orders
  useEffect(() => {
    if (!currentUser) {
      console.log('useEffect: currentUser is not available');
      return;
    }
    console.log('useEffect: currentUser is available', currentUser);

    const fetchGroupOrders = async () => {
      try {
        // In a real implementation, this would query Firestore
        // const groupsQuery = query(
        //   collection(db, 'groupOrders'),
        //   where('members', 'array-contains', { userId: currentUser.uid }),
        //   orderBy('eventDate')
        // );

        // const groupsSnapshot = await getDocs(groupsQuery);
        // const groupsData = groupsSnapshot.docs.map(doc => ({
        //   id: doc.id,
        //   ...doc.data(),
        //   eventDate: doc.data().eventDate.toDate(),
        // }));

        // For demo purposes, use sample data
        const today = new Date();
        const nextMonth = addDays(today, 30);
        const twoMonthsLater = addDays(today, 60);
        const threeMonthsLater = addDays(today, 90);

        const sampleGroups = [
          {
            id: 'group1',
            name: 'Johnson Wedding Party',
            eventType: 'wedding',
            eventDate: twoMonthsLater,
            createdBy: currentUser.uid,
            members: [
              {
                userId: currentUser.uid,
                role: 'organizer',
                joinedAt: addDays(today, -10),
                status: 'active',
                orderId: 'order123',
                name: 'John Doe',
                email: 'john.doe@example.com',
                profileImage: '/api/placeholder/40/40',
              },
              {
                userId: 'user1',
                role: 'member',
                joinedAt: addDays(today, -8),
                status: 'active',
                orderId: 'order124',
                name: 'Mike Johnson',
                email: 'mike@example.com',
                profileImage: '/api/placeholder/40/40',
              },
              {
                userId: 'user2',
                role: 'member',
                joinedAt: addDays(today, -7),
                status: 'active',
                orderId: 'order125',
                name: 'David Williams',
                email: 'david@example.com',
                profileImage: '/api/placeholder/40/40',
              },
              {
                userId: 'user3',
                role: 'member',
                joinedAt: addDays(today, -5),
                status: 'pending',
                orderId: null,
                name: 'James Brown',
                email: 'james@example.com',
                profileImage: '/api/placeholder/40/40',
              },
            ],
            sharedStyles: {
              products: ['suit', 'shirt'],
              fabrics: ['wool', 'cotton'],
              colorPalette: ['#0A2E36', '#575366'],
              requiredElements: ['Same Color Ties', 'Matching Pocket Squares'],
            },
            conversationId: 'conv123',
            timeline: [
              {
                milestone: 'Group Creation',
                dueDate: addDays(today, -10),
                completed: true,
                completedDate: addDays(today, -10),
              },
              {
                milestone: 'Member Invitations',
                dueDate: addDays(today, -5),
                completed: true,
                completedDate: addDays(today, -5),
              },
              {
                milestone: 'Style Coordination',
                dueDate: addDays(today, 5),
                completed: false,
                completedDate: null,
              },
              {
                milestone: 'Measurements Submission',
                dueDate: addDays(today, 15),
                completed: false,
                completedDate: null,
              },
              {
                milestone: 'Order Placement',
                dueDate: addDays(today, 20),
                completed: false,
                completedDate: null,
              },
              {
                milestone: 'First Fitting',
                dueDate: addDays(today, 40),
                completed: false,
                completedDate: null,
              },
              {
                milestone: 'Final Alterations',
                dueDate: addDays(today, 50),
                completed: false,
                completedDate: null,
              },
            ],
            notes: 'Wedding colors are navy and silver. The ceremony starts at 4 PM.',
            status: 'planning',
            polls: [
              {
                id: 'poll1',
                title: 'Suit Color Preference',
                description: 'Please vote for your preferred suit color for the wedding.',
                options: [
                  { id: 'opt1', text: 'Navy Blue', votes: ['user1', 'user2'] },
                  { id: 'opt2', text: 'Charcoal Gray', votes: [currentUser.uid] },
                  { id: 'opt3', text: 'Black', votes: ['user3'] },
                ],
                createdBy: currentUser.uid,
                createdAt: addDays(today, -6),
                expiresAt: addDays(today, 1),
                status: 'active',
              },
              {
                id: 'poll2',
                title: 'Tie Style',
                description: 'Select your preferred tie style.',
                options: [
                  { id: 'opt1', text: 'Solid Color', votes: [currentUser.uid, 'user2'] },
                  { id: 'opt2', text: 'Patterned', votes: ['user1'] },
                  { id: 'opt3', text: 'Bow Tie', votes: ['user3'] },
                ],
                createdBy: currentUser.uid,
                createdAt: addDays(today, -4),
                expiresAt: addDays(today, 3),
                status: 'active',
              },
            ],
            activityFeed: [
              {
                type: 'member_joined',
                userId: currentUser.uid,
                timestamp: addDays(today, -10),
                details: 'Created the group',
              },
              {
                type: 'member_joined',
                userId: 'user1',
                timestamp: addDays(today, -8),
                details: 'Joined the group',
              },
              {
                type: 'member_joined',
                userId: 'user2',
                timestamp: addDays(today, -7),
                details: 'Joined the group',
              },
              {
                type: 'poll_created',
                userId: currentUser.uid,
                timestamp: addDays(today, -6),
                details: 'Created a poll: Suit Color Preference',
              },
              {
                type: 'poll_voted',
                userId: 'user1',
                timestamp: addDays(today, -5),
                details: 'Voted on poll: Suit Color Preference',
              },
              {
                type: 'poll_created',
                userId: currentUser.uid,
                timestamp: addDays(today, -4),
                details: 'Created a poll: Tie Style',
              },
              {
                type: 'style_updated',
                userId: currentUser.uid,
                timestamp: addDays(today, -2),
                details: 'Updated shared style preferences',
              },
            ],
          },
          {
            id: 'group2',
            name: 'Smith Corp Team',
            eventType: 'corporate',
            eventDate: threeMonthsLater,
            createdBy: currentUser.uid,
            members: [
              {
                userId: currentUser.uid,
                role: 'organizer',
                joinedAt: addDays(today, -15),
                status: 'active',
                orderId: 'order126',
                name: 'John Doe',
                email: 'john.doe@example.com',
                profileImage: '/api/placeholder/40/40',
              },
              {
                userId: 'user4',
                role: 'member',
                joinedAt: addDays(today, -13),
                status: 'active',
                orderId: 'order127',
                name: 'Robert Smith',
                email: 'robert@example.com',
                profileImage: '/api/placeholder/40/40',
              },
              {
                userId: 'user5',
                role: 'member',
                joinedAt: addDays(today, -12),
                status: 'pending',
                orderId: null,
                name: 'Thomas Clark',
                email: 'thomas@example.com',
                profileImage: '/api/placeholder/40/40',
              },
            ],
            sharedStyles: {
              products: ['suit'],
              fabrics: ['wool'],
              colorPalette: ['#27474E', '#664E4C'],
              requiredElements: ['Same Fabric Suits'],
            },
            conversationId: 'conv124',
            timeline: [
              {
                milestone: 'Group Creation',
                dueDate: addDays(today, -15),
                completed: true,
                completedDate: addDays(today, -15),
              },
              {
                milestone: 'Member Invitations',
                dueDate: addDays(today, -10),
                completed: true,
                completedDate: addDays(today, -10),
              },
              {
                milestone: 'Style Coordination',
                dueDate: addDays(today, 10),
                completed: false,
                completedDate: null,
              },
              {
                milestone: 'Measurements Submission',
                dueDate: addDays(today, 25),
                completed: false,
                completedDate: null,
              },
              {
                milestone: 'Order Placement',
                dueDate: addDays(today, 30),
                completed: false,
                completedDate: null,
              },
            ],
            notes: 'Corporate suits for the annual company event.',
            status: 'planning',
            polls: [],
            activityFeed: [
              {
                type: 'member_joined',
                userId: currentUser.uid,
                timestamp: addDays(today, -15),
                details: 'Created the group',
              },
              {
                type: 'member_joined',
                userId: 'user4',
                timestamp: addDays(today, -13),
                details: 'Joined the group',
              },
              {
                type: 'style_updated',
                userId: currentUser.uid,
                timestamp: addDays(today, -8),
                details: 'Updated shared style preferences',
              },
            ],
          },
          {
            id: 'group3',
            name: 'Jazz Band Performers',
            eventType: 'performance',
            eventDate: nextMonth,
            createdBy: 'user6',
            members: [
              {
                userId: currentUser.uid,
                role: 'member',
                joinedAt: addDays(today, -20),
                status: 'active',
                orderId: 'order128',
                name: 'John Doe',
                email: 'john.doe@example.com',
                profileImage: '/api/placeholder/40/40',
              },
              {
                userId: 'user6',
                role: 'organizer',
                joinedAt: addDays(today, -25),
                status: 'active',
                orderId: 'order129',
                name: 'Sarah Johnson',
                email: 'sarah@example.com',
                profileImage: '/api/placeholder/40/40',
              },
              {
                userId: 'user7',
                role: 'member',
                joinedAt: addDays(today, -18),
                status: 'active',
                orderId: 'order130',
                name: 'Michael Davis',
                email: 'michael@example.com',
                profileImage: '/api/placeholder/40/40',
              },
            ],
            sharedStyles: {
              products: ['suit', 'shirt'],
              fabrics: ['wool', 'cotton'],
              colorPalette: ['#32292F', '#0A2E36'],
              requiredElements: ['Same Fabric Suits', 'Matching Lapel Styles'],
            },
            conversationId: 'conv125',
            timeline: [
              {
                milestone: 'Group Creation',
                dueDate: addDays(today, -25),
                completed: true,
                completedDate: addDays(today, -25),
              },
              {
                milestone: 'Member Invitations',
                dueDate: addDays(today, -20),
                completed: true,
                completedDate: addDays(today, -20),
              },
              {
                milestone: 'Style Coordination',
                dueDate: addDays(today, -15),
                completed: true,
                completedDate: addDays(today, -10),
              },
              {
                milestone: 'Measurements Submission',
                dueDate: addDays(today, -5),
                completed: true,
                completedDate: addDays(today, -7),
              },
              {
                milestone: 'Order Placement',
                dueDate: addDays(today, -1),
                completed: true,
                completedDate: addDays(today, -3),
              },
              {
                milestone: 'Production',
                dueDate: addDays(today, 15),
                completed: false,
                completedDate: null,
              },
              {
                milestone: 'Delivery',
                dueDate: addDays(today, 25),
                completed: false,
                completedDate: null,
              },
            ],
            notes: 'Performance suits for the jazz band concert.',
            status: 'production',
            polls: [],
            activityFeed: [
              {
                type: 'member_joined',
                userId: 'user6',
                timestamp: addDays(today, -25),
                details: 'Created the group',
              },
              {
                type: 'member_joined',
                userId: currentUser.uid,
                timestamp: addDays(today, -20),
                details: 'Joined the group',
              },
              {
                type: 'member_joined',
                userId: 'user7',
                timestamp: addDays(today, -18),
                details: 'Joined the group',
              },
              {
                type: 'style_updated',
                userId: 'user6',
                timestamp: addDays(today, -15),
                details: 'Updated shared style preferences',
              },
              {
                type: 'order_placed',
                userId: currentUser.uid,
                timestamp: addDays(today, -3),
                details: 'Placed order',
              },
              {
                type: 'order_placed',
                userId: 'user6',
                timestamp: addDays(today, -3),
                details: 'Placed order',
              },
              {
                type: 'order_placed',
                userId: 'user7',
                timestamp: addDays(today, -3),
                details: 'Placed order',
              },
            ],
          },
          {
            id: 'group4',
            name: 'Summer Gala Committee',
            eventType: 'corporate',
            eventDate: addDays(today, 180), // 6 months from now
            createdBy: currentUser.uid,
            members: [
              {
                userId: currentUser.uid,
                role: 'organizer',
                joinedAt: addDays(today, -5),
                status: 'active',
                orderId: null,
                name: 'John Doe',
                email: 'john.doe@example.com',
                profileImage: '/api/placeholder/40/40',
              },
              {
                userId: 'user8',
                role: 'member',
                joinedAt: addDays(today, -3),
                status: 'pending',
                orderId: null,
                name: 'Emily White',
                email: 'emily@example.com',
                profileImage: '/api/placeholder/40/40',
              },
            ],
            sharedStyles: {
              products: ['dress', 'suit'],
              fabrics: ['silk', 'wool'],
              colorPalette: ['#A47963', '#4B296B'],
              requiredElements: ['Coordinated Shirt Colors'],
            },
            conversationId: 'conv126',
            timeline: [
              {
                milestone: 'Group Creation',
                dueDate: addDays(today, -5),
                completed: true,
                completedDate: addDays(today, -5),
              },
              {
                milestone: 'Member Invitations',
                dueDate: addDays(today, 10),
                completed: false,
                completedDate: null,
              },
              {
                milestone: 'Style Coordination',
                dueDate: addDays(today, 30),
                completed: false,
                completedDate: null,
              },
              {
                milestone: 'Measurements Submission',
                dueDate: addDays(today, 60),
                completed: false,
                completedDate: null,
              },
              {
                milestone: 'Order Placement',
                dueDate: addDays(today, 90),
                completed: false,
                completedDate: null,
              },
              {
                milestone: 'Production',
                dueDate: addDays(today, 120),
                completed: false,
                completedDate: null,
              },
              {
                milestone: 'Delivery',
                dueDate: addDays(today, 150),
                completed: false,
                completedDate: null,
              },
            ],
            notes: 'Formal attire for the annual summer gala event.',
            status: 'planning',
            polls: [],
            activityFeed: [
              {
                type: 'member_joined',
                userId: currentUser.uid,
                timestamp: addDays(today, -5),
                details: 'Created the group',
              },
            ],
          },
          {
            id: 'group5',
            name: 'Fall Wedding Party',
            eventType: 'wedding',
            eventDate: addDays(today, 270), // 9 months from now
            createdBy: 'user9',
            members: [
              {
                userId: currentUser.uid,
                role: 'member',
                joinedAt: addDays(today, -1),
                status: 'pending',
                orderId: null,
                name: 'John Doe',
                email: 'john.doe@example.com',
                profileImage: '/api/placeholder/40/40',
              },
              {
                userId: 'user9',
                role: 'organizer',
                joinedAt: addDays(today, -7),
                status: 'active',
                orderId: null,
                name: 'Michael Brown',
                email: 'michaelb@example.com',
                profileImage: '/api/placeholder/40/40',
              },
            ],
            sharedStyles: {
              products: ['suit'],
              fabrics: ['wool'],
              colorPalette: ['#7A6C5D', '#664E4C'],
              requiredElements: ['Same Fabric Suits'],
            },
            conversationId: 'conv127',
            timeline: [
              {
                milestone: 'Group Creation',
                dueDate: addDays(today, -7),
                completed: true,
                completedDate: addDays(today, -7),
              },
              {
                milestone: 'Member Invitations',
                dueDate: addDays(today, 14),
                completed: false,
                completedDate: null,
              },
              {
                milestone: 'Style Coordination',
                dueDate: addDays(today, 45),
                completed: false,
                completedDate: null,
              },
              {
                milestone: 'Measurements Submission',
                dueDate: addDays(today, 90),
                completed: false,
                completedDate: null,
              },
              {
                milestone: 'Order Placement',
                dueDate: addDays(today, 120),
                completed: false,
                completedDate: null,
              },
              {
                milestone: 'First Fitting',
                dueDate: addDays(today, 180),
                completed: false,
                completedDate: null,
              },
              {
                milestone: 'Final Alterations',
                dueDate: addDays(today, 210),
                completed: false,
                completedDate: null,
              },
              {
                milestone: 'Event Date',
                dueDate: addDays(today, 270),
                completed: false,
                completedDate: null,
              },
            ],
            notes: 'Autumn wedding with a rustic theme. Earth tone colors preferred.',
            status: 'planning',
            polls: [],
            activityFeed: [
              {
                type: 'member_joined',
                userId: 'user9',
                timestamp: addDays(today, -7),
                details: 'Created the group',
              },
            ],
          },
        ];

        console.log('fetchGroupOrders: sampleGroups', sampleGroups);
        setGroupOrders(sampleGroups);
        console.log('fetchGroupOrders: groupOrders state set');
        setLoading(false);
      } catch (error) {
        console.error('Error fetching group orders:', error);
        setLoading(false);
      }
    };

    fetchGroupOrders();
  }, [currentUser]);

  // Handle URL params for group details
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const groupId = searchParams.get('groupId');

    if (groupId && groupOrders.length > 0) {
      const group = groupOrders.find(g => g.id === groupId);
      if (group) {
        setSelectedGroup(group);
        setGroupDetailsOpen(true);
      }
    }
  }, [location.search, groupOrders]);

  // Calculate group progress
  const calculateProgress = (group) => {
    if (!group?.timeline || group.timeline.length === 0) return 0;

    const completedMilestones = group.timeline.filter(milestone => milestone.completed).length;
    return Math.round((completedMilestones / group.timeline.length) * 100);
  };

  // Get next milestone
  const getNextMilestone = (group) => {
    if (!group?.timeline || group.timeline.length === 0) return null;

    const incompleteMilestones = group.timeline.filter(milestone => !milestone.completed);
    if (incompleteMilestones.length === 0) return null;

    return incompleteMilestones[0];
  };

  // Filter groups based on tab and search
  const filteredGroups = useMemo(() => {
    console.log('useMemo: groupOrders', groupOrders);
    console.log('useMemo: tabValue', tabValue);
    console.log('useMemo: searchQuery', searchQuery);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleViewDetails = (group) => {
    setSelectedGroup(group);
    setGroupDetailsOpen(true);

    // Update URL without refreshing
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('groupId', group.id);
    navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
  };

  const handleCloseDetails = () => {
    setGroupDetailsOpen(false);
    setSelectedGroup(null);
    setActiveView('overview');

    // Remove groupId from URL
    const searchParams = new URLSearchParams(location.search);
    searchParams.delete('groupId');
    navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
  };

  const handleCreateGroupOpen = () => {
    setCreateGroupOpen(true);
  };

  const handleCreateGroupClose = () => {
    setCreateGroupOpen(false);
  };

  const handleInviteMemberOpen = () => {
    setInviteMemberOpen(true);
  };

  const handleInviteMemberClose = () => {
    setInviteMemberOpen(false);
  };

  const handleStyleCoordinationOpen = () => {
    // Initialize with existing style selection if available
    if (selectedGroup?.sharedStyles) {
      setStyleSelection({
        selectedColors: selectedGroup.sharedStyles.colorPalette || [],
        selectedFabrics: selectedGroup.sharedStyles.fabrics || [],
        requiredElements: selectedGroup.sharedStyles.requiredElements || [],
      });
    }

    setStyleCoordinationOpen(true);
  };

  const handleStyleCoordinationClose = () => {
    setStyleCoordinationOpen(false);
  };

  const handleViewPollOpen = (poll) => {
    setActivePoll(poll);
    setViewPollOpen(true);
  };

  const handleViewPollClose = () => {
    setViewPollOpen(false);
    setActivePoll(null);
  };

  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleCreateGroup = () => {
    // In a real app, this would create a new group in Firestore
    const newGroupData = {
      id: `group${groupOrders.length + 1}`,
      name: newGroup.name,
      eventType: newGroup.eventType,
      eventDate: new Date(newGroup.eventDate),
      createdBy: currentUser.uid,
      members: [
        {
          userId: currentUser.uid,
          role: 'organizer',
          joinedAt: new Date(),
          status: 'active',
          orderId: null,
          name: userProfile.firstName + ' ' + userProfile.lastName,
          email: currentUser.email,
          profileImage: userProfile.profileImageUrl || '/api/placeholder/40/40',
        },
      ],
      sharedStyles: {
        products: [],
        fabrics: [],
        colorPalette: [],
        requiredElements: [],
      },
      conversationId: `conv${Date.now()}`,
      timeline: [
        {
          milestone: 'Group Creation',
          dueDate: new Date(),
          completed: true,
          completedDate: new Date(),
        },
        {
          milestone: 'Member Invitations',
          dueDate: addDays(new Date(), 7),
          completed: false,
          completedDate: null,
        },
        {
          milestone: 'Style Coordination',
          dueDate: addDays(new Date(), 14),
          completed: false,
          completedDate: null,
        },
        {
          milestone: 'Measurements Submission',
          dueDate: addDays(new Date(), 21),
          completed: false,
          completedDate: null,
        },
        {
          milestone: 'Order Placement',
          dueDate: addDays(new Date(), 28),
          completed: false,
          completedDate: null,
        },
      ],
      notes: newGroup.notes,
      status: 'planning',
      polls: [],
      activityFeed: [
        {
          type: 'member_joined',
          userId: currentUser.uid,
          timestamp: new Date(),
          details: 'Created the group',
        },
      ],
    };

    // Update local state
    setGroupOrders([newGroupData, ...groupOrders]);

    // Close dialog and show success message
    setCreateGroupOpen(false);
    setSnackbarMessage('Group created successfully');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);

    // Clear form
    setNewGroup({
      name: '',
      eventType: 'wedding',
      eventDate: '',
      notes: '',
    });
  };

  const handleInviteMembers = () => {
    if (!selectedGroup) return;

    // In a real app, this would send invitations and update Firestore
    // For demo purposes, just show a success message

    // Close dialog and show success message
    setInviteMemberOpen(false);
    setSnackbarMessage('Invitations sent successfully');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);

    // Clear form
    setNewInvite({
      emails: '',
      message: '',
    });
  };

  const handleSaveStyles = () => {
    if (!selectedGroup) return;

    // In a real app, this would update the group styles in Firestore
    const updatedGroups = groupOrders.map(group =>
      group.id === selectedGroup.id
        ? {
            ...group,
            sharedStyles: {
              ...group.sharedStyles,
              colorPalette: styleSelection.selectedColors,
              fabrics: styleSelection.selectedFabrics,
              requiredElements: styleSelection.requiredElements,
            },
          }
        : group
    );

    setGroupOrders(updatedGroups);
    setSelectedGroup({
      ...selectedGroup,
      sharedStyles: {
        ...selectedGroup.sharedStyles,
        colorPalette: styleSelection.selectedColors,
        fabrics: styleSelection.selectedFabrics,
        requiredElements: styleSelection.requiredElements,
      },
    });

    // Add to activity feed
    const updatedActivityFeed = [
      {
        type: 'style_updated',
        userId: currentUser.uid,
        timestamp: new Date(),
        details: 'Updated shared style preferences',
      },
      ...selectedGroup.activityFeed,
    ];

    // Update activity feed in state
    setSelectedGroup({
      ...selectedGroup,
      activityFeed: updatedActivityFeed,
      sharedStyles: {
        ...selectedGroup.sharedStyles,
        colorPalette: styleSelection.selectedColors,
        fabrics: styleSelection.selectedFabrics,
        requiredElements: styleSelection.requiredElements,
      },
    });

    // Close dialog and show success message
    setStyleCoordinationOpen(false);
    setSnackbarMessage('Style preferences saved successfully');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleVotePoll = (optionId) => {
    if (!activePoll || !selectedGroup) return;

    // Check if user already voted
    const userVoted = activePoll.options.some(option =>
      option.votes.includes(currentUser.uid)
    );

    // Create a new poll with updated votes
    const updatedOptions = activePoll.options.map(option => {
      if (userVoted && option.votes.includes(currentUser.uid)) {
        // Remove vote from previously selected option
        return {
          ...option,
          votes: option.votes.filter(userId => userId !== currentUser.uid),
        };
      } else if (option.id === optionId) {
        // Add vote to newly selected option
        return {
          ...option,
          votes: [...option.votes, currentUser.uid],
        };
      }
      return option;
    });

    const updatedPoll = {
      ...activePoll,
      options: updatedOptions,
    };

    // Update polls in the selected group
    const updatedPolls = selectedGroup.polls.map(poll =>
      poll.id === activePoll.id ? updatedPoll : poll
    );

    // Update activity feed
    const updatedActivityFeed = [
      {
        type: 'poll_voted',
        userId: currentUser.uid,
        timestamp: new Date(),
        details: `Voted on poll: ${activePoll.title}`,
      },
      ...selectedGroup.activityFeed,
    ];

    // Update group in state
    setSelectedGroup({
      ...selectedGroup,
      polls: updatedPolls,
      activityFeed: updatedActivityFeed,
    });

    // Update active poll
    setActivePoll(updatedPoll);

    // Show success message
    setSnackbarMessage('Vote recorded successfully');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleNewGroupChange = (field, value) => {
    setNewGroup(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNewInviteChange = (field, value) => {
    setNewInvite(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleColorToggle = (colorId) => {
    const color = colorOptions.find(c => c.id === colorId)?.value;

    if (!color) return;

    setStyleSelection(prev => {
      const colorIndex = prev.selectedColors.indexOf(color);

      if (colorIndex >= 0) {
        // Remove color if already selected
        const newColors = [...prev.selectedColors];
        newColors.splice(colorIndex, 1);
        return { ...prev, selectedColors: newColors };
      } else {
        // Add color if not already selected (max 4)
        if (prev.selectedColors.length >= 4) {
          return prev;
        }

        return { ...prev, selectedColors: [...prev.selectedColors, color] };
      }
    });
  };

  const handleFabricToggle = (fabricId) => {
    setStyleSelection(prev => {
      const fabricIndex = prev.selectedFabrics.indexOf(fabricId);

      if (fabricIndex >= 0) {
        // Remove fabric if already selected
        const newFabrics = [...prev.selectedFabrics];
        newFabrics.splice(fabricIndex, 1);
        return { ...prev, selectedFabrics: newFabrics };
      } else {
        // Add fabric if not already selected (max 3)
        if (prev.selectedFabrics.length >= 3) {
          return prev;
        }

        return { ...prev, selectedFabrics: [...prev.selectedFabrics, fabricId] };
      }
    });
  };

  const handleRequiredElementToggle = (elementId) => {
    setStyleSelection(prev => {
      const elementIndex = prev.requiredElements.indexOf(elementId);

      if (elementIndex >= 0) {
        // Remove element if already selected
        const newElements = [...prev.requiredElements];
        newElements.splice(elementIndex, 1);
        return { ...prev, requiredElements: newElements };
      } else {
        // Add element if not already selected
        return { ...prev, requiredElements: [...prev.requiredElements, elementId] };
      }
    });
  };

  // Create a new poll
  const createNewPoll = () => {
    if (!selectedGroup) return;

    // Create a new poll
    const newPoll = {
      id: `poll${selectedGroup.polls.length + 1}`,
      title: 'New Poll',
      description: 'Please vote on this poll',
      options: [
        { id: 'opt1', text: 'Option 1', votes: [] },
        { id: 'opt2', text: 'Option 2', votes: [] },
      ],
      createdBy: currentUser.uid,
      createdAt: new Date(),
      expiresAt: addDays(new Date(), 7),
      status: 'active',
    };

    // Update polls in the selected group
    const updatedPolls = [...selectedGroup.polls, newPoll];

    // Update activity feed
    const updatedActivityFeed = [
      {
        type: 'poll_created',
        userId: currentUser.uid,
        timestamp: new Date(),
        details: `Created a poll: ${newPoll.title}`,
      },
      ...selectedGroup.activityFeed,
    ];

    // Update group in state
    setSelectedGroup({
      ...selectedGroup,
      polls: updatedPolls,
      activityFeed: updatedActivityFeed,
    });

    // Show success message
    setSnackbarMessage('Poll created successfully');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        component="header"
        sx={{
          p: 2,
          backgroundColor: 'primary.main',
          color: 'primary.contrastText',
          boxShadow: 3,
          zIndex: 1,
        }}
      >
        <Typography variant="h5" component="h1" sx={{ fontFamily: 'Beatrice, Arial, sans-serif' }}>
          Group Orders
        </Typography>
      </Box>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        {/* Top Section - Tabs, Search, Create Button */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant={isMobile ? "scrollable" : "standard"}
                scrollButtons={isMobile ? "auto" : false}
                indicatorColor="primary"
                textColor="primary"
              >
                <Tab label="All Groups" />
                <Tab label="Active" />
                <Tab label="Completed" />
                <Tab label="Canceled" />
              </Tabs>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  placeholder="Search groups..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  size="small"
                  sx={{ flexGrow: 1 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateGroupOpen}
                >
                  Create Group
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Group List */}
        <Box>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredGroups.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>No groups found</Typography>
              <Typography variant="body1" color="textSecondary" paragraph>
                {searchQuery
                  ? "Try adjusting your search terms or filters"
                  : "You don't have any group orders yet"}
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateGroupOpen}
              >
                Create Your First Group
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {filteredGroups.map((group) => (
                <Grid item xs={12} md={6} key={group.id}>
                  <Card sx={{
                    height: '100%',
                    position: 'relative',
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            {group.name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Chip
                              label={group.eventType.charAt(0).toUpperCase() + group.eventType.slice(1)}
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ mr: 1 }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {format(new Date(group.eventDate), 'MMM d, yyyy')}
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton onClick={handleMenuOpen}>
                          <MoreVertIcon />
                        </IconButton>
                      </Box>

                      <Divider sx={{ mb: 2 }} />

                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Members
                          </Typography>
                          <AvatarGroup max={4} sx={{ justifyContent: 'flex-start' }}>
                            {group.members.map((member) => (
                              <Avatar
                                key={member.userId}
                                alt={member.name}
                                src={member.profileImage}
                                sx={{
                                  width: 32,
                                  height: 32,
                                  border: member.status === 'pending' ? '2px dashed #ccc' : undefined,
                                }}
                              />
                            ))}
                          </AvatarGroup>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Progress
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: '100%', mr: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={calculateProgress(group)}
                                sx={{ height: 8, borderRadius: 4 }}
                              />
                            </Box>
                            <Box minWidth={35}>
                              <Typography variant="body2" color="text.secondary">
                                <ProgressLabel value={calculateProgress(group)}>
                                  {calculateProgress(group)}%
                                </ProgressLabel>
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>

                      <Box sx={{ mt: 2 }}>
                        {getNextMilestone(group) && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TimeIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                              Next: {getNextMilestone(group).milestone} — Due {format(new Date(getNextMilestone(group).dueDate), 'MMM d')}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          endIcon={<ArrowForwardIcon />}
                          onClick={() => handleViewDetails(group)}
                        >
                          View Details
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Box>

      {/* Group Details Dialog */}
      <Dialog
        open={groupDetailsOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        scroll="paper"
      >
        {selectedGroup && (
          <>
            <DialogTitle sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              p: 2,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {isMobile && (
                  <IconButton
                    edge="start"
                    color="inherit"
                    onClick={handleCloseDetails}
                    aria-label="close"
                    sx={{ mr: 1 }}
                  >
                    <ArrowBackIcon />
                  </IconButton>
                )}
                <Box>
                  <Typography variant="h6">
                    {selectedGroup.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip
                      label={selectedGroup.eventType.charAt(0).toUpperCase() + selectedGroup.eventType.slice(1)}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Event Date: {format(new Date(selectedGroup.eventDate), 'MMMM d, yyyy')}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              {!isMobile && (
                <IconButton
                  edge="end"
                  color="inherit"
                  onClick={handleCloseDetails}
                  aria-label="close"
                >
                  <CloseIcon />
                </IconButton>
              )}
            </DialogTitle>

            <Box sx={{ pl: 2, pr: 2, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={activeView}
                onChange={(e, newValue) => setActiveView(newValue)}
                variant={isMobile ? "scrollable" : "standard"}
                scrollButtons={isMobile ? "auto" : false}
                indicatorColor="primary"
                textColor="primary"
              >
                <Tab label="Overview" value="overview" />
                <Tab label="Members" value="members" />
                <Tab label="Timeline" value="timeline" />
                <Tab label="Style Coordination" value="styles" />
                <Tab label="Polls" value="polls" />
              </Tabs>
            </Box>

            <DialogContent dividers sx={{ p: 0 }}>
              {activeView === 'overview' && (
                <Box sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    {/* Group Summary */}
                    <Grid item xs={12} md={4}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent>
                          <Typography variant="subtitle1" gutterBottom>
                            Group Summary
                          </Typography>

                          <List dense disablePadding>
                            <ListItem disableGutters>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <GroupIcon fontSize="small" color="action" />
                              </ListItemIcon>
                              <ListItemText
                                primary={`${selectedGroup.members.length} Members`}
                                secondary={`${selectedGroup.members.filter(m => m.status === 'active').length} Active, ${selectedGroup.members.filter(m => m.status === 'pending').length} Pending`}
                              />
                            </ListItem>

                            <ListItem disableGutters>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <EventIcon fontSize="small" color="action" />
                              </ListItemIcon>
                              <ListItemText
                                primary={`Created ${formatDistance(new Date(selectedGroup.members.find(m => m.role === 'organizer')?.joinedAt), new Date(), { addSuffix: true })}`}
                                secondary={`by ${selectedGroup.members.find(m => m.role === 'organizer')?.name}`}
                              />
                            </ListItem>

                            <ListItem disableGutters>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <TimeIcon fontSize="small" color="action" />
                              </ListItemIcon>
                              <ListItemText
                                primary={`${formatDistance(new Date(selectedGroup.eventDate), new Date(), { addSuffix: true })}`}
                                secondary={`${isAfter(new Date(selectedGroup.eventDate), new Date()) ? 'Days until event' : 'Days since event'}: ${Math.abs(Math.round((new Date(selectedGroup.eventDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}`}
                              />
                            </ListItem>
                          </List>

                          <Divider sx={{ my: 2 }} />

                          <Typography variant="subtitle2" gutterBottom>
                            Progress: {calculateProgress(selectedGroup)}%
                          </Typography>

                          <LinearProgress
                            variant="determinate"
                            value={calculateProgress(selectedGroup)}
                            sx={{ height: 8, borderRadius: 4, mb: 2 }}
                          />

                          {getNextMilestone(selectedGroup) && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <TimeIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                              <Typography variant="body2">
                                Next: {getNextMilestone(selectedGroup).milestone}
                              </Typography>
                            </Box>
                          )}

                          <Divider sx={{ my: 2 }} />

                          {selectedGroup.notes && (
                            <>
                              <Typography variant="subtitle2" gutterBottom>
                                Notes
                              </Typography>
                              <Typography variant="body2">
                                {selectedGroup.notes}
                              </Typography>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Activity Feed */}
                    <Grid item xs={12} md={8}>
                      <Card sx={{ height: '100%', overflow: 'auto' }}>
                        <CardContent>
                          <Typography variant="subtitle1" gutterBottom>
                            Activity Feed
                          </Typography>

                          <List>
                            {selectedGroup.activityFeed.map((activity, index) => {
                              const member = selectedGroup.members.find(m => m.userId === activity.userId);

                              return (
                                <React.Fragment key={index}>
                                  <ListItem alignItems="flex-start">
                                    <ListItemAvatar>
                                      <Avatar alt={member?.name || 'User'} src={member?.profileImage} />
                                    </ListItemAvatar>
                                    <ListItemText
                                      primary={
                                        <Typography variant="subtitle2" component="span">
                                          {member?.name || 'Unknown User'}
                                        </Typography>
                                      }
                                      secondary={
                                        <>
                                          <Typography variant="body2" component="span" color="text.primary">
                                            {activity.details}
                                          </Typography>
                                          <Typography variant="caption" component="div" color="text.secondary">
                                            {formatDistance(new Date(activity.timestamp), new Date(), { addSuffix: true })}
                                          </Typography>
                                        </>
                                      }
                                    />
                                  </ListItem>
                                  {index < selectedGroup.activityFeed.length - 1 && <Divider variant="inset" component="li" />}
                                </React.Fragment>
                              );
                            })}
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Quick Actions */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom>
                        Quick Actions
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}>
                          <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<PersonAddIcon />}
                            onClick={handleInviteMemberOpen}
                            sx={{
                              justifyContent: 'flex-start',
                              p: 1.5,
                            }}
                          >
                            Invite Members
                          </Button>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<ColorIcon />}
                            onClick={handleStyleCoordinationOpen}
                            sx={{
                              justifyContent: 'flex-start',
                              p: 1.5,
                            }}
                          >
                            Style Preferences
                          </Button>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<PollIcon />}
                            onClick={createNewPoll}
                            sx={{
                              justifyContent: 'flex-start',
                              p: 1.5,
                            }}
                          >
                            Create Poll
                          </Button>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<MessageIcon />}
                            onClick={() => navigate(`/messages?groupId=${selectedGroup.id}`)}
                            sx={{
                              justifyContent: 'flex-start',
                              p: 1.5,
                            }}
                          >
                            Group Chat
                          </Button>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {activeView === 'members' && (
                <Box sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6">
                      Members ({selectedGroup.members.length})
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<PersonAddIcon />}
                      onClick={handleInviteMemberOpen}
                    >
                      Invite Members
                    </Button>
                  </Box>

                  <Typography variant="subtitle2" gutterBottom>
                    Organizer
                  </Typography>

                  <List>
                    {selectedGroup.members.filter(m => m.role === 'organizer').map((member) => (
                      <ListItem key={member.userId}>
                        <ListItemAvatar>
                          <Avatar alt={member.name} src={member.profileImage} />
                        </ListItemAvatar>
                        <ListItemText
                          primary={member.name}
                          secondary={member.email}
                        />
                        <ListItemSecondaryAction>
                          <Chip
                            label="Organizer"
                            color="primary"
                            size="small"
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle2" gutterBottom>
                    Active Members
                  </Typography>

                  <List>
                    {selectedGroup.members.filter(m => m.role === 'member' && m.status === 'active').map((member) => (
                      <ListItem key={member.userId}>
                        <ListItemAvatar>
                          <Avatar alt={member.name} src={member.profileImage} />
                        </ListItemAvatar>
                        <ListItemText
                          primary={member.name}
                          secondary={member.email}
                        />
                        <ListItemSecondaryAction>
                          {member.orderId ? (
                            <Chip
                              label="Order Placed"
                              color="success"
                              size="small"
                              icon={<CheckCircleIcon />}
                            />
                          ) : (
                            <Chip
                              label="No Order"
                              variant="outlined"
                              size="small"
                            />
                          )}
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>

                  {selectedGroup.members.some(m => m.status === 'pending') && (
                    <>
                      <Divider sx={{ my: 2 }} />

                      <Typography variant="subtitle2" gutterBottom>
                        Pending Invitations
                      </Typography>

                      <List>
                        {selectedGroup.members.filter(m => m.status === 'pending').map((member) => (
                          <ListItem key={member.userId}>
                            <ListItemAvatar>
                              <Avatar alt={member.name} src={member.profileImage} />
                            </ListItemAvatar>
                            <ListItemText
                              primary={member.name}
                              secondary={member.email}
                            />
                            <ListItemSecondaryAction>
                              <Chip
                                label="Pending"
                                color="warning"
                                size="small"
                                icon={<PendingIcon />}
                              />
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    </>
                  )}
                </Box>
              )}

              {activeView === 'timeline' && (
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Project Timeline
                  </Typography>

                  <Box sx={{ mb: 4 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Overall Progress
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={calculateProgress(selectedGroup)}
                          sx={{ height: 10, borderRadius: 5 }}
                        />
                      </Box>
                      <Box minWidth={40}>
                        <Typography variant="body2" color="text.secondary">
                          <ProgressLabel value={calculateProgress(selectedGroup)}>
                            {calculateProgress(selectedGroup)}%
                          </ProgressLabel>
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Stepper orientation="vertical">
                    {selectedGroup.timeline.map((milestone, index) => (
                      <Step key={index} active={milestone.completed || index === selectedGroup.timeline.findIndex(m => !m.completed)} completed={milestone.completed}>
                        <StepLabel
                          optional={
                            <Typography variant="caption">
                              Due: {format(new Date(milestone.dueDate), 'MMM d, yyyy')}
                            </Typography>
                          }
                        >
                          {milestone.milestone}
                        </StepLabel>
                        <Box sx={{ ml: 3, mb: 3, mt: 1 }}>
                          {milestone.completed ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
                              <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} />
                              <Typography variant="body2">
                                Completed on {format(new Date(milestone.completedDate), 'MMMM d, yyyy')}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              {isBefore(new Date(milestone.dueDate), new Date())
                                ? 'Overdue'
                                : `${Math.round((new Date(milestone.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining`}
                            </Typography>
                          )}
                        </Box>
                      </Step>
                    ))}
                  </Stepper>

                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Typography variant="caption" color="text.secondary" align="center">
                      Event Date: {format(new Date(selectedGroup.eventDate), 'MMMM d, yyyy')} ({formatDistance(new Date(selectedGroup.eventDate), new Date(), { addSuffix: true })})
                    </Typography>
                  </Box>
                </Box>
              )}

              {activeView === 'styles' && (
                <Box sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6">
                      Style Coordination
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<EditIcon />}
                      onClick={handleStyleCoordinationOpen}
                    >
                      Edit Style Preferences
                    </Button>
                  </Box>

                  {selectedGroup.sharedStyles.colorPalette && selectedGroup.sharedStyles.colorPalette.length > 0 ? (
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Color Palette
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        {selectedGroup.sharedStyles.colorPalette.map((color, index) => (
                          <Box key={index}>
                            <Box
                              sx={{
                                width: 60,
                                height: 60,
                                backgroundColor: color,
                                borderRadius: 1,
                                mb: 1,
                              }}
                            />
                            <Typography variant="caption" align="center" display="block">
                              {colorOptions.find(c => c.value === color)?.name || color}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Color Palette
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        No color palette has been selected yet.
                      </Typography>
                    </Box>
                  )}

                  {selectedGroup.sharedStyles.fabrics && selectedGroup.sharedStyles.fabrics.length > 0 ? (
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Selected Fabrics
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        {selectedGroup.sharedStyles.fabrics.map((fabricId, index) => {
                          const fabric = fabricOptions.find(f => f.id === fabricId);
                          return fabric ? (
                            <Box key={index}>
                              <Box
                                sx={{
                                  width: 80,
                                  height: 80,
                                  backgroundImage: `url(${fabric.image})`,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                  borderRadius: 1,
                                  mb: 1,
                                }}
                              />
                              <Typography variant="caption" align="center" display="block">
                                {fabric.name}
                              </Typography>
                            </Box>
                          ) : null;
                        })}
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Selected Fabrics
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        No fabrics have been selected yet.
                      </Typography>
                    </Box>
                  )}

                  {selectedGroup.sharedStyles.requiredElements && selectedGroup.sharedStyles.requiredElements.length > 0 ? (
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        Required Elements
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {selectedGroup.sharedStyles.requiredElements.map((element, index) => (
                          <Chip
                            key={index}
                            label={element}
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>
                  ) : (
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        Required Elements
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        No required elements have been specified yet.
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              {activeView === 'polls' && (
                <Box sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6">
                      Polls & Voting
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<PollIcon />}
                      onClick={createNewPoll}
                    >
                      Create New Poll
                    </Button>
                  </Box>

                  {selectedGroup.polls && selectedGroup.polls.length > 0 ? (
                    selectedGroup.polls.map((poll, index) => (
                      <Card key={index} sx={{ mb: 3 }}>
                        <CardContent>
                          <Typography variant="subtitle1" gutterBottom>
                            {poll.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {poll.description}
                          </Typography>

                          <Box sx={{ mb: 2 }}>
                            {poll.options.map((option, optIndex) => {
                              const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes.length, 0);
                              const percentage = totalVotes > 0 ? Math.round((option.votes.length / totalVotes) * 100) : 0;
                              const userVoted = option.votes.includes(currentUser.uid);

                              return (
                                <Box key={optIndex} sx={{ mb: 1 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                    <Typography variant="body2" sx={{ flexGrow: 1 }}>
                                      {option.text}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {option.votes.length} {option.votes.length === 1 ? 'vote' : 'votes'} ({percentage}%)
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Box
                                      sx={{
                                        flexGrow: 1,
                                        height: 8,
                                        borderRadius: 4,
                                        bgcolor: 'action.hover',
                                        position: 'relative',
                                        overflow: 'hidden',
                                      }}
                                    >
                                      <Box
                                        sx={{
                                          position: 'absolute',
                                          top: 0,
                                          left: 0,
                                          height: '100%',
                                          width: `${percentage}%`,
                                          bgcolor: userVoted ? 'primary.main' : 'grey.400',
                                          borderRadius: 4,
                                        }}
                                      />
                                    </Box>
                                    <Button
                                      size="small"
                                      variant={userVoted ? "contained" : "outlined"}
                                      onClick={() => handleVotePoll(option.id)}
                                      sx={{ ml: 2, minWidth: 60 }}
                                    >
                                      {userVoted ? "Voted" : "Vote"}
                                    </Button>
                                  </Box>
                                </Box>
                              );
                            })}
                          </Box>

                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                              Created by {selectedGroup.members.find(m => m.userId === poll.createdBy)?.name || 'Unknown'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Expires {format(new Date(poll.expiresAt), 'MMM d, yyyy')}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body1" paragraph>
                        No polls have been created yet.
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Create polls to gather opinions from group members on styles, fabrics, and other preferences.
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<PollIcon />}
                        onClick={createNewPoll}
                      >
                        Create First Poll
                      </Button>
                    </Box>
                  )}
                </Box>
              )}
            </DialogContent>

            <DialogActions sx={{
              p: 2,
              borderTop: 1,
              borderColor: 'divider',
              display: 'flex',
              justifyContent: 'space-between',
            }}>
              <Button
                onClick={handleCloseDetails}
                startIcon={<ArrowBackIcon />}
              >
                Back to Groups
              </Button>

              <Box>
                <Button
                  color="primary"
                  onClick={() => navigate(`/messages?groupId=${selectedGroup.id}`)}
                  startIcon={<MessageIcon />}
                  sx={{ mr: 1 }}
                >
                  Group Chat
                </Button>

                {selectedGroup.members.find(m => m.userId === currentUser.uid)?.orderId ? (
                  <Button
                    variant="contained"
                    onClick={() => navigate(`/orders/${selectedGroup.members.find(m => m.userId === currentUser.uid)?.orderId}`)}
                  >
                    View My Order
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={() => navigate(`/orders/new?groupId=${selectedGroup.id}`)}
                  >
                    Place Order
                  </Button>
                )}
              </Box>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Create Group Dialog */}
      <Dialog
        open={createGroupOpen}
        onClose={handleCreateGroupClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Group</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              label="Group Name"
              fullWidth
              required
              value={newGroup.name}
              onChange={(e) => handleNewGroupChange('name', e.target.value)}
              margin="normal"
              placeholder="e.g., Johnson Wedding Party"
            />

            <FormControl fullWidth margin="normal">
              <InputLabel id="event-type-label">Event Type</InputLabel>
              <Select
                labelId="event-type-label"
                value={newGroup.eventType}
                label="Event Type"
                onChange={(e) => handleNewGroupChange('eventType', e.target.value)}
              >
                <MenuItem value="wedding">Wedding</MenuItem>
                <MenuItem value="corporate">Corporate</MenuItem>
                <MenuItem value="performance">Performance</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Event Date"
              type="date"
              fullWidth
              required
              value={newGroup.eventDate}
              onChange={(e) => handleNewGroupChange('eventDate', e.target.value)}
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />

            <TextField
              label="Notes"
              fullWidth
              multiline
              rows={3}
              value={newGroup.notes}
              onChange={(e) => handleNewGroupChange('notes', e.target.value)}
              margin="normal"
              placeholder="Add any details about the event or style requirements"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateGroupClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateGroup}
            disabled={!newGroup.name || !newGroup.eventDate}
          >
            Create Group
          </Button>
        </DialogActions>
      </Dialog>

      {/* Invite Members Dialog */}
      <Dialog
        open={inviteMemberOpen}
        onClose={handleInviteMemberClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Invite Members</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              label="Email Addresses"
              fullWidth
              required
              value={newInvite.emails}
              onChange={(e) => handleNewInviteChange('emails', e.target.value)}
              margin="normal"
              placeholder="Enter email addresses separated by commas"
              helperText="You can enter multiple email addresses separated by commas"
            />

            <TextField
              label="Message"
              fullWidth
              multiline
              rows={4}
              value={newInvite.message}
              onChange={(e) => handleNewInviteChange('message', e.target.value)}
              margin="normal"
              placeholder="Add a personal message to your invitation"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleInviteMemberClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleInviteMembers}
            disabled={!newInvite.emails}
            startIcon={<EmailIcon />}
          >
            Send Invitations
          </Button>
        </DialogActions>
      </Dialog>

      {/* Style Coordination Dialog */}
      <Dialog
        open={styleCoordinationOpen}
        onClose={handleStyleCoordinationClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Style Coordination</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              Select Color Palette (up to 4 colors)
            </Typography>
            <Grid container spacing={1} sx={{ mb: 3 }}>
              {colorOptions.map((color) => (
                <Grid item key={color.id}>
                  <Box sx={{ textAlign: 'center' }}>
                    <ColorSwatch
                      color={color.value}
                      selected={styleSelection.selectedColors.includes(color.value)}
                      onClick={() => handleColorToggle(color.id)}
                    />
                    <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                      {color.name}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle1" gutterBottom>
              Select Fabrics (up to 3)
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {fabricOptions.map((fabric) => (
                <Grid item key={fabric.id}>
                  <Box sx={{ textAlign: 'center' }}>
                    <FabricSwatch
                      image={fabric.image}
                      selected={styleSelection.selectedFabrics.includes(fabric.id)}
                      onClick={() => handleFabricToggle(fabric.id)}
                    />
                    <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                      {fabric.name}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle1" gutterBottom>
              Required Elements
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Select the elements that all group members should include in their orders for a coordinated look.
            </Typography>
            <Grid container spacing={2}>
              {requiredElementOptions.map((element) => (
                <Grid item xs={12} sm={6} key={element.id}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={styleSelection.requiredElements.includes(element.id)}
                        onChange={() => handleRequiredElementToggle(element.id)}
                      />
                    }
                    label={element.name}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleStyleCoordinationClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveStyles}
            startIcon={<ColorIcon />}
          >
            Save Style Preferences
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Poll Dialog (Not used since polls are embedded in the main view) */}

      {/* Menu (For actions on group card) */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          View Details
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          Message Group
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          Edit Group
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          Leave Group
        </MenuItem>
      </Menu>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GroupOrdersPage;