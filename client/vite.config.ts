import { defineConfig } from 'vite'
import path from 'node:path'

export default defineConfig({
	base: './',
	resolve: {
		alias: {
			'@shared': path.resolve(__dirname, '../shared/src')
		}
	},
	server: {
		port: 47031,
		proxy: {
			'/api': 'http://localhost:47032'
		}
	}
})
