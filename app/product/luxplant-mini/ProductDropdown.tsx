"use client";

import type { ReactNode } from "react";
import { ChevronUp } from "lucide-react";
import "../../../public/css/product-dropdown.css";

type ProductDropdownProps = {
    children: ReactNode;
    id: string;
    isOpen: boolean;
    onToggle: () => void;
    title: string;
};

export default function ProductDropdown({
    children,
    id,
    isOpen,
    onToggle,
    title,
}: ProductDropdownProps) {
    const contentId = `${id}-content`;

    return (
        <div className="product-dropdown">
            <button type="button" className="product-dropdown-header" aria-expanded={isOpen} aria-controls={contentId} onClick={onToggle} >
                <b>{title}</b>
                <ChevronUp aria-hidden="true" />
            </button>
            <div id={contentId} className={`product-dropdown-content${isOpen ? " is-open" : ""}`} aria-hidden={!isOpen} inert={!isOpen} >
                <div className="product-dropdown-content-inner">{children}</div>
            </div>
        </div>
    );
}
