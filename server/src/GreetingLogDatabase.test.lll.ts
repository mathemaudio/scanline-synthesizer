import Database from 'better-sqlite3'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { AssertFn, Scenario, ScenarioParameter, Spec, SubjectFactory, WaitForFn } from '@shared/lll.lll'
import { GreetingLogDatabase } from './GreetingLogDatabase.lll'
import './GreetingLogDatabase.lll'

@Spec('Covers SQLite greeting log persistence behavior.')
export class GreetingLogDatabaseTest {
	testType = 'unit'

	@Scenario('creates the schema and stores greeted names')
	static async storesGreetingLogEntries(subjectFactory: SubjectFactory<GreetingLogDatabase>, scenario: ScenarioParameter): Promise<{ storedId: number; storedName: string }> {
		const input = scenario.input
		const assert: AssertFn = scenario.assert
		const waitFor: WaitForFn = scenario.waitFor
		const tempDirectory = mkdtempSync(join(tmpdir(), 'greeting-log-db-'))
		const databasePath = join(tempDirectory, 'database.db')
		const greetingLogDatabase = new GreetingLogDatabase(databasePath)

		try {
			const storedId = greetingLogDatabase.logGreetingRequest('Frank Zappa')
			greetingLogDatabase.close()

			const database = new Database(databasePath, { readonly: true })
			try {
				const row = database
					.prepare('SELECT id, greeted_name FROM greeting_test_logs WHERE id = ?')
					.get(storedId) as { id: number; greeted_name: string } | undefined

				assert(row !== undefined, 'Expected greeting_test_logs row to be inserted')
				assert(row.id === storedId, 'Expected stored row id to match insert result')
				assert(row.greeted_name === 'Frank Zappa', 'Expected stored greeted name to match inserted request')
				return { storedId, storedName: row.greeted_name }
			} finally {
				database.close()
			}
		} finally {
			rmSync(tempDirectory, { recursive: true, force: true })
		}
	}
}
