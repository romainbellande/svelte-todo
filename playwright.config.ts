import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
	testDir: './e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: 'html',
	use: {
		baseURL: process.env.PUBLIC_BASE_URL,
		trace: 'on-first-retry'
	},
	projects: [
		{
			name: 'setup',
			testMatch: /.*\.setup\.ts/
		},
		{
			name: 'authenticated',
			testMatch: /.*\.test\.ts/,
			dependencies: ['setup'],
			use: {
				storageState: 'e2e/.auth/user.json'
			}
		}
	]
	// webServer: {
	//   command: 'npm run build && npm run preview',
	//   port: 4173,
	//   reuseExistingServer: !process.env.CI
	// }
});
