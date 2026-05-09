import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("Home", () => {
  it("renders the public proposal submission form", () => {
    const markup = renderToStaticMarkup(<Home />);

    expect(markup).toContain("Mini Improvement Box");
    expect(markup).toContain("Submit improvement proposals anonymously");
    expect(markup).toContain("name=\"title\"");
    expect(markup).toContain("name=\"body\"");
    expect(markup).toContain("name=\"submitterName\"");
    expect(markup).toContain("name=\"submitterContact\"");
    expect(markup).not.toContain("DATABASE_URL");
  });
});
