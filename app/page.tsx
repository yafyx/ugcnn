"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Button } from "@nextui-org/react";
import Timeline from "@/components/timeline";

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

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("https://baak-api.vercel.app/kalender");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data: ApiResponse = await response.json();
        setEvents(data.data);
        setIsLoading(false);
      } catch (err) {
        setError("An error occurred while fetching data");
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (events.length === 0) {
    return <div>No events found</div>;
  }

  return (
    <div className="flex flex-col w-full min-h-screen p-4">
      <div className="max-w-[900px] gap-2 grid grid-cols-12 grid-rows-2">
        <Card className="col-span-12 sm:col-span-4 h-[300px]">
          <CardHeader className="absolute z-10 top-1 flex-col !items-start">
            <p className="text-tiny text-white/60 uppercase font-bold">
              What to watch
            </p>
            <h4 className="text-white font-medium text-large">
              Stream the Acme event
            </h4>
          </CardHeader>
          <Image
            width={400}
            height={400}
            alt="Card background"
            className="z-0 w-full h-full object-cover"
            src="https://nextui.org/images/card-example-4.jpeg"
          />
        </Card>
        <Card className="col-span-12 sm:col-span-4 h-[300px]">
          <CardHeader className="absolute z-10 top-1 flex-col !items-start">
            <p className="text-tiny text-white/60 uppercase font-bold">
              Plant a tree
            </p>
            <h4 className="text-white font-medium text-large">
              Contribute to the planet
            </h4>
          </CardHeader>
          <Image
            width={400}
            height={400}
            alt="Card background"
            className="z-0 w-full h-full object-cover"
            src="https://nextui.org/images/card-example-3.jpeg"
          />
        </Card>
        <Card className="col-span-12 sm:col-span-4 h-[300px]">
          <CardHeader className="absolute z-10 top-1 flex-col !items-start">
            <p className="text-tiny text-white/60 uppercase font-bold">
              Supercharged
            </p>
            <h4 className="text-white font-medium text-large">
              Creates beauty like a beast
            </h4>
          </CardHeader>
          <Image
            width={400}
            height={400}
            alt="Card background"
            className="z-0 w-full h-full object-cover"
            src="https://nextui.org/images/card-example-2.jpeg"
          />
        </Card>
        <Card
          isFooterBlurred
          className="w-full h-[300px] col-span-12 sm:col-span-5"
        >
          <CardHeader className="absolute z-10 top-1 flex-col items-start">
            <p className="text-tiny text-white/60 uppercase font-bold">New</p>
            <h4 className="text-black font-medium text-2xl">Acme camera</h4>
          </CardHeader>
          <Image
            width={400}
            height={400}
            alt="Card example background"
            className="z-0 w-full h-full scale-125 -translate-y-6 object-cover"
            src="https://nextui.org/images/card-example-6.jpeg"
          />
          <CardFooter className="absolute bg-white/30 bottom-0 border-t-1 border-zinc-100/50 z-10 justify-between">
            <div>
              <p className="text-black text-tiny">Available soon.</p>
              <p className="text-black text-tiny">Get notified.</p>
            </div>
            <Button
              className="text-tiny"
              color="primary"
              radius="full"
              size="sm"
            >
              Notify Me
            </Button>
          </CardFooter>
        </Card>
        <Card
          isFooterBlurred
          className="w-full h-[300px] col-span-12 sm:col-span-7"
        >
          <CardHeader className="absolute z-10 top-1 flex-col items-start">
            <p className="text-tiny text-white/60 uppercase font-bold">
              Your day your way
            </p>
            <h4 className="text-white/90 font-medium text-xl">
              Your checklist for better sleep
            </h4>
          </CardHeader>
          <Image
            width={400}
            height={400}
            alt="Relaxing app background"
            className="z-0 w-full h-full object-cover"
            src="https://nextui.org/images/card-example-5.jpeg"
          />
          <CardFooter className="absolute bg-black/40 bottom-0 z-10 border-t-1 border-default-600 dark:border-default-100">
            <div className="flex flex-grow gap-2 items-center">
              <Image
                width={400}
                height={400}
                alt="Breathing app icon"
                className="rounded-full w-10 h-11 bg-black"
                src="https://nextui.org/images/breathing-app-icon.jpeg"
              />
              <div className="flex flex-col">
                <p className="text-tiny text-white/60">Breathing App</p>
                <p className="text-tiny text-white/60">
                  Get a good night's sleep.
                </p>
              </div>
            </div>
            <Button radius="full" size="sm">
              Get App
            </Button>
          </CardFooter>
        </Card>
      </div>
      <Timeline events={events} />
    </div>
  );
}
