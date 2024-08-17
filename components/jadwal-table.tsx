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
import { Button } from "@nextui-org/react";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import "jspdf-autotable";
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
      <CardHeader className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Jadwal Kelas {kelas}</h2>
        <div className="flex gap-2">
          <CSVLink data={csvData} filename={`${exportFileName}.csv`}>
            <Button color="primary" size="sm">
              Export to CSV
            </Button>
          </CSVLink>
          <Button color="secondary" size="sm" onPress={exportToPDF}>
            Export to PDF
          </Button>
        </div>
      </CardHeader>
      <CardBody>
        <Table aria-label="Jadwal Kelas">
          <TableHeader>
            <TableColumn>Hari</TableColumn>
            <TableColumn>Mata Kuliah</TableColumn>
            <TableColumn>Jam</TableColumn>
            <TableColumn>Ruang</TableColumn>
            <TableColumn>Dosen</TableColumn>
          </TableHeader>
          <TableBody>
            {Object.entries(jadwal).flatMap(([hari, matkul]) =>
              matkul && matkul.length > 0 ? (
                matkul.map((m, index) => (
                  <TableRow key={`${hari}-${index}`}>
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
                <TableRow key={hari}>
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
      </CardBody>
    </Card>
  );
};

export default JadwalTable;
