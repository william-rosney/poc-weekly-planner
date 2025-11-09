"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import type FullCalendar from "@fullcalendar/react";

interface WeekNavigatorProps {
  calendarRef: React.RefObject<FullCalendar | null>;
  currentTitle: string;
  isMobile: boolean;
  onNavigate?: () => void;
}

/**
 * Week/Day navigation component with integrated date picker
 * Shows Popover on desktop, Sheet on mobile for better UX
 */
export function WeekNavigator({
  calendarRef,
  currentTitle,
  isMobile,
  onNavigate,
}: WeekNavigatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Navigation handlers
  const handlePrev = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.prev();
      onNavigate?.();
    }
  };

  const handleNext = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.next();
      onNavigate?.();
    }
  };

  const handleToday = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.today();
      onNavigate?.();
    }
  };

  // Date selection handler
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      // Navigate to the selected date
      calendarApi.gotoDate(date);
      setSelectedDate(date);
      setIsOpen(false);
      onNavigate?.();
    }
  };

  // Reusable calendar picker component with Christmas theme
  const calendarPickerElement = (
    <CalendarPicker
      mode="single"
      selected={selectedDate}
      onSelect={handleDateSelect}
      locale={fr}
      initialFocus
      captionLayout="dropdown-months"
      fromYear={2020}
      toYear={2030}
      className="rounded-lg"
    />
  );

  // Title button with click handler and visual indicator
  const titleButton = (
    <button
      className="group flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-christmas-cream/50 transition-colors"
      aria-label="Sélectionner une date"
    >
      <h2 className="text-sm font-semibold text-gray-700">{currentTitle}</h2>
      <CalendarIcon className="h-3.5 w-3.5 text-christmas-gold opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );

  return (
    <div className="flex items-center justify-center gap-4 mb-4 shrink-0">
      {/* Previous button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handlePrev}
        className="h-8 w-8 p-0 hover:bg-christmas-cream/50"
        aria-label="Semaine précédente"
      >
        <ChevronLeft className="h-4 w-4 text-christmas-red" />
      </Button>

      {/* Center: Title + Date Picker + Today button */}
      <div className="flex items-center gap-3">
        {/* Date picker (Popover on desktop, Sheet on mobile) */}
        {isMobile ? (
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>{titleButton}</SheetTrigger>
            <SheetContent side="bottom" className="h-auto">
              <SheetHeader className="mb-4">
                <SheetTitle>Sélectionner une date</SheetTitle>
              </SheetHeader>
              <div className="flex justify-center">{calendarPickerElement}</div>
            </SheetContent>
          </Sheet>
        ) : (
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>{titleButton}</PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              {calendarPickerElement}
            </PopoverContent>
          </Popover>
        )}

        {/* Today button (desktop only) */}
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

      {/* Next button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleNext}
        className="h-8 w-8 p-0 hover:bg-christmas-cream/50"
        aria-label="Semaine suivante"
      >
        <ChevronRight className="h-4 w-4 text-christmas-red" />
      </Button>
    </div>
  );
}
