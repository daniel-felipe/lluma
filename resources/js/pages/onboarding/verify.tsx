import { Form, Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { resend } from '@/routes/register';
import { store as verifyStore } from '@/routes/register/verify';

type Props = {
    phone: string;
    resendAvailableAt?: string;
};

export default function Verify({ phone, resendAvailableAt }: Props) {
    const [secondsLeft, setSecondsLeft] = useState<number>(0);

    useEffect(() => {
        if (!resendAvailableAt) {
            setSecondsLeft(0);
            return;
        }

        const updateCountdown = () => {
            const diff = Math.max(
                0,
                Math.ceil(
                    (new Date(resendAvailableAt).getTime() - Date.now()) / 1000,
                ),
            );
            setSecondsLeft(diff);
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);

        return () => clearInterval(interval);
    }, [resendAvailableAt]);

    const resendDisabled = secondsLeft > 0;

    return (
        <AuthLayout
            title="Verificar celular"
            description={`Digite o código enviado para ${phone}`}
        >
            <Head title="Verificar celular" />

            <Form {...verifyStore.form()} className="flex flex-col gap-6">
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="code">
                                    Código de verificação
                                </Label>
                                <InputOTP
                                    maxLength={6}
                                    name="code"
                                    id="code"
                                    autoFocus
                                >
                                    <InputOTPGroup>
                                        <InputOTPSlot index={0} />
                                        <InputOTPSlot index={1} />
                                        <InputOTPSlot index={2} />
                                        <InputOTPSlot index={3} />
                                        <InputOTPSlot index={4} />
                                        <InputOTPSlot index={5} />
                                    </InputOTPGroup>
                                </InputOTP>
                                <InputError message={errors.code} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Criar senha</Label>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="new-password"
                                    placeholder="Mínimo 8 caracteres"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirmar senha
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    placeholder="Repita a senha"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                tabIndex={4}
                                disabled={processing}
                            >
                                {processing && <Spinner />}
                                Verificar e entrar
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            {resendDisabled ? (
                                <Skeleton className="mx-auto h-4 w-48" />
                            ) : (
                                <Form {...resend.form()} className="inline">
                                    {({ processing: resending }) => (
                                        <button
                                            type="submit"
                                            disabled={
                                                resending || resendDisabled
                                            }
                                            className="underline underline-offset-4 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {resending ? (
                                                <Spinner />
                                            ) : (
                                                'Reenviar código'
                                            )}
                                        </button>
                                    )}
                                </Form>
                            )}
                            {resendDisabled && (
                                <span className="block text-xs">
                                    Aguarde {secondsLeft}s para reenviar
                                </span>
                            )}
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
