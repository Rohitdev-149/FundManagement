import { useEffect, useState } from "react";
import { getEvents } from "../api/eventApi";
import { useAuth } from "./authContext";
import { EventContext } from "./eventContext";

export const EventProvider = ({ children }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;

    if (!user) {
      setEvents([]);
      setCurrentEvent(null);
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
        const match = data.find((event) => event._id === savedId);
        setCurrentEvent(match || data[0] || null);
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
    localStorage.setItem("currentEventId", event._id);
  };

  return (
    <EventContext.Provider
      value={{ events, currentEvent, selectEvent, loading, setEvents }}
    >
      {children}
    </EventContext.Provider>
  );
};
