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
            this.banner.open();
        } else {
            this.banner.close();
        }
    }

    public toggle2() {
        if (this.banner2.collapsed) {
            this.banner2.open();
        } else {
            this.banner2.close();
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
