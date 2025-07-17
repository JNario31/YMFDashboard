"use client"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import type { Socket } from "socket.io-client"
import { SubscriberFormProps } from "@/app/library/interfaces"

// Define subscriber schema
const subscriberSchema = z.object({
  email: z.string().email("Enter a valid email"),
})

type SubscriberFormValues = z.infer<typeof subscriberSchema>



export function SubscriberForm({ actionType, isConnected, socket }: SubscriberFormProps) {
  // Initialize the form
  const form = useForm<SubscriberFormValues>({
    resolver: zodResolver(subscriberSchema),
    defaultValues: {
      email: "",
    },
  })

  // Handle form submission
  function onSubmit(values: SubscriberFormValues) {
    try {
      if (!isConnected) {
        toast.error("Not connected to server. Please try again later.")
        return
      }

      const socketEvent = actionType === "add" ? "add_subscriber" : "delete_subscriber"
      const payload = { email: values.email }

      socket.emit(socketEvent, payload)

      toast.success(`Subscriber ${actionType} successfully!`)

      form.reset()
    } catch (error: any) {
      console.error("Error:", error)
      toast.error(`Error ${actionType}ing subscriber`)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter subscriber email" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="mt-4 flex justify-start">
          <Button type="submit" disabled={!isConnected}>
            {actionType === "add" ? "Add Subscriber" : "Delete Subscriber"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

