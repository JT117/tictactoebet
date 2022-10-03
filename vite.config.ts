import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';

const config: UserConfig = {
	plugins: [sveltekit()],
	build : {
		target: 'es2022'
	},
	esbuild: {
		target: 'es2022'
	},
	optimizeDeps: {
		esbuildOptions: {
			target: 'es2022'
		},
	},
	ssr: {
		noExternal: '@concordium/web-sdk'
	}
};

export default config;
