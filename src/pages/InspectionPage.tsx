import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { inspectionsApi } from "../api/inspections.api";
import { rentalsApi } from "../api/rentals.api";
import type { Rental, Inspection, ItemCondition } from "../types";
import { RoomChecklist } from "../components/inspection/RoomChecklist";
import { DualSignOffCard } from "../components/inspection/DualSignOffCard";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ArrowLeft, ArrowLeftRight, FileText } from "lucide-react";

export const InspectionPage: React.FC = () => {
  const { rentalId, type } = useParams<{ rentalId: string; type: "move_in" | "move_out" }>();
  const navigate = useNavigate();
  const { role } = useAuth();
  const { toast } = useToast();

  const [rental, setRental] = useState<Rental | null>(null);
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [baselineInspection, setBaselineInspection] = useState<Inspection | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigning, setIsSigning] = useState(false);

  const inspectionType = type === "move_out" ? "move_out" : "move_in";

  const loadData = useCallback(async () => {
    if (!rentalId) return;
    setLoading(true);
    try {
      const r = await rentalsApi.getById(rentalId);
      setRental(r);

      const existingInspections = await inspectionsApi.getByRental(rentalId);
      const matched = existingInspections.find((i) => i.type === inspectionType);

      if (matched) {
        const insp = await inspectionsApi.getById(matched._id);
        setInspection(insp);
      } else {
        setInspection(null);
      }

      // Load Move-In baseline inspection for side-by-side evidence comparison during move-out
      if (inspectionType === "move_out") {
        const moveInMatch = existingInspections.find((i) => i.type === "move_in");
        if (moveInMatch) {
          const baseInsp = await inspectionsApi.getById(moveInMatch._id);
          setBaselineInspection(baseInsp);
        } else {
          setBaselineInspection(null);
        }
      }
    } catch {
      toast("Failed to load inspection", "error");
    } finally {
      setLoading(false);
    }
  }, [rentalId, inspectionType, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isLocked = Boolean(
    inspection?.status === "locked" ||
    (inspection?.landlordSigned && inspection?.tenantSigned)
  );

  const isRentalActive = rental?.status === "active" || rental?.status === "completed";

  const handleAddItem = async (itemData: {
    roomName: string;
    itemName: string;
    condition: ItemCondition;
    notes?: string;
    photos?: string[];
  }) => {
    if (!isRentalActive) {
      toast("Tenant must accept the rental agreement invitation before adding checklist items.", "error");
      return;
    }

    if (isLocked) {
      toast("Inspection is sealed. Adding items is disabled.", "error");
      return;
    }

    if (role !== "landlord") {
      toast("Only landlords can record checklist items.", "error");
      return;
    }

    try {
      let currentInspectionId = inspection?._id;

      if (!currentInspectionId) {
        if (!rentalId) return;
        const newInsp = await inspectionsApi.create(rentalId, inspectionType);
        currentInspectionId = newInsp._id;
      }

      await inspectionsApi.addRoomItem(currentInspectionId, {
        roomName: itemData.roomName,
        itemName: itemData.itemName,
        condition: itemData.condition,
        notes: itemData.notes,
        photos: itemData.photos,
      });

      toast("Item added to checklist", "success");
      const fullInsp = await inspectionsApi.getById(currentInspectionId);
      setInspection(fullInsp);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error adding item";
      toast(msg, "error");
    }
  };

  const handleUpdateItem = async (
    itemId: string,
    data: { condition: ItemCondition; notes?: string; photos?: string[] }
  ) => {
    if (!inspection) return;
    try {
      await inspectionsApi.updateRoomItem(inspection._id, itemId, data);
      toast("Checkout assessment updated", "success");
      const fullInsp = await inspectionsApi.getById(inspection._id);
      setInspection(fullInsp);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update checkout item";
      toast(msg, "error");
    }
  };

  const handleStartMoveOut = async () => {
    if (!rentalId) return;
    try {
      const newInsp = await inspectionsApi.create(rentalId, "move_out");
      toast("Checkout inspection started with baseline items", "success");
      const fullInsp = await inspectionsApi.getById(newInsp._id);
      setInspection(fullInsp);
      // Reload to ensure baseline inspection is also loaded
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to start checkout";
      toast(msg, "error");
    }
  };

  const handleSignOff = async () => {
    if (!inspection) return;
    setIsSigning(true);
    try {
      const updated = await inspectionsApi.signOff(inspection._id, true);
      setInspection(updated);
      if (updated.status === "locked") {
        toast("Inspection sealed by both parties.", "success");
      } else {
        toast("Signed off. Awaiting counter-party.", "info");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to sign";
      toast(msg, "error");
    } finally {
      setIsSigning(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading inspection..." />;

  const canCompare = Boolean(inspection && inspectionType === "move_out");

  return (
    <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <button
          onClick={() => navigate(`/rentals/${rentalId}`)}
          className="btn btn-ghost btn-sm"
          style={{ padding: "0.2rem 0", color: "var(--text-tertiary)", marginBottom: "0.5rem" }}
        >
          <ArrowLeft size={13} />
          <span>Back to Property</span>
        </button>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <h1 style={{ fontSize: "1.35rem", fontWeight: 600 }}>
                {inspectionType === "move_in" ? "Move-In Baseline Inspection" : "Move-Out Exit Inspection"}
              </h1>
              <span className={`badge ${isLocked ? "badge-verified" : inspection ? "badge-pending" : "badge-draft"}`}>
                {isLocked ? "Sealed" : inspection ? "Draft" : "Not Started"}
              </span>
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--text-tertiary)", marginTop: "0.15rem" }}>
              {rental?.propertyAddress.line1}, {rental?.propertyAddress.city}
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            {inspectionType === "move_out" && (
              canCompare ? (
                <Link to={`/rentals/${rentalId}/comparison`} className="btn btn-secondary btn-sm">
                  <ArrowLeftRight size={13} />
                  <span>Comparison</span>
                </Link>
              ) : (
                <button disabled className="btn btn-secondary btn-sm" style={{ opacity: 0.5, cursor: "not-allowed" }}>
                  <ArrowLeftRight size={13} />
                  <span>Comparison</span>
                </button>
              )
            )}

            {isLocked ? (
              <Link to={`/rentals/${rentalId}/report`} className="btn btn-secondary btn-sm">
                <FileText size={13} />
                <span>Audit PDF</span>
              </Link>
            ) : (
              <button disabled className="btn btn-secondary btn-sm" style={{ opacity: 0.5, cursor: "not-allowed" }}>
                <FileText size={13} />
                <span>Audit PDF (Locked)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.5rem", alignItems: "start" }}>
        <div>
          <RoomChecklist
            items={inspection?.items || []}
            baselineItems={baselineInspection?.items || []}
            isLocked={isLocked}
            inspectionType={inspectionType}
            isRentalActive={isRentalActive}
            rentalStatus={rental?.status}
            onAddItem={handleAddItem}
            onUpdateItem={handleUpdateItem}
            onStartMoveOut={handleStartMoveOut}
          />
        </div>

        <div>
          <DualSignOffCard
            inspection={inspection}
            isSigning={isSigning}
            onSignOff={handleSignOff}
          />
        </div>
      </div>
    </div>
  );
};
