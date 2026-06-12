import './App.lll'
import { AssertFn, Scenario, ScenarioParameter, Spec, SubjectFactory, WaitForFn } from '@shared/lll.lll'
import { App } from './App.lll'

@Spec('Exercises the paired App host through visible UI interactions only.')
export class AppTest {
	testType = 'behavioral'

	@Scenario('shows the app copy, toggle buttons, and Evidype corner link')
	static async rendersAppShell(subjectFactory: SubjectFactory<App>, scenario: ScenarioParameter): Promise<{ calculatorButtonLabel: string, playgroundButtonLabel: string, cornerLinkLabel: string }> {
		const assert: AssertFn = scenario.assert
		const waitFor: WaitForFn = scenario.waitFor
		const app = await subjectFactory()
		await this.waitForApp(app, waitFor)

		const content = app.shadowRoot?.querySelector<HTMLElement>('#example-content')
		assert(content !== null && content !== undefined, 'Expected the app content shell to render')
		const cornerLink = app.shadowRoot?.querySelector<HTMLAnchorElement>('.lll-corner-link')
		assert(cornerLink !== null && cornerLink !== undefined, 'Expected the bottom-left Evidype corner link to render')
		assert(cornerLink.href === 'https://evidype.com/', 'Expected the corner badge to link to the Evidype website')
		assert(cornerLink.textContent?.trim() === 'Evidype', 'Expected the corner badge to show Evidype text')
		const calculatorButton = this.getButtonByLabel(app, 'Open calculator')
		const playgroundButton = this.getButtonByLabel(app, 'Open playground')
		assert(calculatorButton.textContent?.trim() === 'Open calculator', 'Expected the default calculator toggle button label to be Open calculator')
		assert(playgroundButton.textContent?.trim() === 'Open playground', 'Expected the default playground toggle button label to be Open playground')
		await scenario.screenshot('screenshots/app-shell.png')
		return {
			calculatorButtonLabel: calculatorButton.textContent?.trim() ?? '',
			playgroundButtonLabel: playgroundButton.textContent?.trim() ?? '',
			cornerLinkLabel: cornerLink.textContent?.trim() ?? ''
		}
	}

	@Scenario('toggles calculator visibility from the paired host')
	static async togglesCalculatorPanel(subjectFactory: SubjectFactory<App>, scenario: ScenarioParameter): Promise<{ opened: boolean, closed: boolean }> {
		const assert: AssertFn = scenario.assert
		const waitFor: WaitForFn = scenario.waitFor
		const app = await subjectFactory()
		await this.waitForApp(app, waitFor)

		const button = this.getButtonByLabel(app, 'Open calculator')
		button.click()
		await app.updateComplete
		await waitFor(() => this.findCalculator(app) !== null, 'Expected calculator-panel to appear after opening the calculator')
		const opened = this.findCalculator(app) !== null

		this.getButtonByLabel(app, 'Close calculator').click()
		await app.updateComplete
		await waitFor(() => this.findCalculator(app) === null, 'Expected calculator-panel to disappear after closing the calculator')
		const closed = this.findCalculator(app) === null

		assert(opened, 'Expected calculator to become visible after the first click')
		assert(closed, 'Expected calculator to disappear after the second click')
		return { opened, closed }
	}

	@Scenario('toggles playground visibility from the paired host')
	static async togglesPlaygroundPanel(subjectFactory: SubjectFactory<App>, scenario: ScenarioParameter): Promise<{ opened: boolean, closed: boolean }> {
		const assert: AssertFn = scenario.assert
		const waitFor: WaitForFn = scenario.waitFor
		const app = await subjectFactory()
		await this.waitForApp(app, waitFor)

		const button = this.getButtonByLabel(app, 'Open playground')
		button.click()
		await app.updateComplete
		await waitFor(() => this.findPlayground(app) !== null, 'Expected api-playground to appear after opening the playground')
		const opened = this.findPlayground(app) !== null

		this.getButtonByLabel(app, 'Close playground').click()
		await app.updateComplete
		await waitFor(() => this.findPlayground(app) === null, 'Expected api-playground to disappear after closing the playground')
		const closed = this.findPlayground(app) === null

		assert(opened, 'Expected playground to become visible after the first click')
		assert(closed, 'Expected playground to disappear after the second click')
		return { opened, closed }
	}

	@Spec('Waits until the paired App host has rendered its shadow UI.')
	private static async waitForApp(app: App, waitFor: WaitForFn): Promise<void> {
		await waitFor(() => app.shadowRoot !== null, 'Expected app-root shadow DOM to render')
		await app.updateComplete
	}

	@Spec('Returns a visible button by its exact label.')
	private static getButtonByLabel(app: App, label: string): HTMLButtonElement {
		const buttons = Array.from(app.shadowRoot?.querySelectorAll<HTMLButtonElement>('button') ?? [])
		const button = buttons.find(candidate => candidate.textContent?.trim() === label)
		if (button === undefined) {
			throw new Error(`Expected the app button to exist: ${label}`)
		}
		return button
	}

	@Spec('Returns the currently rendered calculator panel when visible.')
	private static findCalculator(app: App): HTMLElement | null {
		return app.shadowRoot?.querySelector<HTMLElement>('calculator-panel') ?? null
	}

	@Spec('Returns the currently rendered API playground when visible.')
	private static findPlayground(app: App): HTMLElement | null {
		return app.shadowRoot?.querySelector<HTMLElement>('api-playground') ?? null
	}
}
