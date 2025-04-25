export interface GroupOrder {
  id: string;
  name: string;
  eventType: 'wedding' | 'corporate' | 'performance' | 'other';
  eventDate: Date;
  createdBy: string;
  members: GroupMember[];
  sharedStyles: {
    products: string[]; // references to product.id
    fabrics: string[]; // references to fabric.id
    colorPalette: string[];
    requiredElements: string[];
  };
  conversationId: string;
  timeline: {
    milestone: string;
    dueDate: Date;
    completed: boolean;
    completedDate?: Date;
  }[];
  notes?: string;
  status: 'planning' | 'ordering' | 'production' | 'shipping' | 'completed' | 'canceled';
}

export interface GroupMember {
  userId: string;
  role: 'organizer' | 'member';
  joinedAt: Date;
  status: 'pending' | 'active' | 'completed';
  orderId?: string;
}