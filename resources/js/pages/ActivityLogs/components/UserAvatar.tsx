import { AVATAR_COLORS } from '@/types';
type UserAvatarProps = {
    name: string | null;
    index?: number;
    size?: 'sm' | 'md';
    className?: string;
};
export function UserAvatar({ name, index = 0, size = 'sm', className = '' }: UserAvatarProps) {
    const initials = name
        ? name
              .split(' ')
              .slice(0, 2)
              .map((w) => w[0])
              .join('')
              .toUpperCase()
        : '?';

    const sizeClasses = size === 'md' ? 'h-10 w-10 text-[13px]' : 'h-8 w-8 text-[11px]';

    const gradient = index !== undefined ? AVATAR_COLORS[index % AVATAR_COLORS.length] : 'from-[#6C63FF] to-[#38BDF8]';

    return (
        <div
            className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradient} ${sizeClasses} font-bold text-white ${className} `}
        >
            {initials}
        </div>
    );
}
