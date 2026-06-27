import { CheckIcon, ChevronDownIcon, SearchIcon } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"

export type ComboboxOption = {
    value: string
    label: string
}

type ComboboxProps = {
    options: ComboboxOption[]
    value?: string
    onValueChange?: (value: string) => void
    placeholder?: string
    searchPlaceholder?: string
    searchable?: boolean
    emptyMessage?: string
    name?: string
    required?: boolean
    disabled?: boolean
    size?: "sm" | "default"
    className?: string
}

function Combobox({
    options,
    value,
    onValueChange,
    placeholder = "Selecione…",
    searchPlaceholder = "Buscar…",
    searchable = true,
    emptyMessage = "Nenhum resultado.",
    name,
    required,
    disabled,
    size = "default",
    className,
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState("")
    const containerRef = React.useRef<HTMLDivElement>(null)
    const searchRef = React.useRef<HTMLInputElement>(null)

    const selected = options.find((o) => o.value === value)

    const filtered = search
        ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
        : options

    React.useEffect(() => {
        if (!open) return

        function handleMouseDown(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false)
                setSearch("")
            }
        }

        document.addEventListener("mousedown", handleMouseDown)
        return () => document.removeEventListener("mousedown", handleMouseDown)
    }, [open])

    React.useEffect(() => {
        if (open && searchable) {
            setTimeout(() => searchRef.current?.focus(), 0)
        }
    }, [open, searchable])

    function toggle() {
        if (disabled) return
        setOpen((prev) => {
            if (prev) setSearch("")
            return !prev
        })
    }

    function handleSelect(optionValue: string) {
        onValueChange?.(optionValue === value ? "" : optionValue)
        setOpen(false)
        setSearch("")
    }

    return (
        <div ref={containerRef} className="relative w-full">
            {name && (
                <input type="hidden" name={name} value={value ?? ""} required={required} />
            )}

            <button
                type="button"
                data-slot="combobox-trigger"
                data-state={open ? "open" : "closed"}
                disabled={disabled}
                onClick={toggle}
                className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-[8px] border border-input bg-background text-left whitespace-nowrap outline-none transition-[color,border-color,outline]",
                    "focus-visible:border-(--amber-500) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--amber-500)",
                    "data-[state=open]:border-(--amber-500) data-[state=open]:outline-2 data-[state=open]:outline-offset-2 data-[state=open]:outline-(--amber-500)",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    size === "default" && "px-[14px] py-3 text-[15px]",
                    size === "sm" && "h-8 px-2 text-xs font-semibold shadow-xs",
                    className,
                )}
            >
                <span className={cn(!selected && "text-muted-foreground")}>
                    {selected ? selected.label : placeholder}
                </span>
                <ChevronDownIcon
                    className={cn(
                        "shrink-0 text-muted-foreground transition-transform",
                        size === "default" && "size-4",
                        size === "sm" && "size-3",
                        open && "rotate-180",
                    )}
                />
            </button>

            {open && (
                <div
                    data-slot="combobox-content"
                    className="absolute left-0 top-full z-50 mt-1 w-full min-w-full overflow-hidden rounded-[8px] border border-border bg-popover shadow-md"
                >
                    {searchable && (
                        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                            <SearchIcon className="size-3.5 shrink-0 text-muted-foreground" />
                            <input
                                ref={searchRef}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={searchPlaceholder}
                                className="flex-1 bg-transparent text-sm text-popover-foreground outline-none placeholder:text-muted-foreground"
                            />
                        </div>
                    )}

                    <div role="listbox" className="max-h-60 overflow-y-auto p-1">
                        {filtered.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                {emptyMessage}
                            </div>
                        ) : (
                            filtered.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    role="option"
                                    aria-selected={value === option.value}
                                    onMouseDown={(e) => {
                                        e.preventDefault()
                                        handleSelect(option.value)
                                    }}
                                    className={cn(
                                        "flex w-full cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm text-popover-foreground outline-none",
                                        "hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent",
                                        value === option.value && "bg-accent text-accent-foreground",
                                    )}
                                >
                                    <span>{option.label}</span>
                                    {value === option.value && (
                                        <CheckIcon className="size-4 text-(--amber-500)" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export { Combobox }
