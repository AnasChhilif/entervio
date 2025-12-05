import * as React from "react";
import { MapPin, Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";
import { Input } from "~/components/ui/input";
import { jobsService, type City } from "~/services/jobs";

export function CityAutocomplete({
    onSelect,
    selectedCityCode,
}: {
    onSelect: (city: City | null) => void;
    selectedCityCode?: string;
}) {
    const [value, setValue] = React.useState("");
    const [cities, setCities] = React.useState<City[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [showResults, setShowResults] = React.useState(false);
    const wrapperRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (value.length >= 2) {
                searchCities(value);
            } else {
                setCities([]);
                setShowResults(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [value]);

    const searchCities = async (query: string) => {
        setLoading(true);
        try {
            const results = await jobsService.searchLocations(query);
            setCities(results);
            setShowResults(true);
        } catch (error) {
            console.error("Failed to search cities", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (city: City) => {
        setValue(city.nom);
        onSelect(city);
        setShowResults(false);
    };

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                    placeholder="Lieu (ex: Paris)"
                    className="pl-12 h-14 border-0 shadow-none focus-visible:ring-0 text-base bg-transparent rounded-xl"
                    value={value}
                    onChange={(e) => {
                        setValue(e.target.value);
                        if (e.target.value === "") onSelect(null);
                    }}
                    onFocus={() => {
                        if (cities.length > 0) setShowResults(true);
                    }}
                />
                {loading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    </div>
                )}
            </div>

            {showResults && cities.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-popover text-popover-foreground rounded-xl border border-border shadow-lg z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
                    <ul className="max-h-[300px] overflow-y-auto py-2">
                        {cities.map((city) => (
                            <li
                                key={city.code}
                                className="px-4 py-2.5 hover:bg-accent hover:text-accent-foreground cursor-pointer flex flex-col gap-0.5 transition-colors"
                                onClick={() => handleSelect(city)}
                            >
                                <span className="font-medium text-sm">{city.nom}</span>
                                <span className="text-xs text-muted-foreground">
                                    {city.codesPostaux[0]} - {city.departement?.nom || city.region?.nom}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
