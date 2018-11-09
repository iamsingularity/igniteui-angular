import { Component, NgModule, EventEmitter, Output, Input, ViewChild, ElementRef } from '@angular/core';
import { IgxExpansionPanelModule } from '../expansion-panel/expansion-panel.module';
import { BrowserModule } from '@angular/platform-browser';
import { IgxExpansionPanelComponent } from '../expansion-panel';
import { IgxIconModule } from '../icon/index';
import { IToggleView } from '../core/navigation';

export interface BannerEventArgs {
    banner: IgxBannerComponent;
    button?: string;
}

@Component({
    selector: 'igx-banner',
    templateUrl: 'banner.component.html'
})
export class IgxBannerComponent implements IToggleView {
    private _bannerEvent: BannerEventArgs;

    @ViewChild('expansionPanel')
    private _expansionPanel: IgxExpansionPanelComponent;

    /**
     * Fires after the banner shows up
     */
    @Output()
    public onOpen = new EventEmitter<BannerEventArgs>();

    /**
     * Fires after the banner hides
     */
    @Output()
    public onClose = new EventEmitter<BannerEventArgs>();

    /**
     * Fires when one clicks either confirming or dismissive button
     */
    @Output()
    public onButtonClick = new EventEmitter<BannerEventArgs>();

    /**
     * Set name of the icon from material design icons
     */
    @Input()
    public icon: string;

    /**
     * Sets the message to show in the banner
     */
    @Input()
    public message: string;

    /**
     * Sets the description of confirming button
     */
    @Input()
    public confirmButtonText: string;

    /**
     * Set the description of the dismissive button
     */
    @Input()
    public dismissButtonText: string;

    /** @hidden */
    @Input()
    public get useDefaultTemplate(): boolean {
        return (this.message !== undefined) && (this.dismissButtonText !== undefined || this.confirmButtonText !== undefined);
    }

    /**
     * Gets whether banner is collapsed
     */
    public get collapsed() {
        return this._expansionPanel.collapsed;
    }

    /** @hidden */
    public get element() {
        return this.elementRef.nativeElement;
    }

    constructor(public elementRef: ElementRef) { }

    /**
     * Opens the banner
     */
    public open() {
        this._bannerEvent = { banner: this, button: null };
        this._expansionPanel.open();
    }

    /**
     * Closes the banner
     */
    public close() {
        this._bannerEvent = { banner: this, button: null };
        this._expansionPanel.close();
    }

    /**
     * Toggles the banner
     */
    toggle() {
        if (this.collapsed) {
            this.open();
        } else {
            this.close();
        }
    }

    /** @hidden */
    public dismiss() {
        this._bannerEvent = { banner: this, button: 'dismiss' };
        this.onButtonClick.emit(this._bannerEvent);
        this.close();
    }

    /** @hidden */
    public confirm() {
        this._bannerEvent = { banner: this, button: 'confirm' };
        this.onButtonClick.emit(this._bannerEvent);
        this.close();
    }

    /** @hidden */
    public onExpansionPanelOpen(ev) {
        this.onOpen.emit(this._bannerEvent);
    }

    /** @hidden */
    public onExpansionPanelClose(ev) {
        this.onClose.emit(this._bannerEvent);
    }
}
@NgModule({
    declarations: [IgxBannerComponent],
    exports: [IgxBannerComponent],
    imports: [IgxExpansionPanelModule, IgxIconModule, BrowserModule]
})
export class IgxBannerModule { }
