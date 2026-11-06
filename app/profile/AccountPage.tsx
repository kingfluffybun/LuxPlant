"use client";

import "../../public/css/navigation.css";
import "../../public/css/footer.css";
import "../../public/css/account.css";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ArrowRight,
    Check,
    ChevronRight,
    CreditCard,
    LogOut,
    PackageCheck,
    ShieldCheck,
    X,
} from "lucide-react";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import CheckoutRegionSelect from "../components/CheckoutRegionSelect";
import { createClient } from "@/lib/supabase/client";

type AccountTab = "profile" | "orders";
type EditableSection = "name" | "address" | "email" | "password" | null;
type Address = {
    street: string;
    unit: string;
    barangay: string;
    city: string;
    postalCode: string;
    region: string;
};
type OrderStatus = "awaiting" | "submitted" | "rejected" | "processing" | "shipped" | "delivered" | "cancelled" | "expired";
type Order = {
    number: string;
    placedAt: string;
    status: OrderStatus;
    quantity: number;
    paymentMethod: string;
    proofUploaded: boolean;
    deliveredAt?: string;
    rejectionReason?: string;
    codConfirmed?: boolean;
};

const emptyAddress: Address = {
    street: "",
    unit: "",
    barangay: "",
    city: "",
    postalCode: "",
    region: "Metro Manila",
};

const sampleOrders: Order[] = [
    {
        number: "LP-000123",
        placedAt: "2026-11-05T14:14:00+08:00",
        status: "awaiting",
        quantity: 1,
        paymentMethod: "GCash",
        proofUploaded: false,
    },
    {
        number: "LP-000122",
        placedAt: "2026-11-04T10:35:00+08:00",
        status: "submitted",
        quantity: 1,
        paymentMethod: "Bank transfer",
        proofUploaded: true,
    },
    {
        number: "LP-000121",
        placedAt: "2026-11-03T10:35:00+08:00",
        status: "processing",
        quantity: 2,
        paymentMethod: "Bank transfer",
        proofUploaded: true,
    },
    {
        number: "LP-000111",
        placedAt: "2026-10-12T09:10:00+08:00",
        status: "delivered",
        quantity: 1,
        paymentMethod: "Cash on delivery",
        proofUploaded: false,
        deliveredAt: "2026-10-20T12:00:00+08:00",
    },
];

const unitPrice = 3500;
const deliveryFee = 100;
const money = (amount: number) =>
    new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 0,
    }).format(amount);

function formatDate(value: string, withTime = false) {
    return new Intl.DateTimeFormat("en-PH", {
        dateStyle: "medium",
        ...(withTime ? { timeStyle: "short" as const } : {}),
        timeZone: "Asia/Manila",
    }).format(new Date(value));
}

function displayName(user: User) {
    const firstName = typeof user.user_metadata?.first_name === "string" ? user.user_metadata.first_name : "";
    const lastName = typeof user.user_metadata?.last_name === "string" ? user.user_metadata.last_name : "";
    return { firstName, lastName };
}

function isGoogleAccount(user: User) {
    return user.app_metadata?.provider === "google"
        || user.identities?.some((identity) => identity.provider === "google") === true;
}

function orderStep(status: OrderStatus) {
    if (status === "awaiting" || status === "submitted" || status === "rejected") return 1;
    if (status === "processing") return 2;
    if (status === "shipped") return 3;
    if (status === "delivered") return 4;
    return 0;
}

function getOrderStep(order: Order) {
    if (order.paymentMethod === "Cash on delivery" && order.codConfirmed && order.status === "awaiting") {
        return 2;
    }
    return orderStep(order.status);
}

function orderStatusLabel(status: OrderStatus) {
    return {
        awaiting: "Awaiting payment",
        submitted: "Payment submitted",
        rejected: "Payment rejected",
        processing: "Processing",
        shipped: "Shipped",
        delivered: "Delivered",
        cancelled: "Cancelled",
        expired: "Expired",
    }[status];
}

function orderTotal(quantity: number) {
    const subtotal = quantity * unitPrice;
    const discount = quantity >= 2 ? Math.round(subtotal * 0.1) : 0;
    const shipping = quantity >= 2 ? 0 : deliveryFee;
    return { subtotal, discount, shipping, total: subtotal - discount + shipping };
}

function countdown(deadline: number, now: number | null) {
    if (now === null) return "Calculating…";
    const remaining = Math.max(0, deadline - now);
    const hours = Math.floor(remaining / 3_600_000);
    const minutes = Math.floor((remaining % 3_600_000) / 60_000);
    const seconds = Math.floor((remaining % 60_000) / 1_000);
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function validAddress(value: unknown): value is Address {
    if (typeof value !== "object" || value === null) return false;
    return ["street", "unit", "barangay", "city", "postalCode", "region"].every(
        (key) => key in value && typeof value[key as keyof typeof value] === "string",
    );
}

export default function AccountPage({ activeTab }: { activeTab: AccountTab }) {
    const supabase = useMemo(() => createClient(), []);
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState("");
    const [editing, setEditing] = useState<EditableSection>(null);
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [nameDraft, setNameDraft] = useState({ firstName: "", lastName: "" });
    const [address, setAddress] = useState<Address>(emptyAddress);
    const [addressDraft, setAddressDraft] = useState<Address>(emptyAddress);
    const [emailDraft, setEmailDraft] = useState("");
    const [passwordDraft, setPasswordDraft] = useState({ current: "", next: "", confirm: "" });
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [now, setNow] = useState<number | null>(null);

    useEffect(() => {
        let isCurrent = true;

        async function loadUser() {
            const { data, error } = await supabase.auth.getUser();
            if (!isCurrent) return;
            if (error) {
                if (error.name === "AuthSessionMissingError" || error.message === "Auth session missing!") {
                    const requestedPage = activeTab === "orders" ? "/order" : "/profile";
                    router.replace(`/login?redirect=${encodeURIComponent(requestedPage)}`);
                    return;
                }
                setAuthError(`Could not load your account: ${error.message}`);
                setLoading(false);
                return;
            }
            if (!data.user) {
                const requestedPage = activeTab === "orders" ? "/order" : "/profile";
                router.replace(`/login?redirect=${encodeURIComponent(requestedPage)}`);
                return;
            }

            const currentUser = data.user;
            const names = displayName(currentUser);
            setUser(currentUser);
            setNameDraft(names);
            setEmailDraft(currentUser.email ?? "");
            try {
                const savedAddress = localStorage.getItem(`luxplant:address:${currentUser.id}`);
                if (savedAddress) {
                    const parsed: unknown = JSON.parse(savedAddress);
                    if (validAddress(parsed)) {
                        setAddress(parsed);
                        setAddressDraft(parsed);
                    }
                }
            } catch (error) {
                console.error("Could not load the saved delivery address.", error);
                setAuthError("Your account loaded, but the saved address on this device could not be read.");
            }
            setLoading(false);
        }

        void loadUser();
        return () => {
            isCurrent = false;
        };
    }, [activeTab, router, supabase]);

    useEffect(() => {
        if (activeTab !== "orders") return;
        const timer = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(timer);
    }, [activeTab]);

    const googleAccount = user ? isGoogleAccount(user) : false;
    const profile = user ? displayName(user) : { firstName: "", lastName: "" };
    const email = user?.email ?? "";
    const deadline = new Date(sampleOrders[0].placedAt).getTime() + 24 * 60 * 60 * 1000;
    const activeOrders = sampleOrders.filter((order) => !["delivered", "cancelled", "expired"].includes(order.status));
    const pastOrders = sampleOrders.filter((order) => ["delivered", "cancelled", "expired"].includes(order.status));

    function beginEdit(section: Exclude<EditableSection, null>) {
        setNotice("");
        setFieldErrors({});
        setNameDraft(profile);
        setAddressDraft(address);
        setEmailDraft(email);
        setPasswordDraft({ current: "", next: "", confirm: "" });
        setEditing(section);
    }

    function cancelEdit() {
        setEditing(null);
        setFieldErrors({});
    }

    async function saveSection(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!user || !editing) return;
        setFieldErrors({});

        if (editing === "name" && (!nameDraft.firstName.trim() || !nameDraft.lastName.trim())) {
            setFieldErrors({ firstName: !nameDraft.firstName.trim() ? "Enter your first name." : "", lastName: !nameDraft.lastName.trim() ? "Enter your last name." : "" });
            return;
        }
        if (editing === "address") {
            const errors: Record<string, string> = {};
            if (!addressDraft.street.trim()) errors.street = "Enter your street address.";
            if (!addressDraft.barangay.trim()) errors.barangay = "Enter your barangay.";
            if (!addressDraft.city.trim()) errors.city = "Enter your city or municipality.";
            if (!addressDraft.postalCode.trim()) errors.postalCode = "Enter your postal code.";
            if (!addressDraft.region.trim()) errors.region = "Choose a region.";
            if (Object.keys(errors).length) {
                setFieldErrors(errors);
                return;
            }
        }
        if (editing === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailDraft.trim())) {
            setFieldErrors({ email: "Enter a valid email address." });
            return;
        }
        if (editing === "password") {
            const errors: Record<string, string> = {};
            if (!passwordDraft.current) errors.current = "Enter your current password.";
            if (passwordDraft.next.length < 8) errors.next = "Use at least 8 characters.";
            if (passwordDraft.next !== passwordDraft.confirm) errors.confirm = "Passwords do not match.";
            if (Object.keys(errors).length) {
                setFieldErrors(errors);
                return;
            }
        }

        setSaving(true);
        try {
            if (editing === "name") {
                const { data, error } = await supabase.auth.updateUser({
                    data: {
                        first_name: nameDraft.firstName.trim(),
                        last_name: nameDraft.lastName.trim(),
                    },
                });
                if (error) throw error;
                if (data.user) setUser(data.user);
                setNotice("Your name has been updated.");
            } else if (editing === "address") {
                localStorage.setItem(`luxplant:address:${user.id}`, JSON.stringify(addressDraft));
                setAddress(addressDraft);
                setNotice("Address saved on this device.");
            } else if (editing === "email") {
                const { error } = await supabase.auth.updateUser({ email: emailDraft.trim() });
                if (error) throw error;
                setNotice("Check your inbox to confirm the new email address. Your current email stays active until verification.");
            } else if (editing === "password") {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password: passwordDraft.current,
                });
                if (signInError) {
                    setFieldErrors({ current: "That current password could not be verified." });
                    return;
                }
                const { error } = await supabase.auth.updateUser({ password: passwordDraft.next });
                if (error) throw error;
                setNotice("Your password has been updated.");
            }
            setEditing(null);
        } catch (error) {
            const message = error instanceof Error ? error.message : "The change could not be saved.";
            setFieldErrors({ form: message });
        } finally {
            setSaving(false);
        }
    }

    async function signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) {
            setAuthError(`Could not sign out: ${error.message}`);
            return;
        }
        router.replace("/login");
    }

    if (loading) {
        return (
            <div className="account-page">
                <Navigation />
                <main className="account-main">
                    <div className="account-loading" role="status">Loading your account…</div>
                </main>
                <Footer />
            </div>
        );
    }

    if (authError && !user) {
        return (
            <div className="account-page">
                <Navigation />
                <main className="account-main">
                    <div className="account-alert" role="alert">{authError}</div>
                    <button className="account-button account-button-secondary" onClick={() => window.location.reload()}>Try again</button>
                </main>
                <Footer />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="account-page">
            <Navigation />
            <main className="account-main">
                <header className="account-heading">
                    <h1>{activeTab === "profile" ? "Account Preview" : "My orders"}</h1>
                </header>

                {authError && <p className="account-alert" role="alert">{authError}</p>}
                {notice && <p className="account-notice" role="status"><Check size={18} aria-hidden="true" />{notice}</p>}

                <div className="profile-layout">
                    <aside className="profile-sidebar" aria-label="Account navigation">
                        <Link className={activeTab === "profile" ? "profile-sidebar-active" : ""} href="/profile" aria-current={activeTab === "profile" ? "page" : undefined}>
                            <span>Personal information</span>
                            <ChevronRight size={18} aria-hidden="true" />
                        </Link>
                        <Link className={activeTab === "orders" ? "profile-sidebar-active" : ""} href="/order" aria-current={activeTab === "orders" ? "page" : undefined}>
                            <span>My orders</span>
                            <ChevronRight size={18} aria-hidden="true" />
                        </Link>
                        <button type="button" className="profile-sidebar-logout" onClick={signOut}>
                            <LogOut size={18} aria-hidden="true" />
                            <span>Log out</span>
                        </button>
                    </aside>

                    <section className="profile-content" aria-label={activeTab === "profile" ? "Profile settings" : "My orders"}>
                        {activeTab === "profile" ? (
                            <>
                            <section className="profile-section">
                                <h2>Personal information</h2>
                                {editing === "name" ? (
                                    <form className="account-edit-form" onSubmit={saveSection}>
                                        <div className="account-field-row">
                                            <AccountField label="First name" id="first-name" value={nameDraft.firstName} error={fieldErrors.firstName} onChange={(value) => setNameDraft((draft) => ({ ...draft, firstName: value }))} />
                                            <AccountField label="Last name" id="last-name" value={nameDraft.lastName} error={fieldErrors.lastName} onChange={(value) => setNameDraft((draft) => ({ ...draft, lastName: value }))} />
                                        </div>
                                        <FormActions saving={saving} onCancel={cancelEdit} />
                                        {fieldErrors.form && <p className="account-field-error" role="alert">{fieldErrors.form}</p>}
                                    </form>
                                ) : (
                                    <ReadOnlyRow label="Name" value={`${profile.firstName} ${profile.lastName}`.trim() || "Add your name"} onEdit={() => beginEdit("name")} />
                                )}
                            </section>

                            <section className="profile-section">
                                <h2>Delivery address</h2>
                                <p className="profile-section-note">Used to prefill checkout. This preview saves the address on this device only.</p>
                                {editing === "address" ? (
                                    <form className="account-edit-form" onSubmit={saveSection}>
                                        <AccountField label="Address" id="street-address" value={addressDraft.street} error={fieldErrors.street} onChange={(value) => setAddressDraft((draft) => ({ ...draft, street: value }))} />
                                        <AccountField label="Apartment or unit (optional)" id="address-unit" value={addressDraft.unit} onChange={(value) => setAddressDraft((draft) => ({ ...draft, unit: value }))} />
                                        <div className="account-field-row">
                                            <AccountField label="Barangay" id="address-barangay" value={addressDraft.barangay} error={fieldErrors.barangay} onChange={(value) => setAddressDraft((draft) => ({ ...draft, barangay: value }))} />
                                            <AccountField label="City or municipality" id="address-city" value={addressDraft.city} error={fieldErrors.city} onChange={(value) => setAddressDraft((draft) => ({ ...draft, city: value }))} />
                                        </div>
                                        <div className="account-field-row">
                                            <AccountField label="Postal code" id="postal-code" value={addressDraft.postalCode} error={fieldErrors.postalCode} onChange={(value) => setAddressDraft((draft) => ({ ...draft, postalCode: value }))} />
                                            <CheckoutRegionSelect id="profile-region" value={addressDraft.region} onValueChange={(value) => setAddressDraft((draft) => ({ ...draft, region: value }))} />
                                        </div>
                                        {fieldErrors.region && <p className="account-field-error" role="alert">{fieldErrors.region}</p>}
                                        <FormActions saving={saving} onCancel={cancelEdit} />
                                        {fieldErrors.form && <p className="account-field-error" role="alert">{fieldErrors.form}</p>}
                                    </form>
                                ) : (
                                    <ReadOnlyRow
                                        label="Saved address"
                                        value={address.street
                                            ? <>{address.street}{address.unit && <><br />{address.unit}</>}<br />{address.barangay}{address.city && `, ${address.city}`}<br />{address.region} {address.postalCode}</>
                                            : "No saved delivery address"}
                                        onEdit={() => beginEdit("address")}
                                    />
                                )}
                            </section>

                            <section className="profile-section">
                                <h2>Login details</h2>
                                {editing === "email" ? (
                                    <form className="account-edit-form" onSubmit={saveSection}>
                                        <AccountField label="New email address" id="account-email" type="email" value={emailDraft} error={fieldErrors.email} onChange={setEmailDraft} />
                                        <p className="account-helper">We’ll send a verification link. Your current email remains active until you confirm the change.</p>
                                        <FormActions saving={saving} onCancel={cancelEdit} />
                                        {fieldErrors.form && <p className="account-field-error" role="alert">{fieldErrors.form}</p>}
                                    </form>
                                ) : (
                                    <ReadOnlyRow label="Email" value={email} onEdit={googleAccount ? undefined : () => beginEdit("email")} />
                                )}
                                {editing === "password" ? (
                                    <form className="account-edit-form" onSubmit={saveSection}>
                                        <AccountField label="Current password" id="current-password" type="password" value={passwordDraft.current} error={fieldErrors.current} onChange={(value) => setPasswordDraft((draft) => ({ ...draft, current: value }))} />
                                        <div className="account-field-row">
                                            <AccountField label="New password" id="new-password" type="password" value={passwordDraft.next} error={fieldErrors.next} onChange={(value) => setPasswordDraft((draft) => ({ ...draft, next: value }))} />
                                            <AccountField label="Confirm new password" id="confirm-password" type="password" value={passwordDraft.confirm} error={fieldErrors.confirm} onChange={(value) => setPasswordDraft((draft) => ({ ...draft, confirm: value }))} />
                                        </div>
                                        <FormActions saving={saving} onCancel={cancelEdit} />
                                        {fieldErrors.form && <p className="account-field-error" role="alert">{fieldErrors.form}</p>}
                                    </form>
                                ) : (
                                    <ReadOnlyRow
                                        label="Password"
                                        value="••••••••••••"
                                        onEdit={googleAccount ? undefined : () => beginEdit("password")}
                                        helper={googleAccount ? "Signed in with Google? Your password is managed by your Google account." : undefined}
                                    />
                                )}
                                {googleAccount && <p className="account-helper">Your email is managed by your Google account.</p>}
                            </section>

                            <section className="profile-section profile-manage-section">
                                <h2>Manage account</h2>
                                <p>Permanently delete your account and saved details. Records of past orders may be kept for legal and accounting reasons.</p>
                                <button type="button" className="account-button account-button-secondary" onClick={() => setDeleteDialogOpen(true)}>
                                    Delete account
                                </button>
                            </section>
                            </>
                        ) : (
                            <OrdersPanel
                                activeOrders={activeOrders}
                                pastOrders={pastOrders}
                                deadline={deadline}
                                now={now}
                            />
                        )}
                    </section>
                </div>
            </main>

            <Footer />

            {deleteDialogOpen && (
                <div className="account-dialog-backdrop" role="presentation" onMouseDown={(event) => {
                    if (event.target === event.currentTarget) setDeleteDialogOpen(false);
                }}>
                    <section className="account-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title">
                        <button className="account-dialog-close" type="button" aria-label="Close dialog" onClick={() => setDeleteDialogOpen(false)}>
                            <X size={20} aria-hidden="true" />
                        </button>
                        <h2 id="delete-dialog-title">Request account deletion?</h2>
                        <p>Account deletion is not connected in this preview. Contact support to request deletion. Past order records may be kept for legal and accounting reasons.</p>
                        <div className="account-dialog-actions">
                            <button type="button" className="account-button account-button-secondary" onClick={() => setDeleteDialogOpen(false)}>Keep account</button>
                            <a className="account-button account-button-secondary" href="mailto:luxplant3d@gmail.com?subject=Account%20deletion%20request">Contact support</a>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}

function AccountField({
    label,
    id,
    value,
    onChange,
    error,
    type = "text",
}: {
    label: string;
    id: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    type?: string;
}) {
    return (
        <div className="account-field checkout-form-group">
            <label htmlFor={id}>{label}</label>
            <input
                id={id}
                type={type}
                value={value}
                placeholder={label}
                onChange={(event) => onChange(event.currentTarget.value)}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${id}-error` : undefined}
            />
            {error && <p className="account-field-error" id={`${id}-error`} role="alert">{error}</p>}
        </div>
    );
}

function FormActions({ saving, onCancel }: { saving: boolean; onCancel: () => void }) {
    return (
        <div className="account-form-actions">
            <button type="submit" className="account-button account-button-primary" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
            <button type="button" className="account-button account-button-secondary" onClick={onCancel} disabled={saving}>Cancel</button>
        </div>
    );
}

function ReadOnlyRow({
    label,
    value,
    onEdit,
    helper,
}: {
    label: string;
    value: React.ReactNode;
    onEdit?: () => void;
    helper?: string;
}) {
    return (
        <div className="profile-read-row">
            <div className="profile-read-value">
                <span className="profile-read-label">{label}</span>
                <span className="profile-read-text">{value}</span>
                {helper && <span className="account-helper">{helper}</span>}
            </div>
            {onEdit && <button type="button" className="account-edit-link" onClick={onEdit}>Edit</button>}
        </div>
    );
}

function OrdersPanel({
    activeOrders,
    pastOrders,
    deadline,
    now,
}: {
    activeOrders: Order[];
    pastOrders: Order[];
    deadline: number;
    now: number | null;
}) {
    const [message, setMessage] = useState("");
    const detailedOrder = activeOrders[0];

    return (
        <div className="orders-panel">
            <p className="orders-preview-note">Preview only: these example orders, payment actions, and status updates are not connected to live order data.</p>
            {activeOrders.length > 0 && (
                <section className="orders-group">
                    <h2>Active orders</h2>
                    {detailedOrder && (
                        <DetailedOrderCard
                            order={detailedOrder}
                            deadline={deadline}
                            now={now}
                            onAction={(action) => setMessage(`This is a sample order. ${action} is not connected yet.`)}
                        />
                    )}
                    {activeOrders.length > 1 && (
                        <>
                            <h3 className="orders-subheading">Other active orders</h3>
                            {activeOrders.slice(1).map((order) => <CompactOrderCard key={order.number} order={order} />)}
                        </>
                    )}
                </section>
            )}

            {pastOrders.length > 0 && (
                <section className="orders-group">
                    <h2>Past orders</h2>
                    {pastOrders.map((order) => <CompactOrderCard key={order.number} order={order} past />)}
                </section>
            )}

            {activeOrders.length === 0 && pastOrders.length === 0 && (
                <div className="orders-empty">
                    <PackageCheck size={36} aria-hidden="true" />
                    <h2>No orders yet</h2>
                    <p>Your LuxPlant orders will appear here after checkout.</p>
                    <Link href="/product/luxplant-mini" className="account-button account-button-primary">Explore LuxPlant Mini <ArrowRight size={18} aria-hidden="true" /></Link>
                </div>
            )}

            {message && (
                <div className="account-dialog-backdrop" role="presentation" onMouseDown={(event) => {
                    if (event.target === event.currentTarget) setMessage("");
                }}>
                    <section className="account-dialog" role="dialog" aria-modal="true" aria-label="Preview action">
                        <button className="account-dialog-close" type="button" aria-label="Close dialog" onClick={() => setMessage("")}><X size={20} aria-hidden="true" /></button>
                        <p>{message}</p>
                        <div className="account-dialog-actions">
                            <button type="button" className="account-button account-button-secondary" onClick={() => setMessage("")}>Close</button>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}

function DetailedOrderCard({
    order,
    deadline,
    now,
    onAction,
}: {
    order: Order;
    deadline: number;
    now: number | null;
    onAction: (action: string) => void;
}) {
    const totals = orderTotal(order.quantity);
    const currentStep = getOrderStep(order);
    const timeline = [
        { title: "Order placed", description: formatDate(order.placedAt, true) },
        { title: "Payment", description: order.paymentMethod === "Cash on delivery" ? order.codConfirmed ? "Paid to the rider on delivery" : "Pay the rider on delivery" : order.status === "awaiting" ? "Waiting for your payment and proof" : order.status === "rejected" ? "Payment proof needs to be submitted again" : "Payment received and being checked" },
        { title: "Processing", description: "About 2 to 3 days after payment is confirmed" },
        { title: "Shipped", description: "Handed to a third-party delivery service" },
        { title: "Delivered", description: "Your 18-month warranty starts on delivery" },
    ];

    return (
        <article className="order-card order-card-detailed">
            <div className="order-card-header">
                <div>
                    <div className="order-number-line"><h3>{order.number}</h3><span className="order-preview-label">Sample</span></div>
                    <p>Placed {formatDate(order.placedAt, true)}</p>
                </div>
                <StatusBadge status={order.status} />
            </div>

            {order.status === "awaiting" && order.paymentMethod !== "Cash on delivery" ? (
                <div className="order-payment-banner">
                    <div>
                        <h3>Pay {money(totals.total)} within 24 hours</h3>
                        <p>Deadline: {formatDate(new Date(deadline).toISOString(), true)}. Time left: {countdown(deadline, now)}. Unpaid orders are cancelled automatically.</p>
                    </div>
                    <button type="button" className="account-button account-button-primary" onClick={() => onAction("Payment")}>
                        <CreditCard size={18} aria-hidden="true" />Complete payment
                    </button>
                </div>
            ) : order.status === "rejected" ? (
                <div className="order-status-message order-status-message-rejected">
                    <ShieldCheck size={20} aria-hidden="true" />
                    <p>{statusMessage(order.status, order.rejectionReason)}</p>
                    <button type="button" className="account-button account-button-primary" onClick={() => onAction("Proof upload")}>Upload new proof</button>
                </div>
            ) : (
                <div className="order-status-message">
                    <ShieldCheck size={20} aria-hidden="true" />
                    <p>{statusMessage(order.status)}</p>
                </div>
            )}

            <div className="detailed-order-content">
                <section className="order-progress">
                    <h3>Order progress</h3>
                    <ol className="order-timeline">
                        {timeline.map((step, index) => {
                            const done = index < currentStep;
                            const current = index === currentStep;
                            return (
                                <li key={step.title} className={`${done ? "is-done" : ""}${current ? " is-current" : ""}`} aria-current={current ? "step" : undefined}>
                                    <span className="timeline-marker" aria-hidden="true">{done && <Check size={12} />}</span>
                                    <div><span className="timeline-title">{step.title}</span><p>{step.description}</p></div>
                                </li>
                            );
                        })}
                    </ol>
                </section>

                <div className="order-details-column">
                    <section className="order-items">
                        <h3>Items</h3>
                        <OrderItem quantity={order.quantity} total={totals.subtotal} />
                        <div className="order-price-breakdown">
                            <PriceRow label="Subtotal" amount={totals.subtotal} />
                            {totals.discount > 0 && <PriceRow label="Quantity discount (10%)" amount={-totals.discount} />}
                            <PriceRow label={totals.shipping === 0 ? "Delivery fee" : "Delivery fee"} amount={totals.shipping} detail={totals.shipping === 0 ? "Free" : undefined} />
                            <PriceRow label="Total" amount={totals.total} total />
                        </div>
                    </section>

                    <section className="order-details">
                        <h3>Details</h3>
                        <DetailRow label="Payment method" value={order.paymentMethod} />
                        <DetailRow label="Proof of payment" value={order.proofUploaded ? "Uploaded" : "Not uploaded yet"} />
                        <DetailRow label="Deliver to" value={<>Juan Dela Cruz<br />Address to be confirmed</>} />
                        <DetailRow label="Order updates sent to" value="juan@example.com" />
                    </section>
                </div>
            </div>

            <footer className="order-card-footer">
                <p>Need help with this order? <a href="mailto:luxplant3d@gmail.com">luxplant3d@gmail.com</a></p>
                {orderStep(order.status) < 3 && <button type="button" className="account-text-button" onClick={() => onAction("Cancellation")}>Cancel order</button>}
            </footer>
        </article>
    );
}

function CompactOrderCard({ order, past = false }: { order: Order; past?: boolean }) {
    const totals = orderTotal(order.quantity);
    const deliveredAt = order.deliveredAt ?? order.placedAt;
    const warrantyEnd = new Date(deliveredAt);
    warrantyEnd.setMonth(warrantyEnd.getMonth() + 18);

    return (
        <article className="order-card order-card-compact">
            <div className="order-card-header">
                <div>
                    <div className="order-number-line"><h3>{order.number}</h3><span className="order-preview-label">Sample</span></div>
                    <p>Placed {formatDate(order.placedAt, true)}</p>
                </div>
                <StatusBadge status={order.status} />
            </div>
            <div className="compact-order-item">
                <OrderThumbnail />
                <div className="compact-order-copy">
                    <span>LuxPlant Mini</span>
                    <p>Quantity {order.quantity} · {order.paymentMethod}{totals.discount ? " · 10% quantity discount, free delivery" : ""}</p>
                </div>
                <span className="compact-order-total">{money(totals.total)}</span>
            </div>
            {!past && <ProgressTracker currentStep={getOrderStep(order)} />}
            <footer className="compact-order-footer">
                {past ? (
                    <>
                        <p>{order.status === "delivered"
                            ? <>Delivered {formatDate(deliveredAt)}. Warranty active until {formatDate(warrantyEnd.toISOString())}.</>
                            : order.status === "cancelled"
                                ? "This order was cancelled."
                                : "This order expired because payment was not completed in time."}</p>
                        <a href="mailto:luxplant3d@gmail.com">Need help with this order?</a>
                        {order.status !== "delivered" && <Link href="/product/luxplant-mini">Shop LuxPlant Mini</Link>}
                    </>
                ) : (
                    <p>{statusMessage(order.status)}</p>
                )}
            </footer>
        </article>
    );
}

function StatusBadge({ status }: { status: OrderStatus }) {
    return <span className={`order-status-badge order-status-${status}`}><span aria-hidden="true" />{orderStatusLabel(status)}</span>;
}

function OrderThumbnail() {
    return (
        <span className="order-thumbnail">
            <Image src="/assets/plants/luxplant-mini-primary-1.jpeg" alt="" fill sizes="4rem" />
        </span>
    );
}

function OrderItem({ quantity, total }: { quantity: number; total: number }) {
    return (
        <div className="detailed-order-item">
            <OrderThumbnail />
            <div><span>LuxPlant Mini</span><p>Quantity {quantity}</p></div>
            <span className="detailed-item-price">{money(total)}</span>
        </div>
    );
}

function PriceRow({ label, amount, detail, total = false }: { label: string; amount: number; detail?: string; total?: boolean }) {
    return (
        <div className={`order-price-row${total ? " is-total" : ""}`}>
            <span>{label}</span><span>{detail ?? money(amount)}</span>
        </div>
    );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
    return <div className="order-detail-row"><span>{label}</span><p>{value}</p></div>;
}

function ProgressTracker({ currentStep }: { currentStep: number }) {
    const steps = ["Payment", "Processing", "Shipped", "Delivered"];
    return (
        <ol className="compact-progress" aria-label="Order progress">
            {steps.map((step, index) => {
                const position = index + 1;
                const done = position < currentStep;
                const current = position === currentStep;
                return (
                    <li key={step} className={`${done ? "is-done" : ""}${current ? " is-current" : ""}`} aria-current={current ? "step" : undefined}>
                        <span className="compact-progress-marker" aria-hidden="true" />
                        <span>{step}</span>
                    </li>
                );
            })}
        </ol>
    );
}

function statusMessage(status: OrderStatus, rejectionReason?: string) {
    return {
        awaiting: "Waiting for your payment and proof.",
        submitted: "We're checking your proof of payment. This status updates once it is verified.",
        rejected: `Payment proof was rejected${rejectionReason ? `: ${rejectionReason}` : ". Please upload a new proof."}`,
        processing: "Your LuxPlant is being prepared for delivery.",
        shipped: "Your order is on its way with a third-party delivery service.",
        delivered: "Your order has been delivered.",
        cancelled: "This order was cancelled.",
        expired: "This order expired because payment was not completed in time.",
    }[status];
}
