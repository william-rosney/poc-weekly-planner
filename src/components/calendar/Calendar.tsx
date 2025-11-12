"use client";

import { useEffect, useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Event } from "@/lib/types";
import { EventClickArg, DateSelectArg, EventDropArg } from "@fullcalendar/core";
import { WeekNavigator } from "@/components/calendar/WeekNavigator";
import { tr } from "date-fns/locale";

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

  // Update title when navigation occurs
  const handleNavigate = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
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
  const handleEventResize = async (resizeInfo: {
    event: { id: string; start: Date | null; end: Date | null };
    revert: () => void;
  }) => {
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
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        </div>
      )}

      {/* Week/Day navigation with date picker */}
      <WeekNavigator
        calendarRef={calendarRef}
        currentTitle={currentTitle}
        isMobile={isMobile}
        onNavigate={handleNavigate}
      />

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
          slotMaxTime="24:00:00"
          longPressDelay={300}
          eventShortHeight={46}
          eventMinHeight={30}
          height="auto"
          locale="fr"
          firstDay={6} // Friday
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
          dayCellClassNames="hover:bg-background/30 transition-colors"
        />
      </div>

      <style jsx global>{`
        /* FullCalendar custom styling */
        .fc {
          font-family: inherit;
        }

        .fc .fc-button {
          background-color: var(--primary);
          border-color: var(--primary);
          color: white;
          font-weight: 600;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          transition: all 0.2s;
        }

        .fc .fc-button:hover:not(:disabled) {
          background-color: var(--primary);
          border-color: var(--primary);
        }

        .fc .fc-button:active {
          background-color: var(--primary);
          border-color: var(--primary);
        }

        .fc .fc-button-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .fc .fc-button-active {
          background-color: var(--primary) !important;
          border-color: var(--primary) !important;
        }

        .fc-theme-standard td,
        .fc-theme-standard th {
          border-color: oklch(
            from var(--secondary) l c h / 0.3
          );
        }

        .fc .fc-col-header-cell {
          background-color: oklch(
            from var(--background) l c h / 0.5
          );
          font-weight: 600;
          font-size: 0.75rem; /* text-xs */
          color: var(--primary);
          padding: 0.5rem 0;
        }

        .fc .fc-daygrid-day-number,
        .fc .fc-timegrid-slot-label {
          color: var(--primary);
          font-weight: 600;
        }

        .fc .fc-timegrid-slot-label {
          font-size: 0.7rem; /* Smaller text for time labels */
        }

        /* Increase height of time slots for better visibility */
        .fc .fc-timegrid-slot {
          height: 1.75rem; /* Increased from default ~1.5rem */
        }

        .fc .fc-timegrid-now-indicator-line {
          border-color: var(--secondary);
        }

        .fc .fc-timegrid-now-indicator-arrow {
          border-color: var(--secondary);
        }

        .fc-event {
          border-radius: 0.375rem;
          padding: 0.25rem 0.5rem;
          font-weight: 500;
        }

        .fc-event-title {
          font-weight: 600;
        }

        /* Short events: display time and title on same line */
        .fc-timegrid-event-short .fc-event-main {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 0.375rem;
          overflow: hidden;
          font-size: 0.8rem;
        }

        .fc-timegrid-event-short .fc-event-time {
          display: none;
          flex-shrink: 0;
          white-space: nowrap;
        }

        .fc-timegrid-event-short .fc-event-title {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Today highlight */
        .fc .fc-day-today {
          background-color: oklch(
            from var(--background) l c h / 0.3
          ) !important;
        }

        /* Selection highlight */
        .fc-highlight {
          background-color: oklch(
            from var(--primary) l c h / 0.1
          ) !important;
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
          box-shadow:
            0 4px 6px -1px rgb(0 0 0 / 0.1),
            0 2px 4px -2px rgb(0 0 0 / 0.1);
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
