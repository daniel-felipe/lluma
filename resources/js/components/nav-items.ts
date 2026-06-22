import { CalendarDays, CalendarRange, Share2 } from 'lucide-react';
import ShareLinkController from '@/actions/App/Http/Controllers/ShareLinkController';
import WeeklyAgendaController from '@/actions/App/Http/Controllers/WeeklyAgendaController';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

export const mainNavItems: NavItem[] = [
    {
        title: 'Agenda de hoje',
        shortTitle: 'Hoje',
        href: dashboard(),
        icon: CalendarDays,
    },
    {
        title: 'Agenda da semana',
        shortTitle: 'Semana',
        href: WeeklyAgendaController.url(),
        icon: CalendarRange,
    },
    {
        title: 'Divulgar',
        href: ShareLinkController.url(),
        icon: Share2,
    },
];
