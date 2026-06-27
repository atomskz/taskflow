import { test, expect } from '@playwright/test';

// Core happy path: register a fresh account, create a task, complete it, and
// confirm the dashboard reflects the work. Each run uses a unique email so it
// is repeatable against a persistent dev database.
test('register → create task → complete → dashboard', async ({ page }) => {
  const email = `e2e+${Date.now()}@test.io`;

  // --- register (auto-login lands on the dashboard) ---
  await page.goto('/register');
  await page.getByPlaceholder('Как вас зовут?').fill('E2E User');
  await page.getByPlaceholder('you@example.com').fill(email);
  await page.getByPlaceholder('Минимум 8 символов').fill('abcd1234');
  await page.getByPlaceholder('Повторите пароль').fill('abcd1234');
  await page.getByRole('button', { name: 'Создать аккаунт' }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  // --- create a task from the (empty) tasks page ---
  await page.goto('/tasks');
  await page.getByRole('button', { name: 'Создать задачу' }).first().click();
  await page.getByPlaceholder('Что нужно сделать?').fill('Мой первый таск');
  await page.getByRole('button', { name: 'Создать' }).click();
  await expect(page.getByText('Мой первый таск')).toBeVisible();

  // --- open it and mark it complete ---
  await page.getByText('Мой первый таск').click();
  await page.getByRole('button', { name: 'Завершить' }).click();

  // --- dashboard loads with the weekly stats ---
  await page.goto('/dashboard');
  await expect(page.getByText('За неделю')).toBeVisible();
  await expect(page.getByText('Активные')).toBeVisible();
});
