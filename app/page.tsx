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

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [jadwal, setJadwal] = useState<JadwalHari | null>(null);
  const [kelasBaru, setKelasBaru] = useState<KelasBaru[]>([]);
  const [kelas, setKelas] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isClassDataLoading, setIsClassDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showKelasData, setShowKelasData] = useState(false);
  const [mahasiswaBaru, setMahasiswaBaru] = useState<MahasiswaBaru[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [jadwalError, setJadwalError] = useState<string | null>(null);
  const [kelasBaruError, setKelasBaruError] = useState<string | null>(null);
  const [mahasiswaBaruError, setMahasiswaBaruError] = useState<string | null>(
    null,
  );

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
        `https://baak-api.vercel.app/jadwal/${kelas}`,
      );
      if (!response.ok) {
        throw new Error("Gagal mengambil jadwal");
      }
      const data = await response.json();
      setJadwal(data.data.jadwal);
      setJadwalError(null);
    } catch (err) {
      setJadwalError("Terjadi kesalahan saat mengambil jadwal");
    }
  };

  const fetchMahasiswaBaru = async () => {
    try {
      const response = await fetch(
        `https://baak-api.vercel.app/mahasiswabaru/${kelas}`,
      );
      if (!response.ok) {
        throw new Error("Gagal mengambil data mahasiswa baru");
      }
      const data = await response.json();
      setMahasiswaBaru(data.data);
      setMahasiswaBaruError(null);
    } catch (err) {
      setMahasiswaBaruError(
        "Terjadi kesalahan saat mengambil data mahasiswa baru",
      );
    }
  };

  const fetchKelasBaru = async () => {
    try {
      const response = await fetch(
        `https://baak-api.vercel.app/kelasbaru/${kelas}`,
      );
      if (!response.ok) {
        throw new Error("Gagal mengambil data kelas baru");
      }
      const data = await response.json();
      setKelasBaru(data.data);
      setKelasBaruError(null);
    } catch (err) {
      setKelasBaruError("Terjadi kesalahan saat mengambil data kelas baru");
    }
  };

  const handleKelasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKelas(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowKelasData(true);
    setIsClassDataLoading(true);

    const promises = [];

    if (selectedOptions.includes("jadwal")) {
      promises.push(fetchJadwal());
    }
    if (selectedOptions.includes("kelasBaru")) {
      promises.push(fetchKelasBaru());
    }
    if (selectedOptions.includes("mahasiswaBaru")) {
      promises.push(fetchMahasiswaBaru());
    }

    Promise.all(promises).then(() => {
      setIsClassDataLoading(false);
    });
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex min-h-screen w-full flex-col p-4">
      <p className="relative z-20 bg-gradient-to-b from-neutral-200 to-neutral-500 bg-clip-text py-8 pt-0 text-4xl font-bold text-transparent sm:text-7xl">
        cari jadwal dan daftar mahasiswa baru
      </p>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex flex-col gap-4">
          <Input
            className="font-semibold"
            labelPlacement="outside"
            type="text"
            label="Masukkan Kelas"
            placeholder="Contoh: 2ia14"
            value={kelas}
            onChange={handleKelasChange}
          />
          <CheckboxGroup
            orientation="horizontal"
            label="Pilih opsi yang ingin ditampilkan"
            value={selectedOptions}
            onValueChange={setSelectedOptions}
          >
            <Checkbox value="jadwal">Jadwal Kelas</Checkbox>
            <Checkbox
              value="kelasBaru"
              isDisabled={selectedOptions.includes("mahasiswaBaru")}
            >
              Kelas Baru
            </Checkbox>
            <Checkbox
              value="mahasiswaBaru"
              isDisabled={selectedOptions.includes("kelasBaru")}
            >
              Mahasiswa Baru
            </Checkbox>
          </CheckboxGroup>
          <Button type="submit" color="primary">
            Tampilkan Data
          </Button>
        </div>
      </form>

      {showKelasData && (
        <div className="mb-4 flex flex-col gap-4 md:flex-row">
          {isClassDataLoading ? (
            <Spinner color="default" />
          ) : (
            <>
              {selectedOptions.includes("jadwal") && (
                <div className="w-full md:w-1/2">
                  {jadwalError ? (
                    <Card>
                      <CardBody>
                        <p className="text-red-500">{jadwalError}</p>
                      </CardBody>
                    </Card>
                  ) : (
                    jadwal && <JadwalTable jadwal={jadwal} kelas={kelas} />
                  )}
                </div>
              )}

              {selectedOptions.includes("kelasBaru") && (
                <div className="w-full md:w-1/2">
                  {kelasBaruError ? (
                    <Card>
                      <CardBody>
                        <p className="text-red-500">{kelasBaruError}</p>
                      </CardBody>
                    </Card>
                  ) : (
                    <MahasiswaTable data={kelasBaru} type="kelasBaru" />
                  )}
                </div>
              )}

              {selectedOptions.includes("mahasiswaBaru") && (
                <div className="w-full md:w-1/2">
                  {mahasiswaBaruError ? (
                    <Card>
                      <CardBody>
                        <p className="text-red-500">{mahasiswaBaruError}</p>
                      </CardBody>
                    </Card>
                  ) : (
                    <MahasiswaTable data={mahasiswaBaru} type="mahasiswaBaru" />
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      <div className="flex items-center justify-between p-4 dark:text-white">
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
