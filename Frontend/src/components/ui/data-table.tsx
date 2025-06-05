import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';

interface DataTableProps<TData> {
  columns: any[];
  data: TData[];
  searchKey: string;
  searchPlaceholder: string;
}

export function DataTable<TData>({
  columns,
  data,
  searchKey,
  searchPlaceholder,
}: DataTableProps<TData>) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter((item: any) => {
    const searchValue = searchKey.split('.').reduce((obj, key) => obj?.[key], item);
    return searchValue?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div>
      <div className="flex items-center py-4 px-4">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.accessorKey || column.id}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((row: any, i) => (
                <TableRow key={i}>
                  {columns.map((column) => (
                    <TableCell key={column.accessorKey || column.id}>
                      {column.cell({ row: { original: row } })}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 