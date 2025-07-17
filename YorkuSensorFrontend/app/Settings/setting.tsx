
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { SettingForm } from "./forms/setting-form"
import { SettingCardProps } from "../library/interfaces"



export default function SettingCard({
  cardTitle,
  cardDescription,
  buttonName,
  drawerTitle,
  drawerDescription,
  entityType,
}: SettingCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{cardTitle}</CardTitle>
        <CardDescription>{cardDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <Drawer>
          <DrawerTrigger asChild>
            <Button>{buttonName}</Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="mx-auto w-full max-w-sm">      
              <DrawerHeader>
                <DrawerTitle>{drawerTitle}</DrawerTitle>
                <DrawerDescription>{drawerDescription}</DrawerDescription>
              </DrawerHeader>
              <div className="p-4 pb-0">
                <SettingForm entityType={entityType} actionType="add" />
                <DrawerFooter>
                  <DrawerClose>Cancel</DrawerClose>
                </DrawerFooter>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </CardContent>
      <CardFooter>
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="destructive">Delete {buttonName}</Button>
          </DrawerTrigger>
          <DrawerContent>
          <div className="mx-auto w-full max-w-sm">  
            <DrawerHeader>
              <DrawerTitle>Delete {drawerTitle}</DrawerTitle>
              <DrawerDescription>Delete {drawerDescription}</DrawerDescription>
            </DrawerHeader>
            <div className="p-4 pb-0">
              <SettingForm entityType={entityType} actionType="delete" />
              <DrawerFooter>
                <DrawerClose>Cancel</DrawerClose>
              </DrawerFooter>
            </div>
          </div>
          </DrawerContent>
        </Drawer>
      </CardFooter>
    </Card>
  )
}

