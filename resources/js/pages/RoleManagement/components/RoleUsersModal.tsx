import { useI18n } from '@/hooks/useI18n';
import { Role, RoleUser } from '@/types/roles';
import { router } from '@inertiajs/react';
import { UserMinus, X } from 'lucide-react';
import { useState } from 'react';
import { UserAvatar } from './UserAvatar';

export function RoleUsersModal({ role, onClose }: { role: Role; onClose: () => void }) {
    const { t } = useI18n();
    const [removingId, setRemovingId] = useState<number | null>(null);

    const removeUser = (user: RoleUser) => {
        setRemovingId(user.id);
        router.delete(route('dashboard.roles.users.remove', { role: role.id, user: user.id }), {
            preserveScroll: true,
            preserveState: true,
            onFinish: () => setRemovingId(null),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="border-ds-border bg-ds-surface w-full max-w-md rounded-2xl border shadow-2xl">
                {/* Header */}
                <div className="border-ds-border flex items-center justify-between border-b px-6 py-4">
                    <div>
                        <h2 className="font-heading text-ds-text font-semibold">{t('roles.role_users_modal.title')}</h2>
                        <p className="text-ds-text3 mt-0.5 text-[12px]">
                            {role.users_count === 1
                                ? t('roles.index.table.user_count.one')
                                : t('roles.index.table.user_count.other', { count: role.users_count })}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="border-ds-border text-ds-text3 hover:bg-ds-bg3 hover:text-ds-text flex h-7 w-7 items-center justify-center rounded-lg border transition"
                    >
                        <X size={14} />
                    </button>
                </div>

                {/* User list */}
                <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
                    {role.users.length === 0 ? (
                        <p className="text-ds-text3 py-8 text-center text-[13px]">{t('roles.role_users_modal.empty')}</p>
                    ) : (
                        <div className="space-y-2">
                            {role.users.map((user, index) => (
                                <div
                                    key={user.id}
                                    className={`border-ds-border flex items-center gap-3 rounded-xl border px-3 py-2.5 ${!user.is_active ? 'opacity-50' : ''}`}
                                >
                                    <UserAvatar name={user.name} index={index} />
                                    <div className="min-w-0 flex-1">
                                        <p className="font-heading text-ds-text truncate text-[13px] font-semibold">{user.name}</p>
                                        <p className="text-ds-text3 truncate text-[11px]">{user.email}</p>
                                    </div>
                                    <button
                                        onClick={() => removeUser(user)}
                                        disabled={removingId === user.id}
                                        className="border-ds-border text-ds-text3 hover:border-ds-red/40 hover:text-ds-red flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition disabled:opacity-40"
                                        title={t('roles.role_users_modal.actions.remove')}
                                    >
                                        <UserMinus size={13} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="border-ds-border flex justify-end border-t px-6 py-4">
                    <button
                        onClick={onClose}
                        className="border-ds-border text-ds-text2 hover:bg-ds-bg3 hover:text-ds-text rounded-lg border px-4 py-2 text-[13px] transition"
                    >
                        {t('roles.edit_modal.actions.cancel')}
                    </button>
                </div>
            </div>
        </div>
    );
}
