"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Button, Input } from "@nextui-org/react";
import Timeline from "@/components/timeline";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
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
              <BarChart data={kelasBaruChartData}>
                <XAxis dataKey="kelas" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="jumlah" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Ringkasan Kelas</h2>
          </CardHeader>
          <CardBody>
            <p>Total Mahasiswa: {kelasBaru.length}</p>
            <p>Kelas Baru: {kelas}</p>
            <p>
              Jumlah Mata Kuliah:{" "}
              {jadwal ? Object.values(jadwal).flat().filter(Boolean).length : 0}
            </p>
          </CardBody>
        </Card>
      </div>

      {jadwal && (
        <Card className="mb-4">
          <CardHeader>
            <h2 className="text-lg font-semibold">Jadwal Kelas {kelas}</h2>
          </CardHeader>
          <CardBody>
            {Object.entries(jadwal).map(([hari, matkul]) => (
              <div key={hari} className="mb-2">
                <h3 className="font-semibold">
                  {hari.charAt(0).toUpperCase() + hari.slice(1)}
                </h3>
                {matkul ? (
                  <ul>
                    {matkul.map((m, index) => (
                      <li key={index}>
                        {m.nama} - {m.jam} - {m.ruang} - {m.dosen}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Tidak ada jadwal</p>
                )}
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      <Card className="mb-4">
        <CardHeader>
          <h2 className="text-lg font-semibold">Daftar Mahasiswa Kelas Baru</h2>
        </CardHeader>
        <CardBody>
          <ul>
            {kelasBaru.map((mahasiswa, index) => (
              <li key={index}>
                {mahasiswa.nama} (NPM: {mahasiswa.npm}) - Kelas Lama:{" "}
                {mahasiswa.kelas_lama}
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>

      <Timeline events={events} />
    </div>
  );
}
