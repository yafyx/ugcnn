"use client";
import React, { useState, useMemo, useCallback } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Pagination,
  SortDescriptor,
} from "@nextui-org/react";
import { Card, CardHeader, CardBody } from "@nextui-org/card";
import { SearchIcon } from "@/components/SearchIcon";
import { ChevronDownIcon } from "@/components/ChevronDownIcon";
import { capitalize } from "@/config/utils";
import dynamic from "next/dynamic";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const CSVLink = dynamic(() => import("react-csv").then((mod) => mod.CSVLink), {
  ssr: false,
});

const ROWS_PER_PAGE = 10;

interface MahasiswaBaru {
  no_pend: string;
  nama: string;
  npm: string;
  kelas: string;
  keterangan: string;
}

interface KelasBaru {
  npm: string;
  nama: string;
  kelas_lama: string;
  kelas_baru: string;
}

type MahasiswaItem = MahasiswaBaru | KelasBaru;

interface MahasiswaTableProps {
  data: MahasiswaItem[];
  type: "mahasiswaBaru" | "kelasBaru";
}

export default function MahasiswaTable({ data, type }: MahasiswaTableProps) {
  const [filterValue, setFilterValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<Set<string>>(
    new Set(["all"]),
  );
  const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "nama",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);

  const columns = useMemo(() => {
    return type === "mahasiswaBaru"
      ? [
          { name: "No. Pend", uid: "no_pend", sortable: true },
          { name: "Nama", uid: "nama", sortable: true },
          { name: "NPM", uid: "npm", sortable: true },
          { name: "Kelas", uid: "kelas", sortable: true },
          { name: "Keterangan", uid: "keterangan", sortable: true },
        ]
      : [
          { name: "NPM", uid: "npm", sortable: true },
          { name: "Nama", uid: "nama", sortable: true },
          { name: "Kelas Lama", uid: "kelas_lama", sortable: true },
          { name: "Kelas Baru", uid: "kelas_baru", sortable: true },
        ];
  }, [type]);

  const statusOptions = useMemo(() => {
    const field = type === "mahasiswaBaru" ? "kelas" : "kelas_baru";
    const uniqueKelas = Array.from(
      new Set(data.map((item) => item[field as keyof MahasiswaItem])),
    );
    return [
      { name: "All", uid: "all" },
      ...uniqueKelas.map((kelas) => ({ name: kelas, uid: kelas })),
    ];
  }, [data, type]);

  const filteredItems = useMemo(() => {
    let filteredData = [...data];

    if (filterValue) {
      filteredData = filteredData.filter((item) =>
        item.nama.toLowerCase().includes(filterValue.toLowerCase()),
      );
    }
    if (!statusFilter.has("all")) {
      const field = type === "mahasiswaBaru" ? "kelas" : "kelas_baru";
      filteredData = filteredData.filter((item) =>
        statusFilter.has(item[field as keyof MahasiswaItem] as string),
      );
    }

    return filteredData;
  }, [data, filterValue, statusFilter, type]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column as keyof MahasiswaItem];
      const second = b[sortDescriptor.column as keyof MahasiswaItem];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = useCallback(
    (item: MahasiswaItem, columnKey: keyof MahasiswaItem) => item[columnKey],
    [],
  );

  const onNextPage = useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const onRowsPerPageChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
      setPage(1);
    },
    [],
  );

  const onSearchChange = useCallback((value: string) => {
    setFilterValue(value);
    setPage(1);
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const exportToPDF = useCallback(() => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [columns.map((col) => col.name)],
      body: filteredItems.map((item) =>
        columns.map((col) => item[col.uid as keyof MahasiswaItem]),
      ),
    });
    doc.save(
      `${type === "mahasiswaBaru" ? "mahasiswa_baru" : "kelas_baru"}_${new Date().toISOString()}.pdf`,
    );
  }, [columns, filteredItems, type]);

  const csvData = useMemo(() => {
    const headers = columns.map((col) => col.name);
    const rows = filteredItems.map((item) =>
      columns.map((col) => item[col.uid as keyof MahasiswaItem]),
    );
    return [headers, ...rows];
  }, [columns, filteredItems]);

  const exportFileName = `${type === "mahasiswaBaru" ? "mahasiswa_baru" : "kelas_baru"}_${new Date().toISOString()}.csv`;

  const topContent = useMemo(
    () => (
      <div className="flex w-full flex-col gap-3">
        <div className="flex flex-col items-start justify-between gap-3 p-1 sm:flex-row sm:items-center">
          <h2 className="text-xl font-semibold">
            Daftar {type === "mahasiswaBaru" ? "Mahasiswa Baru" : "Kelas Baru"}
          </h2>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Input
              variant="faded"
              isClearable
              className="w-full sm:w-auto"
              placeholder="Cari Nama..."
              startContent={<SearchIcon />}
              value={filterValue}
              onClear={onClear}
              onValueChange={onSearchChange}
            />
            <div className="flex gap-3">
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    endContent={<ChevronDownIcon className="text-small" />}
                    variant="bordered"
                  >
                    Filter
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  disallowEmptySelection
                  aria-label="Table Columns"
                  closeOnSelect={false}
                  selectedKeys={statusFilter}
                  selectionMode="multiple"
                  onSelectionChange={(keys) =>
                    setStatusFilter(keys as Set<string>)
                  }
                >
                  {statusOptions.map((status) => (
                    <DropdownItem key={status.uid} className="capitalize">
                      {capitalize(status.name)}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
              <Dropdown>
                <DropdownTrigger>
                  <Button endContent={<ChevronDownIcon />} variant="bordered">
                    Export
                  </Button>
                </DropdownTrigger>
                <DropdownMenu variant="faded">
                  <DropdownItem key="csv" description="Ekspor ke file CSV">
                    <CSVLink data={csvData} filename={exportFileName}>
                      Export to CSV
                    </CSVLink>
                  </DropdownItem>
                  <DropdownItem
                    key="pdf"
                    description="Ekspor ke file PDF"
                    onPress={exportToPDF}
                  >
                    Export to PDF
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-small text-default-400">
            Total {data.length}{" "}
            {type === "mahasiswaBaru" ? "mahasiswa" : "kelas"}
          </span>
          <label className="flex items-center text-small text-default-400">
            Rows per page:
            <select
              className="ml-2 bg-transparent text-small text-default-400 outline-none"
              onChange={onRowsPerPageChange}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </label>
        </div>
      </div>
    ),
    [
      filterValue,
      statusFilter,
      onSearchChange,
      onRowsPerPageChange,
      data.length,
      onClear,
      statusOptions,
      csvData,
      exportFileName,
      exportToPDF,
      type,
    ],
  );

  const bottomContent = useMemo(
    () => (
      <div className="flex items-center justify-between px-2 py-2">
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={pages}
          onChange={setPage}
        />
        <div className="hidden gap-2 sm:flex">
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onPreviousPage}
          >
            Previous
          </Button>
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    ),
    [page, pages, onPreviousPage, onNextPage],
  );

  return (
    <Card>
      <CardHeader className="bg-white/50 dark:bg-zinc-800/50">
        {topContent}
      </CardHeader>
      <CardBody className="px-2 sm:px-4">
        <div className="overflow-x-auto">
          <Table
            shadow="none"
            aria-label="Mahasiswa Table"
            isHeaderSticky
            bottomContent={bottomContent}
            bottomContentPlacement="outside"
            classNames={{
              wrapper: "min-w-full",
              th: "text-xs sm:text-sm whitespace-nowrap",
              td: "text-xs sm:text-sm whitespace-nowrap",
            }}
            sortDescriptor={sortDescriptor}
            onSortChange={setSortDescriptor}
          >
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn
                  key={column.uid}
                  align={column.uid === "actions" ? "center" : "start"}
                  allowsSorting={column.sortable}
                >
                  {column.name}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody emptyContent={"Not found"} items={sortedItems}>
              {(item) => (
                <TableRow key={item.npm}>
                  {(columnKey) => (
                    <TableCell>
                      {renderCell(item, columnKey as keyof MahasiswaItem)}
                    </TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardBody>
    </Card>
  );
}
