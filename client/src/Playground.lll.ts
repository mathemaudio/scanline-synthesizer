import { LitElement, css, html, type TemplateResult } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { Bridge } from '@shared/Bridge.lll'
import { Spec } from '@shared/lll.lll'

@Spec('Renders a client API playground that calls the typed hello and multiply endpoints.')
@customElement('api-playground')
export class Playground extends LitElement {
	static styles = css`
		:host {
			display: block;
			width: min(100%, 420px);
			padding: 16px;
			border-radius: 8px;
			border: 1px solid rgba(255, 255, 255, 0.16);
			background: rgba(9, 14, 24, 0.78);
			box-shadow: 0 12px 28px rgba(0, 0, 0, 0.25);
			box-sizing: border-box;
		}

		.playground {
			display: grid;
			gap: 16px;
		}

		.endpoint {
			display: grid;
			gap: 10px;
		}

		.field-row {
			display: grid;
			grid-template-columns: 1fr;
			gap: 8px;
		}

		.number-row {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 8px;
		}

		label {
			display: grid;
			gap: 5px;
			color: #eef4ff;
			font-size: 0.78rem;
			font-weight: 700;
		}

		input {
			width: 100%;
			box-sizing: border-box;
			padding: 10px 12px;
			border-radius: 8px;
			border: 1px solid rgba(255, 255, 255, 0.25);
			background: rgba(255, 255, 255, 0.1);
			color: #f8fbff;
			font: inherit;
		}

		input[readonly] {
			color: #cde6ff;
		}

		button {
			justify-self: start;
			padding: 10px 14px;
			border: 1px solid rgba(255, 255, 255, 0.18);
			border-radius: 8px;
			background: linear-gradient(135deg, #2e6df6, #6b9afd);
			color: #ffffff;
			font-weight: 700;
			cursor: pointer;
		}

		.error {
			min-height: 1.2em;
			color: #ffb4b4;
			font-size: 0.82rem;
		}
	`

	@state()
	private name: string = 'Ada'

	@state()
	private firstNumber: string = '6'

	@state()
	private secondNumber: string = '7'

	@state()
	private greetingResult: string = ''

	@state()
	private multiplyResult: string = ''

	@state()
	private errorMessage: string = ''

	@Spec('Renders controls for typed hello and multiply API calls.')
	render(): TemplateResult {
		return html`
			<div class="playground">
				<section class="endpoint" aria-label="Hello endpoint">
					<div class="field-row">
						<label>
							Name
							<input class="name-input" .value=${this.name} @input=${this.onNameInput} />
						</label>
						<label>
							Greeting
							<input class="greeting-output" readonly .value=${this.greetingResult} />
						</label>
					</div>
					<button class="hello-button" @click=${this.requestHello}>Request hello</button>
				</section>

				<section class="endpoint" aria-label="Multiply endpoint">
					<div class="number-row">
						<label>
							First number
							<input class="first-number-input" type="number" .value=${this.firstNumber} @input=${this.onFirstNumberInput} />
						</label>
						<label>
							Second number
							<input class="second-number-input" type="number" .value=${this.secondNumber} @input=${this.onSecondNumberInput} />
						</label>
					</div>
					<label>
						Product
						<input class="multiply-output" readonly .value=${this.multiplyResult} />
					</label>
					<button class="multiply-button" @click=${this.requestMultiply}>Multiply</button>
				</section>

				<div class="error" role="status">${this.errorMessage}</div>
			</div>
		`
	}

	@Spec('Stores the name typed by the user.')
	private onNameInput(event: Event): void {
		this.name = this.readInputValue(event)
	}

	@Spec('Stores the first numeric input as text until the user submits it.')
	private onFirstNumberInput(event: Event): void {
		this.firstNumber = this.readInputValue(event)
	}

	@Spec('Stores the second numeric input as text until the user submits it.')
	private onSecondNumberInput(event: Event): void {
		this.secondNumber = this.readInputValue(event)
	}

	@Spec('Requests a typed greeting from the server endpoint.')
	private async requestHello(): Promise<void> {
		this.errorMessage = ''
		try {
			const response = await Bridge.typedFetch('/api/hello', { name: this.name })
			this.greetingResult = response
		} catch (error) {
			this.errorMessage = this.formatError(error)
		}
	}

	@Spec('Requests a typed multiplication result from the server endpoint.')
	private async requestMultiply(): Promise<void> {
		this.errorMessage = ''
		const a = Number(this.firstNumber)
		const b = Number(this.secondNumber)
		if (!Number.isFinite(a) || !Number.isFinite(b)) {
			this.errorMessage = 'Please enter two valid numbers.'
			return
		}

		try {
			const response = await Bridge.typedFetch('/api/multiply', { a, b })
			this.multiplyResult = String(response.product)
		} catch (error) {
			this.errorMessage = this.formatError(error)
		}
	}

	@Spec('Reads an input value from an input event.')
	private readInputValue(event: Event): string {
		const target = event.target
		return target instanceof HTMLInputElement ? target.value : ''
	}

	@Spec('Formats unknown errors for display.')
	private formatError(error: unknown): string {
		return error instanceof Error ? error.message : 'Request failed.'
	}
}
