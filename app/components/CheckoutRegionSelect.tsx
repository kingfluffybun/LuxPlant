"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

type Province = {
    name: string;
    code: string;
};

type CheckoutRegionSelectProps = {
    id?: string;
    value?: string;
    onValueChange?: (value: string) => void;
};

const metroManila: Province = { name: "Metro Manila", code: "1300000000" };

function isProvinceList(value: unknown): value is Province[] {
    return Array.isArray(value) && value.every(
        (region) =>
            typeof region === "object" &&
            region !== null &&
            "name" in region &&
            typeof region.name === "string" &&
            "code" in region &&
            typeof region.code === "string",
    );
}

export default function CheckoutRegionSelect({ id = "region", value, onValueChange }: CheckoutRegionSelectProps) {
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [internalSelectedRegion, setInternalSelectedRegion] = useState(metroManila.code);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const selectedRegion = value === undefined
        ? internalSelectedRegion
        : value === metroManila.name
            ? metroManila.code
            : provinces.find((province) => province.name === value)?.code ?? value;

    useEffect(() => {
        const controller = new AbortController();

        async function loadProvinces() {
            try {
                const response = await fetch("https://psgc.cloud/api/provinces", {
                    signal: controller.signal,
                });
                if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status}`);
                }

                const data: unknown = await response.json();
                if (!isProvinceList(data)) {
                    throw new Error("The provinces response has an unexpected format.");
                }

                const provinceOptions = data
                    .filter((province) => province.name !== metroManila.name)
                    .concat(metroManila)
                    .sort((first, second) => first.name.localeCompare(second.name));
                setProvinces(provinceOptions);
            } catch (loadError) {
                if (controller.signal.aborted) {
                    return;
                }
                console.error("Failed to load checkout provinces.", loadError);
                setError("Provinces could not be loaded. Please try again later.");
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }

        void loadProvinces();
        return () => controller.abort();
    }, []);

    return (
        <div className="checkout-form-group" id={id === "region" ? "select" : undefined}>
            <label htmlFor={id}>Region</label>
            <select
                name="region"
                id={id}
                value={selectedRegion}
                onChange={(event) => {
                    const selected = provinces.find((province) => province.code === event.currentTarget.value);
                    if (value === undefined) {
                        setInternalSelectedRegion(event.currentTarget.value);
                    }
                    onValueChange?.(selected?.name ?? event.currentTarget.value);
                }}
                disabled={isLoading || error !== null}
                required
            >
                {isLoading ? (
                    <option value={metroManila.code}>Metro Manila</option>
                ) : (
                    <>
                        {value && !provinces.some((province) => province.name === value) && (
                            <option value={selectedRegion}>{value}</option>
                        )}
                        {provinces.map((province) => (
                            <option key={province.code} value={province.code}>{province.name}</option>
                        ))}
                    </>
                )}
            </select>
            <ChevronDown className="select-chevron" size={20} aria-hidden="true" />
            {error && <p className="checkout-region-error" role="alert">{error}</p>}
        </div>
    );
}
