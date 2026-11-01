import React from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import App from "../App";

afterEach(cleanup);

describe("theme switching", () => {
  it("starts light and switches both ways using a labeled toggle", async () => {
    const user = userEvent.setup();
    render(<App />);
    const toggle = screen.getByRole("button", { name: "Dark mode" });
    const page = screen.getByRole("main").parentElement;

    expect(page?.getAttribute("data-theme")).toBe("light");
    expect(toggle.getAttribute("aria-pressed")).toBe("false");
    await user.click(toggle);
    expect(page?.getAttribute("data-theme")).toBe("dark");
    expect(toggle.getAttribute("aria-pressed")).toBe("true");
    await user.click(toggle);
    expect(page?.getAttribute("data-theme")).toBe("light");
    expect(toggle.getAttribute("aria-pressed")).toBe("false");
  });

  it("supports keyboard activation", async () => {
    const user = userEvent.setup();
    render(<App />);
    const toggle = screen.getByRole("button", { name: "Dark mode" });

    await user.tab();
    expect(document.activeElement).toBe(toggle);
    await user.keyboard("{Enter}");
    expect(toggle.getAttribute("aria-pressed")).toBe("true");
    await user.keyboard(" ");
    expect(toggle.getAttribute("aria-pressed")).toBe("false");
  });

  it("preserves active filters, results, and filtered statistics in both themes", async () => {
    const user = userEvent.setup();
    render(<App />);
    const search = screen.getByRole("searchbox", { name: "Search" });
    const genre = screen.getByRole("combobox", { name: "Genre" });
    const status = screen.getByRole("combobox", { name: "Status" });
    await user.type(search, "LE GUIN");
    await user.selectOptions(genre, "Fantasy");
    await user.selectOptions(status, "read");

    for (const theme of ["dark", "light"]) {
      await user.click(screen.getByRole("button", { name: "Dark mode" }));
      expect(screen.getByRole("main").parentElement?.getAttribute("data-theme")).toBe(theme);
      expect((search as HTMLInputElement).value).toBe("LE GUIN");
      expect((genre as HTMLSelectElement).value).toBe("Fantasy");
      expect((status as HTMLSelectElement).value).toBe("read");
      expect(screen.getByRole("heading", { name: "1 books shown" })).toBeTruthy();
      expect(screen.getByRole("heading", { name: "A Wizard of Earthsea" })).toBeTruthy();
      const stats = within(screen.getByRole("region", { name: "Reading stats" }));
      for (const label of ["Total: 1", "Read: 1", "Unread: 0", "Favorites: 1", "Average rating: 5.0"]) {
        expect(stats.getByLabelText(label)).toBeTruthy();
      }
    }
  });

  it("preserves the empty state and zero statistics when switching themes", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByRole("searchbox", { name: "Search" }), "no matching title");

    for (const theme of ["dark", "light"]) {
      await user.click(screen.getByRole("button", { name: "Dark mode" }));
      expect(screen.getByRole("main").parentElement?.getAttribute("data-theme")).toBe(theme);
      const emptyState = within(screen.getByRole("status"));
      expect(emptyState.getByText("No matching books found")).toBeTruthy();
      expect(emptyState.getByText("Try a different search term, genre, or reading status.")).toBeTruthy();
      const stats = within(screen.getByRole("region", { name: "Reading stats" }));
      for (const label of ["Total: 0", "Read: 0", "Unread: 0", "Favorites: 0", "Average rating: 0.0"]) {
        expect(stats.getByLabelText(label)).toBeTruthy();
      }
    }
  });
});
