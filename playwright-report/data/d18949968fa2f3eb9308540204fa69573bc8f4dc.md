# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: physio-flow.spec.ts >> Flujo de Trabajo del Fisioterapeuta (E2E) >> Debe ver expediente y actualizar el historial medico de un paciente
- Location: tests\e2e\physio-flow.spec.ts:4:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('h2')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('h2')

```

# Page snapshot

```yaml
- generic [ref=e3]: $0k
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Flujo de Trabajo del Fisioterapeuta (E2E)', () => {
  4  |   test('Debe ver expediente y actualizar el historial medico de un paciente', async ({ page }) => {
  5  |     // 1. Iniciar sesión como Fisioterapeuta (Carlos Mendez)
  6  |     await page.goto('/');
  7  |     await page.fill('input#tour-login-email', 'carlos@aurafisio.com');
  8  |     await page.fill('input#tour-login-password', 'carlos123');
  9  |     await page.click('button#tour-login-submit');
  10 | 
  11 |     // Esperar a que cargue la app
  12 |     await expect(page.locator('#tour-sidebar')).toBeVisible();
  13 | 
  14 |     // 2. Navegar a la pantalla de Pacientes
  15 |     await page.click('#tour-sidebar-patients');
  16 |     await expect(page.locator('#tour-patients-list')).toBeVisible();
  17 | 
  18 |     // 3. Seleccionar el primer paciente del listado (excluyendo el boton de registro)
  19 |     const patientItem = page.locator('#tour-patients-list button:not(#tour-patients-register-btn)').first();
  20 |     await patientItem.click();
  21 | 
  22 |     // Esperar a que cargue el expediente del paciente
> 23 |     await expect(page.locator('h2')).toBeVisible();
     |                                      ^ Error: expect(locator).toBeVisible() failed
  24 | 
  25 |     // 4. Cambiar a la pestaña de Historial Clínico
  26 |     const tabHistorial = page.locator('#tour-tab-historial');
  27 |     await expect(tabHistorial).toBeVisible();
  28 |     await tabHistorial.click();
  29 | 
  30 |     // 5. Clickear en "Editar Ficha" (o registrar ficha clinica si no hay antecedentes)
  31 |     const registerBtn = page.locator('text=Registrar ficha clínica');
  32 |     const editBtn = page.locator('text=Editar Ficha');
  33 | 
  34 |     if (await registerBtn.isVisible()) {
  35 |       await registerBtn.click();
  36 |     } else {
  37 |       await editBtn.click();
  38 |     }
  39 | 
  40 |     // 6. Rellenar antecedentes
  41 |     await page.fill('textarea[placeholder*="antecedentes patológicos"]', 'Antecedentes: Sin cirugias. Alergia menor al latex. Lumbalgia leve.');
  42 | 
  43 |     // 7. Guardar cambios
  44 |     await page.click('button:has-text("Guardar")');
  45 | 
  46 |     // 8. Verificar que el texto guardado sea visible en el expediente
  47 |     await expect(page.locator('text=Lumbalgia leve')).toBeVisible();
  48 |   });
  49 | });
  50 | 
```