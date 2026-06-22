import { Head } from '@inertiajs/react';
import { AtSign, Check, Copy, Download, Share2, TrendingUp } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useRef, useState } from 'react';
import ShareLinkController from '@/actions/App/Http/Controllers/ShareLinkController';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/ui/panel';
import { StatCard } from '@/components/ui/stat-card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Props = {
    public_url: string;
    analytics: {
        visits: number;
        bookings: number;
        conversion_rate: number;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Divulgar',
        href: ShareLinkController.url(),
    },
];

export default function ShareShow({ public_url, analytics }: Props) {
    const [copied, setCopied] = useState(false);
    const qrWrapperRef = useRef<HTMLDivElement>(null);

    const copyLink = async () => {
        await navigator.clipboard.writeText(public_url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(`Agenda seu horário comigo aqui: ${public_url} ✂️`)}`;

    const downloadQr = () => {
        const canvas = qrWrapperRef.current?.querySelector('canvas');

        if (!canvas) {
            return;
        }

        const link = document.createElement('a');
        link.download = 'meu-qr-code.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Divulgar" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Analytics */}
                <div className="grid grid-cols-3 gap-3">
                    <StatCard label="Visitas" value={analytics.visits} />
                    <StatCard label="Agendamentos" value={analytics.bookings} />
                    <StatCard label="Conversão" value={`${analytics.conversion_rate}%`} icon={TrendingUp} />
                </div>

                {/* Link */}
                <Panel className="p-5">
                    <h2 className="mb-1 font-semibold">Seu link de agendamento</h2>
                    <p className="mb-4 text-sm text-muted-foreground">
                        Compartilhe este link para seus clientes agendarem direto com você.
                    </p>

                    <div className="mb-4 flex items-center gap-2">
                        <code className="flex-1 truncate rounded-lg bg-muted px-3 py-2 text-sm">{public_url}</code>
                        <Button size="icon" variant="outline" onClick={copyLink} title="Copiar link">
                            {copied ? <Check className="h-4 w-4 text-(--green-500)" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline" size="sm">
                            <a href={whatsappShareUrl} target="_blank" rel="noopener noreferrer">
                                <Share2 className="h-4 w-4" /> WhatsApp
                            </a>
                        </Button>
                        <Button variant="outline" size="sm" onClick={copyLink}>
                            <AtSign className="h-4 w-4" /> Copiar para bio
                        </Button>
                    </div>
                </Panel>

                {/* QR Code */}
                <Panel className="p-5">
                    <h2 className="mb-1 font-semibold">QR Code</h2>
                    <p className="mb-4 text-sm text-muted-foreground">
                        Imprima e cole na barbearia — o cliente escaneia e agenda na hora.
                    </p>

                    <div className="flex flex-col items-center gap-4">
                        <div ref={qrWrapperRef} className="rounded-xl bg-card p-4">
                            <QRCodeCanvas value={public_url} size={1024} style={{ width: 192, height: 192 }} />
                        </div>
                        <Button onClick={downloadQr}>
                            <Download className="h-4 w-4" /> Baixar PNG (alta resolução)
                        </Button>
                    </div>
                </Panel>
            </div>
        </AppLayout>
    );
}
