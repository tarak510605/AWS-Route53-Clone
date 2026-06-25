import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchBar } from "@/components/shared/search-bar";

describe("SearchBar", () => {
  it("renders with placeholder", () => {
    render(<SearchBar value="" onChange={vi.fn()} placeholder="Search zones" />);
    expect(screen.getByPlaceholderText("Search zones")).toBeInTheDocument();
  });

  it("calls onChange when typing", () => {
    const onChange = vi.fn();
    render(<SearchBar value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "test" } });
    expect(onChange).toHaveBeenCalledWith("test");
  });

  it("shows clear button when value is present", () => {
    render(<SearchBar value="hello" onChange={vi.fn()} />);
    expect(screen.getByLabelText("Clear search")).toBeInTheDocument();
  });

  it("hides clear button when value is empty", () => {
    render(<SearchBar value="" onChange={vi.fn()} />);
    expect(screen.queryByLabelText("Clear search")).not.toBeInTheDocument();
  });

  it("clears value when clear button clicked", () => {
    const onChange = vi.fn();
    render(<SearchBar value="hello" onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Clear search"));
    expect(onChange).toHaveBeenCalledWith("");
  });
});
