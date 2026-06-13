import { test, expect } from "@playwright/test";

test("landing page loads and shows key content", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("Reply to Every Customer");
  await expect(page.locator('header a[href="/login"]')).toBeVisible();
  await expect(page.locator("#how")).toBeVisible();
  await expect(page.locator("#features")).toBeVisible();
  await expect(page.locator("#pricing")).toBeVisible();
  await expect(page.locator("#faq")).toBeVisible();
});

test("login page has OAuth buttons and form", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByLabel("Sign in with Google")).toBeVisible();
  await expect(page.getByLabel("Sign in with Facebook")).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
});

test("404 page shows for unknown routes", async ({ page }) => {
  await page.goto("/nonexistent");
  await expect(page.locator("h1")).toContainText("404");
});
