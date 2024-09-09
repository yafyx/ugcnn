"use client";
import React, { useState, useCallback, useMemo } from "react";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import {
  Button,
  Input,
  Spinner,
  CheckboxGroup,
  Checkbox,
} from "@nextui-org/react";
import { Skeleton } from "@nextui-org/skeleton";
import useSWR from "swr";
import Timeline from "@/components/timeline";
import JadwalTable from "@/components/jadwal-table";
import MahasiswaTable from "@/components/mahasiswa-table";

interface Event {
  kegiatan: string;
  tanggal: string;
  start: string;
  end: string;
}

interface Kalender {
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

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const [kelas, setKelas] = useState<string>("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showKelasData, setShowKelasData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const selectedOptionsCount = useMemo(
    () => selectedOptions.length,
    [selectedOptions],
  );

  const { data: eventsData, error: eventsError } = useSWR<Kalender>(
    "https://baak-api.vercel.app/kalender",
    fetcher,
  );

  const { data: jadwalData, error: jadwalError } = useSWR(
    showKelasData && selectedOptions.includes("jadwal")
      ? `https://baak-api.vercel.app/jadwal/${kelas}`
      : null,
    fetcher,
  );

  const { data: kelasBaruData, error: kelasBaruError } = useSWR(
    showKelasData && selectedOptions.includes("kelasBaru")
      ? `https://baak-api.vercel.app/kelasbaru/${kelas}`
      : null,
    fetcher,
  );

  const { data: mahasiswaBaruData, error: mahasiswaBaruError } = useSWR(
    showKelasData && selectedOptions.includes("mahasiswaBaru")
      ? `https://baak-api.vercel.app/mahasiswabaru/${kelas}`
      : null,
    fetcher,
  );

  const handleKelasChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setKelas(e.target.value);
    },
    [],
  );

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowKelasData(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
  }, []);

  const isTimelineLoading = !eventsData && !eventsError;

  if (eventsError) {
    return <div>Error: Failed to load data</div>;
  }

  return (
    <div className="flex min-h-screen w-full flex-col p-4">
      <p className="relative z-20 bg-gradient-to-b from-neutral-200 to-neutral-500 bg-clip-text py-8 pt-0 text-4xl font-bold text-transparent sm:text-7xl">
        cari jadwal dan daftar mahasiswa baru
      </p>
      <form onSubmit={handleSubmit} className="mb-4">
        <Card className="p-6">
          <div className="flex flex-col gap-4">
            <Input
              variant="faded"
              className="font-semibold"
              labelPlacement="outside"
              type="text"
              label="Masukkan yang ingin dicari"
              placeholder="Contoh: 2IA14"
              value={kelas}
              onChange={handleKelasChange}
            />
            <hr
              className="h-divider w-full shrink-0 border-none bg-divider"
              role="separator"
            ></hr>
            <div className="flex h-auto w-full items-center">
              <small className="text-default-500">
                Tip: Kamu juga bisa mencari berdasarkan nama dan npm untuk
                mahasiswa dan dosen untuk jadwal
              </small>
            </div>
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
            <Button
              type="submit"
              className="bg-black text-white dark:bg-white dark:text-black"
              isLoading={isLoading}
            >
              {isLoading ? "Memuat Data..." : "Tampilkan Data"}
            </Button>
          </div>
        </Card>
      </form>

      {showKelasData && (
        <div className="flex flex-col gap-x-4 md:flex-row">
          {selectedOptions.includes("jadwal") && (
            <div
              className={`w-full ${selectedOptionsCount > 1 ? "md:w-1/2" : ""} transition-all duration-300`}
            >
              {jadwalError ? (
                <Card>
                  <CardBody>
                    <p className="text-red-500">Failed to load jadwal data</p>
                  </CardBody>
                </Card>
              ) : jadwalData ? (
                <JadwalTable jadwal={jadwalData.data.jadwal} kelas={kelas} />
              ) : (
                <Card>
                  <CardBody>
                    <Spinner color="default" />
                  </CardBody>
                </Card>
              )}
            </div>
          )}

          {selectedOptions.includes("kelasBaru") && (
            <div
              className={`w-full ${selectedOptionsCount > 1 ? "md:w-1/2" : ""} transition-all duration-300`}
            >
              {kelasBaruError ? (
                <Card>
                  <CardBody>
                    <p className="text-red-500">
                      Failed to load kelas baru data
                    </p>
                  </CardBody>
                </Card>
              ) : kelasBaruData ? (
                <MahasiswaTable data={kelasBaruData.data} type="kelasBaru" />
              ) : (
                <Card>
                  <CardBody>
                    <Spinner color="default" />
                  </CardBody>
                </Card>
              )}
            </div>
          )}

          {selectedOptions.includes("mahasiswaBaru") && (
            <div
              className={`w-full ${selectedOptionsCount > 1 ? "md:w-1/2" : ""} transition-all duration-300`}
            >
              {mahasiswaBaruError ? (
                <Card>
                  <CardBody>
                    <p className="text-red-500">
                      Failed to load mahasiswa baru data
                    </p>
                  </CardBody>
                </Card>
              ) : mahasiswaBaruData ? (
                <MahasiswaTable
                  data={mahasiswaBaruData.data}
                  type="mahasiswaBaru"
                />
              ) : (
                <Card>
                  <CardBody>
                    <Spinner color="default" />
                  </CardBody>
                </Card>
              )}
            </div>
          )}
        </div>
      )}

      <Card className="mt-4 h-[422px]">
        <CardHeader className="bg-white/60 dark:bg-zinc-800/50">
          <div className="flex items-center justify-between p-4 dark:text-white">
            <h2 className="text-xl font-semibold">
              Timeline Kalender Akademik
            </h2>
          </div>
        </CardHeader>
        <CardBody>
          {isTimelineLoading ? (
            <Skeleton className="rounded-lg">
              <div className="h-64 rounded-lg bg-default-300"></div>
            </Skeleton>
          ) : (
            eventsData && <Timeline events={eventsData.data} />
          )}
        </CardBody>
      </Card>
    </div>
  );
}
