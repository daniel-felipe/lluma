import { Link, router, usePage } from '@inertiajs/react';
import { LogOut, Settings, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { mainNavItems } from '@/components/nav-items';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { UserInfo } from '@/components/user-info';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { cn } from '@/lib/utils';
import { logout } from '@/routes';
import { edit } from '@/routes/user-profile';

const itemClass =
    'flex flex-1 flex-col items-center gap-1 py-1 text-[11px] font-semibold transition-transform active:scale-[0.97]';

export function AppBottomNav() {
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const { auth } = usePage().props;
    const cleanup = useMobileNavigation();
    const [profileOpen, setProfileOpen] = useState(false);

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <nav className="fixed inset-x-0 bottom-0 z-50 flex items-stretch justify-around border-t bg-background px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden">
            {mainNavItems.map((item) => {
                const active = isCurrentOrParentUrl(item.href);

                return (
                    <Link
                        key={item.title}
                        href={item.href}
                        prefetch
                        className={cn(
                            itemClass,
                            active
                                ? 'text-primary'
                                : 'text-muted-foreground',
                        )}
                    >
                        {item.icon && <item.icon size={22} />}
                        <span className="text-center leading-tight">{item.shortTitle ?? item.title}</span>
                    </Link>
                );
            })}

            <Sheet open={profileOpen} onOpenChange={setProfileOpen}>
                <SheetTrigger
                    className={cn(itemClass, 'text-muted-foreground')}
                >
                    <UserIcon size={22} />
                    <span>Perfil</span>
                </SheetTrigger>
                <SheetContent
                    side="bottom"
                    className="gap-0 rounded-t-2xl pb-[max(1rem,env(safe-area-inset-bottom))]"
                >
                    <SheetHeader>
                        <SheetTitle className="sr-only">Perfil</SheetTitle>
                        <div className="flex items-center gap-3 text-left">
                            <UserInfo user={auth.user} showEmail />
                        </div>
                    </SheetHeader>
                    <div className="flex flex-col gap-1 px-4 pb-2">
                        <Link
                            href={edit()}
                            prefetch
                            onClick={() => {
                                setProfileOpen(false);
                                cleanup();
                            }}
                            className="flex min-h-11 items-center gap-3 rounded-lg px-2 text-sm transition-colors hover:bg-accent"
                        >
                            <Settings className="size-5" />
                            Configurações
                        </Link>
                        <Link
                            href={logout()}
                            as="button"
                            onClick={handleLogout}
                            data-test="logout-button"
                            className="flex min-h-11 items-center gap-3 rounded-lg px-2 text-sm transition-colors hover:bg-accent"
                        >
                            <LogOut className="size-5" />
                            Sair
                        </Link>
                    </div>
                </SheetContent>
            </Sheet>
        </nav>
    );
}
