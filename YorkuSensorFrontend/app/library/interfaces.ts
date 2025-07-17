import { ChartConfig } from "@/components/ui/chart";
import type { Socket } from "socket.io-client";

/**
 * Interfaces for database Items:-------------------
 */
export interface Building{
    id: number
    name: string
}

export interface Sensor{
  id: number
  name: string
}

export interface AlertNotification {
  sensor_id: number
  alert_type: string
  date: string
  value: number
}

export interface SensorData {
  sensor_id: number
  airflow: number
  humidity: number
  pressure: number
  temperature: number
  timestamp: string
}

/**
 * Form Props:-------------------------
 */
export interface SettingFormProps {
  entityType: EntityType;
  actionType: ActionType;
}

// Forms Types: -----------------------------------
export type EntityType = "building" | "sensor" | "subscriber";
export type ActionType = "add" | "delete";

/**
 * Props for Sensor Charts:--------------------
 */
export interface SensorChartProps {
sensorId: string
chartConfig: ChartConfig
dataKey: string
lineColors: Record<string, string>
maxDataPoints?: number
timeRange?: string
}

/**
 * For sensor status on homepage
 */
export interface SensorStatusProps {
    sensor: Sensor
}

/**
 * Form Props:--------------------------
 */
export interface SubscriberFormProps {
    actionType: ActionType
    isConnected: boolean
    socket: Socket
  }

export interface BuildingFormProps {
    actionType: ActionType
    isConnected: boolean
    socket: Socket
  }

export interface SensorFormProps {
  actionType: ActionType
  isConnected: boolean
  socket: Socket
  }

/**
 * Card Props:--------------------------
 */

//Setting Card in Settings menu
export interface SettingCardProps {
    cardTitle: string
    cardDescription: string
    buttonName: string
    drawerTitle: string
    drawerDescription: string
    entityType: "building" | "sensor" | "subscriber"
  }

//Sensor card in Dynamic Sensor pages
export interface SensorCardProps {
  sensorId: string;
  chartConfig: Record<string, ChartConfig>; // Accept multiple configs
  dataKeys: string[];
  title: string;
  description: string;
  lineColors: Record<string, string>;
}