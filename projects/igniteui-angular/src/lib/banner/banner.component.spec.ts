import { Component, OnInit, ViewChild } from '@angular/core';
import { async, TestBed, ComponentFixture, tick, fakeAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxAvatarModule } from '../avatar/avatar.component';
import { IgxBannerComponent, IgxBannerModule } from './banner.component';
import { IgxCardModule } from '../card/card.component';
import { IgxIconModule } from '../icon';
import { IgxExpansionPanelModule } from '../expansion-panel';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { IgxButtonModule } from '../directives/button/button.directive';

const CSS_CLASS_PANEL = 'igx-expansion-panel';
const CSS_CLASS_PANEL_BODY = 'igx-expansion-panel__body';
const CSS_CLASS_BANNER = 'igx-banner';
const CSS_CLASS_BANNER_MESSAGE = 'igx-banner__message';
const CSS_CLASS_BANNER_ACTIONS = 'igx-banner__actions';
const CSS_CLASS_BANNER_ILLUSTRATION = 'igx-banner__illustration';
const CSS_CLASS_BANNER_TEXT = 'igx-banner__text';

describe('igxBanner', () => {
    beforeEach(async(() => {
        // TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            declarations: [
                IgxBannerBasicComponent,
                IgxBannerEmptyComponent,
                IgxBannerOneButtonComponent,
                IgxBannerSampleComponent,
                IgxCustomBannerComponent
            ],
            imports: [
                IgxBannerModule,
                IgxExpansionPanelModule,
                NoopAnimationsModule,
                IgxRippleModule,
                IgxButtonModule,
                IgxAvatarModule,
                IgxCardModule,
                IgxIconModule
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
            expect(banner.useDefaultTemplate).toBeFalsy()
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

        it('Should initialize properly banner component with custom template', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxCustomBannerComponent);
            fixture.detectChanges();
            const banner = fixture.componentInstance.banner;
            expect(fixture.componentInstance).toBeDefined();
            expect(banner).toBeDefined();
            expect(banner.collapsed).toBeTruthy();
            expect(banner.useDefaultTemplate).toBeFalsy();
            expect(banner.message).toBeUndefined();
            expect(banner.icon).toBeUndefined();
            expect(banner.confirmButtonText).toBeUndefined();
            expect(banner.dismissButtonText).toBeUndefined();

            banner.open();
            tick();
            fixture.detectChanges();
            expect(banner.collapsed).toBeFalsy();
        }));

        it('Should properly accept input properties', () => {
            const fixture: ComponentFixture<IgxBannerEmptyComponent> = TestBed.createComponent(IgxBannerEmptyComponent);
            fixture.detectChanges();
            const banner = fixture.componentInstance.banner;
            expect(fixture.componentInstance).toBeDefined();
            expect(banner).toBeDefined();
            expect(banner.collapsed).toBeTruthy();
            expect(banner.useDefaultTemplate).toBeFalsy();
            expect(banner.message).toBeUndefined();
            expect(banner.icon).toBeUndefined();
            expect(banner.confirmButtonText).toBeUndefined();
            expect(banner.dismissButtonText).toBeUndefined();

            const bannerMsg = 'Your password has expired, please reset your credentials to log in.';
            const dismissText = 'DISMISS';
            const confirmationText = 'RESET';
            const icon = 'lock';

            banner.message = bannerMsg;
            expect(banner.message).toBeDefined();
            expect(banner.message).toEqual(bannerMsg);
            expect(banner.useDefaultTemplate).toBeFalsy();

            banner.dismissButtonText = dismissText;
            expect(banner.dismissButtonText).toBeDefined();
            expect(banner.dismissButtonText).toEqual(dismissText);
            expect(banner.useDefaultTemplate).toBeTruthy();

            banner.confirmButtonText = confirmationText;
            expect(banner.confirmButtonText).toBeDefined();
            expect(banner.confirmButtonText).toEqual(confirmationText);
            expect(banner.useDefaultTemplate).toBeTruthy();

            banner.icon = icon;
            expect(banner.icon).toBeDefined();
            expect(banner.icon).toEqual(icon);
            expect(banner.useDefaultTemplate).toBeTruthy();
        });

        it('Should properly set base classes', () => {
        });

        it('Should initialize banner with at least one and up to two buttons', () => {
        });
        it('Should position buttons under the banner content', () => {
        });
        it('Should span the entire width of the parent element', () => {
        });
        it('Should push parent element content downwards on loading', () => {
        });
    });

    describe('Action tests: ', () => {
        it('Should dismiss/confirm banner on button clicking', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxBannerSampleComponent);
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
            const panel = fixture.debugElement.query(By.css('.' + CSS_CLASS_PANEL)).nativeElement;
            expect(panel.getAttribute('ng-reflect-collapsed')).toBe('false');
            let panelBody = fixture.debugElement.query(By.css('.' + CSS_CLASS_PANEL_BODY));
            expect(panelBody).not.toBeNull();
            let bannerMsg = fixture.debugElement.query(By.css('.' + CSS_CLASS_BANNER_MESSAGE));
            expect(bannerMsg).not.toBeNull();
            let bannerImage = fixture.debugElement.query(By.css('.' + CSS_CLASS_BANNER_ILLUSTRATION));
            expect(bannerImage).not.toBeNull();
            let bannerText = fixture.debugElement.query(By.css('.' + CSS_CLASS_BANNER_TEXT));
            expect(bannerText).not.toBeNull();
            expect(bannerText.nativeElement.innerHTML.trim()).
                toEqual('Unfortunately, the credit card did not go through, please try again.');
            let bannerActions = fixture.debugElement.query(By.css('.' + CSS_CLASS_BANNER_ACTIONS));
            expect(bannerActions).not.toBeNull();

            const buttons = bannerActions.nativeElement.querySelectorAll('button');
            expect(buttons.length).toEqual(2);
            buttons[0].click();
            tick();
            fixture.detectChanges();
            // expect(banner.onButtonClick.emit).toHaveBeenCalledTimes(1);
            expect(banner.close).toHaveBeenCalledTimes(1);
            expect(banner.onClose.emit).toHaveBeenCalledTimes(1);
            expect(banner.onCollapsed).toHaveBeenCalledTimes(1);
            expect(banner.collapsed).toBeTruthy();
            expect(panel.getAttribute('ng-reflect-collapsed')).toBe('true');
            panelBody = fixture.debugElement.query(By.css('.' + CSS_CLASS_PANEL_BODY));
            expect(panelBody).toBeNull();
            bannerMsg = fixture.debugElement.query(By.css('.' + CSS_CLASS_BANNER_MESSAGE));
            expect(bannerMsg).toBeNull();
            bannerActions = fixture.debugElement.query(By.css('.' + CSS_CLASS_BANNER_ACTIONS));
            expect(bannerActions).toBeNull();

            banner.open();
            tick();
            fixture.detectChanges();
            expect(banner.open).toHaveBeenCalledTimes(2);
            expect(banner.onOpen.emit).toHaveBeenCalledTimes(2);
            expect(banner.onExpanded).toHaveBeenCalledTimes(2);
            expect(banner.collapsed).toBeFalsy();
            expect(panel.getAttribute('ng-reflect-collapsed')).toBe('false');
            panelBody = fixture.debugElement.query(By.css('.' + CSS_CLASS_PANEL_BODY));
            expect(panelBody).not.toBeNull();
            bannerMsg = fixture.debugElement.query(By.css('.' + CSS_CLASS_BANNER_MESSAGE));
            expect(bannerMsg).not.toBeNull();
            bannerImage = fixture.debugElement.query(By.css('.' + CSS_CLASS_BANNER_ILLUSTRATION));
            expect(bannerImage).not.toBeNull();
            bannerText = fixture.debugElement.query(By.css('.' + CSS_CLASS_BANNER_TEXT));
            expect(bannerText).not.toBeNull();
            expect(bannerText.nativeElement.innerHTML.trim()).
                toEqual('Unfortunately, the credit card did not go through, please try again.');
            bannerActions = fixture.debugElement.query(By.css('.' + CSS_CLASS_BANNER_ACTIONS));
            expect(bannerActions).not.toBeNull();

            buttons[1].click();
            tick();
            fixture.detectChanges();
            // expect(banner.onButtonClick.emit).toHaveBeenCalledTimes(2);
            // expect(banner.onButtonClick.emit).toHaveBeenCalledWith({});
            expect(banner.close).toHaveBeenCalledTimes(2);
            expect(banner.onClose.emit).toHaveBeenCalledTimes(2);
            expect(banner.onCollapsed).toHaveBeenCalledTimes(2);
            expect(banner.collapsed).toBeTruthy();
            expect(panel.getAttribute('ng-reflect-collapsed')).toBe('true');
            panelBody = fixture.debugElement.query(By.css('.' + CSS_CLASS_PANEL_BODY));
            expect(panelBody).toBeNull();
            bannerMsg = fixture.debugElement.query(By.css('.' + CSS_CLASS_BANNER_MESSAGE));
            expect(bannerMsg).toBeNull();
            bannerActions = fixture.debugElement.query(By.css('.' + CSS_CLASS_BANNER_ACTIONS));
            expect(bannerActions).toBeNull();
        }));
        it('Should not be dismissed on user actions outside the component', () => {
        });
    });

    describe('Rendering tests: ', () => {
        it('Should apply all appropriate classes on initialization_default template', fakeAsync(() => {
        }));
        it('Should apply all appropriate classes on initialization_custom template', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxCustomBannerComponent);
            fixture.detectChanges();
            const banner = fixture.componentInstance.banner;
            const panel = fixture.nativeElement.querySelector('.' + CSS_CLASS_PANEL);
            expect(panel).not.toBeNull();
            expect(panel.attributes.getNamedItem('ng-reflect-collapsed').nodeValue).toEqual('true');
            expect(panel.childElementCount).toEqual(0);

            banner.open();
            tick();
            fixture.detectChanges();
            expect(panel.attributes.getNamedItem('ng-reflect-collapsed').nodeValue).toEqual('false');
            expect(panel.childElementCount).toEqual(1);

            const panelBody = panel.children[0];
            expect(panelBody.attributes.getNamedItem('class').nodeValue).toContain(CSS_CLASS_PANEL_BODY);
            expect(panelBody.attributes.getNamedItem('role').nodeValue).toEqual('region');
            expect(panelBody.childElementCount).toEqual(1);

            const card = panelBody.children[0].firstElementChild;
            expect(card.attributes.getNamedItem('class').nodeValue).toContain('igx-card');
            expect(card.attributes.getNamedItem('role').nodeValue).toEqual('group');
            expect(card.childElementCount).toEqual(3);

            const cardHeader = card.children[0];
            expect(cardHeader.childElementCount).toEqual(2);

            const avatar = cardHeader.children[0];
            expect(avatar.attributes.getNamedItem('class').nodeValue).toContain('igx-avatar');
            expect(avatar.attributes.getNamedItem('class').nodeValue).toContain('igx-avatar--rounded');
            expect(avatar.attributes.getNamedItem('class').nodeValue).toContain('igx-avatar--small');
            expect(avatar.attributes.getNamedItem('role').nodeValue).toEqual('img');
            expect(avatar.attributes.getNamedItem('aria-label').nodeValue).toEqual('avatar');
            expect(avatar.childElementCount).toEqual(1);

            const avatarImage = avatar.children[0];
            expect(avatarImage.attributes.getNamedItem('class').nodeValue).toContain('igx-avatar__image');
            expect(avatarImage.childElementCount).toEqual(0);

            const headerGroup = cardHeader.children[1];
            expect(headerGroup.attributes.getNamedItem('class').nodeValue).toContain('igx-card-header__tgroup');
            expect(headerGroup.childElementCount).toEqual(2);

            const headerTitle = headerGroup.children[0];
            expect(headerTitle.attributes.getNamedItem('class').nodeValue).toContain('igx-card-header__title--small');
            expect(headerTitle.innerHTML).toEqual('Brad Stanley');
            expect(headerTitle.childElementCount).toEqual(0);

            const headerSubtitle = headerGroup.children[1];
            expect(headerSubtitle.attributes.getNamedItem('class').nodeValue).toContain('igx-card-header__subtitle');
            expect(headerSubtitle.innerHTML).toEqual('Audi AG');
            expect(headerSubtitle.childElementCount).toEqual(0);

            const cardContent = card.children[1].firstElementChild;
            expect(cardContent.attributes.getNamedItem('class').nodeValue).toContain('igx-card-content__text');
            expect(cardContent.innerHTML).toEqual('Brad Stanley has requested to follow you.');
            expect(cardContent.childElementCount).toEqual(0);

            const cardActions = card.children[2];
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
    <igx-banner message="You have lost connection to the internet." dismissButtonText='TURN ON WIFI'></igx-banner>
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

@Component({
    template: `
<div style = "width:300px">
    <igx-banner>
        <igx-card>
            <igx-card-header class="compact">
                <igx-avatar src="https://www.infragistics.com/angular-demos/assets/images/card/avatars/brad_stanley.jpg" roundShape="true">
                </igx-avatar>
                <div class="igx-card-header__tgroup">
                    <h3 class="igx-card-header__title--small">Brad Stanley</h3>
                    <h5 class="igx-card-header__subtitle">Audi AG</h5>
                </div>
            </igx-card-header>
            <igx-card-content>
                <p class="igx-card-content__text">Brad Stanley has requested to follow you.</p>
            </igx-card-content>
            <igx-card-actions >
                <button igxButton igxRipple >Dismiss</button>
                <button igxButton igxRipple >Approve</button>
            </igx-card-actions>
        </igx-card>
    </igx-banner>
</div>
`
})
export class IgxCustomBannerComponent {
    @ViewChild(IgxBannerComponent, { read: IgxBannerComponent })
    public banner: IgxBannerComponent;
}
