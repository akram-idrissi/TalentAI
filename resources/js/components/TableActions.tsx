import { ReactNode } from 'react';

type TableActionsProps = {
    children: ReactNode;
};

export function TableActions({ children }: TableActionsProps) {
    return <div className="flex items-center justify-center gap-2">{children}</div>;
}
