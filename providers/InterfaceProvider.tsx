'use client';

import EditUsernamePageModal from '@/components/Interface/EditUsernamePageModal';
import PayoutInfoModal from '@/components/Interface/PayoutInfoModal';
import { SearchCreatorMenu } from '@/components/Interface/SearchCreators';
import { SideMenuNavigationComponent } from '@/components/Interface/SideMenuNavigationHeader';
import WithdrawPayoutModal from '@/components/Interface/WithdrawPayoutModal';
import { useEffect, useState } from 'react';
export function InterfaceProvider() {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }

    return (
        <>
            <WithdrawPayoutModal />
            <PayoutInfoModal />
            <SearchCreatorMenu />
            <SideMenuNavigationComponent />
            <EditUsernamePageModal />
        </>
    );
}
