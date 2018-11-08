import {
    Component,
    ElementRef,
    Inject,
    NgModule,
    ViewChild,
    ComponentRef
} from '@angular/core';
import { async as asyncWrapper, TestBed, fakeAsync, tick, async } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxOverlayService } from './overlay';
import { IgxToggleDirective, IgxToggleModule, IgxOverlayOutletDirective } from './../../directives/toggle/toggle.directive';
import { AutoPositionStrategy } from './position/auto-position-strategy';
import { ConnectedPositioningStrategy } from './position/connected-positioning-strategy';
import { GlobalPositionStrategy } from './position/global-position-strategy';
import {
    PositionSettings,
    HorizontalAlignment,
    VerticalAlignment,
    OverlaySettings,
    Point,
    OverlayEventArgs,
    OverlayCancelableEventArgs
} from './utilities';
import * as utilities from './utilities';
import { NoOpScrollStrategy } from './scroll/NoOpScrollStrategy';
import { BlockScrollStrategy } from './scroll/block-scroll-strategy';
import { AbsoluteScrollStrategy } from './scroll/absolute-scroll-strategy';
import { CloseScrollStrategy } from './scroll/close-scroll-strategy';
import { scaleInVerTop, scaleOutVerTop } from 'projects/igniteui-angular/src/lib/animations/main';
import { UIInteractions } from '../../test-utils/ui-interactions.spec';

import { configureTestSuite } from '../../test-utils/configure-suite';

const CLASS_OVERLAY_CONTENT = 'igx-overlay__content';
const CLASS_OVERLAY_CONTENT_MODAL = 'igx-overlay__content--modal';
const CLASS_OVERLAY_WRAPPER = 'igx-overlay__wrapper';
const CLASS_OVERLAY_WRAPPER_MODAL = 'igx-overlay__wrapper--modal';
const CLASS_OVERLAY_MAIN = 'igx-overlay';

// Utility function to get all applied to element css from all sources.
function css(element) {
    const sheets = document.styleSheets, ret = [];
    element.matches = element.matches || element.webkitMatchesSelector || element.mozMatchesSelector
        || element.msMatchesSelector || element.oMatchesSelector;
    for (const key in sheets) {
        if (sheets.hasOwnProperty(key)) {
            const sheet = <CSSStyleSheet>sheets[key];
            const rules: any = sheet.rules || sheet.cssRules;

            for (const r in rules) {
                if (element.matches(rules[r].selectorText)) {
                    ret.push(rules[r].cssText);
                }
            }
        }
    }
    return ret;
}

function addScrollDivToElement(parent) {
    const scrollDiv = document.createElement('div');
    scrollDiv.style.width = '100px';
    scrollDiv.style.height = '100px';
    scrollDiv.style.top = '10000px';
    scrollDiv.style.left = '10000px';
    scrollDiv.style.position = 'absolute';
    parent.appendChild(scrollDiv);

}

function getExpectedTopPosition(verticalAlignment: VerticalAlignment, elementRect: DOMRect): number {
    let expectedTop: number;
    switch (verticalAlignment) {
        case VerticalAlignment.Bottom: {
            expectedTop = elementRect.top + elementRect.height;
            break;
        }
        case VerticalAlignment.Middle: {
            expectedTop = elementRect.top + elementRect.height / 2;
            break;
        }
        default: {
            expectedTop = elementRect.top;
            break;
        }
    }
    return expectedTop;
}

function getExpectedLeftPosition(horizontalAlignment: HorizontalAlignment, elementRect: DOMRect): number {
    let expectedLeft: number;
    switch (horizontalAlignment) {
        case HorizontalAlignment.Right: {
            expectedLeft = elementRect.left + elementRect.width;
            break;
        }
        case HorizontalAlignment.Center: {
            expectedLeft = elementRect.left + elementRect.width / 2;
            break;
        }
        default: {
            expectedLeft = elementRect.left;
            break;
        }
    }
    return expectedLeft;
}

describe('igxOverlay', () => {
    beforeEach(async(() => {
        UIInteractions.clearOverlay();
    }));

    afterAll(() => {
        UIInteractions.clearOverlay();
    });

    describe('Unit Tests: ', () => {
        configureTestSuite();
        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [IgxToggleModule, DynamicModule, NoopAnimationsModule],
                declarations: DIRECTIVE_COMPONENTS
            }).compileComponents();
        }));

        it('OverlayElement should return a div attached to Document\'s body.', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();

            fixture.componentInstance.buttonElement.nativeElement.click();
            tick();
            const overlayDiv = document.getElementsByClassName(CLASS_OVERLAY_MAIN)[0];
            expect(overlayDiv).toBeDefined();
            expect(overlayDiv.classList.contains('igx-overlay')).toBeTruthy();
        }));

        it('Should attach to setting target or default to body', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            const button = fixture.componentInstance.buttonElement;
            const overlay = fixture.componentInstance.overlay;
            fixture.detectChanges();

            overlay.show(SimpleDynamicComponent, {
                outlet: button,
                modal: false
            });
            tick();
            let wrapper = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0];
            expect(wrapper).toBeDefined();
            expect(wrapper.parentNode).toBe(button.nativeElement);
            overlay.hideAll();

            overlay.show(SimpleDynamicComponent, { modal: false });
            tick();
            wrapper = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0];
            expect(wrapper).toBeDefined();
            expect(wrapper.parentElement.classList).toContain('igx-overlay');
            expect(wrapper.parentElement.parentElement).toBe(document.body);
            overlay.hideAll();

            const outlet = document.createElement('div');
            fixture.debugElement.nativeElement.appendChild(outlet);
            overlay.show(SimpleDynamicComponent, {
                modal: false,
                outlet: new IgxOverlayOutletDirective(new ElementRef(outlet))
            });
            tick();
            wrapper = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0];
            expect(wrapper).toBeDefined();
            expect(wrapper.parentNode).toBe(outlet);
        }));

        it('Should show component passed to overlay.', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();

            fixture.componentInstance.buttonElement.nativeElement.click();
            tick();
            const overlayDiv = document.getElementsByClassName(CLASS_OVERLAY_MAIN)[0];
            expect(overlayDiv).toBeDefined();
            expect(overlayDiv.children.length).toEqual(1);
            const wrapperDiv = overlayDiv.children[0];
            expect(wrapperDiv).toBeDefined();
            expect(wrapperDiv.classList.contains(CLASS_OVERLAY_WRAPPER_MODAL)).toBeTruthy();
            expect(wrapperDiv.children[0].localName).toEqual('div');

            const contentDiv = wrapperDiv.children[0];
            expect(contentDiv).toBeDefined();
            expect(contentDiv.classList.contains(CLASS_OVERLAY_CONTENT_MODAL)).toBeTruthy();
        }));

        it('Should hide component and the overlay when Hide() is called.', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();
            let overlayDiv: Element;

            fixture.componentInstance.overlay.show(SimpleDynamicComponent);
            tick();

            fixture.componentInstance.overlay.show(SimpleDynamicComponent);
            tick();

            overlayDiv = document.getElementsByClassName(CLASS_OVERLAY_MAIN)[0];
            expect(overlayDiv).toBeDefined();
            expect(overlayDiv.children.length).toEqual(2);
            expect(overlayDiv.children[0].localName).toEqual('div');
            expect(overlayDiv.children[1].localName).toEqual('div');

            fixture.componentInstance.overlay.hide('0');
            tick();

            overlayDiv = document.getElementsByClassName(CLASS_OVERLAY_MAIN)[0];
            expect(overlayDiv).toBeDefined();
            expect(Array.from(overlayDiv.classList).indexOf(CLASS_OVERLAY_MAIN) > -1).toBeTruthy();
            expect(overlayDiv.children.length).toEqual(1);
            expect(overlayDiv.children[0].localName).toEqual('div');

            fixture.componentInstance.overlay.hide('1');
            tick();

            overlayDiv = document.getElementsByClassName(CLASS_OVERLAY_MAIN)[0];
            expect(overlayDiv).toBeUndefined();
        }));

        it('Should hide all components and the overlay when HideAll() is called.', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();
            let overlayDiv: Element;
            fixture.componentInstance.overlay.show(SimpleDynamicComponent);
            fixture.componentInstance.overlay.show(SimpleDynamicComponent);
            tick();
            fixture.detectChanges();
            overlayDiv = document.getElementsByClassName(CLASS_OVERLAY_MAIN)[0];
            expect(overlayDiv).toBeDefined();
            expect(overlayDiv.children.length).toEqual(2);
            expect(overlayDiv.children[0].localName).toEqual('div');
            expect(overlayDiv.children[1].localName).toEqual('div');

            fixture.componentInstance.overlay.hideAll();
            tick();
            overlayDiv = document.getElementsByClassName(CLASS_OVERLAY_MAIN)[0];
            expect(overlayDiv).toBeUndefined();
        }));

        it('Should show and hide component via directive.', fakeAsync(() => {
            const fixture = TestBed.createComponent(SimpleDynamicWithDirectiveComponent);
            fixture.detectChanges();
            let overlayDiv: Element;
            fixture.componentInstance.show();
            tick();
            overlayDiv = document.getElementsByClassName(CLASS_OVERLAY_MAIN)[0];
            expect(overlayDiv).toBeDefined();
            expect(overlayDiv.children.length).toEqual(1);
            expect(overlayDiv.children[0].localName).toEqual('div');

            fixture.componentInstance.hide();
            tick();
            overlayDiv = document.getElementsByClassName(CLASS_OVERLAY_MAIN)[0];
            expect(overlayDiv).toBeUndefined();
        }));

        it('Should properly emit events.', fakeAsync(() => {
            const fix = TestBed.createComponent(SimpleRefComponent);
            fix.detectChanges();
            const overlayInstance = fix.componentInstance.overlay;
            spyOn(overlayInstance.onClosed, 'emit');
            spyOn(overlayInstance.onClosing, 'emit');
            spyOn(overlayInstance.onOpened, 'emit');
            spyOn(overlayInstance.onOpening, 'emit');

            const firstCallId = overlayInstance.show(SimpleDynamicComponent);
            tick();

            expect(overlayInstance.onOpening.emit).toHaveBeenCalledTimes(1);
            expect(overlayInstance.onOpening.emit)
                .toHaveBeenCalledWith({ id: firstCallId, componentRef: jasmine.any(ComponentRef), cancel: false });
            const args: OverlayEventArgs = (overlayInstance.onOpening.emit as jasmine.Spy).calls.mostRecent().args[0];
            expect(args.componentRef.instance).toEqual(jasmine.any(SimpleDynamicComponent));

            tick();
            expect(overlayInstance.onOpened.emit).toHaveBeenCalledTimes(1);
            expect(overlayInstance.onOpened.emit).toHaveBeenCalledWith({ id: firstCallId, componentRef: jasmine.any(ComponentRef) });
            overlayInstance.hide(firstCallId);

            tick();
            expect(overlayInstance.onClosing.emit).toHaveBeenCalledTimes(1);
            expect(overlayInstance.onClosing.emit)
                .toHaveBeenCalledWith({ id: firstCallId, componentRef: jasmine.any(ComponentRef), cancel: false });

            tick();
            expect(overlayInstance.onClosed.emit).toHaveBeenCalledTimes(1);
            expect(overlayInstance.onClosed.emit).toHaveBeenCalledWith({ id: firstCallId, componentRef: jasmine.any(ComponentRef) });

            const secondCallId = overlayInstance.show(fix.componentInstance.item);
            tick();
            expect(overlayInstance.onOpening.emit).toHaveBeenCalledTimes(2);
            expect(overlayInstance.onOpening.emit).toHaveBeenCalledWith({ componentRef: undefined, id: secondCallId, cancel: false });

            tick();
            expect(overlayInstance.onOpened.emit).toHaveBeenCalledTimes(2);
            expect(overlayInstance.onOpened.emit).toHaveBeenCalledWith({ componentRef: undefined, id: secondCallId });

            overlayInstance.hide(secondCallId);
            tick();
            expect(overlayInstance.onClosing.emit).toHaveBeenCalledTimes(2);
            expect(overlayInstance.onClosing.emit).toHaveBeenCalledWith({ componentRef: undefined, id: secondCallId, cancel: false });

            tick();
            expect(overlayInstance.onClosed.emit).toHaveBeenCalledTimes(2);
            expect(overlayInstance.onClosed.emit).toHaveBeenCalledWith({ componentRef: undefined, id: secondCallId });
        }));

        it('Should properly call position method - GlobalPosition.', () => {
            const mockParent = document.createElement('div');
            const mockItem = document.createElement('div');
            mockParent.appendChild(mockItem);

            const mockPositioningSettings1: PositionSettings = {
                horizontalDirection: HorizontalAlignment.Right,
                verticalDirection: VerticalAlignment.Bottom,
                target: mockItem
            };

            const horAl = Object.keys(HorizontalAlignment).filter(key => !isNaN(Number(HorizontalAlignment[key])));
            const verAl = Object.keys(VerticalAlignment).filter(key => !isNaN(Number(VerticalAlignment[key])));

            const mockDirection: string[] = ['flex-start', 'center', 'flex-end'];

            for (let i = 0; i < mockDirection.length; i++) {
                for (let j = 0; j < mockDirection.length; j++) {
                    mockPositioningSettings1.horizontalDirection = HorizontalAlignment[horAl[i]];
                    mockPositioningSettings1.verticalDirection = VerticalAlignment[verAl[j]];
                    const globalStrat1 = new GlobalPositionStrategy(mockPositioningSettings1);
                    globalStrat1.position(mockItem);
                    expect(mockParent.style.justifyContent).toEqual(mockDirection[i]);
                    expect(mockParent.style.alignItems).toEqual(mockDirection[j]);
                }
            }
        });

        it('Should properly call position method - ConnectedPosition.', () => {
            const mockParent = jasmine.createSpyObj('parentElement', ['style', 'lastElementChild']);
            const mockItem = document.createElement('div');
            let width = 200;
            let height = 0;
            let right = 0;
            let bottom = 0;
            spyOn(mockItem, 'getBoundingClientRect').and.callFake(() => {
                return {
                    width, height, right, bottom
                };
            });
            spyOn<any>(mockItem, 'parentElement').and.returnValue(mockParent);
            const mockPositioningSettings1: PositionSettings = {
                horizontalDirection: HorizontalAlignment.Right,
                verticalDirection: VerticalAlignment.Bottom,
                target: mockItem,
                horizontalStartPoint: HorizontalAlignment.Left,
                verticalStartPoint: VerticalAlignment.Top
            };
            const connectedStrat1 = new ConnectedPositioningStrategy(mockPositioningSettings1);
            connectedStrat1.position(mockItem, { width: 200, height: 200 });
            expect(mockItem.style.top).toEqual('0px');
            expect(mockItem.style.left).toEqual('-200px');

            connectedStrat1.settings.horizontalStartPoint = HorizontalAlignment.Center;
            connectedStrat1.position(mockItem, { width: 200, height: 200 });
            expect(mockItem.style.top).toEqual('0px');
            expect(mockItem.style.left).toEqual('-100px');

            connectedStrat1.settings.horizontalStartPoint = HorizontalAlignment.Right;
            connectedStrat1.position(mockItem, { width: 200, height: 200 });
            expect(mockItem.style.top).toEqual('0px');
            expect(mockItem.style.left).toEqual('0px');

            right = 0;
            bottom = 0;
            width = 0;
            height = 200;
            connectedStrat1.settings.verticalStartPoint = VerticalAlignment.Top;
            connectedStrat1.position(mockItem, { width: 200, height: 200 });
            expect(mockItem.style.top).toEqual('-200px');
            expect(mockItem.style.left).toEqual('0px');

            connectedStrat1.settings.verticalStartPoint = VerticalAlignment.Middle;
            connectedStrat1.position(mockItem, { width: 200, height: 200 });
            expect(mockItem.style.top).toEqual('-100px');
            expect(mockItem.style.left).toEqual('0px');

            connectedStrat1.settings.verticalStartPoint = VerticalAlignment.Bottom;
            connectedStrat1.position(mockItem, { width: 200, height: 200 });
            expect(mockItem.style.top).toEqual('0px');
            expect(mockItem.style.left).toEqual('0px');

            right = 0;
            bottom = 0;
            width = 0;
            height = 0;
            connectedStrat1.settings.verticalDirection = VerticalAlignment.Top;
            connectedStrat1.position(mockItem, { width: 200, height: 200 });
            expect(mockItem.style.top).toEqual('-200px');
            expect(mockItem.style.left).toEqual('0px');

            connectedStrat1.settings.verticalDirection = VerticalAlignment.Middle;
            connectedStrat1.position(mockItem, { width: 200, height: 200 });
            expect(mockItem.style.top).toEqual('-100px');
            expect(mockItem.style.left).toEqual('0px');

            connectedStrat1.settings.verticalDirection = VerticalAlignment.Bottom;
            connectedStrat1.position(mockItem, { width: 200, height: 200 });
            expect(mockItem.style.top).toEqual('0px');
            expect(mockItem.style.left).toEqual('0px');

            right = 0;
            bottom = 0;
            width = 0;
            height = 0;
            connectedStrat1.settings.horizontalDirection = HorizontalAlignment.Left;
            connectedStrat1.position(mockItem, { width: 200, height: 200 });
            expect(mockItem.style.top).toEqual('0px');
            expect(mockItem.style.left).toEqual('-200px');

            connectedStrat1.settings.horizontalDirection = HorizontalAlignment.Center;
            connectedStrat1.position(mockItem, { width: 200, height: 200 });
            expect(mockItem.style.top).toEqual('0px');
            expect(mockItem.style.left).toEqual('-100px');

            connectedStrat1.settings.horizontalDirection = HorizontalAlignment.Right;
            connectedStrat1.position(mockItem, { width: 200, height: 200 });
            expect(mockItem.style.top).toEqual('0px');
            expect(mockItem.style.left).toEqual('0px');

            // If target is Point
            connectedStrat1.settings.target = new Point(0, 0);
            connectedStrat1.position(mockItem, { width: 200, height: 200 });
            expect(mockItem.style.top).toEqual('0px');
            expect(mockItem.style.left).toEqual('0px');

            // If target is not point or html element, should fallback to new Point(0,0)
            connectedStrat1.settings.target = <any>'g';
            connectedStrat1.position(mockItem, { width: 200, height: 200 });
            expect(mockItem.style.top).toEqual('0px');
            expect(mockItem.style.left).toEqual('0px');
        });

        it('Should properly call position method - AutoPosition.', () => {
            const mockParent = jasmine.createSpyObj('parentElement', ['style', 'lastElementChild']);
            const mockItem = { parentElement: mockParent, clientHeight: 0, clientWidth: 0 } as HTMLElement;
            spyOn<any>(mockItem, 'parentElement').and.returnValue(mockParent);
            const mockPositioningSettings1: PositionSettings = {
                horizontalDirection: HorizontalAlignment.Right,
                verticalDirection: VerticalAlignment.Bottom,
                target: mockItem,
                horizontalStartPoint: HorizontalAlignment.Left,
                verticalStartPoint: VerticalAlignment.Top
            };
            const autoStrat1 = new AutoPositionStrategy(mockPositioningSettings1);
            spyOn(autoStrat1, 'getViewPort').and.returnValue(jasmine.createSpyObj('obj', ['left', 'top', 'right', 'bottom']));
            spyOn(ConnectedPositioningStrategy.prototype, 'position');

            autoStrat1.position(mockItem.parentElement, null, null, true);
            expect(ConnectedPositioningStrategy.prototype.position).toHaveBeenCalledTimes(2);
            expect(ConnectedPositioningStrategy.prototype.position).toHaveBeenCalledWith(mockItem.parentElement, null);
            expect(autoStrat1.getViewPort).toHaveBeenCalledWith(null);
            expect(autoStrat1.getViewPort).toHaveBeenCalledTimes(1);

            const mockPositioningSettings2: PositionSettings = {
                horizontalDirection: HorizontalAlignment.Left,
                verticalDirection: VerticalAlignment.Top,
                target: mockItem,
                horizontalStartPoint: HorizontalAlignment.Left,
                verticalStartPoint: VerticalAlignment.Top
            };
            const autoStrat2 = new AutoPositionStrategy(mockPositioningSettings2);
            spyOn(autoStrat2, 'getViewPort').and.returnValue(jasmine.createSpyObj('obj', ['left', 'top', 'right', 'bottom']));

            autoStrat2.position(mockItem.parentElement, null, null, true);
            expect(ConnectedPositioningStrategy.prototype.position).toHaveBeenCalledTimes(4);
            expect(autoStrat2.getViewPort).toHaveBeenCalledWith(null);
            expect(autoStrat2.getViewPort).toHaveBeenCalledTimes(1);

            const mockPositioningSettings3: PositionSettings = {
                horizontalDirection: HorizontalAlignment.Center,
                verticalDirection: VerticalAlignment.Middle,
                target: mockItem,
                horizontalStartPoint: HorizontalAlignment.Left,
                verticalStartPoint: VerticalAlignment.Top
            };
            const autoStrat3 = new AutoPositionStrategy(mockPositioningSettings3);
            spyOn(autoStrat3, 'getViewPort').and.returnValue(jasmine.createSpyObj('obj', ['left', 'top', 'right', 'bottom']));

            autoStrat3.position(mockItem.parentElement, null, null);
            expect(ConnectedPositioningStrategy.prototype.position).toHaveBeenCalledTimes(5);
            expect(autoStrat3.getViewPort).toHaveBeenCalledTimes(0);
        });

        it('Should properly call AutoPosition getViewPort.', () => {
            const autoStrat1 = new AutoPositionStrategy();
            const docSpy = {
                documentElement: {
                    getBoundingClientRect: () => {
                        return {
                            top: 1920,
                            left: 768
                        };
                    }
                }
            };
            spyOn(document, 'documentElement').and.returnValue(1);
            expect(autoStrat1.getViewPort(docSpy)).toEqual({
                top: -1920,
                left: -768,
                bottom: -1920 + window.innerHeight,
                right: -768 + + window.innerWidth,
                height: window.innerHeight,
                width: window.innerWidth
            });
        });

        it('fix for #1690 - click on second filter does not close first one.', fakeAsync(() => {
            const fixture = TestBed.createComponent(TwoButtonsComponent);
            const button1 = fixture.nativeElement.getElementsByClassName('buttonOne')[0];
            const button2 = fixture.nativeElement.getElementsByClassName('buttonTwo')[0];

            button1.click();
            tick();

            const overlayDiv = document.getElementsByClassName(CLASS_OVERLAY_MAIN)[0];
            const wrapper = overlayDiv.children[0];
            expect(wrapper.classList).toContain(CLASS_OVERLAY_WRAPPER);

            button2.click();
            tick();
            expect(overlayDiv.children.length).toBe(1);
        }));

        it('fix for #1692 - scroll strategy closes overlay when shown component is scrolled.', fakeAsync(() => {
            const fixture = TestBed.createComponent(SimpleDynamicWithDirectiveComponent);
            const overlaySettings: OverlaySettings = { scrollStrategy: new CloseScrollStrategy() };
            fixture.componentInstance.show(overlaySettings);
            tick();

            let overlayDiv = document.getElementsByClassName(CLASS_OVERLAY_MAIN)[0];
            expect(overlayDiv).toBeDefined();

            const scrollableDiv = document.getElementsByClassName('scrollableDiv')[0];
            scrollableDiv.scrollTop += 5;
            scrollableDiv.dispatchEvent(new Event('scroll'));
            tick();

            overlayDiv = document.getElementsByClassName(CLASS_OVERLAY_MAIN)[0];
            expect(overlayDiv).toBeDefined();

            scrollableDiv.scrollTop += 100;
            scrollableDiv.dispatchEvent(new Event('scroll'));
            tick();

            overlayDiv = document.getElementsByClassName(CLASS_OVERLAY_MAIN)[0];
            expect(overlayDiv).toBeDefined();
            fixture.componentInstance.hide();
        }));

        it('fix for #1799 - content div should reposition on window resize.', fakeAsync(() => {
            let point: Point = new Point(50, 50);
            const getPointSpy = spyOn(utilities, 'getPointFromPositionsSettings').and.returnValue(point);
            const fix = TestBed.createComponent(FlexContainerComponent);
            fix.detectChanges();
            const overlayInstance = fix.componentInstance.overlay;
            const buttonElement: HTMLElement = fix.componentInstance.buttonElement.nativeElement;

            const id = overlayInstance.show(
                SimpleDynamicComponent,
                { positionStrategy: new ConnectedPositioningStrategy({ target: buttonElement }) });
            tick();

            let contentRect = document.getElementsByClassName(CLASS_OVERLAY_CONTENT_MODAL)[0].getBoundingClientRect();

            expect(50).toEqual(contentRect.left);
            expect(50).toEqual(contentRect.top);

            point = new Point(200, 200);
            getPointSpy.and.callThrough().and.returnValue(point);
            window.resizeBy(200, 200);
            window.dispatchEvent(new Event('resize'));
            tick();

            contentRect = document.getElementsByClassName(CLASS_OVERLAY_CONTENT_MODAL)[0].getBoundingClientRect();
            expect(200).toEqual(contentRect.left);
            expect(200).toEqual(contentRect.top);

            overlayInstance.hide(id);
        }));

        it('fix for #2475 - An error is thrown for IgxOverlay when showing a component' +
        'instance that is not attached to the DOM', fakeAsync(() => {
            const fix = TestBed.createComponent(SimpleRefComponent);
            fix.detectChanges();
            fix.elementRef.nativeElement.parentElement.removeChild(fix.elementRef.nativeElement);
            fix.componentInstance.overlay.show(fix.elementRef);

            tick();
            const overlayDiv = document.getElementsByClassName(CLASS_OVERLAY_MAIN)[0];
            expect(overlayDiv).toBeDefined();
            expect(overlayDiv.children.length).toEqual(1);
            const wrapperDiv = overlayDiv.children[0];
            expect(wrapperDiv).toBeDefined();
            expect(wrapperDiv.classList.contains(CLASS_OVERLAY_WRAPPER_MODAL)).toBeTruthy();
            expect(wrapperDiv.children[0].localName).toEqual('div');

            const contentDiv = wrapperDiv.children[0];
            expect(contentDiv).toBeDefined();
            expect(contentDiv.classList.contains(CLASS_OVERLAY_CONTENT_MODAL)).toBeTruthy();
        }));

        it('fix for #2486 - filtering dropdown is not correctly positioned', fakeAsync(() => {
            const fix = TestBed.createComponent(WidthTestOverlayComponent);
            fix.debugElement.nativeElement.style.transform = 'translatex(100px)';

            fix.detectChanges();
            tick();

            fix.componentInstance.overlaySettings.outlet = fix.componentInstance.elementRef;

            const buttonElement: HTMLElement = fix.componentInstance.buttonElement.nativeElement;
            buttonElement.click();

            fix.detectChanges();
            tick();

            const wrapper = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0];
            expect(wrapper.getBoundingClientRect().left).toBe(100);
            expect(fix.componentInstance.customComponent.nativeElement.getBoundingClientRect().left).toBe(400);
        }));

        it('fix for @2798 - Allow canceling of open and close of IgxDropDown through onOpening and onClosing events', fakeAsync(() => {
            const fix = TestBed.createComponent(SimpleRefComponent);
            fix.detectChanges();
            const overlayInstance = fix.componentInstance.overlay;

            overlayInstance.onClosing.subscribe((e: OverlayCancelableEventArgs) => {
                e.cancel = true;
            });

            spyOn(overlayInstance.onClosed, 'emit').and.callThrough();
            spyOn(overlayInstance.onClosing, 'emit').and.callThrough();
            spyOn(overlayInstance.onOpened, 'emit').and.callThrough();
            spyOn(overlayInstance.onOpening, 'emit').and.callThrough();

            const firstCallId = overlayInstance.show(SimpleDynamicComponent);
            tick();

            expect(overlayInstance.onOpening.emit).toHaveBeenCalledTimes(1);
            expect(overlayInstance.onOpened.emit).toHaveBeenCalledTimes(1);

            overlayInstance.hide(firstCallId);
            tick();

            expect(overlayInstance.onClosing.emit).toHaveBeenCalledTimes(1);
            expect(overlayInstance.onClosed.emit).toHaveBeenCalledTimes(0);

            overlayInstance.onOpening.subscribe((e: OverlayCancelableEventArgs) => {
                e.cancel = true;
            });

            overlayInstance.show(fix.componentInstance.item);
            tick();

            expect(overlayInstance.onOpening.emit).toHaveBeenCalledTimes(2);
            expect(overlayInstance.onOpened.emit).toHaveBeenCalledTimes(1);
        }));
    });

    describe('Unit Tests p2 (overrides): ', () => {
        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [IgxToggleModule, DynamicModule, NoopAnimationsModule],
                declarations: DIRECTIVE_COMPONENTS
            });
        }));
        afterAll(() => {
            TestBed.resetTestingModule();
        });
        it('Should properly initialize Scroll Strategy - Block.', fakeAsync( async () => {
            TestBed.overrideComponent(EmptyPageComponent, {
                set: {
                    styles: [`button {
                position: absolute,
                bottom: 200%;
            }`]
                }
            });
            await TestBed.compileComponents();
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();

            const scrollStrat = new BlockScrollStrategy();
            const overlaySettings: OverlaySettings = {
                positionStrategy: new GlobalPositionStrategy(),
                scrollStrategy: scrollStrat,
                modal: false,
                closeOnOutsideClick: false
            };
            const overlay = fixture.componentInstance.overlay;
            spyOn(scrollStrat, 'initialize').and.callThrough();
            spyOn(scrollStrat, 'attach').and.callThrough();
            spyOn(scrollStrat, 'detach').and.callThrough();
            const scrollSpy = spyOn<any>(scrollStrat, 'onScroll').and.callThrough();
            const wheelSpy = spyOn<any>(scrollStrat, 'onWheel').and.callThrough();
            overlay.show(SimpleDynamicComponent, overlaySettings);
            tick();

            expect(scrollStrat.attach).toHaveBeenCalledTimes(1);
            expect(scrollStrat.initialize).toHaveBeenCalledTimes(1);
            expect(scrollStrat.detach).toHaveBeenCalledTimes(0);
            document.dispatchEvent(new Event('scroll'));

            expect(scrollSpy).toHaveBeenCalledTimes(1);

            document.dispatchEvent(new Event('wheel'));
            expect(wheelSpy).toHaveBeenCalledTimes(1);
            overlay.hide('0');
            tick();
            expect(scrollStrat.detach).toHaveBeenCalledTimes(1);
        }));

        it('Should properly initialize Scroll Strategy - Absolute.', fakeAsync(async () => {
            TestBed.overrideComponent(EmptyPageComponent, {
                set: {
                    styles: [`button {
                position: absolute,
                bottom: 200%;
            }`]
                }
            });
            await TestBed.compileComponents();
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();

            const scrollStrat = new AbsoluteScrollStrategy();
            const overlaySettings: OverlaySettings = {
                positionStrategy: new GlobalPositionStrategy(),
                scrollStrategy: scrollStrat,
                modal: false,
                closeOnOutsideClick: false
            };
            const overlay = fixture.componentInstance.overlay;
            spyOn(scrollStrat, 'initialize').and.callThrough();
            spyOn(scrollStrat, 'attach').and.callThrough();
            spyOn(scrollStrat, 'detach').and.callThrough();
            const scrollSpy = spyOn<any>(scrollStrat, 'onScroll').and.callThrough();
            overlay.show(SimpleDynamicComponent, overlaySettings);
            tick();

            expect(scrollStrat.attach).toHaveBeenCalledTimes(1);
            expect(scrollStrat.initialize).toHaveBeenCalledTimes(1);
            expect(scrollStrat.detach).toHaveBeenCalledTimes(0);
            document.dispatchEvent(new Event('scroll'));
            expect(scrollSpy).toHaveBeenCalledTimes(1);
            overlay.hide('0');
            tick();
            expect(scrollStrat.detach).toHaveBeenCalledTimes(1);
        }));

        it('Should properly initialize Scroll Strategy - Close.', fakeAsync(async () => {
            TestBed.overrideComponent(EmptyPageComponent, {
                set: {
                    styles: [`button {
                position: absolute,
                bottom: 200%;
            }`]
                }
            });
            await TestBed.compileComponents();
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();
            const scrollStrat = new CloseScrollStrategy();
            const overlaySettings: OverlaySettings = {
                positionStrategy: new GlobalPositionStrategy(),
                scrollStrategy: scrollStrat,
                modal: false,
                closeOnOutsideClick: false
            };
            const overlay = fixture.componentInstance.overlay;
            spyOn(scrollStrat, 'initialize').and.callThrough();
            spyOn(scrollStrat, 'attach').and.callThrough();
            spyOn(scrollStrat, 'detach').and.callThrough();
            const scrollSpy = spyOn<any>(scrollStrat, 'onScroll').and.callThrough();
            overlay.show(SimpleDynamicComponent, overlaySettings);
            tick();

            expect(scrollStrat.attach).toHaveBeenCalledTimes(1);
            expect(scrollStrat.initialize).toHaveBeenCalledTimes(1);
            expect(scrollStrat.detach).toHaveBeenCalledTimes(0);
            document.dispatchEvent(new Event('scroll'));

            expect(scrollSpy).toHaveBeenCalledTimes(1);
            overlay.hide('0');
            tick();
            expect(scrollStrat.detach).toHaveBeenCalledTimes(1);
        }));
    });

    describe('Integration tests: ', () => {
        configureTestSuite();
        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [IgxToggleModule, DynamicModule, NoopAnimationsModule],
                declarations: DIRECTIVE_COMPONENTS
            }).compileComponents();
        }));

        // 1. Positioning Strategies
        // 1.1 Global (show components in the window center - default).
        it('Should render igx-overlay on top of all other views/components (any previously existing html on the page) etc.',
            fakeAsync(() => {
                const fixture = TestBed.createComponent(EmptyPageComponent);
                fixture.detectChanges();
                const overlaySettings: OverlaySettings = {
                    positionStrategy: new GlobalPositionStrategy(),
                    scrollStrategy: new NoOpScrollStrategy(),
                    modal: false,
                    closeOnOutsideClick: false
                };
                const positionSettings: PositionSettings = {
                    horizontalDirection: HorizontalAlignment.Right,
                    verticalDirection: VerticalAlignment.Bottom,
                    target: fixture.componentInstance.buttonElement.nativeElement,
                    horizontalStartPoint: HorizontalAlignment.Left,
                    verticalStartPoint: VerticalAlignment.Top
                };
                overlaySettings.positionStrategy = new GlobalPositionStrategy(positionSettings);
                fixture.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
                tick();
                fixture.detectChanges();
                const overlayDiv = document.getElementsByClassName(CLASS_OVERLAY_MAIN)[0];
                const wrapper = overlayDiv.children[0];
                expect(wrapper.classList).toContain(CLASS_OVERLAY_WRAPPER);
            }));

        it('Should cover the whole window 100% width and height.', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();

            fixture.componentInstance.buttonElement.nativeElement.click();
            tick();

            fixture.detectChanges();
            const overlayDiv = document.getElementsByClassName(CLASS_OVERLAY_MAIN)[0];
            const overlayWrapper = overlayDiv.children[0];
            const overlayRect = overlayWrapper.getBoundingClientRect();
            const windowRect = document.body.getBoundingClientRect();
            expect(overlayRect.width).toEqual(windowRect.width);
            expect(overlayRect.height).toEqual(windowRect.height);
            expect(overlayRect.left).toEqual(windowRect.left);
            expect(overlayRect.top).toEqual(windowRect.top);
        }));

        it('Should show the component inside the igx-overlay wrapper as a content last child.', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();
            const overlaySettings: OverlaySettings = {
                positionStrategy: new GlobalPositionStrategy(),
                scrollStrategy: new NoOpScrollStrategy(),
                modal: false,
                closeOnOutsideClick: false
            };
            fixture.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
            tick();
            const overlayDiv = document.getElementsByClassName(CLASS_OVERLAY_MAIN)[0];
            const overlayWrapper = overlayDiv.children[0];
            const content = overlayWrapper.firstChild;
            const componentEl = content.lastChild;

            expect(overlayWrapper.localName).toEqual('div');
            expect(overlayWrapper.firstChild.localName).toEqual('div');
            expect(componentEl.localName === 'div').toBeTruthy();
        }));

        it('Should apply the corresponding inline css to the overlay wrapper div element for each alignment.', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();

            const overlaySettings: OverlaySettings = {
                positionStrategy: new GlobalPositionStrategy(),
                scrollStrategy: new NoOpScrollStrategy(),
                modal: false,
                closeOnOutsideClick: false
            };
            const positionSettings: PositionSettings = {
                target: new Point(0, 0),
                horizontalDirection: HorizontalAlignment.Left,
                verticalDirection: VerticalAlignment.Top,
                horizontalStartPoint: HorizontalAlignment.Left,
                verticalStartPoint: VerticalAlignment.Top
            };

            const horAl = Object.keys(HorizontalAlignment).filter(key => !isNaN(Number(HorizontalAlignment[key])));
            const verAl = Object.keys(VerticalAlignment).filter(key => !isNaN(Number(VerticalAlignment[key])));
            const cssStyles: Array<string> = ['flex-start', 'center', 'flex-end'];

            for (let i = 0; i < horAl.length; i++) {
                positionSettings.horizontalDirection = HorizontalAlignment[horAl[i]];
                for (let j = 0; j < verAl.length; j++) {
                    positionSettings.verticalDirection = VerticalAlignment[verAl[j]];
                    overlaySettings.positionStrategy = new GlobalPositionStrategy(positionSettings);
                    fixture.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
                    tick();

                    const overlayDiv = document.getElementsByClassName(CLASS_OVERLAY_MAIN)[0];
                    const overlayWrapper = overlayDiv.children[i * 3 + j] as HTMLDivElement;
                    expect(overlayWrapper.style.justifyContent).toBe(cssStyles[i]);
                    expect(overlayWrapper.style.alignItems).toBe(cssStyles[j]);
                }
            }
        }));

        it('Should center the shown component in the igx-overlay (visible window) - default.', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();
            fixture.componentInstance.overlay.show(SimpleDynamicComponent);
            tick();
            const overlayDiv = document.getElementsByClassName(CLASS_OVERLAY_MAIN)[0];
            const overlayWrapper = overlayDiv.children[0] as HTMLElement;
            const componentEl = overlayWrapper.children[0].children[0];
            const wrapperRect = overlayWrapper.getBoundingClientRect();
            const componentRect = componentEl.getBoundingClientRect();
            expect(wrapperRect.width / 2 - componentRect.width / 2).toEqual(componentRect.left);
            expect(wrapperRect.height / 2 - componentRect.height / 2).toEqual(componentRect.top);
            expect(componentRect.left).toEqual(componentRect.right - componentRect.width);
            expect(componentRect.top).toEqual(componentRect.bottom - componentRect.height);
        }));

        it('Should display a new instance of the same component/options exactly on top of the previous one.', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();
            fixture.componentInstance.overlay.show(SimpleDynamicComponent);
            fixture.componentInstance.overlay.show(SimpleDynamicComponent);
            tick();
            const overlayDiv = document.getElementsByClassName(CLASS_OVERLAY_MAIN)[0];
            const overlayWrapper_1 = overlayDiv.children[0];
            const componentEl_1 = overlayWrapper_1.children[0].children[0];
            const overlayWrapper_2 = overlayDiv.children[1];
            const componentEl_2 = overlayWrapper_2.children[0].children[0];
            const componentRect_1 = componentEl_1.getBoundingClientRect();
            const componentRect_2 = componentEl_2.getBoundingClientRect();
            expect(componentRect_1.left).toEqual(componentRect_2.left);
            expect(componentRect_1.top).toEqual(componentRect_2.top);
            expect(componentRect_1.width).toEqual(componentRect_2.width);
            expect(componentRect_1.height).toEqual(componentRect_2.height);
        }));

        it('Should show a component bigger than the visible window as centered and scrollbars should not appear.', fakeAsync(() => {

            // overlay div is forced to has width and height equal to 0. This will prevent body
            // to show any scrollbars whatever the size of the component is.
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();
            let hasScrollbar = document.body.scrollHeight > document.body.clientHeight;
            expect(hasScrollbar).toBeFalsy();
            fixture.componentInstance.overlay.show(SimpleBigSizeComponent);
            tick();
            const overlayDiv = document.getElementsByClassName(CLASS_OVERLAY_MAIN)[0];
            const overlayWrapper = overlayDiv.children[0];
            const componentEl = overlayWrapper.children[0].children[0];
            const wrapperRect = overlayWrapper.getBoundingClientRect();
            const componentRect = componentEl.getBoundingClientRect();

            // display:flex parent will keep the content container within the wrapper in width (x, left = 0, right = width)
            expect(componentRect.left).toBe(0);
            expect(wrapperRect.width).toEqual(wrapperRect.right);
            expect(wrapperRect.height).toEqual(wrapperRect.bottom);
            expect(componentRect.top).toBeLessThan(0);
            expect(wrapperRect.height / 2).toEqual(componentRect.top + componentRect.height / 2);
            hasScrollbar = document.body.scrollHeight > document.body.clientHeight;
            expect(hasScrollbar).toBeFalsy();
        }));

        // 1.1.1 Global Css
        it('Should apply the css class on igx-overlay component div wrapper.' +
            'Test defaults: When no positionStrategy is passed use GlobalPositionStrategy with default PositionSettings and css class.',
            fakeAsync(() => {
                const fixture = TestBed.createComponent(EmptyPageComponent);
                fixture.detectChanges();
                fixture.componentInstance.overlay.show(SimpleDynamicComponent);
                tick();
                fixture.detectChanges();

                // overlay container IS NOT a child of the debugElement (attached to body, not app-root)
                const overlayWrapper = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER_MODAL)[0];
                expect(overlayWrapper).toBeTruthy();
                expect(overlayWrapper.localName).toEqual('div');
            })
        );

        it('Should apply css class on igx-overlay component inner div wrapper.', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();
            const overlaySettings: OverlaySettings = {
                positionStrategy: new GlobalPositionStrategy(),
                scrollStrategy: new NoOpScrollStrategy(),
                modal: false,
                closeOnOutsideClick: false
            };
            fixture.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
            tick();
            fixture.detectChanges();
            const content = document.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0];
            expect(content).toBeTruthy();
            expect(content.localName).toEqual('div');
        }));

        // 1.2 ConnectedPositioningStrategy(show components based on a specified position base point, horizontal and vertical alignment)
        it('Should render on top of all other views/components (any previously existing html on the page) etc.', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();
            const overlaySettings: OverlaySettings = {
                positionStrategy: new ConnectedPositioningStrategy(),
                scrollStrategy: new NoOpScrollStrategy(),
                modal: false,
                closeOnOutsideClick: false
            };
            const positionSettings: PositionSettings = {
                horizontalDirection: HorizontalAlignment.Right,
                verticalDirection: VerticalAlignment.Bottom,
                target: fixture.componentInstance.buttonElement.nativeElement,
                horizontalStartPoint: HorizontalAlignment.Left,
                verticalStartPoint: VerticalAlignment.Top
            };
            overlaySettings.positionStrategy = new ConnectedPositioningStrategy(positionSettings);
            fixture.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
            tick();
            const wrapper = document.getElementsByClassName(CLASS_OVERLAY_MAIN)[0];
            expect(wrapper).toBeDefined();
            expect(wrapper.classList).toContain(CLASS_OVERLAY_MAIN);
        }));

        it('Should cover the whole window 100% width and height.', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();
            const overlaySettings: OverlaySettings = {
                positionStrategy: new GlobalPositionStrategy(),
                scrollStrategy: new NoOpScrollStrategy(),
                modal: false,
                closeOnOutsideClick: false
            };
            const positionSettings: PositionSettings = {
                horizontalDirection: HorizontalAlignment.Right,
                verticalDirection: VerticalAlignment.Bottom,
                target: fixture.componentInstance.buttonElement.nativeElement,
                horizontalStartPoint: HorizontalAlignment.Left,
                verticalStartPoint: VerticalAlignment.Top
            };
            overlaySettings.positionStrategy = new ConnectedPositioningStrategy(positionSettings);
            fixture.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
            tick();
            const wrapper = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0];
            const body = document.getElementsByTagName('body')[0];
            expect(wrapper.clientHeight).toEqual(body.clientHeight);
            expect(wrapper.clientWidth).toEqual(body.clientWidth);
        }));

        it('It should position the shown component inside the igx-overlay wrapper as a content last child.', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();
            const overlaySettings: OverlaySettings = {
                positionStrategy: new GlobalPositionStrategy(),
                scrollStrategy: new NoOpScrollStrategy(),
                modal: false,
                closeOnOutsideClick: false
            };
            overlaySettings.positionStrategy = new ConnectedPositioningStrategy();

            fixture.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
            tick();
            const overlayWrapper = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0];
            const content = overlayWrapper.firstChild;
            const componentEl = content.lastChild;
            expect(overlayWrapper.localName).toEqual('div');
            expect(overlayWrapper.firstChild.localName).toEqual('div');
            expect(componentEl.localName === 'div').toBeTruthy();
        }));

        it(`Should use StartPoint:Left/Bottom, Direction Right/Bottom and openAnimation: scaleInVerTop, closeAnimation: scaleOutVerTop
            as default options when using a ConnectedPositioningStrategy without passing other but target element options.`, () => {
                const targetEl: HTMLElement = <HTMLElement>document.getElementsByClassName('300_button')[0];
                const positionSettings2 = {
                    target: targetEl
                };

                const strategy = new ConnectedPositioningStrategy(positionSettings2);

                const expectedDefaults = {
                    target: targetEl,
                    horizontalDirection: HorizontalAlignment.Right,
                    verticalDirection: VerticalAlignment.Bottom,
                    horizontalStartPoint: HorizontalAlignment.Left,
                    verticalStartPoint: VerticalAlignment.Bottom,
                    openAnimation: scaleInVerTop,
                    closeAnimation: scaleOutVerTop
                };

                expect(strategy.settings).toEqual(expectedDefaults);
            });

        it(`Should use  target: null StartPoint:Left/Bottom, Direction Right/Bottom and openAnimation: scaleInVerTop,
            closeAnimation: scaleOutVerTop as default options when using a ConnectedPositioningStrategy without passing options.`, () => {
                const strategy = new ConnectedPositioningStrategy();

                const expectedDefaults = {
                    target: null,
                    horizontalDirection: HorizontalAlignment.Right,
                    verticalDirection: VerticalAlignment.Bottom,
                    horizontalStartPoint: HorizontalAlignment.Left,
                    verticalStartPoint: VerticalAlignment.Bottom,
                    openAnimation: scaleInVerTop,
                    closeAnimation: scaleOutVerTop
                };

                expect(strategy.settings).toEqual(expectedDefaults);
            });

        // adding more than one component to show in igx-overlay:
        it('Should render the component exactly on top of the previous one when adding a new instance with default settings.', () => {
            const fixture = TestBed.createComponent(TopLeftOffsetComponent);
            const overlaySettings: OverlaySettings = {
                positionStrategy: new ConnectedPositioningStrategy()
            };
            fixture.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
            fixture.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
            fixture.detectChanges();

            const overlayWrapper_1 = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER_MODAL)[0];
            const componentEl_1 = overlayWrapper_1.children[0].children[0];
            const overlayWrapper_2 = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER_MODAL)[1];
            const componentEl_2 = overlayWrapper_2.children[0].children[0];
            const componentRect_1 = componentEl_1.getBoundingClientRect();
            const componentRect_2 = componentEl_2.getBoundingClientRect();
            expect(componentRect_1.left).toEqual(0);
            expect(componentRect_1.left).toEqual(componentRect_2.left);
            expect(componentRect_1.top).toEqual(0);
            expect(componentRect_1.top).toEqual(componentRect_2.top);
            expect(componentRect_1.width).toEqual(componentRect_2.width);
            expect(componentRect_1.height).toEqual(componentRect_2.height);
        });

        it('Should render the component exactly on top of the previous one when adding a new instance with the same options.', () => {
            const fixture = TestBed.createComponent(TopLeftOffsetComponent);
            const x = 200;
            const y = 300;
            const positionSettings: PositionSettings = {
                target: new Point(x, y),
                horizontalDirection: HorizontalAlignment.Left,
                verticalDirection: VerticalAlignment.Top,
                horizontalStartPoint: HorizontalAlignment.Left,
                verticalStartPoint: VerticalAlignment.Bottom,
            };
            const overlaySettings: OverlaySettings = {
                positionStrategy: new ConnectedPositioningStrategy(positionSettings)
            };
            fixture.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
            fixture.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
            fixture.detectChanges();

            const overlayWrapper_1 = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER_MODAL)[0];
            const componentEl_1 = overlayWrapper_1.children[0].children[0];
            const overlayWrapper_2 = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER_MODAL)[1];
            const componentEl_2 = overlayWrapper_2.children[0].children[0];
            const componentRect_1 = componentEl_1.getBoundingClientRect();
            const componentRect_2 = componentEl_2.getBoundingClientRect();
            expect(componentRect_1.left).toEqual(x - componentRect_1.width);
            expect(componentRect_1.left).toEqual(componentRect_2.left);
            expect(componentRect_1.top).toEqual(y - componentRect_1.height);
            expect(componentRect_1.top).toEqual(componentRect_2.top);
            expect(componentRect_1.width).toEqual(componentRect_2.width);
            expect(componentRect_1.height).toEqual(componentRect_2.height);
        });

        it(`Should change the state of the component to closed when reaching threshold and closing scroll strategy is used.`,
            fakeAsync(() => {
                const fixture = TestBed.createComponent(EmptyPageComponent);

                //  add one div far away to the right and to the bottom in order scrollbars to appear on page
                addScrollDivToElement(fixture.nativeElement);

                const scrollStrat = new CloseScrollStrategy();
                fixture.detectChanges();
                const overlaySettings: OverlaySettings = {
                    positionStrategy: new GlobalPositionStrategy(),
                    scrollStrategy: scrollStrat,
                    modal: false,
                    closeOnOutsideClick: false
                };
                const overlay = fixture.componentInstance.overlay;
                overlay.show(SimpleDynamicComponent, overlaySettings);
                tick();

                expect(document.documentElement.scrollTop).toEqual(0);
                document.documentElement.scrollTop += 9;
                document.dispatchEvent(new Event('scroll'));
                tick();
                expect(document.documentElement.scrollTop).toEqual(9);
                expect(document.getElementsByClassName(CLASS_OVERLAY_WRAPPER).length).toEqual(1);
                document.documentElement.scrollTop += 25;
                document.dispatchEvent(new Event('scroll'));
                tick();
                expect(document.getElementsByClassName(CLASS_OVERLAY_WRAPPER).length).toEqual(0);
            }));

        it('Should scroll component with the scrolling container when absolute scroll strategy is used.', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);

            //  add one div far away to the right and to the bottom in order scrollbars to appear on page
            addScrollDivToElement(fixture.nativeElement);
            const scrollStrat = new AbsoluteScrollStrategy();
            fixture.detectChanges();
            const overlaySettings: OverlaySettings = {
                positionStrategy: new ConnectedPositioningStrategy(),
                scrollStrategy: scrollStrat,
                modal: false,
                closeOnOutsideClick: false
            };
            const buttonElement = fixture.componentInstance.buttonElement.nativeElement;
            const overlay = fixture.componentInstance.overlay;
            overlay.show(SimpleDynamicComponent, overlaySettings);
            tick();

            expect(document.documentElement.scrollTop).toEqual(0);
            let overlayElement = document.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0] as HTMLElement;
            let overlayChildPosition: DOMRect = overlayElement.lastElementChild.getBoundingClientRect() as DOMRect;
            expect(overlayChildPosition.y).toEqual(0);
            expect(buttonElement.getBoundingClientRect().y).toEqual(0);
            document.dispatchEvent(new Event('scroll'));
            tick();
            expect(document.documentElement.scrollTop).toEqual(0);

            document.documentElement.scrollTop += 25;
            document.dispatchEvent(new Event('scroll'));
            tick();
            expect(document.documentElement.scrollTop).toEqual(25);
            overlayElement = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0] as HTMLElement;
            overlayChildPosition = overlayElement.lastElementChild.getBoundingClientRect() as DOMRect;
            expect(overlayChildPosition.y).toEqual(0);
            expect(buttonElement.getBoundingClientRect().y).toEqual(-25);

            document.documentElement.scrollTop += 500;
            document.dispatchEvent(new Event('scroll'));
            tick();
            overlayElement = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0] as HTMLElement;
            overlayChildPosition = overlayElement.lastElementChild.getBoundingClientRect() as DOMRect;
            expect(overlayChildPosition.y).toEqual(0);
            expect(buttonElement.getBoundingClientRect().y).toEqual(-525);
            expect(document.documentElement.scrollTop).toEqual(525);
            expect(document.getElementsByClassName(CLASS_OVERLAY_WRAPPER).length).toEqual(1);
            scrollStrat.detach();
            document.documentElement.scrollTop = 0;
        }));

        // 1.2.1 Connected Css
        it('Should apply css class on igx-overlay component div wrapper.', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();
            const overlaySettings: OverlaySettings = {
                positionStrategy: new ConnectedPositioningStrategy(),
                scrollStrategy: new NoOpScrollStrategy(),
                modal: false,
                closeOnOutsideClick: false
            };

            fixture.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
            tick();

            // overlay container IS NOT a child of the debugElement (attached to body, not app-root)
            const overlayWrapper = document.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0];
            expect(overlayWrapper).toBeTruthy();
            expect(overlayWrapper.localName).toEqual('div');
        }));

        // 1.2.2 Connected strategy position method
        it('Should position component based on Point only when connected position strategy is used.', () => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();

            // for a Point(300,300);
            const expectedTopForPoint: Array<string> = ['240px', '270px', '300px'];  // top/middle/bottom/
            const expectedLeftForPoint: Array<string> = ['240px', '270px', '300px']; // left/center/right/

            const size = { width: 60, height: 60 };
            const compElement = document.createElement('div');
            compElement.setAttribute('style', 'width:60px; height:60px; color:green; border: 1px solid blue;');
            const contentWrapper = document.createElement('div');
            contentWrapper.setAttribute('style', 'width:80px; height:80px; color:gray;');
            contentWrapper.classList.add('contentWrapper');
            contentWrapper.appendChild(compElement);
            document.body.appendChild(contentWrapper);

            const horAl = Object.keys(HorizontalAlignment).filter(key => !isNaN(Number(HorizontalAlignment[key])));
            const verAl = Object.keys(VerticalAlignment).filter(key => !isNaN(Number(VerticalAlignment[key])));

            fixture.detectChanges();
            for (let i = 0; i < horAl.length; i++) {
                for (let j = 0; j < verAl.length; j++) {

                    // start Point is static Top/Left at 300/300
                    const positionSettings2 = {
                        target: new Point(300, 300),
                        horizontalDirection: HorizontalAlignment[horAl[i]],
                        verticalDirection: VerticalAlignment[verAl[j]],
                        element: null,
                        horizontalStartPoint: HorizontalAlignment.Left,
                        verticalStartPoint: VerticalAlignment.Top
                    };

                    const strategy = new ConnectedPositioningStrategy(positionSettings2);
                    strategy.position(contentWrapper, size);
                    fixture.detectChanges();
                    expect(contentWrapper.style.top).toBe(expectedTopForPoint[j]);
                    expect(contentWrapper.style.left).toBe(expectedLeftForPoint[i]);
                }
            }
            document.body.removeChild(contentWrapper);
        });

        it('Should position component based on element and start point when connected position strategy is used.', () => {
            const fixture = TestBed.createComponent(TopLeftOffsetComponent);
            fixture.detectChanges();

            // for a Point(300,300);
            const expectedTopForPoint: Array<number> = [240, 270, 300];  // top/middle/bottom/
            const expectedLeftForPoint: Array<number> = [240, 270, 300]; // left/center/right/

            const size = { width: 60, height: 60 };
            const compElement = document.createElement('div');
            compElement.setAttribute('style', 'width:60px; height:60px; color:green; border: 1px solid blue;');
            const contentWrapper = document.createElement('div');
            contentWrapper.setAttribute('style', 'width:80px; height:80px; color:gray;');
            contentWrapper.classList.add('contentWrapper');
            contentWrapper.appendChild(compElement);
            document.body.appendChild(contentWrapper);

            const horAl = Object.keys(HorizontalAlignment).filter(key => !isNaN(Number(HorizontalAlignment[key])));
            const verAl = Object.keys(VerticalAlignment).filter(key => !isNaN(Number(VerticalAlignment[key])));
            const targetEl: HTMLElement = <HTMLElement>document.getElementsByClassName('300_button')[0];

            fixture.detectChanges();

            // loop trough and test all possible combinations (count 81) for StartPoint and Direction.
            for (let lsp = 0; lsp < horAl.length; lsp++) {
                for (let tsp = 0; tsp < verAl.length; tsp++) {
                    for (let i = 0; i < horAl.length; i++) {
                        for (let j = 0; j < verAl.length; j++) {
                            // TODO: add additional check for different start points
                            // start Point is static Top/Left at 300/300
                            const positionSettings2 = {
                                target: targetEl,
                                horizontalDirection: HorizontalAlignment[horAl[i]],
                                verticalDirection: VerticalAlignment[verAl[j]],
                                element: null,
                                horizontalStartPoint: HorizontalAlignment[horAl[lsp]],
                                verticalStartPoint: VerticalAlignment[verAl[tsp]],
                            };
                            const strategy = new ConnectedPositioningStrategy(positionSettings2);
                            strategy.position(contentWrapper, size);
                            fixture.detectChanges();
                            expect(contentWrapper.style.top).toBe((expectedTopForPoint[j] + 30 * tsp) + 'px');
                            expect(contentWrapper.style.left).toBe((expectedLeftForPoint[i] + 50 * lsp) + 'px');
                        }
                    }
                }
            }
            document.body.removeChild(contentWrapper);
        });

        // 1.3 AutoPosition (fit the shown component into the visible window.)
        it('Should render igx-overlay on top of all other views/components (any previously existing html on the page) etc.',
            fakeAsync(() => {
                const fix = TestBed.createComponent(EmptyPageComponent);
                fix.detectChanges();
                const overlaySettings: OverlaySettings = {
                    positionStrategy: new GlobalPositionStrategy(),
                    scrollStrategy: new NoOpScrollStrategy(),
                    modal: false,
                    closeOnOutsideClick: false
                };

                const positionSettings: PositionSettings = {
                    horizontalDirection: HorizontalAlignment.Right,
                    verticalDirection: VerticalAlignment.Bottom,
                    target: fix.componentInstance.buttonElement.nativeElement,
                    horizontalStartPoint: HorizontalAlignment.Left,
                    verticalStartPoint: VerticalAlignment.Top
                };
                overlaySettings.positionStrategy = new AutoPositionStrategy(positionSettings);
                fix.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
                tick();
                fix.detectChanges();
                const wrapper = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0];
                expect(wrapper).toBeDefined();
                expect(wrapper.classList).toContain(CLASS_OVERLAY_WRAPPER);
            }));

        it('Should cover the whole window 100% width and height.', fakeAsync(() => {
            const fix = TestBed.createComponent(EmptyPageComponent);
            fix.detectChanges();
            const overlaySettings: OverlaySettings = {
                positionStrategy: new GlobalPositionStrategy(),
                scrollStrategy: new NoOpScrollStrategy(),
                modal: false,
                closeOnOutsideClick: false
            };
            const positionSettings: PositionSettings = {
                horizontalDirection: HorizontalAlignment.Right,
                verticalDirection: VerticalAlignment.Bottom,
                target: fix.componentInstance.buttonElement.nativeElement,
                horizontalStartPoint: HorizontalAlignment.Left,
                verticalStartPoint: VerticalAlignment.Top
            };
            overlaySettings.positionStrategy = new AutoPositionStrategy(positionSettings);
            fix.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
            tick();
            fix.detectChanges();
            const wrapper = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0];
            const body = document.getElementsByTagName('body')[0];
            expect(wrapper.clientHeight).toEqual(body.clientHeight);
            expect(wrapper.clientWidth).toEqual(body.clientWidth);
        }));

        it('Should append the shown component inside the igx-overlay as a last child.', fakeAsync(() => {
            const fix = TestBed.createComponent(EmptyPageComponent);
            fix.detectChanges();
            const overlaySettings: OverlaySettings = {
                positionStrategy: new GlobalPositionStrategy(),
                scrollStrategy: new NoOpScrollStrategy(),
                modal: false,
                closeOnOutsideClick: false
            };
            const positionSettings: PositionSettings = {
                horizontalDirection: HorizontalAlignment.Right,
                verticalDirection: VerticalAlignment.Bottom,
                target: fix.componentInstance.buttonElement.nativeElement,
                horizontalStartPoint: HorizontalAlignment.Left,
                verticalStartPoint: VerticalAlignment.Top
            };
            overlaySettings.positionStrategy = new AutoPositionStrategy(positionSettings);
            fix.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
            tick();

            fix.detectChanges();
            const wrappers = document.getElementsByClassName(CLASS_OVERLAY_CONTENT);
            const wrapperContent = wrappers[wrappers.length - 1];
            expect(wrapperContent.children.length).toEqual(1);
            expect(wrapperContent.lastElementChild.getAttribute('style'))
                .toEqual('position: absolute; width:100px; height: 100px; background-color: red');
        }));

        it('Should show the component inside of the viewport if it would normally be outside of bounds, BOTTOM + RIGHT.', fakeAsync(() => {
            const fix = TestBed.createComponent(DownRightButtonComponent);
            fix.detectChanges();
            const currentElement = fix.componentInstance;
            const buttonElement = fix.componentInstance.buttonElement.nativeElement;
            fix.detectChanges();
            currentElement.ButtonPositioningSettings.horizontalDirection = HorizontalAlignment.Right;
            currentElement.ButtonPositioningSettings.verticalDirection = VerticalAlignment.Bottom;
            currentElement.ButtonPositioningSettings.verticalStartPoint = VerticalAlignment.Bottom;
            currentElement.ButtonPositioningSettings.horizontalStartPoint = HorizontalAlignment.Right;
            currentElement.ButtonPositioningSettings.target = buttonElement;
            buttonElement.click();
            fix.detectChanges();
            tick();

            fix.detectChanges();
            const wrappers = document.getElementsByClassName(CLASS_OVERLAY_CONTENT);
            const wrapperContent = wrappers[wrappers.length - 1] as HTMLElement;
            const expectedStyle = 'position: absolute; width:100px; height: 100px; background-color: red';
            expect(wrapperContent.lastElementChild.getAttribute('style')).toEqual(expectedStyle);
            const buttonLeft = buttonElement.offsetLeft;
            const buttonTop = buttonElement.offsetTop;
            const expectedLeft = buttonLeft - wrapperContent.lastElementChild.clientWidth;
            const expectedTop = buttonTop - wrapperContent.lastElementChild.clientHeight;
            const wrapperLeft = wrapperContent.offsetLeft;
            const wrapperTop = wrapperContent.offsetTop;
            expect(wrapperTop).toEqual(expectedTop);
            expect(wrapperLeft).toEqual(expectedLeft);
        }));

        it('Should display each shown component based on the options specified if the component fits into the visible window.',
            fakeAsync(() => {
                const fix = TestBed.createComponent(EmptyPageComponent);
                fix.detectChanges();
                const button = fix.componentInstance.buttonElement.nativeElement;
                const positionSettings: PositionSettings = {
                    target: button
                };
                const overlaySettings: OverlaySettings = {
                    positionStrategy: new AutoPositionStrategy(positionSettings),
                    modal: false,
                    closeOnOutsideClick: false
                };
                const hAlignmentArray = Object.keys(HorizontalAlignment).filter(key => !isNaN(Number(HorizontalAlignment[key])));
                const vAlignmentArray = Object.keys(VerticalAlignment).filter(key => !isNaN(Number(VerticalAlignment[key])));
                vAlignmentArray.forEach(function (vAlignment) {
                    verifyOverlayBoundingSizeAndPosition(HorizontalAlignment.Left, VerticalAlignment.Bottom,
                        HorizontalAlignment.Right, VerticalAlignment[vAlignment]);
                    hAlignmentArray.forEach(function (hAlignment) {
                        verifyOverlayBoundingSizeAndPosition(HorizontalAlignment.Right, VerticalAlignment.Bottom,
                            HorizontalAlignment[hAlignment], VerticalAlignment[vAlignment]);
                    });
                });

                // TODO: refactor this function and use it in all tests when needed
                function verifyOverlayBoundingSizeAndPosition(horizontalDirection, verticalDirection,
                    horizontalAlignment, verticalAlignment) {
                    positionSettings.horizontalDirection = horizontalDirection;
                    positionSettings.verticalDirection = verticalDirection;
                    positionSettings.horizontalStartPoint = horizontalAlignment;
                    positionSettings.verticalStartPoint = verticalAlignment;
                    overlaySettings.positionStrategy = new AutoPositionStrategy(positionSettings);
                    fix.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
                    tick();
                    const buttonRect = button.getBoundingClientRect();
                    const overlayElement = document.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0];
                    const overlayRect = overlayElement.getBoundingClientRect();
                    const expectedTop = getExpectedTopPosition(verticalAlignment, buttonRect);
                    const expectedLeft = horizontalDirection === HorizontalAlignment.Left ?
                        buttonRect.right - overlayRect.width :
                        getExpectedLeftPosition(horizontalAlignment, buttonRect);
                    expect(overlayRect.top.toFixed(1)).toEqual(expectedTop.toFixed(1));
                    expect(overlayRect.bottom.toFixed(1)).toEqual((overlayRect.top + overlayRect.height).toFixed(1));
                    expect(overlayRect.left.toFixed(1)).toEqual(expectedLeft.toFixed(1));
                    expect(overlayRect.right.toFixed(1)).toEqual((overlayRect.left + overlayRect.width).toFixed(1));
                    fix.componentInstance.overlay.hideAll();
                }
            }));

        it(`Should reposition the component and render it correctly in the window, even when the rendering options passed
            should result in otherwise a partially hidden component. No scrollbars should appear.`,
            fakeAsync(() => {
                const fix = TestBed.createComponent(EmptyPageComponent);
                fix.detectChanges();
                const button = fix.componentInstance.buttonElement.nativeElement;
                const positionSettings: PositionSettings = {
                    target: button
                };
                const overlaySettings: OverlaySettings = {
                    positionStrategy: new AutoPositionStrategy(positionSettings),
                    modal: false,
                    closeOnOutsideClick: false
                };
                const hAlignmentArray = Object.keys(HorizontalAlignment).filter(key => !isNaN(Number(HorizontalAlignment[key])));
                const vAlignmentArray = Object.keys(VerticalAlignment).filter(key => !isNaN(Number(VerticalAlignment[key])));
                hAlignmentArray.forEach(function (hAlignment) {
                    vAlignmentArray.forEach(function (vAlignment) {
                        if (hAlignment === 'Center') {
                            verifyOverlayBoundingSizeAndPosition(HorizontalAlignment.Left, VerticalAlignment.Bottom,
                                HorizontalAlignment.Center, VerticalAlignment[vAlignment]);
                        }
                        if (vAlignment !== 'Top') {
                            verifyOverlayBoundingSizeAndPosition(HorizontalAlignment.Right, VerticalAlignment.Top,
                                HorizontalAlignment[hAlignment], VerticalAlignment[vAlignment]);
                            if (hAlignment !== 'Left') {
                                verifyOverlayBoundingSizeAndPosition(HorizontalAlignment.Left, VerticalAlignment.Top,
                                    HorizontalAlignment[hAlignment], VerticalAlignment[vAlignment]);
                            }
                        }
                    });
                });

                // TODO: refactor this function and use it in all tests when needed
                function verifyOverlayBoundingSizeAndPosition(horizontalDirection, verticalDirection,
                    horizontalAlignment, verticalAlignment) {
                    positionSettings.horizontalDirection = horizontalDirection;
                    positionSettings.verticalDirection = verticalDirection;
                    positionSettings.horizontalStartPoint = horizontalAlignment;
                    positionSettings.verticalStartPoint = verticalAlignment;
                    overlaySettings.positionStrategy = new AutoPositionStrategy(positionSettings);
                    fix.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
                    tick();
                    fix.detectChanges();
                    const buttonRect = button.getBoundingClientRect();
                    const overlayElement = document.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0];
                    const overlayRect = overlayElement.getBoundingClientRect();
                    const expectedTop = verticalDirection === VerticalAlignment.Top ?
                        buttonRect.top + buttonRect.height :
                        getExpectedTopPosition(verticalAlignment, buttonRect);
                    const expectedLeft = (horizontalDirection === HorizontalAlignment.Left &&
                        verticalDirection === VerticalAlignment.Top &&
                        horizontalAlignment === HorizontalAlignment.Right) ?
                        buttonRect.right - overlayRect.width :
                        (horizontalDirection === HorizontalAlignment.Right &&
                            verticalDirection === VerticalAlignment.Top) ?
                            getExpectedLeftPosition(horizontalAlignment, buttonRect) :
                            buttonRect.right;
                    expect(overlayRect.top.toFixed(1)).toEqual(expectedTop.toFixed(1));
                    expect(overlayRect.bottom.toFixed(1)).toEqual((overlayRect.top + overlayRect.height).toFixed(1));
                    expect(overlayRect.left.toFixed(1)).toEqual(expectedLeft.toFixed(1));
                    expect(overlayRect.right.toFixed(1)).toEqual((overlayRect.left + overlayRect.width).toFixed(1));
                    expect(document.body.scrollHeight > document.body.clientHeight).toBeFalsy(); // check scrollbar
                    fix.componentInstance.overlay.hideAll();
                }
            }));

        it('Should render margins correctly.', fakeAsync(() => {
            const expectedMargin = '0px';
            const fix = TestBed.createComponent(EmptyPageComponent);
            fix.detectChanges();
            const button = fix.componentInstance.buttonElement.nativeElement;
            const positionSettings: PositionSettings = {
                target: button
            };
            const overlaySettings: OverlaySettings = {
                positionStrategy: new AutoPositionStrategy(positionSettings),
                scrollStrategy: new NoOpScrollStrategy(),
                modal: false,
                closeOnOutsideClick: false
            };
            const hAlignmentArray = Object.keys(HorizontalAlignment).filter(key => !isNaN(Number(HorizontalAlignment[key])));
            const vAlignmentArray = Object.keys(VerticalAlignment).filter(key => !isNaN(Number(VerticalAlignment[key])));

            hAlignmentArray.forEach(function (hDirection) {
                vAlignmentArray.forEach(function (vDirection) {
                    hAlignmentArray.forEach(function (hAlignment) {
                        vAlignmentArray.forEach(function (vAlignment) {
                            verifyOverlayMargins(hDirection, vDirection, hAlignment, vAlignment);
                        });
                    });
                });
            });

            function verifyOverlayMargins(horizontalDirection, verticalDirection, horizontalAlignment, verticalAlignment) {
                positionSettings.horizontalDirection = horizontalDirection;
                positionSettings.verticalDirection = verticalDirection;
                positionSettings.horizontalStartPoint = horizontalAlignment;
                positionSettings.verticalStartPoint = verticalAlignment;
                overlaySettings.positionStrategy = new AutoPositionStrategy(positionSettings);
                fix.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
                tick();
                fix.detectChanges();
                const overlayWrapper = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0];
                const overlayContent = document.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0];
                const overlayElement = overlayContent.children[0];
                const wrapperMargin = window.getComputedStyle(overlayWrapper, null).getPropertyValue('margin');
                const contentMargin = window.getComputedStyle(overlayContent, null).getPropertyValue('margin');
                const elementMargin = window.getComputedStyle(overlayElement, null).getPropertyValue('margin');
                expect(wrapperMargin).toEqual(expectedMargin);
                expect(contentMargin).toEqual(expectedMargin);
                expect(elementMargin).toEqual(expectedMargin);
                fix.componentInstance.overlay.hideAll();
            }
        }));

        // When adding more than one component to show in igx-overlay:
        it('When the options used to fit the component in the window - adding a new instance of the component with the ' +
            ' same options will render it on top of the previous one.', fakeAsync(() => {
                const fix = TestBed.createComponent(EmptyPageComponent);
                fix.detectChanges();
                const button = fix.componentInstance.buttonElement.nativeElement;
                const positionSettings: PositionSettings = {
                    horizontalDirection: HorizontalAlignment.Right,
                    verticalDirection: VerticalAlignment.Bottom,
                    target: button,
                    horizontalStartPoint: HorizontalAlignment.Center,
                    verticalStartPoint: VerticalAlignment.Bottom
                };
                const overlaySettings: OverlaySettings = {
                    positionStrategy: new AutoPositionStrategy(positionSettings),
                    scrollStrategy: new NoOpScrollStrategy(),
                    modal: false,
                    closeOnOutsideClick: false
                };
                fix.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
                fix.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
                fix.detectChanges();
                tick();

                const buttonRect = button.getBoundingClientRect();
                const overlayWrapper_1 = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0];
                const componentEl_1 = overlayWrapper_1.children[0].children[0];
                const overlayWrapper_2 = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[1];
                const componentEl_2 = overlayWrapper_2.children[0].children[0];
                const componentRect_1 = componentEl_1.getBoundingClientRect();
                const componentRect_2 = componentEl_2.getBoundingClientRect();
                expect(componentRect_1.left.toFixed(1)).toEqual((buttonRect.left + buttonRect.width / 2).toFixed(1));
                expect(componentRect_1.left.toFixed(1)).toEqual(componentRect_2.left.toFixed(1));
                expect(componentRect_1.top.toFixed(1)).toEqual((buttonRect.top + buttonRect.height).toFixed(1));
                expect(componentRect_1.top.toFixed(1)).toEqual(componentRect_2.top.toFixed(1));
                expect(componentRect_1.width.toFixed(1)).toEqual(componentRect_2.width.toFixed(1));
                expect(componentRect_1.height.toFixed(1)).toEqual(componentRect_2.height.toFixed(1));
            }));

        // When adding more than one component to show in igx-overlay and the options used will not fit the component in the
        // window, so AutoPosition is used.
        it('When adding a new instance of the component with the same options, will render it on top of the previous one.',
            fakeAsync(() => {
                const fix = TestBed.createComponent(EmptyPageComponent);
                fix.detectChanges();
                const button = fix.componentInstance.buttonElement.nativeElement;
                const positionSettings: PositionSettings = {
                    horizontalDirection: HorizontalAlignment.Left,
                    verticalDirection: VerticalAlignment.Top,
                    target: button,
                    horizontalStartPoint: HorizontalAlignment.Left,
                    verticalStartPoint: VerticalAlignment.Top
                };
                const overlaySettings: OverlaySettings = {
                    positionStrategy: new AutoPositionStrategy(positionSettings),
                    scrollStrategy: new NoOpScrollStrategy(),
                    modal: false,
                    closeOnOutsideClick: false
                };
                fix.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
                tick();
                fix.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
                tick();
                const buttonRect = button.getBoundingClientRect();
                const overlayWrapper_1 = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0];
                const componentEl_1 = overlayWrapper_1.children[0].children[0];
                const overlayWrapper_2 = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[1];
                const componentEl_2 = overlayWrapper_2.children[0].children[0];
                const componentRect_1 = componentEl_1.getBoundingClientRect();
                const componentRect_2 = componentEl_2.getBoundingClientRect();
                expect(componentRect_1.left).toEqual(buttonRect.right); // Will be positioned on the right of the button
                expect(componentRect_1.left).toEqual(componentRect_2.left); // Are on the same spot
                // expect(componentRect_1.top).toEqual(buttonRect.top - componentEl_1.clientHeight); // Will be positioned on top of button
                expect(componentRect_1.top).toEqual(componentRect_2.top); // Will have the same top
                expect(componentRect_1.width).toEqual(componentRect_2.width); // Will have the same width
                expect(componentRect_1.height).toEqual(componentRect_2.height); // Will have the same height
            }));

        it(`Should persist the component's open state when scrolling, when scrolling and noOP scroll strategy is used
        (expanded DropDown remains expanded).`, fakeAsync(() => {
                // TO DO replace Spies with css class and/or getBoundingClientRect.
                const fixture = TestBed.createComponent(EmptyPageComponent);
                const scrollTolerance = 10;
                const scrollStrategy = new BlockScrollStrategy();
                const overlay = fixture.componentInstance.overlay;
                const overlaySettings: OverlaySettings = {
                    modal: false,
                    scrollStrategy: scrollStrategy,
                    positionStrategy: new GlobalPositionStrategy()
                };

                spyOn(scrollStrategy, 'initialize').and.callThrough();
                spyOn(scrollStrategy, 'attach').and.callThrough();
                spyOn(scrollStrategy, 'detach').and.callThrough();
                spyOn(overlay, 'hide').and.callThrough();

                const scrollSpy = spyOn<any>(scrollStrategy, 'onScroll').and.callThrough();

                overlay.show(SimpleDynamicComponent, overlaySettings);
                tick();
                expect(scrollStrategy.initialize).toHaveBeenCalledTimes(1);
                expect(scrollStrategy.attach).toHaveBeenCalledTimes(1);
                expect(scrollStrategy.detach).toHaveBeenCalledTimes(0);
                expect(overlay.hide).toHaveBeenCalledTimes(0);
                document.documentElement.scrollTop += scrollTolerance;
                document.dispatchEvent(new Event('scroll'));
                tick();
                expect(scrollSpy).toHaveBeenCalledTimes(1);
                expect(overlay.hide).toHaveBeenCalledTimes(0);
                expect(scrollStrategy.detach).toHaveBeenCalledTimes(0);
            }));

        it('Should persist the component open state when scrolling and absolute scroll strategy is used.', fakeAsync(() => {
            // TO DO replace Spies with css class and/or getBoundingClientRect.
            const fixture = TestBed.createComponent(EmptyPageComponent);
            const scrollTolerance = 10;
            const scrollStrategy = new AbsoluteScrollStrategy();
            const overlay = fixture.componentInstance.overlay;
            const overlaySettings: OverlaySettings = {
                closeOnOutsideClick: false,
                modal: false,
                positionStrategy: new GlobalPositionStrategy(),
                scrollStrategy: scrollStrategy
            };

            spyOn(scrollStrategy, 'initialize').and.callThrough();
            spyOn(scrollStrategy, 'attach').and.callThrough();
            spyOn(scrollStrategy, 'detach').and.callThrough();
            spyOn(overlay, 'hide').and.callThrough();

            const scrollSpy = spyOn<any>(scrollStrategy, 'onScroll').and.callThrough();

            overlay.show(SimpleDynamicComponent, overlaySettings);
            tick();
            expect(scrollStrategy.initialize).toHaveBeenCalledTimes(1);
            expect(scrollStrategy.attach).toHaveBeenCalledTimes(1);

            document.documentElement.scrollTop += scrollTolerance;
            document.dispatchEvent(new Event('scroll'));
            tick();
            expect(scrollSpy).toHaveBeenCalledTimes(1);
            expect(scrollStrategy.detach).toHaveBeenCalledTimes(0);
            expect(overlay.hide).toHaveBeenCalledTimes(0);
        }));

        // 3. Interaction
        // 3.1 Modal
        it('Should apply a greyed-out mask layers when is modal.', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            const overlaySettings: OverlaySettings = {
                modal: true,
            };

            fixture.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
            const overlayWrapper = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER_MODAL)[0];
            tick();
            const styles = css(overlayWrapper);
            const expectedBackgroundColor = 'background-color: rgba(0, 0, 0, 0.38)';
            const appliedBackgroundStyles = styles[3];
            expect(appliedBackgroundStyles).toContain(expectedBackgroundColor);
        }));

        it('Should allow interaction only for the shown component when is modal.', fakeAsync(() => {

            // Utility handler meant for later detachment
            // TO DO replace Spies with css class and/or getBoundingClientRect.
            function _handler(event) {
                if (event.which === 1) {
                    fixture.detectChanges();
                    tick();
                    expect(button.click).toHaveBeenCalledTimes(0);
                    expect(button.onclick).toHaveBeenCalledTimes(0);
                    document.removeEventListener('click', _handler);
                    dummy.remove();
                }

                return event;
            }
            const fixture = TestBed.createComponent(EmptyPageComponent);
            const overlay = fixture.componentInstance.overlay;
            const overlaySettings: OverlaySettings = {
                modal: true,
                closeOnOutsideClick: false,
                positionStrategy: new GlobalPositionStrategy()
            };
            const dummy = document.createElement('button');
            dummy.setAttribute('id', 'dummyButton');
            document.body.appendChild(dummy);
            const button = document.getElementById('dummyButton');

            button.addEventListener('click', _handler);

            spyOn(button, 'click').and.callThrough();
            spyOn(button, 'onclick').and.callThrough();
            spyOn(overlay, 'show').and.callThrough();
            spyOn(overlay, 'hide').and.callThrough();

            overlay.show(SimpleDynamicComponent, overlaySettings);
            tick();
            expect(overlay.show).toHaveBeenCalledTimes(1);
            expect(overlay.hide).toHaveBeenCalledTimes(0);

            button.dispatchEvent(new MouseEvent('click'));
        }));

        it('Should closes the component when esc key is pressed.', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            const overlay = fixture.componentInstance.overlay;
            const overlaySettings: OverlaySettings = {
                modal: true,
                positionStrategy: new GlobalPositionStrategy()
            };

            const targetButton = 'Escape';
            const escEvent = new KeyboardEvent('keydown', {
                key: targetButton
            });

            overlay.show(SimpleDynamicComponent, overlaySettings);
            tick();

            let overlayWrapper = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER_MODAL)[0];
            overlayWrapper.addEventListener('keydown', (event: KeyboardEvent) => {
                if (event.key === targetButton) {
                    overlayWrapper = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER_MODAL)[0];
                }
            });
            tick();
            expect(overlayWrapper).toBeTruthy();
            overlayWrapper.dispatchEvent(escEvent);
            tick();
        }));

        // Test fix for #1883 #1820
        it('It should close the component when esc key is pressed and there were other keys pressed prior to esc.', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            const overlay = fixture.componentInstance.overlay;
            const overlaySettings: OverlaySettings = {
                modal: true,
                positionStrategy: new GlobalPositionStrategy()
            };

            const escEvent = new KeyboardEvent('keydown', {
                key: 'Escape'
            });
            const enterEvent = new KeyboardEvent('keydown', {
                key: 'Enter'
            });
            const arrowUpEvent = new KeyboardEvent('keydown', {
                key: 'ArrowUp'
            });
            const aEvent = new KeyboardEvent('keydown', {
                key: 'a'
            });

            overlay.show(SimpleDynamicComponent, overlaySettings);
            tick();

            let overlayWrapper = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER_MODAL)[0];
            overlayWrapper.addEventListener('keydown', (event: KeyboardEvent) => {
                if (event.key === 'Escape') {
                    overlayWrapper = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER_MODAL)[0];
                    expect(overlayWrapper).toBeFalsy();
                }
            });
            tick();
            expect(overlayWrapper).toBeTruthy();

            overlayWrapper.dispatchEvent(enterEvent);
            overlayWrapper.dispatchEvent(aEvent);
            overlayWrapper.dispatchEvent(arrowUpEvent);
            overlayWrapper.dispatchEvent(escEvent);
        }));

        // 3.2 Non - Modal
        it('Should not apply a greyed-out mask layer when is not modal', fakeAsync(() => {
            const fixture = TestBed.createComponent(EmptyPageComponent);
            const overlaySettings: OverlaySettings = {
                modal: false,
            };

            fixture.componentInstance.overlay.show(SimpleDynamicComponent, overlaySettings);
            const overlayWrapper = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0];
            tick();
            const styles = css(overlayWrapper);
            const expectedBackgroundColor = 'background-color: rgba(0, 0, 0, 0.38)';
            const appliedBackgroundStyles = styles[3];
            expect(appliedBackgroundStyles).not.toContain(expectedBackgroundColor);
        }));

        it('Should not close when esc key is pressed and is not modal (DropDown, Dialog, etc.).', fakeAsync(() => {

            // Utility handler meant for later detachment
            function _handler(event) {
                if (event.key === targetButton) {
                    overlayWrapper = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0];
                    expect(overlayWrapper).toBeTruthy();
                    document.removeEventListener(targetEvent, _handler);
                }

                return event;
            }

            const fixture = TestBed.createComponent(EmptyPageComponent);
            const overlay = fixture.componentInstance.overlay;
            const overlaySettings: OverlaySettings = {
                modal: false,
                positionStrategy: new GlobalPositionStrategy()
            };
            const targetEvent = 'keydown';
            const targetButton = 'Escape';
            const escEvent = new KeyboardEvent(targetEvent, {
                key: targetButton
            });

            overlay.show(SimpleDynamicComponent, overlaySettings);
            tick();
            let overlayWrapper = document.getElementsByClassName(CLASS_OVERLAY_WRAPPER)[0];
            overlayWrapper.addEventListener(targetEvent, _handler);

            expect(overlayWrapper).toBeTruthy();
            overlayWrapper.dispatchEvent(escEvent);
        }));

        // 4. Css
        it('Should use component initial container\'s properties when is with 100% width/height and show in overlay element',
            fakeAsync(() => {
                const fixture = TestBed.createComponent(WidthTestOverlayComponent);
                fixture.detectChanges();
                expect(fixture.componentInstance.customComponent).toBeDefined();
                expect(fixture.componentInstance.customComponent.nativeElement.style.width).toEqual('100%');
                expect(fixture.componentInstance.customComponent.nativeElement.getBoundingClientRect().width).toEqual(420);
                expect(fixture.componentInstance.customComponent.nativeElement.style.height).toEqual('100%');
                expect(fixture.componentInstance.customComponent.nativeElement.getBoundingClientRect().height).toEqual(280);
                fixture.componentInstance.buttonElement.nativeElement.click();
                tick();
                const overlayContent = document.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0] as HTMLElement;
                const overlayChild = overlayContent.lastElementChild as HTMLElement;
                expect(overlayChild).toBeDefined();
                expect(overlayChild.style.width).toEqual('100%');
                expect(overlayChild.getBoundingClientRect().width).toEqual(420);
                expect(overlayChild.style.height).toEqual('100%');
                expect(overlayChild.getBoundingClientRect().height).toEqual(280);
                fixture.componentInstance.overlay.hideAll();
            }));
    });

    describe('Integration tests p2 (overrides): ', () => {
        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [IgxToggleModule, DynamicModule, NoopAnimationsModule],
                declarations: DIRECTIVE_COMPONENTS
            });
        }));
        // If adding a component near the visible window borders(left,right,up,down)
        // it should be partially hidden and based on scroll strategy:
        it('Should not allow scrolling with scroll strategy is not passed.', fakeAsync( async () => {
            TestBed.overrideComponent(EmptyPageComponent, {
                set: {
                    styles: [`button {
                        position: absolute;
                        top: 850px;
                        left: -30px;
                        width: 100px;
                        height: 60px;
                    }`]
                }
            });
            await TestBed.compileComponents();
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();

            const dummy = document.createElement('div');
            dummy.setAttribute('style',
                'width:60px; height:60px; color:green; position: absolute; top: 3000px; left: 3000px;');
            document.body.appendChild(dummy);

            const targetEl: HTMLElement = <HTMLElement>document.getElementsByClassName('button')[0];
            const positionSettings2 = {
                target: targetEl
            };

            const overlaySettings: OverlaySettings = {
                positionStrategy: new ConnectedPositioningStrategy(positionSettings2),
                scrollStrategy: new NoOpScrollStrategy(),
                modal: false,
                closeOnOutsideClick: false
            };
            const overlay = fixture.componentInstance.overlay;

            overlay.show(SimpleDynamicComponent, overlaySettings);

            tick();
            const contentWrapper = document.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0];
            const element = contentWrapper.firstChild as HTMLElement;
            const elementRect = element.getBoundingClientRect();

            document.documentElement.scrollTop = 100;
            document.documentElement.scrollLeft = 50;
            document.dispatchEvent(new Event('scroll'));
            tick();

            expect(elementRect).toEqual(element.getBoundingClientRect());
            expect(document.documentElement.scrollTop).toEqual(100);
            expect(document.documentElement.scrollLeft).toEqual(50);
            document.body.removeChild(dummy);
        }));

        it('Should retain the component state when scrolling and block scroll strategy is used.', fakeAsync(async () => {
            TestBed.overrideComponent(EmptyPageComponent, {
                set: {
                    styles: [`button { position: absolute, bottom: -2000px; }`]
                }
            });
            await TestBed.compileComponents();
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();

            const scrollStrat = new BlockScrollStrategy();
            fixture.detectChanges();
            const overlaySettings: OverlaySettings = {
                positionStrategy: new ConnectedPositioningStrategy(),
                scrollStrategy: scrollStrat,
                modal: false,
                closeOnOutsideClick: false
            };
            const overlay = fixture.componentInstance.overlay;
            overlay.show(SimpleDynamicComponent, overlaySettings);
            tick();
            expect(document.documentElement.scrollTop).toEqual(0);
            document.dispatchEvent(new Event('scroll'));
            tick();
            expect(document.documentElement.scrollTop).toEqual(0);

            document.documentElement.scrollTop += 25;
            document.dispatchEvent(new Event('scroll'));
            tick();
            expect(document.documentElement.scrollTop).toEqual(0);

            document.documentElement.scrollTop += 1000;
            document.dispatchEvent(new Event('scroll'));
            tick();
            expect(document.documentElement.scrollTop).toEqual(0);
            expect(document.getElementsByClassName(CLASS_OVERLAY_WRAPPER).length).toEqual(1);
            scrollStrat.detach();
        }));

        it('Should show the component inside of the viewport if it would normally be outside of bounds, TOP + LEFT.',
        fakeAsync(async () => {
            TestBed.overrideComponent(DownRightButtonComponent, {
                set: {
                    styles: [`button {
                position: absolute;
                top: 16px;
                left: 16px;
                width: 84px;
                height: 84px;
                padding: 0px;
                margin: 0px;
                border: 0px;
            }`]
                }
            });
            await TestBed.compileComponents();
            const fix = TestBed.createComponent(DownRightButtonComponent);
            fix.detectChanges();

            UIInteractions.clearOverlay();
            fix.detectChanges();
            const currentElement = fix.componentInstance;
            const buttonElement = fix.componentInstance.buttonElement.nativeElement;
            fix.detectChanges();
            currentElement.ButtonPositioningSettings.horizontalDirection = HorizontalAlignment.Left;
            currentElement.ButtonPositioningSettings.verticalDirection = VerticalAlignment.Top;
            currentElement.ButtonPositioningSettings.verticalStartPoint = VerticalAlignment.Top;
            currentElement.ButtonPositioningSettings.horizontalStartPoint = HorizontalAlignment.Left;
            currentElement.ButtonPositioningSettings.target = buttonElement;
            buttonElement.click();
            fix.detectChanges();
            tick();

            fix.detectChanges();
            const wrappers = document.getElementsByClassName(CLASS_OVERLAY_CONTENT);
            const wrapperContent = wrappers[wrappers.length - 1] as HTMLElement;
            const expectedStyle = 'position: absolute; width:100px; height: 100px; background-color: red';
            expect(wrapperContent.lastElementChild.getAttribute('style')).toEqual(expectedStyle);
            const buttonLeft = buttonElement.offsetLeft;
            const buttonTop = buttonElement.offsetTop;
            const expectedLeft = buttonLeft + buttonElement.clientWidth; // To the right of the button
            const expectedTop = buttonTop + buttonElement.clientHeight; // Bottom of the button
            const wrapperLeft = wrapperContent.offsetLeft;
            const wrapperTop = wrapperContent.offsetTop;
            expect(wrapperTop).toEqual(expectedTop);
            expect(wrapperLeft).toEqual(expectedLeft);
        }));

        it('Should show the component inside of the viewport if it would normally be outside of bounds, TOP + RIGHT.',
        fakeAsync(async () => {
            TestBed.overrideComponent(DownRightButtonComponent, {
                set: {
                    styles: [`button {
                position: absolute;
                top: 16px;
                right: 16px;
                width: 84px;
                height: 84px;
                padding: 0px;
                margin: 0px;
                border: 0px;
            }`]
                }
            });
            await TestBed.compileComponents();
            const fix = TestBed.createComponent(DownRightButtonComponent);
            fix.detectChanges();
            UIInteractions.clearOverlay();
            fix.detectChanges();
            const currentElement = fix.componentInstance;
            const buttonElement = fix.componentInstance.buttonElement.nativeElement;
            fix.detectChanges();
            currentElement.ButtonPositioningSettings.horizontalDirection = HorizontalAlignment.Right;
            currentElement.ButtonPositioningSettings.verticalDirection = VerticalAlignment.Top;
            currentElement.ButtonPositioningSettings.verticalStartPoint = VerticalAlignment.Top;
            currentElement.ButtonPositioningSettings.horizontalStartPoint = HorizontalAlignment.Right;
            currentElement.ButtonPositioningSettings.target = buttonElement;
            buttonElement.click();
            fix.detectChanges();
            tick();

            fix.detectChanges();
            const wrappers = document.getElementsByClassName(CLASS_OVERLAY_CONTENT);
            const wrapperContent = wrappers[wrappers.length - 1] as HTMLElement;
            const expectedStyle = 'position: absolute; width:100px; height: 100px; background-color: red';
            expect(wrapperContent.lastElementChild.getAttribute('style')).toEqual(expectedStyle);
            const buttonLeft = buttonElement.offsetLeft;
            const buttonTop = buttonElement.offsetTop;
            const expectedLeft = buttonLeft - wrapperContent.lastElementChild.clientWidth; // To the left of the button
            const expectedTop = buttonTop + buttonElement.clientHeight; // Bottom of the button
            const wrapperLeft = wrapperContent.offsetLeft;
            const wrapperTop = wrapperContent.offsetTop;
            expect(wrapperTop).toEqual(expectedTop);
            expect(wrapperLeft).toEqual(expectedLeft);
        }));

        it('Should show the component inside of the viewport if it would normally be outside of bounds, BOTTOM + LEFT.',
        fakeAsync(async () => {
            TestBed.overrideComponent(DownRightButtonComponent, {
                set: {
                    styles: [`button {
                position: absolute;
                bottom: 16px;
                left: 16px;
                width: 84px;
                height: 84px;
                padding: 0px;
                margin: 0px;
                border: 0px;
            }`]
                }
            });
            await TestBed.compileComponents();
            const fix = TestBed.createComponent(DownRightButtonComponent);
            fix.detectChanges();
            UIInteractions.clearOverlay();
            fix.detectChanges();
            const currentElement = fix.componentInstance;
            const buttonElement = fix.componentInstance.buttonElement.nativeElement;
            fix.detectChanges();
            currentElement.ButtonPositioningSettings.horizontalDirection = HorizontalAlignment.Left;
            currentElement.ButtonPositioningSettings.verticalDirection = VerticalAlignment.Bottom;
            currentElement.ButtonPositioningSettings.verticalStartPoint = VerticalAlignment.Bottom;
            currentElement.ButtonPositioningSettings.horizontalStartPoint = HorizontalAlignment.Left;
            currentElement.ButtonPositioningSettings.target = buttonElement;
            buttonElement.click();
            fix.detectChanges();
            tick();

            fix.detectChanges();
            const wrappers = document.getElementsByClassName(CLASS_OVERLAY_CONTENT);
            const wrapperContent = wrappers[wrappers.length - 1] as HTMLElement;
            const expectedStyle = 'position: absolute; width:100px; height: 100px; background-color: red';
            expect(wrapperContent.lastElementChild.getAttribute('style')).toEqual(expectedStyle);
            const buttonLeft = buttonElement.offsetLeft;
            const buttonTop = buttonElement.offsetTop;
            const expectedLeft = buttonLeft + buttonElement.clientWidth; // To the right of the button
            const expectedTop = buttonTop - wrapperContent.lastElementChild.clientHeight; // On top of the button
            const wrapperLeft = wrapperContent.offsetLeft;
            const wrapperTop = wrapperContent.offsetTop;
            expect(wrapperTop).toEqual(expectedTop);
            expect(wrapperLeft).toEqual(expectedLeft);
        }));

                // 2. Scroll Strategy (test with GlobalPositionStrategy(default))
        // 2.1. Scroll Strategy - None
        it('Should not scroll component, nor the window when none scroll strategy is passed. No scrolling happens.', fakeAsync(async () => {
            TestBed.overrideComponent(EmptyPageComponent, {
                set: {
                    styles: [`button {
                        position: absolute;
                        top: 120%;
                        left:120%;
                    }`]
                }
            });
            await TestBed.compileComponents();
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();

            const overlaySettings: OverlaySettings = {
                modal: false,
            };
            const overlay = fixture.componentInstance.overlay;
            overlay.show(SimpleDynamicComponent, overlaySettings);
            tick();
            const contentWrapper = document.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0];
            const element = contentWrapper.firstChild as HTMLElement;
            const elementRect = element.getBoundingClientRect();

            document.documentElement.scrollTop = 100;
            document.documentElement.scrollLeft = 50;
            document.dispatchEvent(new Event('scroll'));
            tick();

            expect(elementRect).toEqual(element.getBoundingClientRect());
            expect(document.documentElement.scrollTop).toEqual(100);
            expect(document.documentElement.scrollLeft).toEqual(50);
            overlay.hideAll();
        }));

        it(`Should not close the shown component when none scroll strategy is passed.
        (example: expanded DropDown stays expanded during a scrolling attempt.)`,
        fakeAsync(async () => {
            TestBed.overrideComponent(EmptyPageComponent, {
                set: {
                    styles: [`button {
                        position: absolute;
                        top: 120%;
                        left:120%;
                    }`]
                }
            });
            await TestBed.compileComponents();
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();

            const overlaySettings: OverlaySettings = {
                modal: false,
            };
            const overlay = fixture.componentInstance.overlay;

            overlay.show(SimpleDynamicComponent, overlaySettings);
            tick();
            const contentWrapper = document.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0];
            const element = contentWrapper.firstChild as HTMLElement;
            const elementRect = element.getBoundingClientRect();

            document.documentElement.scrollTop = 40;
            document.documentElement.scrollLeft = 30;
            document.dispatchEvent(new Event('scroll'));
            tick();

            expect(elementRect).toEqual(element.getBoundingClientRect());
            expect(document.documentElement.scrollTop).toEqual(40);
            expect(document.documentElement.scrollLeft).toEqual(30);
            expect(document.getElementsByClassName(CLASS_OVERLAY_WRAPPER).length).toEqual(1);
        }));

        // 2.2 Scroll Strategy - Closing. (Uses a tolerance and closes an expanded component upon scrolling if the tolerance is exceeded.)
        // (example: DropDown or Dialog component collapse/closes after scrolling 10px.)
        it('Should scroll until the set threshold is exceeded, and closing scroll strategy is used.',
        fakeAsync(async () => {
            TestBed.overrideComponent(EmptyPageComponent, {
                set: {
                    styles: [
                        'button { position: absolute; top: 100%; left: 90% }'
                    ]
                }
            });
            await TestBed.compileComponents();
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();

            const scrollTolerance = 10;
            const scrollStrategy = new CloseScrollStrategy();
            const overlay = fixture.componentInstance.overlay;
            const overlaySettings: OverlaySettings = {
                positionStrategy: new GlobalPositionStrategy(),
                scrollStrategy: scrollStrategy,
                modal: false
            };

            overlay.show(SimpleDynamicComponent, overlaySettings);
            tick();

            document.documentElement.scrollTop = scrollTolerance;
            document.dispatchEvent(new Event('scroll'));
            tick();
            expect(document.documentElement.scrollTop).toEqual(scrollTolerance);
            expect(document.getElementsByClassName(CLASS_OVERLAY_WRAPPER).length).toEqual(1);

            document.documentElement.scrollTop = scrollTolerance * 2;
            document.dispatchEvent(new Event('scroll'));
            tick();
            expect(document.getElementsByClassName(CLASS_OVERLAY_WRAPPER).length).toEqual(0);

        }));

        it(`Should not change the shown component shown state until it exceeds the scrolling tolerance set,
        and closing scroll strategy is used.`,
        fakeAsync(async () => {
            TestBed.overrideComponent(EmptyPageComponent, {
                set: {
                    styles: [
                        'button { position: absolute; top: 200%; left: 90% }'
                    ]
                }
            });
            await TestBed.compileComponents();
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();

            const scrollTolerance = 10;
            const scrollStrategy = new CloseScrollStrategy();
            const overlay = fixture.componentInstance.overlay;
            const overlaySettings: OverlaySettings = {
                positionStrategy: new GlobalPositionStrategy(),
                scrollStrategy: scrollStrategy,
                closeOnOutsideClick: false,
                modal: false
            };

            overlay.show(SimpleDynamicComponent, overlaySettings);
            tick();
            expect(document.documentElement.scrollTop).toEqual(0);

            document.documentElement.scrollTop += scrollTolerance;
            document.dispatchEvent(new Event('scroll'));
            tick();
            expect(document.documentElement.scrollTop).toEqual(scrollTolerance);
            expect(document.getElementsByClassName(CLASS_OVERLAY_WRAPPER).length).toEqual(1);
            fixture.destroy();
        }));

        it(`Should close the shown component shown when it exceeds the scrolling threshold set, and closing scroll strategy is used.
            (an expanded DropDown, Menu, DatePicker, etc. collapses).`, fakeAsync(async () => {
                TestBed.overrideComponent(EmptyPageComponent, {
                    set: {
                        styles: [
                            'button { position: absolute; top: 100%; left: 90% }'
                        ]
                    }
                });
                await TestBed.compileComponents();
                const fixture = TestBed.createComponent(EmptyPageComponent);
                fixture.detectChanges();

                const scrollTolerance = 10;
                const scrollStrategy = new CloseScrollStrategy();
                const overlay = fixture.componentInstance.overlay;
                const overlaySettings: OverlaySettings = {
                    positionStrategy: new GlobalPositionStrategy(),
                    scrollStrategy: scrollStrategy,
                    modal: false
                };

                overlay.show(SimpleDynamicComponent, overlaySettings);
                tick();
                expect(document.documentElement.scrollTop).toEqual(0);

                document.documentElement.scrollTop += scrollTolerance;
                document.dispatchEvent(new Event('scroll'));
                tick();
                expect(document.getElementsByClassName(CLASS_OVERLAY_WRAPPER).length).toEqual(1);
                expect(document.documentElement.scrollTop).toEqual(scrollTolerance);

                document.documentElement.scrollTop += scrollTolerance * 2;
                document.dispatchEvent(new Event('scroll'));
                tick();
                expect(document.getElementsByClassName(CLASS_OVERLAY_WRAPPER).length).toEqual(0);
            }));

        // 2.3 Scroll Strategy - NoOp.
        it('Should retain the component static and only the background scrolls, when scrolling and noOP scroll strategy is used.',
            fakeAsync(async () => {
                TestBed.overrideComponent(EmptyPageComponent, {
                    set: {
                        styles: [
                            'button { position: absolute; top: 200%; left: 90%; }'
                        ]
                    }
                });
                await TestBed.compileComponents();
                const fixture = TestBed.createComponent(EmptyPageComponent);
                fixture.detectChanges();

                const scrollTolerance = 10;
                const scrollStrategy = new NoOpScrollStrategy();
                const overlay = fixture.componentInstance.overlay;
                const overlaySettings: OverlaySettings = {
                    modal: false,
                    scrollStrategy: scrollStrategy,
                    positionStrategy: new GlobalPositionStrategy()
                };

                overlay.show(SimpleDynamicComponent, overlaySettings);
                tick();
                expect(document.getElementsByClassName(CLASS_OVERLAY_WRAPPER).length).toEqual(1);

                const contentWrapper = document.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0];
                const element = contentWrapper.firstChild as HTMLElement;
                const elementRect = element.getBoundingClientRect();

                document.documentElement.scrollTop += scrollTolerance;
                document.dispatchEvent(new Event('scroll'));
                tick();
                expect(document.documentElement.scrollTop).toEqual(scrollTolerance);
                expect(document.getElementsByClassName(CLASS_OVERLAY_WRAPPER).length).toEqual(1);
                expect(element.getBoundingClientRect()).toEqual(elementRect);
            }));

        // 2.4. Scroll Strategy - Absolute.
        it('Should scroll everything except component when scrolling and absolute scroll strategy is used.', fakeAsync(async () => {

            // Should behave as NoOpScrollStrategy
           TestBed.overrideComponent(EmptyPageComponent, {
                set: {
                    styles: [
                        'button { position: absolute; top:200%; left: 100%; }',
                    ]
                }
            });
            await TestBed.compileComponents();
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();

            const scrollTolerance = 10;
            const scrollStrategy = new NoOpScrollStrategy();
            const overlay = fixture.componentInstance.overlay;
            const overlaySettings: OverlaySettings = {
                closeOnOutsideClick: false,
                modal: false,
                positionStrategy: new ConnectedPositioningStrategy(),
                scrollStrategy: scrollStrategy
            };

            overlay.show(SimpleDynamicComponent, overlaySettings);
            tick();
            expect(document.getElementsByClassName(CLASS_OVERLAY_WRAPPER).length).toEqual(1);

            const contentWrapper = document.getElementsByClassName(CLASS_OVERLAY_CONTENT)[0];
            const element = contentWrapper.firstChild as HTMLElement;
            const elementRect = element.getBoundingClientRect() as DOMRect;

            document.documentElement.scrollTop += scrollTolerance;
            document.dispatchEvent(new Event('scroll'));
            tick();
            const newElementRect = element.getBoundingClientRect() as DOMRect;
            expect(document.documentElement.scrollTop).toEqual(scrollTolerance);
            expect(newElementRect.top).toEqual(elementRect.top);
        }));

        it('Should collapse/close the component when click outside it (DropDown, DatePicker, NavBar etc.)', fakeAsync(async () => {
            // TO DO replace Spies with css class and/or getBoundingClientRect.
            TestBed.overrideComponent(EmptyPageComponent, {
                set: {
                    styles: [
                        'button { position: absolute; top: 90%; left: 100%; }'
                    ]
                }
            });
            await TestBed.compileComponents();
            const fixture = TestBed.createComponent(EmptyPageComponent);
            fixture.detectChanges();

            const overlay = fixture.componentInstance.overlay;
            const overlaySettings: OverlaySettings = {
                modal: false,
                closeOnOutsideClick: true,
                positionStrategy: new GlobalPositionStrategy()
            };

            spyOn(overlay, 'show').and.callThrough();
            spyOn(overlay, 'hide').and.callThrough();

            overlay.show(SimpleDynamicComponent, overlaySettings);
            tick();
            expect(overlay.show).toHaveBeenCalledTimes(1);
            expect(overlay.hide).toHaveBeenCalledTimes(0);

            fixture.componentInstance.buttonElement.nativeElement.click();
            tick();
            expect(overlay.hide).toHaveBeenCalledTimes(1);
        }));
    });
});
@Component({
    template: '<div style=\'position: absolute; width:100px; height: 100px; background-color: red\'></div>'
})
export class SimpleDynamicComponent { }

@Component({
    template: '<div #item style=\'position: absolute; width:100px; height: 100px; background-color: red\'></div>'
})
export class SimpleRefComponent {
    @ViewChild('item')
    public item: ElementRef;

    constructor(@Inject(IgxOverlayService) public overlay: IgxOverlayService) { }
}

@Component({
    template: '<div style=\'position: absolute; width:3000px; height: 1000px; background-color: red\'></div>'
})
export class SimpleBigSizeComponent { }

@Component({
    template: `
        <div igxToggle>
            <div class='scrollableDiv' *ngIf='visible' style=\'position: absolute; width: 200px; height: 200px;
                    overflow-y:scroll; background-color: red\'>
                <p>AAAAA</p>
                <p>AAAAA</p>
                <p>AAAAA</p>
                <p>AAAAA</p>
                <p>AAAAA</p>
                <p>AAAAA</p>
                <p>AAAAA</p>
                <p>AAAAA</p>
                <p>AAAAA</p>
            </div>
        </div>`
})
export class SimpleDynamicWithDirectiveComponent {
    public visible = false;

    @ViewChild(IgxToggleDirective)
    private _overlay: IgxToggleDirective;

    public get overlay(): IgxToggleDirective {
        return this._overlay;
    }

    show(overlaySettings?: OverlaySettings) {
        this.visible = true;
        this.overlay.open(overlaySettings);
    }

    hide() {
        this.visible = false;
        this.overlay.close();
    }
}

@Component({
    template: `<button #button (click)=\'click($event)\' class='button'>Show Overlay</button>`
})
export class EmptyPageComponent {
    constructor(@Inject(IgxOverlayService) public overlay: IgxOverlayService) { }

    @ViewChild('button') buttonElement: ElementRef;

    click(event) {
        this.overlay.show(SimpleDynamicComponent);
    }
}

@Component({
    template: `<button #button (click)=\'click($event)\'>Show Overlay</button>`,
    styles: [`button {
        position: absolute;
        bottom: 0px;
        right: 0px;
        width: 84px;
        height: 84px;
        padding: 0px;
        margin: 0px;
        border: 0px;
    }`]
})
export class DownRightButtonComponent {
    constructor(@Inject(IgxOverlayService) public overlay: IgxOverlayService) { }

    @ViewChild('button') buttonElement: ElementRef;

    public ButtonPositioningSettings: PositionSettings = {
        horizontalDirection: HorizontalAlignment.Right,
        verticalDirection: VerticalAlignment.Bottom,
        target: null,
        horizontalStartPoint: HorizontalAlignment.Left,
        verticalStartPoint: VerticalAlignment.Top
    };
    click(event) {
        const positionStrategy = new AutoPositionStrategy(this.ButtonPositioningSettings);
        this.overlay.show(SimpleDynamicComponent, {
            positionStrategy: positionStrategy,
            scrollStrategy: new NoOpScrollStrategy(),
            modal: false,
            closeOnOutsideClick: false
        });
    }
}
@Component({
    template: `<button class='300_button' #button (click)=\'click($event)\'>Show Overlay</button>`,
    styles: [`button {
        position: absolute;
        top: 300px;
        left: 300px;
        width: 100px;
        height: 60px;
        border: 0px;
    }`]
})
export class TopLeftOffsetComponent {

    constructor(@Inject(IgxOverlayService) public overlay: IgxOverlayService) { }

    @ViewChild('button') buttonElement: ElementRef;
    click(event) {
        const positionStrategy = new ConnectedPositioningStrategy();
        this.overlay.show(SimpleDynamicComponent);
    }
}

@Component({
    template: `
    <div>
        <button class='buttonOne' (click)=\'clickOne($event)\'>Show first Overlay</button>
    </div>
    <div (click)=\'divClick($event)\'>
        <button class='buttonTwo' (click)=\'clickTwo($event)\'>Show second Overlay</button>
    </div>`
})
export class TwoButtonsComponent {
    private _setting: OverlaySettings = { modal: false };

    constructor(@Inject(IgxOverlayService) public overlay: IgxOverlayService) { }

    clickOne() {
        this.overlay.show(SimpleDynamicComponent, this._setting);
    }

    clickTwo() {
        this.overlay.show(SimpleDynamicComponent, this._setting);
    }

    divClick(ev: Event) {
        ev.stopPropagation();
    }
}

@Component({
    template: `<div style="width: 420px; height: 280px;">
    <button class='300_button' igxToggle #button (click)=\'click($event)\'>Show Overlay</button>
        <div #myCustomComponent class="customList" style="width: 100%; height: 100%;">
            Some Content
        </div>
    <div>`,
    styles: [`button {
        position: absolute;
        top: 300px;
        left: 300px;
        width: 100px;
        height: 60px;
        border: 0px;
    }`]
})
export class WidthTestOverlayComponent {

    constructor(
        @Inject(IgxOverlayService) public overlay: IgxOverlayService,
        public elementRef: ElementRef
    ) { }

    @ViewChild('button') buttonElement: ElementRef;
    @ViewChild('myCustomComponent') customComponent: ElementRef;
    public overlaySettings: OverlaySettings = {};
    click(event) {
        this.overlaySettings.positionStrategy = new ConnectedPositioningStrategy();
        this.overlaySettings.scrollStrategy = new NoOpScrollStrategy();
        this.overlaySettings.closeOnOutsideClick = true;
        this.overlaySettings.modal = false;

        this.overlaySettings.positionStrategy.settings.target = this.buttonElement.nativeElement;
        this.overlay.show(this.customComponent, this.overlaySettings);
    }
}

@Component({
    template: `
    <div igxToggle>
        <div class='scrollableDiv' *ngIf='visible' style=\'width:200px; height:200px; overflow-y:scroll;\'>
            <p>AAAAA</p>
            <p>AAAAA</p>
            <p>AAAAA</p>
            <p>AAAAA</p>
            <p>AAAAA</p>
            <p>AAAAA</p>
            <p>AAAAA</p>
            <p>AAAAA</p>
            <p>AAAAA</p>
        </div>
    </div>`
})
export class ScrollableComponent {
    public visible = false;

    @ViewChild(IgxToggleDirective)
    private _toggle: IgxToggleDirective;

    public get toggle(): IgxToggleDirective {
        return this._toggle;
    }

    show() {
        this.visible = true;
        const settings: OverlaySettings = { scrollStrategy: new CloseScrollStrategy() };
        this.toggle.open(settings);
    }

    hide() {
        this.toggle.close();
        this.visible = false;
    }

}

@Component({
    template: `
    <div style=\'display:flex; width:100%; height:500px; justify-content:center;\'>
        <button #button style=\'display:inline-flex; width:150px; height:30px;\' (click)=\'click($event)\' class=\'button\'>
            Show Overlay
        </button>
    </div>
    `
})
export class FlexContainerComponent {
    public overlaySettings: OverlaySettings = {};
    constructor(@Inject(IgxOverlayService) public overlay: IgxOverlayService) { }

    @ViewChild('button') buttonElement: ElementRef;
    click(event) {
        this.overlay.show(SimpleDynamicComponent, this.overlaySettings);
    }
}

const DYNAMIC_COMPONENTS = [
    EmptyPageComponent,
    SimpleRefComponent,
    SimpleDynamicComponent,
    SimpleBigSizeComponent,
    DownRightButtonComponent,
    TopLeftOffsetComponent,
    TwoButtonsComponent,
    WidthTestOverlayComponent,
    ScrollableComponent,
    FlexContainerComponent
];

const DIRECTIVE_COMPONENTS = [
    SimpleDynamicWithDirectiveComponent
];

@NgModule({
    imports: [BrowserModule],
    declarations: [DYNAMIC_COMPONENTS],
    exports: [DYNAMIC_COMPONENTS],
    entryComponents: [DYNAMIC_COMPONENTS]
})
export class DynamicModule { }
