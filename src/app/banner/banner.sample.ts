import { Component, ViewChild } from '@angular/core';
import { IgxBannerComponent } from 'igniteui-angular';

@Component({
    selector: 'app-banner-sample',
    templateUrl: `banner.sample.html`
})
export class BannerSampleComponent {
    @ViewChild('banner') banner: IgxBannerComponent;
    @ViewChild('banner2') banner2: IgxBannerComponent;

    public toggle() {
        if (this.banner.collapsed) {
            this.banner.expand();
        } else {
            this.banner.collapse();
        }
    }

    public toggle2() {
        if (this.banner2.collapsed) {
            this.banner2.expand();
        } else {
            this.banner2.collapse();
        }
    }

    public onOpen(ev) {
        console.log('Open', ev);
    }

    public onClose(ev) {
        console.log('Close', ev);
    }

    public onButtonClick(ev) {
        console.log('Button click', ev);
    }
}
