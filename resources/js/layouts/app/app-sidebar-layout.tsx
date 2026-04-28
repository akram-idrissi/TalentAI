import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { type BreadcrumbItem } from '@/types';
import  Sidebar  from '@/pages/Sidebar/Sidebar';
import  SidebarTopBar   from '@/pages/Sidebar/SidebarTopBar';
import { useEffect, useState } from 'react';
import { usePage } from "@inertiajs/react";
import { Toaster, toast } from "react-hot-toast";



export default function AppSidebarLayout({ children, breadcrumbs = [] }: { children: React.ReactNode; breadcrumbs?: BreadcrumbItem[] }) {
    const [collapsed, setCollapsed] = useState(false);
    const { flash } = usePage().props as any;
    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
        }, [flash]);
    return (
        <div className="flex h-screen">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

        <div className="flex-1 flex flex-col overflow-hidden">
            <SidebarTopBar />

            {/* CONTENT SCROLL */}
            <div className="flex-1 overflow-y-auto">
                <Toaster  position="top-center" />
            {children}
            </div>
        </div>
</div>
    );
}
