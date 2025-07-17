"use client";
import { ChartConfig } from "@/components/ui/chart";
import { useParams } from "next/navigation";
import { airflowConfig, humidityConfig, pressureConfig, temperatureConfig } from "@/config/chartConfigs";
import SensorCard from "./sensor-card";

export default function SensorPage() {
  const params = useParams();
  const sensorId = params.sensorId as string;
  const buildingId = params.buildingId as string;

  const sensorChartConfig: Record<string, ChartConfig> = {
    temperature: temperatureConfig,
    humidity: humidityConfig,
    pressure: pressureConfig,
    airflow: airflowConfig,
  };

  const lineColors: Record<string, string> = {
    temperature: "var(--chart-1)",
    humidity: "var(--chart-2)",
    airflow: "var(--chart-3)",
    pressure: "var(--chart-4)",
  };

  if (!sensorId) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold">
        {`Building ID: ${buildingId}`}
      </h1>
      <SensorCard
        sensorId={sensorId}
        chartConfig={sensorChartConfig} // Pass the entire config object
        dataKeys={["temperature", "humidity", "airflow", "pressure"]}
        title={`Sensor ID: ${sensorId}`}
        description="Real-time sensor data for temperature, humidity, airflow, and pressure"
        lineColors={lineColors}
      />
    </div>
  );
}
