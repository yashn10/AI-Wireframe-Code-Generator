import React from 'react'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Home, ImageDown, Settings, Wallet } from "lucide-react"
import Image from 'next/image'
import Link from 'next/link'

const items = [
    {
        title: "Home",
        url: "/dashboard",
        icon: Home,
    },
    {
        title: "History",
        url: "/history",
        icon: ImageDown,
    },
    {
        title: "Subscription",
        url: "/subscription",
        icon: Wallet,
    },
    {
        title: "Settings",
        url: "#",
        icon: Settings,
    },
]

export function AppSidebar() {
    return (
        <Sidebar>
            <SidebarHeader>
                <div className='p-4'>
                    {/* <Image src={'./logo.svg'} alt='logo' width={100} height={100}
                        className='w-full h-full' />
                    <h2 className='text-sm text-gray-400 text-center'>Build Awesome</h2> */}
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className='mt-5'>
                            {items.map((item, index) => (
                                <Link href={item.url} key={index} className='p-2 text-lg flex gap-2 items-center
                                 hover:bg-gray-100 rounded-lg'>
                                    <item.icon className='h-5 w-5' />
                                    <span>{item.title}</span>
                                </Link>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                {/* <h2 className='p-2 text-gray-400 text-sm'>Copyright @Tubeguruji</h2> */}
            </SidebarFooter>
        </Sidebar>
    )
}