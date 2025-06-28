import { format, parse, addDays, startOfWeek, endOfWeek, isValid, setHours, setMinutes } from 'date-fns';

export class DateTimeParser {
  private static timePatterns = [
    { pattern: /(\d{1,2}):(\d{2})\s*(am|pm)/i, format: 'h:mm a' },
    { pattern: /(\d{1,2})\s*(am|pm)/i, format: 'h a' },
    { pattern: /(\d{1,2}):(\d{2})/, format: 'H:mm' },
  ];

  private static datePatterns = [
    { pattern: /tomorrow/i, days: 1 },
    { pattern: /today/i, days: 0 },
    { pattern: /next\s+monday/i, weekday: 1, next: true },
    { pattern: /next\s+tuesday/i, weekday: 2, next: true },
    { pattern: /next\s+wednesday/i, weekday: 3, next: true },
    { pattern: /next\s+thursday/i, weekday: 4, next: true },
    { pattern: /next\s+friday/i, weekday: 5, next: true },
    { pattern: /next\s+saturday/i, weekday: 6, next: true },
    { pattern: /next\s+sunday/i, weekday: 0, next: true },
    { pattern: /monday/i, weekday: 1 },
    { pattern: /tuesday/i, weekday: 2 },
    { pattern: /wednesday/i, weekday: 3 },
    { pattern: /thursday/i, weekday: 4 },
    { pattern: /friday/i, weekday: 5 },
    { pattern: /saturday/i, weekday: 6 },
    { pattern: /sunday/i, weekday: 0 },
  ];

  static parseDateTime(input: string): { date?: Date; time?: string; intent?: string } {
    const result: { date?: Date; time?: string; intent?: string } = {};
    
    // Extract intent
    if (/book|schedule|appointment|meeting/i.test(input)) {
      result.intent = 'book_appointment';
    } else if (/available|free|open/i.test(input)) {
      result.intent = 'check_availability';
    }

    // Parse time
    for (const timePattern of this.timePatterns) {
      const match = input.match(timePattern.pattern);
      if (match) {
        result.time = match[0];
        break;
      }
    }

    // Parse date
    const today = new Date();
    
    for (const datePattern of this.datePatterns) {
      if (datePattern.pattern.test(input)) {
        if ('days' in datePattern) {
          result.date = addDays(today, datePattern.days);
        } else if ('weekday' in datePattern) {
          const targetDay = datePattern.weekday;
          const currentDay = today.getDay();
          let daysToAdd = targetDay - currentDay;
          
          if (datePattern.next || daysToAdd <= 0) {
            daysToAdd += 7;
          }
          
          result.date = addDays(today, daysToAdd);
        }
        break;
      }
    }

    // Check for relative terms
    if (/this\s+week/i.test(input)) {
      result.date = endOfWeek(today);
    } else if (/next\s+week/i.test(input)) {
      result.date = addDays(startOfWeek(today), 7);
    }

    return result;
  }

  static formatTimeSlot(date: Date, startTime: string): string {
    try {
      const [time, period] = startTime.split(' ');
      const [hours, minutes = '00'] = time.split(':');
      let hour = parseInt(hours);
      
      if (period?.toLowerCase() === 'pm' && hour !== 12) {
        hour += 12;
      } else if (period?.toLowerCase() === 'am' && hour === 12) {
        hour = 0;
      }

      const timeDate = setMinutes(setHours(date, hour), parseInt(minutes));
      return format(timeDate, 'EEEE, MMMM do \'at\' h:mm a');
    } catch {
      return `${format(date, 'EEEE, MMMM do')} at ${startTime}`;
    }
  }
}