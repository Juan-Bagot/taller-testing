import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  // La base de datos es UNA y es compartida por todos los tests: se corre en
  // serie. Paralelizar exigiría aislar los datos por worker (ver guía §11).
  fullyParallel: false,
  workers: 1,

  use: {
    // La clínica del taller (puertos 9080/9081/3307 — NO es la del curso de PHP).
    baseURL: 'http://localhost:9080',
    // Ante el primer reintento de un test fallido, grabar el trace para depurar.
    trace: 'on-first-retry',
    locale: 'es-UY',
  },

  expect: {
    // Tolerancia de los tests visuales: absorbe diferencias mínimas de
    // antialiasing sin dejar pasar cambios reales de la interfaz.
    toHaveScreenshot: { maxDiffPixelRatio: 0.02 },
  },

  projects: [
    {
      name: 'escritorio',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 720 } },
    },
    {
      // El proyecto móvil corre SOLO los specs visuales (testMatch):
      // es donde el @media de la app cambia el layout.
      name: 'movil',
      use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 667 } },
      testMatch: /.*visual.*/,
    },
  ],
});
