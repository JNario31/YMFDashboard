"use client"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { SensorFormProps } from "@/app/library/interfaces"

// Define sensor schema
const sensorSchema = z.object({
  name: z.string().min(1, "Sensor name is required"),
  building_name: z.string().min(1, "Select a building"),
})

type SensorFormValues = z.infer<typeof sensorSchema>


export function SensorForm({ actionType, isConnected, socket }: SensorFormProps) {
  const [buildings, setBuildings] = useState<{ id: number; name: string }[]>([])

  // Initialize the form
  const form = useForm<SensorFormValues>({
    resolver: zodResolver(sensorSchema),
    defaultValues: {
      name: "",
      building_name: "",
    },
  })

  useEffect(() => {
    if (!socket) return;
  
    console.log("Emitting list_buildings event...");
    socket.emit("list_buildings");
  
    const handleBuildingsList = (data: { data: { id: number; name: string }[]; status_code: number }) => {
      console.log("Received building list for settings:", data);
      if (data.status_code === 200) {
        setBuildings(data.data);
      }
    };
  
    socket.on("building_list", handleBuildingsList);
  
    // Cleanup function to remove event listener when component unmounts or re-renders
    return () => {
      socket.off("building_list", handleBuildingsList);
    };
  }, [socket]); // Include `socket` as a dependency
  

  // Handle form submission
  function onSubmit(values: SensorFormValues) {
    try {
      if (!isConnected) {
        toast.error("Not connected to server. Please try again later.")
        return
      }

      const socketEvent = actionType === "add" ? "add_sensor" : "delete_sensor"
      const payload = {
        name: values.name,
        building_name: values.building_name,
      }

      socket.emit(socketEvent, payload)

      toast.success(`Sensor ${actionType} successfully!`)

      form.reset()
    } catch (error: any) {
      console.error("Error:", error)
      toast.error(`Error ${actionType}ing sensor`)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sensor Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter sensor name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="building_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Building</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a building" />
                  </SelectTrigger>
                  <SelectContent>
                    {buildings.map((building) => (
                      <SelectItem key={building.id} value={building.name}>
                        {building.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="mt-4 flex justify-start">
          <Button type="submit" disabled={!isConnected}>
            {actionType === "add" ? "Add Sensor" : "Delete Sensor"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

