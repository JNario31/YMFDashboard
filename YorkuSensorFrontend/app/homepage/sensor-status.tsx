import { CheckCircle, OctagonAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { SensorStatusProps } from "../library/interfaces";

export default function SensorStatus({ sensor }: SensorStatusProps) {
  const [isOnline, setIsOnline] = useState(false);
  const lastSeenRef = useRef<number>(0);    // ← ref to track timestamp
  const socketRef   = useRef<Socket | null>(null);

  // 1) Socket setup / real‑time updates
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL 
      || "http://localhost:4000";
    console.log("Connecting to", socketUrl);

    const socket = io(socketUrl);             // ← use socketUrl!
    socketRef.current = socket;

    socket.on("sensor_update", (update) => {
      if (
        update.status_code === 200 &&
        Number(update.data?.id) === sensor.id
      ) {
        lastSeenRef.current = Date.now();     // ← write into the ref
        setIsOnline(true);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [sensor.id]);                            // ← only one dep

  // 2) Offline‑check interval
  useEffect(() => {
    const interval = setInterval(() => {
      // if more than 5 seconds since lastSeen → offline
      if (Date.now() - lastSeenRef.current > 5000) {
        setIsOnline(false);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);                                      // ← no deps

  return (
    <div className="flex items-center space-x-2">
      <span className="font-sm">{sensor.name} (ID: {sensor.id}):</span>
      <span className={`text-sm hidden lg:inline ${
          isOnline ? "text-green-700" : "text-red-700"
        }`}>
        {isOnline ? "Online" : "Offline"}
      </span>
      {isOnline 
        ? <CheckCircle  className="text-green-500 w-3 h-3" />  
        : <OctagonAlert className="text-red-500 w-3 h-3" />}
    </div>
  );
}
