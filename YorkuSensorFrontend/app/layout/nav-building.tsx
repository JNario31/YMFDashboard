"use client"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from "@/components/ui/sidebar";
import { useSocket } from "@/hooks/useSockets";
import { Building2, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react"
import { Building, Sensor } from "../library/interfaces";

export function NavBuilding(){
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

      return(
      <SidebarGroup>
        <SidebarGroupLabel>Buildings</SidebarGroupLabel>
        <SidebarMenu>
            {buildings.map((building)=>(
                <Collapsible
                key={building.id}
                asChild
                className="group/collapsible">
                    <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                            <SidebarMenuButton tooltip={building.name}>
                                <Building2/>
                                <span>{building.name}</span>
                                <ChevronRight className="ml-auto transition-transform duration-200 group-open:rotate-90"/>
                            </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <SidebarMenuSub>
                                {building.sensors.map((sensor)=>(
                                    <SidebarMenuSubItem key={sensor.id}>
                                        <Link
                                        href={`/building/${building.id}/sensor/${sensor.id}`}
                                        title={`${building.name}: ${sensor.name}`}>
                                            <SidebarMenuSubButton asChild>
                                                <span>{sensor.name}</span>
                                            </SidebarMenuSubButton>
                                        </Link>
                                    </SidebarMenuSubItem>
                                ))}
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </SidebarMenuItem>
                </Collapsible>
            ))}
        </SidebarMenu>
      </SidebarGroup>
      );

}
