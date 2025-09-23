'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ParkingRecord, PaginationResponse } from '@/lib/types';
import { parkingService } from '@/lib/services/parking-service';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { format, isSameDay } from 'date-fns';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';

const ITEMS_PER_PAGE = 10;

export default function ParkingHistoryTable() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  
  const [records, setRecords] = useState<ParkingRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<ParkingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Cargar historial desde el servicio
  const loadHistory = async (page: number = 1, search?: string) => {
    try {
      setIsLoading(true);
      let historyData: PaginationResponse<ParkingRecord>;
      
      if (search) {
        historyData = await parkingService.searchParkingHistory(search, page);
      } else {
        historyData = await parkingService.getParkingHistory(page, ITEMS_PER_PAGE);
      }
      
      setRecords(historyData.records);
      setTotalPages(historyData.totalPages);
      setTotalCount(historyData.totalCount);
      setCurrentPage(historyData.currentPage);
    } catch (error: any) {
      console.error('Error loading parking history:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to load parking history.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user]);

  // Manejar búsqueda
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim()) {
        loadHistory(1, searchQuery);
      } else {
        loadHistory(1);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Filtrar por fecha seleccionada (lado cliente)
  useEffect(() => {
    if (selectedDate) {
      const filtered = records.filter(record => 
        isSameDay(new Date(record.entryTime), selectedDate)
      );
      setFilteredRecords(filtered);
    } else {
      setFilteredRecords(records);
    }
  }, [records, selectedDate]);

  const hasActiveFilters = searchQuery.length > 0 || selectedDate;
  const displayRecords = selectedDate ? filteredRecords : records;

  const handlePageChange = (newPage: number) => {
    if (!selectedDate) {
      loadHistory(newPage, searchQuery || undefined);
    } else {
      setCurrentPage(newPage);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDate(undefined);
    loadHistory(1);
  };

  const getEmptyStateMessage = () => {
    if (hasActiveFilters) {
      return "No records match the current filters.";
    }
    return "No historical records found.";
  };

  const paginatedRecords = selectedDate 
    ? filteredRecords.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
    : displayRecords;

  const maxPage = selectedDate 
    ? Math.ceil(filteredRecords.length / ITEMS_PER_PAGE) 
    : totalPages;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Parking History</CardTitle>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative w-full sm:w-auto flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by plate..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full sm:w-[240px] justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : <span>Pick an entry date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plate</TableHead>
                  {isAdmin && <TableHead>Branch</TableHead>}
                  <TableHead>Entry Time</TableHead>
                  <TableHead>Exit Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="text-right">Total Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRecords.length > 0 ? (
                  paginatedRecords.map((record) => {
                    const entryTime = new Date(record.entryTime);
                    const exitTime = record.exitTime ? new Date(record.exitTime) : null;
                    const duration = exitTime 
                      ? Math.ceil((exitTime.getTime() - entryTime.getTime()) / (1000 * 60 * 60))
                      : null;

                    return (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium font-mono">{record.plate}</TableCell>
                        {isAdmin && <TableCell>{record.parkingLotName || 'N/A'}</TableCell>}
                        <TableCell>{format(entryTime, 'MMM dd, yyyy HH:mm')}</TableCell>
                        <TableCell>
                          {exitTime ? format(exitTime, 'MMM dd, yyyy HH:mm') : '-'}
                        </TableCell>
                        <TableCell>{duration ? `${duration}h` : '-'}</TableCell>
                        <TableCell className="text-right">
                          {record.totalCost ? `$${(record.totalCost / 100).toFixed(2)}` : 'N/A'}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 6 : 5} className="text-center py-8">
                      {getEmptyStateMessage()}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                {selectedDate ? (
                  `${filteredRecords.length} records for ${format(selectedDate, 'PPP')}`
                ) : (
                  `${totalCount} total records`
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || displayRecords.length === 0}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {maxPage > 0 ? maxPage : 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === maxPage || displayRecords.length === 0}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}