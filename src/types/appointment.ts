export interface Appointment {
  id: string;
  userId: string;
  tailorId: string;
  dateTime: Date;
  duration: number; // in minutes
  location: {
    type: 'shop' | 'hotel' | 'virtual';
    address?: string;
    city?: string;
    country?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  purpose: 'initial' | 'fitting' | 'consultation' | 'pickup';
  status: 'scheduled' | 'confirmed' | 'completed' | 'canceled' | 'rescheduled';
  notes?: string;
  relatedOrderId?: string;
  reminderSettings: {
    sendReminder: boolean;
    reminderTime: number; // hours before appointment
  };
}