import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("Home", () => {
  it("renders the foundation landing route without feature content", () => {
    const markup = renderToStaticMarkup(<Home />);

    expect(markup).toContain("Mini Improvement Box");
    expect(markup).toContain("application foundation is running");
    expect(markup).not.toContain("DATABASE_URL");
  });
});
