import { useEffect, useState } from "react";
import { getEvents } from "../api/eventApi";
import { useAuth } from "./authContext";
import { EventContext } from "./eventContext";

export const EventProvider = ({ children }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [isOverall, setIsOverall] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;

    if (!user) {
      setEvents([]);
      setCurrentEvent(null);
      setIsOverall(false);
      setLoading(false);
      return undefined;
    }

    const fetchEvents = async () => {
      setLoading(true);
      try {
        const { data } = await getEvents();
        if (ignore) return;

        setEvents(data);
        const savedId = localStorage.getItem("currentEventId");
        const savedOverall =
          user.role === "superadmin" && savedId === "overall";
        const match = data.find((event) => event._id === savedId);
        setCurrentEvent(savedOverall ? null : match || data[0] || null);
        setIsOverall(savedOverall);
      } catch (err) {
        if (!ignore) {
          console.error("Failed to load events", err);
          setEvents([]);
          setCurrentEvent(null);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchEvents();
    return () => {
      ignore = true;
    };
  }, [user]);

  const selectEvent = (event) => {
    if (!event) return;
    setCurrentEvent(event);
    setIsOverall(false);
    localStorage.setItem("currentEventId", event._id);
  };

  const selectOverall = () => {
    if (user?.role !== "superadmin") return;
    setCurrentEvent(null);
    setIsOverall(true);
    localStorage.setItem("currentEventId", "overall");
  };

  return (
    <EventContext.Provider
      value={{
        events,
        currentEvent,
        isOverall,
        selectEvent,
        selectOverall,
        loading,
        setEvents,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};
