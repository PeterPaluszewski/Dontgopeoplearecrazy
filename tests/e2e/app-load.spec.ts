import { expect, test } from '@playwright/test';

test('loads login page', async ({ page }) => {
  await page.goto('/auth/login');
  await expect(page.getByRole('heading', { name: /backpacking game/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
});

test('game route redirects to login when unauthenticated', async ({ page }) => {
  await page.goto('/game');
  await expect(page).toHaveURL(/\/auth\/login/);
  await expect(page.getByRole('heading', { name: /backpacking game/i })).toBeVisible();
});