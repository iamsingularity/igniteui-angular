import { IgxExpansionPanelComponent, scaleInVerTop, scaleOutVerTop } from 'igniteui-angular';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AnimationReferenceMetadata } from '@angular/animations';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'expansion-panel-sample',
    templateUrl: './expansion-panel-sample.html',
    styleUrls: ['expansion-panel-sample.scss']
})
export class ExpansionPanelSampleComponent implements OnInit {
    @ViewChild(IgxExpansionPanelComponent)
    public igxExpansionPanel: IgxExpansionPanelComponent;
    @ViewChild('button') public button: ElementRef;

    public animationSettings: { openAnimation: AnimationReferenceMetadata, closeAnimation: AnimationReferenceMetadata } = {
        openAnimation:  Object.assign(scaleInVerTop, {
            options: {
                params: Object.assign(scaleInVerTop.options.params, {
                    startOpacity: 0.5,
                    fromScale: 0,
                    duration: '250ms'
                })
            }
        }),
        closeAnimation: Object.assign(scaleOutVerTop, {
            options: {
                params: Object.assign(scaleOutVerTop.options.params, {
                    startOpacity: 1,
                    endOpacity: 0.5,
                    fromScale: 1,
                    toScale: 0,
                    duration: '350ms'
                })
            }
        })
    };
    public templatedIcon = false;
    public score: number;
    public data = [];
    public winningPlayer;
    public iconPosition = 'left';
    private rounds = 5;
    public get currentScore(): { 'Player 1': number,
    'Player 2': number} {
        return this.data.length === 0 ? [] : this.data.reduce((a, b) => {
            return {
                'Player 1': a['Player 1'] + b['Player 1'],
                'Player 2': a['Player 2'] + b['Player 2'],
            };
        });
    }

    public get getWinningScore(): number {
        return Math.max(...Object.values(this.currentScore));
    }
    public get getWinningPlayer(): string {
        const currentScore = this.currentScore;
        return Object.keys(currentScore).sort((a, b) => currentScore[b] - currentScore[a])[0];
    }
    private generateScore(): void {
        for (let i = 0; i < this.rounds; i++) {
            this.data.push({
                'Game': `Game ${i + 1}`,
                'Player 1': Math.floor(Math.random() * 10) + 1,
                'Player 2': Math.floor(Math.random() * 10) + 1
            });
        }
    }

    ngOnInit() {
        this.generateScore();
    }

    resetScore(event: Event) {
        this.data = [];
        event.stopPropagation();
        this.generateScore();
    }

    collapsed() {
        return this.igxExpansionPanel && this.igxExpansionPanel.collapsed;
    }

    constructor() {
    }

    handleCollapsed(event) {
        console.log(`I'm collapsing!`, event);
    }
    handleExpanded(event) {
        console.log(`I'm expanding!`, event);
    }
    onInterraction(event) {
        console.log(`Header's touched!`, event);
    }

    templateIcon() {
        this.templatedIcon = !this.templatedIcon;
    }

    toggleLeftRight() {
        this.iconPosition = this.iconPosition === 'left' ? 'right' : 'left';
    }
}
