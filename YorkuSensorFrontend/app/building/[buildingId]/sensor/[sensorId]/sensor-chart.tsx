"use client"

import { useEffect, useState, useCallback } from "react"
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { io } from "socket.io-client"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { SensorChartProps, SensorData } from "@/app/library/interfaces"

// Define time ranges for data fetching
const TIME_RANGES = {
  HOUR: "1h",
  DAY: "24h",
  WEEK: "7d",
  MONTH: "30d",
  ALLTIME: "all-time",
}

export function SensorChart({
  sensorId,
  dataKey,
  chartConfig,
  lineColors,
  maxDataPoints = 100,
  timeRange = TIME_RANGES.HOUR,
}: SensorChartProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [sensorData, setSensorData] = useState<SensorData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Function to fetch data when timeRange changes
  const fetchData = useCallback(() => {
    setIsLoading(true)
    setError(null)

    console.log(`Fetching data for sensor ${sensorId} with timeRange ${timeRange}`)

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000"
    console.log(`Using socket URL: ${socketUrl}`)

    const socket = io(socketUrl)

    socket.on("connect", () => {
      console.log("Socket connected")
      setIsConnected(true)

      // Request data after connection is established
      socket.emit("get_sensor_data", {
        sensor_id: sensorId,
        time_range: timeRange, // No filter for all-time
        limit: maxDataPoints,  // No limit for all-time
      });

      console.log("Sent get_sensor_data request", {
        sensor_id: sensorId,
        time_range: timeRange,
        limit: maxDataPoints,
      })
    })

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err)
      setError(`Connection error: ${err.message}`)
      setIsLoading(false)
    })

    socket.on("disconnect", () => {
      console.log("Socket disconnected")
      setIsConnected(false)
    })

      // Listen for real-time updates
      socket.on("sensor_update", (update) => {
        console.log("Received sensor_update:", update)
  
        if (update.status_code === 200 && update.data && update.data.id == sensorId) {
          setSensorData((prevData) => {
            const updatedData = [...prevData, update.data]
            return updatedData.slice(-maxDataPoints)
          })
        }
      })

    socket.on("sensor_data", (response) => {
      console.log("Received sensor_data response:", response)

      if (response.status_code === 200 && response.data) {
        setSensorData(response.data)
        setIsLoading(false)
      } else {
        console.error("Invalid response format or error:", response)
        setError("Invalid data received from server")
        setIsLoading(false)
      }
    })



    return () => {
      console.log("Cleaning up socket connection")
      socket.off("connect")
      socket.off("connect_error")
      socket.off("disconnect")
      socket.off("sensor_data")
      socket.off("sensor_update")
      socket.disconnect()
    }
  }, [sensorId, timeRange, maxDataPoints])

  // Effect to fetch data when timeRange changes
  useEffect(() => {
    const cleanup = fetchData()
    return cleanup
  }, [fetchData])

  return (
    <div className="w-full h-[300px]">
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-destructive">{error}</p>
        </div>
      ) : sensorData.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">No data available for the selected time range</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" aspect={4/3}>
          <ChartContainer config={chartConfig} className="w-full h-full">
            <LineChart
              accessibilityLayer
              data={sensorData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="timestamp"
                tickLine={false}
                axisLine={true}
                tickMargin={8}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })
                }}
              />
              <YAxis axisLine={false} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Line
                dataKey={dataKey}
                type="monotone"
                stroke={lineColors[dataKey]}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ChartContainer>
        </ResponsiveContainer>
      )}
    </div>
  )
}

