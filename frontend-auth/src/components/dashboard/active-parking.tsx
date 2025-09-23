// ActiveParking.tsx
import { useState, useEffect } from 'react';
import { ParkingRecord, parkingService } from '@/lib/parking-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle } from 'lucide-react';
import ActiveParkingTable from './active-parking-table';
import VehicleEntryModal from './vehicle-entry-modal';
import PaymentModal from './payment-modal';
import { useToast } from '@/hooks/use-toast';

interface ActiveParkingProps {
  readOnly?: boolean;
}

export default function ActiveParking({ readOnly = false }: ActiveParkingProps) {
  const { toast } = useToast();
  const [records, setRecords] = useState<ParkingRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<ParkingRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isEntryModalOpen, setEntryModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ParkingRecord | null>(null);
  const [paymentInitiatedAt, setPaymentInitiatedAt] = useState<Date | null>(null);

  // 🔹 Cargar registros desde el servicio
  useEffect(() => {
    setIsLoading(true);
    parkingService.getActiveParkingRecords()
      .then((fetchedRecords) => {
        setRecords(fetchedRecords);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching parking records:", error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not fetch parking records.',
        });
        setIsLoading(false);
      });
  }, [toast]);

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

  const handleAddRecord = async (plate: string) => {
    if (readOnly) return;
    try {
      await parkingService.addParkingRecord(plate);
      toast({ title: 'Success', description: `Vehicle ${plate} registered.` });
      const updated = await parkingService.getActiveParkingRecords();
      setRecords(updated);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to add new parking record.' });
    }
  };

  const handlePaymentSuccess = async () => {
    if (!selectedRecord) return;
    try {
      await parkingService.processPayment(selectedRecord.id);
      toast({ title: 'Payment successful', description: 'Parking closed successfully.' });
      const updated = await parkingService.getActiveParkingRecords();
      setRecords(updated);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Payment failed.' });
    } finally {
      setSelectedRecord(null);
      setPaymentInitiatedAt(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Parking</CardTitle>
        <div className="flex gap-2">
          <Input placeholder="Search by plate..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          {!readOnly && (
            <Button size="sm" onClick={() => setEntryModalOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Record Entry
            </Button>
          )}
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

      <VehicleEntryModal isOpen={isEntryModalOpen} onClose={() => setEntryModalOpen(false)} onAddRecord={handleAddRecord} />
      {selectedRecord && (
        <PaymentModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onPaymentSuccess={handlePaymentSuccess}
          userId="" // ya no se necesita, lo toma parkingService de useAuth
          hourlyCost={0} // idem, lo maneja parkingService
          paymentInitiatedAt={paymentInitiatedAt!}
        />
      )}
    </Card>
  );
}
