"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardBody } from "@nextui-org/card";
import { Button, Input } from "@nextui-org/react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/table";
import Timeline from "@/components/timeline";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Event {
  kegiatan: string;
  tanggal: string;
  start: string;
  end: string;
}

interface ApiResponse {
  status: string;
  data: Event[];
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

interface KelasBaru {
  npm: string;
  nama: string;
  kelas_lama: string;
  kelas_baru: string;
}

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [jadwal, setJadwal] = useState<JadwalHari | null>(null);
  const [kelasBaru, setKelasBaru] = useState<KelasBaru[]>([]);
  const [kelas, setKelas] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("https://baak-api.vercel.app/kalender");
        if (!response.ok) {
          throw new Error("Gagal mengambil data");
        }
        const data: ApiResponse = await response.json();
        setEvents(data.data);
        setIsLoading(false);
      } catch (err) {
        setError("Terjadi kesalahan saat mengambil data");
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const fetchJadwal = async () => {
    try {
      const response = await fetch(
        `https://baak-api.vercel.app/jadwal/${kelas}`
      );
      if (!response.ok) {
        throw new Error("Gagal mengambil jadwal");
      }
      const data = await response.json();
      setJadwal(data.data.jadwal);
    } catch (err) {
      setError("Terjadi kesalahan saat mengambil jadwal");
    }
  };

  const fetchKelasBaru = async () => {
    try {
      const response = await fetch(
        `https://baak-api.vercel.app/kelasbaru/${kelas}`
      );
      if (!response.ok) {
        throw new Error("Gagal mengambil data kelas baru");
      }
      const data = await response.json();
      setKelasBaru(data.data);
    } catch (err) {
      setError("Terjadi kesalahan saat mengambil data kelas baru");
    }
  };

  const handleKelasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKelas(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJadwal();
    fetchKelasBaru();
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  const jadwalChartData = jadwal
    ? Object.entries(jadwal).map(([hari, matkul]) => ({
        hari,
        jumlahMatkul: matkul ? matkul.length : 0,
      }))
    : [];

  const kelasBaruChartData = kelasBaru.reduce(
    (acc, curr) => {
      const existingKelas = acc.find((item) => item.kelas === curr.kelas_lama);
      if (existingKelas) {
        existingKelas.jumlah += 1;
      } else {
        acc.push({ kelas: curr.kelas_lama, jumlah: 1 });
      }
      return acc;
    },
    [] as { kelas: string; jumlah: number }[]
  );

  const totalMahasiswa = kelasBaru.length;
  const totalMataKuliah = jadwal
    ? Object.values(jadwal).flat().filter(Boolean).length
    : 0;

  const pieChartData = [
    { name: "Mahasiswa", value: totalMahasiswa },
    { name: "Mata Kuliah", value: totalMataKuliah },
  ];

  if (isLoading) {
    return <div>Memuat...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex flex-col w-full min-h-screen p-4">
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <Input
            type="text"
            label="Masukkan Kelas"
            placeholder="Contoh: 2ia14"
            value={kelas}
            onChange={handleKelasChange}
          />
          <Button type="submit" color="primary">
            Tampilkan Data
          </Button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Card className="w-full h-36">
          <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
            <p className="text-tiny uppercase font-bold">Total Mahasiswa</p>
            <h4 className="font-bold text-large">{totalMahasiswa}</h4>
          </CardHeader>
          <CardBody className="py-2">
            <small className="text-default-500">
              +{totalMahasiswa} dari kelas baru
            </small>
          </CardBody>
        </Card>

        <Card className="w-full h-36">
          <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
            <p className="text-tiny uppercase font-bold">Total Mata Kuliah</p>
            <h4 className="font-bold text-large">{totalMataKuliah}</h4>
          </CardHeader>
          <CardBody className="py-2">
            <small className="text-default-500">Dari semua hari</small>
          </CardBody>
        </Card>

        <Card className="w-full h-36">
          <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
            <p className="text-tiny uppercase font-bold">Kelas Baru</p>
            <h4 className="font-bold text-large">{kelas}</h4>
          </CardHeader>
          <CardBody className="py-2">
            <small className="text-default-500">Kelas yang dipilih</small>
          </CardBody>
        </Card>

        <Card className="w-full h-36">
          <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
            <p className="text-tiny uppercase font-bold">
              Rata-rata Mata Kuliah per Hari
            </p>
            <h4 className="font-bold text-large">
              {jadwal
                ? (totalMataKuliah / Object.keys(jadwal).length).toFixed(2)
                : 0}
            </h4>
          </CardHeader>
          <CardBody className="py-2">
            <small className="text-default-500">
              Berdasarkan jadwal saat ini
            </small>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Distribusi Jadwal</h2>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={jadwalChartData}>
                <XAxis dataKey="hari" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="jumlahMatkul" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Distribusi Kelas Lama</h2>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={kelasBaruChartData}>
                <XAxis dataKey="kelas" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="jumlah" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">
              Perbandingan Mahasiswa dan Mata Kuliah
            </h2>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {jadwal && (
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
                        <TableCell>{index === 0 ? hari : ""}</TableCell>
                        <TableCell>{m.nama}</TableCell>
                        <TableCell>{m.jam}</TableCell>
                        <TableCell>{m.ruang}</TableCell>
                        <TableCell>{m.dosen}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow key={hari}>
                      <TableCell>{hari}</TableCell>
                      <TableCell>Tidak ada jadwal</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      )}

      <Card className="mb-4">
        <CardHeader>
          <h2 className="text-lg font-semibold">Daftar Mahasiswa Kelas Baru</h2>
        </CardHeader>
        <CardBody>
          <Table aria-label="Daftar Mahasiswa Kelas Baru">
            <TableHeader>
              <TableColumn>Nama</TableColumn>
              <TableColumn>NPM</TableColumn>
              <TableColumn>Kelas Lama</TableColumn>
            </TableHeader>
            <TableBody>
              {kelasBaru.map((mahasiswa, index) => (
                <TableRow key={index}>
                  <TableCell>{mahasiswa.nama}</TableCell>
                  <TableCell>{mahasiswa.npm}</TableCell>
                  <TableCell>{mahasiswa.kelas_lama}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      <Timeline events={events} />
    </div>
  );
}
