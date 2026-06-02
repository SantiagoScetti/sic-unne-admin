import { defineConfig } from 'vitest/config';
import path from 'node:path';

// =============================================================================
// Configuración de Vitest.
//   - Alias '@' → raíz del proyecto (consistente con tsconfig: "@/*": ["./*"]),
//     de modo que los tests importan el código como '@/src/domain/...'.
//   - Solo se ejecutan archivos *.test.ts dentro de tests/.
// =============================================================================

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts', 'src/**/*.test.{js,ts}'],
    reporters: 'verbose',
  },
});
