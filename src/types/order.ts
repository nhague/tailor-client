export interface Order {
  id: string;
  userId: string;
  dateCreated: Date;
  status: 'draft' | 'pending' | 'processing' | 'shipping' | 'delivered' | 'canceled';
  items: OrderItem[];
  measurementId: string;
  shippingAddress: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  billingAddress: {
    sameAsShipping: boolean;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  paymentInfo: {
    method: string;
    transactionId?: string;
    amount: number;
    currency: string;
    status: string;
    depositAmount: number;
    remainingAmount: number;
    paidInFull: boolean;
  };
  shipping: {
    method: string;
    trackingNumber?: string;
    carrier?: string;
    estimatedDelivery?: Date;
    shippingCost: number;
    customsForms?: string[]; // URLs to documents
  };
  subtotal: number;
  tax: number;
  discount?: {
    code: string;
    amount: number;
  };
  total: number;
  currency: 'USD' | 'THB';
  notes?: string;
  groupOrderId?: string;
}

export interface OrderItem {
  productId: string;
  fabricId: string;
  quantity: number;
  customizations: Record<string, string | number | boolean>;
  price: number;
  notes?: string;
}