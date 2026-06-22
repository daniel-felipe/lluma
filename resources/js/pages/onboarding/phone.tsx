import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = {
    status?: string;
};

export default function Phone({ status }: Props) {
    return (
        <AuthLayout
            title="Criar conta"
            description="Digite seu número de celular para começar"
        >
            <Head title="Criar conta" />

            <Form {...store.form()} className="flex flex-col gap-6">
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Celular</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    name="phone"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="tel"
                                    placeholder="(31) 99999-0000"
                                />
                                <InputError message={errors.phone} />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                tabIndex={2}
                                disabled={processing}
                            >
                                {processing && <Spinner />}
                                Continuar
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            Já tem conta?{' '}
                            <TextLink href={login()} tabIndex={3}>
                                Entrar
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </AuthLayout>
    );
}
