import { describe, it, expect } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "./test-utils";
import { LanguageToggle } from "@/components/language-toggle";
import { ConfidenceBadge } from "@/components/confidence-badge";
import { BridgeCard } from "@/components/cards/bridge-card";
import type { BridgeWait } from "@/lib/types";

const sampleWait: BridgeWait = {
  bridgeId: "ysleta-zaragoza",
  bridgeName: "Ysleta–Zaragoza",
  direction: "northbound",
  lanes: [
    { mode: "vehicle", laneType: "General", waitMinutes: 25, status: "open" },
    { mode: "pedestrian", laneType: "Pedestrian", waitMinutes: 12, status: "open" },
  ],
  attribution: {
    source: "CBP Border Wait Times (sample)",
    sourceUrl: "https://bwt.cbp.gov/",
    lastUpdated: new Date().toISOString(),
    confidence: "mock",
  },
};

describe("LanguageToggle (user changes language)", () => {
  it("toggles between EN and ES", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LanguageToggle />, { locale: "en" });

    // When current locale is English, the toggle offers Spanish ("ES").
    const button = await screen.findByRole("button");
    expect(button).toHaveTextContent("ES");

    await user.click(button);
    await waitFor(() => expect(button).toHaveTextContent("EN"));
  });
});

describe("ConfidenceBadge", () => {
  it("labels mock data clearly in English", () => {
    renderWithProviders(<ConfidenceBadge confidence="mock" />, { locale: "en" });
    expect(screen.getByText("Sample data")).toBeInTheDocument();
  });

  it("labels mock data clearly in Spanish", () => {
    renderWithProviders(<ConfidenceBadge confidence="mock" />, { locale: "es" });
    expect(screen.getByText("Datos de muestra")).toBeInTheDocument();
  });

  it("labels live data", () => {
    renderWithProviders(<ConfidenceBadge confidence="live" />, { locale: "en" });
    expect(screen.getByText("Live")).toBeInTheDocument();
  });
});

describe("BridgeCard (user checks bridge waits)", () => {
  it("renders the bridge name and wait times", () => {
    renderWithProviders(<BridgeCard wait={sampleWait} />, { locale: "en" });
    expect(screen.getByText("Ysleta–Zaragoza")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    // Mock attribution must be surfaced.
    expect(screen.getByText("Sample data")).toBeInTheDocument();
  });

  it("toggles the favorite button state", async () => {
    const user = userEvent.setup();
    let favorited = false;
    const { rerender } = renderWithProviders(
      <BridgeCard
        wait={sampleWait}
        isFavorite={favorited}
        onToggleFavorite={() => {
          favorited = true;
        }}
      />,
      { locale: "en" }
    );
    const favButton = screen.getByRole("button", { name: /favorite/i });
    expect(favButton).toHaveAttribute("aria-pressed", "false");
    await user.click(favButton);
    rerender(
      <BridgeCard wait={sampleWait} isFavorite={true} onToggleFavorite={() => {}} />
    );
    expect(
      screen.getByRole("button", { name: /favorited|favorite/i })
    ).toHaveAttribute("aria-pressed", "true");
  });
});
