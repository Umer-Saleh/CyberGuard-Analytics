import { test, expect } from "@playwright/test";

/** Matches backend /simulate shape for default parameters (deterministic UI checks). */
function mockSimulateBody() {
  const theoretical = [0.3137254901960784, 0.39215686274509803, 0.19607843137254902, 0.09803921568627451];
  const simulation = [0.31928198401132163, 0.40832114793823526, 0.17696502415138313, 0.09543184389906004];
  const labels = ["Safe", "Under Attack", "Compromised", "Recovery"] as const;
  return {
    theoretical,
    simulation,
    states: theoretical.map((t, i) => ({
      state: labels[i],
      theoretical: t,
      simulated: simulation[i],
    })),
    metrics: {
      availability: 2 / 3,
      mtbf: 0.5,
      failureRate: 2,
    },
  };
}

test.describe("Six scenarios (E2E with mocked API)", () => {
  test("1 — app loads (landing)", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("2 — simulation → results with mocked /simulate", async ({ page }) => {
    await page.route("**/simulate", async (route) => {
      if (route.request().method() !== "POST") {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockSimulateBody()),
      });
    });

    await page.goto("/simulation");
    await page.getByRole("button", { name: /Run Simulation/i }).click({ force: true });
    await expect(page).toHaveURL(/\/results/);
    await expect(page.getByRole("heading", { name: "Simulation Results" })).toBeVisible();
    await expect(page.getByText("Safe", { exact: true }).first()).toBeVisible();
  });

  test("3 — results show ~31.9% Safe (simulated % on cards)", async ({ page }) => {
    await page.route("**/simulate", async (route) => {
      if (route.request().method() !== "POST") {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockSimulateBody()),
      });
    });
    await page.goto("/simulation");
    await page.getByRole("button", { name: /Run Simulation/i }).click({ force: true });
    await expect(page.getByText("31.9%")).toBeVisible();
  });

  test("4 — failed API shows error and stays on simulation", async ({ page }) => {
    await page.route("**/simulate", async (route) => {
      if (route.request().method() !== "POST") {
        await route.continue();
        return;
      }
      await route.fulfill({ status: 503, body: "unavailable" });
    });
    await page.goto("/simulation");
    await page.getByRole("button", { name: /Run Simulation/i }).click({ force: true });
    await expect(page).toHaveURL(/\/simulation/);
    await expect(page.getByText("Simulation failed", { exact: true }).first()).toBeVisible({ timeout: 10_000 });
  });

  test("5 — results page exposes metrics row", async ({ page }) => {
    await page.route("**/simulate", async (route) => {
      if (route.request().method() !== "POST") {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockSimulateBody()),
      });
    });
    await page.goto("/simulation");
    await page.getByRole("button", { name: /Run Simulation/i }).click({ force: true });
    await expect(page.getByText("Availability")).toBeVisible();
    await expect(page.getByText("MTBF")).toBeVisible();
    await expect(page.getByText("Failure rate")).toBeVisible();
  });

  test("6 — analysis loads charts (mocked sensitivity + montecarlo)", async ({ page }) => {
    await page.route("**/sensitivity", async (route) => {
      const lambdas = Array.from({ length: 10 }, (_, i) => 0.5 + i);
      const results = lambdas.map(() => [0.25, 0.25, 0.25, 0.25]);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ lambdas, results }),
      });
    });
    await page.route("**/montecarlo", async (route) => {
      const results = Array.from({ length: 20 }, () => [0.25, 0.25, 0.25, 0.25]);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ runs: 20, results }),
      });
    });

    await page.goto("/analysis");
    await expect(page.getByRole("heading", { name: "Advanced Analysis" })).toBeVisible();
    await expect(page.getByText("Sensitivity Analysis")).toBeVisible();
    await expect(page.getByText("Monte Carlo Distribution")).toBeVisible();
    await expect(page.getByText(/Analysis request failed/i)).toHaveCount(0);
  });
});
