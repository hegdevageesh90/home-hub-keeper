
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-maintenance-600">404</h1>
        <p className="text-2xl font-medium text-gray-700 mt-4">Page Not Found</p>
        <p className="text-gray-500 mt-2 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button className="mt-8" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
