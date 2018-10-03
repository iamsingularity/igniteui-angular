import { Component, NgModule, EventEmitter, Output, Input, ViewChild } from '@angular/core';
import { IgxExpansionPanelModule } from '../expansion-panel/expansion-panel.module';
import { BrowserModule } from '@angular/platform-browser';
import { IgxExpansionPanelComponent } from '../expansion-panel';

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

    @Output()
    public onOpen = new EventEmitter<BannerEventArgs>();

    @Output()
    public onClose = new EventEmitter<BannerEventArgs>();

    @Output()
    public onButtonClick = new EventEmitter<BannerEventArgs>();

    @Input()
    public message: string;

    @Input()
    public confirmButtonText: string;

    @Input()
    public rejectButtonText: string;

    @Input()
    public get useDefaultTemplate(): boolean {
        return this.message !== '' && (this.rejectButtonText !== '' || this.confirmButtonText !== '');
    }

    public get collapsed() {
        return this._expansionPanel.collapsed;
    }

    public open() {
        this._bannerEvent.banner = this;
        this._expansionPanel.expand();
    }

    public close() {
        this._bannerEvent.banner = this;
        this._expansionPanel.collapse();
    }

    public reject() {
        this._bannerEvent.button = 'reject';
        this.close();
    }

    public confirm() {
        this._bannerEvent.button = 'confirm';
        this.close();
    }

    public onExpanded(ev) {
        this.onOpen.emit(this._bannerEvent);
        this._bannerEvent.banner = null;
        this._bannerEvent.button = null;
    }

    public onCollapsed(ev) {
        this.onClose.emit(this._bannerEvent);
        this._bannerEvent.banner = null;
        this._bannerEvent.button = null;
    }
}
@NgModule({
    declarations: [IgxBannerComponent],
    exports: [IgxBannerComponent],
    imports: [IgxExpansionPanelModule, BrowserModule]
})
export class IgxBannerModule {
}
