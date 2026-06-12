import './Playground.lll'
import { AssertFn, Scenario, ScenarioParameter, Spec, SubjectFactory, WaitForFn } from '@shared/lll.lll'
import { Playground } from './Playground.lll'

@Spec('Exercises the API playground through visible UI interactions only.')
export class PlaygroundTest {
	testType = 'behavioral'

	private static readonly sampleNames: string[] = [
		'Ada',
		'Grace',
		'Linus',
		'Katherine',
		'Margaret',
		'Radia',
		'Alan',
		'Barbara',
		'Donald',
		'Edsger'
	]

	@Scenario('requests hello through Bridge.typedFetch')
	static async requestsHelloThroughTypedBridge(subjectFactory: SubjectFactory<Playground>, scenario: ScenarioParameter): Promise<{ name: string, greeting: string }> {
		const assert: AssertFn = scenario.assert
		const waitFor: WaitForFn = scenario.waitFor
		const playground = await subjectFactory()
		await this.preparePlayground(playground, waitFor)
		const restoreFetch = this.installFetchStub(assert)

		try {
			const name = this.pickRandomName()
			await this.enterInputValue(playground, 'input.name-input', name)
			await this.clickButton(playground, 'button.hello-button')

			const expectedGreeting = `Hi, ${name}!`
			await waitFor(() => this.readInputValue(playground, 'input.greeting-output') === expectedGreeting, 'Expected greeting result to match the hello endpoint response')
			const greeting = this.readInputValue(playground, 'input.greeting-output')
			assert(greeting === expectedGreeting, 'Expected greeting output to show the server greeting')
			return { name, greeting }
		} finally {
			restoreFetch()
		}
	}

	@Scenario('requests multiplication through Bridge.typedFetch')
	static async requestsMultiplicationThroughTypedBridge(subjectFactory: SubjectFactory<Playground>, scenario: ScenarioParameter): Promise<{ firstNumber: number, secondNumber: number, product: string }> {
		const assert: AssertFn = scenario.assert
		const waitFor: WaitForFn = scenario.waitFor
		const playground = await subjectFactory()
		await this.preparePlayground(playground, waitFor)
		const restoreFetch = this.installFetchStub(assert)

		try {
			const firstNumber = 13
			const secondNumber = 11
			await this.enterInputValue(playground, 'input.first-number-input', String(firstNumber))
			await this.enterInputValue(playground, 'input.second-number-input', String(secondNumber))
			await this.clickButton(playground, 'button.multiply-button')

			const expectedProduct = String(firstNumber * secondNumber)
			await waitFor(() => this.readInputValue(playground, 'input.multiply-output') === expectedProduct, 'Expected multiply result to match the server product')
			const product = this.readInputValue(playground, 'input.multiply-output')
			assert(product === expectedProduct, 'Expected multiply output to show the calculated product')
			return { firstNumber, secondNumber, product }
		} finally {
			restoreFetch()
		}
	}

	@Spec('Waits for the paired playground host to render.')
	private static async preparePlayground(playground: Playground, waitFor: WaitForFn): Promise<void> {
		await waitFor(() => playground.shadowRoot !== null, 'Expected api-playground shadow DOM to render')
		await playground.updateComplete
	}

	@Spec('Installs a fetch stub that behaves like the typed server playground endpoints.')
	private static installFetchStub(assert: AssertFn): () => void {
		const originalFetch = globalThis.fetch
		globalThis.fetch = async (url: string | URL | Request, init?: RequestInit): Promise<Response> => {
			const path = this.readRequestPath(url)
			const body = this.parseJsonBody(init?.body)

			assert(init?.method === 'POST', 'Expected Bridge.typedFetch to send POST requests')
			if (path === '/api/hello') {
				const name = typeof body.name === 'string' ? body.name : ''
				assert(name.length > 0, 'Expected hello request to include a name')
				return this.jsonResponse(`Hi, ${name}!`)
			}
			if (path === '/api/multiply') {
				const a = typeof body.a === 'number' ? body.a : Number.NaN
				const b = typeof body.b === 'number' ? body.b : Number.NaN
				assert(Number.isFinite(a) && Number.isFinite(b), 'Expected multiply request to include two numbers')
				return this.jsonResponse({ product: a * b })
			}

			throw new Error(`Unexpected request path: ${path}`)
		}

		return () => {
			globalThis.fetch = originalFetch
		}
	}

	@Spec('Picks one of ten known names for each greeting scenario run.')
	private static pickRandomName(): string {
		const index = Math.floor(Math.random() * this.sampleNames.length)
		return this.sampleNames[index] ?? this.sampleNames[0]
	}

	@Spec('Enters text into an input and dispatches the visible input event.')
	private static async enterInputValue(playground: Playground, selector: string, value: string): Promise<void> {
		const input = playground.shadowRoot?.querySelector<HTMLInputElement>(selector)
		if (input === null || input === undefined) {
			throw new Error(`Input not found: ${selector}`)
		}
		input.value = value
		input.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }))
		await playground.updateComplete
	}

	@Spec('Clicks a visible button by selector.')
	private static async clickButton(playground: Playground, selector: string): Promise<void> {
		const button = playground.shadowRoot?.querySelector<HTMLButtonElement>(selector)
		if (button === null || button === undefined) {
			throw new Error(`Button not found: ${selector}`)
		}
		button.click()
		await playground.updateComplete
	}

	@Spec('Reads a rendered input value by selector.')
	private static readInputValue(playground: Playground, selector: string): string {
		const input = playground.shadowRoot?.querySelector<HTMLInputElement>(selector)
		if (input === null || input === undefined) {
			throw new Error(`Input not found: ${selector}`)
		}
		return input.value
	}

	@Spec('Extracts an endpoint path from the fetch URL value.')
	private static readRequestPath(url: string | URL | Request): string {
		if (url instanceof Request) {
			return new URL(url.url, window.location.href).pathname
		}
		return new URL(String(url), window.location.href).pathname
	}

	@Spec('Parses the JSON request body passed through fetch.')
	private static parseJsonBody(body: BodyInit | null | undefined): Record<string, unknown> {
		return typeof body === 'string' ? JSON.parse(body) as Record<string, unknown> : {}
	}

	@Spec('Builds a JSON response for the fetch stub.')
	private static jsonResponse(payload: unknown): Response {
		return new Response(JSON.stringify(payload), {
			status: 200,
			headers: {
				'Content-Type': 'application/json'
			}
		})
	}
}
