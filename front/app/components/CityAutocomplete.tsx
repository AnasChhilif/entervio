import * as React from "react";
import { MapPin, Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";
import { Input } from "./ui/input";
import { useState, useEffect, useRef } from "react";

export interface City {
    nom: string;
    code: string; // INSEE code
    codesPostaux: string[];
    population: number;
}

interface CityAutocompleteProps {
    value: string;
    onSelect: (city: City | null) => void;
    placeholder?: string;
    className?: string;
}

export function CityAutocomplete({ value, onSelect, placeholder = "Localisation...", className }: CityAutocompleteProps) {
    const [query, setQuery] = useState(value);
    const [cities, setCities] = useState<City[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Update query when value prop changes (e.g. reset)
    useEffect(() => {
        setQuery(value);
    }, [value]);

    // Close list when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Debounce search
    useEffect(() => {
        if (query.length < 2) {
            setCities([]);
            return;
        }

        // Don't search if the query matches the current value (avoid searching on selection)
        // Actually, we might want to search if user edits. 
        // Let's just search.

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const response = await fetch(
                    `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(query)}&fields=nom,code,codesPostaux,population&boost=population&limit=5`
                );
                if (response.ok) {
                    const data = await response.json();
                    setCities(data);
                    setOpen(true);
                }
            } catch (error) {
                console.error("Failed to fetch cities:", error);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = (city: City) => {
        setQuery(city.nom);
        onSelect(city);
        setOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setQuery(newValue);
        if (newValue === "") {
            onSelect(null);
        }
        setOpen(true);
    };

    return (
        <div ref={wrapperRef} className="relative w-full">
            <Input
                value={query}
                onChange={handleInputChange}
                onFocus={() => {
                    if (cities.length > 0) setOpen(true);
                }}
                placeholder={placeholder}
                className={cn("w-full", className)}
            />

            {open && (cities.length > 0 || loading) && (
                <div className="absolute top-full left-0 w-full mt-1 bg-popover border border-border rounded-md shadow-md z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100">
                    {loading && (
                        <div className="p-2 text-sm text-muted-foreground flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" /> Chargement...
                        </div>
                    )}
                    {!loading && (
                        <ul className="max-h-[200px] overflow-auto py-1">
                            {cities.map((city) => (
                                <li
                                    key={city.code}
                                    className="px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground flex flex-col"
                                    onClick={() => handleSelect(city)}
                                >
                                    <span className="font-medium">{city.nom}</span>
                                    <span className="text-xs text-muted-foreground">{city.codesPostaux[0]} ({city.code})</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
