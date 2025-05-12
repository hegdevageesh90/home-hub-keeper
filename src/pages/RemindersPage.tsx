
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '@/components/ui/button';
import { Bell, Calendar, Check, Info, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const RemindersPage: React.FC = () => {
  const { reminders, markReminderComplete, appliances, getApplianceById } = useApp();
  const [activeTab, setActiveTab] = useState('upcoming');

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Helper function to calculate days until date
  const daysUntil = (dateString: string) => {
    const targetDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Filter reminders based on active tab
  const filteredReminders = reminders.filter(reminder => {
    if (activeTab === 'upcoming') {
      return !reminder.completed;
    } else if (activeTab === 'completed') {
      return reminder.completed;
    }
    return true;
  });

  // Sort reminders by due date (upcoming first for incomplete, most recently completed first for completed)
  const sortedReminders = [...filteredReminders].sort((a, b) => {
    if (activeTab === 'upcoming') {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    } else {
      return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
    }
  });

  const getRemainderStatusColor = (daysLeft: number) => {
    if (daysLeft < 0) return 'text-red-600';
    if (daysLeft < 7) return 'text-amber-600';
    if (daysLeft < 30) return 'text-blue-600';
    return 'text-green-600';
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Maintenance Reminders</h1>
          <p className="text-gray-600 mt-1">Schedule and track maintenance tasks</p>
        </div>
        <Button asChild>
          <Link to="/reminders/add">
            <Plus className="h-4 w-4 mr-2" /> Add Reminder
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="upcoming" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6 max-w-md">
          <TabsTrigger value="upcoming">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Upcoming</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="completed">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              <span>Completed</span>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-0">
          {sortedReminders.length > 0 ? (
            <div className="space-y-3">
              {sortedReminders.map((reminder) => {
                const appliance = getApplianceById(reminder.applianceId);
                const daysLeft = daysUntil(reminder.dueDate);
                const statusColor = getRemainderStatusColor(daysLeft);
                
                return (
                  <div key={reminder.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3">
                        <div className="p-2 bg-gray-100 rounded-full">
                          <Bell className="h-5 w-5 text-maintenance-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{reminder.title}</h3>
                          {appliance && (
                            <p className="text-sm text-gray-500">
                              For: {appliance.name}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">Due: {formatDate(reminder.dueDate)}</span>
                            <span className={`text-xs font-medium ml-2 ${statusColor}`}>
                              {daysLeft === 0 ? 'Today' : 
                               daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : 
                               `${daysLeft} days left`}
                            </span>
                          </div>
                          {reminder.recurring && (
                            <div className="mt-1">
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                Recurring {reminder.recurrencePattern}
                              </span>
                            </div>
                          )}
                          {reminder.description && (
                            <p className="text-sm text-gray-600 mt-2">{reminder.description}</p>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="shrink-0"
                        onClick={() => markReminderComplete(reminder.id)}
                      >
                        <Check className="h-4 w-4 mr-1" /> Mark Complete
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-200 rounded-lg">
              <div className="h-14 w-14 flex items-center justify-center rounded-full bg-maintenance-50 mb-4">
                <Info className="h-6 w-6 text-maintenance-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-800">No Upcoming Maintenance Tasks</h3>
              <p className="text-gray-500 text-center max-w-md mt-1">
                Stay on top of home maintenance by scheduling regular reminders for your appliances and fixtures.
              </p>
              <Button className="mt-6" asChild>
                <Link to="/reminders/add">
                  <Plus className="h-4 w-4 mr-2" /> Schedule Maintenance
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-0">
          {sortedReminders.length > 0 ? (
            <div className="space-y-3">
              {sortedReminders.map((reminder) => {
                const appliance = getApplianceById(reminder.applianceId);
                
                return (
                  <div key={reminder.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm opacity-80">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-100 rounded-full">
                        <Check className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{reminder.title}</h3>
                        {appliance && (
                          <p className="text-sm text-gray-500">
                            For: {appliance.name}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Completed: {formatDate(reminder.dueDate)}</span>
                        </div>
                        {reminder.recurring && (
                          <div className="mt-1">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                              Recurring {reminder.recurrencePattern}
                            </span>
                          </div>
                        )}
                        {reminder.description && (
                          <p className="text-sm text-gray-600 mt-2">{reminder.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-200 rounded-lg">
              <div className="h-14 w-14 flex items-center justify-center rounded-full bg-gray-100 mb-4">
                <Check className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-800">No Completed Tasks</h3>
              <p className="text-gray-500 text-center max-w-md mt-1">
                Complete maintenance tasks to see them listed here.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RemindersPage;
