
import { Component, ViewChild } from '@angular/core';
import { async, TestBed, ComponentFixture, tick, fakeAsync, flush } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxToggleModule } from '../directives/toggle/toggle.directive';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxExpansionPanelComponent } from './expansion-panel.component';
import { ICON_POSITION, IgxExpansionPanelHeaderComponent } from './expansion-panel-header.component';
import { IgxExpansionPanelModule } from './expansion-panel.module';
import { IgxGridComponent, IgxGridModule } from '../grids/grid/index';
import { IgxListModule } from '../list';
import { IgxExpansionPanelTitleDirective } from './expansion-panel.directives';
import { configureTestSuite } from '../test-utils/configure-suite';

const CSS_CLASS_EXPANSION_PANEL = 'igx-expansion-panel';
const CSS_CLASS_PANEL_HEADER = 'igx-expansion-panel__header';
const CSS_CLASS_PANEL_BODY = 'igx-expansion-panel-body';
const CSS_CLASS_HEADER_EXPANDED = 'igx-expansion-panel__header--expanded';
const CSS_CLASS_PANEL_ICON = 'igx-icon';
const CSS_CLASS_LIST = 'igx-list';
const CSS_CLASS_GRID = 'igx-grid';
const enum IconPositionClass {
    LEFT = 'igx-expansion-panel__header-icon--start',
    RIGHT = 'igx-expansion-panel__header-icon--end',
    NONE = 'igx-expansion-panel__header-icon--none',
}

describe('igxExpansionPanel', () => {
    configureTestSuite();
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxExpansionPanelGridComponent,
                IgxExpansionPanelListComponent,
                IgxExpansionPanelSampleComponent,
                IgxExpansionPanelImageComponent
            ],
            imports: [
                IgxExpansionPanelModule,
                NoopAnimationsModule,
                IgxToggleModule,
                IgxRippleModule,
                IgxButtonModule,
                IgxListModule,
                IgxGridModule.forRoot()
            ]
        }).compileComponents();
    }));


    describe('General tests: ', () => {
        configureTestSuite();
        it('Should initialize the expansion panel component properly', () => {
            const fixture: ComponentFixture<IgxExpansionPanelListComponent> = TestBed.createComponent(IgxExpansionPanelListComponent);
            fixture.detectChanges();
            const panel = fixture.componentInstance.expansionPanel;
            const header = fixture.componentInstance.header;
            expect(fixture.componentInstance).toBeDefined();
            expect(panel).toBeDefined();
            // expect(panel.toggleBtn).toBeDefined();
            expect(header.disabled).toBeDefined();
            expect(header.disabled).toEqual(false);
            // expect(panel.ariaLabelledBy).toBeDefined();
            // expect(panel.ariaLabelledBy).toEqual('');
            expect(panel.animationSettings).toBeDefined();
            expect(panel.collapsed).toBeDefined();
            expect(panel.collapsed).toBeTruthy();
            panel.toggle();
            fixture.detectChanges();
            expect(panel.collapsed).toEqual(false);
        });
        it('Should properly accept input properties', () => {
            const fixture = TestBed.createComponent(IgxExpansionPanelListComponent);
            fixture.detectChanges();
            const panel = fixture.componentInstance.expansionPanel;
            // expect(panel.disabled).toEqual(false);
            // expect(panel.collapsed).toEqual(true);
            // // expect(panel.ariaLabelledBy).toEqual('');
            // panel.disabled = true;
            // expect(panel.disabled).toEqual(true);
            panel.collapsed = false;
            expect(panel.collapsed).toEqual(false);
            // panel.labelledby = 'test label area';
            // expect(panel.labelledby).toEqual('test label area');
        });
        it('Should properly set base classes', () => {
            const fixture = TestBed.createComponent(IgxExpansionPanelListComponent);
            fixture.detectChanges();
            const header = document.getElementsByClassName(CSS_CLASS_PANEL_HEADER);
            const headerExpanded = document.getElementsByClassName(CSS_CLASS_HEADER_EXPANDED);
            const panelClass = document.getElementsByClassName(CSS_CLASS_EXPANSION_PANEL);
            expect(header.length).toEqual(1);
            expect(headerExpanded.length).toEqual(0);
            expect(panelClass.length).toEqual(1);
        });

        it('Should properly emit events', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxExpansionPanelSampleComponent);
            fixture.detectChanges();
            const panel = fixture.componentInstance.panel;
            const header = fixture.componentInstance.header;
            const mockEvent = new Event('click');
            expect(panel).toBeTruthy();
            expect(header).toBeTruthy();
            expect(header.disabled).toEqual(false);
            expect(header.panel).toEqual(panel);
            expect(header.onInteraction).toBeDefined();

            spyOn(panel.onCollapsed, 'emit');
            spyOn(panel.onExpanded, 'emit');
            spyOn(header.onInteraction, 'emit');
            spyOn(panel, 'toggle').and.callThrough();
            spyOn(panel, 'expand').and.callThrough();
            spyOn(panel, 'collapse').and.callThrough();

            header.onAction(mockEvent);
            tick();
            fixture.detectChanges();
            expect(panel.onCollapsed.emit).toHaveBeenCalledTimes(0); // Initially collapsed
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(1);
            expect(panel.toggle).toHaveBeenCalledTimes(1);
            expect(panel.toggle).toHaveBeenCalledWith(mockEvent);
            expect(panel.expand).toHaveBeenCalledTimes(1);
            expect(panel.expand).toHaveBeenCalledWith(mockEvent);
            expect(panel.collapse).toHaveBeenCalledTimes(0);
            expect(panel.onExpanded.emit).toHaveBeenCalledTimes(1);
            expect(header.onInteraction.emit).toHaveBeenCalledWith({ event: mockEvent, panel: header.panel });

            header.onAction(mockEvent);
            tick();
            fixture.detectChanges();
            expect(panel.onCollapsed.emit).toHaveBeenCalledTimes(1); // First Collapse
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(2);
            expect(panel.toggle).toHaveBeenCalledTimes(2);
            expect(panel.toggle).toHaveBeenCalledWith(mockEvent);
            expect(panel.expand).toHaveBeenCalledTimes(1);
            expect(panel.collapse).toHaveBeenCalledTimes(1);
            expect(panel.collapse).toHaveBeenCalledWith(mockEvent);
            expect(panel.onCollapsed.emit).toHaveBeenCalledTimes(1);

            header.disabled = true;
            header.onAction(mockEvent);
            tick();
            fixture.detectChanges();

            // No additional calls, because panel.disabled === true
            expect(panel.onCollapsed.emit).toHaveBeenCalledTimes(1);
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(2);
            expect(panel.onExpanded.emit).toHaveBeenCalledTimes(1);
        }));
    });

    describe('Expansion tests: ', () => {
        configureTestSuite();
        function verifyPanelExpansionState(
            collapsed: boolean,
            panel: IgxExpansionPanelComponent,
            panelContainer: any,
            panelHeader: HTMLElement,
            button: HTMLElement,
            timesCollapsed: number = 0,
            timesExpanded: number = 0) {
            expect(panel.collapsed).toEqual(collapsed);
            const ariaExpanded = collapsed ? 'false' : 'true';
            expect(panelHeader.querySelector('div [role = \'button\']').getAttribute('aria-expanded')).toMatch(ariaExpanded);
            expect(panelHeader.classList.contains(CSS_CLASS_HEADER_EXPANDED)).toEqual(!collapsed);
            if (button.children.length > 1) {
                const iconName = collapsed ? 'expand_more' : 'expand_less';
                expect(button.getAttribute('ng-reflect-icon-name')).toMatch(iconName);
            }
            if (collapsed) {
                expect(panelContainer.lastElementChild.nodeName).toEqual('IGX-EXPANSION-PANEL-HEADER');
            } else {
                const panelBody = panelContainer.getElementsByTagName(CSS_CLASS_PANEL_BODY)[0];
                expect(panelBody).toBeDefined();
                const list = panelBody.getElementsByTagName(CSS_CLASS_LIST)[0];
                expect(list).toBeDefined();
            }
            expect(panel.onExpanded.emit).toHaveBeenCalledTimes(timesExpanded);
            expect(panel.onCollapsed.emit).toHaveBeenCalledTimes(timesCollapsed);
        }
        it('Should change panel expansion state on header interaction', fakeAsync(() => {
            const fixture: ComponentFixture<IgxExpansionPanelListComponent> = TestBed.createComponent(IgxExpansionPanelListComponent);
            fixture.detectChanges();
            const panel = fixture.componentInstance.expansionPanel;
            const header = fixture.componentInstance.header;
            const panelContainer = fixture.nativeElement.querySelector('.' + CSS_CLASS_EXPANSION_PANEL);
            const panelHeader = fixture.nativeElement.querySelector('.' + CSS_CLASS_PANEL_HEADER) as HTMLElement;
            const button = fixture.nativeElement.querySelector('.' + CSS_CLASS_PANEL_ICON) as HTMLElement;

            let timesCollapsed = 0;
            let timesExpanded = 0;
            spyOn(panel.onCollapsed, 'emit').and.callThrough();
            spyOn(panel.onExpanded, 'emit').and.callThrough();
            spyOn(header.onInteraction, 'emit');
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);

            panelHeader.click();
            tick();
            fixture.detectChanges();
            tick();
            timesExpanded++;
            verifyPanelExpansionState(false, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(1);

            panelHeader.click();
            tick();
            fixture.detectChanges();
            tick();
            timesCollapsed++;
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(2);

            panelHeader.click();
            tick();
            fixture.detectChanges();
            tick();
            timesExpanded++;
            verifyPanelExpansionState(false, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(3);

            // Remove expand/collapse button
            header.iconPosition = ICON_POSITION.NONE;
            tick();
            fixture.detectChanges();
            tick();
            panelHeader.click();
            tick();
            fixture.detectChanges();
            tick();
            timesCollapsed++;
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(4);

            panelHeader.click();
            tick();
            fixture.detectChanges();
            tick();
            timesExpanded++;
            verifyPanelExpansionState(false, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(5);
        }));
        it('Should change panel expansion state on button clicking', fakeAsync(() => {
            const fixture: ComponentFixture<IgxExpansionPanelListComponent> = TestBed.createComponent(IgxExpansionPanelListComponent);
            fixture.detectChanges();
            const panel = fixture.componentInstance.expansionPanel;
            const header = fixture.componentInstance.header;
            const panelContainer = fixture.nativeElement.querySelector('.' + CSS_CLASS_EXPANSION_PANEL);
            const panelHeader = fixture.nativeElement.querySelector('.' + CSS_CLASS_PANEL_HEADER) as HTMLElement;
            let button = fixture.nativeElement.querySelector('.' + CSS_CLASS_PANEL_ICON) as HTMLElement;

            let timesCollapsed = 0;
            let timesExpanded = 0;
            spyOn(panel.onCollapsed, 'emit').and.callThrough();
            spyOn(panel.onExpanded, 'emit').and.callThrough();
            spyOn(header.onInteraction, 'emit');
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);

            button.click();
            tick();
            fixture.detectChanges();
            tick();
            timesExpanded++;
            verifyPanelExpansionState(false, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(1);

            button.click();
            tick();
            fixture.detectChanges();
            tick();
            timesCollapsed++;
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(2);

            button.click();
            tick();
            fixture.detectChanges();
            tick();
            timesExpanded++;
            verifyPanelExpansionState(false, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(3);

            // Change expand/collapse button position
            header.iconPosition = ICON_POSITION.RIGHT;
            tick();
            fixture.detectChanges();
            tick();

            button = fixture.nativeElement.querySelector('.' + CSS_CLASS_PANEL_ICON) as HTMLElement;
            button.click();
            tick();
            fixture.detectChanges();
            tick();
            timesCollapsed++;
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(4);

            button.click();
            tick();
            fixture.detectChanges();
            tick();
            timesExpanded++;
            verifyPanelExpansionState(false, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(5);

            button.click();
            tick();
            fixture.detectChanges();
            tick();
            timesCollapsed++;
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(6);
        }));
        it('Should change panel expansion state on collapsed property setting', fakeAsync(() => {
            const fixture: ComponentFixture<IgxExpansionPanelListComponent> = TestBed.createComponent(IgxExpansionPanelListComponent);
            fixture.detectChanges();
            const panel = fixture.componentInstance.expansionPanel;
            const panelContainer = fixture.nativeElement.querySelector('.' + CSS_CLASS_EXPANSION_PANEL);
            const panelHeader = fixture.nativeElement.querySelector('.' + CSS_CLASS_PANEL_HEADER) as HTMLElement;
            const button = fixture.nativeElement.querySelector('.' + CSS_CLASS_PANEL_ICON) as HTMLElement;
            spyOn(panel.onCollapsed, 'emit').and.callThrough();
            spyOn(panel.onExpanded, 'emit').and.callThrough();
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button);

            panel.collapsed = false;
            tick();
            fixture.detectChanges();
            tick();
            verifyPanelExpansionState(false, panel, panelContainer, panelHeader, button);

            panel.collapsed = true;
            tick();
            fixture.detectChanges();
            tick();
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button);

            panel.collapsed = false;
            tick();
            fixture.detectChanges();
            tick();
            verifyPanelExpansionState(false, panel, panelContainer, panelHeader, button);
        }));
        it('Should change panel expansion state using API methods', fakeAsync(() => {
            const fixture: ComponentFixture<IgxExpansionPanelListComponent> = TestBed.createComponent(IgxExpansionPanelListComponent);
            fixture.detectChanges();
            const panel = fixture.componentInstance.expansionPanel;
            const panelContainer = fixture.nativeElement.querySelector('.' + CSS_CLASS_EXPANSION_PANEL);
            const panelHeader = fixture.nativeElement.querySelector('.' + CSS_CLASS_PANEL_HEADER) as HTMLElement;
            const button = fixture.nativeElement.querySelector('.' + CSS_CLASS_PANEL_ICON) as HTMLElement;

            let timesCollapsed = 0;
            let timesExpanded = 0;
            spyOn(panel.onCollapsed, 'emit').and.callThrough();
            spyOn(panel.onExpanded, 'emit').and.callThrough();
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);

            panel.expand();
            tick();
            fixture.detectChanges();
            tick();
            timesExpanded++;
            verifyPanelExpansionState(false, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);

            panel.collapse();
            tick();
            fixture.detectChanges();
            tick();
            timesCollapsed++;
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);

            panel.expand();
            tick();
            fixture.detectChanges();
            tick();
            timesExpanded++;
            verifyPanelExpansionState(false, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);

            panel.collapse();
            tick();
            fixture.detectChanges();
            tick();
            timesCollapsed++;
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
        }));
        it('Should change panel expansion state using toggle method', fakeAsync(() => {
            const fixture: ComponentFixture<IgxExpansionPanelListComponent> = TestBed.createComponent(IgxExpansionPanelListComponent);
            fixture.detectChanges();
            const panel = fixture.componentInstance.expansionPanel;
            const panelContainer = fixture.nativeElement.querySelector('.' + CSS_CLASS_EXPANSION_PANEL);
            const panelHeader = fixture.nativeElement.querySelector('.' + CSS_CLASS_PANEL_HEADER) as HTMLElement;
            const button = fixture.nativeElement.querySelector('.' + CSS_CLASS_PANEL_ICON) as HTMLElement;

            let timesCollapsed = 0;
            let timesExpanded = 0;
            spyOn(panel.onCollapsed, 'emit').and.callThrough();
            spyOn(panel.onExpanded, 'emit').and.callThrough();
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);

            panel.toggle();
            tick();
            fixture.detectChanges();
            tick();
            timesExpanded++;
            verifyPanelExpansionState(false, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);

            panel.toggle();
            tick();
            fixture.detectChanges();
            tick();
            timesCollapsed++;
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);

            panel.toggle();
            tick();
            fixture.detectChanges();
            tick();
            timesExpanded++;
            verifyPanelExpansionState(false, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);

            panel.toggle();
            tick();
            fixture.detectChanges();
            tick();
            timesCollapsed++;
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
        }));
        it('Should change panel expansion state on key interaction', fakeAsync(() => {
            const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
            const spaceEvent = new KeyboardEvent('keydown', { key: 'Space' });
            const fixture: ComponentFixture<IgxExpansionPanelListComponent> = TestBed.createComponent(IgxExpansionPanelListComponent);
            fixture.detectChanges();
            const panel = fixture.componentInstance.expansionPanel;
            const header = fixture.componentInstance.header;
            const panelContainer = fixture.nativeElement.querySelector('.' + CSS_CLASS_EXPANSION_PANEL);
            const panelHeader = fixture.nativeElement.querySelector('.' + CSS_CLASS_PANEL_HEADER) as HTMLElement;
            const button = fixture.nativeElement.querySelector('.' + CSS_CLASS_PANEL_ICON) as HTMLElement;

            let timesCollapsed = 0;
            let timesExpanded = 0;
            spyOn(panel.onCollapsed, 'emit').and.callThrough();
            spyOn(panel.onExpanded, 'emit').and.callThrough();
            spyOn(header.onInteraction, 'emit');
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);

            panelHeader.dispatchEvent(enterEvent);
            tick();
            fixture.detectChanges();
            tick();
            timesExpanded++;
            verifyPanelExpansionState(false, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(1);

            panelHeader.dispatchEvent(spaceEvent);
            tick();
            fixture.detectChanges();
            tick();
            timesCollapsed++;
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(2);

            panelHeader.dispatchEvent(enterEvent);
            tick();
            fixture.detectChanges();
            tick();
            timesExpanded++;
            verifyPanelExpansionState(false, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(3);

            panelHeader.dispatchEvent(spaceEvent);
            tick();
            fixture.detectChanges();
            tick();
            timesCollapsed++;
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(4);
        }));
        it('Should change panel expansion when using different methods', fakeAsync(() => {
            const fixture: ComponentFixture<IgxExpansionPanelListComponent> = TestBed.createComponent(IgxExpansionPanelListComponent);
            fixture.detectChanges();
            const panel = fixture.componentInstance.expansionPanel;
            const header = fixture.componentInstance.header;
            const panelContainer = fixture.nativeElement.querySelector('.' + CSS_CLASS_EXPANSION_PANEL);
            const panelHeader = fixture.nativeElement.querySelector('.' + CSS_CLASS_PANEL_HEADER) as HTMLElement;
            const button = fixture.nativeElement.querySelector('.' + CSS_CLASS_PANEL_ICON) as HTMLElement;

            let timesCollapsed = 0;
            let timesExpanded = 0;
            spyOn(panel.onCollapsed, 'emit').and.callThrough();
            spyOn(panel.onExpanded, 'emit').and.callThrough();
            spyOn(header.onInteraction, 'emit');
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);

            panel.expand();
            tick();
            fixture.detectChanges();
            tick();
            timesExpanded++;
            verifyPanelExpansionState(false, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);

            panelHeader.click();
            tick();
            fixture.detectChanges();
            tick();
            timesCollapsed++;
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(1);

            button.click();
            tick();
            fixture.detectChanges();
            tick();
            timesExpanded++;
            verifyPanelExpansionState(false, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(2);

            panelHeader.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
            tick();
            fixture.detectChanges();
            tick();
            timesCollapsed++;
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(3);

            panel.collapsed = false;
            tick();
            fixture.detectChanges();
            tick();
            verifyPanelExpansionState(false, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);

            panel.toggle();
            tick();
            fixture.detectChanges();
            tick();
            timesCollapsed++;
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);

            panelHeader.dispatchEvent(new KeyboardEvent('keydown', { key: 'Space' }));
            tick();
            fixture.detectChanges();
            tick();
            timesExpanded++;
            verifyPanelExpansionState(false, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(4);

            panel.collapse();
            tick();
            fixture.detectChanges();
            tick();
            timesCollapsed++;
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
        }));
        it('Should not be interactable when disabled', fakeAsync(() => {
            const fixture: ComponentFixture<IgxExpansionPanelListComponent> = TestBed.createComponent(IgxExpansionPanelListComponent);
            fixture.detectChanges();
            const panel = fixture.componentInstance.expansionPanel;
            const header = fixture.componentInstance.header;
            const panelContainer = fixture.nativeElement.querySelector('.' + CSS_CLASS_EXPANSION_PANEL);
            const panelHeader = fixture.nativeElement.querySelector('.' + CSS_CLASS_PANEL_HEADER) as HTMLElement;
            const button = fixture.nativeElement.querySelector('.' + CSS_CLASS_PANEL_ICON) as HTMLElement;
            const headerButton = panelHeader.querySelector('div [role = \'button\']');

            let timesCollapsed = 0;
            const timesExpanded = 1;
            spyOn(panel.onCollapsed, 'emit').and.callThrough();
            spyOn(panel.onExpanded, 'emit').and.callThrough();
            spyOn(header.onInteraction, 'emit');

            panel.expand();
            tick();
            fixture.detectChanges();
            tick();
            expect(headerButton.getAttribute('aria-disabled')).toMatch('false');
            verifyPanelExpansionState(false, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);

            header.disabled = true;
            tick();
            fixture.detectChanges();
            tick();
            expect(headerButton.getAttribute('aria-disabled')).toMatch('true');

            panelHeader.click();
            tick();
            fixture.detectChanges();
            tick();
            verifyPanelExpansionState(false, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(0);

            button.click();
            tick();
            fixture.detectChanges();
            tick();
            verifyPanelExpansionState(false, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(0);

            panelHeader.dispatchEvent(new KeyboardEvent('keydown', { key: 'Space' }));
            tick();
            fixture.detectChanges();
            tick();
            verifyPanelExpansionState(false, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(0);

            panel.toggle();
            tick();
            fixture.detectChanges();
            tick();
            expect(headerButton.getAttribute('aria-disabled')).toMatch('true');
            timesCollapsed++;
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);

            panelHeader.click();
            tick();
            fixture.detectChanges();
            tick();
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(0);

            button.click();
            tick();
            fixture.detectChanges();
            tick();
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(0);

            panelHeader.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
            tick();
            fixture.detectChanges();
            tick();
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(0);

            header.disabled = false;
            tick();
            fixture.detectChanges();
            tick();
            expect(headerButton.getAttribute('aria-disabled')).toMatch('false');
        }));
        xit('Should display expand/collapse button according to its position', () => {
            const fixture: ComponentFixture<IgxExpansionPanelListComponent> = TestBed.createComponent(IgxExpansionPanelListComponent);
            fixture.detectChanges();
            const header = fixture.componentInstance.header;
            const panelHeader = fixture.nativeElement.querySelector('.' + CSS_CLASS_PANEL_HEADER) as HTMLElement;
            const headerButton = panelHeader.querySelector('div [role = \'button\']');

            expect(header.iconPosition).toEqual('left');
            expect(headerButton.children[0].nodeName).toEqual('IGX-ICON');
            expect(headerButton.children[1].nodeName).toEqual('IGX-EXPANSION-PANEL-TITLE');
            expect(headerButton.children[0].getBoundingClientRect().left).
                toBeLessThan(headerButton.children[1].getBoundingClientRect().left);

            header.iconPosition = ICON_POSITION.NONE;
            fixture.detectChanges();
            expect(header.iconPosition).toEqual('none');
            expect(headerButton.children.length).toEqual(1);
            expect(headerButton.children[0].nodeName).toEqual('IGX-EXPANSION-PANEL-TITLE');

            header.iconPosition = ICON_POSITION.RIGHT;
            fixture.detectChanges();
            expect(header.iconPosition).toEqual('right');
            expect(headerButton.children[0].nodeName).toEqual('IGX-EXPANSION-PANEL-TITLE');
            expect(headerButton.children[1].nodeName).toEqual('IGX-ICON');
            expect(headerButton.children[0].getBoundingClientRect().left).
                toBeLessThan(headerButton.children[1].getBoundingClientRect().left);

            header.iconPosition = ICON_POSITION.NONE;
            fixture.detectChanges();
            expect(header.iconPosition).toEqual('none');
            expect(headerButton.children.length).toEqual(1);
            expect(headerButton.children[0].nodeName).toEqual('IGX-EXPANSION-PANEL-TITLE');

            header.iconPosition = ICON_POSITION.LEFT;
            fixture.detectChanges();
            expect(header.iconPosition).toEqual('left');
            expect(headerButton.children[0].nodeName).toEqual('IGX-ICON');
            expect(headerButton.children[1].nodeName).toEqual('IGX-EXPANSION-PANEL-TITLE');
            expect(headerButton.children[0].getBoundingClientRect().left).
                toBeLessThan(headerButton.children[1].getBoundingClientRect().left);
        });

        it('Should override the default icon when an icon template is passed', () => {
            const fixture = TestBed.createComponent(IgxExpansionPanelSampleComponent);
            fixture.detectChanges();
            const header = fixture.componentInstance.header;
            const panelHeader = fixture.nativeElement.querySelector('.' + CSS_CLASS_PANEL_HEADER) as HTMLElement;
            const headerButton = panelHeader.querySelector('div [role = \'button\']');
            header.iconPosition = ICON_POSITION.LEFT;
            fixture.detectChanges();

            // Buttons are wrapper in wrapper div to hold positioning class
            const iconContainer = headerButton.children[1];
            const titleContainer = headerButton.children[0];
            expect(headerButton.children.length).toEqual(2);
            expect(iconContainer.firstElementChild.nodeName).toEqual('IGX-ICON');
            expect(titleContainer.firstElementChild.nodeName).toEqual('IGX-EXPANSION-PANEL-TITLE');

            fixture.componentInstance.customIcon = true;
            fixture.detectChanges();

            expect(iconContainer.firstElementChild.nodeName).toEqual('IGX-EXPANSION-PANEL-ICON');
            expect(titleContainer.firstElementChild.nodeName).toEqual('IGX-EXPANSION-PANEL-TITLE');

            fixture.componentInstance.customIcon = false;
            fixture.detectChanges();

            expect(iconContainer.firstElementChild.nodeName).toEqual('IGX-ICON');
            expect(titleContainer.firstElementChild.nodeName).toEqual('IGX-EXPANSION-PANEL-TITLE');
        });

        it('Should properly appy positioning classes to icon', () => {
            const fixture = TestBed.createComponent(IgxExpansionPanelSampleComponent);
            fixture.detectChanges();
            const header = fixture.componentInstance.header;
            const panelHeader = fixture.nativeElement.querySelector('.' + CSS_CLASS_PANEL_HEADER) as HTMLElement;
            const headerButton = panelHeader.querySelector('div [role = \'button\']');
            header.iconPosition = ICON_POSITION.LEFT;
            fixture.detectChanges();
            expect(headerButton.children[1].classList).toContain(IconPositionClass.LEFT);

            header.iconPosition = ICON_POSITION.RIGHT;
            fixture.detectChanges();
            expect(headerButton.children[1].classList).toContain(IconPositionClass.RIGHT);

            header.iconPosition = ICON_POSITION.NONE;
            fixture.detectChanges();
            expect(headerButton.children[1].classList).toContain(IconPositionClass.NONE);
        });
    });

    describe('Aria tests', () => {
        configureTestSuite();
        it('Should properly apply default aria properties', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxExpansionPanelListComponent);
            fixture.detectChanges();
            const panel = fixture.componentInstance.expansionPanel;
            const panelElement = panel.elementRef.nativeElement;
            const header = fixture.componentInstance.header;
            const headerElement = header.elementRef.nativeElement;
            const title = fixture.componentInstance.expansionPanel.header;
            fixture.detectChanges();

            // IgxExpansionPanelHeaderComponent host
            expect(headerElement.getAttribute('aria-level')).toEqual('3');
            expect(headerElement.getAttribute('role')).toEqual('heading');

            // Body of IgxExpansionPanelComponent
            panel.expand();
            tick();
            fixture.detectChanges();
            tick();
            expect(panelElement.lastElementChild.getAttribute('role')).toEqual('region');
            expect(panelElement.lastElementChild.getAttribute('aria-labelledby')).toEqual(title.id);

            // Button of IgxExpansionPanelHeaderComponent
            expect(headerElement.lastElementChild.getAttribute('role')).toEqual('button');
            expect(headerElement.firstElementChild.getAttribute('aria-controls')).toEqual(panel.id);
            expect(headerElement.firstElementChild.getAttribute('aria-expanded')).toEqual('true');
            expect(headerElement.firstElementChild.getAttribute('aria-disabled')).toEqual('false');

            // Disabled
            header.disabled = true;
            expect(headerElement.firstElementChild.getAttribute('aria-disabled')).toEqual('false');
        }));

        it('Should properly apply aria properties if no header is shown', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxExpansionPanelSampleComponent);
            fixture.detectChanges();
            fixture.componentInstance.showBody = true;
            fixture.componentInstance.showHeader = false;
            fixture.componentInstance.showTitle = false;
            fixture.detectChanges();
            const panel = fixture.componentInstance.panel;
            const panelElement = panel.elementRef.nativeElement;
            const header = fixture.componentInstance.header;
            expect(header).toBeFalsy();
            const title = fixture.componentInstance.title;
            expect(title).toBeFalsy();
            panel.expand();
            tick();
            fixture.detectChanges();
            tick();

            // Body of IgxExpansionPanelComponent
            expect(panelElement.lastElementChild.getAttribute('role')).toEqual('region');
            expect(panelElement.lastElementChild.getAttribute('aria-labelledby')).toEqual('');
            expect(panelElement.lastElementChild.getAttribute('aria-label')).toEqual(`${panelElement.id}-region`);
            panel.expand();
            tick();
            fixture.detectChanges();
        }));

        it('Should update aria properties recording to external change', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxExpansionPanelListComponent);
            fixture.detectChanges();
            const panel = fixture.componentInstance.expansionPanel;
            const panelElement = panel.elementRef.nativeElement;
            const header = fixture.componentInstance.header;
            const headerElement = header.elementRef.nativeElement;
            const title = panel.header;
            panel.expand();
            tick();
            fixture.detectChanges();
            tick();

            // Body of IgxExpansionPanelComponent
            expect(panelElement.lastElementChild.getAttribute('aria-labelledby')).toEqual(title.id);

            // Button of IgxExpansionPanelHeaderComponent
            expect(headerElement.firstElementChild.getAttribute('aria-controls')).toEqual(panel.id);
            panel.id = 'example-test-panel-id';
            tick();
            fixture.detectChanges();
            tick();
            expect(headerElement.firstElementChild.getAttribute('aria-controls')).toEqual('example-test-panel-id');
            // title.id = 'example-title-id'; // not probable
            // tick();
            // fixture.detectChanges();
            // tick();
            // expect(panelElement.lastElementChild.getAttribute('aria-labelledby')).toEqual('example-title-id');
        }));

        it('Should properly label the control region', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxExpansionPanelListComponent);
            fixture.detectChanges();
            const panel = fixture.componentInstance.expansionPanel;
            const panelElement = panel.elementRef.nativeElement;
            const title = fixture.componentInstance.expansionPanel.header;
            panel.expand();
            tick();
            fixture.detectChanges();
            tick();
            expect(panelElement.lastElementChild.getAttribute('aria-labelledby')).toEqual(title.id);
            expect(panelElement.lastElementChild.getAttribute('aria-label')).toEqual(`${panel.id}-region`);
            // fixture.componentInstance.showTitle = false;
            // tick();
            // fixture.detectChanges();
            // tick();
            // expect(panelElement.lastElementChild.getAttribute('aria-labelledby')).toEqual('');
            // expect(panelElement.lastElementChild.getAttribute('aria-label')).toEqual(`${panel.id}-region`);
            panel.body.label = 'custom-test-label';
            tick();
            fixture.detectChanges();
            expect(panelElement.lastElementChild.getAttribute('aria-labelledby')).toEqual(title.id);
            expect(panelElement.lastElementChild.getAttribute('aria-label')).toEqual(`custom-test-label`);
            panel.body.label = '';
            tick();
            fixture.detectChanges();
            expect(panelElement.lastElementChild.getAttribute('aria-labelledby')).toEqual(title.id);
            expect(panelElement.lastElementChild.getAttribute('aria-label')).toEqual(`${panel.id}-region`);
        }));
    });

    describe('Rendering tests: ', () => {
        configureTestSuite();
        it('Should apply all appropriate classes on combo initialization', fakeAsync(() => {
            const fixture: ComponentFixture<IgxExpansionPanelSampleComponent> = TestBed.createComponent(IgxExpansionPanelSampleComponent);
            fixture.detectChanges();
            const panel = fixture.componentInstance.panel;
            const panelContainer = fixture.nativeElement.querySelector('.' + CSS_CLASS_EXPANSION_PANEL);
            expect(panelContainer).not.toBeNull();
            expect(panelContainer.attributes.getNamedItem('id').nodeValue).toEqual(panel.id);
            expect(panelContainer.childElementCount).toEqual(1);

            const header = panelContainer.children[0];
            expect(header.attributes.getNamedItem('class').nodeValue).toContain(CSS_CLASS_PANEL_HEADER);
            expect(header.attributes.getNamedItem('role').nodeValue).toEqual('heading');
            expect(header.attributes.getNamedItem('aria-level').nodeValue).toEqual('3');
            expect(header.childElementCount).toEqual(1);

            const headerBtn = header.children[0];
            expect(headerBtn.attributes.getNamedItem('role').nodeValue).toEqual('button');
            expect(headerBtn.attributes.getNamedItem('tabindex').nodeValue).toEqual('0');
            expect(headerBtn.attributes.getNamedItem('aria-disabled').nodeValue).toEqual('false');
            expect(headerBtn.attributes.getNamedItem('aria-expanded').nodeValue).toEqual('false');
            expect(headerBtn.attributes.getNamedItem('aria-controls').nodeValue).toEqual(panel.id);
            expect(headerBtn.childElementCount).toEqual(2); // 2 Children - Title Wrapper + Icon

            const icon = headerBtn.children[1].firstElementChild; // Icon is wrapped in div
            expect(headerBtn.children[1].attributes.getNamedItem('class').nodeValue).toContain('igx-expansion-panel__header-icon--start');
            expect(icon.attributes.getNamedItem('class').nodeValue).toContain('material-icons igx-icon');
            // expect(icon.attributes.getNamedItem('ng-reflect-icon-name').nodeValue).toEqual('expand_more');
            expect(icon.attributes.getNamedItem('aria-hidden').nodeValue).toEqual('true');
            expect(icon.childElementCount).toEqual(0);

            const title = headerBtn.firstElementChild.firstElementChild;
            // expect(title.attributes.getNamedItem('id').nodeValue).toEqual('igx-expansion-panel-header-title-0');
            expect(title.textContent).toEqual('Example Title');

            const description = headerBtn.firstElementChild.lastElementChild;
            expect(description.textContent).toEqual('Example Description');

            // expect(bodyWrapper.attributes.getNamedItem('aria-labelledby').nodeValue).toEqual('igx-expansion-panel-header-title-0');
            expect(panelContainer.childElementCount).toEqual(1);

            header.click();
            tick();
            fixture.detectChanges();
            tick();
            const bodyWrapper = panelContainer.children[1];
            expect(bodyWrapper.attributes.getNamedItem('role').nodeValue).toEqual('region');
            expect(bodyWrapper.attributes.getNamedItem('aria-label').nodeValue).toEqual(panel.id + '-region');
            expect(bodyWrapper.childElementCount).toEqual(0);
            expect(bodyWrapper.textContent.trim()).toEqual('Example body');
        }));
        it('Should apply all appropriate classes on initialization_grid content', fakeAsync(() => {
            const fixture: ComponentFixture<IgxExpansionPanelGridComponent> = TestBed.createComponent(IgxExpansionPanelGridComponent);
            fixture.detectChanges();
            const panel = fixture.componentInstance.expansionPanel;
            const panelContainer = fixture.nativeElement.querySelector('.' + CSS_CLASS_EXPANSION_PANEL);
            expect(panelContainer).not.toBeNull();
            expect(panelContainer.attributes.getNamedItem('id').nodeValue).toEqual(panel.id);
            expect(panelContainer.childElementCount).toEqual(1);

            const header = panelContainer.children[0];
            expect(header.attributes.getNamedItem('class').nodeValue).toContain(CSS_CLASS_PANEL_HEADER);
            expect(header.attributes.getNamedItem('role').nodeValue).toEqual('heading');
            expect(header.attributes.getNamedItem('aria-level').nodeValue).toEqual('3');
            expect(header.childElementCount).toEqual(1);

            const headerBtn = header.children[0];
            expect(headerBtn.attributes.getNamedItem('role').nodeValue).toEqual('button');
            expect(headerBtn.attributes.getNamedItem('tabindex').nodeValue).toEqual('0');
            expect(headerBtn.attributes.getNamedItem('aria-disabled').nodeValue).toEqual('false');
            expect(headerBtn.attributes.getNamedItem('aria-expanded').nodeValue).toEqual('false');
            expect(headerBtn.attributes.getNamedItem('aria-controls').nodeValue).toEqual(panel.id);
            expect(headerBtn.childElementCount).toEqual(2); // 2 Children - Title Wrapper + Icon

            const icon = headerBtn.children[1].firstElementChild; // Icon is wrapped in div
            expect(headerBtn.children[1].attributes.getNamedItem('class').nodeValue).toContain('igx-expansion-panel__header-icon--start');
            expect(icon.attributes.getNamedItem('class').nodeValue).toContain('material-icons igx-icon');
            // expect(icon.attributes.getNamedItem('ng-reflect-icon-name').nodeValue).toEqual('expand_more');
            expect(icon.attributes.getNamedItem('aria-hidden').nodeValue).toEqual('true');
            expect(icon.childElementCount).toEqual(0);

            const title = headerBtn.firstElementChild.firstElementChild;
            // expect(title.attributes.getNamedItem('id').nodeValue).toEqual('igx-expansion-panel-header-title-0');
            expect(title.textContent).toEqual('Product orders');

            const description = headerBtn.firstElementChild.lastElementChild;
            expect(description.textContent).toEqual('Product orders details');

            // expect(bodyWrapper.attributes.getNamedItem('aria-labelledby').nodeValue).toEqual('igx-expansion-panel-header-title-0');
            expect(panelContainer.childElementCount).toEqual(1);

            header.click();
            tick();
            fixture.detectChanges();
            tick();
            const bodyWrapper = panelContainer.children[1];
            expect(bodyWrapper.attributes.getNamedItem('role').nodeValue).toEqual('region');
            expect(bodyWrapper.attributes.getNamedItem('aria-label').nodeValue).toEqual(panel.id + '-region');
            expect(bodyWrapper.firstElementChild.nodeName).toEqual('IGX-GRID');
            const grid = bodyWrapper.firstElementChild; // wrapping div
            expect(grid.attributes.getNamedItem('class').nodeValue).toContain(CSS_CLASS_GRID);
            expect(grid.attributes.getNamedItem('role').nodeValue).toEqual('grid');
            expect(grid.attributes.getNamedItem('id').nodeValue).toEqual(fixture.componentInstance.grid1.id);
            expect(grid.attributes.getNamedItem('tabindex').nodeValue).toEqual('0');
            expect(grid.attributes.getNamedItem('ng-reflect-auto-generate').nodeValue).toEqual('true');
            expect(grid.attributes.getNamedItem('ng-reflect-width').nodeValue).toEqual(fixture.componentInstance.width);
            expect(grid.attributes.getNamedItem('ng-reflect-height').nodeValue).toEqual(fixture.componentInstance.height);
            expect(grid.childElementCount).toEqual(5);
        }));
        it('Should apply all appropriate classes on combo initialization_image + text content', fakeAsync(() => {
            const fixture: ComponentFixture<IgxExpansionPanelImageComponent> = TestBed.createComponent(IgxExpansionPanelImageComponent);
            fixture.detectChanges();
            const panel = fixture.componentInstance.panel;
            const panelContainer = fixture.nativeElement.querySelector('.' + CSS_CLASS_EXPANSION_PANEL);
            expect(panelContainer).not.toBeNull();
            expect(panelContainer.attributes.getNamedItem('id').nodeValue).toEqual(panel.id);
            expect(panelContainer.childElementCount).toEqual(1);

            const header = panelContainer.children[0];
            expect(header.attributes.getNamedItem('class').nodeValue).toContain(CSS_CLASS_PANEL_HEADER);
            expect(header.attributes.getNamedItem('role').nodeValue).toEqual('heading');
            expect(header.attributes.getNamedItem('aria-level').nodeValue).toEqual('3');
            expect(header.childElementCount).toEqual(1);

            const headerBtn = header.children[0];
            expect(headerBtn.attributes.getNamedItem('role').nodeValue).toEqual('button');
            expect(headerBtn.attributes.getNamedItem('tabindex').nodeValue).toEqual('0');
            expect(headerBtn.attributes.getNamedItem('aria-disabled').nodeValue).toEqual('false');
            expect(headerBtn.attributes.getNamedItem('aria-expanded').nodeValue).toEqual('false');
            expect(headerBtn.attributes.getNamedItem('aria-controls').nodeValue).toEqual(panel.id);
            expect(headerBtn.childElementCount).toEqual(2); // 2 Children - Title Wrapper + Icon

            const icon = headerBtn.children[1].firstElementChild; // Icon is wrapped in div; Icon is the second element
            expect(headerBtn.children[1].attributes.getNamedItem('class').nodeValue).toContain('igx-expansion-panel__header-icon--start');
            expect(icon.attributes.getNamedItem('class').nodeValue).toContain('material-icons igx-icon');
            // expect(icon.attributes.getNamedItem('ng-reflect-icon-name').nodeValue).toEqual('expand_more');
            expect(icon.attributes.getNamedItem('aria-hidden').nodeValue).toEqual('true');
            expect(icon.childElementCount).toEqual(0);

            const title = headerBtn.firstElementChild.firstElementChild;
            // expect(title.attributes.getNamedItem('id').nodeValue).toEqual('igx-expansion-panel-header-title-0');
            expect(title.textContent).toEqual('Frogs');

            const description = headerBtn.firstElementChild.lastElementChild;
            expect(description.textContent).toEqual('Frog description');
            // expect(bodyWrapper.attributes.getNamedItem('aria-labelledby').nodeValue).toEqual('igx-expansion-panel-header-title-0');
            expect(panelContainer.childElementCount).toEqual(1);

            header.click();
            tick();
            fixture.detectChanges();
            tick();
            const bodyWrapper = panelContainer.children[1];
            expect(bodyWrapper.attributes.getNamedItem('role').nodeValue).toEqual('region');
            expect(bodyWrapper.attributes.getNamedItem('aria-label').nodeValue).toEqual(panel.id + '-region');
            expect(bodyWrapper.childElementCount).toEqual(1);
            const textWrapper = bodyWrapper.firstElementChild; // wrapping div
            expect(textWrapper.attributes.getNamedItem('class').nodeValue).toContain('sample-wrapper');
            expect(textWrapper.childElementCount).toEqual(1);
            const image = textWrapper.children[0] as HTMLElement;
            expect(image.tagName).toEqual('IMG');
            expect (textWrapper.textContent.trim()).toEqual(fixture.componentInstance.text);
        }));
    });
});


@Component({
    template: `
    <igx-expansion-panel #expansionPanel>
<igx-expansion-panel-header headerHeight="50px">
                <igx-expansion-panel-title>Product orders</igx-expansion-panel-title>
                <igx-expansion-panel-description>Product orders details</igx-expansion-panel-description>
            </igx-expansion-panel-header>
            <igx-expansion-panel-body>
<igx-grid #grid1 [data] = "data" [autoGenerate]="true" [width]="width" [height]="height">
        </igx-grid>
       </igx-expansion-panel-body>
</igx-expansion-panel>
`
})
export class IgxExpansionPanelGridComponent {

    @ViewChild('expansionPanel', { read: IgxExpansionPanelComponent })
    public expansionPanel: IgxExpansionPanelComponent;
    @ViewChild('grid1', { read: IgxGridComponent })
    public grid1: IgxGridComponent;

    public width = '800px';
    public height = '600px';

    public data = [
        { ProductID: 1, ProductName: 'Chai', InStock: true, UnitsInStock: 2760, OrderDate: '2005-03-21' },
        { ProductID: 2, ProductName: 'Aniseed Syrup', InStock: false, UnitsInStock: 198, OrderDate: '2008-01-15' },
        { ProductID: 3, ProductName: 'Chef Antons Cajun Seasoning', InStock: true, UnitsInStock: 52, OrderDate: '2010-11-20' },
        { ProductID: 4, ProductName: 'Grandmas Boysenberry Spread', InStock: false, UnitsInStock: 0, OrderDate: '2007-10-11' },
        { ProductID: 5, ProductName: 'Uncle Bobs Dried Pears', InStock: false, UnitsInStock: 0, OrderDate: '2001-07-27' },
        { ProductID: 6, ProductName: 'Northwoods Cranberry Sauce', InStock: true, UnitsInStock: 1098, OrderDate: '1990-05-17' },
        { ProductID: 7, ProductName: 'Queso Cabrales', InStock: false, UnitsInStock: 0, OrderDate: '2005-03-03' },
        { ProductID: 8, ProductName: 'Tofu', InStock: true, UnitsInStock: 7898, OrderDate: '2017-09-09' },
        { ProductID: 9, ProductName: 'Teatime Chocolate Biscuits', InStock: true, UnitsInStock: 6998, OrderDate: '2025-12-25' },
        { ProductID: 10, ProductName: 'Chocolate', InStock: true, UnitsInStock: 20000, OrderDate: '2018-03-01' }
    ];
}

@Component({
    template: `
<div style = "width:300px">
<igx-expansion-panel #expansionPanel>
<igx-expansion-panel-header headerHeight="50px">
<igx-expansion-panel-title>Product List</igx-expansion-panel-title>
</igx-expansion-panel-header>
<igx-expansion-panel-body>
<igx-list>
<igx-list-item [isHeader]="true">Products</igx-list-item>
<igx-list-item>Product 1</igx-list-item>
<igx-list-item>Product 2</igx-list-item>
<igx-list-item>Product 3</igx-list-item>
<igx-list-item>Product 4</igx-list-item>
<igx-list-item>Product 5</igx-list-item>
</igx-list>
</igx-expansion-panel-body>
</igx-expansion-panel>
</div>
`
})
export class IgxExpansionPanelListComponent {
    @ViewChild(IgxExpansionPanelHeaderComponent, { read: IgxExpansionPanelHeaderComponent })
    public header: IgxExpansionPanelHeaderComponent;
    @ViewChild(IgxExpansionPanelComponent, { read: IgxExpansionPanelComponent })
    public expansionPanel: IgxExpansionPanelComponent;
}


@Component({
    template: `
<igx-expansion-panel
    (onCollapsed)="handleCollapsing($event)"
    (onExpanded)="handleExpanded($event)">
    <igx-expansion-panel-header *ngIf="showHeader" headerHeight="50px">
        <igx-expansion-panel-title *ngIf="showTitle">Example Title</igx-expansion-panel-title>
        <igx-expansion-panel-description>Example Description</igx-expansion-panel-description>
        <igx-expansion-panel-icon *ngIf="customIcon">
            <span class="custom-test-icon">TEST_ICON</span>
        </igx-expansion-panel-icon>
    </igx-expansion-panel-header>
    <igx-expansion-panel-body *ngIf="showBody">
    Example body
    </igx-expansion-panel-body>
</igx-expansion-panel>
`
})
export class IgxExpansionPanelSampleComponent {
    public disabled = false;
    public collapsed = true;
    public showTitle = true;
    public showBody = true;
    public showHeader = true;
    public customIcon = false;
    @ViewChild(IgxExpansionPanelHeaderComponent, { read: IgxExpansionPanelHeaderComponent })
    public header: IgxExpansionPanelHeaderComponent;
    @ViewChild(IgxExpansionPanelComponent, { read: IgxExpansionPanelComponent })
    public panel: IgxExpansionPanelComponent;
    @ViewChild(IgxExpansionPanelTitleDirective, { read: IgxExpansionPanelTitleDirective })
    public title: IgxExpansionPanelTitleDirective;
    public handleExpanded(event?) {
    }
    public handleCollapsed(event?) {
    }
    public handleInterraction() {
    }
}

@Component({
    template: `
<igx-expansion-panel #panel>
    <igx-expansion-panel-header headerHeight="50px">
        <igx-expansion-panel-title >Frogs</igx-expansion-panel-title>
        <igx-expansion-panel-description>Frog description</igx-expansion-panel-description>
    </igx-expansion-panel-header>
    <igx-expansion-panel-body >
    <p class = "sample-wrapper" style = "padding: 5px">
    <img style="float: left; margin: 5px;" src="{{imagePath}}" width="250px" height="150px">
    {{text}}
    </p>
    </igx-expansion-panel-body>
</igx-expansion-panel>
`
})
export class IgxExpansionPanelImageComponent {
    public imagePath = 'http://milewalk.com/wp-content/uploads/2016/01/My-2-Morning-Tricks-to-Eating-the-Frog.jpg';
    // tslint:disable-next-line:max-line-length
    public text = 'A frog is any member of a diverse and largely carnivorous group of short-bodied, tailless amphibians composing the order Anura. The oldest fossil \"proto-frog\" appeared in the early Triassic of Madagascar, but molecular clock dating suggests their origins may extend further back to the Permian, 265 million years ago. Frogs are widely distributed, ranging from the tropics to subarctic regions, but the greatest concentration of species diversity is in tropical rainforests. There are approximately 4,800 recorded species, accounting for over 85% of extant amphibian species. They are also one of the five most diverse vertebrate orders. The body plan of an adult frog is generally characterized by a stout body, protruding eyes, cleft tongue, limbs folded underneath, and the absence of a tail. Besides living in fresh water and on dry land, the adults of some species are adapted for living underground or in trees. The skins of frogs are glandular, with secretions ranging from distasteful to toxic. Warty species of frog tend to be called toads but the distinction between frogs and toads is based on informal naming conventions concentrating on the warts rather than taxonomy or evolutionary history.';
    @ViewChild(IgxExpansionPanelHeaderComponent, { read: IgxExpansionPanelHeaderComponent })
    public header: IgxExpansionPanelHeaderComponent;
    @ViewChild(IgxExpansionPanelComponent, { read: IgxExpansionPanelComponent })
    public panel: IgxExpansionPanelComponent;
}

