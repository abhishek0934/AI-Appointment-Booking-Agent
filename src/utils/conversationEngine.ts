import { Message, ConversationState, TimeSlot } from '../types/booking';
import { DateTimeParser } from './dateParser';
import { CalendarService } from './calendarService';
import { addDays } from 'date-fns';

export class ConversationEngine {
  private state: ConversationState = {
    step: 'greeting',
    extractedInfo: {},
    suggestedSlots: []
  };

  async processMessage(userMessage: string): Promise<Message[]> {
    const responses: Message[] = [];
    
    // Parse user input
    const parsed = DateTimeParser.parseDateTime(userMessage);
    
    // Update state with extracted information
    if (parsed.date) this.state.extractedInfo.date = parsed.date;
    if (parsed.time) this.state.extractedInfo.time = parsed.time;
    if (parsed.intent) this.state.intent = parsed.intent;

    // Determine response based on current step and input
    switch (this.state.step) {
      case 'greeting':
        if (parsed.intent === 'book_appointment') {
          this.state.step = 'collecting_info';
          responses.push(...await this.handleBookingRequest(userMessage));
        } else if (parsed.intent === 'check_availability') {
          responses.push(...await this.handleAvailabilityCheck(userMessage));
        } else {
          responses.push(this.createGreetingResponse());
        }
        break;
        
      case 'collecting_info':
        responses.push(...await this.handleInfoCollection(userMessage));
        break;
        
      case 'showing_slots':
        responses.push(...await this.handleSlotSelection(userMessage));
        break;
        
      case 'confirming':
        responses.push(...await this.handleConfirmation(userMessage));
        break;
        
      default:
        responses.push(this.createHelpResponse());
    }

    return responses;
  }

  private async handleBookingRequest(message: string): Promise<Message[]> {
    const responses: Message[] = [];
    
    if (this.hasRequiredInfo()) {
      // We have enough info, show time slots
      this.state.step = 'showing_slots';
      responses.push(this.createMessage('Great! Let me check available time slots for you.'));
      
      const slots = await CalendarService.getAvailability(
        this.state.extractedInfo.date!,
        this.state.extractedInfo.duration || 60
      );
      
      this.state.suggestedSlots = slots;
      
      if (slots.length > 0) {
        responses.push(this.createTimeSlotsMessage(slots));
      } else {
        responses.push(this.createMessage('I don\'t see any available slots for that time. Would you like to try a different date?'));
        this.state.step = 'collecting_info';
      }
    } else {
      // Need more information
      responses.push(this.createInfoRequestMessage());
    }
    
    return responses;
  }

  private async handleAvailabilityCheck(message: string): Promise<Message[]> {
    const responses: Message[] = [];
    
    if (this.state.extractedInfo.date) {
      responses.push(this.createMessage('Let me check what\'s available...'));
      
      const slots = await CalendarService.getAvailability(this.state.extractedInfo.date);
      
      if (slots.length > 0) {
        responses.push(this.createMessage(`I found ${slots.length} available time slots:`));
        responses.push(this.createTimeSlotsMessage(slots));
        this.state.step = 'showing_slots';
        this.state.suggestedSlots = slots;
      } else {
        responses.push(this.createMessage('No available slots found for that date. Would you like to try another day?'));
      }
    } else {
      responses.push(this.createMessage('Which date would you like me to check availability for?'));
      this.state.step = 'collecting_info';
    }
    
    return responses;
  }

  private async handleInfoCollection(message: string): Promise<Message[]> {
    const parsed = DateTimeParser.parseDateTime(message);
    
    if (parsed.date) this.state.extractedInfo.date = parsed.date;
    if (parsed.time) this.state.extractedInfo.time = parsed.time;
    
    if (this.hasRequiredInfo()) {
      return this.handleBookingRequest(message);
    } else {
      return [this.createInfoRequestMessage()];
    }
  }

  private async handleSlotSelection(message: string): Promise<Message[]> {
    const responses: Message[] = [];
    
    // Check if user selected a slot by number or time
    const slotMatch = message.match(/(\d+)|(\d{1,2}:?\d{0,2}\s*(?:am|pm)?)/i);
    
    if (slotMatch) {
      let selectedSlot: TimeSlot | undefined;
      
      if (slotMatch[1]) {
        // Selected by number
        const index = parseInt(slotMatch[1]) - 1;
        selectedSlot = this.state.suggestedSlots[index];
      } else if (slotMatch[2]) {
        // Selected by time
        const timeInput = slotMatch[2];
        selectedSlot = this.state.suggestedSlots.find(slot => 
          slot.startTime.toLowerCase().includes(timeInput.toLowerCase())
        );
      }
      
      if (selectedSlot) {
        this.state.selectedSlot = selectedSlot;
        this.state.step = 'confirming';
        responses.push(this.createConfirmationMessage(selectedSlot));
      } else {
        responses.push(this.createMessage('I couldn\'t find that time slot. Please select from the available options above.'));
      }
    } else {
      responses.push(this.createMessage('Please select a time slot by typing the number or time (e.g., "2" or "10:00 AM").'));
    }
    
    return responses;
  }

  private async handleConfirmation(message: string): Promise<Message[]> {
    const responses: Message[] = [];
    
    if (/yes|confirm|book|okay|ok/i.test(message)) {
      if (this.state.selectedSlot) {
        try {
          const appointment = await CalendarService.bookAppointment(
            this.state.selectedSlot,
            this.state.extractedInfo.title || 'Appointment'
          );
          
          responses.push(this.createSuccessMessage(appointment));
          this.resetState();
        } catch (error) {
          responses.push(this.createMessage('Sorry, there was an error booking your appointment. Please try again.'));
          this.state.step = 'showing_slots';
        }
      }
    } else if (/no|cancel|back/i.test(message)) {
      this.state.step = 'showing_slots';
      responses.push(this.createMessage('No problem! Here are the available time slots again:'));
      responses.push(this.createTimeSlotsMessage(this.state.suggestedSlots));
    } else {
      responses.push(this.createMessage('Please confirm by saying "yes" to book the appointment, or "no" to go back.'));
    }
    
    return responses;
  }

  private hasRequiredInfo(): boolean {
    return !!(this.state.extractedInfo.date);
  }

  private createGreetingResponse(): Message {
    return this.createMessage(
      'Hello! I\'m your AI appointment booking assistant. I can help you schedule meetings and check availability. ' +
      'Try saying something like "Book a meeting tomorrow at 2 PM" or "Do you have anything free next Friday?"'
    );
  }

  private createInfoRequestMessage(): Message {
    const missing = [];
    if (!this.state.extractedInfo.date) missing.push('date');
    
    let message = 'I\'d be happy to help you schedule an appointment! ';
    
    if (missing.includes('date')) {
      message += 'When would you like to meet? You can say things like "tomorrow", "next Monday", or a specific date.';
    }
    
    return this.createMessage(message);
  }

  private createTimeSlotsMessage(slots: TimeSlot[]): Message {
    return {
      id: Date.now().toString(),
      content: 'Available time slots:',
      sender: 'assistant',
      timestamp: new Date(),
      type: 'time-slots',
      data: { slots }
    };
  }

  private createConfirmationMessage(slot: TimeSlot): Message {
    const formattedTime = DateTimeParser.formatTimeSlot(slot.date, slot.startTime);
    return this.createMessage(
      `Perfect! I'll book your appointment for ${formattedTime}. ` +
      'Would you like me to confirm this booking?'
    );
  }

  private createSuccessMessage(appointment: any): Message {
    const formattedTime = DateTimeParser.formatTimeSlot(appointment.date, appointment.startTime);
    return this.createMessage(
      `✅ Great! Your appointment has been successfully booked for ${formattedTime}. ` +
      'You should receive a confirmation shortly.'
    );
  }

  private createHelpResponse(): Message {
    return this.createMessage(
      'I can help you with:\n' +
      '• Booking appointments ("Book a meeting tomorrow at 2 PM")\n' +
      '• Checking availability ("What\'s free next week?")\n' +
      '• Rescheduling meetings\n\n' +
      'What would you like to do?'
    );
  }

  private createMessage(content: string): Message {
    return {
      id: Date.now().toString(),
      content,
      sender: 'assistant',
      timestamp: new Date(),
      type: 'text'
    };
  }

  private resetState(): void {
    this.state = {
      step: 'greeting',
      extractedInfo: {},
      suggestedSlots: []
    };
  }

  getState(): ConversationState {
    return { ...this.state };
  }
}