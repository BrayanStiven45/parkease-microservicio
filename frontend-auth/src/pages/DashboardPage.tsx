import { useEffect } from 'react';
import ActiveParking from '@/components/dashboard/active-parking';

export default function DashboardPage() {
  useEffect(() => {
    // TODO: Verify user authentication via API Gateway
    // For now, we'll just display the dashboard
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your parking operations and view active vehicles.
          </p>
        </div>
        
        <ActiveParking />
      </div>
    </div>
  );
}