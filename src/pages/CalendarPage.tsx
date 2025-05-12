
import React from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Bell, FileText, Info } from 'lucide-react';

const CalendarPage: React.FC = () => {
  const { reminders, serviceRecords, getApplianceById } = useApp();
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  // Prepare calendar events for reminders
  const reminderDates = reminders.reduce((acc, reminder) => {
    const date = new Date(reminder.dueDate);
    const dateStr = date.toISOString().split('T')[0];
    
    if (!acc[dateStr]) {
      acc[dateStr] = { reminders: [], serviceRecords: [] };
    }
    
    acc[dateStr].reminders.push(reminder);
    return acc;
  }, {} as Record<string, { reminders: typeof reminders, serviceRecords: typeof serviceRecords }>);
  
  // Prepare calendar events for service records
  const allEvents = serviceRecords.reduce((acc, record) => {
    const date = new Date(record.date);
    const dateStr = date.toISOString().split('T')[0];
    
    if (!acc[dateStr]) {
      acc[dateStr] = { reminders: [], serviceRecords: [] };
    }
    
    acc[dateStr].serviceRecords.push(record);
    return acc;
  }, reminderDates);
  
  // Get selected date events
  const selectedDateStr = date ? date.toISOString().split('T')[0] : '';
  const selectedDateEvents = allEvents[selectedDateStr] || { reminders: [], serviceRecords: [] };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Maintenance Calendar</h1>
        <p className="text-gray-600 mt-1">View and manage scheduled maintenance and service history</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Date</CardTitle>
              <CardDescription>View events for a specific date</CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
                modifiersStyles={{
                  hasEvents: { fontWeight: 'bold', textDecoration: 'underline', color: '#0ea5e9' },
                }}
                modifiers={{
                  hasEvents: Object.keys(allEvents).map(dateStr => new Date(dateStr)),
                }}
              />
            </CardContent>
          </Card>
        </div>
        
        <div className="col-span-1 lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">
                {date ? formatDate(date.toISOString()) : 'No Date Selected'}
              </CardTitle>
              <CardDescription>
                {selectedDateEvents.reminders.length > 0 || selectedDateEvents.serviceRecords.length > 0
                  ? `${selectedDateEvents.reminders.length} reminder(s) and ${selectedDateEvents.serviceRecords.length} service record(s)`
                  : 'No events scheduled for this date'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDateEvents.reminders.length === 0 && selectedDateEvents.serviceRecords.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Info className="h-10 w-10 text-gray-300 mb-2" />
                  <p className="text-gray-500">No events for this date</p>
                  <p className="text-gray-400 text-sm mt-1">Select a different date or add new reminders</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {selectedDateEvents.reminders.length > 0 && (
                    <div>
                      <h3 className="font-medium flex items-center gap-2 mb-3">
                        <Bell className="h-4 w-4 text-maintenance-600" /> 
                        Scheduled Maintenance
                      </h3>
                      <div className="space-y-3">
                        {selectedDateEvents.reminders.map(reminder => {
                          const appliance = getApplianceById(reminder.applianceId);
                          
                          return (
                            <div key={reminder.id} className="p-3 border rounded-md">
                              <div className="flex justify-between">
                                <div>
                                  <h4 className="font-medium">{reminder.title}</h4>
                                  {appliance && (
                                    <p className="text-sm text-gray-500">
                                      For: {appliance.name}
                                    </p>
                                  )}
                                </div>
                                <span className={`text-xs px-2 py-0.5 h-fit rounded-full ${reminder.completed ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                  {reminder.completed ? 'Completed' : 'Scheduled'}
                                </span>
                              </div>
                              {reminder.description && (
                                <p className="text-sm text-gray-600 mt-2">{reminder.description}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {selectedDateEvents.serviceRecords.length > 0 && (
                    <div>
                      <h3 className="font-medium flex items-center gap-2 mb-3">
                        <FileText className="h-4 w-4 text-maintenance-600" /> 
                        Service History
                      </h3>
                      <div className="space-y-3">
                        {selectedDateEvents.serviceRecords.map(record => {
                          const appliance = getApplianceById(record.applianceId);
                          
                          return (
                            <div key={record.id} className="p-3 border rounded-md">
                              <div className="flex justify-between">
                                <div>
                                  <h4 className="font-medium">
                                    {appliance ? appliance.name : 'Unknown Appliance'}
                                  </h4>
                                  <p className="text-sm text-gray-500">
                                    {record.serviceType} by {record.providerName}
                                  </p>
                                </div>
                                <span className="text-xs font-medium">
                                  ${record.cost}
                                </span>
                              </div>
                              {record.notes && (
                                <p className="text-sm text-gray-600 mt-2">{record.notes}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
