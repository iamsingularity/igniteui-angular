import { Component, ViewChild, OnInit } from '@angular/core';
import { IgxBannerComponent } from 'igniteui-angular';

@Component({
    selector: 'app-banner-sample',
    templateUrl: `banner.sample.html`
})
export class BannerSampleComponent implements OnInit {
    @ViewChild(IgxBannerComponent) banner: IgxBannerComponent;

    public ngOnInit(): void {
        this.banner.open();
    }

    public toggle() {
        if (this.banner.collapsed) {
            this.banner.open();
        } else {
            this.banner.close();
        }
    }
}
