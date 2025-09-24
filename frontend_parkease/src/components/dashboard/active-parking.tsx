'use client';

import { useState, useEffect } from 'react';
import type { ParkingRecord } from '@/lib/types';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search } from 'lucide-react';
import ActiveParkingTable from './active-parking-table';
import VehicleEntryModal from './vehicle-entry-modal';
import PaymentModal from './payment-modal';
import { useToast } from '@/hooks/use-toast';
import { ParkingAPI } from '@/lib/api';

interface ActiveParkingProps {
  branchId?: string; // Admin can pass a branchId to view its data
  readOnly?: boolean; // Admin view is read-only
}

export default function ActiveParking({ branchId, readOnly = false }: ActiveParkingProps) {
  const { user, userData } = useAuth();
  const { toast } = useToast();
  const [records, setRecords] = useState<ParkingRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<ParkingRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isEntryModalOpen, setEntryModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ParkingRecord | null>(null);
  const [paymentInitiatedAt, setPaymentInitiatedAt] = useState<Date | null>(null);


  const targetUserId = branchId || user?.uid;
  const hourlyCost = userData?.hourlyCost ?? 0;

  useEffect(() => {
    let timer: any;
    const fetchActive = async () => {
      if (!targetUserId) return;
      try {
        setIsLoading(true);
        const res = await ParkingAPI.getActive(branchId);
        const fetched = (res?.records || []) as ParkingRecord[];
        fetched.sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime());
        setRecords(fetched);
      } catch (error) {
        console.error('Error fetching parking records:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudieron obtener los registros de estacionamiento.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchActive();
    // Simple polling every 10s to mimic realtime
    timer = setInterval(fetchActive, 10000);
    return () => clearInterval(timer);
  }, [targetUserId, toast, branchId]);

  useEffect(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = records.filter(record => 
      record.plate.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredRecords(filtered);
  }, [searchQuery, records]);

  const handleOpenPaymentModal = (record: ParkingRecord) => {
    if (readOnly) return;
    setPaymentInitiatedAt(new Date()); // Freeze time
    setSelectedRecord(record);
  };

  const handleClosePaymentModal = () => {
    setSelectedRecord(null);
    setPaymentInitiatedAt(null);
  };

  const handleAddRecord = async (plate: string) => {
    if (!targetUserId || readOnly) return;

    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Error de Autenticación',
        description: 'Debes iniciar sesión para agregar un registro.',
      });
      return;
    }

    try {
      await ParkingAPI.createEntry(plate, branchId);
      toast({ title: 'Entrada registrada', description: `Vehículo ${plate} registrado.` });
      const res = await ParkingAPI.getActive(branchId);
      setRecords((res?.records || []) as ParkingRecord[]);
      setEntryModalOpen(false);
    } catch (error) {
      console.error('Error agregando registro: ', error);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo registrar la entrada.' });
    }
  };

  const handlePaymentSuccess = async () => {
    // After successful payment, refresh list
    try {
      const res = await ParkingAPI.getActive(branchId);
      setRecords((res?.records || []) as ParkingRecord[]);
    } catch (e) {
      // ignore
    } finally {
      setSelectedRecord(null);
      setPaymentInitiatedAt(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Vehículos Estacionados</CardTitle>
          <div className="flex w-full sm:w-auto flex-col sm:flex-row sm:items-center gap-2">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por placa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {!readOnly && (
              <Button size="sm" onClick={() => setEntryModalOpen(true)} className="w-full sm:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" />
                Registrar Entrada
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
