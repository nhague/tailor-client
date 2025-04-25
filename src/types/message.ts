export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  timestamp: Date;
  content: string;
  attachmentUrls?: string[];
  read: boolean;
  readTimestamp?: Date;
  orderReference?: string;
  isSystemMessage: boolean;
}

export interface Conversation {
  id: string;
  participants: string[]; // array of user IDs
  lastMessageId: string;
  lastMessageTimestamp: Date;
  title?: string; // for group conversations
  isGroupConversation: boolean;
  groupOrderId?: string;
  createdAt: Date;
  updatedAt: Date;
}