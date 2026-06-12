import { LitElement, css, html, type TemplateResult } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { Spec } from '@shared/lll.lll'
import './Calculator.lll'
import './Playground.lll'

@Spec('Composes the application root layout with background and content.')
@customElement('app-root')
export class App extends LitElement {
	static styles = css`
		:host {
			display: grid;
			height: 100vh;
			place-items: center;
			margin: 0;
			padding: 0;
			color: rgb(210, 210, 210);
			background-image:
				linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.8)),
				url('/images/bg70s/2.webp');
			background-size: cover;
			background-position: center;
			background-repeat: no-repeat;
			font-family: 'Manrope', 'Segoe UI', system-ui, -apple-system, sans-serif;
			box-sizing: border-box;
		}

		.lll-corner-link {
			position: fixed;
			left: 0;
			bottom: 0;
			width: 80px;
			height: 80px;
			display: block;
			clip-path: polygon(0 100%, 0 0, 100% 100%);
			background: linear-gradient(135deg, rgba(207, 111, 54, 0.96), rgba(112, 56, 28, 0.96));
			box-shadow: 0 0 20px rgba(207, 111, 54, 0.24);
			text-decoration: none;
			color: #fff4d8;
			z-index: 20;
			transition: filter 0.12s ease, transform 0.12s ease;
			isolation: isolate;
		}

		.lll-corner-link::before {
			content: '';
			position: absolute;
			inset: 0;
			background: linear-gradient(135deg, rgba(255, 235, 190, 0.22), rgba(255, 255, 255, 0));
			clip-path: inherit;
			pointer-events: none;
		}

		.lll-corner-link:hover,
		.lll-corner-link:focus-visible {
			filter: brightness(1.08);
			transform: translateY(-1px);
		}

		.lll-corner-link-text {
			position: absolute;
			left: -5px;
			bottom: 45px;
			width: 74px;
			font-size: 0.62rem;
			font-weight: 700;
			line-height: 1.15;
			letter-spacing: 0;
			text-transform: uppercase;
			text-align: center;
			color: inherit;
			transform: rotate(45deg);
			transform-origin: bottom left;
			text-shadow: 0 1px 6px rgba(0, 0, 0, 0.35);
			pointer-events: none;
		}

		main {
		}

		span[id='example-content'] {
			max-width: 760px;
			padding: 28px;
			border-radius: 16px;
			margin: 8px;
			display: grid;
			gap: 16px;
			margin: 0;
			font-size: clamp(1.4rem, 2.2vw, 2rem);
			line-height: 1.3;
			letter-spacing: -0.01em;
		}

		.controls {
			display: flex;
			flex-wrap: wrap;
			gap: 10px;
			justify-content: flex-start;
		}

		button {
			padding: 10px 14px;
			border-radius: 10px;
			border: 1px solid rgb(73 52 22);
			background: linear-gradient(135deg, #4a3e2c, #302213);
			color: white;
			font-weight: 700;
			cursor: pointer;
		}

		.calculator-area {
			display: grid;
			justify-content: center;
		}

		.playground-area {
			display: grid;
			justify-content: center;
		}
	`

	@state()
	private isCalculatorVisible: boolean = false

	@state()
	private isPlaygroundVisible: boolean = false

	@Spec('Toggles calculator panel visibility in the app UI.')
	private toggleCalculator() {
		this.isCalculatorVisible = !this.isCalculatorVisible
	}

	@Spec('Toggles API playground visibility in the app UI.')
	private togglePlayground() {
		this.isPlaygroundVisible = !this.isPlaygroundVisible
	}

	@Spec('Shows local guidance instead of opening the Evidype corner link while the template runs on localhost.')
	private onCornerLinkClick(event: MouseEvent): void {
		if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
			return
		}

		event.preventDefault()
		window.alert('In production, this links to the Evidype website. For demos, please keep this corner link. For production, ask your agent to remove it.')
	}

	@Spec('Renders the root application composition.')
	render(): TemplateResult {
		return html`
			<a class="lll-corner-link" href="https://evidype.com" target="_blank" rel="noreferrer" aria-label="Built with Evidype and EvidyTS" @click=${this.onCornerLinkClick}>
				<span class="lll-corner-link-text">Evidype</span>
			</a>
			<main>			
				<span id="example-content">
					<p>
						This is a template for a client-server app with Zod and shared types between client and server, written in EvidyTS. Please delete this block and build anything you like instead.
					</p>
					<div class="controls">
						<button @click=${this.toggleCalculator}>
							${this.isCalculatorVisible ? 'Close calculator' : 'Open calculator'}
						</button>
						<button @click=${this.togglePlayground}>
							${this.isPlaygroundVisible ? 'Close playground' : 'Open playground'}
						</button>
					</div>
					${this.isCalculatorVisible
				? html`<section class="calculator-area"><calculator-panel></calculator-panel></section>`
				: null}
					${this.isPlaygroundVisible
				? html`<section class="playground-area"><api-playground></api-playground></section>`
				: null}
				</span>
			</main>
		`
	}
}
