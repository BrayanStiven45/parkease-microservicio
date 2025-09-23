'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { ParkingRecord } from '@/lib/types';
import { format, intervalToDuration } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface ActiveParkingTableProps {
  records: ParkingRecord[];
  onProcessPayment: (record: ParkingRecord) => void;
  isLoading: boolean;
  hasSearchQuery: boolean;
  readOnly?: boolean;
  paymentInitiatedAt: Date | null;
  selectedRecordId: string | null;
}

const formatElapsedTime = (start: Date, end: Date) => {
    if (!(start instanceof Date) || isNaN(start.getTime())) {
        return 'Calculating...';
    }
    const duration = intervalToDuration({ start, end });
    return `${duration.hours || 0}h ${duration.minutes || 0}m ${duration.seconds || 0}s`;
}

export default function ActiveParkingTable({ 
  records, 
  onProcessPayment, 
  isLoading, 
  hasSearchQuery, 
  readOnly = false,
  paymentInitiatedAt,
  selectedRecordId 
}: ActiveParkingTableProps) {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (isLoading) {
        return (
             <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        )
    }

    const getEmptyStateMessage = () => {
        if (hasSearchQuery) {
            return "No vehicles found with that plate.";
        }
        return "No vehicles currently parked.";
    }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Plate</TableHead>
          <TableHead>Entry Time</TableHead>
          <TableHead>Elapsed Time</TableHead>
          {!readOnly && <TableHead className="text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.length > 0 ? (
          records.map((record) => {
            const isSelectedForPayment = record.id === selectedRecordId && paymentInitiatedAt;
            const endTime = isSelectedForPayment ? paymentInitiatedAt : now;

            return (
              <TableRow key={record.id}>
                <TableCell className="font-medium font-code">{record.plate}</TableCell>
                <TableCell>{record.entryTime ? format(new Date(record.entryTime), 'Pp') : '...'}</TableCell>
                <TableCell>{record.entryTime ? formatElapsedTime(new Date(record.entryTime), endTime) : '...'}</TableCell>
                {!readOnly && (
                  <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => onProcessPayment(record)}>
                      Process Payment
                      </Button>
                  </TableCell>
                )}
              </TableRow>
            )
          })
        ) : (
          <TableRow>
            <TableCell colSpan={readOnly ? 3 : 4} className="text-center">
              {getEmptyStateMessage()}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
