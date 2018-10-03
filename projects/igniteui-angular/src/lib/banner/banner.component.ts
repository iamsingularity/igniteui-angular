import { Component, NgModule } from '@angular/core';
import { IgxExpansionPanelModule } from '../expansion-panel/expansion-panel.module';

@Component({
    selector: 'igx-banner',
    templateUrl: 'banner.component.html'
})
export class IgxBannerComponent {
    public collapsed = true;

    public onCollapsed(ev) { }

    public onExpanded(ev) { }
}
@NgModule({
    declarations: [IgxBannerComponent],
    exports: [IgxBannerComponent],
    imports: [IgxExpansionPanelModule]
})
export class IgxBannerModule {
}
