import { AssertFn, Scenario, Spec, WaitForFn, ScenarioParameter } from '@shared/lll.lll'
import { Playground } from './Playground.lll'
import './Playground.lll'


@Spec('Covers server router wiring behavior for Playground.')
export class PlaygroundTest {
	testType = "unit"

	@Scenario('registers hello and multiply API routes')
	static async registersTypedEndpoints(scenario: ScenarioParameter): Promise<{ registeredPaths: string[] }> {
		const input = scenario.input
		const assert: AssertFn = scenario.assert
		const waitFor: WaitForFn = scenario.waitFor
		const router = Playground.createApiPlaygroundRouter()
		const stack = (router as unknown as { stack?: Array<{ route?: { path?: string } }> }).stack ?? []
		const registeredPaths = stack
			.map((layer) => layer.route?.path)
			.filter((path): path is string => typeof path === 'string')

		assert(registeredPaths.includes('/api/hello'), 'Expected /api/hello route to be registered')
		assert(registeredPaths.includes('/api/multiply'), 'Expected /api/multiply route to be registered')
		return { registeredPaths }
	}
}
