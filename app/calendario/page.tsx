"use client";

import { useEffect, useState } from "react";
import Calendar, { CalendarEvent } from "../components/Calendar";
import { Sidebar } from "../components";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getSidebarItems } from "../utils/sidebarItems";
import { useRouter } from "next/navigation";
import { getAuthUser, handleLogout, isAuthenticated } from "../utils";

export default function CalendarioPage() {
  const router = useRouter();
  const [sidebarItems, setSidebarItems] = useState<ReturnType<typeof getSidebarItems>>([]);
  const [userData, setUserData] = useState<any>(null);
  const [activeSection, setActiveSection] = useState('calendario');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([

  ]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleAddEvent = (date: Date, title: string) => {
    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title,
      date,
      color: "bg-blue-500",
    };
    setEvents([...events, newEvent]);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(event => event.id !== eventId));
  };

  const selectedDateEvents = events.filter(
    event => format(event.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
  );

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    const user = getAuthUser();
    setUserData(user);
    if (user?.roles?.[0]) {
      setSidebarItems(getSidebarItems(user.roles[0]));
    }
  }, [router]);

  const onLogout = () => {
    handleLogout();
    router.push('/login');
  };

  if (!userData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Carregando...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        items={sidebarItems}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        userData={userData}
        onLogout={onLogout}
      />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm p-4 flex items-center md:hidden">
          <button
            className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </header>
        <div className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Calendário
          </h1>

          <div className="mb-6">
            <Calendar
              onDateSelect={handleDateSelect}
              selectedDate={selectedDate}
              events={events}
              onAddEvent={handleAddEvent}
              onDeleteEvent={handleDeleteEvent}
            />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Eventos em {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </h2>

            {selectedDateEvents.length > 0 ? (
              <ul className="space-y-2">
                {selectedDateEvents.map(event => (
                  <li
                    key={event.id}
                    className={`p-3 rounded-lg text-white ${event.color}`}
                  >
                    {event.title}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Nenhum evento nesta data</p>
            )}
          </div>          </div>
        </div>
      </div>
    </div>
  );
}
