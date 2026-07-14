# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: receptionist-flow.spec.ts >> Flujo de Trabajo del Recepcionista (E2E) >> Debe registrar un paciente, agendar una cita y ver la pantalla de POS
- Location: tests\e2e\receptionist-flow.spec.ts:4:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('h2').filter({ hasText: 'Maria E2E Lopez' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('h2').filter({ hasText: 'Maria E2E Lopez' })

```

# Page snapshot

```yaml
- generic [ref=e3]: $0k
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Flujo de Trabajo del Recepcionista (E2E)', () => {
  4  |   test('Debe registrar un paciente, agendar una cita y ver la pantalla de POS', async ({ page }) => {
  5  |     // 1. Iniciar sesión como Recepcionista
  6  |     await page.goto('/');
  7  |     await page.fill('input#tour-login-email', 'recepcion@aurafisio.com');
  8  |     await page.fill('input#tour-login-password', 'recep123');
  9  |     await page.click('button#tour-login-submit');
  10 | 
  11 |     // Esperar a que cargue la app (Sidebar visible)
  12 |     await expect(page.locator('#tour-sidebar')).toBeVisible();
  13 | 
  14 |     // 2. Navegar a la pantalla de Pacientes
  15 |     await page.click('#tour-sidebar-patients');
  16 |     await expect(page.locator('#tour-patients-list')).toBeVisible();
  17 | 
  18 |     // 3. Crear un nuevo paciente
  19 |     await page.click('button#tour-patients-register-btn');
  20 |     await page.fill('input#tour-patient-form-name', 'Maria E2E Lopez');
  21 |     await page.fill('input[type="tel"]', '5557778888');
  22 |     await page.fill('input[type="email"]', 'maria.e2e@test.com');
  23 |     // Para el recepcionista, la ficha clinica inicial se ignora al guardar, pero la rellenamos de todos modos
  24 |     await page.fill('textarea#tour-patient-form-history', 'Alergias menores a cremas.');
  25 |     await page.click('button#tour-patient-form-submit');
  26 | 
  27 |     // Verificar que se crea el paciente y se selecciona (el panel de detalles se abre y muestra su nombre)
> 28 |     await expect(page.locator('h2', { hasText: 'Maria E2E Lopez' })).toBeVisible();
     |                                                                      ^ Error: expect(locator).toBeVisible() failed
  29 | 
  30 |     // 4. Navegar a la pantalla de Calendario
  31 |     await page.click('#tour-sidebar-calendar');
  32 |     await expect(page.locator('#tour-calendar-grid')).toBeVisible();
  33 | 
  34 |     // 5. Agendar una nueva cita
  35 |     await page.click('button#tour-calendar-create-btn');
  36 |     
  37 |     // Buscar al paciente recién creado
  38 |     await page.fill('input[placeholder="Buscar nombre o teléfono..."]', 'Maria E2E Lopez');
  39 |     const option = page.locator('.max-h-48 p.text-sm', { hasText: 'Maria E2E Lopez' }).first();
  40 |     await expect(option).toBeVisible();
  41 |     await option.click(); // Seleccionar del autocompletado de forma segura
  42 | 
  43 |     // Seleccionar especialista (Carlos Mendez del seed) dentro del drawer
  44 |     await page.click('#tour-calendar-drawer-specialist >> text=Carlos Mendez');
  45 | 
  46 |     // Seleccionar Cabina dentro del drawer
  47 |     await page.click('#tour-calendar-drawer-cabin >> text=Box Fisioterapia');
  48 | 
  49 |     // Rellenar fecha de mañana
  50 |     const tomorrow = new Date();
  51 |     tomorrow.setDate(tomorrow.getDate() + 1);
  52 |     const dateStr = tomorrow.toISOString().split('T')[0];
  53 |     await page.fill('input[type="date"]', dateStr);
  54 | 
  55 |     // Seleccionar hora del chip de accesos rápidos dentro del drawer
  56 |     await page.click('#tour-calendar-drawer-time >> text=09:00');
  57 | 
  58 |     // Rellenar notas
  59 |     await page.fill('textarea[placeholder*="observaciones del paciente"]', 'Tratamiento de rehabilitacion de rodilla.');
  60 | 
  61 |     // Agendar cita
  62 |     await page.click('button#tour-calendar-drawer-submit');
  63 | 
  64 |     // La cita debe quedar agendada.
  65 |     // 6. Ir a la pantalla de POS/Facturas
  66 |     await page.click('#tour-sidebar-pos');
  67 |     await expect(page.locator('h3', { hasText: 'Resumen del Cobro' })).toBeVisible({ timeout: 10000 });
  68 |   });
  69 | });
  70 | 
```