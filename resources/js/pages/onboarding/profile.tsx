import { Form, Head, useHttp } from "@inertiajs/react";
import { useEffect, useState } from "react";
import InputError from "@/components/input-error";
import PhoneInput from "@/components/phone-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import AuthLayout from "@/layouts/auth-layout";
import { update } from "@/routes/onboarding/profile";
import { available as slugAvailable } from "@/routes/slug";

type ProfileData = {
    business_name: string | null;
    slug: string | null;
    address_street: string | null;
    address_number: string | null;
    address_neighborhood: string | null;
    address_city: string | null;
    address_state: string | null;
    address_cep: string | null;
    profile_photo_url: string | null;
    cover_photo_url: string | null;
};

type Props = {
    barber: { name: string | null; phone: string | null };
    profile: ProfileData | null;
    onboarding_step: string;
    steps: string[];
};

const BRAZIL_STATES = [
    "AC",
    "AL",
    "AP",
    "AM",
    "BA",
    "CE",
    "DF",
    "ES",
    "GO",
    "MA",
    "MT",
    "MS",
    "MG",
    "PA",
    "PB",
    "PR",
    "PE",
    "PI",
    "RJ",
    "RN",
    "RS",
    "RO",
    "RR",
    "SC",
    "SP",
    "SE",
    "TO",
];

function toSlug(name: string): string {
    return name
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 50);
}

function onlyDigits(value: string): string {
    return value.replace(/\D/g, "");
}

function formatCep(value: string): string {
    const digits = onlyDigits(value).slice(0, 8);

    if (digits.length <= 5) {
        return digits;
    }

    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

type ViaCepResponse = {
    logradouro?: string;
    bairro?: string;
    localidade?: string;
    uf?: string;
    erro?: boolean;
};

export default function Profile({ barber, profile, steps }: Props) {
    const [slug, setSlug] = useState(profile?.slug ?? "");
    const [slugAvailability, setSlugAvailability] = useState<{
        available: boolean;
        suggestion: string;
    } | null>(null);

    const [cep, setCep] = useState(profile?.address_cep ?? "");
    const [street, setStreet] = useState(profile?.address_street ?? "");
    const [neighborhood, setNeighborhood] = useState(
        profile?.address_neighborhood ?? "",
    );
    const [city, setCity] = useState(profile?.address_city ?? "");
    const [state, setState] = useState(profile?.address_state ?? "");
    const [cepLoading, setCepLoading] = useState(false);
    const [cepError, setCepError] = useState<string | null>(null);

    const { get: checkSlug } = useHttp();

    useEffect(() => {
        const digits = onlyDigits(cep);

        if (digits.length !== 8) {
            setCepError(null);
            return;
        }

        const controller = new AbortController();

        const timer = setTimeout(() => {
            setCepLoading(true);
            setCepError(null);

            void fetch(`https://viacep.com.br/ws/${digits}/json/`, {
                signal: controller.signal,
            })
                .then((response) => response.json() as Promise<ViaCepResponse>)
                .then((data) => {
                    if (data.erro) {
                        setCepError("CEP não encontrado");
                        return;
                    }

                    if (data.logradouro) {
                        setStreet(data.logradouro);
                    }
                    if (data.bairro) {
                        setNeighborhood(data.bairro);
                    }
                    if (data.localidade) {
                        setCity(data.localidade);
                    }
                    if (data.uf) {
                        setState(data.uf);
                    }
                })
                .catch((error: unknown) => {
                    if (error instanceof Error && error.name === "AbortError") {
                        return;
                    }
                    setCepError("Não foi possível buscar o CEP");
                })
                .finally(() => setCepLoading(false));
        }, 400);

        return () => {
            controller.abort();
            clearTimeout(timer);
        };
    }, [cep]);

    useEffect(() => {
        if (!slug || slug.length < 3) {
            setSlugAvailability(null);
            return;
        }

        const timer = setTimeout(() => {
            void checkSlug(slugAvailable.url({ query: { slug } }), {
                onSuccess: (data: unknown) => {
                    setSlugAvailability(
                        data as { available: boolean; suggestion: string },
                    );
                },
            });
        }, 400);

        return () => clearTimeout(timer);
    }, [slug, checkSlug]);

    const progress = ((steps.indexOf("profile") + 1) / steps.length) * 100;

    return (
        <AuthLayout
            title="Criar perfil"
            description="Preencha as informações da sua barbearia"
        >
            <Head title="Criar perfil" />

            <div className="mb-6">
                <Progress value={progress} className="h-2" />
                <p className="mt-1 text-xs text-muted-foreground">
                    Passo 1 de {steps.length}
                </p>
            </div>

            <Form
                {...update.form()}
                encType="multipart/form-data"
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Seu nome completo</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={barber.name ?? ""}
                                    required
                                    autoFocus
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phone">Telefone</Label>
                                <PhoneInput
                                    id="phone"
                                    name="phone"
                                    defaultCountry="BR"
                                    value={barber.phone ?? ""}
                                    aria-invalid={
                                        errors.phone ? "true" : undefined
                                    }
                                    aria-describedby={
                                        errors.phone ? "phone-error" : undefined
                                    }
                                />
                                <InputError
                                    id="phone-error"
                                    message={errors.phone}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="business_name">
                                    Nome da barbearia
                                </Label>
                                <Input
                                    id="business_name"
                                    name="business_name"
                                    defaultValue={profile?.business_name ?? ""}
                                    required
                                    onChange={(e) =>
                                        setSlug(toSlug(e.target.value))
                                    }
                                />
                                <InputError message={errors.business_name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="slug">URL pública</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="slug"
                                        name="slug"
                                        value={slug}
                                        onChange={(e) =>
                                            setSlug(e.target.value)
                                        }
                                        required
                                    />
                                    {slugAvailability && (
                                        <span
                                            className={
                                                slugAvailability.available
                                                    ? "text-sm text-green-600"
                                                    : "text-sm text-destructive"
                                            }
                                        >
                                            {slugAvailability.available
                                                ? "✓"
                                                : "✗"}
                                        </span>
                                    )}
                                </div>
                                {slugAvailability &&
                                    !slugAvailability.available && (
                                        <p className="text-xs text-muted-foreground">
                                            Sugestão:{" "}
                                            {slugAvailability.suggestion}
                                        </p>
                                    )}
                                <InputError message={errors.slug} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="address_cep">CEP</Label>
                                <div className="relative">
                                    <Input
                                        id="address_cep"
                                        name="address_cep"
                                        value={cep}
                                        onChange={(e) =>
                                            setCep(formatCep(e.target.value))
                                        }
                                        placeholder="00000-000"
                                        inputMode="numeric"
                                    />
                                    {cepLoading && (
                                        <Spinner className="absolute top-1/2 right-3 -translate-y-1/2" />
                                    )}
                                </div>
                                {cepError && (
                                    <p className="text-xs text-destructive">
                                        {cepError}
                                    </p>
                                )}
                                <InputError message={errors.address_cep} />
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="address_street">Rua</Label>
                                    <Input
                                        id="address_street"
                                        name="address_street"
                                        value={street}
                                        onChange={(e) =>
                                            setStreet(e.target.value)
                                        }
                                        required
                                    />
                                    <InputError
                                        message={errors.address_street}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="address_number">
                                        Número
                                    </Label>
                                    <Input
                                        id="address_number"
                                        name="address_number"
                                        defaultValue={
                                            profile?.address_number ?? ""
                                        }
                                        required
                                    />
                                    <InputError
                                        message={errors.address_number}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="address_neighborhood">
                                    Bairro
                                </Label>
                                <Input
                                    id="address_neighborhood"
                                    name="address_neighborhood"
                                    value={neighborhood}
                                    onChange={(e) =>
                                        setNeighborhood(e.target.value)
                                    }
                                    required
                                />
                                <InputError
                                    message={errors.address_neighborhood}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="address_city">Cidade</Label>
                                    <Input
                                        id="address_city"
                                        name="address_city"
                                        value={city}
                                        onChange={(e) =>
                                            setCity(e.target.value)
                                        }
                                        required
                                    />
                                    <InputError message={errors.address_city} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="address_state">
                                        Estado
                                    </Label>
                                    <Select
                                        name="address_state"
                                        value={state}
                                        onValueChange={setState}
                                    >
                                        <SelectTrigger id="address_state">
                                            <SelectValue placeholder="UF" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {BRAZIL_STATES.map((uf) => (
                                                <SelectItem key={uf} value={uf}>
                                                    {uf}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        message={errors.address_state}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="profile_photo">
                                    Foto de perfil
                                </Label>
                                <Input
                                    id="profile_photo"
                                    name="profile_photo"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                />
                                <InputError message={errors.profile_photo} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="cover_photo">
                                    Foto de capa
                                </Label>
                                <Input
                                    id="cover_photo"
                                    name="cover_photo"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                />
                                <InputError message={errors.cover_photo} />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={processing}
                        >
                            {processing && <Spinner />}
                            Salvar e continuar
                        </Button>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
