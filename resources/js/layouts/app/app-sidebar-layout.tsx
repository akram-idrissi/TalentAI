import Sidebar from '@/pages/Sidebar/Sidebar';
import SidebarTopBar from '@/pages/Sidebar/SidebarTopBar';
import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import type { PageProps } from './types';

export default function AppSidebarLayout({ children }: { children: React.ReactNode }) {
    const [mobileOpen, setMobileOpen] = useState(false);

    const { flash } = usePage<PageProps>().props;
    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);
    return (
        <div className="flex h-screen">
            <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <SidebarTopBar setMobileOpen={setMobileOpen} />

                {/* CONTENT SCROLL */}
                <div className="flex-1 overflow-y-auto">
                    <Toaster position="top-center" />
                    {children}
                </div>
            </div>
        </div>
    );
}
