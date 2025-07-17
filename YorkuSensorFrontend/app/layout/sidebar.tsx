import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { Home, Settings } from "lucide-react";
import { NavBuilding } from "./nav-building";
import { NavSettings } from "./nav-settings";
import { NavMain } from "./nav-main";


const data = {
    navMain: [
        {
            name: "Home",
            url:"/",
            icon: Home
        },
    ],
    navSettings: [
        {
            name: "Settings",
            url: "/Settings",
            icon: Settings
        }
    ]
}

export function AppSidebar(){
    return(
        <Sidebar collapsible="icon">
            <SidebarContent>
                <NavMain items = {data.navMain}/>
                <NavBuilding/>
                <NavSettings items = {data.navSettings}/>
            </SidebarContent>
        </Sidebar>
    )
}