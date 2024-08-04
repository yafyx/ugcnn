"use client";
import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/id";

dayjs.extend(duration);
dayjs.extend(timezone);
dayjs.locale("id");

enum EventColor {
  Blue = "bg-blue-500",
  Green = "bg-green-500",
  Yellow = "bg-yellow-500",
  Red = "bg-red-500",
  Purple = "bg-purple-500",
  Pink = "bg-pink-500",
  Indigo = "bg-indigo-500",
}

interface Event {
  kegiatan: string;
  tanggal: string;
  start: string;
  end: string;
  color?: EventColor;
}

const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("https://baak-api.vercel.app/kalender");
        if (!res.ok) throw new Error("Failed to fetch events");
        const data = await res.json();
        const coloredEvents = data.data.map((event: Event, index: number) => ({
          ...event,
          color:
            Object.values(EventColor)[index % Object.values(EventColor).length],
        }));
        setEvents(coloredEvents);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("An error occurred"));
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return { events, loading, error };
};

const useTimelineScroll = (ref: React.RefObject<HTMLDivElement>) => {
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (ref.current && ref.current.contains(e.target as Node)) {
        e.preventDefault();
        ref.current.scrollLeft += e.deltaY;
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [ref]);
};

const Timeline: React.FC = () => {
  const { events, loading, error } = useEvents();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  useTimelineScroll(timelineRef);

  const { firstDay, lastDay, totalDays, months } = useMemo(() => {
    const firstDay =
      events.length > 0
        ? dayjs(events[0].start).startOf("day")
        : dayjs().startOf("day");
    const lastDay =
      events.length > 0
        ? dayjs(events[events.length - 1].end).endOf("day")
        : dayjs().endOf("day");
    const totalDays = lastDay.diff(firstDay, "day") + 1;
    const months = Array.from(
      { length: lastDay.diff(firstDay, "month") + 1 },
      (_, i) => firstDay.add(i, "month").startOf("month")
    );
    return { firstDay, lastDay, totalDays, months };
  }, [events]);

  const currentTime = dayjs();
  const dayWidth = 40;
  const eventHeight = 36;
  const eventMargin = 20;
  const marginTop = 80;
  const currentTimePosition = currentTime.diff(firstDay, "day") * dayWidth;

  const openModal = useCallback((event: Event) => {
    setSelectedEvent(event);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorMessage message={error.message} />;
  }

  return (
    <div className="p-4 bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-4">Jadwal Kegiatan Kampus</h1>
      <div className="relative overflow-x-auto" ref={timelineRef}>
        <div
          className="inline-block min-w-full"
          style={{
            width: `${totalDays * dayWidth}px`,
            height: `${events.length * (eventHeight + eventMargin) + marginTop}px`,
          }}
        >
          <MonthHeader months={months} dayWidth={dayWidth} />
          <DayHeader
            totalDays={totalDays}
            firstDay={firstDay}
            dayWidth={dayWidth}
          />
          <CurrentTimeIndicator position={currentTimePosition} />
          <EventList
            events={events}
            firstDay={firstDay}
            dayWidth={dayWidth}
            eventHeight={eventHeight}
            eventMargin={eventMargin}
            marginTop={marginTop}
            currentTime={currentTime}
            openModal={openModal}
          />
        </div>
      </div>
      {isOpen && selectedEvent && (
        <DetailModal event={selectedEvent} closeModal={closeModal} />
      )}
    </div>
  );
};

const MonthHeader: React.FC<{ months: dayjs.Dayjs[]; dayWidth: number }> = ({
  months,
  dayWidth,
}) => (
  <div className="flex mb-4 sticky top-0 z-10 bg-gray-900">
    {months.map((month) => (
      <div
        key={month.format("YYYY-MM")}
        className="flex-shrink-0 text-center font-bold text-yellow-500"
        style={{
          width: `${month.daysInMonth() * dayWidth}px`,
        }}
      >
        {month.format("MMMM")}
      </div>
    ))}
  </div>
);

const DayHeader: React.FC<{
  totalDays: number;
  firstDay: dayjs.Dayjs;
  dayWidth: number;
}> = ({ totalDays, firstDay, dayWidth }) => (
  <div className="flex mb-2 sticky top-8 z-10 bg-gray-900">
    {Array.from({ length: totalDays }, (_, i) => firstDay.add(i, "day")).map(
      (day) => (
        <div
          key={day.format("YYYY-MM-DD")}
          className="flex-shrink-0 text-center"
          style={{ width: `${dayWidth}px` }}
        >
          <div className="text-xs mb-1">{day.format("ddd")}</div>
          <div className="text-sm font-semibold">{day.format("D")}</div>
        </div>
      )
    )}
  </div>
);

const CurrentTimeIndicator: React.FC<{ position: number }> = ({ position }) => (
  <div
    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20"
    style={{ left: `${position}px` }}
  ></div>
);

const EventList: React.FC<{
  events: Event[];
  firstDay: dayjs.Dayjs;
  dayWidth: number;
  eventHeight: number;
  eventMargin: number;
  marginTop: number;
  currentTime: dayjs.Dayjs;
  openModal: (event: Event) => void;
}> = ({
  events,
  firstDay,
  dayWidth,
  eventHeight,
  eventMargin,
  marginTop,
  currentTime,
  openModal,
}) => (
  <div className="relative mt-4">
    {events.map((event, index) => {
      const start = dayjs(event.start || event.tanggal);
      const end = dayjs(event.end || event.tanggal);
      const left = start.diff(firstDay, "day") * dayWidth;
      const width = Math.max((end.diff(start, "day") + 1) * dayWidth, dayWidth);
      const top = index * (eventHeight + eventMargin) + marginTop;

      return (
        <EventItem
          key={event.kegiatan}
          event={event}
          left={left}
          width={width}
          top={top}
          height={eventHeight}
          openDetail={() => openModal(event)}
          now={currentTime}
        />
      );
    })}
  </div>
);

const EventItem: React.FC<{
  event: Event;
  left: number;
  width: number;
  top: number;
  height: number;
  openDetail: () => void;
  now: dayjs.Dayjs;
}> = ({ event, left, width, top, height, openDetail, now }) => {
  const start = dayjs(event.start || event.tanggal);
  const end = dayjs(event.end || event.tanggal);
  const started = now.isAfter(start);
  const ended = now.isAfter(end);
  const diffStart = start.diff(now);
  const diffEnd = end.diff(now);

  return (
    <div
      onClick={openDetail}
      className={`absolute flex items-center z-10 text-white cursor-pointer ${event.color} rounded-xl`}
      style={{
        left: `${left}px`,
        width: `${width}px`,
        top: `${top}px`,
        height: `${height}px`,
      }}
      role="button"
      tabIndex={0}
      aria-label={`Event: ${event.kegiatan}`}
    >
      <span className="event-name text-base md:text-lg text-black font-bold whitespace-nowrap overflow-hidden px-2">
        {event.kegiatan}
      </span>
      {!started && (
        <div className="absolute right-0 top-0 bg-white text-black text-xs rounded-bl-xl px-1">
          {diffStart > 86400000
            ? `${Math.trunc(dayjs.duration(diffStart).asDays())}d`
            : dayjs.duration(diffStart).format("HH:mm:ss")}
        </div>
      )}
      {started && !ended && (
        <div className="absolute right-0 top-0 bg-white text-black text-xs rounded-bl-xl px-1">
          {diffEnd > 86400000
            ? `${Math.trunc(dayjs.duration(diffEnd).asDays())}d`
            : dayjs.duration(diffEnd).format("HH:mm:ss")}
        </div>
      )}
    </div>
  );
};

const DetailModal: React.FC<{ event: Event; closeModal: () => void }> = ({
  event,
  closeModal,
}) => {
  const start = dayjs(event.start || event.tanggal);
  const end = dayjs(event.end || event.tanggal);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="bg-gray-800 p-6 rounded-lg max-w-md w-full"
        role="dialog"
        aria-modal="true"
      >
        <h2 className="text-xl font-bold mb-4">{event.kegiatan}</h2>
        <p className="mb-2">Mulai: {start.format("dddd, D MMMM YYYY HH:mm")}</p>
        {event.end && (
          <p className="mb-4">
            Selesai: {end.format("dddd, D MMMM YYYY HH:mm")}
          </p>
        )}
        <button
          onClick={closeModal}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};

const LoadingSkeleton: React.FC = () => (
  <div className="p-4 bg-gray-900 text-white">
    <div className="h-8 bg-gray-700 rounded w-1/4 mb-4"></div>
    <div className="h-64 bg-gray-700 rounded"></div>
  </div>
);

const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <div className="p-4 bg-gray-900 text-white">
    <h2 className="text-xl font-bold mb-4">Error</h2>
    <p>{message}</p>
  </div>
);

export default Timeline;
