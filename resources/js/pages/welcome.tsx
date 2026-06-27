import { Head, Link, usePage } from '@inertiajs/react';
import { Scissors } from 'lucide-react';
import { dashboard, login, register } from '@/routes';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Lluma — Sua agenda, sempre cheia." />

            <div className="flex min-h-screen flex-col bg-background text-foreground">
                {/* Nav */}
                <header className="flex h-16 items-center justify-between px-6 lg:px-10">
                    <div className="flex items-center gap-2.5">
                        <div
                            className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-md"
                            aria-hidden="true"
                        >
                            <svg viewBox="0 0 64 64" fill="none" className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Lluma">
                                <rect width="64" height="64" rx="16" fill="#15130F" />
                                <circle cx="19.5" cy="20" r="3.1" fill="#FAF7F2" />
                                <rect x="27.5" y="16.9" width="21" height="6.2" rx="3.1" fill="#FAF7F2" />
                                <circle cx="19.5" cy="32" r="3.1" fill="#E5A658" />
                                <rect x="27.5" y="28.9" width="21" height="6.2" rx="3.1" fill="#E5A658" />
                                <circle cx="19.5" cy="44" r="3.1" fill="#FAF7F2" />
                                <rect x="27.5" y="40.9" width="13" height="6.2" rx="3.1" fill="#FAF7F2" />
                            </svg>
                        </div>
                        <span
                            className="text-sm font-semibold tracking-tight"
                            style={{ fontFamily: 'var(--font-display)' }}
                        >
                            Lluma
                        </span>
                    </div>

                    <nav className="flex items-center gap-3">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="rounded-sm border border-border px-4 py-1.5 text-sm font-medium transition-colors hover:bg-secondary"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    Entrar
                                </Link>
                                {canRegister && (
                                    <Link
                                        href={register()}
                                        className="rounded-sm bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                                    >
                                        Criar conta
                                    </Link>
                                )}
                            </>
                        )}
                    </nav>
                </header>

                {/* Hero */}
                <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center lg:py-32">
                    <div
                        className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-xs font-semibold text-muted-foreground uppercase" style={{ letterSpacing: '0.08em' }}
                    >
                        <Scissors className="h-3.5 w-3.5" />
                        Para barbearias e salões
                    </div>

                    <h1
                        className="mb-4 max-w-2xl text-5xl font-bold tracking-tight lg:text-7xl"
                        style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
                    >
                        Sua agenda,
                        <br />
                        <span className="text-primary">sempre cheia.</span>
                    </h1>

                    <p className="mb-10 max-w-md text-base text-muted-foreground lg:text-lg">
                        Clientes agendam em três toques pelo link. Você gerencia o dia todo do celular, entre um atendimento e outro.
                    </p>

                    <div className="flex flex-col items-center gap-3 sm:flex-row">
                        {canRegister && (
                            <Link
                                href={register()}
                                className="rounded-sm bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                            >
                                Começar de graça
                            </Link>
                        )}
                        <Link
                            href={login()}
                            className="rounded-sm border border-border px-8 py-3 text-sm font-medium transition-colors hover:bg-secondary"
                        >
                            Entrar
                        </Link>
                    </div>
                </main>

                {/* Footer */}
                <footer className="border-t border-border px-6 py-6 text-center text-xs text-muted-foreground">
                    Lluma — agendamento simples, agenda sempre cheia.
                </footer>
            </div>
        </>
    );
}
