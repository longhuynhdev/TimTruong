import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import PageMetadata from "@/components/PageMetadata";
import { SUBJECT_COMBINATIONS_FULL } from "@/constants";
import type { SubjectCombinationDetail } from "@/types";

const SubjectCombinationsPage = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<SubjectCombinationDetail>[]>(
    () => [
      {
        accessorKey: "code",
        header: "Tên tổ hợp",
        cell: ({ row }) => (
          <Badge variant="outline" className="font-mono text-base px-3 py-1">
            {row.original.code}
          </Badge>
        ),
      },
      {
        accessorKey: "subjects",
        header: "Các môn trong tổ hợp",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            {row.original.subjects.map((subject, index) => (
              <span key={index} className="text-foreground">
                {subject}
                {index < row.original.subjects.length - 1 && (
                  <span className="text-muted-foreground">, </span>
                )}
              </span>
            ))}
          </div>
        ),
        enableSorting: false,
      },
    ],
    []
  );

  const table = useReactTable({
    data: SUBJECT_COMBINATIONS_FULL,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <>
      <PageMetadata
        title="Danh sách tổ hợp môn"
        description="Danh sách đầy đủ các tổ hợp môn thi THPTQG - Hệ thống tư vấn tuyển sinh TimTruong"
      />
      <div className="flex-1 bg-background p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg bg-card border-border">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-foreground">
                Danh sách các tổ hợp môn THPTQG
              </CardTitle>
              <p className="text-center text-muted-foreground mt-2">
                Các tổ hợp môn cho kỳ thi tốt nghiệp THPT quốc gia
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Input */}
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Tìm kiếm tổ hợp môn..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              {/* Table */}
              <div className="rounded-md border border-border">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id} className="font-semibold">
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                        >
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
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center"
                        >
                          Không tìm thấy kết quả.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Results Count */}
              <div className="text-sm text-muted-foreground text-center">
                Hiển thị {table.getFilteredRowModel().rows.length} tổ hợp môn
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default SubjectCombinationsPage;
