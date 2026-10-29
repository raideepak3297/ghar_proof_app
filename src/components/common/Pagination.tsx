import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  total: number;
  limit: number;
  onChange: (page: number) => void;
  itemLabel?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  total,
  limit,
  onChange,
  itemLabel = "results",
}) => {
  if (total <= 0) return null;

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const from = Math.min((page - 1) * limit + 1, total);
  const to = Math.min(page * limit, total);

  // Build page numbers with ellipsis (fanfare admin pattern)
  const buildPages = (): (number | "…")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "…")[] = [1];
    if (page > 3) pages.push("…");
    for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) {
      pages.push(p);
    }
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
    return pages;
  };

  const pages = buildPages();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.85rem 1.25rem",
        borderTop: "1px solid var(--border-medium)",
        background: "var(--bg-surface)",
        borderRadius: "0 0 var(--radius-md) var(--radius-md)",
        flexWrap: "wrap",
        gap: "0.75rem",
        marginTop: "1rem",
      }}
    >
      {/* Results Summary */}
      <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: 500 }}>
        Showing <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{from}</span>–<span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{to}</span> of{" "}
        <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{total}</span> {itemLabel}
      </div>

      {/* Page Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="btn-pagination-nav"
          style={{
            width: 32,
            height: 32,
            padding: 0,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "6px",
            border: "1px solid var(--border-medium)",
            background: "var(--bg-surface)",
            color: page <= 1 ? "var(--text-tertiary)" : "var(--text-primary)",
            cursor: page <= 1 ? "not-allowed" : "pointer",
            opacity: page <= 1 ? 0.45 : 1,
            transition: "all 0.15s ease",
          }}
          title="Previous Page"
        >
          <ChevronLeft size={16} />
        </button>

        {pages.map((p, idx) =>
          p === "…" ? (
            <span
              key={"ellipsis-" + idx}
              style={{
                width: 32,
                height: 32,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.85rem",
                color: "var(--text-tertiary)",
              }}
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p as number)}
              style={{
                minWidth: 32,
                height: 32,
                padding: "0 6px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "6px",
                fontSize: "0.82rem",
                fontWeight: p === page ? 700 : 500,
                color: p === page ? "#ffffff" : "var(--text-primary)",
                backgroundColor: p === page ? "var(--color-brand-primary)" : "var(--bg-surface)",
                border: "1px solid " + (p === page ? "var(--color-brand-primary)" : "var(--border-medium)"),
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          className="btn-pagination-nav"
          style={{
            width: 32,
            height: 32,
            padding: 0,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "6px",
            border: "1px solid var(--border-medium)",
            background: "var(--bg-surface)",
            color: page >= totalPages ? "var(--text-tertiary)" : "var(--text-primary)",
            cursor: page >= totalPages ? "not-allowed" : "pointer",
            opacity: page >= totalPages ? 0.45 : 1,
            transition: "all 0.15s ease",
          }}
          title="Next Page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
