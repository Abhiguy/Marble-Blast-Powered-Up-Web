import { mainAudioManager } from "../audio";
import { state } from "../state";
import { BestTimes } from "../storage";
import { Util } from "../util";
import { FinishScreen } from "./finish_screen";
import { Menu } from "./menu";

export class MbgFinishScreen extends FinishScreen {
	viewReplayButton = document.querySelector('#finish-view-replay') as HTMLImageElement;
	qualifyTimeElement: HTMLElement;
	goldTimeElement: HTMLElement;
	elapsedTimeElement: HTMLElement;
	bonusTimeElement: HTMLElement;

	bestTimeCount = 3;
	scorePlaceholderName = "Nardo Polo";
	storeNotQualified = false;
	failedToQualify: boolean;

	initProperties() {
		this.div = document.querySelector('#finish-screen');
		this.time = document.querySelector('#finish-screen-time-time');
		this.message = document.querySelector('#finish-message');
		this.qualifyTimeElement = document.querySelector('#finish-qualify-time');
		this.goldTimeElement = document.querySelector('#finish-gold-time');
		this.elapsedTimeElement = document.querySelector('#finish-elapsed-time');
		this.bonusTimeElement = document.querySelector('#finish-bonus-time');
		this.replayButton = document.querySelector('#finish-replay');
		this.continueButton = document.querySelector('#finish-continue');
		this.bestTimeContainer = document.querySelector('#finish-best-times');

		this.nameEntryScreenDiv = document.querySelector('#name-entry-screen');
		this.nameEntryText = document.querySelector('#name-entry-screen > p:nth-child(3)');
		this.nameEntryInput = document.querySelector('#name-entry-input');
		this.nameEntryButton = this.nameEntryScreenDiv.querySelector('#name-entry-confirm');
		this.nameEntryButtonSrc = 'common/ok';
	}

	constructor(menu: Menu) {
		super(menu);

		this.viewReplayButton.addEventListener('click', async (e) => {
			if (e.button !== 0) return;
			this.onViewReplayButtonClick(e.altKey);
		});
		Util.onLongTouch(this.viewReplayButton, () => this.onViewReplayButtonClick(true));
		this.viewReplayButton.addEventListener('mouseenter', () => mainAudioManager.play('buttonover.wav'));
		this.viewReplayButton.addEventListener('mousedown', () => mainAudioManager.play('buttonpress.wav'));
	}

	updateTimeElements(elapsedTime: number, bonusTime: number) {
		let level = state.level;

		if (level.mission.backwardClock) {
			// Replace `level.score` with your actual score variable if needed!
			//this.failedToQualify = (parseInt(level.score.toString().replace(/,/g, '')) < parseInt(level.mission.qualifyScore.toString().replace(/,/g, '')));
			this.failedToQualify = (parseInt(level.score.toString().replace(/,/g, '')) <= parseInt(level.mission.qualifyScore.toString().replace(/,/g, '')));
		} else {
			this.failedToQualify = (elapsedTime > level.mission.qualifyTime);
		}

		//this.time.textContent = Util.secondsToTimeString(level.finishTime.gameplayClock / 1000);

		const topLabel = document.getElementById('finish-screen-time-label');
		const topValue = document.getElementById('finish-screen-time-time');
		if (level.mission.backwardClock) {
			topLabel.textContent = "Final Score:";
			// Score would be show instead of final time...
			topValue.textContent = level.score.toLocaleString();
		} else {
			topLabel.textContent = "Final Time:";
			topValue.textContent = Util.secondsToTimeString(level.finishTime.gameplayClock / 1000);
		}

		if (level.mission.backwardClock) {
			document.getElementById('finish-qualify-label').textContent = "Qualify Score:";
			this.qualifyTimeElement.textContent = level.mission.qualifyScore.toLocaleString();

			if (this.failedToQualify) {
				this.qualifyTimeElement.style.color = this.failedToQualify ? 'red' : '';
				this.qualifyTimeElement.style.textShadow = this.failedToQualify ? '1px 1px 0px black' : '';
			} else {
				this.qualifyTimeElement.style.color = 'black';
				this.qualifyTimeElement.style.textShadow = '';
			}

		} else {
			document.getElementById('finish-qualify-label').textContent = "Qualify Time:";
			this.qualifyTimeElement.textContent = isFinite(level.mission.qualifyTime) ? Util.secondsToTimeString(level.mission.qualifyTime / 1000) : Util.secondsToTimeString(5999.999);
			this.qualifyTimeElement.style.color = this.failedToQualify ? 'red' : '';
			this.qualifyTimeElement.style.textShadow = this.failedToQualify ? '1px 1px 0px black' : '';
		}
		Util.monospaceNumbers(this.qualifyTimeElement);

		// Gold score/time
		if (level.mission.backwardClock) {
			document.getElementById('finish-gold-label').textContent = "Gold Score:";
			let goldScore = level.mission.goldScore ?? -Infinity;
			this.goldTimeElement.textContent = goldScore.toLocaleString();
			this.goldTimeElement.parentElement.style.display = (goldScore !== -Infinity) ? '' : 'none';
			Util.monospaceNumbers(this.goldTimeElement);

			// Optional: trigger message if gold score beaten
			if (parseInt(level.score.toString().replace(/,/g, '')) >= parseInt(goldScore.toString().replace(/,/g, ''))) {
				this.showMessage('gold');
			}
		} else {
			let goldTime = level.mission.goldTime;
			this.goldTimeElement.textContent = Util.secondsToTimeString(goldTime / 1000);
			this.goldTimeElement.parentElement.style.display = (goldTime !== -Infinity) ? '' : 'none';
			Util.monospaceNumbers(this.goldTimeElement);
		}

		this.elapsedTimeElement.textContent = Util.secondsToTimeString(elapsedTime / 1000);
		this.bonusTimeElement.textContent = Util.secondsToTimeString(bonusTime / 1000);
		Util.monospaceNumbers(this.elapsedTimeElement);
		Util.monospaceNumbers(this.bonusTimeElement);

	}

	showMessage(type: 'failed' | 'qualified' | 'gold' | 'ultimate') {
		this.message.style.color = '';

		if (type === 'ultimate') {
			this.message.innerHTML = 'You beat the <span style="color: #fff700;">ULTIMATE</span> time!';
		} else if (type === 'gold') {
			if (state.level.mission.backwardClock) { // Take heed though...in Backward clock level Gold Score will appear.
				this.message.innerHTML = 'You beat the <span style="color: #fff700;">GOLD</span> score!';
			} else {
				this.message.innerHTML = 'You beat the <span style="color: #fff700;">GOLD</span> time!';
			}
		} else if (type === 'qualified') {
			if (state.level.mission.backwardClock) {
				//Using the value already calculated in updateTimeElements
				if (!this.failedToQualify) {
					// Pop the Gold score message when the player beats it.
					let goldScore = state.level.mission.goldScore ?? -Infinity;
					if (state.level.score >= goldScore) {
						this.message.innerHTML = 'You beat the <span style="color: #fff700;">GOLD</span> score!';
					} else {
						this.message.innerHTML = "<span style='color: #00cc00;'>You've qualified!</span>";
					}
				} else {
					this.message.innerHTML = "<span style='color: red;'>You failed to qualify!</span>";
				}
			} else {
				this.message.innerHTML = "You've qualified!";
			}
		} else if (type === 'failed') {
			this.message.innerHTML = "You failed to qualify!";
			this.message.style.color = 'red';
		}
	}

	createBestTimeElement() {
		let div = document.createElement('div');
		div.innerHTML = '<p></p><p></p>';
		div.classList.add('finish-row');

		return div;
	}

	updateBestTimeElement(element: HTMLDivElement, score: BestTimes[number], rank: number) {
		const mission = state.level.mission;
		const isBackward = mission.backwardClock;
		const isPlaceholder = score[0] === "Nardo Polo";

		element.children[0].textContent = `${rank}. ${score[0]}`;

		if (isBackward) {
			// Pronounce the player's scores when they have scored...
			const actualScore = isPlaceholder ? 5999999 : state.level.score;
			const goldScore = mission.goldScore ?? -Infinity;

			// Display score with commas
			element.children[1].textContent = actualScore.toLocaleString('en-US', { maximumFractionDigits: 0 });
			Util.monospaceNumbers(element.children[1]);

			// Styling for gold score
			(element.children[1] as HTMLParagraphElement).style.color = (!isPlaceholder && actualScore >= goldScore) ? '#fff700' : '';
			(element.children[1] as HTMLParagraphElement).style.textShadow = (!isPlaceholder && actualScore >= goldScore) ? '1px 1px 0px black' : '';
		}
		else {
			let goldTime = state.level.mission.goldTime;
			element.children[0].textContent = rank + '. ' + score[0];
			element.children[1].textContent = Util.secondsToTimeString(score[1] / 1000);
			Util.monospaceNumbers(element.children[1]);
			(element.children[1] as HTMLParagraphElement).style.color = (score[1] <= goldTime) ? '#fff700' : '';
			(element.children[1] as HTMLParagraphElement).style.textShadow = (score[1] <= goldTime) ? '1px 1px 0px black' : '';
		}
	}

	generateNameEntryText(place: number) {
		if (state.level.mission.backwardClock) {
			return `You got the ${['best', '2nd best', '3rd best'][place]} score!`;
		}
		else {
			return `You got the ${['best', '2nd best', '3rd best'][place]} time!`;
		}
	}
}