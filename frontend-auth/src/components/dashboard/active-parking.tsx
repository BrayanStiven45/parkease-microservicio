// ActiveParking.tsx
import { useState, useEffect } from 'react';
import type { ParkingRecord } from '@/lib/types';
import { parkingService } from '@/lib/services/parking-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search } from 'lucide-react';
import ActiveParkingTable from './active-parking-table';
import VehicleEntryModal from './vehicle-entry-modal';
import PaymentModal from './payment-modal';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';

interface ActiveParkingProps {
  branchId?: string;
  readOnly?: boolean;
}

export default function ActiveParking({ branchId, readOnly = false }: ActiveParkingProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [records, setRecords] = useState<ParkingRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<ParkingRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isEntryModalOpen, setEntryModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ParkingRecord | null>(null);
  const [paymentInitiatedAt, setPaymentInitiatedAt] = useState<Date | null>(null);

  const targetUserId = branchId || user?.uid;
  const hourlyCost = user?.hourlyCost ?? 3000;

  // 🔹 Función para cargar registros activos
  const loadActiveRecords = async () => {
    if (!targetUserId) return;

    try {
      setIsLoading(true);
      const fetchedRecords = await parkingService.getActiveParkingRecords();
      
      // Ordenar por tiempo de entrada (más recientes primero)
      fetchedRecords.sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime());
      
      setRecords(fetchedRecords);
    } catch (error: any) {
      console.error('Error fetching parking records:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Could not fetch parking records.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 Cargar registros desde el servicio
  useEffect(() => {
    loadActiveRecords();
  }, [targetUserId]);

  // 🔹 Configurar updates en tiempo real (polling cada 30 segundos)
  useEffect(() => {
    if (!targetUserId) return;

    const interval = setInterval(() => {
      loadActiveRecords();
    }, 30000);

    return () => clearInterval(interval);
  }, [targetUserId]);

  // 🔹 Filtrado
  useEffect(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    setFilteredRecords(records.filter(record => record.plate.toLowerCase().includes(lowercasedQuery)));
  }, [searchQuery, records]);

  const handleOpenPaymentModal = (record: ParkingRecord) => {
    if (readOnly) return;
    setPaymentInitiatedAt(new Date());
    setSelectedRecord(record);
  };

  const handleClosePaymentModal = () => {
    setSelectedRecord(null);
    setPaymentInitiatedAt(null);
  };

  const handleAddRecord = async (plate: string) => {
    if (readOnly || !user) return;

    try {
      await parkingService.addParkingRecord(plate);
      toast({ 
        title: 'Success', 
        description: `Vehicle with plate ${plate} has been registered.` 
      });
      // Recargar registros activos
      await loadActiveRecords();
    } catch (error: any) {
      console.error('Error adding parking record:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Error', 
        description: error.message || 'Failed to add new parking record.' 
      });
    }
  };

  const handlePaymentSuccess = async () => {
    handleClosePaymentModal();
    // Recargar los registros activos después del pago
    await loadActiveRecords();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Active Parking</CardTitle>
            <div className="flex w-full sm:w-auto flex-col sm:flex-row sm:items-center gap-2">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by plate..."
                  className="pl-8 sm:w-[200px] lg:w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {!readOnly && (
                <Button size="sm" onClick={() => setEntryModalOpen(true)} className="w-full sm:w-auto">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Record Entry
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ActiveParkingTable
            records={filteredRecords}
            onProcessPayment={handleOpenPaymentModal}
            isLoading={isLoading}
            hasSearchQuery={searchQuery.length > 0}
            readOnly={readOnly}
            paymentInitiatedAt={paymentInitiatedAt}
            selectedRecordId={selectedRecord?.id || null}
          />
        </CardContent>
      </Card>

      {!readOnly && (
        <>
          <VehicleEntryModal 
            isOpen={isEntryModalOpen} 
            onClose={() => setEntryModalOpen(false)} 
            onAddRecord={handleAddRecord} 
          />
          
          {selectedRecord && (
            <PaymentModal
              record={selectedRecord}
              onClose={handleClosePaymentModal}
              onPaymentSuccess={handlePaymentSuccess}
              userId={targetUserId}
              hourlyCost={hourlyCost}
              paymentInitiatedAt={paymentInitiatedAt!}
            />
          )}
        </>
      )}
    </>
  );
}
