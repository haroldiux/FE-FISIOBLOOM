import { test, expect } from '@playwright/test';

test.describe('Flujos de Autenticación y Login en BLOOM SKIN', () => {
  test.beforeEach(async ({ page }) => {
    // Ir a la página de login
    await page.goto('/');
  });

  test('Debe mostrar la pantalla de login con el título BLOOM SKIN', async ({ page }) => {
    await expect(page).toHaveTitle(/BLOOM SKIN/i);
    await expect(page.locator('h1')).toHaveText('BLOOM SKIN');
  });

  test('Debe fallar el login con credenciales incorrectas', async ({ page }) => {
    await page.fill('input#tour-login-email', 'wrong@aurafisio.com');
    await page.fill('input#tour-login-password', 'wrongpassword');
    await page.click('button#tour-login-submit');

    // Verificar que se muestra el mensaje de error
    const errorBanner = page.locator('.bg-error\\/10');
    await expect(errorBanner).toBeVisible();
    await expect(errorBanner).toContainText(/Invalid email or password/i);
  });

  test('Debe iniciar sesión como ADMIN correctamente', async ({ page }) => {
    await page.fill('input#tour-login-email', 'admin@aurafisio.com');
    await page.fill('input#tour-login-password', 'admin123');
    await page.click('button#tour-login-submit');

    // Al iniciar sesión debe cargarse el dashboard
    await expect(page.locator('#tour-sidebar')).toBeVisible();
    await expect(page.locator('#tour-sidebar-dashboard')).toBeVisible();
    
    // El admin debe tener acceso a Ajustes
    await expect(page.locator('#tour-sidebar-config')).toBeVisible();
  });

  test('Debe iniciar sesión como RECEPCIONISTA correctamente', async ({ page }) => {
    await page.fill('input#tour-login-email', 'recepcion@aurafisio.com');
    await page.fill('input#tour-login-password', 'recep123');
    await page.click('button#tour-login-submit');

    // Al iniciar sesión como recepcionista debe ver Sidebar
    await expect(page.locator('#tour-sidebar')).toBeVisible();
    await expect(page.locator('#tour-sidebar-calendar')).toBeVisible();
    await expect(page.locator('#tour-sidebar-patients')).toBeVisible();
  });
});
