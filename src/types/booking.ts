export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  type?: 'text' | 'time-slots' | 'confirmation';
  data?: any;
}

export interface TimeSlot {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface Appointment {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  description?: string;
  confirmed: boolean;
}

export interface ConversationState {
  step: 'greeting' | 'collecting_info' | 'showing_slots' | 'confirming' | 'completed';
  intent?: string;
  extractedInfo: {
    date?: Date;
    time?: string;
    duration?: number;
    title?: string;
    description?: string;
  };
  suggestedSlots: TimeSlot[];
  selectedSlot?: TimeSlot;
}