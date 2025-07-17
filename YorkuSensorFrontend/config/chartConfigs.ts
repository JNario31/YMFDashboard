import { ChartConfig } from "@/components/ui/chart"

export const temperatureConfig: ChartConfig = {
    temperature: {
      label: "Temperature",
      color: "hsl(var(--chart-1))",
    },
  }
  
  export const humidityConfig: ChartConfig = {
    humidity: {
      label: "Humidity",
      color: "hsl(var(--chart-2))",
    },
  }
  
  export const pressureConfig: ChartConfig = {
      pressure: {
          label: "Pressure",
          color: "hsl(var(--chart-3))",
      }
  }
  
  export const airflowConfig: ChartConfig = {
      airflow: {
          label: "Airflow",
          color: "hsl(var(--chart-4))",
      }
  }