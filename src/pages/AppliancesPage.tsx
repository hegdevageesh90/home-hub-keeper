
import React from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info, Plus, Wrench } from 'lucide-react';
import { ApplianceCategory } from '../types';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

const AppliancesPage: React.FC = () => {
  const { appliances, homeProfile } = useApp();

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Helper function to get days until warranty expiration
  const daysUntilExpiration = (dateString: string) => {
    const expirationDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = expirationDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Helper function to get category icon
  const getCategoryIcon = (category: ApplianceCategory) => {
    switch(category) {
      case ApplianceCategory.HVAC:
        return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M12 3C5 3 2 10 2 12c0 .6 0 1 .1 1.4.2 1 .7 1.8 1.4 2.5 2.1 1.9 5.5 3.1 8.5 3.1m0-14c7 0 10 7 10 9 0 .6 0 1-.1 1.4-.2 1-.7 1.8-1.4 2.5-2.1 1.9-5.5 3.1-8.5 3.1"/><path d="m7 9 5 5"/><path d="m12 9-5 5"/></svg>;
      case ApplianceCategory.ELECTRICAL:
        return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><path d="M15 2v20M7 9h12M3 5l4 4L3 13"/></svg>;
      case ApplianceCategory.PLUMBING:
        return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-500"><path d="M11 2a2 2 0 0 0-2 2v14h4.14a2 2 0 0 1 1.9 1.348l-.833 5.345A2 2 0 0 0 16.14 27h2.593a2 2 0 0 0 1.945-1.531l1.394-6.142A2 2 0 0 0 20.125 16h-9.979L8 16V4a2 2 0 0 0-2-2H4"/></svg>;
      case ApplianceCategory.KITCHEN:
        return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><rect width="18" height="11" x="3" y="7" rx="2"/><path d="M7 7V3h10v4"/><path d="M7 11h10"/></svg>;
      case ApplianceCategory.LAUNDRY:
        return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500"><rect width="20" height="20" x="2" y="2" rx="2" ry="2"/><circle cx="12" cy="12" r="4"/><path d="M12 12v.01"/><path d="M8 16h.01"/><path d="M16 16h.01"/><path d="M16 8h.01"/><path d="M8 8h.01"/></svg>;
      case ApplianceCategory.ENTERTAINMENT:
        return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><path d="M4 9m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"/><path d="M16 3l-4 4l-4 -4"/></svg>;
      default:
        return <Wrench className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Appliances & Fixtures</h1>
          <p className="text-gray-600 mt-1">Manage your home appliances and their details</p>
        </div>
        <Button asChild>
          <Link to="/appliances/add">
            <Plus className="h-4 w-4 mr-2" /> Add Appliance
          </Link>
        </Button>
      </div>

      {appliances.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {appliances.map((appliance) => {
            const daysLeft = daysUntilExpiration(appliance.warrantyExpirationDate);
            const isExpired = daysLeft < 0;
            const isExpiringSoon = daysLeft >= 0 && daysLeft < 30;
            
            return (
              <Card key={appliance.id} className="card-hover-effect overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-medium">{appliance.name}</CardTitle>
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100">
                      {getCategoryIcon(appliance.category)}
                    </div>
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    {appliance.category}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Purchase Date</p>
                      <p className="text-sm">{formatDate(appliance.purchaseDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Warranty Expires</p>
                      <p className="text-sm flex items-center gap-2">
                        {formatDate(appliance.warrantyExpirationDate)}
                        {isExpired ? (
                          <Badge variant="destructive" className="text-xs">Expired</Badge>
                        ) : isExpiringSoon ? (
                          <Badge variant="outline" className="text-xs border-amber-500 text-amber-700">Expiring Soon</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs border-green-500 text-green-700">Active</Badge>
                        )}
                      </p>
                    </div>
                    {appliance.notes && (
                      <div>
                        <p className="text-xs text-gray-500">Notes</p>
                        <p className="text-sm text-gray-600">{appliance.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <div className="flex justify-between w-full">
                    <Button variant="ghost" size="sm">
                      Service History
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/appliances/${appliance.id}`}>Details</Link>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-200 rounded-lg">
          <div className="h-14 w-14 flex items-center justify-center rounded-full bg-maintenance-50 mb-4">
            <Info className="h-6 w-6 text-maintenance-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-800">No Appliances Added Yet</h3>
          <p className="text-gray-500 text-center max-w-md mt-1">
            Track your home appliances by adding information about each one, including warranty details and maintenance records.
          </p>
          <Button className="mt-6" asChild>
            <Link to="/appliances/add">
              <Plus className="h-4 w-4 mr-2" /> Add Your First Appliance
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default AppliancesPage;
