import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { store } from '@/routes/password/reset-phone';

export default function ResetPhone() {
    return (
        <AuthLayout
            title="Redefinir senha"
            description="Digite o código recebido por SMS e sua nova senha"
        >
            <Head title="Redefinir senha" />

            <Form {...store.form()} className="flex flex-col gap-6">
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Telefone</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    required
                                    placeholder="(31) 99999-0000"
                                />
                                <InputError message={errors.phone} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="code">
                                    Código de verificação
                                </Label>
                                <Input
                                    id="code"
                                    name="code"
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    required
                                    placeholder="000000"
                                />
                                <InputError message={errors.code} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Nova senha</Label>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    placeholder="Mínimo 8 caracteres"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirmar nova senha
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    required
                                    placeholder="Confirme a senha"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={processing}
                        >
                            {processing && <Spinner />}
                            Redefinir senha
                        </Button>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
