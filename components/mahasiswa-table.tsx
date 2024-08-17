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
  Chip,
  User,
  Pagination,
  Selection,
  SortDescriptor,
} from "@nextui-org/react";
import { SearchIcon } from "@/components/SearchIcon";
import { ChevronDownIcon } from "@/components/ChevronDownIcon";
import { capitalize } from "@/config/utils";

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
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(["nama", "npm", "kelas"])
  );
  const [statusFilter, setStatusFilter] = useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "nama",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);

  const columns = useMemo(() => {
    if (type === "mahasiswaBaru") {
      return [
        { name: "NO PEND", uid: "no_pend", sortable: true },
        { name: "NAMA", uid: "nama", sortable: true },
        { name: "NPM", uid: "npm", sortable: true },
        { name: "KELAS", uid: "kelas", sortable: true },
        { name: "KETERANGAN", uid: "keterangan", sortable: true },
      ];
    } else {
      return [
        { name: "NPM", uid: "npm", sortable: true },
        { name: "NAMA", uid: "nama", sortable: true },
        { name: "KELAS LAMA", uid: "kelas_lama", sortable: true },
        { name: "KELAS BARU", uid: "kelas_baru", sortable: true },
      ];
    }
  }, [type]);

  const statusOptions = useMemo(() => {
    const field = type === "mahasiswaBaru" ? "kelas" : "kelas_baru";
    const uniqueKelas = Array.from(
      new Set(data.map((item) => item[field as keyof MahasiswaItem]))
    );
    return uniqueKelas.map((kelas) => ({ name: kelas, uid: kelas }));
  }, [data, type]);

  const filteredItems = useMemo(() => {
    let filteredData = [...data];

    if (filterValue) {
      filteredData = filteredData.filter((item) =>
        item.nama.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    if (
      statusFilter !== "all" &&
      Array.from(statusFilter as Set<string>).length !== statusOptions.length
    ) {
      const field = type === "mahasiswaBaru" ? "kelas" : "kelas_baru";
      filteredData = filteredData.filter((item) =>
        (statusFilter as Set<string>).has(
          item[field as keyof MahasiswaItem] as string
        )
      );
    }

    return filteredData;
  }, [data, filterValue, statusFilter, statusOptions, type]);

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
    (item: MahasiswaItem, columnKey: keyof MahasiswaItem) => {
      const cellValue = item[columnKey];

      switch (columnKey) {
        default:
          return cellValue;
      }
    },
    []
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
    []
  );

  const onSearchChange = useCallback((value: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Search by name..."
            startContent={<SearchIcon />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDownIcon className="text-small" />}
                  variant="flat"
                >
                  Status
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={statusFilter}
                selectionMode="multiple"
                onSelectionChange={setStatusFilter}
              >
                {statusOptions.map((status) => (
                  <DropdownItem key={status.uid} className="capitalize">
                    {capitalize(status.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {data.length} users
          </span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    filterValue,
    statusFilter,
    onSearchChange,
    onRowsPerPageChange,
    data.length,
    onClear,
    statusOptions,
  ]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-default-400">
          {selectedKeys === "all"
            ? "All items selected"
            : `${selectedKeys.size} of ${filteredItems.length} selected`}
        </span>
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={pages}
          onChange={setPage}
        />
        <div className="hidden sm:flex w-[30%] justify-end gap-2">
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
    );
  }, [
    selectedKeys,
    filteredItems.length,
    page,
    pages,
    onPreviousPage,
    onNextPage,
  ]);

  return (
    <Table
      isHeaderSticky
      bottomContent={bottomContent}
      bottomContentPlacement="outside"
      classNames={{
        wrapper: "max-h-[382px]",
      }}
      selectedKeys={selectedKeys}
      selectionMode="multiple"
      sortDescriptor={sortDescriptor}
      topContent={topContent}
      topContentPlacement="outside"
      onSelectionChange={(keys) => setSelectedKeys(keys)}
      onSortChange={(descriptor) => setSortDescriptor(descriptor)}
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
  );
}
