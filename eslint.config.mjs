// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = dirname(fileURLToPath(import.meta.url));

export default tseslint.config(
	eslint.configs.recommended,
	...tseslint.configs.strictTypeChecked,
	...tseslint.configs.stylisticTypeChecked,
	{
		files: [
			"src/**/*.ts"
		],
		ignores: [
			"**/*.mjs",
			"**/*.js",
		],
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: __dirname,
			},
		},
	},
);
