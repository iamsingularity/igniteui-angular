import { Component, OnInit, ViewChild } from '@angular/core';
import { async, TestBed, ComponentFixture, tick, fakeAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
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
                IgxBannerEmptyComponent,
                IgxBannerOneButtonComponent,
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
        it('Should initialize properly banner component with empty template', () => {
            const fixture = TestBed.createComponent(IgxBannerEmptyComponent);
            fixture.detectChanges();
            const banner = fixture.componentInstance.banner;
            expect(fixture.componentInstance).toBeDefined();
            expect(banner).toBeDefined();
            expect(banner.collapsed).toBeTruthy();
            expect(banner.useDefaultTemplate).toBeTruthy();
            expect(banner.message).toBeUndefined();
            expect(banner.icon).toBeUndefined();
            expect(banner.confirmButtonText).toBeUndefined();
            expect(banner.dismissButtonText).toBeUndefined();
        });
        it('Should initialize properly banner component with message and a button', () => {
            const fixture = TestBed.createComponent(IgxBannerOneButtonComponent);
            fixture.detectChanges();
            const banner = fixture.componentInstance.banner;
            expect(fixture.componentInstance).toBeDefined();
            expect(banner).toBeDefined();
            expect(banner.collapsed).toBeTruthy();
            expect(banner.useDefaultTemplate).toBeTruthy();
            expect(banner.message).toBeDefined();
            expect(banner.message).toEqual('You have lost connection to the internet.');
            expect(banner.icon).toBeUndefined();
            expect(banner.confirmButtonText).toBeUndefined();
            expect(banner.dismissButtonText).toBeDefined();
            expect(banner.dismissButtonText).toEqual('TURN ON WIFI');
        });
        it('Should initialize properly banner component with message and buttons', () => {
            const fixture: ComponentFixture<IgxBannerSampleComponent> = TestBed.createComponent(IgxBannerSampleComponent);
            fixture.detectChanges();
            const banner = fixture.componentInstance.banner;
            expect(fixture.componentInstance).toBeDefined();
            expect(banner).toBeDefined();
            expect(banner.collapsed).toBeTruthy();
            expect(banner.useDefaultTemplate).toBeTruthy();
            expect(banner.message).toBeDefined();
            expect(banner.message).toEqual('Unfortunately, the credit card did not go through, please try again.');
            expect(banner.icon).toBeDefined();
            expect(banner.icon).toEqual('error');
            expect(banner.confirmButtonText).toBeDefined();
            expect(banner.confirmButtonText).toEqual('UPDATE');
            expect(banner.dismissButtonText).toBeDefined();
            expect(banner.dismissButtonText).toEqual('DISMISS');
        });
        it('Should properly accept input properties', () => {
            const fixture: ComponentFixture<IgxBannerBasicComponent> = TestBed.createComponent(IgxBannerBasicComponent);
            fixture.detectChanges();
            const banner = fixture.componentInstance.banner;
            expect(fixture.componentInstance).toBeDefined();
            expect(banner).toBeDefined();
            expect(banner.collapsed).toBeTruthy();
            expect(banner.useDefaultTemplate).toBeTruthy();
            expect(banner.message).toBeUndefined();
            expect(banner.icon).toBeUndefined();
            expect(banner.confirmButtonText).toBeUndefined();
            expect(banner.dismissButtonText).toBeUndefined();

            const bannerMsg = 'Your password has expired, please reset your credentials to log in.';
            const dismissText = 'DISMISS';
            const confirmationText = 'RESET';

            banner.message = bannerMsg;
            expect(banner.message).toBeDefined();
            expect(banner.message).toEqual(bannerMsg);
            banner.dismissButtonText = dismissText;
            expect(banner.dismissButtonText).toBeDefined();
            expect(banner.dismissButtonText).toEqual(dismissText);
            banner.confirmButtonText = confirmationText;
            expect(banner.confirmButtonText).toBeDefined();
            expect(banner.confirmButtonText).toEqual(confirmationText);
            banner.icon = 'lock';
            expect(banner.icon).toBeDefined();
            expect(banner.icon).toEqual('lock');
        });
        it('Should properly set base classes', () => {
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
        it('Should dismiss/confirm banner on buton clicking', fakeAsync(() => {
            const fixture: ComponentFixture<IgxBannerSampleComponent> = TestBed.createComponent(IgxBannerSampleComponent);
            fixture.detectChanges();
            const banner = fixture.componentInstance.banner;
            expect(banner.collapsed).toBeTruthy();

            spyOn(banner.onOpen, 'emit');
            spyOn(banner.onClose, 'emit');
            // spyOn(banner.onButtonClick, 'emit');
            spyOn(banner, 'onCollapsed').and.callThrough();
            spyOn(banner, 'onExpanded').and.callThrough();
            spyOn(banner, 'open').and.callThrough();
            spyOn(banner, 'close').and.callThrough();

            banner.open();
            tick();
            fixture.detectChanges();
            expect(banner.open).toHaveBeenCalledTimes(1);
            expect(banner.onOpen.emit).toHaveBeenCalledTimes(1);
            expect(banner.onExpanded).toHaveBeenCalledTimes(1);
            expect(banner.collapsed).toBeFalsy();

            const buttons = fixture.debugElement.nativeElement.querySelectorAll('button');
            buttons[0].click();
            tick();
            fixture.detectChanges();
            // expect(banner.onButtonClick.emit).toHaveBeenCalledTimes(1);
            expect(banner.close).toHaveBeenCalledTimes(1);
            expect(banner.onClose.emit).toHaveBeenCalledTimes(1);
            expect(banner.onCollapsed).toHaveBeenCalledTimes(1);
            expect(banner.collapsed).toBeTruthy();

            banner.open();
            tick();
            fixture.detectChanges();
            expect(banner.open).toHaveBeenCalledTimes(2);
            expect(banner.onOpen.emit).toHaveBeenCalledTimes(2);
            expect(banner.onExpanded).toHaveBeenCalledTimes(2);
            expect(banner.collapsed).toBeFalsy();

            buttons[1].click();
            tick();
            fixture.detectChanges();
            // expect(banner.onButtonClick.emit).toHaveBeenCalledTimes(2);
            // expect(banner.onButtonClick.emit).toHaveBeenCalledWith({});
            expect(banner.close).toHaveBeenCalledTimes(2);
            expect(banner.onClose.emit).toHaveBeenCalledTimes(2);
            expect(banner.onCollapsed).toHaveBeenCalledTimes(2);
            expect(banner.collapsed).toBeTruthy();
        }));
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
<igx-banner></igx-banner>
</div>
`
})
export class IgxBannerEmptyComponent {
    @ViewChild(IgxBannerComponent, { read: IgxBannerComponent })
    public banner: IgxBannerComponent;
}

@Component({
    template: `
<div style = "width:300px">
<igx-banner message="Unfortunately, the credit card did not go through, please try again."></igx-banner>
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
message="You have lost connection to the internet."
dismissButtonText='TURN ON WIFI'>
    </igx-banner>
</div>
`
})
export class IgxBannerOneButtonComponent {
    @ViewChild(IgxBannerComponent, { read: IgxBannerComponent })
    public banner: IgxBannerComponent;
}

@Component({
    template: `
<div style = "width:300px">
<igx-banner
message="Unfortunately, the credit card did not go through, please try again."
dismissButtonText='DISMISS'
confirmButtonText='UPDATE'
icon='error'>
    </igx-banner>
</div>
`
})
export class IgxBannerSampleComponent {
    @ViewChild(IgxBannerComponent, { read: IgxBannerComponent })
    public banner: IgxBannerComponent;
}

