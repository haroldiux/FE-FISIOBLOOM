import { test, expect } from '@playwright/test';

test.describe('Flujo de Trabajo del Fisioterapeuta (E2E)', () => {
  test('Debe ver expediente y actualizar el historial medico de un paciente', async ({ page }) => {
    // 1. Iniciar sesión como Fisioterapeuta (Carlos Mendez)
    await page.goto('/');
    await page.fill('input#tour-login-email', 'carlos@aurafisio.com');
    await page.fill('input#tour-login-password', 'carlos123');
    await page.click('button#tour-login-submit');

    // Esperar a que cargue la app
    await expect(page.locator('#tour-sidebar')).toBeVisible();

    // 2. Navegar a la pantalla de Pacientes
    await page.click('#tour-sidebar-patients');
    await expect(page.locator('#tour-patients-list')).toBeVisible();

    // 3. Seleccionar el primer paciente del listado (excluyendo el boton de registro)
    const patientItem = page.locator('#tour-patients-list button:not(#tour-patients-register-btn)').first();
    await patientItem.click();

    // Esperar a que cargue el expediente del paciente
    await expect(page.locator('h2')).toBeVisible();

    // 4. Cambiar a la pestaña de Historial Clínico
    const tabHistorial = page.locator('#tour-tab-historial');
    await expect(tabHistorial).toBeVisible();
    await tabHistorial.click();

    // 5. Clickear en "Editar Ficha" (o registrar ficha clinica si no hay antecedentes)
    const registerBtn = page.locator('text=Registrar ficha clínica');
    const editBtn = page.locator('text=Editar Ficha');

    if (await registerBtn.isVisible()) {
      await registerBtn.click();
    } else {
      await editBtn.click();
    }

    // 6. Rellenar antecedentes
    await page.fill('textarea[placeholder*="antecedentes patológicos"]', 'Antecedentes: Sin cirugias. Alergia menor al latex. Lumbalgia leve.');

    // 7. Guardar cambios
    await page.click('button:has-text("Guardar")');

    // 8. Verificar que el texto guardado sea visible en el expediente
    await expect(page.locator('text=Lumbalgia leve')).toBeVisible();
  });
});
