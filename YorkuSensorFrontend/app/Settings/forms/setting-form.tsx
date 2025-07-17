"use client"

import { useEffect, useState } from "react"
import io from "socket.io-client"
import { SubscriberForm } from "./subscriber-form"
import { BuildingForm } from "./building-form"
import { SensorForm } from "./sensor-form"
import { SettingFormProps } from "@/app/library/interfaces"

// Initialize socket connection with environment variable
const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000"
const socket = io(socketUrl)



export function SettingForm({ entityType, actionType }: SettingFormProps) {
  const [isConnected, setIsConnected] = useState(socket.connected)

  useEffect(() => {
    // Handle socket connection events
    const onConnect = () => setIsConnected(true)
    const onDisconnect = () => setIsConnected(false)

    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)

    // Cleanup listeners when component unmounts
    return () => {
      socket.off("connect", onConnect)
      socket.off("disconnect", onDisconnect)
    }
  }, [])

  // Render the appropriate form based on entity type
  return (
    <div className="space-y-3">
      {!isConnected && (
        <div className="text-sm text-red-500 mt-2">
          Not connected to server. Connection issues may prevent form submission.
        </div>
      )}

      {entityType === "building" && <BuildingForm actionType={actionType} isConnected={isConnected} socket={socket} />}

      {entityType === "sensor" && <SensorForm actionType={actionType} isConnected={isConnected} socket={socket} />}

      {entityType === "subscriber" && (
        <SubscriberForm actionType={actionType} isConnected={isConnected} socket={socket} />
      )}
    </div>
  )
}

