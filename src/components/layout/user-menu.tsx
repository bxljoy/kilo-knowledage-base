'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function UserMenu() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user.email?.[0].toUpperCase() || 'U';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2">
          <Avatar>
            <AvatarImage
              src={user.user_metadata?.avatar_url}
              alt={user.user_metadata?.full_name || user.email || 'User'}
            />
            <AvatarFallback>{getUserInitials()}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.user_metadata?.full_name || 'Account'}
            </p>
            <p className="text-xs leading-none text-gray-500">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/dashboard')}>
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
