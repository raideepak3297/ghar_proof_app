import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { rentalsApi } from "../api/rentals.api";
import { inspectionsApi } from "../api/inspections.api";
import type { Rental, Inspection } from "../types";
import { formatCurrencyINR, formatDate } from "../utils/formatters";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Lock,
  CheckCircle2,
  Clock,
  Building2,
} from "lucide-react";

export const RentalDetailPage: React.FC = () => {
  const { rentalId } = useParams<{ rentalId: string }>();
  const [rental, setRental] = useState<Rental | null>(null);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAcceptingInvite, setIsAcceptingInvite] = useState(false);

  const { role } = useAuth();
  const { toast } = useToast();
  const isTenant = role === "tenant";
  const isLandlord = role === "landlord";

  const loadData = () => {
    if (!rentalId) return;
    setLoading(true);
    Promise.all([
      rentalsApi.getById(rentalId),
      inspectionsApi.getByRental(rentalId).catch(() => []),
    ])
      .then(([rentalData, inspectionsData]) => {
        setRental(rentalData);
        setInspections(Array.isArray(inspectionsData) ? inspectionsData : []);
      })
      .catch(() => toast("Failed to load property details", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [rentalId]);

  const handleAcceptInvite = async () => {
    if (!rental) return;
    setIsAcceptingInvite(true);
    try {
      await rentalsApi.acceptInvite(rental._id);
      toast("Rental agreement accepted! Tenancy is now active.", "success");
      const updated = await rentalsApi.getById(rental._id);
      setRental(updated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to accept rental invitation";
      toast(msg, "error");
    } finally {
      setIsAcceptingInvite(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading property..." />;
  if (!rental) return <div style={{ padding: "3rem", textAlign: "center" }}>Property not found</div>;

  const isInvited = rental.status === "invited";
  const isActive = rental.status === "active";
  const isCompleted = rental.status === "completed";

  const moveInInspection = inspections.find((i) => i.type === "move_in");
  const moveOutInspection = inspections.find((i) => i.type === "move_out");

  const hasMoveIn = Boolean(rental.moveInInspectionId || moveInInspection);
  const isMoveInLocked =
    moveInInspection?.status === "locked" ||
    Boolean(moveInInspection?.landlordSigned && moveInInspection?.tenantSigned);

  const hasMoveOut = Boolean(rental.moveOutInspectionId || moveOutInspection);
  const isMoveOutLocked =
    moveOutInspection?.status === "locked" ||
    Boolean(moveOutInspection?.landlordSigned && moveOutInspection?.tenantSigned);

  const canCompare = isMoveInLocked && isMoveOutLocked;
  const canSettle = isMoveOutLocked;

  const steps = [
    {
      num: "1",
      title: "Move-In Baseline",
      status: isMoveInLocked
        ? "Sealed"
        : isInvited
        ? isTenant
          ? "Awaiting Your Acceptance"
          : "Awaiting Tenant"
        : hasMoveIn
        ? "In Progress"
        : "Pending",
      statusVariant: isMoveInLocked
        ? "badge-verified"
        : isInvited
        ? "badge-warning"
        : hasMoveIn
        ? "badge-pending"
        : "badge-draft",
      action: isInvited ? (
        isTenant ? (
          <button
            onClick={handleAcceptInvite}
            disabled={isAcceptingInvite}
            className="btn btn-success btn-sm"
          >
            <CheckCircle2 size={13} />
            <span>{isAcceptingInvite ? "Accepting..." : "Accept Invite"}</span>
          </button>
        ) : (
          <button
            disabled
            className="btn btn-secondary btn-sm"
            style={{ opacity: 0.6, cursor: "not-allowed" }}
            title="Tenant must accept the rental invite before Move-In inspection can begin"
          >
            <span>Awaiting Tenant</span>
          </button>
        )
      ) : !hasMoveIn && isTenant ? (
        <span style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>Awaiting Landlord</span>
      ) : (
        <Link
          to={`/rentals/${rental._id}/inspections/move_in`}
          className={hasMoveIn && !isMoveInLocked ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm"}
        >
          <span>{hasMoveIn ? (isMoveInLocked ? "View" : "Review & Sign") : "Start"}</span>
          <ArrowRight size={13} />
        </Link>
      ),
    },
    {
      num: "2",
      title: "Move-Out Inspection",
      status: isMoveOutLocked ? "Sealed" : hasMoveOut ? "In Progress" : !isMoveInLocked ? "Locked" : "Ready",
      statusVariant: isMoveOutLocked ? "badge-verified" : hasMoveOut ? "badge-pending" : !isMoveInLocked ? "badge-draft" : "badge-info",
      action: !isMoveInLocked ? (
        <button disabled className="btn btn-secondary btn-sm" style={{ opacity: 0.5, cursor: "not-allowed" }}>
          <Lock size={12} />
          <span>Locked</span>
        </button>
      ) : !hasMoveOut && isTenant ? (
        <span style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>Awaiting Landlord</span>
      ) : (
        <Link
          to={`/rentals/${rental._id}/inspections/move_out`}
          className={hasMoveOut ? "btn btn-secondary btn-sm" : "btn btn-primary btn-sm"}
        >
          <span>{hasMoveOut ? (isMoveOutLocked ? "View" : "Review & Sign") : "Start"}</span>
          <ArrowRight size={13} />
        </Link>
      ),
    },
    {
      num: "3",
      title: "Condition Comparison",
      status: canCompare ? "Ready" : "Locked",
      statusVariant: canCompare ? "badge-verified" : "badge-draft",
      action: !canCompare ? (
        <button disabled className="btn btn-secondary btn-sm" style={{ opacity: 0.5, cursor: "not-allowed" }}>
          <Lock size={12} />
          <span>Locked</span>
        </button>
      ) : (
        <Link to={`/rentals/${rental._id}/comparison`} className="btn btn-primary btn-sm">
          <span>Compare</span>
          <ArrowRight size={13} />
        </Link>
      ),
    },
    {
      num: "4",
      title: "Disputes & Settlement",
      status: canSettle ? "Active" : "Protected",
      statusVariant: canSettle ? "badge-verified" : "badge-draft",
      action: (
        <Link to={`/rentals/${rental._id}/disputes`} className="btn btn-secondary btn-sm">
          <span>Manage</span>
          <ArrowRight size={13} />
        </Link>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <Link to="/rentals" style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.82rem", color: "var(--text-tertiary)", marginBottom: "0.5rem" }}>
          <ArrowLeft size={13} />
          <span>Back to Properties</span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <h1 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#0f172a" }}>{rental.propertyAddress.line1}</h1>
              <span className={`badge ${isActive ? "badge-verified" : isCompleted ? "badge-brand" : "badge-warning"}`}>
                {isActive ? "Active Lease" : isCompleted ? "Completed" : "Pending Acceptance"}
              </span>
            </div>
            <div style={{ fontSize: "0.84rem", color: "var(--text-tertiary)", marginTop: "0.15rem" }}>
              {rental.propertyAddress.city}, {rental.propertyAddress.state} - {rental.propertyAddress.postalCode}
            </div>
          </div>

          <div>
            {isMoveInLocked ? (
              <Link to={`/rentals/${rental._id}/report`} className="btn btn-secondary btn-sm">
                <FileText size={14} />
                <span>Audit PDF</span>
              </Link>
            ) : (
              <button disabled className="btn btn-secondary btn-sm" style={{ opacity: 0.5, cursor: "not-allowed" }}>
                <FileText size={14} />
                <span>Audit PDF (Locked)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tenant: Acceptance Card when invited */}
      {isTenant && isInvited && (
        <div className="card" style={{
          background: "linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)",
          border: "1.5px solid #a7f3d0",
          padding: "1.5rem 1.75rem",
          marginBottom: "1.75rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1.25rem",
          boxShadow: "0 4px 12px rgba(5, 150, 105, 0.08)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "#059669",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 2px 6px rgba(5, 150, 105, 0.25)",
            }}>
              <Building2 size={24} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#065f46" }}>
                Rental Agreement Invitation
              </div>
              <div style={{ fontSize: "0.85rem", color: "#047857", marginTop: "0.2rem", maxWidth: "560px" }}>
                You have been invited to this rental agreement. Accept to activate your tenancy and unlock the Move-In condition baseline inspection.
              </div>
            </div>
          </div>

          <button
            onClick={handleAcceptInvite}
            disabled={isAcceptingInvite}
            className="btn btn-success"
            style={{ fontWeight: 600, padding: "0.6rem 1.4rem", fontSize: "0.9rem" }}
          >
            <CheckCircle2 size={16} />
            <span>{isAcceptingInvite ? "Accepting..." : "Accept Rental Invitation"}</span>
          </button>
        </div>
      )}

      {/* Landlord: Awaiting Tenant Notice when invited */}
      {isLandlord && isInvited && (
        <div className="card" style={{
          background: "#fffbeb",
          border: "1.5px solid #fde68a",
          padding: "1.1rem 1.35rem",
          marginBottom: "1.75rem",
          display: "flex",
          alignItems: "center",
          gap: "0.85rem",
        }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "#fef3c7",
            color: "#d97706",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}>
            <Clock size={18} color="#d97706" />
          </div>
          <div>
            <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#92400e" }}>
              Waiting for Tenant to Accept Invitation
            </div>
            <div style={{ fontSize: "0.82rem", color: "#b45309", marginTop: "0.15rem" }}>
              The tenant has been linked/invited. Once the tenant accepts the agreement, the tenancy status will change to <strong>Active</strong> and you can record the Move-In room condition checklist.
            </div>
          </div>
        </div>
      )}

      {/* Compact Info Row */}
      <div className="stat-strip" style={{ marginBottom: "2rem" }}>
        <div className="stat-item">
          <div className="stat-label">Monthly Rent</div>
          <div className="stat-value">{formatCurrencyINR(rental.monthlyRent)}</div>
        </div>

        <div className="stat-item">
          <div className="stat-label">Security Deposit</div>
          <div className="stat-value" style={{ color: "#059669" }}>
            {formatCurrencyINR(rental.depositAmount)}
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-label">Lease Start</div>
          <div className="stat-value" style={{ fontSize: "1.1rem", marginTop: "0.4rem" }}>
            {formatDate(rental.startDate)}
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-label">Tenant Account</div>
          <div style={{ fontSize: "0.88rem", fontWeight: 600, marginTop: "0.35rem", color: "#0f172a" }}>
            {rental.tenantId ? (
              <span style={{ color: "#059669", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                <CheckCircle2 size={13} color="#059669" />
                <span>Linked</span>
              </span>
            ) : (
              rental.tenantInviteEmail || "Not invited"
            )}
          </div>
        </div>
      </div>

      {/* Verification Pipeline */}
      <div>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.75rem" }}>Verification Pipeline</h2>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: "60px" }}>Step</th>
                <th>Workflow Stage</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {steps.map((s) => (
                <tr key={s.num}>
                  <td style={{ fontWeight: 600, color: "var(--text-tertiary)" }}>#{s.num}</td>
                  <td style={{ fontWeight: 600 }}>{s.title}</td>
                  <td>
                    <span className={`badge ${s.statusVariant}`}>
                      {s.status === "Sealed" && <CheckCircle2 size={12} />}
                      <span>{s.status}</span>
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>{s.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
