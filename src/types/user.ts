export interface User {
  uid: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  dateCreated: Date;
  lastLogin: Date;
  preferredLanguage: string;
  measurementUnit: 'metric' | 'imperial';
  preferredCurrency: string;
  notificationSettings: {
    orderUpdates: boolean;
    appointments: boolean;
    promotions: boolean;
    messages: boolean;
    tailorTravelAlerts: boolean;
  };
  shippingAddresses: ShippingAddress[];
  loyaltyPoints: number;
  referralCode?: string;
  referredBy?: string;
  customerTier: 'regular' | 'preferred' | 'vip';
  notes?: string;
  fcmTokens?: string[];
}

export interface ShippingAddress {
  id: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}