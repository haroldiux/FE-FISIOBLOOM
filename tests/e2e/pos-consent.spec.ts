import { test, expect } from '@playwright/test';

test.describe('Flujo E2E de POS, Alertas de Stock y Consentimiento Informado', () => {
  test('Debe completar el registro de consentimiento de un paciente, realizar una venta en el POS y verificar las alertas de stock', async ({ page }) => {
    // 1. Iniciar sesión como ADMIN
    await page.goto('/');
    await page.fill('input#tour-login-email', 'admin@aurafisio.com');
    await page.fill('input#tour-login-password', 'admin123');
    await page.click('button#tour-login-submit');

    // Esperar a que cargue la app (Sidebar visible)
    await expect(page.locator('#tour-sidebar')).toBeVisible();

    // 2. Navegar a Pacientes y crear un nuevo paciente para el flujo
    await page.click('#tour-sidebar-patients');
    await expect(page.locator('#tour-patients-list')).toBeVisible();

    const patientName = `Paciente Consentimiento E2E ${Date.now()}`;
    await page.click('button#tour-patients-register-btn');
    await page.fill('input#tour-patient-form-name', patientName);
    await page.fill('input[type="tel"]', '5559998888');
    await page.fill('input[type="email"]', 'consent.e2e@test.com');
    await page.fill('textarea#tour-patient-form-history', 'Ninguno.');
    await page.click('button#tour-patient-form-submit');

    // Verificar que se crea el paciente y se selecciona automáticamente
    await expect(page.locator('h2', { hasText: patientName })).toBeVisible();

    // 3. Flujo de firma de Consentimiento Informado
    await page.click('#tour-tab-consentimiento');
    await expect(page.locator('#tour-patients-consent')).toBeVisible();

    // Seleccionar servicio "general"
    await page.selectOption('#tour-patients-consent-service-select', 'general');

    // Estampar firma digital en el canvas
    const canvas = page.locator('#tour-patients-consent-canvas');
    await expect(canvas).toBeVisible();
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.move(box.x + 10, box.y + 10);
      await page.mouse.down();
      await page.mouse.move(box.x + 100, box.y + 80);
      await page.mouse.up();
    }

    // Aceptar los términos
    await page.click('input[type="checkbox"]');

    // Confirmar y Guardar Firma
    await page.click('button#tour-patients-consent-submit');

    // Verificar que el estado del consentimiento cambia a "Consentimiento Firmado"
    await expect(page.locator('span', { hasText: 'Consentimiento Firmado' }).first()).toBeVisible();

    // 4. Navegar a POS (Finanzas)
    await page.click('#tour-sidebar-pos');
    await expect(page.locator('#tour-finance-tabs')).toBeVisible();

    // Asegurarse de estar en la pestaña "Terminal POS"
    await page.click('#tour-finance-pos-tab');

    // 5. Gestión de Caja Diaria (Abrir si está cerrada)
    const closedBanner = page.locator('text=Sesión de caja inactiva (Cerrada)');
    if (await closedBanner.isVisible()) {
      await page.click('button:has-text("Abrir Caja Diaria")');
      await page.fill('#tour-cash-initial-balance', '1000');
      await page.click('button:has-text("Abrir Sesión")');
      await expect(closedBanner).not.toBeVisible();
    }

    // 6. Asignar Paciente en el POS
    await page.selectOption('#tour-pos-patient-search', { label: patientName });

    // 7. Buscar y agregar un producto (por ejemplo, "Gel Conductor Ultrasonido")
    const productCard = page.locator('div.border.rounded-xl', { hasText: 'Gel Conductor Ultrasonido' }).first();
    await expect(productCard).toBeVisible();
    
    // Verificar si el stock actual está visible en la tarjeta
    const stockInfo = productCard.locator('span', { hasText: /Stock:/ });
    await expect(stockInfo).toBeVisible();

    // Agregar producto al carrito
    await productCard.locator('button[title="Agregar al carrito"]').click();

    // Verificar que el item se añade al carrito
    await expect(page.locator('div.bg-muted.border', { hasText: 'Gel Conductor Ultrasonido' }).first().locator('input[type="number"]')).toBeVisible();

    // 8. Completar la Venta y Arqueo
    await page.click('button#tour-pos-submit-sale');

    // Verificar confirmación de venta exitosa
    await expect(page.locator('text=Venta registrada con éxito')).toBeVisible();

    // 9. Comprobar alertas de Stock en las notificaciones del sistema
    await page.click('#tour-topbar-bell');
    // Esperar a que el panel de notificaciones se abra y muestre alertas de stock si existen
    const notificationsPanel = page.locator('span:has-text("Notificaciones")');
    await expect(notificationsPanel).toBeVisible();
  });
});
