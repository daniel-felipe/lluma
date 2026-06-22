import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { store } from '@/routes/password/forgot-phone';

export default function ForgotPhone() {
    return (
        <AuthLayout
            title="Recuperar senha por SMS"
            description="Digite seu telefone para receber um código de verificação"
        >
            <Head title="Recuperar senha" />

            <Form {...store.form()} className="flex flex-col gap-6">
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Telefone</Label>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                required
                                autoFocus
                                placeholder="(31) 99999-0000"
                            />
                            <InputError message={errors.phone} />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={processing}
                        >
                            {processing && <Spinner />}
                            Enviar código
                        </Button>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
