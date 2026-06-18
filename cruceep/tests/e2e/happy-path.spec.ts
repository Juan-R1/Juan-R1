import { test, expect } from "@playwright/test";

/**
 * End-to-end happy path (mock providers, no Supabase required):
 *   1. Land on the home page.
 *   2. Switch language to Spanish and back.
 *   3. Check bridge wait times.
 *   4. Plan a trip and see a plan card.
 *   5. Save the route locally.
 */
test("core happy path: language, bridges, plan, save", async ({ page }) => {
  // 1. Landing
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Plan El Paso and border trips/i })
  ).toBeVisible();

  // 2. Language toggle (EN -> ES -> EN)
  const langToggle = page.getByRole("button", { name: /language|idioma/i }).first();
  await langToggle.click();
  await expect(
    page.getByRole("heading", { name: /Planea tus viajes/i })
  ).toBeVisible();
  await langToggle.click();

  // 3. Bridges
  await page.goto("/bridges");
  await expect(page.getByRole("heading", { name: /Bridge wait times/i })).toBeVisible();
  await expect(page.getByText(/Sample data/i).first()).toBeVisible();

  // 4. Trip planner
  await page.goto("/plan");
  await page.getByLabel("Origin").fill("Downtown El Paso");
  await page.getByLabel("Destination").fill("UTEP");
  await page.getByRole("button", { name: /Plan trip/i }).click();
  await expect(
    page.getByRole("heading", { name: /Your trip plan/i })
  ).toBeVisible();

  // 5. Save the route (stored locally since not signed in)
  await page.getByRole("button", { name: /Save this route/i }).click();
  await expect(page.getByText(/Saved/i).first()).toBeVisible();

  await page.goto("/saved-routes");
  await expect(page.getByText("Downtown El Paso → UTEP")).toBeVisible();
});
