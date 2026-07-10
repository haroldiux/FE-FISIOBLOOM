import { test, expect } from '@playwright/test';

test.describe('Prueba E2E de Paleta de Colores (Spatial UI)', () => {
  test.beforeEach(async ({ page }) => {
    // 1. Iniciar sesión como ADMIN
    await page.goto('/');
    await page.fill('input#tour-login-email', 'admin@aurafisio.com');
    await page.fill('input#tour-login-password', 'admin123');
    await page.click('button#tour-login-submit');

    // Esperar a que cargue la app (Sidebar visible)
    await expect(page.locator('#tour-sidebar')).toBeVisible();
  });

  test('Debe inyectar y cambiar correctamente --accent y --accent-foreground en el root al cambiar de paleta', async ({ page }) => {
    // 2. Navegar a la pantalla de Configuración
    await page.click('#tour-sidebar-config');
    
    // 3. Seleccionar la pestaña "Centro Médico"
    await page.click('#tour-config-clinic-tab');
    await expect(page.locator('#tour-config-palette-selector')).toBeVisible();

    // 4. Probar cambio a la paleta "Bloom" (segunda paleta en la lista)
    const bloomButton = page.locator('#tour-config-palette-selector button', { hasText: 'Bloom' });
    await bloomButton.click();

    // Validar variables de Bloom
    let accent = await page.evaluate(() => document.documentElement.style.getPropertyValue('--accent'));
    let accentForeground = await page.evaluate(() => document.documentElement.style.getPropertyValue('--accent-foreground'));
    
    // Bloom secondary: #C084FC, secondaryGlow: rgba(192, 132, 252, 0.40)
    expect(accent.trim()).toBe('rgba(192, 132, 252, 0.40)');
    expect(accentForeground.trim().toLowerCase()).toBe('#c084fc');

    // 5. Probar cambio a la paleta "Ocean" (tercera paleta en la lista)
    const oceanButton = page.locator('#tour-config-palette-selector button', { hasText: 'Ocean' });
    await oceanButton.click();

    // Validar variables de Ocean
    accent = await page.evaluate(() => document.documentElement.style.getPropertyValue('--accent'));
    accentForeground = await page.evaluate(() => document.documentElement.style.getPropertyValue('--accent-foreground'));

    // Ocean secondary: #FB923C, secondaryGlow: rgba(251, 146, 60, 0.40)
    expect(accent.trim()).toBe('rgba(251, 146, 60, 0.40)');
    expect(accentForeground.trim().toLowerCase()).toBe('#fb923c');
    
    // 6. Probar cambio a la paleta "Aura" (primera paleta en la lista) para restaurar/probar default
    const auraButton = page.locator('#tour-config-palette-selector button', { hasText: 'Aura' });
    await auraButton.click();

    // Validar variables de Aura
    accent = await page.evaluate(() => document.documentElement.style.getPropertyValue('--accent'));
    accentForeground = await page.evaluate(() => document.documentElement.style.getPropertyValue('--accent-foreground'));

    // Aura secondary: #A78BFA, secondaryGlow: rgba(167, 139, 250, 0.40)
    expect(accent.trim()).toBe('rgba(167, 139, 250, 0.40)');
    expect(accentForeground.trim().toLowerCase()).toBe('#a78bfa');
  });
});
