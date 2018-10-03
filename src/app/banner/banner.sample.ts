import { Component, ViewChild } from '@angular/core';
import { IgxBannerComponent } from 'igniteui-angular';

@Component({
    selector: 'app-banner-sample',
    templateUrl: `banner.sample.html`
})
export class BannerSampleComponent {
    @ViewChild(IgxBannerComponent) banner: IgxBannerComponent;

    public toggle() {
        if (this.banner.collapsed) {
            this.banner.open();
        } else {
            this.banner.close();
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
