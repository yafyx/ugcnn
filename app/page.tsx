"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardBody } from "@nextui-org/card";
import {
  Button,
  Input,
  Spinner,
  CheckboxGroup,
  Checkbox,
} from "@nextui-org/react";
import Timeline from "@/components/timeline";
import { Skeleton } from "@nextui-org/skeleton";
import JadwalTable from "@/components/jadwal-table";
import MahasiswaTable from "@/components/mahasiswa-table";

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
  const [showKelasData, setShowKelasData] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

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
    setShowKelasData(true);
    setIsLoading(true);
    Promise.all([fetchJadwal(), fetchKelasBaru()]).then(() => {
      setIsLoading(false);
    });
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex flex-col w-full min-h-screen p-4">
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex flex-col gap-4">
          <Input
            type="text"
            label="Masukkan Kelas"
            placeholder="Contoh: 2ia14"
            value={kelas}
            onChange={handleKelasChange}
          />
          <CheckboxGroup
            label="Pilih opsi yang ingin ditampilkan"
            value={selectedOptions}
            onValueChange={setSelectedOptions}
          >
            <Checkbox value="jadwal">Jadwal Kelas</Checkbox>
            <Checkbox value="mahasiswa">Daftar Mahasiswa</Checkbox>
          </CheckboxGroup>
          <Button type="submit" color="primary">
            Tampilkan Data
          </Button>
        </div>
      </form>

      {showKelasData && (
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {isLoading ? (
            <Spinner color="default" />
          ) : (
            <>
              {selectedOptions.includes("jadwal") && jadwal && (
                <div className="w-full md:w-1/2">
                  <JadwalTable jadwal={jadwal} kelas={kelas} />
                </div>
              )}

              {selectedOptions.includes("mahasiswa") && (
                <div className="w-full md:w-1/2">
                  <MahasiswaTable kelasBaru={kelasBaru} />
                </div>
              )}
            </>
          )}
        </div>
      )}

      <div className="flex items-center justify-between dark:text-white p-4">
        <h2 className="text-2xl font-bold">Timeline Kalender Akademik</h2>
      </div>
      {isLoading ? (
        <Card>
          <CardBody>
            <Skeleton className="rounded-lg">
              <div className="h-64 rounded-lg bg-default-300"></div>
            </Skeleton>
          </CardBody>
        </Card>
      ) : (
        <Timeline events={events} />
      )}
    </div>
  );
}
