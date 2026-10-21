import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
export default defineConfig({
  plugins: [vue({
    template: {
      compilerOptions: {
        isCustomElement: tag => tag === 'primitive' || (tag.startsWith('Tres') && tag !== 'TresCanvas'),
      },
    },
  })],
  server: { watch: { ignored: ['**/.qa/**'] } },
  build: { target: 'es2022' },
})
