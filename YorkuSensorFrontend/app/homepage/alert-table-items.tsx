"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import {
  PaginationState, 
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, Trash } from "lucide-react"
import { useSocket } from "@/hooks/useSockets"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Alert {
  id: number,
  building_name: string,
  timestamp: string
  alert_type: string
  value: number
  sensor_id: number
}

interface AlertTableItemsProps {
  timeRange: string
}

export default function AlertTableItems({ timeRange }: AlertTableItemsProps) {
  const socket = useSocket()
  const [alerts, setAlerts] = useState<Alert[]>([])

  // 1) socket setup → populate `alerts`
  useEffect(() => {
    if (!socket) return

    socket.emit("get_alert_data", { time_range: timeRange })

    socket.on("surpassed_threshold", (update) => {
      if (update.status_code === 200 && update.data) {
        toast.error(`${update.data.alert_type}: ${update.data.value}`, {
          description: new Date(update.data.timestamp).toLocaleString(),
        })
        setAlerts((prev) => [...prev, update.data])
      }
    })

    socket.on("alert_data", (response) => {
      if (response.status_code === 200 && response.data) {
        setAlerts(response.data)
      }
    })

    return () => {
      socket.off("surpassed_threshold")
      socket.off("alert_data")
    }
  }, [socket, timeRange])

  // 2) define your Alert‐columns
  const columns: ColumnDef<Alert>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "timestamp",
      header: () => (
        <Button
          variant="ghost"
          onClick={() => {/* maybe sort by time */}}
        >
          Time <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        new Date(row.getValue("timestamp")).toLocaleString()
      ),
    },
    {
      accessorKey: "alert_type",
      header: "Type",
      cell: ({ row }) => (
        <span className="capitalize">{row.getValue("alert_type")}</span>
      ),
    },
    {
      accessorKey: "value",
      header: () => <div className="text-right">Value</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium">{row.getValue("value")}</div>
      ),
    },
    {
      accessorKey: "sensor_id",
      header: "Sensor ID",
      cell: ({ row }) => <div>{row.getValue("sensor_id")}</div>,
    },
    {
      accessorKey: "building_name",
      header: "Building Name",
      cell: ({ row }) => <div>{row.getValue("building_name")}</div>,
    },
  ]

  // 3) wire up React-Table with alerts
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "timestamp", desc: true },
  ])
  const [globalFilter, setGlobalFilter] = React.useState<string>("")
  const [columnFilters, setColumnFilters] =React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })


  const table = useReactTable({
    data: alerts,
    columns,
    state: {
      globalFilter, 
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination, 
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange:        setSorting,
    onColumnFiltersChange:  setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection, 
    onPaginationChange:     setPagination,
  
    // <-- smart global filter:
    globalFilterFn: (row, _columnId, filterValue) => {
      const val = filterValue.trim().toLowerCase()
  
      // 1) If the user typed only digits, treat as sensor_id search
      if (/^\d+$/.test(val)) {
        return row.original.sensor_id
          .toString()
          .includes(val)
      }
  
      // 2) If they typed a full ISO date (YYYY-MM-DD), match exact date
      if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
        const dateStr = new Date(row.original.timestamp)
          .toISOString()
          .slice(0, 10)
        return dateStr === val
      }
  
      // 3) Otherwise do your normal OR-search across date / type / id
      const dateStr = new Date(row.original.timestamp)
        .toISOString()
        .slice(0, 10)
      return (
        dateStr.includes(val) ||
        row.original.alert_type
          .toLowerCase()
          .includes(val) ||
        row.original.sensor_id
          .toString()
          .includes(val) ||
        row.original.building_name
          .toLowerCase()
          .includes(val) 
      )
    },
  })
  

  return (
    <div className="w-full">
      {/* --- Filters & Column Toggle --- */}
      <div className="flex items-center py-4">
      <Input
        placeholder="Search date, type, sensor, building…"
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="max-w-md"
    />
    <Button
    variant="destructive"
    disabled={!socket || table.getFilteredSelectedRowModel().rows.length === 0}
    onClick={() => {
        if (!socket) {
        console.warn("Socket not ready yet")
        return
        }

        const ids = table
        .getSelectedRowModel()
        .rows
        .map((r) => r.original.id)

        socket.emit("delete_alert", { ids })
        console.log(`Ids: ${ids}`)
        setAlerts((prev) => prev.filter((a) => !ids.includes(a.id)))
        table.resetRowSelection()
    }}
    >
    <Trash />
    </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((col) => col.getCanHide())
              .map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  checked={col.getIsVisible()}
                  onCheckedChange={(v) => col.toggleVisibility(!!v)}
                >
                  {col.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* --- Table --- */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {!header.isPlaceholder &&
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No alerts.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- Pagination & Selection Summary --- */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} alert(s) selected.
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
