"use client";
import React from "react";
import useSWR from "swr";
import Timeline from "@/components/timeline";
import { Spinner } from "@nextui-org/react";

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

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TimelinePage() {
  const { data: eventsData, error: eventsError } = useSWR<Kalender>(
    "https://baak-api.vercel.app/kalender",
    fetcher,
  );

  if (eventsError) {
    return <div>Error: Failed to load timeline data</div>;
  }

  if (!eventsData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="col-span-full mb-6 flex flex-col">
        <h1 className="text-xl font-bold tracking-tight lg:text-2xl xl:text-3xl">
          Timeline Kalender Akademik
        </h1>
        <p className="text-base text-foreground-500 sm:text-lg">
          Lihat timeline kegiatan akademik yang akan datang
        </p>
      </div>
      <Timeline events={eventsData.data} />
    </div>
  );
}
