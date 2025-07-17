"use client"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { BuildingFormProps } from "@/app/library/interfaces"

// Define building schema
const buildingSchema = z.object({
  name: z.string().min(1, "Building name is required"),
})

type BuildingFormValues = z.infer<typeof buildingSchema>



export function BuildingForm({ actionType, isConnected, socket }: BuildingFormProps) {
  // Initialize the form
  const form = useForm<BuildingFormValues>({
    resolver: zodResolver(buildingSchema),
    defaultValues: {
      name: "",
    },
  })

  // Handle form submission
  function onSubmit(values: BuildingFormValues) {
    try {
      if (!isConnected) {
        toast.error("Not connected to server. Please try again later.")
        return
      }

      const socketEvent = actionType === "add" ? "add_building" : "delete_building"
      const payload = { name: values.name }

      socket.emit(socketEvent, payload)

      toast.success(`Building ${actionType} successfully!`)

      form.reset()
    } catch (error: any) {
      console.error("Error:", error)
      toast.error(`Error ${actionType}ing building`)
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
              <FormLabel>Building Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter building name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="mt-4 flex justify-start">
          <Button type="submit" disabled={!isConnected}>
            {actionType === "add" ? "Add Building" : "Delete Building"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

