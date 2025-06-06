import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Assignment {
  projectName: string;
  allocationPercentage: number;
  startDate: string;
  endDate: string;
  role: string;
  status: string;
}

interface AssignmentTimelineProps {
  assignments: Assignment[];
}

const AssignmentTimeline = ({ assignments }: AssignmentTimelineProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getAssignmentsForDay = (date: Date) => {
    return assignments.filter(assignment => {
      const start = new Date(assignment.startDate);
      const end = new Date(assignment.endDate);
      return date >= start && date <= end;
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Assignment Timeline</CardTitle>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[240px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(currentDate, 'MMMM yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={currentDate}
                onSelect={(date) => date && setCurrentDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
          {days.map((day, dayIdx) => {
            const dayAssignments = getAssignmentsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isCurrentDay = isToday(day);

            return (
              <div
                key={dayIdx}
                className={`min-h-[100px] p-2 border rounded-lg ${
                  !isCurrentMonth ? 'bg-gray-50' : ''
                } ${isCurrentDay ? 'border-blue-500' : ''}`}
              >
                <div className={`text-sm ${!isCurrentMonth ? 'text-gray-400' : ''}`}>
                  {format(day, 'd')}
                </div>
                <div className="mt-1 space-y-1">
                  {dayAssignments.map((assignment, idx) => (
                    <div
                      key={idx}
                      className={`text-xs p-1 rounded truncate ${
                        assignment.status === 'active' 
                          ? 'bg-blue-100 text-blue-800' 
                          : assignment.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : assignment.status === 'upcoming'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                      title={`${assignment.projectName} (${assignment.role}) - ${assignment.status}`}
                    >
                      {assignment.projectName}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default AssignmentTimeline; 