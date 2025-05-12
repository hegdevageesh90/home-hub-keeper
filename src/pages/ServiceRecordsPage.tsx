
import React from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '@/components/ui/button';
import { FileText, Info, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ServiceType } from '../types';

const ServiceRecordsPage: React.FC = () => {
  const { serviceRecords, appliances, getApplianceById } = useApp();

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
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
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Service Records</h1>
          <p className="text-gray-600 mt-1">Track maintenance, repairs, and replacements</p>
        </div>
        <Button asChild>
          <Link to="/service-records/add">
            <Plus className="h-4 w-4 mr-2" /> Add Service Record
          </Link>
        </Button>
      </div>

      {serviceRecords.length > 0 ? (
        <div className="space-y-4">
          {serviceRecords.map((record) => {
            const appliance = getApplianceById(record.applianceId);
            
            return (
              <Card key={record.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50 py-3 px-4 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-100">
                      <FileText className="h-5 w-5 text-maintenance-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-medium">{appliance?.name || 'Unknown Appliance'}</h3>
                      <p className="text-sm text-gray-500">
                        Provider: {record.providerName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${getServiceTypeBadgeColor(record.serviceType)}`}>
                      {record.serviceType}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-6 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="text-sm font-medium">{formatDate(record.date)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Cost</p>
                      <p className="text-sm font-medium">{formatCurrency(record.cost)}</p>
                    </div>
                    {record.providerContact && (
                      <div>
                        <p className="text-xs text-gray-500">Provider Contact</p>
                        <p className="text-sm font-medium">{record.providerContact}</p>
                      </div>
                    )}
                  </div>
                  
                  {record.notes && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Notes</p>
                      <p className="text-sm text-gray-700">{record.notes}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-end mt-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/service-records/${record.id}`}>View Details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-200 rounded-lg">
          <div className="h-14 w-14 flex items-center justify-center rounded-full bg-maintenance-50 mb-4">
            <Info className="h-6 w-6 text-maintenance-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-800">No Service Records Added Yet</h3>
          <p className="text-gray-500 text-center max-w-md mt-1">
            Keep track of all maintenance, repairs, and replacements for your home appliances and fixtures.
          </p>
          <Button className="mt-6" asChild>
            <Link to="/service-records/add">
              <Plus className="h-4 w-4 mr-2" /> Add Your First Service Record
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default ServiceRecordsPage;
