import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Pagination } from "../components/common/Pagination";

describe("Pagination", () => {
  it("renders results summary and page controls", () => {
    const onChange = vi.fn();
    render(<Pagination page={1} total={25} limit={10} onChange={onChange} itemLabel="properties" />);

    expect(screen.getByText(/showing/i)).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
    expect(screen.getAllByText("1").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("calls onChange when a page button is clicked", () => {
    const onChange = vi.fn();
    render(<Pagination page={1} total={25} limit={10} onChange={onChange} itemLabel="properties" />);

    const page2Btn = screen.getByText("2");
    fireEvent.click(page2Btn);
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("disables previous button on first page", () => {
    const onChange = vi.fn();
    render(<Pagination page={1} total={25} limit={10} onChange={onChange} />);

    const prevBtn = screen.getByTitle("Previous Page");
    expect(prevBtn).toBeDisabled();
  });
});
