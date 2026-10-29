import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { disputesApi } from "../api/disputes.api";
import { rentalsApi } from "../api/rentals.api";
import type { Dispute, Rental, DeductionCategory } from "../types";
import { SettlementCalculator } from "../components/disputes/SettlementCalculator";
import { CreateDisputeModal } from "../components/disputes/CreateDisputeModal";
import { DisputeActionModal } from "../components/disputes/DisputeActionModal";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { Pagination } from "../components/common/Pagination";
import { formatCurrencyINR, formatDate } from "../utils/formatters";
import { Badge } from "../components/common/Badge";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Plus, CheckCircle2, ArrowRight, ShieldCheck, ArrowLeft, Building2 } from "lucide-react";

export const DisputesPage: React.FC = () => {
  const { rentalId: routeRentalId } = useParams<{ rentalId?: string }>();
  const [activeRentalId, setActiveRentalId] = useState<string | null>(routeRentalId || null);

  const [rental, setRental] = useState<Rental | null>(null);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [total, setTotal] = useState(0);

  const { role } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!routeRentalId) {
      rentalsApi
        .getAll()
        .then((res) => {
          const list = (res as any)?.list || (Array.isArray(res) ? res : []);
          if (list.length > 0) {
            setActiveRentalId(list[0]._id);
          } else {
            setLoading(false);
          }
        })
        .catch(() => {
          setActiveRentalId(null);
          setLoading(false);
        });
    } else {
      setActiveRentalId(routeRentalId);
    }
  }, [routeRentalId]);

  const loadData = useCallback(async (targetPage = page) => {
    if (!activeRentalId) {
      setLoading(false);
      return;
    }
    try {
      const [rentalData, disputesData] = await Promise.all([
        rentalsApi.getById(activeRentalId),
        disputesApi.getByRentalId(activeRentalId, { page: targetPage, limit }),
      ]);
      setRental(rentalData);
      const disputesList = (disputesData as any)?.list || (Array.isArray(disputesData) ? disputesData : []);
      const totalCount = (disputesData as any)?.total ?? disputesList.length;
      setDisputes(disputesList);
      setTotal(totalCount);
    } catch {
      toast("Failed to load disputes for this property", "error");
    } finally {
      setLoading(false);
    }
  }, [activeRentalId, limit, page, toast]);

  useEffect(() => {
    if (activeRentalId) {
      loadData(page);
    }
  }, [activeRentalId, loadData, page]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleCreateDispute = async (data: {
    category: DeductionCategory;
    proposedDeduction: number;
    description: string;
    roomItemId?: string;
  }) => {
    if (!activeRentalId) return;
    try {
      await disputesApi.create(activeRentalId, data);
      toast("Proposed deduction claim submitted successfully", "success");
      loadData(1);
      setPage(1);
    } catch {
      toast("Failed to submit deduction claim", "error");
    }
  };

  const handleActionSubmit = async (disputeId: string, data: {
    tenantStatus: "accepted" | "disputed";
    tenantComment?: string;
    counterAmount?: number;
  }) => {
    if (!activeRentalId || !selectedDispute) return;
    try {
      await disputesApi.updateStatus(activeRentalId, disputeId, data);
      toast(
        data.tenantStatus === "accepted"
          ? "Deduction agreed and accepted"
          : "Counter-offer & dispute logged",
        "success"
      );
      loadData(page);
    } catch {
      toast("Failed to update dispute", "error");
    }
  };

  if (loading) return <LoadingSpinner message="Loading disputes & settlement engine..." />;

  if (!activeRentalId || !rental) {
    return (
      <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "3rem 1.5rem", textAlign: "center" }}>
        <div
          style={{
            background: "#ffffff",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-medium)",
            padding: "3rem 2rem",
            maxWidth: "540px",
            margin: "0 auto",
          }}
        >
          <Building2 size={40} color="var(--color-brand-primary)" style={{ marginBottom: "1rem" }} />
          <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
            No Active Rental Selected
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
            Please select a property from your registered rentals to review deduction claims and settlement.
          </p>
          <Link to="/rentals" className="btn btn-primary">
            <span>View Properties</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "1.5rem 1rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <Link
          to={`/rentals/${activeRentalId}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            fontSize: "0.85rem",
            color: "var(--text-secondary)",
            marginBottom: "1rem",
          }}
        >
          <ArrowLeft size={15} />
          <span>Back to Property Details</span>
        </Link>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "0.35rem" }}>
              <h1 style={{ fontSize: "1.85rem", fontWeight: 600 }}>Deductions & Dispute Resolution</h1>
              <span className="badge badge-warning">Deposit Settlement</span>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              {rental.propertyAddress.line1}, {rental.propertyAddress.city} • Security Deposit: {formatCurrencyINR(rental.depositAmount)}
            </p>
          </div>

          {role === "landlord" && (
            rental.status === "completed" ? (
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.45rem",
                background: "#ecfdf5",
                border: "1.5px solid #a7f3d0",
                padding: "0.45rem 0.85rem",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.84rem",
                color: "#065f46",
                fontWeight: 600,
              }}>
                <CheckCircle2 size={16} color="#059669" />
                <span>Settlement Sealed (Tenancy Completed)</span>
              </div>
            ) : (
              <button onClick={() => setIsCreateOpen(true)} className="btn btn-primary">
                <Plus size={16} />
                <span>Propose New Deduction</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Grid: Claims & Calculator */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "2rem", alignItems: "start" }}>
        <div>
          <h3 style={{ fontSize: "1.15rem", fontWeight: 600, marginBottom: "1rem" }}>
            Itemized Deduction Claims ({total})
          </h3>

          {disputes.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "3rem 2rem", background: "var(--bg-surface)" }}>
              <CheckCircle2 size={40} color="var(--color-verified)" style={{ marginBottom: "0.75rem" }} />
              <h4>Zero Deductions Proposed</h4>
              <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                Full security deposit of {formatCurrencyINR(rental.depositAmount)} is eligible for refund.
              </p>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {disputes.map((dispute) => {
                  const canTakeAction = role === "tenant" && dispute.tenantStatus === "pending";

                  return (
                    <div key={dispute._id} className="card" style={{ padding: "1.5rem", background: "var(--bg-surface)" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                            <span style={{ fontWeight: 600, fontSize: "1.05rem" }}>
                              {dispute.category.replace("_", " ").toUpperCase()}
                            </span>
                            <Badge variant={dispute.tenantStatus === "accepted" ? "success" : dispute.tenantStatus === "disputed" ? "danger" : "warning"}>
                              {dispute.tenantStatus.toUpperCase()}
                            </Badge>
                          </div>
                          <div style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>
                            Claim created: {formatDate(dispute.createdAt)}
                          </div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-danger)" }}>
                            -{formatCurrencyINR(dispute.proposedDeduction)}
                          </div>
                          {dispute.counterAmount !== undefined && (
                            <div style={{ fontSize: "0.8rem", color: "var(--color-warning)" }}>
                              Counter: {formatCurrencyINR(dispute.counterAmount)}
                            </div>
                          )}
                        </div>
                      </div>

                      <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginBottom: "1rem", lineHeight: 1.5 }}>
                        {dispute.description}
                      </p>

                      {dispute.tenantComment && (
                        <div
                          style={{
                            background: "var(--bg-app)",
                            borderRadius: "var(--radius-sm)",
                            padding: "0.75rem",
                            fontSize: "0.82rem",
                            marginBottom: "1rem",
                            borderLeft: "3px solid var(--color-warning)",
                          }}
                        >
                          <strong>Tenant Response: </strong> {dispute.tenantComment}
                        </div>
                      )}

                      {canTakeAction && (
                        <div style={{ borderTop: "1px solid var(--border-medium)", paddingTop: "0.75rem", display: "flex", justifyContent: "flex-end" }}>
                          <button
                            onClick={() => setSelectedDispute(dispute)}
                            className="btn btn-secondary btn-sm"
                          >
                            Review & Respond
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Pagination for Disputes */}
              <Pagination
                page={page}
                total={total}
                limit={limit}
                onChange={handlePageChange}
                itemLabel="claims"
              />
            </div>
          )}
        </div>

        {/* Live Settlement Card */}
        <div>
          <SettlementCalculator depositAmount={rental.depositAmount} disputes={disputes} />

          <div className="card" style={{ marginTop: "1.5rem", padding: "1.25rem", background: "var(--bg-surface)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", color: "var(--color-verified)" }}>
              <ShieldCheck size={18} />
              <span style={{ fontWeight: 600, fontSize: "0.88rem" }}>Arbitration Audit Trail</span>
            </div>
            <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.45 }}>
              All accepted deductions and counters are cryptographically hashed and linked to the final move-out report.
            </p>
          </div>
        </div>
      </div>

      <CreateDisputeModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateDispute}
      />

      <DisputeActionModal
        isOpen={!!selectedDispute}
        dispute={selectedDispute}
        onClose={() => setSelectedDispute(null)}
        onSubmit={handleActionSubmit}
      />
    </div>
  );
};
