import { Component, OnInit, ViewChild } from '@angular/core';
import { async, TestBed, ComponentFixture, tick, fakeAsync } from '@angular/core/testing';
import { IgxBannerComponent, IgxBannerModule } from './banner.component';
import { IgxExpansionPanelModule } from '../expansion-panel';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
// import { IgxToggleModule } from '../directives/toggle/toggle.directive';
// import { IgxRippleModule } from '../directives/ripple/ripple.directive';
// import { IgxButtonModule } from '../directives/button/button.directive';

describe('igxBanner', () => {
    beforeEach(async(() => {
        // TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            declarations: [
                IgxBannerBasicComponent,
                IgxBannerSampleComponent,
            ],
            imports: [
                IgxBannerModule,
                IgxExpansionPanelModule,
                NoopAnimationsModule,
                // IgxToggleModule,
                // IgxRippleModule,
                // IgxButtonModule,
                // IgxListModule,
                // IgxGridModule.forRoot()
            ]
        }).compileComponents();
    }));

    describe('General tests: ', () => {
        fit('Should initialize banner component properly', () => {
            const fixture: ComponentFixture<IgxBannerSampleComponent> = TestBed.createComponent(IgxBannerSampleComponent);
            fixture.detectChanges();
            const banner = fixture.componentInstance.banner;
            expect(fixture.componentInstance).toBeDefined();
            expect(banner).toBeDefined();
            expect(banner.message).toEqual('Unfortunately, the credit card did not go through, please try again.');
            expect(banner.icon).toEqual('error');
            expect(banner.confirmButtonText).toEqual('Update');
            expect(banner.rejectButtonText).toEqual('Dismiss');
        });
        it('Should properly accept input properties', () => {
        });
        it('Should properly set base classes', () => {
        });
        it('Should properly emit events', fakeAsync(() => {
        }));
    });

    describe('Template tests: ', () => {
        it('Should initialize banner with default template', () => {
        });
        it('Should be able to add image to text message', () => {
        });
        it('Should initialize banner with at least one and up to two buttons', () => {
        });
        it('Should position buttons under the banner content', () => {
        });
        it('Should be able to create banner with custom template', fakeAsync(() => {
        }));
        it('Should span the entire width of the parent element', () => {
        });
        it('Should push parent element content downwards on loading', () => {
        });
    });

    describe('Action tests: ', () => {
        it('Should dismiss/confirm banner on buton clicking', () => {
        });
        it('Should not be displayed after confirmation/dismissal', () => {
        });
        it('Should not be dismissed on user actions outside the component', () => {
        });
    });

    describe('Rendering tests: ', () => {
        it('Should apply all appropriate classes on initialization_default template', fakeAsync(() => {
        }));
        it('Should apply all appropriate classes on initialization_custom template', fakeAsync(() => {
        }));
    });

});

@Component({
    template: `
<div style = "width:300px">
<igx-banner>
    </igx-banner>
</div>
`
})
export class IgxBannerBasicComponent {
    @ViewChild(IgxBannerComponent, { read: IgxBannerComponent })
    public banner: IgxBannerComponent;
}

@Component({
    template: `
<div style = "width:300px">
<igx-banner
message="Unfortunately, the credit card did not go through, please try again."
rejectButtonText='Dismiss'
confirmButtonText='Update'
icon='error'>
    </igx-banner>
</div>
`
})
export class IgxBannerSampleComponent {
    @ViewChild(IgxBannerComponent, { read: IgxBannerComponent })
    public banner: IgxBannerComponent;
}

