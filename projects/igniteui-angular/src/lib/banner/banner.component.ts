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
    @ViewChild('expansionPanel')
    private _expansionPanel: IgxExpansionPanelComponent;

    @ViewChild('rejectButton')
    private rejectButton;

    @ViewChild('confirmButton')
    private confirmButton;

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

    public useDefaultTemplate: boolean = this.message !== '' && (this.rejectButtonText !== '' || this.confirmButtonText !== '');

    public collapsed = true;

    public open(ev?: BannerEventArgs) {
        this._expansionPanel.expand();
        this.collapsed = false;
    }

    public close(ev?: BannerEventArgs) {
        this._expansionPanel.collapse();
        this.collapsed = true;
    }

    public reject() {
        this.close({ banner: this, button: 'reject' });
    }

    public confirm() {
        this.close({ banner: this, button: 'confirm' });
    }

    public onCollapsed(ev) {
        this.onClose.emit({ banner: this });
    }

    public onExpanded(ev) {
        this.onOpen.emit({ banner: this });
    }
}
@NgModule({
    declarations: [IgxBannerComponent],
    exports: [IgxBannerComponent],
    imports: [IgxExpansionPanelModule, BrowserModule]
})
export class IgxBannerModule {
}

