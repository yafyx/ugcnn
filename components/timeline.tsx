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
  ScrollShadow,
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

const gradients = [
  "bg-gradient-to-b from-slate-700 to-slate-800",
  "bg-gradient-to-b from-zinc-700 to-zinc-800",
  "bg-gradient-to-b from-neutral-700 to-neutral-800",
  "bg-gradient-to-b from-stone-700 to-stone-800",
  "bg-gradient-to-b from-red-800 to-red-900",
  "bg-gradient-to-b from-orange-800 to-orange-900",
  "bg-gradient-to-b from-amber-800 to-amber-900",
  "bg-gradient-to-b from-yellow-800 to-yellow-900",
  "bg-gradient-to-b from-lime-800 to-lime-900",
  "bg-gradient-to-b from-green-800 to-green-900",
  "bg-gradient-to-b from-emerald-800 to-emerald-900",
  "bg-gradient-to-b from-teal-800 to-teal-900",
  "bg-gradient-to-b from-cyan-800 to-cyan-900",
  "bg-gradient-to-b from-sky-800 to-sky-900",
  "bg-gradient-to-b from-blue-800 to-blue-900",
  "bg-gradient-to-b from-indigo-800 to-indigo-900",
  "bg-gradient-to-b from-violet-800 to-violet-900",
  "bg-gradient-to-b from-purple-800 to-purple-900",
  "bg-gradient-to-b from-fuchsia-800 to-fuchsia-900",
  "bg-gradient-to-b from-pink-800 to-pink-900",
  "bg-gradient-to-b from-rose-800 to-rose-900",
];

const parseDate = (dateString: string) => {
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
      const earliestStart = parseDate(events[0].start);
      const latestEnd = parseDate(events[events.length - 1].end);

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
    const start = parseDate(event.start);
    const end = parseDate(event.end);
    if (isSameDay(start, end)) {
      return {
        ...event,
        start: format(subDays(end, 7), "d MMMM yyyy", { locale: id }),
      };
    }
    return event;
  });

  const earliestStart = adjustedEvents.reduce((earliest, event) => {
    const start = parseDate(event.start);
    return start < earliest ? start : earliest;
  }, parseDate(adjustedEvents[0].start));

  const latestEnd = adjustedEvents.reduce((latest, event) => {
    const end = parseDate(event.end);
    return end > latest ? end : latest;
  }, parseDate(adjustedEvents[0].end));

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
    const start = parseDate(event.start);
    const end = parseDate(event.end);
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
      const start = parseDate(event.start);
      const end = parseDate(event.end);
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
      <Card className="overflow-hidden">
        <CardBody className="p-0">
          <ScrollShadow orientation="horizontal" size={20}>
            <div className="overflow-x-auto" ref={timelineRef}>
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
                        {format(months[monthKey][0], "MMMM yyyy", {
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
                  style={{
                    height: `${(Math.max(...eventPositions.map((e) => e.laneIndex)) + 1) * 32}px`,
                  }}
                >
                  {eventPositions.map((event, index) => {
                    const start = parseDate(event.start);
                    const end = parseDate(event.end);
                    const width = (differenceInDays(end, start) + 1) * 40;
                    const left = differenceInDays(start, displayStartDate) * 40;
                    const status = getEventStatus(event);

                    return (
                      <div
                        key={index}
                        className={`${gradients[index % gradients.length]} text-white p-2 absolute rounded-full h-8 overflow-hidden flex items-center cursor-pointer transition-all duration-300 hover:shadow-lg hover:brightness-110`}
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
                          className="bg-white/10 text-white"
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
          </ScrollShadow>
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
                <p className="text-foreground-600 text-xs sm:text-start sm:text-sm">
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
