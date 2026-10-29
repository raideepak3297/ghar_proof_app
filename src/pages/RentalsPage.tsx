import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { rentalsApi } from "../api/rentals.api";
import { usersApi, type TenantSearchResult } from "../api/users.api";
import type { Rental } from "../types";
import { formatCurrencyINR } from "../utils/formatters";
import { Modal } from "../components/common/Modal";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { Pagination } from "../components/common/Pagination";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  Plus,
  ArrowRight,
  Search,
  User,
  CheckCircle2,
  X,
  Mail,
  ChevronDown,
} from "lucide-react";

export const RentalsPage: React.FC = () => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed" | "pending_move_in">("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [monthlyRent, setMonthlyRent] = useState<number | "">("");
  const [depositAmount, setDepositAmount] = useState<number | "">("");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tenant search & selection state
  const [selectedTenant, setSelectedTenant] = useState<TenantSearchResult | null>(null);
  const [tenantSearchQuery, setTenantSearchQuery] = useState("");
  const [availableTenants, setAvailableTenants] = useState<TenantSearchResult[]>([]);
  const [isLoadingTenants, setIsLoadingTenants] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [manualEmail, setManualEmail] = useState("");
  const [inviteMode, setInviteMode] = useState<"search" | "manual">("search");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);

  const { role } = useAuth();
  const { toast } = useToast();
  const isLandlord = role === "landlord";

  const loadRentals = useCallback(async (targetPage = page) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const data = await rentalsApi.getAll({ page: targetPage, limit });
      const list = (data as any)?.list || (Array.isArray(data) ? data : []);
      const totalCount = (data as any)?.total ?? list.length;
      setRentals(list);
      setTotal(totalCount);
    } catch {
      toast("Failed to load rental properties", "error");
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [limit, page, toast]);

  useEffect(() => {
    loadRentals(page);
  }, [loadRentals, page]);

  // Load registered tenants when modal opens or search query changes
  useEffect(() => {
    if (!isModalOpen || !isLandlord) return;

    let isMounted = true;
    const fetchTenants = async () => {
      setIsLoadingTenants(true);
      try {
        const results = await usersApi.getTenants(tenantSearchQuery.trim());
        if (isMounted) {
          setAvailableTenants(results);
        }
      } catch {
        if (isMounted) setAvailableTenants([]);
      } finally {
        if (isMounted) setIsLoadingTenants(false);
      }
    };

    const timer = setTimeout(fetchTenants, 250);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isModalOpen, tenantSearchQuery, isLandlord]);

  // Click outside listener for tenant dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCreateRental = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await rentalsApi.create({
        propertyAddress: {
          line1,
          line2: line2 || undefined,
          city,
          state,
          postalCode,
        },
        monthlyRent: Number(monthlyRent),
        depositAmount: Number(depositAmount),
        startDate,
        tenantId: selectedTenant ? selectedTenant._id : undefined,
        tenantInviteEmail: selectedTenant
          ? selectedTenant.email
          : manualEmail.trim() || undefined,
      });

      toast(
        selectedTenant
          ? `Property created & linked to tenant ${selectedTenant.firstName}!`
          : "Property registered successfully",
        "success"
      );
      setIsModalOpen(false);
      // Reset form
      setLine1("");
      setLine2("");
      setCity("");
      setState("");
      setPostalCode("");
      setMonthlyRent("");
      setDepositAmount("");
      setSelectedTenant(null);
      setTenantSearchQuery("");
      setManualEmail("");
      loadRentals(1);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to create property";
      toast(Array.isArray(msg) ? msg.join(", ") : msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRentals = rentals.filter((rental) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      rental.propertyAddress.line1.toLowerCase().includes(q) ||
      rental.propertyAddress.city.toLowerCase().includes(q) ||
      (rental.tenantInviteEmail && rental.tenantInviteEmail.toLowerCase().includes(q));

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && rental.status === "active") ||
      (statusFilter === "completed" && rental.status === "completed") ||
      (statusFilter === "pending_move_in" && rental.status !== "active" && rental.status !== "completed");

    return matchesSearch && matchesStatus;
  });

  if (loading) return <LoadingSpinner message="Loading properties..." />;

  return (
    <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
      {/* Top Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "1.5rem",
        gap: "1rem",
        flexWrap: "wrap",
      }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)" }}>Properties</h1>
        </div>

        {isLandlord && (
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary btn-sm">
            <Plus size={15} />
            <span>Add Property</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "0.75rem",
        marginBottom: "1rem",
        flexWrap: "wrap",
      }}>
        <div style={{ position: "relative", minWidth: "260px" }}>
          <Search size={14} color="var(--text-tertiary)" style={{ position: "absolute", left: "9px", top: "10px" }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search address or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: "30px", height: "34px", fontSize: "0.82rem" }}
          />
        </div>

        <div style={{ display: "flex", gap: "0.35rem" }}>
          <button
            onClick={() => setStatusFilter("all")}
            className={`btn btn-sm ${statusFilter === "all" ? "btn-secondary" : "btn-ghost"}`}
            style={{ fontWeight: statusFilter === "all" ? 600 : 400 }}
          >
            All ({total})
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`btn btn-sm ${statusFilter === "active" ? "btn-secondary" : "btn-ghost"}`}
            style={{ fontWeight: statusFilter === "active" ? 600 : 400 }}
          >
            Active
          </button>
          <button
            onClick={() => setStatusFilter("completed")}
            className={`btn btn-sm ${statusFilter === "completed" ? "btn-secondary" : "btn-ghost"}`}
            style={{ fontWeight: statusFilter === "completed" ? 600 : 400 }}
          >
            Completed
          </button>
          <button
            onClick={() => setStatusFilter("pending_move_in")}
            className={`btn btn-sm ${statusFilter === "pending_move_in" ? "btn-secondary" : "btn-ghost"}`}
            style={{ fontWeight: statusFilter === "pending_move_in" ? 600 : 400 }}
          >
            Pending
          </button>
        </div>
      </div>

      {/* Property Table */}
      {filteredRentals.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>No matching properties found.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Monthly Rent</th>
                <th>Deposit</th>
                <th>Tenant</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRentals.map((r) => {
                const tenantObj = typeof r.tenantId === "object" && r.tenantId !== null ? (r.tenantId as any) : null;
                const tenantDisplayName = tenantObj
                  ? [tenantObj.firstName, tenantObj.lastName].filter(Boolean).join(" ")
                  : null;

                return (
                  <tr key={r._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.propertyAddress.line1}</div>
                      <div style={{ fontSize: "0.76rem", color: "var(--text-tertiary)" }}>
                        {r.propertyAddress.city}, {r.propertyAddress.state}
                      </div>
                    </td>
                    <td>{formatCurrencyINR(r.monthlyRent)}</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrencyINR(r.depositAmount)}</td>
                    <td>
                      {tenantDisplayName ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                          <span style={{
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            background: "#ecfdf5",
                            color: "#059669",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.7rem",
                          }}>
                            <User size={12} />
                          </span>
                          <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "#0f172a" }}>
                            {tenantDisplayName}
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                          {r.tenantInviteEmail || "—"}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${r.status === "active" ? "badge-verified" : r.status === "completed" ? "badge-brand" : "badge-pending"}`}>
                        {r.status === "active" ? "Active" : r.status === "completed" ? "Completed" : "Pending"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Link to={`/rentals/${r._id}`} className="btn btn-secondary btn-sm">
                        <span>View</span>
                        <ArrowRight size={13} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <Pagination
            page={page}
            total={total}
            limit={limit}
            onChange={(p) => setPage(p)}
          />
        </div>
      )}

      {/* Add Property Modal with Tenant Search Dropdown */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Rental Property">
        <form onSubmit={handleCreateRental}>
          <div className="form-group">
            <label className="form-label">Address Line 1</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Flat 402, Sunshine Residency"
              value={line1}
              onChange={(e) => setLine1(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Address Line 2 (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Sector 42"
              value={line2}
              onChange={(e) => setLine2(e.target.value)}
            />
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                className="form-input"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <input
                type="text"
                className="form-input"
                placeholder="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Postal Code</label>
              <input
                type="text"
                className="form-input"
                placeholder="PIN"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Monthly Rent (₹)</label>
              <input
                type="number"
                className="form-input"
                placeholder="25000"
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(e.target.value === "" ? "" : Number(e.target.value))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Deposit Amount (₹)</label>
              <input
                type="number"
                className="form-input"
                placeholder="50000"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value === "" ? "" : Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Lease Start Date</label>
            <input
              type="date"
              className="form-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          {/* Tenant Selection Section */}
          <div className="form-group" style={{ marginTop: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.35rem" }}>
              <label className="form-label" style={{ marginBottom: 0 }}>
                Link Tenant
              </label>
              <div style={{ fontSize: "0.78rem" }}>
                {inviteMode === "search" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setInviteMode("manual");
                      setSelectedTenant(null);
                    }}
                    style={{ background: "none", border: "none", color: "#4f46e5", cursor: "pointer", fontWeight: 500 }}
                  >
                    Tenant not registered yet? Invite by Email
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setInviteMode("search");
                      setManualEmail("");
                    }}
                    style={{ background: "none", border: "none", color: "#4f46e5", cursor: "pointer", fontWeight: 500 }}
                  >
                    Select from Registered Tenants
                  </button>
                )}
              </div>
            </div>

            {inviteMode === "search" ? (
              selectedTenant ? (
                /* Selected Tenant Card */
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.65rem 0.85rem",
                  borderRadius: "8px",
                  background: "#ecfdf5",
                  border: "1.5px solid #a7f3d0",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "#059669",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <User size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#065f46" }}>
                        {selectedTenant.firstName} {selectedTenant.lastName || ""}
                      </div>
                      <div style={{ fontSize: "0.76rem", color: "#047857" }}>
                        {selectedTenant.email} • {selectedTenant.phone}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <span style={{
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      color: "#059669",
                      background: "#ffffff",
                      padding: "0.15rem 0.45rem",
                      borderRadius: "9999px",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}>
                      <CheckCircle2 size={11} color="#059669" />
                      <span>Linked</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedTenant(null)}
                      title="Remove selected tenant"
                      style={{
                        background: "none",
                        border: "none",
                        color: "#991b1b",
                        cursor: "pointer",
                        padding: "0.2rem",
                        display: "flex",
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                /* Search Dropdown */
                <div ref={dropdownRef} style={{ position: "relative" }}>
                  <div
                    onClick={() => setIsDropdownOpen(true)}
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Search size={14} color="#94a3b8" style={{ position: "absolute", left: "10px", pointerEvents: "none" }} />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Search tenant by name, email, or phone..."
                      value={tenantSearchQuery}
                      onChange={(e) => {
                        setTenantSearchQuery(e.target.value);
                        setIsDropdownOpen(true);
                      }}
                      onFocus={() => setIsDropdownOpen(true)}
                      style={{ paddingLeft: "32px", paddingRight: "30px", height: "38px" }}
                    />
                    <ChevronDown size={14} color="#94a3b8" style={{ position: "absolute", right: "10px", pointerEvents: "none" }} />
                  </div>

                  {isDropdownOpen && (
                    <div style={{
                      position: "absolute",
                      top: "calc(100% + 4px)",
                      left: 0,
                      right: 0,
                      zIndex: 200,
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                      maxHeight: "220px",
                      overflowY: "auto",
                    }}>
                      {isLoadingTenants ? (
                        <div style={{ padding: "0.75rem", textAlign: "center", fontSize: "0.8rem", color: "#64748b" }}>
                          Searching tenants...
                        </div>
                      ) : availableTenants.length === 0 ? (
                        <div style={{ padding: "0.75rem", textAlign: "center", fontSize: "0.8rem", color: "#64748b" }}>
                          {tenantSearchQuery ? "No registered tenant matches your search." : "No registered tenants found."}
                        </div>
                      ) : (
                        availableTenants.map((tenant) => (
                          <div
                            key={tenant._id}
                            onClick={() => {
                              setSelectedTenant(tenant);
                              setIsDropdownOpen(false);
                            }}
                            style={{
                              padding: "0.65rem 0.85rem",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              cursor: "pointer",
                              borderBottom: "1px solid #f1f5f9",
                              transition: "background 100ms ease",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                              <div style={{
                                width: 28,
                                height: 28,
                                borderRadius: "50%",
                                background: "#ecfdf5",
                                color: "#059669",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}>
                                <User size={14} />
                              </div>
                              <div>
                                <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#0f172a" }}>
                                  {tenant.firstName} {tenant.lastName || ""}
                                </div>
                                <div style={{ fontSize: "0.74rem", color: "#64748b" }}>
                                  {tenant.email} • {tenant.phone}
                                </div>
                              </div>
                            </div>

                            <span style={{
                              fontSize: "0.72rem",
                              fontWeight: 600,
                              color: "#4f46e5",
                              background: "#eef2ff",
                              padding: "0.15rem 0.45rem",
                              borderRadius: "4px",
                            }}>
                              Select
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )
            ) : (
              /* Manual Email Input */
              <div style={{ position: "relative" }}>
                <Mail size={14} color="#94a3b8" style={{ position: "absolute", left: "10px", top: "12px" }} />
                <input
                  type="email"
                  className="form-input"
                  placeholder="tenant@example.com"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  style={{ paddingLeft: "32px" }}
                />
              </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1.5rem" }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-ghost btn-sm">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-sm">
              {isSubmitting ? "Creating..." : "Add Property"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
