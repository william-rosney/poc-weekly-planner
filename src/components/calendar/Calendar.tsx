"use client";

import { useEffect, useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Event } from "@/lib/types";
import { EventClickArg, DateSelectArg, EventDropArg } from "@fullcalendar/core";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarProps {
  events: Event[];
  loading?: boolean;
  onEventClick?: (event: Event) => void;
  onDateSelect?: (start: Date, end: Date) => void;
  onEventUpdate?: (eventId: string, start: Date, end: Date) => Promise<void>;
}

/**
 * Calendar component using FullCalendar
 * Responsive: shows day view on mobile, week view on desktop
 */
export function Calendar({
  events,
  loading = false,
  onEventClick,
  onDateSelect,
  onEventUpdate,
}: CalendarProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [currentTitle, setCurrentTitle] = useState("");
  const calendarRef = useRef<FullCalendar>(null);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Change view when mobile state changes
  useEffect(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.changeView(isMobile ? "timeGridDay" : "timeGridWeek");
    }
  }, [isMobile]);

  // Navigation handlers
  const handlePrev = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.prev();
      setCurrentTitle(calendarApi.view.title);
    }
  };

  const handleNext = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.next();
      setCurrentTitle(calendarApi.view.title);
    }
  };

  const handleToday = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.today();
      setCurrentTitle(calendarApi.view.title);
    }
  };

  // Update title when view changes
  const handleDatesSet = (dateInfo: { view: { title: string } }) => {
    setCurrentTitle(dateInfo.view.title);
  };

  // Convert Event[] to FullCalendar EventInput format
  const calendarEvents = events.map((event) => ({
    id: event.id,
    title: event.title,
    start: event.start_time,
    end: event.end_time,
    backgroundColor: event.color || "#C8102E", // Default: christmas-red
    borderColor: event.color || "#C8102E",
    extendedProps: {
      description: event.description,
      link: event.link,
      cost_per_person: event.cost_per_person,
      user_id: event.user_id,
    },
  }));

  // Handle event click
  const handleEventClick = (clickInfo: EventClickArg) => {
    if (!onEventClick) return;

    const originalEvent = events.find((e) => e.id === clickInfo.event.id);
    if (originalEvent) {
      onEventClick(originalEvent);
    }
  };

  // Handle date selection (for creating new events)
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    if (!onDateSelect) return;

    onDateSelect(selectInfo.start, selectInfo.end);

    // Clear the selection
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect();
  };

  // Handle event drop (drag and drop)
  const handleEventDrop = async (dropInfo: EventDropArg) => {
    if (!onEventUpdate) {
      // Revert if no update handler
      dropInfo.revert();
      return;
    }

    const { event } = dropInfo;
    const eventId = event.id;
    const newStart = event.start;
    const newEnd = event.end;

    if (!eventId || !newStart || !newEnd) {
      dropInfo.revert();
      return;
    }

    try {
      await onEventUpdate(eventId, newStart, newEnd);
    } catch (error: unknown) {
      console.error("[Calendar] Error updating event:", error);
      dropInfo.revert();
      alert("Erreur lors du déplacement de l'événement");
    }
  };

  // Handle event resize
  const handleEventResize = async (resizeInfo: { event: { id: string; start: Date | null; end: Date | null }; revert: () => void }) => {
    if (!onEventUpdate) {
      // Revert if no update handler
      resizeInfo.revert();
      return;
    }

    const { event } = resizeInfo;
    const eventId = event.id;
    const newStart = event.start;
    const newEnd = event.end;

    if (!eventId || !newStart || !newEnd) {
      resizeInfo.revert();
      return;
    }

    try {
      await onEventUpdate(eventId, newStart, newEnd);
    } catch (error: unknown) {
      console.error("[Calendar] Error resizing event:", error);
      resizeInfo.revert();
      alert("Erreur lors du redimensionnement de l'événement");
    }
  };

  return (
    <div className="calendar-container relative h-full flex flex-col">
      {loading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-christmas-red border-r-transparent"></div>
        </div>
      )}

      {/* Custom navigation for both desktop and mobile */}
      <div className="flex items-center justify-center gap-4 mb-4 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrev}
          className="h-8 w-8 p-0 hover:bg-christmas-cream/50"
        >
          <ChevronLeft className="h-4 w-4 text-christmas-red" />
        </Button>

        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-gray-700">
            {currentTitle}
          </h2>
          {!isMobile && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleToday}
              className="h-7 px-3 text-xs border-christmas-red/30 text-christmas-red hover:bg-christmas-cream/50"
            >
              Aujourd&apos;hui
            </Button>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleNext}
          className="h-8 w-8 p-0 hover:bg-christmas-cream/50"
        >
          <ChevronRight className="h-4 w-4 text-christmas-red" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={isMobile ? "timeGridDay" : "timeGridWeek"}
          headerToolbar={false}
          datesSet={handleDatesSet}
          events={calendarEvents}
          eventClick={handleEventClick}
          select={handleDateSelect}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          slotMinTime="06:00:00"
          slotMaxTime="23:00:00"
          height="auto"
          locale="fr"
          firstDay={1} // Monday
          nowIndicator={true}
          allDaySlot={false}
          slotDuration="00:30:00"
          snapDuration="00:15:00"
          buttonText={{
            today: "Aujourd'hui",
            week: "Semaine",
            day: "Jour",
          }}
          // Drag and drop
          editable={!!onEventUpdate}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          eventDurationEditable={true}
          eventStartEditable={true}
          // Styling
          eventClassNames="cursor-pointer hover:opacity-80 transition-opacity"
          dayCellClassNames="hover:bg-christmas-cream/30 transition-colors"
        />
      </div>

      <style jsx global>{`
        /* FullCalendar custom styling */
        .fc {
          font-family: inherit;
        }

        .fc .fc-button {
          background-color: oklch(0.45 0.16 25); /* christmas-red */
          border-color: oklch(0.45 0.16 25);
          color: white;
          font-weight: 600;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          transition: all 0.2s;
        }

        .fc .fc-button:hover:not(:disabled) {
          background-color: oklch(0.38 0.16 25); /* christmas-red-dark */
          border-color: oklch(0.38 0.16 25);
        }

        .fc .fc-button:active {
          background-color: oklch(0.38 0.16 25);
          border-color: oklch(0.38 0.16 25);
        }

        .fc .fc-button-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .fc .fc-button-active {
          background-color: oklch(0.38 0.16 25) !important;
          border-color: oklch(0.38 0.16 25) !important;
        }

        .fc-theme-standard td,
        .fc-theme-standard th {
          border-color: oklch(
            0.65 0.04 80 / 0.3
          ); /* christmas-gold with opacity */
        }

        .fc .fc-col-header-cell {
          background-color: oklch(0.96 0.01 65 / 0.5); /* christmas-cream */
          font-weight: 600;
          font-size: 0.75rem; /* text-xs */
          color: oklch(0.45 0.16 25); /* christmas-red */
          padding: 0.5rem 0;
        }

        .fc .fc-daygrid-day-number,
        .fc .fc-timegrid-slot-label {
          color: oklch(0.45 0.16 25); /* christmas-red */
          font-weight: 600;
        }

        .fc .fc-timegrid-slot-label {
          font-size: 0.7rem; /* Smaller text for time labels */
        }

        .fc .fc-timegrid-now-indicator-line {
          border-color: oklch(0.65 0.04 80); /* christmas-gold */
        }

        .fc .fc-timegrid-now-indicator-arrow {
          border-color: oklch(0.65 0.04 80); /* christmas-gold */
        }

        .fc-event {
          border-radius: 0.375rem;
          padding: 0.25rem 0.5rem;
          font-weight: 500;
        }

        .fc-event-title {
          font-weight: 600;
        }

        /* Today highlight */
        .fc .fc-day-today {
          background-color: oklch(
            0.96 0.01 65 / 0.3
          ) !important; /* christmas-cream */
        }

        /* Selection highlight */
        .fc-highlight {
          background-color: oklch(
            0.45 0.16 25 / 0.1
          ) !important; /* christmas-red with opacity */
        }

        /* Drag and drop styles */
        .fc-event-dragging {
          opacity: 0.7;
          cursor: move !important;
          z-index: 999;
        }

        .fc-event-resizing {
          opacity: 0.7;
        }

        .fc-event.fc-event-draggable {
          cursor: move;
        }

        .fc-event.fc-event-resizable {
          cursor: ew-resize;
        }

        .fc-event:hover {
          transform: scale(1.02);
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
          transition: all 0.2s ease;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .fc .fc-toolbar {
            flex-direction: column;
            gap: 0.5rem;
          }

          .fc .fc-toolbar-chunk {
            display: flex;
            justify-content: center;
          }

          .fc .fc-button {
            padding: 0.375rem 0.75rem;
            font-size: 0.875rem;
          }
        }
      `}</style>
    </div>
  );
}
