import { describe, expect, it } from "vitest";
import { filterBooks, type BookFiltersState } from "../App";
import { books } from "../data/books";

const defaultFilters: BookFiltersState = {
  searchTerm: "",
  selectedGenre: "all",
  readingStatus: "all"
};

describe("filterBooks", () => {
  it.each(["hobbit", "tolkien"])("returns the same book for lowercase and uppercase searches for %s", (searchTerm) => {
    const lowercaseResults = filterBooks(books, {
      ...defaultFilters,
      searchTerm
    });
    const uppercaseResults = filterBooks(books, {
      ...defaultFilters,
      searchTerm: searchTerm.toUpperCase()
    });

    expect(lowercaseResults.map((book) => book.title)).toEqual(["The Hobbit"]);
    expect(uppercaseResults).toEqual(lowercaseResults);
  });

  it("filters by genre and reading status together", () => {
    const results = filterBooks(books, {
      ...defaultFilters,
      selectedGenre: "Fantasy",
      readingStatus: "unread"
    });

    expect(results.map((book) => book.title)).toEqual(["The Night Circus"]);
  });
});
