import { defineConfig, globalIgnores } from 'eslint/config'
import _import from 'eslint-plugin-import'
import { fixupPluginRules } from '@eslint/compat'
import globals from 'globals'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
})

export default defineConfig([
  globalIgnores(['eslint.config.mjs']),
  {
    extends: compat.extends(
      'eslint:recommended',
      'plugin:prettier/recommended'
    ),

    plugins: {
        import: fixupPluginRules(_import)
    },

    languageOptions: {
        globals: { ...globals.node },

        ecmaVersion: 2021,
        sourceType: 'commonjs'
    },
  }
])
