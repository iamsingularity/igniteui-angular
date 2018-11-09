import { Component, OnInit, ViewChild, DebugElement } from '@angular/core';
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
import { configureTestSuite } from '../test-utils/configure-suite';

const CSS_CLASS_EXPANSION_PANEL = 'igx-expansion-panel';
const CSS_CLASS_EXPANSION_PANEL_BODY = 'igx-expansion-panel__body';
const CSS_CLASS_BANNER = 'igx-banner';
const CSS_CLASS_BANNER_MESSAGE = 'igx-banner__message';
const CSS_CLASS_BANNER_ILLUSTRATION = 'igx-banner__illustration';
const CSS_CLASS_BANNER_TEXT = 'igx-banner__text';
const CSS_CLASS_BANNER_ACTIONS = 'igx-banner__actions';
const CSS_CLASS_BANNER_ROW = 'igx-banner__row';

describe('igxBanner', () => {
    const bannerElement: DebugElement = null;
    const bannerMessageElement: DebugElement = null;
    const bannerIllustrationElement: DebugElement = null;
    const bannerTextElement: DebugElement = null;
    const bannerActionsElement: DebugElement = null;
    const bannerRowElement: DebugElement = null;

    configureTestSuite();
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxBannerEmptyComponent,
                IgxBannerOneButtonComponent,
                IgxBannerSampleComponent,
                IgxBannerCustomTemplateComponent
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
            const fixture = TestBed.createComponent(IgxBannerCustomTemplateComponent);
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

            banner.expand();
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

        it('Should properly set base classes', fakeAsync(() => {
            const fixture: ComponentFixture<IgxBannerSampleComponent> = TestBed.createComponent(IgxBannerSampleComponent);
            fixture.detectChanges();

            getBaseClassElements(fixture);

            expect(this.bannerElement).toBeNull();
            expect(this.bannerMessageElement).toBeNull();
            expect(this.bannerIllustrationElement).toBeNull();
            expect(this.bannerTextElement).toBeNull();
            expect(this.bannerActionsElement).toBeNull();
            expect(this.bannerRowElement).toBeNull();

            const banner = fixture.componentInstance.banner;
            banner.expand();
            tick();
            fixture.detectChanges();

            getBaseClassElements(fixture);

            expect(this.bannerElement).toBeDefined();
            expect(this.bannerMessageElement).toBeDefined();
            expect(this.bannerIllustrationElement).toBeDefined();
            expect(this.bannerTextElement).toBeDefined();
            expect(this.bannerActionsElement).toBeDefined();
            expect(this.bannerRowElement).toBeDefined();
        }));

        it('Should initialize banner with at least one and up to two buttons', fakeAsync(() => {
            const fixture: ComponentFixture<IgxBannerEmptyComponent> = TestBed.createComponent(IgxBannerEmptyComponent);
            fixture.detectChanges();

            getBaseClassElements(fixture);

            expect(this.bannerElement).toBeNull();
            expect(this.bannerMessageElement).toBeNull();
            expect(this.bannerIllustrationElement).toBeNull();
            expect(this.bannerTextElement).toBeNull();
            expect(this.bannerActionsElement).toBeNull();
            expect(this.bannerRowElement).toBeNull();

            const banner = fixture.componentInstance.banner;
            banner.expand();
            tick();
            fixture.detectChanges();

            getBaseClassElements(fixture);

            expect(this.bannerElement).toBeNull();
            expect(this.bannerMessageElement).toBeNull();
            expect(this.bannerIllustrationElement).toBeNull();
            expect(this.bannerTextElement).toBeNull();
            expect(this.bannerActionsElement).toBeNull();
            expect(this.bannerRowElement).toBeNull();

            banner.collapse();
            tick();
            fixture.detectChanges();

            const bannerMessage = 'Some dummy text for banner message';
            banner.message = bannerMessage;

            banner.expand();
            tick();
            fixture.detectChanges();

            getBaseClassElements(fixture);

            expect(this.bannerElement).toBeNull();
            expect(this.bannerMessageElement).toBeNull();
            expect(this.bannerIllustrationElement).toBeNull();
            expect(this.bannerTextElement).toBeNull();
            expect(this.bannerActionsElement).toBeNull();
            expect(this.bannerRowElement).toBeNull();

            banner.collapse();
            tick();
            fixture.detectChanges();

            const confirmButtonText = 'Confirm';
            banner.confirmButtonText = confirmButtonText;

            banner.expand();
            tick();
            fixture.detectChanges();

            getBaseClassElements(fixture);

            expect(this.bannerElement).not.toBeNull();
            expect(this.bannerMessageElement).not.toBeNull();
            expect(this.bannerIllustrationElement).not.toBeNull();
            expect(this.bannerTextElement).not.toBeNull();
            expect(this.bannerActionsElement).not.toBeNull();
            expect(this.bannerRowElement).not.toBeNull();
        }));

        it('Should position buttons next to the banner content', fakeAsync(() => {
            const fixture: ComponentFixture<IgxBannerSampleComponent> = TestBed.createComponent(IgxBannerSampleComponent);
            fixture.detectChanges();

            const banner: IgxBannerComponent = fixture.componentInstance.banner;
            banner.expand();
            tick();
            fixture.detectChanges();

            getBaseClassElements(fixture);

            const bannerMessageElementTop = this.bannerMessageElement.nativeElement.getClientRects().y;
            const bannerActionsElementTop = this.bannerActionsElement.nativeElement.getClientRects().y;

            expect(bannerMessageElementTop).toBe(bannerActionsElementTop);
        }));

        it('Should span the entire width of the parent element', fakeAsync(() => {
            const fixture: ComponentFixture<IgxBannerOneButtonComponent> = TestBed.createComponent(IgxBannerOneButtonComponent);
            fixture.detectChanges();

            const banner: IgxBannerComponent = fixture.componentInstance.banner;
            banner.expand();
            tick();
            fixture.detectChanges();

            getBaseClassElements(fixture);

            const parentElement = fixture.debugElement.query(By.css('#wrapper'));
            const parentElementRect = parentElement.nativeElement.getBoundingClientRect();

            const bannerElementRect = banner.element.nativeElement.getBoundingClientRect();

            expect(parentElementRect.left).toBe(bannerElementRect.left);
            expect(parentElementRect.top).toBe(bannerElementRect.top);
            expect(parentElementRect.right).toBe(bannerElementRect.right);
            expect(parentElementRect.bottom).toBe(bannerElementRect.bottom);
        }));

        it('Should push parent element content downwards on loading', fakeAsync(() => {
            const fixture: ComponentFixture<IgxBannerSampleComponent> = TestBed.createComponent(IgxBannerSampleComponent);
            fixture.detectChanges();

            let pageContentElement = fixture.debugElement.query(By.css('#content'));
            let pageContentElementTop = pageContentElement.nativeElement.getBoundingClientRect().top;

            const banner: IgxBannerComponent = fixture.componentInstance.banner;
            banner.expand();
            tick();
            fixture.detectChanges();

            const bannerElementRect = banner.element.nativeElement.getBoundingClientRect();
            expect(pageContentElementTop).toBe(bannerElementRect.top);

            pageContentElement = fixture.debugElement.query(By.css('#content'));
            pageContentElementTop = pageContentElement.nativeElement.getBoundingClientRect().top;
            expect(pageContentElementTop).toBe(bannerElementRect.bottom);

            banner.collapse();
            tick();
            fixture.detectChanges();

            pageContentElement = fixture.debugElement.query(By.css('#content'));
            pageContentElementTop = pageContentElement.nativeElement.getBoundingClientRect().top;
            expect(pageContentElementTop).toBe(bannerElementRect.top);
        }));
    });

    describe('Action tests: ', () => {
        it('Should dismiss/confirm banner on button clicking', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxBannerSampleComponent);
            fixture.detectChanges();
            const banner = fixture.componentInstance.banner;
            expect(banner.collapsed).toBeTruthy();

            spyOn(banner.onExpanded, 'emit');
            spyOn(banner.onCollapsed, 'emit');
            spyOn(banner.onButtonClick, 'emit');
            spyOn(banner, 'onExpansionPanelCollapsed').and.callThrough();
            spyOn(banner, 'onExpansionPanelExpanded').and.callThrough();
            spyOn(banner, 'expand').and.callThrough();
            spyOn(banner, 'collapse').and.callThrough();

            banner.expand();
            tick();
            fixture.detectChanges();

            expect(banner.expand).toHaveBeenCalledTimes(1);
            expect(banner.onExpanded.emit).toHaveBeenCalledTimes(1);
            expect(banner.onExpansionPanelExpanded).toHaveBeenCalledTimes(1);
            expect(banner.collapsed).toBeFalsy();

            getBaseClassElements(fixture);

            expect(this.bannerMessageElement).not.toBeNull();
            expect(this.bannerIllustrationElement).not.toBeNull();
            expect(this.bannerTextElement).not.toBeNull();
            expect(this.bannerTextElement.nativeElement.innerHTML.trim()).
                toEqual('Unfortunately, the credit card did not go through, please try again.');
            expect(this.bannerActionsElement).not.toBeNull();

            const buttons = this.bannerActionsElement.nativeElement.querySelectorAll('button');
            expect(buttons.length).toEqual(2);
            buttons[0].click();
            tick();
            fixture.detectChanges();

            getBaseClassElements(fixture);

            expect(banner.onButtonClick.emit).toHaveBeenCalledTimes(1);
            expect(banner.collapse).toHaveBeenCalledTimes(1);
            expect(banner.onCollapsed.emit).toHaveBeenCalledTimes(1);
            expect(banner.onExpansionPanelCollapsed).toHaveBeenCalledTimes(1);
            expect(banner.collapsed).toBeTruthy();
            expect(this.bannerMessageElement).toBeNull();
            expect(this.bannerActionsElement).toBeNull();

            banner.expand();
            tick();
            fixture.detectChanges();

            getBaseClassElements(fixture);

            expect(banner.expand).toHaveBeenCalledTimes(2);
            expect(banner.onExpanded.emit).toHaveBeenCalledTimes(2);
            expect(banner.onExpansionPanelExpanded).toHaveBeenCalledTimes(2);
            expect(banner.collapsed).toBeFalsy();
            expect(this.bannerMessageElement).not.toBeNull();
            expect(this.bannerIllustrationElement).not.toBeNull();
            expect(this.bannerTextElement).not.toBeNull();
            expect(this.bannerTextElement.nativeElement.innerHTML.trim()).
                toEqual('Unfortunately, the credit card did not go through, please try again.');
            expect(this.bannerActionsElement).not.toBeNull();

            buttons[1].click();
            tick();
            fixture.detectChanges();

            getBaseClassElements(fixture);

            expect(banner.onButtonClick.emit).toHaveBeenCalledTimes(2);
            expect(banner.collapse).toHaveBeenCalledTimes(2);
            expect(banner.onCollapsed.emit).toHaveBeenCalledTimes(2);
            expect(banner.onExpansionPanelCollapsed).toHaveBeenCalledTimes(2);
            expect(banner.collapsed).toBeTruthy();
            expect(this.bannerMessageElement).toBeNull();
            expect(this.bannerActionsElement).toBeNull();
        }));
        it('Should not be dismissed on user actions outside the component', () => {
        });
    });

    describe('Rendering tests: ', () => {
        it('Should apply all appropriate classes on initialization_default template', fakeAsync(() => {
        }));
        it('Should apply all appropriate classes on initialization_custom template', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxBannerCustomTemplateComponent);
            fixture.detectChanges();
            const banner = fixture.componentInstance.banner;
            const panel = fixture.nativeElement.querySelector('.' + CSS_CLASS_EXPANSION_PANEL);
            expect(panel).not.toBeNull();
            expect(panel.attributes.getNamedItem('ng-reflect-collapsed').nodeValue).toEqual('true');
            expect(panel.childElementCount).toEqual(0);

            banner.expand();
            tick();
            fixture.detectChanges();
            expect(panel.attributes.getNamedItem('ng-reflect-collapsed').nodeValue).toEqual('false');
            expect(panel.childElementCount).toEqual(1);

            const panelBody = panel.children[0];
            expect(panelBody.attributes.getNamedItem('class').nodeValue).toContain(CSS_CLASS_EXPANSION_PANEL_BODY);
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

    const getBaseClassElements = <T>(fixture: ComponentFixture<T>) => {
        this.bannerElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_BANNER));
        this.bannerMessageElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_BANNER_MESSAGE));
        this.bannerIllustrationElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_BANNER_ILLUSTRATION));
        this.bannerTextElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_BANNER_TEXT));
        this.bannerActionsElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_BANNER_ACTIONS));
        this.bannerRowElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_BANNER_ROW));
    };
});

@Component({
    template: `
        <div id="wrapper" style = "width:900px">
            <igx-banner></igx-banner>
        </div>
        <div id="content" style="height:200px; border: 1px solid red;"> SOME PAGE CONTENT</div>`
})
export class IgxBannerEmptyComponent {
    @ViewChild(IgxBannerComponent, { read: IgxBannerComponent })
    public banner: IgxBannerComponent;
}

@Component({
    template: `
        <div id="wrapper" style = "width:900px;">
            <igx-banner message="You have lost connection to the internet."
            dismissButtonText='TURN ON WIFI'></igx-banner>
        </div>
        <div id="content" style="height:200px; border: 1px solid red;"> SOME PAGE CONTENT</div>`
})
export class IgxBannerOneButtonComponent {
    @ViewChild(IgxBannerComponent, { read: IgxBannerComponent })
    public banner: IgxBannerComponent;
}

@Component({
    template: `
        <div id="wrapper" style = "width:900px">
            <igx-banner
                message="Unfortunately, the credit card did not go through, please try again."
                dismissButtonText='DISMISS'
                confirmButtonText='UPDATE'
                icon='error'>
            </igx-banner>
        </div>
        <div id="content" style="height:200px; border: 1px solid red;"> SOME PAGE CONTENT</div>`
})
export class IgxBannerSampleComponent {
    @ViewChild(IgxBannerComponent, { read: IgxBannerComponent })
    public banner: IgxBannerComponent;
}

@Component({
    template: `
        <div id="wrapper" style = "width:900px">
            <igx-banner>
                <igx-card>
                    <igx-card-header class="compact">
                        <igx-avatar
                            src="https://www.infragistics.com/angular-demos/assets/images/card/avatars/brad_stanley.jpg"
                            roundShape="true">
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
        <div id="content" style="height:200px; border: 1px solid red;"> SOME PAGE CONTENT</div>`
})
export class IgxBannerCustomTemplateComponent {
    @ViewChild(IgxBannerComponent, { read: IgxBannerComponent })
    public banner: IgxBannerComponent;
}
