import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, AlertCircle } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';

interface CalendarEvent {
  id: number;
  date: Date;
  title: string;
  type: 'deadline' | 'meeting' | 'task' | 'reminder';
  priority: 'high' | 'medium' | 'low';
  description?: string;
}

interface EnhancedCalendarProps {
  events?: CalendarEvent[];
  onDateSelect?: (date: Date) => void;
}

/**
 * Enhanced Calendar Component
 * Displays deadlines, meetings, and tasks with priority indicators
 */
export function EnhancedCalendar({ events = [], onDateSelect }: EnhancedCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDate = (date: Date) => {
    return events.filter(
      (event) =>
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear()
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-200';
      default:
        return 'bg-blue-500/20 text-blue-700 border-blue-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deadline':
        return '📋';
      case 'meeting':
        return '👥';
      case 'task':
        return '✓';
      default:
        return '🔔';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Calendar
            </CardTitle>
            <CardDescription>Track deadlines and important dates</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Month Header */}
          <div className="text-center font-semibold text-lg">
            {format(currentMonth, 'MMMM yyyy')}
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {daysInMonth.map((date) => {
              const dayEvents = getEventsForDate(date);
              const isCurrentDay = isToday(date);
              const isSameMonthDay = isSameMonth(date, currentMonth);

              return (
                <div
                  key={date.toString()}
                  onClick={() => onDateSelect?.(date)}
                  className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                    isCurrentDay
                      ? 'bg-accent/20 border-accent'
                      : isSameMonthDay
                      ? 'border-border hover:bg-secondary/50'
                      : 'border-border/50 opacity-50'
                  }`}
                >
                  <div className="text-sm font-medium mb-1">{date.getDate()}</div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className={`text-xs px-1.5 py-0.5 rounded border ${getPriorityColor(event.priority)}`}
                        title={event.title}
                      >
                        <span className="mr-1">{getTypeIcon(event.type)}</span>
                        <span className="truncate">{event.title}</span>
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Upcoming Events */}
          {events.length > 0 && (
            <div className="mt-6 pt-4 border-t">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Upcoming Events
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {events
                  .sort((a, b) => a.date.getTime() - b.date.getTime())
                  .slice(0, 5)
                  .map((event) => (
                    <div key={event.id} className="text-sm p-2 rounded bg-secondary/50 flex items-start justify-between">
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(event.date, 'MMM d, yyyy')}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {event.type}
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
