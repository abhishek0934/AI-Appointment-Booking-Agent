import { TimeSlot, Appointment } from '../types/booking';
import { addDays, setHours, setMinutes, format, isSameDay } from 'date-fns';

export class CalendarService {
  private static appointments: Appointment[] = [
    {
      id: '1',
      title: 'Team Meeting',
      date: new Date(),
      startTime: '10:00 AM',
      endTime: '11:00 AM',
      confirmed: true
    },
    {
      id: '2',
      title: 'Client Call',
      date: addDays(new Date(), 1),
      startTime: '2:00 PM',
      endTime: '3:00 PM',
      confirmed: true
    }
  ];

  static async getAvailability(date: Date, duration: number = 60): Promise<TimeSlot[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const slots: TimeSlot[] = [];
    const businessHours = [
      '9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', 
      '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
    ];

    // Check which slots are available
    const existingAppointments = this.appointments.filter(apt => 
      isSameDay(apt.date, date)
    );

    for (const time of businessHours) {
      const isBooked = existingAppointments.some(apt => apt.startTime === time);
      
      slots.push({
        id: `${format(date, 'yyyy-MM-dd')}-${time}`,
        date,
        startTime: time,
        endTime: this.addMinutesToTime(time, duration),
        available: !isBooked
      });
    }

    return slots.filter(slot => slot.available);
  }

  static async bookAppointment(slot: TimeSlot, title: string, description?: string): Promise<Appointment> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const appointment: Appointment = {
      id: Date.now().toString(),
      title,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      description,
      confirmed: true
    };

    this.appointments.push(appointment);
    return appointment;
  }

  private static addMinutesToTime(time: string, minutes: number): string {
    try {
      const [timePart, period] = time.split(' ');
      const [hours, mins = '00'] = timePart.split(':');
      let hour = parseInt(hours);
      let minute = parseInt(mins);

      if (period?.toLowerCase() === 'pm' && hour !== 12) {
        hour += 12;
      } else if (period?.toLowerCase() === 'am' && hour === 12) {
        hour = 0;
      }

      const date = setMinutes(setHours(new Date(), hour), minute + minutes);
      return format(date, 'h:mm a');
    } catch {
      return time;
    }
  }

  static getUpcomingAppointments(): Appointment[] {
    const now = new Date();
    return this.appointments
      .filter(apt => apt.date >= now)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }
}