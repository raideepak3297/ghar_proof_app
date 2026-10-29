import React from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import type { Inspection } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { formatDateTime } from "../../utils/formatters";

interface DualSignOffCardProps {
  inspection: Inspection | null;
  onSignOff: () => void;
  isSigning: boolean;
}

export const DualSignOffCard: React.FC<DualSignOffCardProps> = ({ inspection, onSignOff, isSigning }) => {
  const { role } = useAuth();

  const isLocked = inspection
    ? inspection.status === "locked" || Boolean(inspection.landlordSigned && inspection.tenantSigned)
    : false;

  const hasUserSigned = inspection
    ? role === "landlord"
      ? inspection.landlordSigned
      : inspection.tenantSigned
    : false;

  const itemCount = inspection?.items?.length || 0;
  const hasItems = itemCount > 0;

  return (
    <div className="card" style={{ padding: "1.25rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>Dual Sign-Off</h3>
        <span className={`badge ${isLocked ? "badge-verified" : "badge-pending"}`}>
          {isLocked ? "Sealed" : "Pending"}
        </span>
      </div>

      {/* Signature Status */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
        {/* Landlord */}
        <div style={{
          padding: "0.65rem 0.85rem",
          borderRadius: "var(--radius-sm)",
          background: "#f9fafb",
          border: `1px solid ${inspection?.landlordSigned ? "var(--color-verified-border)" : "var(--border-medium)"}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div>
            <div style={{ fontSize: "0.82rem", fontWeight: 600 }}>Landlord</div>
            <div style={{ fontSize: "0.74rem", color: "var(--text-tertiary)" }}>
              {inspection?.landlordSigned && inspection.landlordSignedAt
                ? formatDateTime(inspection.landlordSignedAt)
                : "Pending signature"}
            </div>
          </div>
          {inspection?.landlordSigned ? (
            <span style={{ color: "var(--color-verified)", display: "flex", alignItems: "center", gap: "0.2rem", fontSize: "0.75rem", fontWeight: 600 }}>
              <CheckCircle2 size={13} /> Signed
            </span>
          ) : (
            <span style={{ color: "var(--text-tertiary)", fontSize: "0.75rem" }}>Pending</span>
          )}
        </div>

        {/* Tenant */}
        <div style={{
          padding: "0.65rem 0.85rem",
          borderRadius: "var(--radius-sm)",
          background: "#f9fafb",
          border: `1px solid ${inspection?.tenantSigned ? "var(--color-verified-border)" : "var(--border-medium)"}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div>
            <div style={{ fontSize: "0.82rem", fontWeight: 600 }}>Tenant</div>
            <div style={{ fontSize: "0.74rem", color: "var(--text-tertiary)" }}>
              {inspection?.tenantSigned && inspection.tenantSignedAt
                ? formatDateTime(inspection.tenantSignedAt)
                : "Pending signature"}
            </div>
          </div>
          {inspection?.tenantSigned ? (
            <span style={{ color: "var(--color-verified)", display: "flex", alignItems: "center", gap: "0.2rem", fontSize: "0.75rem", fontWeight: 600 }}>
              <CheckCircle2 size={13} /> Signed
            </span>
          ) : (
            <span style={{ color: "var(--text-tertiary)", fontSize: "0.75rem" }}>Pending</span>
          )}
        </div>
      </div>

      {/* Sealed & Locked Badge */}
      {isLocked && inspection?.rootHash && (
        <div style={{
          padding: "0.75rem 0.95rem",
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: "var(--radius-sm)",
          marginBottom: "1rem",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", color: "#166534", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.2rem" }}>
            <ShieldCheck size={16} color="#059669" />
            <span>Cryptographically Sealed & Locked</span>
          </div>
          <div style={{ fontSize: "0.75rem", color: "#15803d", lineHeight: 1.4 }}>
            Dual sign-off complete. All photos and fixture notes are permanently locked against alterations.
          </div>
        </div>
      )}

      {/* Action Button */}
      {!isLocked && !hasUserSigned && (
        <div>
          <button
            onClick={onSignOff}
            disabled={isSigning || !hasItems || !inspection}
            className="btn btn-success"
            style={{ width: "100%", opacity: !hasItems || !inspection ? 0.45 : 1 }}
          >
            <ShieldCheck size={15} />
            <span>{isSigning ? "Signing..." : "Sign Inspection"}</span>
          </button>
          {!hasItems && (
            <p style={{ fontSize: "0.75rem", color: "var(--color-warning)", marginTop: "0.4rem", textAlign: "center" }}>
              Add at least 1 item before signing.
            </p>
          )}
        </div>
      )}

      {!isLocked && hasUserSigned && (
        <div style={{
          padding: "0.55rem 0.75rem",
          background: "var(--color-verified-bg)",
          border: "1px solid var(--color-verified-border)",
          borderRadius: "var(--radius-sm)",
          fontSize: "0.8rem",
          color: "var(--color-verified)",
          textAlign: "center",
        }}>
          You signed. Waiting for counter-party.
        </div>
      )}
    </div>
  );
};
