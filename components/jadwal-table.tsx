import React from "react";
import { Card, CardHeader, CardBody } from "@nextui-org/card";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/table";

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
  return (
    <Card className="mb-4">
      <CardHeader>
        <h2 className="text-lg font-semibold">Jadwal Kelas {kelas}</h2>
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
