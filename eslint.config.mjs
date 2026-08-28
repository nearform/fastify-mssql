import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import js from '@eslint/js'
import prettierRecommended from 'eslint-plugin-prettier/recommended'

export default defineConfig([
  globalIgnores(['eslint.config.mjs']),
  {
    extends: [js.configs.recommended, prettierRecommended],

    languageOptions: {
      globals: { ...globals.node },

      ecmaVersion: 2021,
      sourceType: 'commonjs'
    }
  }
])
