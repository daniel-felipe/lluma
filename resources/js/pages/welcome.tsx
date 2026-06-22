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
            <Head title="GoBarber — Book a chair." />

            <div className="flex min-h-screen flex-col bg-background text-foreground">
                {/* Nav */}
                <header className="flex h-16 items-center justify-between px-6 lg:px-10">
                    <div className="flex items-center gap-2.5">
                        <div
                            className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-md"
                            aria-hidden="true"
                        >
                            <svg viewBox="0 0 64 64" className="h-8 w-8" xmlns="http://www.w3.org/2000/svg">
                                <rect x="0" y="0" width="64" height="64" rx="14" fill="#15130F" />
                                <g>
                                    <rect x="14" y="12" width="4" height="40" transform="rotate(20 16 32)" fill="#FAF7F2" />
                                    <rect x="22" y="12" width="4" height="40" transform="rotate(20 24 32)" fill="#B86F1F" />
                                    <rect x="30" y="12" width="4" height="40" transform="rotate(20 32 32)" fill="#FAF7F2" />
                                    <rect x="38" y="12" width="4" height="40" transform="rotate(20 40 32)" fill="#B86F1F" />
                                    <rect x="46" y="12" width="4" height="40" transform="rotate(20 48 32)" fill="#FAF7F2" />
                                </g>
                            </svg>
                        </div>
                        <span
                            className="text-sm font-semibold tracking-tight"
                            style={{ fontFamily: 'var(--font-display)' }}
                        >
                            GoBarber
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
                                    Log in
                                </Link>
                                {canRegister && (
                                    <Link
                                        href={register()}
                                        className="rounded-sm bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                                    >
                                        Sign up
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
                        For independent barbers
                    </div>

                    <h1
                        className="mb-4 max-w-2xl text-5xl font-bold tracking-tight lg:text-7xl"
                        style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
                    >
                        Book a chair.
                        <br />
                        <span className="text-primary">Skip the wait.</span>
                    </h1>

                    <p className="mb-10 max-w-md text-base text-muted-foreground lg:text-lg">
                        GoBarber lets clients book with you online — and gives you a clean dashboard to run your day.
                    </p>

                    <div className="flex flex-col items-center gap-3 sm:flex-row">
                        {canRegister && (
                            <Link
                                href={register()}
                                className="rounded-sm bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                            >
                                Get started free
                            </Link>
                        )}
                        <Link
                            href={login()}
                            className="rounded-sm border border-border px-8 py-3 text-sm font-medium transition-colors hover:bg-secondary"
                        >
                            Log in
                        </Link>
                    </div>
                </main>

                {/* Footer */}
                <footer className="border-t border-border px-6 py-6 text-center text-xs text-muted-foreground">
                    GoBarber — built for the chair.
                </footer>
            </div>
        </>
    );
}
