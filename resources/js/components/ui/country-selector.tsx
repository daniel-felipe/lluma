import type { CountryCode } from "libphonenumber-js"
import { ChevronDownIcon, SearchIcon } from "lucide-react"
import * as React from "react"

import { COUNTRIES } from "@/lib/phone-countries"
import { cn } from "@/lib/utils"

type CountrySelectorProps = {
    value: CountryCode
    onValueChange: (country: CountryCode) => void
    disabled?: boolean
    className?: string
    "aria-labelledby"?: string
}

function CountrySelector({
    value,
    onValueChange,
    disabled,
    className,
    "aria-labelledby": ariaLabelledBy,
}: CountrySelectorProps) {
    const [open, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState("")
    const containerRef = React.useRef<HTMLDivElement>(null)
    const searchRef = React.useRef<HTMLInputElement>(null)
    const listRef = React.useRef<HTMLDivElement>(null)
    const [focusedIndex, setFocusedIndex] = React.useState<number>(-1)

    const selected = COUNTRIES.find((c) => c.iso2 === value)

    const filtered = search
        ? COUNTRIES.filter(
              (c) =>
                  c.name.toLowerCase().includes(search.toLowerCase()) ||
                  c.dialCode.includes(search),
          )
        : COUNTRIES

    React.useEffect(() => {
        if (!open) return

        function handleMouseDown(e: MouseEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setOpen(false)
                setSearch("")
                setFocusedIndex(-1)
            }
        }

        document.addEventListener("mousedown", handleMouseDown)
        return () => document.removeEventListener("mousedown", handleMouseDown)
    }, [open])

    React.useEffect(() => {
        if (open) {
            setTimeout(() => searchRef.current?.focus(), 0)
            setFocusedIndex(-1)
        }
    }, [open])

    function toggle() {
        if (disabled) return
        setOpen((prev) => {
            if (prev) {
                setSearch("")
                setFocusedIndex(-1)
            }
            return !prev
        })
    }

    function handleSelect(iso2: CountryCode) {
        onValueChange(iso2)
        setOpen(false)
        setSearch("")
        setFocusedIndex(-1)
    }

    function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "ArrowDown") {
            e.preventDefault()
            setFocusedIndex((prev) =>
                prev < filtered.length - 1 ? prev + 1 : 0,
            )
        } else if (e.key === "ArrowUp") {
            e.preventDefault()
            setFocusedIndex((prev) =>
                prev > 0 ? prev - 1 : filtered.length - 1,
            )
        } else if (e.key === "Enter") {
            e.preventDefault()
            if (focusedIndex >= 0 && filtered[focusedIndex]) {
                handleSelect(filtered[focusedIndex].iso2)
            }
        } else if (e.key === "Escape") {
            setOpen(false)
            setSearch("")
            setFocusedIndex(-1)
        }
    }

    React.useEffect(() => {
        if (focusedIndex >= 0 && listRef.current) {
            const item = listRef.current.children[focusedIndex] as HTMLElement
            item?.scrollIntoView?.({ block: "nearest" })
        }
    }, [focusedIndex])

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                data-slot="country-selector-trigger"
                data-state={open ? "open" : "closed"}
                disabled={disabled}
                onClick={toggle}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-labelledby={ariaLabelledBy}
                className={cn(
                    "flex h-full w-[90px] items-center justify-between gap-1.5 rounded-[8px] border border-input bg-background px-3 py-3 text-[15px] whitespace-nowrap outline-none transition-[color,border-color,outline]",
                    "focus-visible:border-(--amber-500) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--amber-500)",
                    "data-[state=open]:border-(--amber-500) data-[state=open]:outline-2 data-[state=open]:outline-offset-2 data-[state=open]:outline-(--amber-500)",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    className,
                )}
            >
                <span className="flex items-center gap-1 text-sm">
                    <span aria-hidden="true">{selected?.flag}</span>
                    <span className="text-xs font-medium text-muted-foreground">
                        {selected?.dialCode}
                    </span>
                </span>
                <ChevronDownIcon
                    className={cn(
                        "size-3.5 shrink-0 text-muted-foreground transition-transform",
                        open && "rotate-180",
                    )}
                />
            </button>

            {open && (
                <div
                    data-slot="country-selector-content"
                    className="absolute left-0 top-full z-50 mt-1 min-w-[260px] overflow-hidden rounded-[8px] border border-border bg-popover shadow-md"
                >
                    <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                        <SearchIcon className="size-3.5 shrink-0 text-muted-foreground" />
                        <input
                            ref={searchRef}
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value)
                                setFocusedIndex(-1)
                            }}
                            onKeyDown={handleSearchKeyDown}
                            placeholder="Buscar país…"
                            aria-label="Buscar país"
                            className="flex-1 bg-transparent text-sm text-popover-foreground outline-none placeholder:text-muted-foreground"
                        />
                    </div>

                    <div
                        ref={listRef}
                        role="listbox"
                        aria-label="Países"
                        className="max-h-60 overflow-y-auto p-1"
                    >
                        {filtered.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                Nenhum país encontrado.
                            </div>
                        ) : (
                            filtered.map((country, index) => (
                                <button
                                    key={country.iso2}
                                    type="button"
                                    role="option"
                                    aria-selected={value === country.iso2}
                                    data-focused={
                                        focusedIndex === index ? "" : undefined
                                    }
                                    onMouseDown={(e) => {
                                        e.preventDefault()
                                        handleSelect(country.iso2)
                                    }}
                                    className={cn(
                                        "flex w-full cursor-pointer items-center gap-2.5 rounded-sm px-2 py-1.5 text-sm text-popover-foreground outline-none",
                                        "hover:bg-accent hover:text-accent-foreground",
                                        (value === country.iso2 ||
                                            focusedIndex === index) &&
                                            "bg-accent text-accent-foreground",
                                    )}
                                >
                                    <span
                                        aria-hidden="true"
                                        className="text-base"
                                    >
                                        {country.flag}
                                    </span>
                                    <span className="flex-1 text-left">
                                        {country.name}
                                    </span>
                                    <span className="text-xs text-(--bone-400)">
                                        {country.dialCode}
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export { CountrySelector }
export type { CountrySelectorProps }
