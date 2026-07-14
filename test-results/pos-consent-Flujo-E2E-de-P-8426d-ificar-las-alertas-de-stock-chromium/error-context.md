# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: pos-consent.spec.ts >> Flujo E2E de POS, Alertas de Stock y Consentimiento Informado >> Debe completar el registro de consentimiento de un paciente, realizar una venta en el POS y verificar las alertas de stock
- Location: tests\e2e\pos-consent.spec.ts:4:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('h2').filter({ hasText: 'Paciente Consentimiento E2E 1784060108052' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('h2').filter({ hasText: 'Paciente Consentimiento E2E 1784060108052' })

```

# Page snapshot

```yaml
- generic [ref=e3]: $0k
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Flujo E2E de POS, Alertas de Stock y Consentimiento Informado', () => {
  4   |   test('Debe completar el registro de consentimiento de un paciente, realizar una venta en el POS y verificar las alertas de stock', async ({ page }) => {
  5   |     // 1. Iniciar sesión como ADMIN
  6   |     await page.goto('/');
  7   |     await page.fill('input#tour-login-email', 'admin@aurafisio.com');
  8   |     await page.fill('input#tour-login-password', 'admin123');
  9   |     await page.click('button#tour-login-submit');
  10  | 
  11  |     // Esperar a que cargue la app (Sidebar visible)
  12  |     await expect(page.locator('#tour-sidebar')).toBeVisible();
  13  | 
  14  |     // 2. Navegar a Pacientes y crear un nuevo paciente para el flujo
  15  |     await page.click('#tour-sidebar-patients');
  16  |     await expect(page.locator('#tour-patients-list')).toBeVisible();
  17  | 
  18  |     const patientName = `Paciente Consentimiento E2E ${Date.now()}`;
  19  |     await page.click('button#tour-patients-register-btn');
  20  |     await page.fill('input#tour-patient-form-name', patientName);
  21  |     await page.fill('input[type="tel"]', '5559998888');
  22  |     await page.fill('input[type="email"]', 'consent.e2e@test.com');
  23  |     await page.fill('textarea#tour-patient-form-history', 'Ninguno.');
  24  |     await page.click('button#tour-patient-form-submit');
  25  | 
  26  |     // Verificar que se crea el paciente y se selecciona automáticamente
> 27  |     await expect(page.locator('h2', { hasText: patientName })).toBeVisible();
      |                                                                ^ Error: expect(locator).toBeVisible() failed
  28  | 
  29  |     // 3. Flujo de firma de Consentimiento Informado
  30  |     await page.click('#tour-tab-consentimiento');
  31  |     await expect(page.locator('#tour-patients-consent')).toBeVisible();
  32  | 
  33  |     // Seleccionar servicio "general"
  34  |     await page.selectOption('#tour-patients-consent-service-select', 'general');
  35  | 
  36  |     // Estampar firma digital en el canvas
  37  |     const canvas = page.locator('#tour-patients-consent-canvas');
  38  |     await expect(canvas).toBeVisible();
  39  |     const box = await canvas.boundingBox();
  40  |     if (box) {
  41  |       await page.mouse.move(box.x + 10, box.y + 10);
  42  |       await page.mouse.down();
  43  |       await page.mouse.move(box.x + 100, box.y + 80);
  44  |       await page.mouse.up();
  45  |     }
  46  | 
  47  |     // Aceptar los términos
  48  |     await page.click('input[type="checkbox"]');
  49  | 
  50  |     // Confirmar y Guardar Firma
  51  |     await page.click('button#tour-patients-consent-submit');
  52  | 
  53  |     // Verificar que el estado del consentimiento cambia a "Consentimiento Firmado"
  54  |     await expect(page.locator('span', { hasText: 'Consentimiento Firmado' }).first()).toBeVisible();
  55  | 
  56  |     // 4. Navegar a POS (Finanzas)
  57  |     await page.click('#tour-sidebar-pos');
  58  |     await expect(page.locator('#tour-finance-tabs')).toBeVisible();
  59  | 
  60  |     // Asegurarse de estar en la pestaña "Terminal POS"
  61  |     await page.click('#tour-finance-pos-tab');
  62  | 
  63  |     // 5. Gestión de Caja Diaria (Abrir si está cerrada)
  64  |     const closedBanner = page.locator('text=Sesión de caja inactiva (Cerrada)');
  65  |     if (await closedBanner.isVisible()) {
  66  |       await page.click('button:has-text("Abrir Caja Diaria")');
  67  |       await page.fill('#tour-cash-initial-balance', '1000');
  68  |       await page.click('button:has-text("Abrir Sesión")');
  69  |       await expect(closedBanner).not.toBeVisible();
  70  |     }
  71  | 
  72  |     // 6. Asignar Paciente en el POS
  73  |     await page.selectOption('#tour-pos-patient-search', { label: patientName });
  74  | 
  75  |     // 7. Buscar y agregar un producto (por ejemplo, "Gel Conductor Ultrasonido")
  76  |     const productCard = page.locator('div.border.rounded-xl', { hasText: 'Gel Conductor Ultrasonido' }).first();
  77  |     await expect(productCard).toBeVisible();
  78  |     
  79  |     // Verificar si el stock actual está visible en la tarjeta
  80  |     const stockInfo = productCard.locator('span', { hasText: /Stock:/ });
  81  |     await expect(stockInfo).toBeVisible();
  82  | 
  83  |     // Agregar producto al carrito
  84  |     await productCard.locator('button[title="Agregar al carrito"]').click();
  85  | 
  86  |     // Verificar que el item se añade al carrito
  87  |     await expect(page.locator('div.bg-muted.border', { hasText: 'Gel Conductor Ultrasonido' }).first().locator('input[type="number"]')).toBeVisible();
  88  | 
  89  |     // 8. Completar la Venta y Arqueo
  90  |     await page.click('button#tour-pos-submit-sale');
  91  | 
  92  |     // Verificar confirmación de venta exitosa
  93  |     await expect(page.locator('text=Venta registrada con éxito')).toBeVisible();
  94  | 
  95  |     // 9. Comprobar alertas de Stock en las notificaciones del sistema
  96  |     await page.click('#tour-topbar-bell');
  97  |     // Esperar a que el panel de notificaciones se abra y muestre alertas de stock si existen
  98  |     const notificationsPanel = page.locator('span:has-text("Notificaciones")');
  99  |     await expect(notificationsPanel).toBeVisible();
  100 |   });
  101 | });
  102 | 
```