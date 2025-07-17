"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSocket } from "@/hooks/useSockets";
import { useEffect, useState } from "react";
import SensorStatus from "./homepage/sensor-status";
import { Building, Sensor } from "./library/interfaces";
import AlertTableItems from "./homepage/alert-table-items";


export default function Home() {
  const socket = useSocket();
      const [buildings, setBuildings] = useState<(Building & {sensors: Sensor[]})[]>([])
  
      useEffect(() => {
          if (!socket) return;
      
          // Request building list when component mounts
          socket.emit("list_buildings");
      
          // Listen for updatess
          socket.on("building_list", (data) => {
            console.log("Received building list:", data);
            if (data.status_code === 200) {
  
                  const listBuildingsResponse : Building[] = data.data
              
                  // Initialize buildings with empty sensor arrays
                  setBuildings(listBuildingsResponse.map((b) => ({ ...b, sensors: [] })));
  
                  // Fetch sensors for each building
                  listBuildingsResponse.forEach((building) => {
                  socket.emit("get_building_sensors", { id: building.id });
                  });
                  
              }
  
          
          })
      
          // Listen for sensor data response
          socket.on("building_sensors", (data) => {
            if (data.status_code === 200) {
              
              const { id, sensors } = data.data; // Expecting `{ id: buildingId, sensors: [...] }`
              console.log(`Updating building ${id} with sensors:`, sensors); // Check data
  
              setBuildings((prevBuildings) =>
                prevBuildings.map((b) => (b.id === id ? { ...b, sensors } : b))
              );
            }
          });
      
          return () => {
            socket.off("building_list");
            socket.off("get_building_sensors");
          };
        }, [socket]);

  return (
    <div className="container mx-auto flex gap-4">
      <div className="w-2/5 space-y-8">
        <div className="flex flex-col">
              {buildings.map((building) => (
                  <div className="p-4" key={building.id}>
                  <Card key={building.id} >
                    <CardHeader>
                      <CardTitle>{building.name}</CardTitle>
                      <CardDescription>{`${building.name} Sensor Status`}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col">
                        {building.sensors.map((sensor) => (
                          <div key={sensor.id}>
                            <SensorStatus sensor={sensor} />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  </div>
              ))} 
          </div>
      </div>
      
      <div className="w-3/5 p-4 space-y-8">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
            <CardDescription>Global Alert Notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <AlertTableItems timeRange={""}/>
            
          </CardContent>
        </Card>
      </div>
  </div>
  );
}
