
import React from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Calendar, Check, Clock, Home, Info, Wrench } from 'lucide-react';
import { ApplianceCategory, ServiceType } from '../types';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { 
    homeProfile, 
    appliances, 
    serviceRecords, 
    reminders,
    markReminderComplete,
    getApplianceById
  } = useApp();

  // Calculate total appliance count by category
  const appliancesByCategory = appliances.reduce((acc, appliance) => {
    const category = appliance.category;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category]++;
    return acc;
  }, {} as Record<ApplianceCategory, number>);

  // Get upcoming reminders (non-completed, sorted by due date)
  const upcomingReminders = reminders
    .filter(r => !r.completed)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);
  
  // Get expiring warranties (sort by closest expiry date)
  const expiringWarranties = [...appliances]
    .sort((a, b) => new Date(a.warrantyExpirationDate).getTime() - new Date(b.warrantyExpirationDate).getTime())
    .slice(0, 3);
  
  // Get recent service records
  const recentServiceRecords = [...serviceRecords]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);
  
  // Calculate total service costs this year
  const currentYear = new Date().getFullYear();
  const totalServiceCostThisYear = serviceRecords
    .filter(record => new Date(record.date).getFullYear() === currentYear)
    .reduce((total, record) => total + record.cost, 0);

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

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
  
  // Helper function to get service type badge color
  const getServiceTypeBadgeColor = (type: ServiceType) => {
    switch (type) {
      case ServiceType.REPAIR:
        return 'bg-orange-100 text-orange-800';
      case ServiceType.MAINTENANCE:
        return 'bg-green-100 text-green-800';
      case ServiceType.REPLACEMENT:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Welcome Section */}
      <section className="mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Welcome to Your Home Maintenance Logbook</h1>
              <p className="text-gray-600 mt-1">
                {homeProfile ? homeProfile.address : 'Add your home details to get started'}
              </p>
            </div>
            <Button asChild>
              <Link to="/appliances/add">
                Add New Appliance
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-hover-effect">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Appliances</p>
                <h3 className="text-2xl font-bold">{appliances.length}</h3>
              </div>
              <div className="p-2 bg-blue-100 rounded">
                <Wrench className="h-6 w-6 text-maintenance-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover-effect">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Service Records</p>
                <h3 className="text-2xl font-bold">{serviceRecords.length}</h3>
              </div>
              <div className="p-2 bg-green-100 rounded">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover-effect">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Maintenance Tasks</p>
                <h3 className="text-2xl font-bold">{reminders.length}</h3>
              </div>
              <div className="p-2 bg-purple-100 rounded">
                <Bell className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover-effect">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">This Year's Costs</p>
                <h3 className="text-2xl font-bold">{formatCurrency(totalServiceCostThisYear)}</h3>
              </div>
              <div className="p-2 bg-amber-100 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Main Content */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Maintenance */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Bell className="h-5 w-5" /> 
              Upcoming Maintenance
            </CardTitle>
            <CardDescription>Tasks that need your attention soon</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingReminders.length > 0 ? (
              <div className="space-y-4">
                {upcomingReminders.map(reminder => {
                  const appliance = getApplianceById(reminder.applianceId);
                  const daysLeft = daysUntil(reminder.dueDate);
                  
                  return (
                    <div key={reminder.id} className="flex items-center justify-between border-b pb-3">
                      <div className="flex-1">
                        <h4 className="font-medium">{reminder.title}</h4>
                        <p className="text-sm text-gray-500">
                          {appliance ? `For ${appliance.name}` : 'Unknown appliance'}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {formatDate(reminder.dueDate)}
                            {daysLeft <= 7 && (
                              <span className="ml-2 text-xs font-medium text-red-500">
                                {daysLeft === 0 ? 'Due today!' : daysLeft > 0 ? `${daysLeft} days left` : `${Math.abs(daysLeft)} days overdue`}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="shrink-0 gap-1" onClick={() => markReminderComplete(reminder.id)}>
                        <Check className="h-3.5 w-3.5" />
                        <span>Mark Complete</span>
                      </Button>
                    </div>
                  );
                })}
                <div className="pt-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/reminders">View All Reminders</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <Info className="h-10 w-10 text-gray-300 mb-2" />
                <p className="text-gray-500">No upcoming maintenance tasks</p>
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <Link to="/reminders/add">Schedule Maintenance</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Home Profile Summary */}
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Home className="h-5 w-5" />
              Home Profile
            </CardTitle>
            <CardDescription>Your property details</CardDescription>
          </CardHeader>
          <CardContent>
            {homeProfile ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p>{homeProfile.address}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Year Built</p>
                  <p>{homeProfile.constructionYear}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Appliance Categories</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Object.entries(appliancesByCategory).map(([category, count]) => (
                      <span key={category} className="text-xs bg-gray-100 text-gray-800 px-2.5 py-1 rounded-full">
                        {category}: {count}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="pt-2">
                  <Button variant="ghost" size="sm">
                    Edit Profile
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <Home className="h-10 w-10 text-gray-300 mb-2" />
                <p className="text-gray-500">No home profile set up yet</p>
                <Button variant="outline" size="sm" className="mt-4">
                  Add Home Profile
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Recent Service Records */}
      <section className="mt-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Service Records
            </CardTitle>
            <CardDescription>Latest maintenance and repairs</CardDescription>
          </CardHeader>
          <CardContent>
            {recentServiceRecords.length > 0 ? (
              <div className="space-y-4">
                {recentServiceRecords.map(record => {
                  const appliance = getApplianceById(record.applianceId);
                  
                  return (
                    <div key={record.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{appliance?.name || 'Unknown Appliance'}</h4>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getServiceTypeBadgeColor(record.serviceType)}`}>
                              {record.serviceType}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            Provider: {record.providerName}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-gray-400" />
                              <span className="text-xs text-gray-500">{formatDate(record.date)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
                                <path d="M12 18V6"/>
                              </svg>
                              <span className="text-xs text-gray-500">{formatCurrency(record.cost)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {record.notes && (
                        <div className="mt-3 border-t pt-3">
                          <p className="text-xs text-gray-600">{record.notes}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
                <div className="pt-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/service-records">View All Records</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <Clock className="h-10 w-10 text-gray-300 mb-2" />
                <p className="text-gray-500">No service records added yet</p>
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <Link to="/service-records/add">Add Service Record</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Dashboard;
