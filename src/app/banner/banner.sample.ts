import { Component, ViewChild, OnInit } from '@angular/core';
import { IgxBannerComponent } from 'igniteui-angular';

@Component({
    selector: 'app-banner-sample',
    templateUrl: `banner.sample.html`
})
export class BannerSampleComponent implements OnInit {
    @ViewChild('bannerNoSafeConnection') bannerNoSafeConnection: IgxBannerComponent;
    @ViewChild('bannerCookies') bannerCookies: IgxBannerComponent;

    public toggle() {
        if (this.bannerNoSafeConnection.collapsed) {
            this.bannerNoSafeConnection.open();
        } else {
            this.bannerNoSafeConnection.close();
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

    public accept() {
        this.bannerCookies.close();
    }

    public moreInfo() {
        this.bannerCookies.close();
    }

    ngOnInit(): void {
        setInterval(() => {
            if (this.bannerCookies.collapsed) {
                this.bannerCookies.open();
            }
        }, 4000);
    }
}
