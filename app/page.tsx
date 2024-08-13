"use client";
import React, { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import {
  parseISO,
  differenceInDays,
  addDays,
  format,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
} from "date-fns";
import { id } from "date-fns/locale";

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

const colors = [
  "bg-slate-600",
  "bg-zinc-600",
  "bg-stone-600",
  "bg-neutral-600",
  "bg-red-700",
  "bg-orange-700",
  "bg-amber-700",
  "bg-yellow-700",
  "bg-lime-700",
  "bg-green-700",
  "bg-emerald-700",
  "bg-teal-700",
  "bg-cyan-700",
  "bg-sky-700",
  "bg-blue-700",
  "bg-indigo-700",
  "bg-violet-700",
  "bg-purple-700",
  "bg-fuchsia-700",
  "bg-pink-700",
  "bg-rose-700",
];

const parseIndonesianDate = (dateString: string) => {
  const [day, month, year] = dateString.split(" ");
  const monthMap: { [key: string]: string } = {
    Januari: "01",
    Februari: "02",
    Maret: "03",
    April: "04",
    Mei: "05",
    Juni: "06",
    Juli: "07",
    Agustus: "08",
    September: "09",
    Oktober: "10",
    November: "11",
    Desember: "12",
  };
  return parseISO(`${year}-${monthMap[month]}-${day.padStart(2, "0")}`);
};

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const timelineRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (timelineRef.current && !isLoading && events.length > 0) {
      const currentDate = new Date();
      const earliestStart = parseIndonesianDate(events[0].start);
      const latestEnd = parseIndonesianDate(events[events.length - 1].end);

      if (
        isWithinInterval(currentDate, { start: earliestStart, end: latestEnd })
      ) {
        const daysFromStart = differenceInDays(currentDate, earliestStart);
        const scrollPosition = daysFromStart * 40; // 40px per day
        timelineRef.current.scrollLeft = scrollPosition;
      }
    }
  }, [isLoading, events]);

  const weekdays = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (events.length === 0) {
    return <div>No events found</div>;
  }

  // Find the earliest start date and latest end date
  const earliestStart = events.reduce((earliest, event) => {
    const start = parseIndonesianDate(event.start);
    return start < earliest ? start : earliest;
  }, parseIndonesianDate(events[0].start));

  const latestEnd = events.reduce((latest, event) => {
    const end = parseIndonesianDate(event.end);
    return end > latest ? end : latest;
  }, parseIndonesianDate(events[0].end));

  // Add 27 days to the latest end date
  const displayEndDate = addDays(latestEnd, 27);

  // Calculate the start of the month for the earliest start date
  const displayStartDate = startOfMonth(earliestStart);

  // Generate an array of all dates to display
  const allDates = [];
  let currentDate = displayStartDate;
  while (currentDate <= displayEndDate) {
    allDates.push(currentDate);
    currentDate = addDays(currentDate, 1);
  }

  const months = allDates.reduce(
    (acc, date) => {
      const monthKey = format(date, "yyyy-MM");
      if (!acc[monthKey]) {
        acc[monthKey] = [];
      }
      acc[monthKey].push(date);
      return acc;
    },
    {} as { [key: string]: Date[] }
  );

  const currentTimePosition =
    differenceInDays(currentTime, displayStartDate) * 40;

  return (
    <div className="flex flex-col w-full min-h-screen p-4">
      <div className="rounded-lg overflow-hidden">
        <div className="flex items-center justify-between dark:text-white p-4">
          <h2 className="text-2xl font-bold">Timeline Kalender Akademik</h2>
        </div>
        <Card>
          <CardBody>
            <div
              className="overflow-x-hidden hover:overflow-x-auto"
              ref={timelineRef}
            >
              <div className="flex flex-col min-w-max relative">
                <div className="absolute top-28 left-[-20] right-0 bottom-0 pointer-events-none bg-[repeating-linear-gradient(to_right,transparent,transparent_39px,#a1a1aa1a_39px,#a1a1aa1a_40px)] bg-opacity-50 bg-[length:40px_100%] bg-repeat-x"></div>
                <div className="flex items-center dark:text-white p-2">
                  {Object.keys(months).map((monthKey) => (
                    <div
                      key={monthKey}
                      className="flex flex-col items-center sticky top-0  z-10"
                      style={{ width: `${months[monthKey].length * 40}px` }}
                    >
                      <h3 className="text-2xl font-bold p-2">
                        {format(parseISO(monthKey), "MMMM yyyy", {
                          locale: id,
                        })}
                      </h3>
                      <div className="flex">
                        {months[monthKey].map((date, index) => (
                          <div
                            key={`${monthKey}-${index}`}
                            className="w-10 text-sm dark:text-white/70 text-black/70"
                          >
                            {weekdays[date.getDay()]}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-start dark:text-white">
                  {Object.values(months).map((dates, monthIndex) => (
                    <div
                      key={monthIndex}
                      className="flex flex-wrap"
                      style={{ width: `${dates.length * 40}px` }}
                    >
                      {dates.map((date, dateIndex) => (
                        <div
                          key={dateIndex}
                          className="w-10 flex flex-col items-center"
                        >
                          <div className="flex items-center justify-center font-semibold">
                            {format(date, "d")}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <div
                  className="relative dark:text-white mt-2"
                  style={{ height: `${events.length * 30}px` }}
                >
                  {events.map((event, index) => {
                    const start = parseIndonesianDate(event.start);
                    const end = parseIndonesianDate(event.end);
                    const width = (differenceInDays(end, start) + 1) * 40;
                    const left = differenceInDays(start, displayStartDate) * 40;

                    return (
                      <div
                        key={index}
                        className={`${colors[index % colors.length]} text-white p-1 absolute rounded-full h-8 overflow-hidden`}
                        style={{
                          width: `${width}px`,
                          left: `${left}px`,
                          top: `${index * 30}px`,
                        }}
                      >
                        {event.kegiatan}
                      </div>
                    );
                  })}
                  <div
                    className="absolute top-[-40px] cursor-default bottom-0 w-[2px] bg-black dark:bg-white z-20 transition-opacity hover:opacity-10"
                    style={{ left: `${currentTimePosition}px` }}
                  >
                    <div className="absolute top-[-20px] left-[-30px] bg-black dark:bg-white text-white dark:text-black px-2 py-1 rounded-full text-xs">
                      {format(currentTime, "HH:mm:ss")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
