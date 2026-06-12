import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDirectory, '..')
const distRoot = path.join(projectRoot, 'dist')

rewriteDirectory(distRoot)

function rewriteDirectory(directoryPath) {
	for (const entry of readdirSync(directoryPath)) {
		const absolutePath = path.join(directoryPath, entry)
		const stats = statSync(absolutePath)
		if (stats.isDirectory()) {
			rewriteDirectory(absolutePath)
			continue
		}
		if (!absolutePath.endsWith('.js')) {
			continue
		}
		rewriteSharedImports(absolutePath)
	}
}

function rewriteSharedImports(filePath) {
	const original = readFileSync(filePath, 'utf8')
	const rewrittenSharedImports = original.replace(/(['"])@shared\/([^'"]+)\1/g, (_match, quote, sharedPath) => {
		return `${quote}${toRelativeModulePath(filePath, path.join(distRoot, 'shared', 'src', `${sharedPath}.js`))}${quote}`
	})
	const rewritten = rewrittenSharedImports.replace(/(['"])(\.{1,2}\/[^'"]+\.lll)\1/g, (_match, quote, relativePath) => {
		return `${quote}${relativePath}.js${quote}`
	})

	if (rewritten !== original) {
		writeFileSync(filePath, rewritten)
	}
}

function toRelativeModulePath(fromFilePath, toFilePath) {
	let relativePath = path.relative(path.dirname(fromFilePath), toFilePath).replaceAll(path.sep, '/')
	if (!relativePath.startsWith('.')) {
		relativePath = `./${relativePath}`
	}
	return relativePath
}
