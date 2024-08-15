import React, { useState, useEffect, useRef } from "react";
import { Card, CardBody } from "@nextui-org/card";
import { Chip } from "@nextui-org/chip";
import { Link } from "@nextui-org/link";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import {
  parseISO,
  differenceInDays,
  addDays,
  subDays,
  format,
  startOfMonth,
  isWithinInterval,
  isBefore,
  isAfter,
  isSameDay,
} from "date-fns";
import { id } from "date-fns/locale";

interface Event {
  kegiatan: string;
  tanggal: string;
  start: string;
  end: string;
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

const Timeline: React.FC<{ events: Event[] }> = ({ events }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const timelineRef = useRef<HTMLDivElement>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (timelineRef.current && events.length > 0) {
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
  }, [events]);

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    onOpen();
  };

  const weekdays = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  const adjustedEvents = events.map((event) => {
    const start = parseIndonesianDate(event.start);
    const end = parseIndonesianDate(event.end);
    if (isSameDay(start, end)) {
      return {
        ...event,
        start: format(subDays(end, 7), "d MMMM yyyy", { locale: id }),
      };
    }
    return event;
  });

  const earliestStart = adjustedEvents.reduce((earliest, event) => {
    const start = parseIndonesianDate(event.start);
    return start < earliest ? start : earliest;
  }, parseIndonesianDate(adjustedEvents[0].start));

  const latestEnd = adjustedEvents.reduce((latest, event) => {
    const end = parseIndonesianDate(event.end);
    return end > latest ? end : latest;
  }, parseIndonesianDate(adjustedEvents[0].end));

  const displayEndDate = addDays(latestEnd, 27);
  const displayStartDate = startOfMonth(earliestStart);

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

  const getEventStatus = (event: Event) => {
    const start = parseIndonesianDate(event.start);
    const end = parseIndonesianDate(event.end);
    const now = currentTime;

    if (isBefore(now, start)) {
      const daysUntilStart = differenceInDays(start, now);
      return `Dimulai dalam ${daysUntilStart} hari`;
    } else if (isAfter(now, end)) {
      return "Selesai";
    } else {
      const daysUntilEnd = differenceInDays(end, now);
      return `Berakhir dalam ${daysUntilEnd} hari`;
    }
  };

  const calculateEventPositions = (events: Event[]) => {
    const lanes: { start: Date; end: Date }[] = [];
    return events.map((event) => {
      const start = parseIndonesianDate(event.start);
      const end = parseIndonesianDate(event.end);
      let laneIndex = lanes.findIndex(
        (lane) =>
          !isWithinInterval(start, { start: lane.start, end: lane.end }) &&
          !isWithinInterval(end, { start: lane.start, end: lane.end })
      );

      if (laneIndex === -1) {
        laneIndex = lanes.length;
        lanes.push({ start, end });
      } else {
        lanes[laneIndex] = {
          start: isBefore(start, lanes[laneIndex].start)
            ? start
            : lanes[laneIndex].start,
          end: isAfter(end, lanes[laneIndex].end) ? end : lanes[laneIndex].end,
        };
      }

      return { ...event, laneIndex };
    });
  };

  const eventPositions = calculateEventPositions(adjustedEvents);

  return (
    <div className="rounded-lg overflow-hidden">
      <div className="flex items-center justify-between dark:text-white p-4">
        <h2 className="text-2xl font-bold">Timeline Kalender Akademik</h2>
      </div>
      <Card className="overflow-x-auto">
        <CardBody className="p-0">
          <div
            className="overflow-x-hidden overflow-y-hidden hover:overflow-x-auto"
            ref={timelineRef}
          >
            <div className="flex flex-col min-w-max relative h-auto py-4">
              <div className="absolute top-28 left-[-20] right-0 bottom-0 pointer-events-none bg-[repeating-linear-gradient(to_right,transparent,transparent_39px,#a1a1aa1a_39px,#a1a1aa1a_40px)] bg-opacity-50 bg-[length:40px_100%] bg-repeat-x"></div>
              <div className="flex items-center dark:text-white p-2">
                {Object.keys(months).map((monthKey) => (
                  <div
                    key={monthKey}
                    className="flex flex-col items-start sticky top-0 z-10"
                    style={{ width: `${months[monthKey].length * 40}px` }}
                  >
                    <h3 className="text-2xl font-bold p-2">
                      {format(months[monthKey][0], "MMMM yyyy", { locale: id })}
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
                style={{
                  height: `${(Math.max(...eventPositions.map((e) => e.laneIndex)) + 1) * 32}px`,
                }}
              >
                {eventPositions.map((event, index) => {
                  const start = parseIndonesianDate(event.start);
                  const end = parseIndonesianDate(event.end);
                  const width = (differenceInDays(end, start) + 1) * 40;
                  const left = differenceInDays(start, displayStartDate) * 40;
                  const status = getEventStatus(event);

                  return (
                    <div
                      key={index}
                      className={`${colors[index % colors.length]} text-white p-2 absolute rounded-full h-8 overflow-hidden flex items-center cursor-pointer`}
                      style={{
                        width: `${width}px`,
                        left: `${left}px`,
                        top: `${event.laneIndex * 36}px`,
                      }}
                      onClick={() => handleEventClick(event)}
                    >
                      <span className="sticky left-0 z-10 flex flex-col truncate px-2 text-sm font-medium text-white drop-shadow-lg sm:text-base">
                        {event.kegiatan}
                      </span>
                      <Chip
                        size="sm"
                        variant="solid"
                        className="dark:bg-white bg-black dark:text-black text-white"
                      >
                        {status}
                      </Chip>
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

      <Modal hideCloseButton={true} isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold leading-none tracking-tight">
                  {selectedEvent?.kegiatan}
                </h2>
              </ModalHeader>
              <ModalBody>
                <p className="text-foreground-600 text-center text-xs sm:text-start sm:text-sm">
                  {selectedEvent?.tanggal}
                </p>
                <Link
                  showAnchorIcon
                  href="https://baak.gunadarma.ac.id/"
                  className="truncate text-center text-xs text-foreground-500 hover:text-foreground sm:text-start"
                >
                  https://baak.gunadarma.ac.id/
                </Link>
              </ModalBody>
              <ModalFooter className="justify-between items-center">
                <Chip
                  variant="solid"
                  className="dark:bg-white bg-black dark:text-black text-white"
                >
                  {selectedEvent && getEventStatus(selectedEvent)}
                </Chip>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Timeline;
