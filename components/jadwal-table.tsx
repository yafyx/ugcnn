import React, { useMemo } from "react";
import { Card, CardHeader, CardBody } from "@nextui-org/card";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/table";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/dropdown";
import { Button } from "@nextui-org/react";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { ChevronDownIcon } from "./ChevronDownIcon";
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface Jadwal {
  nama: string;
  waktu: string;
  jam: string;
  ruang: string;
  dosen: string;
}

interface JadwalHari {
  [key: string]: Jadwal[] | null;
}

interface JadwalTableProps {
  jadwal: JadwalHari;
  kelas: string;
}

const CSVExport = ({
  data,
  filename,
  children,
}: {
  data: any[];
  filename: string;
  children: React.ReactNode;
}) => (
  <CSVLink
    data={data}
    filename={filename}
    style={{ textDecoration: "none", color: "inherit" }}
  >
    {children}
  </CSVLink>
);

const JadwalTable: React.FC<JadwalTableProps> = ({ jadwal, kelas }) => {
  const columns = ["Hari", "Mata Kuliah", "Jam", "Ruang", "Dosen"];

  const csvData = useMemo(() => {
    const data = [columns];
    Object.entries(jadwal).forEach(([hari, matkul]) => {
      if (matkul && matkul.length > 0) {
        matkul.forEach((m, index) => {
          data.push([index === 0 ? hari : "", m.nama, m.jam, m.ruang, m.dosen]);
        });
      } else {
        data.push([hari, "Tidak ada jadwal", "-", "-", "-"]);
      }
    });
    return data;
  }, [jadwal]);

  const exportFileName = `jadwal_kelas_${kelas}_${new Date().toISOString()}`;

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`Jadwal Kelas ${kelas}`, 14, 15);
    doc.autoTable({
      head: [columns],
      body: csvData.slice(1),
      startY: 20,
    });
    doc.save(`${exportFileName}.pdf`);
  };

  return (
    <Card className="mb-4">
      <CardHeader className="flex items-center justify-between bg-white/60 p-4 dark:bg-zinc-800/50">
        <h2 className="text-xl font-semibold">
          Jadwal Kelas
          <span className="uppercase"> {kelas}</span>
        </h2>
        <div className="flex gap-2">
          <Dropdown>
            <DropdownTrigger>
              <Button endContent={<ChevronDownIcon />} variant="bordered">
                Export
              </Button>
            </DropdownTrigger>
            <DropdownMenu variant="faded">
              <DropdownItem key="csv" description="Ekspor jadwal ke file CSV">
                <CSVExport data={csvData} filename={`${exportFileName}.csv`}>
                  Export to CSV
                </CSVExport>
              </DropdownItem>
              <DropdownItem
                key="pdf"
                description="Ekspor jadwal ke file PDF"
                onPress={exportToPDF}
              >
                Export to PDF
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </CardHeader>
      <CardBody className="px-2 sm:px-4">
        <div className="overflow-x-auto">
          <Table
            shadow="none"
            aria-label="Jadwal Kelas"
            classNames={{
              wrapper: "min-w-full",
              th: "text-xs sm:text-sm whitespace-nowrap",
              td: "text-xs sm:text-sm whitespace-nowrap",
            }}
          >
            <TableHeader>
              <TableColumn className="w-1/6">Hari</TableColumn>
              <TableColumn className="w-1/4">Mata Kuliah</TableColumn>
              <TableColumn className="w-1/6">Jam</TableColumn>
              <TableColumn className="w-1/6">Ruang</TableColumn>
              <TableColumn className="w-1/4">Dosen</TableColumn>
            </TableHeader>
            <TableBody>
              {Object.entries(jadwal).flatMap(([hari, matkul]) =>
                matkul && matkul.length > 0 ? (
                  matkul.map((m, index) => (
                    <TableRow
                      key={`${hari}-${index}`}
                      className={
                        index === matkul.length - 1
                          ? "border-b-slate border-b dark:border-b-zinc-800"
                          : ""
                      }
                    >
                      <TableCell className="capitalize">
                        {index === 0 ? hari : ""}
                      </TableCell>
                      <TableCell>{m.nama}</TableCell>
                      <TableCell>{m.jam}</TableCell>
                      <TableCell>{m.ruang}</TableCell>
                      <TableCell>{m.dosen}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow
                    key={hari}
                    className="border-b-slate border-b dark:border-b-zinc-800"
                  >
                    <TableCell className="capitalize">{hari}</TableCell>
                    <TableCell>Tidak ada jadwal</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
        </div>
      </CardBody>
    </Card>
  );
};

export default JadwalTable;
