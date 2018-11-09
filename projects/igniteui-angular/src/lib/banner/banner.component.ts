import { Component, NgModule, EventEmitter, Output, Input, ViewChild, ElementRef } from '@angular/core';
import { IgxExpansionPanelModule } from '../expansion-panel/expansion-panel.module';
import { BrowserModule } from '@angular/platform-browser';
import { IgxExpansionPanelComponent } from '../expansion-panel';
import { IgxIconModule } from '../icon/index';

export interface BannerEventArgs {
    banner: IgxBannerComponent;
    button?: string;
}

@Component({
    selector: 'igx-banner',
    templateUrl: 'banner.component.html'
})
export class IgxBannerComponent {
    private _bannerEvent: BannerEventArgs = { banner: null, button: null };

    @ViewChild('expansionPanel')
    private _expansionPanel: IgxExpansionPanelComponent;

    /**
     * Fires after the banner shows up
     */
    @Output()
    public onExpanded = new EventEmitter<BannerEventArgs>();

    /**
     * Fires after the banner hides
     */
    @Output()
    public onCollapsed = new EventEmitter<BannerEventArgs>();

    /**
     * Fires when one click either confirming or dismissive button
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

    /**
     * Hidden
     */
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

    constructor(public element: ElementRef) { }

    /**
     * Opens the banner
     */
    public expand() {
        this._bannerEvent.banner = this;
        this._expansionPanel.expand();
    }

    /**
     * Closes the banner
     */
    public collapse() {
        this._bannerEvent.banner = this;
        this._expansionPanel.collapse();
    }

    /**
     * hidden
     */
    public dismiss() {
        this._bannerEvent.button = 'dismiss';
        this.collapse();
        this.onButtonClick.emit(this._bannerEvent);
    }

    /**
     * hidden
     */
    public confirm() {
        this._bannerEvent.button = 'confirm';
        this.collapse();
        this.onButtonClick.emit(this._bannerEvent);
    }

    /**
     * hidden
     */
    public onExpansionPanelExpanded(ev) {
        this.onExpanded.emit(this._bannerEvent);
        this._bannerEvent.banner = null;
        this._bannerEvent.button = null;
    }

    /**
     * hidden
     */
    public onExpansionPanelCollapsed(ev) {
        this.onCollapsed.emit(this._bannerEvent);
        this._bannerEvent.banner = null;
        this._bannerEvent.button = null;
    }
}
@NgModule({
    declarations: [IgxBannerComponent],
    exports: [IgxBannerComponent],
    imports: [IgxExpansionPanelModule, IgxIconModule, BrowserModule]
})
export class IgxBannerModule {
}
