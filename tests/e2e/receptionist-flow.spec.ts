import { test, expect } from '@playwright/test';

test.describe('Flujo de Trabajo del Recepcionista (E2E)', () => {
  test('Debe registrar un paciente, agendar una cita y ver la pantalla de POS', async ({ page }) => {
    // 1. Iniciar sesión como Recepcionista
    await page.goto('/');
    await page.fill('input#tour-login-email', 'recepcion@aurafisio.com');
    await page.fill('input#tour-login-password', 'recep123');
    await page.click('button#tour-login-submit');

    // Esperar a que cargue la app (Sidebar visible)
    await expect(page.locator('#tour-sidebar')).toBeVisible();

    // 2. Navegar a la pantalla de Pacientes
    await page.click('#tour-sidebar-patients');
    await expect(page.locator('#tour-patients-list')).toBeVisible();

    // 3. Crear un nuevo paciente
    await page.click('button#tour-patients-register-btn');
    await page.fill('input#tour-patient-form-name', 'Maria E2E Lopez');
    await page.fill('input[type="tel"]', '5557778888');
    await page.fill('input[type="email"]', 'maria.e2e@test.com');
    // Para el recepcionista, la ficha clinica inicial se ignora al guardar, pero la rellenamos de todos modos
    await page.fill('textarea#tour-patient-form-history', 'Alergias menores a cremas.');
    await page.click('button#tour-patient-form-submit');

    // Verificar que se crea el paciente y se selecciona (el panel de detalles se abre y muestra su nombre)
    await expect(page.locator('h2', { hasText: 'Maria E2E Lopez' })).toBeVisible();

    // 4. Navegar a la pantalla de Calendario
    await page.click('#tour-sidebar-calendar');
    await expect(page.locator('#tour-calendar-grid')).toBeVisible();

    // 5. Agendar una nueva cita
    await page.click('button#tour-calendar-create-btn');
    
    // Buscar al paciente recién creado
    await page.fill('input[placeholder="Buscar nombre o teléfono..."]', 'Maria E2E Lopez');
    const option = page.locator('.max-h-48 p.text-sm', { hasText: 'Maria E2E Lopez' }).first();
    await expect(option).toBeVisible();
    await option.click(); // Seleccionar del autocompletado de forma segura

    // Seleccionar especialista (Carlos Mendez del seed) dentro del drawer
    await page.click('#tour-calendar-drawer-specialist >> text=Carlos Mendez');

    // Seleccionar Cabina dentro del drawer
    await page.click('#tour-calendar-drawer-cabin >> text=Box Fisioterapia');

    // Rellenar fecha de mañana
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    await page.fill('input[type="date"]', dateStr);

    // Seleccionar hora del chip de accesos rápidos dentro del drawer
    await page.click('#tour-calendar-drawer-time >> text=09:00');

    // Rellenar notas
    await page.fill('textarea[placeholder*="observaciones del paciente"]', 'Tratamiento de rehabilitacion de rodilla.');

    // Agendar cita
    await page.click('button#tour-calendar-drawer-submit');

    // La cita debe quedar agendada.
    // 6. Ir a la pantalla de POS/Facturas
    await page.click('#tour-sidebar-pos');
    await expect(page.locator('h3', { hasText: 'Resumen del Cobro' })).toBeVisible({ timeout: 10000 });
  });
});
