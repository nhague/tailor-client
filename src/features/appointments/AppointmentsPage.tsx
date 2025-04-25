import React, { useState, useEffect, useCallback, FC } from 'react';
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
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Select,
  MenuItem,
  InputLabel,
  Snackbar,
  Alert,
  useMediaQuery,
  Badge,
  Avatar,
  ListItemText,
  ListItem,
  List,
  ListItemIcon, // Added ListItemIcon
  SelectChangeEvent,
  Theme,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import {
  CalendarMonth as CalendarIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
  ArrowForward as ArrowForwardIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Event as EventIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  ArrowBack as BackIcon,
  Message as MessageIcon,
  VideoCall as VideoCallIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';
import {
  format,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfDay,
  addDays,
  parseISO,
  isWithinInterval,
  formatDistance,
  isBefore,
  isAfter,
  addHours,
  setHours,
  setMinutes,
  setSeconds,
  getHours,
  getMinutes,
  addMinutes,
  getDay,
} from 'date-fns';
import { useAuth } from '../../contexts/AuthContext'; // Updated path
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase'; // Updated path
import { useNavigate, useLocation } from 'react-router-dom';
import { Appointment, AvailableSlot, TailorTravelLocation } from '../../types/appointment'; // Updated path

// --- Interfaces for Component Props ---

interface MonthCalendarViewProps {
  currentDate: Date;
  appointments: Appointment[];
  availableSlots: AvailableSlot[];
  onDateClick: (date: Date) => void;
  onMonthChange: (date: Date) => void;
  selectedDate: Date | null;
}

interface WeeklyViewProps {
  selectedDate: Date;
  appointments: Appointment[];
  availableSlots: AvailableSlot[];
  onTimeSlotClick: (slot: AvailableSlot) => void;
}

interface DayViewProps {
  selectedDate: Date;
  appointments: Appointment[];
  availableSlots: AvailableSlot[];
  onTimeSlotClick: (slot: AvailableSlot) => void;
}

interface NewAppointmentState {
  purpose: Appointment['purpose'];
  location: Appointment['location'];
  selectedDate: Date;
  selectedTime: Date;
  duration: number;
  notes: string;
}

// --- Styled Components ---

const ListViewItem = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  transition: 'transform 0.2s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[3],
  },
}));

// --- Sub-Components ---

// Month calendar view component
const MonthCalendarView: FC<MonthCalendarViewProps> = ({
  currentDate,
  appointments,
  availableSlots,
  onDateClick,
  onMonthChange,
  selectedDate
}) => {
  const theme = useTheme();

  const renderHeader = () => {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2
      }}>
        <IconButton onClick={() => onMonthChange(subMonths(currentDate, 1))}>
          <PrevIcon />
        </IconButton>
        <Typography variant="h6">
          {format(currentDate, 'MMMM yyyy')}
        </Typography>
        <IconButton onClick={() => onMonthChange(addMonths(currentDate, 1))}>
          <NextIcon />
        </IconButton>
      </Box>
    );
  };

  const renderDays = () => {
    const days: JSX.Element[] = [];
    const dateFormat = 'EEE';
    let startDate = startOfWeek(currentDate);

    for (let i = 0; i < 7; i++) {
      days.push(
        <Box key={i} sx={{ width: '14.2%', textAlign: 'center' }}>
          <Typography variant="subtitle2" color="text.secondary">
            {format(addDays(startDate, i), dateFormat)}
          </Typography>
        </Box>
      );
    }

    return <Box sx={{ display: 'flex', mb: 1 }}>{days}</Box>;
  };

  const renderCells = () => {
    const monthStart = startOfDay(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows: JSX.Element[] = [];
    let days: JSX.Element[] = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = new Date(day);
        // Count appointments for this day
        const dayAppointments = appointments.filter(a =>
          isSameDay(new Date(a.dateTime), cloneDay)
        );

        // Check if there are available slots for this day
        const dayHasAvailableSlots = availableSlots.some(slot =>
          isSameDay(new Date(slot.date), cloneDay) && !slot.booked
        );

        const isCurrentMonth = isSameMonth(day, monthStart);
        const isToday = isSameDay(day, new Date());
        const isSelected = selectedDate && isSameDay(day, selectedDate);

        days.push(
          <Box
            key={day.toString()}
            sx={{
              width: '14.2%',
              height: { xs: 60, md: 80 },
              border: 1,
              borderColor: 'divider',
              p: 1,
              position: 'relative',
              backgroundColor: isSelected
                ? theme.palette.primary.light
                : isToday
                  ? theme.palette.action.hover
                  : isCurrentMonth
                    ? theme.palette.background.paper
                    : theme.palette.action.disabledBackground,
              color: !isCurrentMonth
                ? theme.palette.text.disabled
                : isSelected
                  ? theme.palette.primary.contrastText
                  : theme.palette.text.primary,
              cursor: isCurrentMonth ? 'pointer' : 'default',
              '&:hover': {
                backgroundColor: isCurrentMonth ? (isSelected
                  ? theme.palette.primary.light
                  : theme.palette.action.hover) : undefined,
              },
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={() => isCurrentMonth && onDateClick(cloneDay)}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: isToday ? 'bold' : 'normal',
                textAlign: 'right',
                width: '100%',
              }}
            >
              {format(day, 'd')}
            </Typography>

            {dayAppointments.length > 0 && (
              <Chip
                label={dayAppointments.length}
                size="small"
                color="primary"
                sx={{
                  height: 20,
                  fontSize: '0.7rem',
                  width: 'fit-content',
                  mt: 'auto',
                  ml: 'auto', // Align chip to the bottom right
                }}
              />
            )}

            {dayHasAvailableSlots && isCurrentMonth && dayAppointments.length === 0 && (
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: 'success.main',
                  mt: 'auto',
                  ml: 'auto', // Align dot to the bottom right
                }}
              />
            )}
          </Box>
        );

        day = addDays(day, 1);
      }

      rows.push(
        <Box key={day.toString()} sx={{ display: 'flex' }}>
          {days}
        </Box>
      );

      days = [];
    }

    return <Box>{rows}</Box>;
  };

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </Paper>
  );
};

// Weekly view component
const WeeklyView: FC<WeeklyViewProps> = ({
  selectedDate,
  appointments,
  availableSlots,
  onTimeSlotClick
}) => {
  const theme = useTheme();
  const [visibleHours] = useState<number[]>([9, 10, 11, 12, 13, 14, 15, 16, 17, 18]); // 9 AM to 6 PM

  const renderTimeSlots = () => {
    // Generate days of the week starting from selectedDate
    const daysOfWeek: Date[] = [];
    const startDay = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Start from Monday

    for (let i = 0; i < 7; i++) {
      daysOfWeek.push(addDays(startDay, i));
    }

    return (
      <Box>
        {/* Header with day names */}
        <Box sx={{ display: 'flex', borderBottom: 1, borderColor: 'divider', mb: 1 }}>
          <Box sx={{ width: 80 }} /> {/* Empty space for time column */}
          {daysOfWeek.map((day, index) => (
            <Box
              key={index}
              sx={{
                flex: 1,
                textAlign: 'center',
                py: 1,
                backgroundColor: isSameDay(day, new Date()) ? theme.palette.action.hover : 'transparent',
                fontWeight: isSameDay(day, selectedDate) ? 'bold' : 'normal',
              }}
            >
              <Typography variant="subtitle2">
                {format(day, 'EEE')}
              </Typography>
              <Typography variant="body2">
                {format(day, 'd')}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Time slots */}
        {visibleHours.map(hour => (
          <Box key={hour} sx={{ display: 'flex', mb: 1 }}>
            <Box
              sx={{
                width: 80,
                textAlign: 'right',
                pr: 1,
                pt: 1,
                borderRight: 1,
                borderColor: 'divider',
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {format(setHours(new Date(), hour), 'h:mm a')}
              </Typography>
            </Box>

            {daysOfWeek.map((day, index) => {
              // Check for appointments at this time slot
              const timeSlotStart = setHours(setMinutes(day, 0), hour);
              const timeSlotEnd = addHours(timeSlotStart, 1);

              const appointmentsInSlot = appointments.filter(a => {
                const appointmentTime = new Date(a.dateTime);
                return isWithinInterval(appointmentTime, {
                  start: timeSlotStart,
                  end: timeSlotEnd
                });
              });

              // Check for available slots
              const availableInSlot = availableSlots.filter(slot => {
                const slotTime = new Date(slot.date);
                return isWithinInterval(slotTime, {
                  start: timeSlotStart,
                  end: timeSlotEnd
                }) && !slot.booked;
              });

              return (
                <Box
                  key={index}
                  sx={{
                    flex: 1,
                    height: 60,
                    border: 1,
                    borderColor: 'divider',
                    position: 'relative',
                    backgroundColor: isSameDay(day, selectedDate)
                      ? theme.palette.action.selected
                      : 'transparent',
                  }}
                >
                  {appointmentsInSlot.map((appointment, appIndex) => (
                    <Box
                      key={appIndex}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1,
                        p: 1,
                        borderRadius: 1,
                        m: '2px', // Small margin
                      }}
                    >
                      <Typography variant="caption" noWrap>
                        {appointment.purpose}
                      </Typography>
                    </Box>
                  ))}

                  {availableInSlot.length > 0 && appointmentsInSlot.length === 0 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        border: 2,
                        borderColor: 'success.main',
                        borderStyle: 'dashed',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: theme.palette.success.light,
                          opacity: 0.2,
                        },
                      }}
                      onClick={() => onTimeSlotClick(availableInSlot[0])}
                    />
                  )}
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Paper sx={{ p: 2, overflow: 'auto', height: '100%', maxHeight: 600 }}>
      <Typography variant="subtitle1" gutterBottom>
        Week of {format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'MMM d, yyyy')}
      </Typography>
      {renderTimeSlots()}
    </Paper>
  );
};

// Day view component
const DayView: FC<DayViewProps> = ({
  selectedDate,
  appointments,
  availableSlots,
  onTimeSlotClick
}) => {
  const theme = useTheme();
  const visibleHours = Array.from({ length: 12 }, (_, i) => i + 9); // 9am to 8pm

  return (
    <Paper sx={{ p: 2, overflow: 'auto', height: '100%', maxHeight: 600 }}>
      <Typography variant="subtitle1" gutterBottom>
        {format(selectedDate, 'EEEE, MMMM d, yyyy')}
      </Typography>

      <Box sx={{ mt: 2 }}>
        {visibleHours.map(hour => {
          const timeSlotStart = setHours(setMinutes(selectedDate, 0), hour);
          const timeSlotEnd = addHours(timeSlotStart, 1);

          // Check for appointments in this hour
          const appointmentsInHour = appointments.filter(a => {
            const appointmentTime = new Date(a.dateTime);
            return isWithinInterval(appointmentTime, {
              start: timeSlotStart,
              end: timeSlotEnd
            });
          });

          // Check for available slots in this hour
          const availableInHour = availableSlots.filter(slot => {
            const slotTime = new Date(slot.date);
            return isWithinInterval(slotTime, {
              start: timeSlotStart,
              end: timeSlotEnd
            }) && !slot.booked;
          });

          return (
            <Box
              key={hour}
              sx={{
                display: 'flex',
                mb: 1,
                borderBottom: 1,
                borderColor: 'divider',
                py: 1,
              }}
            >
              <Box sx={{ width: 80, pr: 2, pt: 1 }}>
                <Typography variant="body2">
                  {format(setHours(new Date(), hour), 'h:mm a')}
                </Typography>
              </Box>

              <Box sx={{ flex: 1 }}>
                {appointmentsInHour.length > 0 ? (
                  appointmentsInHour.map((appointment, index) => (
                    <Box
                      key={index}
                      sx={{
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                        p: 1,
                        borderRadius: 1,
                        mb: 1,
                      }}
                    >
                      <Typography variant="subtitle2">
                        {appointment.purpose.charAt(0).toUpperCase() + appointment.purpose.slice(1)}
                      </Typography>
                      <Typography variant="caption" display="block">
                        {format(new Date(appointment.dateTime), 'h:mm a')}
                        {' - '}
                        {format(addMinutes(new Date(appointment.dateTime), appointment.duration), 'h:mm a')}
                      </Typography>
                      <Typography variant="caption" display="block">
                        {appointment.location.type === 'shop'
                          ? 'Tailor Shop'
                          : appointment.location.type === 'virtual'
                            ? 'Virtual Meeting'
                            : appointment.location.address}
                      </Typography>
                    </Box>
                  ))
                ) : availableInHour.length > 0 ? (
                  <Box
                    sx={{
                      p: 1,
                      border: 1,
                      borderColor: 'success.main',
                      borderStyle: 'dashed',
                      borderRadius: 1,
                      textAlign: 'center',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: theme.palette.success.light,
                        opacity: 0.2,
                      },
                    }}
                    onClick={() => onTimeSlotClick(availableInHour[0])}
                  >
                    <Typography variant="body2" color="success.main">
                      Available
                    </Typography>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      p: 1,
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="body2" color="text.disabled">
                      No availability
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};

// --- Main Appointments Page Component ---

const AppointmentsPage: FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { currentUser, userProfile } = useAuth(); // Use context
  const navigate = useNavigate();
  const location = useLocation();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [tailorTravelLocations, setTailorTravelLocations] = useState<TailorTravelLocation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'list' | 'month' | 'week' | 'day'>('list');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentDate, setCurrentDate] = useState<Date>(new Date()); // For month view navigation
  const [tabValue, setTabValue] = useState<number>(0); // 0: All, 1: Upcoming, 2: Past, 3: Canceled
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  const [newAppointmentOpen, setNewAppointmentOpen] = useState<boolean>(false);
  const [rescheduleOpen, setRescheduleOpen] = useState<boolean>(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState<boolean>(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<AvailableSlot | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'info' | 'warning' | 'error'>('success');

  // New appointment form state
  const initialNewAppointmentState: NewAppointmentState = {
    purpose: 'initial',
    location: { type: 'shop' },
    selectedDate: new Date(),
    selectedTime: setHours(setMinutes(new Date(), 0), 10), // Default to 10:00 AM
    duration: 60,
    notes: '',
  };
  const [newAppointment, setNewAppointment] = useState<NewAppointmentState>(initialNewAppointmentState);

  // Fetch appointments and available slots (using sample data for now)
  useEffect(() => {
    if (!currentUser) return;

    const fetchAppointmentsData = async () => {
      setLoading(true);
      try {
        // In a real implementation, this would query Firestore using 'db' from config
        // const appointmentsQuery = query(
        //   collection(db, 'appointments'),
        //   where('userId', '==', currentUser.uid),
        //   orderBy('dateTime'),
        // );
        // const appointmentsSnapshot = await getDocs(appointmentsQuery);
        // const appointmentsData = appointmentsSnapshot.docs.map(doc => {
        //   const data = doc.data();
        //   return {
        //     id: doc.id,
        //     ...data,
        //     dateTime: data.dateTime.toDate(), // Convert Firestore Timestamp to Date
        //   } as Appointment;
        // });

        // For demo purposes, use sample data
        const today = new Date();
        const tomorrow = addDays(today, 1);
        const nextWeek = addDays(today, 7);
        const twoWeeksFromNow = addDays(today, 14);
        const pastWeek = addDays(today, -7);

        const sampleAppointments: Appointment[] = [
          {
            id: 'appt1',
            userId: currentUser.uid,
            tailorId: 'tailor1',
            dateTime: setHours(setMinutes(tomorrow, 0), 14), // Tomorrow at 2:00 PM
            duration: 60, // 60 minutes
            location: {
              type: 'shop',
              address: '123 Tailor St, Phuket, Thailand',
              city: 'Phuket',
              country: 'Thailand',
              coordinates: {
                latitude: 7.8804,
                longitude: 98.3923,
              },
            },
            purpose: 'fitting',
            status: 'confirmed',
            notes: 'First fitting for the navy suit',
            relatedOrderId: 'ORD123456',
            reminderSettings: {
              sendReminder: true,
              reminderTime: 24, // 24 hours before
            },
          },
          {
            id: 'appt2',
            userId: currentUser.uid,
            tailorId: 'tailor1',
            dateTime: setHours(setMinutes(nextWeek, 0), 10), // Next week at 10:00 AM
            duration: 45, // 45 minutes
            location: {
              type: 'hotel',
              address: 'Grand Hotel, 456 Beach Road, Bangkok, Thailand',
              city: 'Bangkok',
              country: 'Thailand',
              coordinates: {
                latitude: 13.7563,
                longitude: 100.5018,
              },
            },
            purpose: 'consultation',
            status: 'scheduled',
            notes: 'Discussing fabric options for new shirts',
            reminderSettings: {
              sendReminder: true,
              reminderTime: 24, // 24 hours before
            },
          },
          {
            id: 'appt3',
            userId: currentUser.uid,
            tailorId: 'tailor1',
            dateTime: setHours(setMinutes(twoWeeksFromNow, 0), 16), // Two weeks from now at 4:00 PM
            duration: 30, // 30 minutes
            location: {
              type: 'virtual',
              // address, city, country, coordinates are optional/null for virtual
            },
            purpose: 'consultation',
            status: 'scheduled',
            notes: 'Virtual consultation for summer wardrobe planning',
            reminderSettings: {
              sendReminder: true,
              reminderTime: 1, // 1 hour before
            },
          },
          {
            id: 'appt4',
            userId: currentUser.uid,
            tailorId: 'tailor2',
            dateTime: setHours(setMinutes(pastWeek, 0), 11), // A week ago at 11:00 AM
            duration: 60, // 60 minutes
            location: {
              type: 'shop',
              address: '123 Tailor St, Phuket, Thailand',
              city: 'Phuket',
              country: 'Thailand',
              coordinates: {
                latitude: 7.8804,
                longitude: 98.3923,
              },
            },
            purpose: 'initial',
            status: 'completed',
            notes: 'Initial measurements for wedding suit',
            reminderSettings: {
              sendReminder: true,
              reminderTime: 24, // 24 hours before
            },
          },
        ];

        setAppointments(sampleAppointments);

        // Generate sample available slots
        const generateAvailableSlots = (): AvailableSlot[] => {
          const slots: AvailableSlot[] = [];
          const startDate = new Date();

          // Generate slots for the next 30 days
          for (let i = 1; i < 30; i++) {
            const date = addDays(startDate, i);

            // Skip weekends (Sunday=0, Saturday=6)
            if (getDay(date) === 0 || getDay(date) === 6) continue;

            // Add slots from 9 AM to 5 PM (exclusive of 5 PM)
            for (let hour = 9; hour < 17; hour++) {
              // Some random availability logic
              if (Math.random() > 0.7) {
                const slotStartTime = setHours(setMinutes(setSeconds(date, 0), 0), hour);
                slots.push({
                  id: `slot-${i}-${hour}`,
                  date: slotStartTime,
                  startTime: slotStartTime,
                  endTime: addHours(slotStartTime, 1),
                  booked: false,
                  appointmentId: null,
                });
              }
            }
          }

          // Mark slots that overlap with existing appointments as booked
          sampleAppointments.forEach(appointment => {
            const appointmentStart = new Date(appointment.dateTime);
            const appointmentEnd = addMinutes(appointmentStart, appointment.duration);

            slots.forEach(slot => {
              if (!slot.booked) { // Only check slots that are not already marked as booked
                const slotStart = slot.startTime;
                const slotEnd = slot.endTime;
                // Check for overlap: (SlotStart < ApptEnd) and (SlotEnd > ApptStart)
                if (isBefore(slotStart, appointmentEnd) && isAfter(slotEnd, appointmentStart)) {
                  slot.booked = true;
                  slot.appointmentId = appointment.id;
                }
              }
            });
          });

          return slots;
        };

        setAvailableSlots(generateAvailableSlots());

        // Sample tailor travel locations
        const sampleTravelLocations: TailorTravelLocation[] = [
          {
            id: 'travel1',
            destination: {
              city: 'Bangkok',
              country: 'Thailand',
              venue: 'Grand Hotel',
              address: '456 Beach Road, Bangkok, Thailand',
              coordinates: {
                latitude: 13.7563,
                longitude: 100.5018,
              },
            },
            startDate: addDays(today, 5), // 5 days from now
            endDate: addDays(today, 8), // 8 days from now
          },
          {
            id: 'travel2',
            destination: {
              city: 'Singapore',
              country: 'Singapore',
              venue: 'Luxury Hotel',
              address: '123 Orchard Road, Singapore',
              coordinates: {
                latitude: 1.3521,
                longitude: 103.8198,
              },
            },
            startDate: addDays(today, 15), // 15 days from now
            endDate: addDays(today, 18), // 18 days from now
          },
        ];

        setTailorTravelLocations(sampleTravelLocations);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        setSnackbarMessage('Error loading appointment data.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setLoading(false);
      }
    };

    fetchAppointmentsData();
  }, [currentUser]); // Dependency on currentUser

  // Handle URL params for appointment details
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const appointmentId = searchParams.get('appointmentId');

    if (appointmentId && appointments.length > 0 && !selectedAppointment) {
      const appointment = appointments.find(a => a.id === appointmentId);
      if (appointment) {
        setSelectedAppointment(appointment);
        setDetailsOpen(true);
      } else {
        // If appointment ID in URL is invalid, remove it
        searchParams.delete('appointmentId');
        navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
      }
    }
  }, [location.search, appointments, navigate, selectedAppointment]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleViewModeChange = (event: React.SyntheticEvent, newValue: 'list' | 'month' | 'week' | 'day' | null) => {
    if (newValue !== null) {
      setViewMode(newValue);
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    if (viewMode === 'month') {
      setViewMode('day'); // Switch to day view when a date is clicked in month view
    }
  };

  const handleMonthChange = (date: Date) => {
    setCurrentDate(date);
  };

  const handleTimeSlotClick = (slot: AvailableSlot) => {
    setSelectedTimeSlot(slot);
    setNewAppointment(prev => ({
      ...initialNewAppointmentState, // Reset form but keep selected slot info
      selectedDate: new Date(slot.date),
      selectedTime: new Date(slot.date),
    }));
    setNewAppointmentOpen(true);
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setDetailsOpen(true);

    // Update URL without refreshing
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('appointmentId', appointment.id);
    navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedAppointment(null);

    // Remove appointmentId from URL
    const searchParams = new URLSearchParams(location.search);
    searchParams.delete('appointmentId');
    navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
  };

  const handleNewAppointmentOpen = () => {
    setNewAppointment(initialNewAppointmentState); // Reset form
    setSelectedTimeSlot(null);
    setNewAppointmentOpen(true);
  };

  const handleNewAppointmentClose = () => {
    setNewAppointmentOpen(false);
    setSelectedTimeSlot(null);
  };

  const handleRescheduleOpen = () => {
    if (!selectedAppointment) return;

    setNewAppointment({
      purpose: selectedAppointment.purpose,
      location: { ...selectedAppointment.location },
      selectedDate: new Date(selectedAppointment.dateTime),
      selectedTime: new Date(selectedAppointment.dateTime),
      duration: selectedAppointment.duration,
      notes: selectedAppointment.notes || '',
    });

    setDetailsOpen(false); // Close details when opening reschedule
    setRescheduleOpen(true);
  };

  const handleRescheduleClose = () => {
    setRescheduleOpen(false);
    // Optionally reopen details if needed, or handle state appropriately
    // If rescheduling is cancelled, we might want to show the details again
    if (selectedAppointment) {
       setDetailsOpen(true);
    }
  };

  const handleCancelConfirmOpen = () => {
    setCancelConfirmOpen(true);
  };

  const handleCancelConfirmClose = () => {
    setCancelConfirmOpen(false);
  };

  const handleNewAppointmentChange = (field: keyof NewAppointmentState, value: any) => {
    setNewAppointment(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLocationTypeChange = (event: SelectChangeEvent<Appointment['location']['type']>) => {
    const type = event.target.value as Appointment['location']['type'];
    setNewAppointment(prev => ({
      ...prev,
      location: { type: type }, // Reset specific location details when type changes
    }));
  };

  const handleCreateAppointment = async () => {
    if (!currentUser) return;

    // Combine date and time
    const combinedDateTime = new Date(newAppointment.selectedDate);
    combinedDateTime.setHours(
      getHours(newAppointment.selectedTime),
      getMinutes(newAppointment.selectedTime),
      0, 0 // Set seconds and milliseconds to 0
    );

    const newAppointmentData: Omit<Appointment, 'id'> = { // Omit ID as it will be generated by Firestore
      userId: currentUser.uid,
      tailorId: 'tailor1', // Replace with actual tailor selection logic if needed
      dateTime: combinedDateTime,
      duration: newAppointment.duration,
      location: newAppointment.location,
      purpose: newAppointment.purpose,
      status: 'scheduled',
      notes: newAppointment.notes,
      reminderSettings: {
        sendReminder: true,
        reminderTime: 24, // Default reminder time
      },
      // relatedOrderId: undefined, // Add if applicable
    };

    setLoading(true); // Show loading indicator

    try {
      // --- Firestore Integration (Example - currently commented out) ---
      // const docRef = await addDoc(collection(db, 'appointments'), newAppointmentData);
      // const createdAppointment: Appointment = { ...newAppointmentData, id: docRef.id };

      // --- Sample Data Update ---
      const createdAppointment: Appointment = {
          ...newAppointmentData,
          id: `appt${appointments.length + 1}-${Date.now()}` // Simple unique ID for demo
      };
      setAppointments([...appointments, createdAppointment]);

      // Mark the selected time slot as booked (if applicable)
      if (selectedTimeSlot) {
        const updatedSlots = availableSlots.map(slot =>
          slot.id === selectedTimeSlot.id
            ? { ...slot, booked: true, appointmentId: createdAppointment.id }
            : slot
        );
        setAvailableSlots(updatedSlots);
      }

      // Close dialog and show success message
      handleNewAppointmentClose();
      setSnackbarMessage('Appointment scheduled successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

    } catch (error) {
      console.error("Error creating appointment:", error);
      setSnackbarMessage('Failed to schedule appointment.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = async () => {
    if (!selectedAppointment || !currentUser) return;

    // Combine date and time
    const combinedDateTime = new Date(newAppointment.selectedDate);
    combinedDateTime.setHours(
      getHours(newAppointment.selectedTime),
      getMinutes(newAppointment.selectedTime),
      0, 0
    );

    const updatedAppointmentData: Partial<Appointment> = {
      dateTime: combinedDateTime,
      duration: newAppointment.duration,
      location: newAppointment.location,
      purpose: newAppointment.purpose,
      notes: newAppointment.notes,
      status: 'rescheduled', // Mark as rescheduled
    };

    setLoading(true);

    try {
      // --- Firestore Integration (Example - currently commented out) ---
      // const appointmentRef = doc(db, 'appointments', selectedAppointment.id);
      // await updateDoc(appointmentRef, updatedAppointmentData);

      // --- Sample Data Update ---
      const updatedAppointments = appointments.map(appointment =>
        appointment.id === selectedAppointment.id
          ? { ...appointment, ...updatedAppointmentData } as Appointment // Ensure type safety
          : appointment
      );
      setAppointments(updatedAppointments);

      // Update the selected appointment state as well
      const newlySelectedAppointment = { ...selectedAppointment, ...updatedAppointmentData } as Appointment;
      setSelectedAppointment(newlySelectedAppointment);


      // Close dialogs and show success message
      setRescheduleOpen(false);
      setDetailsOpen(true); // Reopen details with updated info
      setSnackbarMessage('Appointment rescheduled successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      setSnackbarMessage('Failed to reschedule appointment.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment || !currentUser) return;

    setLoading(true);

    try {
      // --- Firestore Integration (Example - currently commented out) ---
      // const appointmentRef = doc(db, 'appointments', selectedAppointment.id);
      // await updateDoc(appointmentRef, { status: 'canceled' });

      // --- Sample Data Update ---
      const updatedAppointments: Appointment[] = appointments.map(appointment =>
        appointment.id === selectedAppointment.id
          ? { ...appointment, status: 'canceled' as const } // Ensure literal type
          : appointment
      );
      setAppointments(updatedAppointments);

      // Update selected appointment state
      setSelectedAppointment({ ...selectedAppointment, status: 'canceled' });

      // Close dialogs and show success message
      setCancelConfirmOpen(false);
      // Keep details open to show the canceled status, or close it:
      // setDetailsOpen(false);
      setSnackbarMessage('Appointment canceled successfully');
      setSnackbarSeverity('info');
      setSnackbarOpen(true);

    } catch (error) {
      console.error("Error canceling appointment:", error);
      setSnackbarMessage('Failed to cancel appointment.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };


  const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const getStatusColor = (status: Appointment['status']): string => {
    switch (status) {
      case 'scheduled':
        return theme.palette.info.main;
      case 'confirmed':
        return theme.palette.success.main;
      case 'completed':
        return theme.palette.success.dark;
      case 'canceled':
        return theme.palette.error.main;
      case 'rescheduled':
        return theme.palette.warning.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getPurposeIcon = (purpose: Appointment['purpose']): JSX.Element => {
    switch (purpose) {
      case 'initial':
        return <EventIcon />;
      case 'fitting':
        return <EventIcon />; // Consider different icons later
      case 'consultation':
        return <EventIcon />; // Maybe MessageIcon?
      case 'pickup':
        return <EventIcon />; // Maybe CheckCircleIcon?
      default:
        return <EventIcon />;
    }
  };

  // Filter appointments based on tab value
  const getFilteredAppointments = useCallback((): Appointment[] => {
    const now = new Date();

    switch (tabValue) {
      case 0: // All appointments
        return [...appointments].sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()); // Sort descending
      case 1: // Upcoming appointments
        return appointments
          .filter(appointment =>
            isAfter(new Date(appointment.dateTime), now) &&
            appointment.status !== 'canceled' &&
            appointment.status !== 'completed'
          )
          .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()); // Sort ascending
      case 2: // Past appointments
        return appointments
          .filter(appointment =>
            isBefore(new Date(appointment.dateTime), now) ||
            appointment.status === 'completed'
          )
          .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()); // Sort descending
      case 3: // Canceled appointments
        return appointments
          .filter(appointment =>
            appointment.status === 'canceled'
          )
          .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()); // Sort descending
      default:
        return appointments;
    }
  }, [appointments, tabValue]);

  const filteredAppointments = getFilteredAppointments();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}> {/* Adjust height based on header */}
        {/* Header (Assuming Layout provides header, otherwise add one here) */}
        {/* Example Header if not using Layout: */}
        {/* <Box component="header" sx={{ p: 2, backgroundColor: 'primary.main', color: 'primary.contrastText', boxShadow: 3, zIndex: 1 }}>
          <Typography variant="h5" component="h1">My Appointments</Typography>
        </Box> */}

        {/* Main Content */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: { xs: 1, sm: 2, md: 3 } }}>
          {/* Actions Bar */}
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center" justifyContent="space-between">
              <Grid item xs={12} md="auto">
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  variant={isMobile ? "scrollable" : "standard"}
                  scrollButtons={isMobile ? "auto" : false}
                  allowScrollButtonsMobile
                  indicatorColor="primary"
                  textColor="primary"
                >
                  <Tab label="All" />
                  <Tab label="Upcoming" />
                  <Tab label="Past" />
                  <Tab label="Canceled" />
                </Tabs>
              </Grid>
              <Grid item xs={12} md="auto">
                <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'space-between', md: 'flex-end' }, alignItems: 'center', width: '100%' }}>
                   <Tabs
                      value={viewMode}
                      onChange={handleViewModeChange}
                      indicatorColor="secondary"
                      textColor="secondary"
                      variant="scrollable"
                      scrollButtons="auto"
                      allowScrollButtonsMobile
                      aria-label="appointment view modes"
                    >
                      <Tab label="List" value="list" />
                      <Tab label="Month" value="month" />
                      <Tab label="Week" value="week" />
                      <Tab label="Day" value="day" />
                    </Tabs>

                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleNewAppointmentOpen}
                    sx={{ flexShrink: 0 }} // Prevent button from shrinking too much
                  >
                    New
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Tailor Travel Banner */}
          {tailorTravelLocations.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Paper
                sx={{
                  p: 2,
                  bgcolor: 'secondary.main', // Use secondary color for contrast
                  color: 'secondary.contrastText',
                  borderRadius: 2,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0.1, // Subtle background pattern/image
                    // backgroundImage: 'url(/path/to/your/pattern.svg)', // Optional pattern
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={8}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <LocationIcon sx={{ mr: 1.5, mt: 0.5 }} />
                        <Box>
                          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Tailor Travel Schedule
                          </Typography>
                          {tailorTravelLocations.slice(0, 1).map(location => ( // Show only the next one prominently
                             <Typography variant="body1" key={location.id}>
                                {location.destination.city}, {location.destination.country}
                                {' @ '}{location.destination.venue || location.destination.address.split(',')[0]}
                                {' ('}
                                {format(new Date(location.startDate), 'MMM d')}
                                {' - '}
                                {format(new Date(location.endDate), 'MMM d, yyyy')}
                                {')'}
                             </Typography>
                          ))}
                          {tailorTravelLocations.length > 1 && (
                            <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.8 }}>
                              Next: {tailorTravelLocations[1].destination.city} ({format(new Date(tailorTravelLocations[1].startDate), 'MMM d')} - {format(new Date(tailorTravelLocations[1].endDate), 'MMM d')})
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' }, mt: { xs: 1, md: 0 } }}>
                      <Button
                        variant="contained"
                        color="primary" // Use primary color button on secondary background
                        onClick={handleNewAppointmentOpen}
                      >
                        Book During Travel
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Box>
          )}

          {/* Main Content Area (List/Calendar) */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {viewMode === 'list' && (
                <>
                  {filteredAppointments.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <EventIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        No Appointments Found
                      </Typography>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        {tabValue === 0
                          ? "You haven't scheduled any appointments yet."
                          : tabValue === 1
                            ? "You have no upcoming appointments."
                            : tabValue === 2
                              ? "You have no past appointments."
                              : "You have no canceled appointments."}
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleNewAppointmentOpen}
                      >
                        Schedule New Appointment
                      </Button>
                    </Box>
                  ) : (
                    <Grid container spacing={2}>
                      {filteredAppointments.map((appointment) => (
                        <Grid item xs={12} key={appointment.id}>
                          <ListViewItem
                            onClick={() => handleAppointmentClick(appointment)}
                            sx={{
                              borderLeft: 5, // Thicker border
                              borderColor: getStatusColor(appointment.status),
                            }}
                          >
                            <Grid container spacing={2} alignItems="center"> {/* Align items center */}
                              {/* Date & Purpose */}
                              <Grid item xs={12} sm={4} md={3}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Box sx={{ mr: 1.5, color: getStatusColor(appointment.status) }}>
                                    {getPurposeIcon(appointment.purpose)}
                                  </Box>
                                  <Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                                      {appointment.purpose.charAt(0).toUpperCase() + appointment.purpose.slice(1)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {format(new Date(appointment.dateTime), 'EEE, MMM d, yyyy')}
                                    </Typography>
                                    <Chip
                                      label={appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                      size="small"
                                      sx={{
                                        mt: 0.5,
                                        height: 20,
                                        fontSize: '0.7rem',
                                        bgcolor: getStatusColor(appointment.status),
                                        color: theme.palette.getContrastText(getStatusColor(appointment.status)), // Ensure contrast
                                        fontWeight: 'medium',
                                      }}
                                    />
                                  </Box>
                                </Box>
                              </Grid>

                              {/* Time & Duration */}
                              <Grid item xs={6} sm={3} md={2}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <TimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                                  <Box>
                                    <Typography variant="body2">
                                      {format(new Date(appointment.dateTime), 'h:mm a')}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {appointment.duration} min
                                    </Typography>
                                  </Box>
                                </Box>
                              </Grid>

                              {/* Location */}
                              <Grid item xs={6} sm={3} md={4}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <LocationIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                                  <Box>
                                    <Typography variant="body2" noWrap>
                                      {appointment.location.type === 'shop'
                                        ? 'Tailor Shop'
                                        : appointment.location.type === 'virtual'
                                          ? 'Virtual Meeting'
                                          : appointment.location.type === 'hotel'
                                            // Removed .venue access for Appointment location
                                            ? appointment.location.address?.split(',')[0] || 'Hotel Visit'
                                            : appointment.location.address || 'Customer Location'}
                                    </Typography>
                                    {appointment.location.city && (
                                      <Typography variant="caption" color="text.secondary" noWrap>
                                        {appointment.location.city}
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>
                              </Grid>

                              {/* Action Button */}
                              <Grid item xs={12} sm={2} md={3}>
                                <Box sx={{
                                  display: 'flex',
                                  justifyContent: 'flex-end',
                                }}>
                                  <Button
                                    size="small"
                                    endIcon={<ArrowForwardIcon />}
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevent triggering ListViewItem onClick
                                      handleAppointmentClick(appointment);
                                    }}
                                    aria-label={`View details for ${appointment.purpose} appointment on ${format(new Date(appointment.dateTime), 'MMM d')}`}
                                  >
                                    Details
                                  </Button>
                                </Box>
                              </Grid>
                            </Grid>
                          </ListViewItem>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </>
              )}

              {viewMode === 'month' && (
                <MonthCalendarView
                  currentDate={currentDate}
                  appointments={appointments}
                  availableSlots={availableSlots}
                  onDateClick={handleDateClick}
                  onMonthChange={handleMonthChange}
                  selectedDate={selectedDate}
                />
              )}

              {viewMode === 'week' && (
                <WeeklyView
                  selectedDate={selectedDate}
                  appointments={appointments}
                  availableSlots={availableSlots}
                  onTimeSlotClick={handleTimeSlotClick}
                />
              )}

              {viewMode === 'day' && (
                <DayView
                  selectedDate={selectedDate}
                  appointments={appointments}
                  availableSlots={availableSlots}
                  onTimeSlotClick={handleTimeSlotClick}
                />
              )}
            </>
          )}
        </Box>

        {/* --- Dialogs --- */}

        {/* Appointment Details Dialog */}
        <Dialog
          open={detailsOpen}
          onClose={handleCloseDetails}
          maxWidth="md"
          fullWidth
          fullScreen={isMobile}
          aria-labelledby="appointment-details-title"
        >
          {selectedAppointment && (
            <>
              <DialogTitle sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
                py: 1.5, // Adjust padding
                px: { xs: 2, md: 3 }
              }} id="appointment-details-title">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {isMobile && (
                    <IconButton
                      edge="start"
                      color="inherit"
                      onClick={handleCloseDetails}
                      aria-label="close details"
                      sx={{ mr: 1 }}
                    >
                      <BackIcon />
                    </IconButton>
                  )}
                  <Box>
                    <Typography variant="h6">
                      {selectedAppointment.purpose.charAt(0).toUpperCase() + selectedAppointment.purpose.slice(1)} Appointment
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(selectedAppointment.dateTime), 'EEEE, MMMM d, yyyy')}
                    </Typography>
                  </Box>
                </Box>
                {!isMobile && (
                  <IconButton
                    edge="end"
                    color="inherit"
                    onClick={handleCloseDetails}
                    aria-label="close details"
                  >
                    <CloseIcon />
                  </IconButton>
                )}
              </DialogTitle>
              <DialogContent dividers sx={{ p: 0, bgcolor: 'grey.50' }}> {/* Light background */}
                <Box sx={{ p: { xs: 2, md: 3 } }}>
                  <Grid container spacing={3}>
                    {/* Main Information */}
                    <Grid item xs={12} md={7}>
                      <Paper sx={{ p: 2.5, height: '100%', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="subtitle1" gutterBottom sx={{ mb: 0, fontWeight: 'medium' }}>
                            Appointment Details
                          </Typography>
                          <Chip
                            label={selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                            size="small"
                            sx={{
                              bgcolor: getStatusColor(selectedAppointment.status),
                              color: theme.palette.getContrastText(getStatusColor(selectedAppointment.status)),
                              fontWeight: 'medium',
                            }}
                          />
                        </Box>

                        <List disablePadding>
                          <ListItem sx={{ px: 0, py: 1.5 }}>
                            <ListItemIcon sx={{ minWidth: 40 }}><EventIcon color="action" /></ListItemIcon>
                            <ListItemText
                              primary="Date & Time"
                              secondary={
                                <>
                                  {format(new Date(selectedAppointment.dateTime), 'EEEE, MMMM d, yyyy')}
                                  <br />
                                  {format(new Date(selectedAppointment.dateTime), 'h:mm a')}
                                  {' - '}
                                  {format(addMinutes(new Date(selectedAppointment.dateTime), selectedAppointment.duration), 'h:mm a')}
                                  {' '}({selectedAppointment.duration} min)
                                </>
                              }
                            />
                          </ListItem>

                          <Divider component="li" variant="inset" />

                          <ListItem sx={{ px: 0, py: 1.5 }}>
                             <ListItemIcon sx={{ minWidth: 40 }}><LocationIcon color="action" /></ListItemIcon>
                            <ListItemText
                              primary="Location"
                              secondary={
                                <>
                                  {selectedAppointment.location.type === 'shop'
                                    ? 'Tailor Shop'
                                    : selectedAppointment.location.type === 'virtual'
                                      ? 'Virtual Meeting'
                                      : selectedAppointment.location.type === 'hotel'
                                        // Removed .venue access for Appointment location
                                        ? selectedAppointment.location.address?.split(',')[0] || 'Hotel Visit'
                                        : selectedAppointment.location.address || 'Customer Location'}
                                  {selectedAppointment.location.address && selectedAppointment.location.type !== 'virtual' && (
                                    <>
                                      <br />{selectedAppointment.location.address}
                                    </>
                                  )}
                                  {selectedAppointment.location.city && (
                                    <>
                                      <br />{selectedAppointment.location.city}, {selectedAppointment.location.country}
                                    </>
                                  )}
                                </>
                              }
                            />
                          </ListItem>

                          <Divider component="li" variant="inset" />

                          <ListItem sx={{ px: 0, py: 1.5 }}>
                             <ListItemIcon sx={{ minWidth: 40 }}><InfoIcon color="action" /></ListItemIcon> {/* Assuming InfoIcon exists or use another */}
                            <ListItemText
                              primary="Purpose"
                              secondary={
                                selectedAppointment.purpose === 'initial'
                                  ? 'Initial Measurements'
                                  : selectedAppointment.purpose === 'fitting'
                                    ? 'Fitting Session'
                                    : selectedAppointment.purpose === 'consultation'
                                      ? 'Style Consultation'
                                      : 'Order Pickup'
                              }
                            />
                          </ListItem>

                          {selectedAppointment.notes && (
                            <>
                              <Divider component="li" variant="inset" />
                              <ListItem sx={{ px: 0, py: 1.5 }}>
                                <ListItemIcon sx={{ minWidth: 40 }}><NotesIcon color="action" /></ListItemIcon> {/* Assuming NotesIcon exists */}
                                <ListItemText
                                  primary="Notes"
                                  secondary={selectedAppointment.notes}
                                  secondaryTypographyProps={{ style: { whiteSpace: 'pre-wrap' } }} // Preserve line breaks
                                />
                              </ListItem>
                            </>
                          )}

                          {selectedAppointment.relatedOrderId && (
                            <>
                              <Divider component="li" variant="inset" />
                              <ListItem sx={{ px: 0, py: 1.5 }}>
                                <ListItemIcon sx={{ minWidth: 40 }}><ReceiptIcon color="action" /></ListItemIcon> {/* Assuming ReceiptIcon exists */}
                                <ListItemText
                                  primary="Related Order"
                                  secondary={
                                    <Button
                                      variant="text"
                                      size="small"
                                      onClick={() => navigate(`/orders?orderId=${selectedAppointment.relatedOrderId}`)}
                                      sx={{ p: 0, minWidth: 0, textTransform: 'none', fontWeight: 'normal', justifyContent: 'flex-start' }}
                                    >
                                      Order #{selectedAppointment.relatedOrderId.slice(-6)}
                                    </Button>
                                  }
                                />
                              </ListItem>
                            </>
                          )}
                        </List>
                      </Paper>
                    </Grid>

                    {/* Tailor Info & Actions */}
                    <Grid item xs={12} md={5}>
                      <Paper sx={{ p: 2.5, mb: 2, borderRadius: 2 }}>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
                          Tailor Information
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar
                            alt="Tailor"
                            // src="/api/placeholder/60/60" // Use actual image if available
                            sx={{ width: 60, height: 60, mr: 2, bgcolor: 'primary.light' }} // Placeholder avatar
                          >
                            {/* T */} {/* Initials */}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">
                              Master Tailor {/* Replace with actual name */}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Amorn Tailor {/* Replace with actual shop name */}
                            </Typography>
                          </Box>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<MessageIcon />}
                          onClick={() => navigate(`/messages?conversationId=${selectedAppointment.tailorId}`)} // Adjust query param if needed
                          sx={{ mb: 1 }}
                        >
                          Message Tailor
                        </Button>

                        {selectedAppointment.location.type === 'virtual' && (
                          <Button
                            fullWidth
                            variant="contained" // Make it prominent
                            color="success"
                            startIcon={<VideoCallIcon />}
                            sx={{ mb: 1 }}
                            // onClick={() => window.open('YOUR_MEETING_LINK', '_blank')} // Add meeting link logic
                          >
                            Join Virtual Meeting
                          </Button>
                        )}
                      </Paper>

                      <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
                          Appointment Actions
                        </Typography>

                        {(selectedAppointment.status === 'scheduled' || selectedAppointment.status === 'confirmed' || selectedAppointment.status === 'rescheduled') && (
                          <>
                            <Button
                              fullWidth
                              variant="outlined"
                              startIcon={<EditIcon />}
                              onClick={handleRescheduleOpen}
                              sx={{ mb: 1 }}
                              disabled={isBefore(new Date(selectedAppointment.dateTime), new Date())} // Disable for past appointments
                            >
                              Reschedule
                            </Button>

                            <Button
                              fullWidth
                              variant="outlined"
                              color="error"
                              startIcon={<CancelIcon />}
                              onClick={handleCancelConfirmOpen}
                              disabled={isBefore(new Date(selectedAppointment.dateTime), new Date())} // Disable for past appointments
                            >
                              Cancel Appointment
                            </Button>
                          </>
                        )}

                        {selectedAppointment.status === 'canceled' && (
                          <Button
                            fullWidth
                            variant="contained"
                            startIcon={<RefreshIcon />}
                            onClick={handleNewAppointmentOpen}
                          >
                            Schedule New Appointment
                          </Button>
                        )}

                        {selectedAppointment.status === 'completed' && (
                          <Button
                            fullWidth
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleNewAppointmentOpen}
                          >
                            Schedule Follow-up
                          </Button>
                        )}
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
              </DialogContent>
              <DialogActions sx={{
                p: 2,
                borderTop: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}>
                <Button onClick={handleCloseDetails}>
                  Close
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* New/Reschedule Appointment Dialog (Combined logic slightly for reuse) */}
        <Dialog
          open={newAppointmentOpen || rescheduleOpen}
          onClose={rescheduleOpen ? handleRescheduleClose : handleNewAppointmentClose}
          maxWidth="sm"
          fullWidth
          fullScreen={isMobile}
          aria-labelledby="appointment-form-title"
        >
          <DialogTitle id="appointment-form-title">
            {rescheduleOpen ? 'Reschedule Appointment' : 'Schedule New Appointment'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              {rescheduleOpen && selectedAppointment && (
                 <Alert severity="info" sx={{ mb: 2 }}>
                    Rescheduling appointment from {format(new Date(selectedAppointment.dateTime), 'MMM d, yyyy h:mm a')}.
                 </Alert>
              )}

              <Typography variant="subtitle1" gutterBottom>Appointment Type</Typography>
              <FormControl component="fieldset" sx={{ mb: 3 }}>
                <RadioGroup
                  row
                  aria-label="appointment purpose"
                  name="purpose"
                  value={newAppointment.purpose}
                  onChange={(e) => handleNewAppointmentChange('purpose', e.target.value as Appointment['purpose'])}
                >
                  <FormControlLabel value="initial" control={<Radio size="small"/>} label="Initial" />
                  <FormControlLabel value="fitting" control={<Radio size="small"/>} label="Fitting" />
                  <FormControlLabel value="consultation" control={<Radio size="small"/>} label="Consultation" />
                  <FormControlLabel value="pickup" control={<Radio size="small"/>} label="Pickup" />
                </RadioGroup>
              </FormControl>

              <Typography variant="subtitle1" gutterBottom>Date & Time</Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Date"
                    value={newAppointment.selectedDate}
                    onChange={(date) => date && handleNewAppointmentChange('selectedDate', date)}
                    // renderInput={(params) => <TextField {...params} fullWidth />} // Deprecated
                    slotProps={{ textField: { fullWidth: true } }}
                    disablePast
                    shouldDisableDate={(date) => {
                      // Disable weekends
                      const day = getDay(date);
                      return day === 0 || day === 6;
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TimePicker
                    label="Time"
                    value={newAppointment.selectedTime}
                    onChange={(time) => time && handleNewAppointmentChange('selectedTime', time)}
                    // renderInput={(params) => <TextField {...params} fullWidth />} // Deprecated
                    slotProps={{ textField: { fullWidth: true } }}
                    minutesStep={15} // Example: Allow 15-minute increments
                    // Add logic to disable times based on availableSlots if needed
                  />
                </Grid>
              </Grid>

              <Typography variant="subtitle1" gutterBottom>Duration</Typography>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="duration-label">Duration</InputLabel>
                <Select
                  labelId="duration-label"
                  value={newAppointment.duration}
                  label="Duration"
                  onChange={(e) => handleNewAppointmentChange('duration', Number(e.target.value))}
                >
                  <MenuItem value={30}>30 minutes</MenuItem>
                  <MenuItem value={45}>45 minutes</MenuItem>
                  <MenuItem value={60}>60 minutes (1 hour)</MenuItem>
                  <MenuItem value={90}>90 minutes (1.5 hours)</MenuItem>
                  <MenuItem value={120}>120 minutes (2 hours)</MenuItem>
                </Select>
              </FormControl>

              <Typography variant="subtitle1" gutterBottom>Location</Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="location-type-label">Location Type</InputLabel>
                <Select
                  labelId="location-type-label"
                  value={newAppointment.location.type}
                  label="Location Type"
                  onChange={handleLocationTypeChange}
                >
                  <MenuItem value="shop">Tailor Shop (Phuket)</MenuItem>
                  <MenuItem value="hotel">Hotel Visit (During Travel)</MenuItem>
                  <MenuItem value="virtual">Virtual Meeting</MenuItem>
                </Select>
              </FormControl>

              {newAppointment.location.type === 'hotel' && (
                <FormControl fullWidth sx={{ mb: 3 }} required>
                  <InputLabel id="travel-location-label">Select Travel Period</InputLabel>
                  <Select
                    labelId="travel-location-label"
                    // Need logic to select the correct travel location ID
                    value={newAppointment.location.address || ''} // Store address or ID? Adapt as needed
                    label="Select Travel Period *"
                    onChange={(e) => {
                        const selectedTravelId = e.target.value;
                        const selectedTravel = tailorTravelLocations.find(loc => loc.id === selectedTravelId);
                        if (selectedTravel) {
                            handleNewAppointmentChange('location', {
                                type: 'hotel',
                                address: selectedTravel.destination.address,
                                city: selectedTravel.destination.city,
                                country: selectedTravel.destination.country,
                                venue: selectedTravel.destination.venue,
                                coordinates: selectedTravel.destination.coordinates,
                            });
                            // Optionally adjust default date/time based on travel period
                            handleNewAppointmentChange('selectedDate', selectedTravel.startDate);
                        }
                    }}
                  >
                    {tailorTravelLocations.map(location => (
                      <MenuItem key={location.id} value={location.id}>
                        {location.destination.city}, {location.destination.country} ({format(new Date(location.startDate), 'MMM d')} - {format(new Date(location.endDate), 'MMM d')})
                      </MenuItem>
                    ))}
                  </Select>
                  {/* Add validation/error display if no travel selected */}
                </FormControl>
              )}

              <Typography variant="subtitle1" gutterBottom>Additional Notes (Optional)</Typography>
              <TextField
                label="Notes"
                value={newAppointment.notes}
                onChange={(e) => handleNewAppointmentChange('notes', e.target.value)}
                multiline
                rows={3}
                fullWidth
                placeholder="Any special requests or information for the tailor..."
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Button onClick={rescheduleOpen ? handleRescheduleClose : handleNewAppointmentClose}>Cancel</Button>
            <Button
              variant="contained"
              onClick={rescheduleOpen ? handleReschedule : handleCreateAppointment}
              disabled={loading} // Disable button while processing
            >
              {loading ? <CircularProgress size={24} /> : (rescheduleOpen ? 'Confirm Reschedule' : 'Schedule Appointment')}
            </Button>
          </DialogActions>
        </Dialog>


        {/* Cancel Confirmation Dialog */}
        <Dialog
          open={cancelConfirmOpen}
          onClose={handleCancelConfirmClose}
          aria-labelledby="cancel-confirm-title"
        >
          <DialogTitle id="cancel-confirm-title">
            Cancel Appointment
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              Are you sure you want to cancel your {selectedAppointment?.purpose} appointment scheduled for{' '}
              {selectedAppointment && format(new Date(selectedAppointment.dateTime), 'MMMM d, yyyy')} at{' '}
              {selectedAppointment && format(new Date(selectedAppointment.dateTime), 'h:mm a')}?
            </Typography>

            <Box sx={{ mt: 2, p: 1.5, bgcolor: 'warning.light', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ color: 'warning.dark', fontWeight: 'medium' }}>
                Cancellation Policy:
              </Typography>
              <Typography variant="caption" component="ul" sx={{ pl: 2, color: 'text.secondary' }}>
                <li>More than 24 hours notice: No fee.</li>
                <li>Less than 24 hours notice: May be subject to a fee.</li>
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelConfirmClose}>
              Keep Appointment
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleCancelAppointment}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Yes, Cancel Appointment'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          {/* Wrapping Alert in a forwardRef for Snackbar compatibility if needed, but usually works directly */}
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
    </LocalizationProvider>
  );
};

// --- Helper Icons (if not directly imported/available) ---
// Define or import InfoIcon, NotesIcon, ReceiptIcon if needed
import InfoIcon from '@mui/icons-material/Info';
import NotesIcon from '@mui/icons-material/Notes';
import ReceiptIcon from '@mui/icons-material/Receipt';


export default AppointmentsPage;