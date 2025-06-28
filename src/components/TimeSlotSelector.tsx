import React from 'react';
import { TimeSlot } from '../types/booking';
import { Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface TimeSlotSelectorProps {
  slots: TimeSlot[];
  onSelect: (slotId: string) => void;
}

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({ slots, onSelect }) => {
  if (!slots || slots.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 mb-4">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">Available Time Slots</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {slots.map((slot, index) => (
            <button
              key={slot.id}
              onClick={() => onSelect(slot.id)}
              className="group flex items-center justify-between p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-all duration-200 hover:shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-white group-hover:bg-blue-100 p-2 rounded-md transition-colors duration-200">
                  <Clock className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900">
                    {slot.startTime} - {slot.endTime}
                  </div>
                  <div className="text-xs text-gray-500">
                    {format(slot.date, 'EEEE, MMM d')}
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                #{index + 1}
              </div>
            </button>
          ))}
        </div>
        
        <div className="mt-3 text-xs text-gray-500 text-center">
          Click a time slot or type the number/time in your message
        </div>
      </div>
    </div>
  );
};

export default TimeSlotSelector;