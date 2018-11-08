import { Component, ViewChild, OnInit, ElementRef, DebugElement } from '@angular/core';
import { async, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxToggleModule, IgxToggleDirective } from '../directives/toggle/toggle.directive';
import { IgxDropDownItemComponent } from './drop-down-item.component';
import { IgxDropDownComponent, IgxDropDownModule, ISelectionEventArgs } from './drop-down.component';
import { IgxTabsComponent, IgxTabsModule } from '../tabs/tabs.component';
import { UIInteractions } from '../test-utils/ui-interactions.spec';
import { CancelableEventArgs } from '../core/utils';
import { configureTestSuite } from '../test-utils/configure-suite';
import { take } from 'rxjs/operators';

const CSS_CLASS_FOCUSED = 'igx-drop-down__item--focused';
const CSS_CLASS_SELECTED = 'igx-drop-down__item--selected';
const CSS_CLASS_DISABLED = 'igx-drop-down__item--disabled';
const CSS_CLASS_HEADER = 'igx-drop-down__header';
const CSS_CLASS_DROP_DOWN_BASE = 'igx-drop-down';
const CSS_CLASS_TOGGLE = 'igx-toggle';

describe('IgxDropDown ', () => {
    configureTestSuite();
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxDropDownTestComponent,
                IgxDropDownTestScrollComponent,
                IgxDropDownTestDisabledComponent,
                IgxDropDownTestDisabledAnyComponent,
                IgxDropDownTestEmptyListComponent,
                IgxDropDownWithScrollComponent,
                DoubleIgxDropDownComponent,
                InputWithDropDownDirectiveComponent,
                IgxDropDownInputTestComponent,
                IgxDropDownImageTestComponent,
                IgxDropDownTabsTestComponent,
                DropDownWithValuesComponent,
                IgxDropDownSelectComponent
            ],
            imports: [
                IgxDropDownModule,
                NoopAnimationsModule,
                IgxToggleModule,
                IgxTabsModule
            ]
        })
            .compileComponents();
    }));

    describe('igxDropDown integration tests', () => {
        configureTestSuite();
        it('should select item by SPACE/ENTER and click', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxDropDownTestComponent);
            fixture.detectChanges();
            const button = fixture.debugElement.query(By.css('button')).nativeElement;
            const list = fixture.componentInstance.dropdown;
            let targetElement;
            const mockObj = {
                key: '',
                code: '',
                stopPropagation: () => {},
                preventDefault: () => {}
            };
            spyOn(mockObj, 'preventDefault');
            spyOn(mockObj, 'stopPropagation');
            expect(list).toBeDefined();
            expect(list.items.length).toEqual(4);

            button.click(mockObj);
            tick();
            fixture.detectChanges();
            let currentItem = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_FOCUSED))[0];
            expect(currentItem.componentInstance.index).toEqual(0);
            expect(list.collapsed).toEqual(false);

            targetElement = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_DROP_DOWN_BASE))[0].parent;
            expect(targetElement).toBeDefined();

            mockObj.code = 'arrowdown';
            mockObj.key = 'arrowdown';
            targetElement.triggerEventHandler('keydown', mockObj);
            tick();
            fixture.detectChanges();
            currentItem = fixture.debugElement.query(By.css('.' + CSS_CLASS_FOCUSED));
            expect(currentItem).toBeDefined();
            expect(currentItem.componentInstance.index).toEqual(1);
            expect(list.selectedItem).toBeFalsy();

            mockObj.code = 'space';
            mockObj.key = 'space';
            targetElement.triggerEventHandler('keydown', mockObj);
            tick();
            fixture.detectChanges();
            expect(list.selectedItem).toEqual(list.items[1]);
            expect(list.collapsed).toEqual(true);

            button.click(mockObj);
            tick();
            fixture.detectChanges();
            targetElement = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_DROP_DOWN_BASE))[0].parent;
            currentItem = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_SELECTED))[0];

            mockObj.code = 'arrowdown';
            mockObj.key = 'arrowdown';
            targetElement.triggerEventHandler('keydown', mockObj);
            tick();
            fixture.detectChanges();
            targetElement = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_DROP_DOWN_BASE))[0].parent;
            currentItem = fixture.debugElement.query(By.css('.' + CSS_CLASS_FOCUSED));

            mockObj.code = 'enter';
            mockObj.key = 'enter';
            targetElement.triggerEventHandler('keydown', mockObj);
            tick();
            fixture.detectChanges();
            expect(list.collapsed).toEqual(true);
            expect(list.selectedItem).toEqual(list.items[2]);

            button.click(mockObj);
            tick();
            fixture.detectChanges();
            expect(list.collapsed).toEqual(false);

            list.items[1].element.nativeElement.click(mockObj);
            tick();
            fixture.detectChanges();
            expect(list.selectedItem).toEqual(list.items[1]);
            expect(list.collapsed).toEqual(true);
        }));

        it('should change the selected values indefinitely', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxDropDownTestScrollComponent);
            fixture.detectChanges();
            const button = fixture.debugElement.query(By.css('button')).nativeElement;
            const list = fixture.componentInstance.dropdownScroll;
            let targetElement;
            const listItems = list.items;
            const mockObj = {
                key: '',
                code: '',
                stopPropagation: () => {},
                preventDefault: () => {}
            };
            spyOn(mockObj, 'preventDefault');
            spyOn(mockObj, 'stopPropagation');
            expect(list).toBeDefined();
            expect(list.items.length).toEqual(15);

            button.click(mockObj);
            tick();
            fixture.detectChanges();
            let currentItem = fixture.debugElement.query(By.css('.' + CSS_CLASS_FOCUSED));
            expect(currentItem.componentInstance.index).toEqual(0);

            targetElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROP_DOWN_BASE)).parent;
            mockObj.code = 'arrowdown';
            mockObj.key = 'arrowdown';
            targetElement.triggerEventHandler('keydown', mockObj);
            tick();
            fixture.detectChanges();
            currentItem = fixture.debugElement.query(By.css('.' + CSS_CLASS_FOCUSED));
            expect(currentItem).toBeDefined();
            expect(currentItem.componentInstance.index).toEqual(1);

            mockObj.code = 'space';
            mockObj.key = 'space';
            targetElement.triggerEventHandler('keydown', mockObj);
            tick();
            fixture.detectChanges();
            expect(list.selectedItem).toEqual(listItems[1]);

            document.getElementsByTagName('button')[1].click();
            tick();
            fixture.detectChanges();
            expect(list.selectedItem).toEqual(listItems[4]);

            button.click();
            tick();
            fixture.detectChanges();
            currentItem = fixture.debugElement.query(By.css('.' + CSS_CLASS_SELECTED));
            expect(currentItem).toBeDefined();
            expect(currentItem.componentInstance.index).toEqual(4);

            mockObj.code = 'Escape';
            mockObj.key = 'Escape';
            targetElement.triggerEventHandler('keydown', mockObj);
            tick();
            fixture.detectChanges();
            expect(list.collapsed).toEqual(true);
            expect(list.selectedItem).toEqual(listItems[4]);
        }));

        it('Should navigate through the items using Up/Down/Home/End keys', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxDropDownTestComponent);
            fixture.detectChanges();
            const button = fixture.debugElement.query(By.css('button')).nativeElement;
            const list = fixture.componentInstance.dropdown;
            let targetElement;
            expect(list).toBeDefined();
            expect(list.items.length).toEqual(4);

            const mockObj = {
                key: '',
                code: '',
                stopPropagation: () => {},
                preventDefault: () => {}
            };
            button.click();
            tick();
            fixture.detectChanges();
            let currentItem = fixture.debugElement.query(By.css('.' + CSS_CLASS_FOCUSED));
            targetElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROP_DOWN_BASE)).parent;
            mockObj.code = 'ArrowDown';
            mockObj.key = 'ArrowDown';
            targetElement.triggerEventHandler('keydown', mockObj);
            tick();
            fixture.detectChanges();
            currentItem = fixture.debugElement.query(By.css('.' + CSS_CLASS_FOCUSED));
            expect(currentItem).toBeDefined();
            expect(currentItem.componentInstance.index).toEqual(1);

            mockObj.code = 'End';
            mockObj.key = 'End';
            targetElement.triggerEventHandler('keydown', mockObj);
            tick();
            fixture.detectChanges();
            currentItem = fixture.debugElement.query(By.css('.' + CSS_CLASS_FOCUSED));
            expect(currentItem).toBeDefined();
            expect(currentItem.componentInstance.index).toEqual(3);

            mockObj.code = 'ArrowUp';
            mockObj.key = 'ArrowUp';
            targetElement.triggerEventHandler('keydown', mockObj);
            tick();
            fixture.detectChanges();
            currentItem = fixture.debugElement.query(By.css('.' + CSS_CLASS_FOCUSED));
            expect(currentItem).toBeDefined();
            expect(currentItem.componentInstance.index).toEqual(2);

            mockObj.code = 'Home';
            mockObj.key = 'Home';
            targetElement.triggerEventHandler('keydown', mockObj);
            tick();
            fixture.detectChanges();
            currentItem = fixture.debugElement.query(By.css('.' + CSS_CLASS_FOCUSED));
            expect(currentItem).toBeDefined();
            expect(currentItem.componentInstance.index).toEqual(0);
        }));

        it('Should support disabled items', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxDropDownTestDisabledAnyComponent);
            fixture.detectChanges();

            const button = fixture.debugElement.query(By.css('button')).nativeElement;
            const list = fixture.componentInstance.dropdownDisabledAny;
            expect(list).toBeDefined();
            expect(list.items.length).toEqual(13);

            const mockObj = jasmine.createSpyObj('mockEvt', ['stopPropagation', 'preventDefault']);
            button.click();
            tick();
            fixture.detectChanges();
            const currentItem = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_DISABLED))[0];
            expect(currentItem.componentInstance.index).toEqual(2);

            currentItem.triggerEventHandler('click', mockObj);
            fixture.detectChanges();
            expect(list.selectedItem).toBeNull();
        }));

        it('Should support header items', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxDropDownTestDisabledAnyComponent);
            fixture.detectChanges();
            const button = fixture.debugElement.query(By.css('button')).nativeElement;
            const list = fixture.componentInstance.dropdownDisabledAny;
            const headerItems = list.headers;
            expect(list).toBeDefined();
            expect(list.items.length).toEqual(13);

            const mockObj = jasmine.createSpyObj('mockEvt', ['stopPropagation', 'preventDefault']);
            button.click();
            tick();
            fixture.detectChanges();
            const firstHeaderItem = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_HEADER))[0];
            expect(firstHeaderItem).toBeDefined();
            expect(firstHeaderItem.componentInstance).toEqual(headerItems[0]);

            firstHeaderItem.triggerEventHandler('click', mockObj);
            tick();
            fixture.detectChanges();

            //  clicking on header item should not close the drop down
            expect(list.collapsed).toEqual(false);
        }));

        it('Should notify when selection has changed', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxDropDownTestComponent);
            fixture.detectChanges();

            const button = fixture.debugElement.query(By.css('button')).nativeElement;
            const list = fixture.componentInstance.dropdown;
            const mockObj = jasmine.createSpyObj('mockEvt', ['stopPropagation', 'preventDefault']);
            spyOn(list.onSelection, 'emit').and.callThrough();
            spyOn(list.onClosed, 'emit').and.callThrough();
            spyOn(fixture.componentInstance, 'onSelection');
            expect(list).toBeDefined();
            expect(list.items.length).toEqual(4);

            button.click(mockObj);
            tick();
            fixture.detectChanges();
            const lastListItem = list.items[3].element.nativeElement;

            lastListItem.click({});
            tick();
            fixture.detectChanges();
            expect(list.selectedItem).toEqual(list.items[3]);
            expect(list.onSelection.emit).toHaveBeenCalledTimes(1);
            expect(list.onClosed.emit).toHaveBeenCalledTimes(1);
            expect(fixture.componentInstance.onSelection).toHaveBeenCalledTimes(1);
        }));

        it('Should check if selection event return the proper eventArgs', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxDropDownTestComponent);
            fixture.detectChanges();

            const button = fixture.debugElement.query(By.css('button'));
            const list = fixture.componentInstance.dropdown;
            spyOn(list.onSelection, 'emit').and.callThrough();

            UIInteractions.clickElement(button);
            tick();
            fixture.detectChanges();

            UIInteractions.clickElement(list.items[3].element);
            tick();
            fixture.detectChanges();
            const selectionArgs: ISelectionEventArgs = {
                newSelection: list.items[3],
                oldSelection: null,
                cancel: false
            };
            expect(list.onSelection.emit).toHaveBeenCalledWith(selectionArgs);

            UIInteractions.clickElement(button);
            tick();
            fixture.detectChanges();

            UIInteractions.clickElement(list.items[1].element);
            tick();
            fixture.detectChanges();
            expect(list.onSelection.emit).toHaveBeenCalledTimes(2);

            tick();
            fixture.detectChanges();
            const selectionArgs1: ISelectionEventArgs = {
                oldSelection: list.items[3],
                newSelection: list.items[1],
                cancel: false
            };
            expect(list.onSelection.emit).toHaveBeenCalledWith(selectionArgs1);
        }));

        it('Should check if selection event return the proper eventArgs if cancelled', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxDropDownSelectComponent);
            fixture.detectChanges();

            const button = fixture.debugElement.query(By.css('button'));
            const list = fixture.componentInstance.dropdown;
            spyOn(list.onSelection, 'emit').and.callThrough();

            UIInteractions.clickElement(button);
            tick();
            fixture.detectChanges();

            UIInteractions.clickElement(list.items[3].element);
            tick();
            fixture.detectChanges();
            const selectionArgs: ISelectionEventArgs = {
                oldSelection: null,
                newSelection: list.items[3],
                cancel: true
            };
            expect(list.onSelection.emit).toHaveBeenCalledWith(selectionArgs);

            UIInteractions.clickElement(button);
            tick();
            fixture.detectChanges();

            UIInteractions.clickElement(list.items[1].element);
            tick();
            fixture.detectChanges();
            const selectionArgs1: ISelectionEventArgs = {
                oldSelection: null,
                newSelection: list.items[1],
                cancel: true
            };
            expect(list.onSelection.emit).toHaveBeenCalledWith(selectionArgs1);
        }));

        it('Should persist selection through scrolling', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxDropDownTestScrollComponent);
            fixture.detectChanges();
            const button = fixture.debugElement.query(By.css('button')).nativeElement;
            const list = fixture.componentInstance.dropdownScroll;
            const mockObj = jasmine.createSpyObj('mockEvt', ['stopPropagation', 'preventDefault']);
            expect(list).toBeDefined();
            expect(list.items.length).toEqual(15);
            button.click(mockObj);
            tick();

            fixture.detectChanges();
            let currentItem = document.getElementsByClassName(CSS_CLASS_FOCUSED)[0] as HTMLElement;
            currentItem.focus();
            expect(currentItem.innerHTML.trim()).toEqual('Item 1');
            const scrollElement = document.getElementsByClassName(CSS_CLASS_TOGGLE)[0] as HTMLElement;
            scrollElement.scrollTop += 150;
            currentItem = document.getElementsByClassName(CSS_CLASS_FOCUSED)[0] as HTMLElement;
            expect(currentItem.innerHTML.trim()).toEqual('Item 1');
            scrollElement.scrollTop = 0;
            const currentItem2 = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_FOCUSED))[0];
            expect(currentItem2).toBeDefined();
            expect(currentItem2.componentInstance.index).toEqual(0);
        }));

        it('Should be able to implement to input anchor', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxDropDownInputTestComponent);
            fixture.detectChanges();
            const button = fixture.debugElement.query(By.css('input')).nativeElement;
            const list = fixture.componentInstance.dropdown;
            const mockObj = jasmine.createSpyObj('mockEvt', ['stopPropagation', 'preventDefault']);
            spyOn(list.onSelection, 'emit').and.callThrough();
            spyOn(list.onClosed, 'emit').and.callThrough();
            spyOn(fixture.componentInstance, 'onSelection');
            expect(list).toBeDefined();
            expect(list.items.length).toEqual(4);
            button.click(mockObj);
            tick();
            fixture.detectChanges();
            const lastListItem = list.items[3].element.nativeElement;
            lastListItem.click({});
            tick();
            fixture.detectChanges();
            expect(list.selectedItem).toEqual(list.items[3]);
            expect(list.onSelection.emit).toHaveBeenCalledTimes(1);
            expect(list.onClosed.emit).toHaveBeenCalledTimes(1);
            expect(fixture.componentInstance.onSelection).toHaveBeenCalledTimes(1);
        }));

        it('Should be able to implement to image anchor', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxDropDownImageTestComponent);
            fixture.detectChanges();
            const button = fixture.debugElement.query(By.css('img')).nativeElement;
            const list = fixture.componentInstance.dropdown;
            const mockObj = jasmine.createSpyObj('mockEvt', ['stopPropagation', 'preventDefault']);
            spyOn(list.onSelection, 'emit').and.callThrough();
            spyOn(list.onClosed, 'emit').and.callThrough();
            spyOn(fixture.componentInstance, 'onSelection');
            expect(list).toBeDefined();
            expect(list.items.length).toEqual(4);
            button.click(mockObj);
            tick();
            fixture.detectChanges();
            const lastListItem = list.items[3].element.nativeElement;
            lastListItem.click({});
            tick();
            fixture.detectChanges();
            expect(list.selectedItem).toEqual(list.items[3]);
            expect(list.onSelection.emit).toHaveBeenCalledTimes(1);
            expect(list.onClosed.emit).toHaveBeenCalledTimes(1);
            expect(fixture.componentInstance.onSelection).toHaveBeenCalledTimes(1);
        }));

        it('Should be able to implement to igx-tabs anchor', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxDropDownTabsTestComponent);
            fixture.detectChanges();
            const tabs = fixture.componentInstance.tabs;
            const list = fixture.componentInstance.dropdown;
            spyOn(list.onSelection, 'emit').and.callThrough();
            spyOn(list.onClosed, 'emit').and.callThrough();
            spyOn(fixture.componentInstance, 'onSelection');
            expect(list).toBeDefined();
            expect(list.items.length).toEqual(4);
            tabs.tabs.toArray()[0].nativeTabItem.nativeElement.dispatchEvent(new Event('click', { bubbles: true }));
            tick(300);
            fixture.detectChanges();
            const lastListItem = list.items[3].element.nativeElement;
            lastListItem.click({});
            tick(300);
            fixture.detectChanges();
            expect(list.selectedItem).toEqual(list.items[3]);
            expect(list.onSelection.emit).toHaveBeenCalledTimes(1);
            expect(list.onClosed.emit).toHaveBeenCalledTimes(1);
            expect(fixture.componentInstance.onSelection).toHaveBeenCalledTimes(1);
        }));

        it('Items can be disabled/enabled at runtime', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxDropDownTestDisabledAnyComponent);
            fixture.detectChanges();
            const button = fixture.debugElement.query(By.css('button')).nativeElement;
            const list = fixture.componentInstance.dropdownDisabledAny;
            expect(list).toBeDefined();
            expect(list.items.length).toEqual(13);
            button.click();
            tick();
            fixture.detectChanges();
            let currentItem = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_DISABLED));
            expect(currentItem.length).toEqual(3);
            expect(list.items[4].disabled).toBeFalsy();
            list.items[4].disabled = true;
            tick();

            fixture.detectChanges();
            currentItem = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_DISABLED));
            expect(currentItem.length).toEqual(4);
            expect(list.items[4].disabled).toBeTruthy();
        }));

        it('Esc key closes the dropdown and does not change selection', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxDropDownTestComponent);
            fixture.detectChanges();
            const button = fixture.debugElement.query(By.css('button')).nativeElement;
            const list = fixture.componentInstance.dropdown;
            const mockObj = {
                key: 'arrowdown',
                code: 'arrowdown',
                stopPropagation: () => {},
                preventDefault: () => {}
            };
            spyOn(mockObj, 'preventDefault');
            spyOn(mockObj, 'stopPropagation');
            let targetElement;
            spyOn(list.onSelection, 'emit').and.callThrough();
            spyOn(list.onOpening, 'emit').and.callThrough();
            spyOn(list.onOpened, 'emit').and.callThrough();
            spyOn(list.onClosing, 'emit').and.callThrough();
            spyOn(list.onClosed, 'emit').and.callThrough();
            spyOn(fixture.componentInstance, 'onSelection');
            expect(list).toBeDefined();
            expect(list.items.length).toEqual(4);
            button.click(mockObj);
            tick();

            fixture.detectChanges();
            let currentItem = fixture.debugElement.query(By.css('.' + CSS_CLASS_FOCUSED));
            expect(currentItem).toBeDefined();
            targetElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROP_DOWN_BASE)).parent;
            targetElement.triggerEventHandler('keydown', mockObj);
            tick();

            fixture.detectChanges();
            currentItem = fixture.debugElement.query(By.css('.' + CSS_CLASS_FOCUSED));
            expect(currentItem).toBeDefined();
            expect(currentItem.componentInstance.index).toEqual(1);
            mockObj.key = 'escape';
            mockObj.code = 'escape';
            targetElement.triggerEventHandler('keydown', mockObj);
            tick();

            fixture.detectChanges();
            expect(list.onOpening.emit).toHaveBeenCalledTimes(1);
            expect(list.onOpened.emit).toHaveBeenCalledTimes(1);
            expect(list.onSelection.emit).toHaveBeenCalledTimes(0);
            fixture.detectChanges();
            expect(list.collapsed).toEqual(true);
            // TODO: should be list.onClose.emit
        }));

        it('Should not change selection when setting it to non-existing item', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxDropDownTestScrollComponent);
            fixture.detectChanges();
            const button = fixture.debugElement.query(By.css('button')).nativeElement;
            const list = fixture.componentInstance.dropdownScroll;
            const listItems = list.items;
            expect(list).toBeDefined();
            expect(list.items.length).toEqual(15);
            list.setSelectedItem(0);
            button.click();
            tick();
            fixture.detectChanges();
            let currentItem = fixture.debugElement.query(By.css('.' + CSS_CLASS_SELECTED));
            expect(currentItem.componentInstance.index).toEqual(0);
            list.setSelectedItem(-4);
            tick();

            fixture.detectChanges();
            expect(listItems[0].isSelected).toBeTruthy();
            currentItem = fixture.debugElement.query(By.css('.' + CSS_CLASS_SELECTED));
            expect(currentItem.componentInstance.index).toEqual(0);
            list.setSelectedItem(24);
            tick();

            fixture.detectChanges();
            expect(listItems[0].isSelected).toBeTruthy();
            currentItem = fixture.debugElement.query(By.css('.' + CSS_CLASS_SELECTED));
            expect(currentItem.componentInstance.index).toEqual(0);
            list.setSelectedItem(5);
            tick();

            fixture.detectChanges();
            expect(listItems[5].isSelected).toBeTruthy();
            currentItem = fixture.debugElement.query(By.css('.' + CSS_CLASS_SELECTED));
            expect(currentItem.componentInstance.index).toEqual(5);
            // TODO: verify selecting the already selected element is not affecting selection
            list.setSelectedItem(5);
            tick();

            fixture.detectChanges();
            expect(listItems[5].isSelected).toBeTruthy();
            currentItem = fixture.debugElement.query(By.css('.' + CSS_CLASS_SELECTED));
            expect(currentItem.componentInstance.index).toEqual(5);
        }));

        it('Home key should select the first enabled item', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxDropDownTestDisabledComponent);
            fixture.detectChanges();
            const button = fixture.debugElement.query(By.css('button')).nativeElement;
            const list = fixture.componentInstance.dropdownDisabled;
            const listItems = list.items;
            expect(list).toBeDefined();
            expect(list.items.length).toEqual(13);
            button.click();
            tick();

            let currentItem = fixture.debugElement.query(By.css('.' + CSS_CLASS_SELECTED));
            expect(currentItem.componentInstance.index).toEqual(8);
            currentItem.triggerEventHandler('keydown', {
                key: 'Home',
                code: 'Home',
                stopPropagation: () => {},
                preventDefault: () => {}
            });
            tick();

            fixture.detectChanges();
            expect(listItems[1].isFocused).toBeTruthy();
            currentItem = fixture.debugElement.query(By.css('.' + CSS_CLASS_FOCUSED));
            expect(currentItem.componentInstance.index).toEqual(1);
        }));

        it('End key should select the last enabled item', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxDropDownTestDisabledComponent);
            fixture.detectChanges();
            const button = fixture.debugElement.query(By.css('button')).nativeElement;
            const list = fixture.componentInstance.dropdownDisabled;
            const listItems = list.items;
            const mockObj = {
                key: 'end',
                code: 'end',
                stopPropagation: () => {},
                preventDefault: () => {}
            };
            spyOn(mockObj, 'stopPropagation');
            spyOn(mockObj, 'preventDefault');
            expect(list).toBeDefined();
            expect(list.items.length).toEqual(13);
            button.click();
            tick();

            fixture.detectChanges();
            let currentItem: DebugElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_SELECTED));
            expect(list.items[8].isSelected).toBeTruthy();
            currentItem.triggerEventHandler('keydown', mockObj);
            tick();

            fixture.detectChanges();
            expect(listItems[11].isFocused).toBeTruthy();
            currentItem = fixture.debugElement.query(By.css('.' + CSS_CLASS_FOCUSED));
            expect(currentItem.componentInstance.index).toEqual(11);
            mockObj.key = 'ArrowDown';
            mockObj.code = 'ArrowDown';
            currentItem.triggerEventHandler('keydown', mockObj);
            tick();

            fixture.detectChanges();
            expect(listItems[11].isFocused).toBeTruthy();
            currentItem = fixture.debugElement.query(By.css('.' + CSS_CLASS_FOCUSED));
            expect(currentItem.componentInstance.index).toEqual(11);
        }));

        it('Key navigation through disabled items', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxDropDownTestDisabledComponent);
            fixture.detectChanges();
            const button = fixture.debugElement.query(By.css('button')).nativeElement;
            const list = fixture.componentInstance.dropdownDisabled;
            const listItems = list.items;
            const mockObj = {
                key: 'ArrowDown',
                code: 'ArrowDown',
                stopPropagation: () => {},
                preventDefault: () => {}
            };
            spyOn(mockObj, 'stopPropagation');
            spyOn(mockObj, 'preventDefault');
            expect(list).toBeDefined();
            expect(list.items.length).toEqual(13);
            button.click();
            tick();

            fixture.detectChanges();
            let currentItem = fixture.debugElement.queryAll(By.css('.igx-drop-down__item'))[0];
            currentItem.triggerEventHandler('keydown', mockObj);
            tick();

            fixture.detectChanges();
            expect(list.items[10].isFocused).toBeTruthy();
            currentItem = fixture.debugElement.queryAll(By.css('.igx-drop-down__item'))[0];
            mockObj.key = 'ArrowUp';
            mockObj.code = 'ArrowUp';
            currentItem.triggerEventHandler('keydown', mockObj);
            tick();

            fixture.detectChanges();
            expect(listItems[8].isFocused).toBeTruthy();
            currentItem = fixture.debugElement.query(By.css('.' + CSS_CLASS_FOCUSED));
            expect(currentItem.componentInstance.index).toEqual(8);
        }));

        it('Change width/height at runtime', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxDropDownTestDisabledComponent);
            fixture.detectChanges();
            const button = fixture.debugElement.query(By.css('button')).nativeElement;
            const list = fixture.componentInstance.dropdownDisabled;
            expect(list).toBeDefined();
            expect(list.items.length).toEqual(13);
            fixture.componentInstance.dropdownDisabled.width = '80%';
            fixture.componentInstance.dropdownDisabled.height = '400px';
            fixture.componentInstance.dropdownDisabled.id = 'newDD';
            button.click();
            tick();

            fixture.detectChanges();
            const toggleElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_TOGGLE)).nativeElement;
            expect(toggleElement.style.width).toEqual('80%');
            expect(toggleElement.style.height).toEqual('400px');
            expect(fixture.componentInstance.dropdownDisabled.id).toEqual('newDD');
        }));

        it('Disabled items cannot be focused', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxDropDownTestDisabledComponent);
            fixture.detectChanges();
            const button = fixture.debugElement.query(By.css('button')).nativeElement;
            const list = fixture.componentInstance.dropdownDisabled;
            expect(list).toBeDefined();
            expect(list.items.length).toEqual(13);
            list.items[0].isFocused = true;
            button.click();
            tick();

            fixture.detectChanges();
            expect(list.items[0].isFocused).toEqual(false);
        }));

        it('Disabled items can be set selected via code behind', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxDropDownTestDisabledComponent);
            fixture.detectChanges();
            const button = fixture.debugElement.query(By.css('button')).nativeElement;
            const list = fixture.componentInstance.dropdownDisabled;
            expect(list).toBeDefined();
            expect(list.items.length).toEqual(13);
            list.setSelectedItem(0);
            button.click();
            tick();

            fixture.detectChanges();
            expect(list.items[0].isSelected).toBeTruthy();
            button.click();
        }));

        it('Clicking a disabled item is not moving the focus', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxDropDownTestDisabledComponent);
            fixture.detectChanges();
            const button = fixture.debugElement.query(By.css('button')).nativeElement;
            const list = fixture.componentInstance.dropdownDisabled;
            const mockObj = {
                key: '',
                code: '',
                stopPropagation: () => {},
                preventDefault: () => {}
            };
            spyOn(mockObj, 'stopPropagation');
            spyOn(mockObj, 'preventDefault');
            expect(list).toBeDefined();
            expect(list.items.length).toEqual(13);
            button.click();
            tick();

            fixture.detectChanges();
            expect(list.items[8].isFocused).toEqual(true);
            const currentItem = fixture.debugElement.query(By.css('.' + CSS_CLASS_SELECTED));
            mockObj.code = 'ArrowDown';
            mockObj.key = 'ArrowDown';
            currentItem.triggerEventHandler('keydown', mockObj);
            tick();

            fixture.detectChanges();
            expect(list.items[10].isFocused).toEqual(true);
            const firstItem = list.items[0].element.nativeElement;
            firstItem.click({});
            tick();

            fixture.detectChanges();
            expect(list.items[10].isFocused).toEqual(true);
            mockObj.code = 'ArrowDown';
            mockObj.key = 'ArrowDown';
            currentItem.triggerEventHandler('keydown', mockObj);
            tick();

            fixture.detectChanges();
            expect(list.items[11].isFocused).toEqual(true);
        }));

        it('Should select item and close on Enter keydown', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxDropDownWithScrollComponent);
            fixture.detectChanges();
            const mockObj = {
                key: 'enter',
                code: 'enter',
                stopPropagation: () => {},
                preventDefault: () => {}
            };
            spyOn(mockObj, 'preventDefault');
            const igxDropDown = fixture.componentInstance.dropdownScroll;
            igxDropDown.toggle();
            tick();
            expect(igxDropDown.collapsed).toEqual(false);
            expect(igxDropDown.selectedItem).toEqual(null);
            tick();
            const dropdownHandler = fixture.debugElement.query(By.css(CSS_CLASS_DROP_DOWN_BASE));
            dropdownHandler.triggerEventHandler('keydown', mockObj);
            tick();
            expect(igxDropDown.collapsed).toEqual(true);
            expect(igxDropDown.selectedItem).toEqual(igxDropDown.items[0]);
            expect(mockObj.preventDefault).toHaveBeenCalledTimes(1);
        }));

        it('should keep selection per instance', fakeAsync(() => {
            const fixture = TestBed.createComponent(DoubleIgxDropDownComponent);
            fixture.detectChanges();
            const dropdown1 = fixture.componentInstance.dropdown1;
            const dropdown2 = fixture.componentInstance.dropdown2;
            dropdown1.setSelectedItem(1);
            expect(dropdown1.selectedItem).toEqual(dropdown1.items[1]);
            expect(dropdown2.selectedItem).toEqual(null);
            dropdown2.setSelectedItem(3);
            expect(dropdown1.selectedItem).toEqual(dropdown1.items[1]);
            expect(dropdown2.selectedItem).toEqual(dropdown2.items[3]);
            dropdown1.setSelectedItem(5);
            expect(dropdown1.selectedItem).toEqual(dropdown1.items[5]);
            expect(dropdown2.selectedItem).toEqual(dropdown2.items[3]);
        }));

        it('Should properly handle OnEnterKeyDown when the dropdown is not visible', fakeAsync(() => {
            const fixture = TestBed.createComponent(InputWithDropDownDirectiveComponent);
            fixture.detectChanges();
            const dropdown = fixture.componentInstance.dropdown;
            const inputElement = fixture.componentInstance.inputElement.nativeElement;
            expect(dropdown).toBeDefined();
            expect(inputElement).toBeDefined();
            expect(dropdown.focusedItem).toEqual(null);
            expect(dropdown.selectedItem).toEqual(null);
            spyOn(dropdown, 'selectItem').and.callThrough();
            expect(dropdown.selectItem).toHaveBeenCalledTimes(0);
            expect(dropdown.collapsed).toEqual(true);
            inputElement.click();
            tick();
            expect(dropdown.selectItem).toHaveBeenCalledTimes(0);
            expect(dropdown.collapsed).toEqual(true);
            expect(dropdown.focusedItem).toEqual(null);
            inputElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
            tick();
            expect(dropdown.selectItem).toHaveBeenCalledTimes(0); // does not attempt to select item on keydown if DD is closed;
            expect(dropdown.selectedItem).toEqual(null);
            expect(dropdown.collapsed).toEqual(true);
            dropdown.toggle();
            tick();
            expect(dropdown.collapsed).toEqual(false);
            expect(dropdown.focusedItem).toEqual(dropdown.items[0]);
            const dropdownItem = dropdown.items[0];
            inputElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
            tick();
            expect(dropdown.selectItem).toHaveBeenCalledTimes(1);
            expect(dropdown.selectItem).toHaveBeenCalledWith(dropdownItem, jasmine.any(Object));
            expect(dropdown.selectedItem).toEqual(dropdownItem);
            expect(dropdown.collapsed).toEqual(true);
        }));
    });

    describe('igxDropDown Unit tests', () => {
        configureTestSuite();
        it('Should fire events', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxDropDownTestComponent);
            const componentInstance = fixture.componentInstance;
            fixture.detectChanges();

            spyOn(componentInstance, 'onToggleOpening');
            spyOn(componentInstance, 'onToggleOpened');
            spyOn(componentInstance, 'onToggleClosing');
            spyOn(componentInstance, 'onToggleClosed');

            const button = fixture.debugElement.query(By.css('button')).nativeElement;
            const mockObj = jasmine.createSpyObj('mockEvt', ['stopPropagation', 'preventDefault']);
            button.click(mockObj);
            tick();

            fixture.detectChanges();
            expect(componentInstance.onToggleOpening).toHaveBeenCalledTimes(1);
            expect(componentInstance.onToggleOpened).toHaveBeenCalledTimes(1);
            button.click({ stopPropagation: () => null });
            tick();

            fixture.detectChanges();
            expect(componentInstance.onToggleClosing).toHaveBeenCalledTimes(1);
            expect(componentInstance.onToggleClosing).toHaveBeenCalledTimes(1);
        }));

        it('Should retain width/height properties', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxDropDownTestDisabledComponent);
            fixture.detectChanges();
            const button = fixture.debugElement.query(By.css('button')).nativeElement;
            fixture.componentInstance.dropdownDisabled.width = '80%';
            fixture.componentInstance.dropdownDisabled.height = '400px';

            button.click();
            tick();

            fixture.detectChanges();
            expect(fixture.componentInstance.dropdownDisabled.height).toEqual('400px');
            expect(fixture.componentInstance.dropdownDisabled.width).toEqual('80%');
        }));

        it('Items should take focus when allowItemsFocus is set to true', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxDropDownTestComponent);
            fixture.detectChanges();
            const button = fixture.debugElement.query(By.css('button')).nativeElement;
            fixture.componentInstance.dropdown.allowItemsFocus = true;
            button.focus();
            button.click();
            tick();

            const focusedItem = fixture.debugElement.queryAll(By.css('.igx-drop-down__item'))[0].nativeElement;
            expect(document.activeElement).toEqual(focusedItem);
        }));

        it('Items should not take focus when allowItemsFocus is set to false', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxDropDownTestComponent);
            fixture.detectChanges();
            const button = fixture.debugElement.query(By.css('button')).nativeElement;
            fixture.componentInstance.dropdown.allowItemsFocus = false;
            button.focus();
            button.click();
            tick();

            expect(document.activeElement).toEqual(button);
        }));

        it('SelectedItem should return and item when there is selected item', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxDropDownTestScrollComponent);
            fixture.detectChanges();
            const button = fixture.debugElement.query(By.css('button')).nativeElement;
            const igxDropDown = fixture.componentInstance.dropdownScroll;
            igxDropDown.setSelectedItem(3);
            button.click();
            tick();

            fixture.detectChanges();
            const selectedItem = igxDropDown.selectedItem;
            expect(selectedItem).toBeTruthy();
            expect(selectedItem.index).toEqual(3);
        }));

        it('SelectedItem should return null when there is no selected item', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxDropDownTestScrollComponent);
            fixture.detectChanges();
            const button = fixture.debugElement.query(By.css('button')).nativeElement;
            const igxDropDown = fixture.componentInstance.dropdownScroll;
            button.click();
            tick();

            fixture.detectChanges();
            const selectedItem = igxDropDown.selectedItem;
            expect(selectedItem).toBeNull();
        }));

        it('Should return empty array for items when there are no items', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxDropDownTestEmptyListComponent);
            fixture.detectChanges();
            const button = fixture.debugElement.query(By.css('button')).nativeElement;
            const igxDropDown = fixture.componentInstance.dropdownEmpty;
            button.click();
            tick();

            fixture.detectChanges();
            const items = igxDropDown.items;
            expect(items).toEqual([]);
        }));

        it('Should return all items for items when there are some items', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxDropDownTestComponent);
            fixture.detectChanges();
            const button = fixture.debugElement.query(By.css('button')).nativeElement;
            const igxDropDown = fixture.componentInstance.dropdown;
            button.click();
            tick();

            fixture.detectChanges();
            const items = igxDropDown.items;
            expect(items).toBeTruthy();
            expect(items.length).toEqual(4);
        }));

        it('Should return empty array for headers when there are no header items', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxDropDownTestComponent);
            fixture.detectChanges();
            const button = fixture.debugElement.query(By.css('button')).nativeElement;
            const igxDropDown = fixture.componentInstance.dropdown;
            button.click();
            tick();

            fixture.detectChanges();
            const headerItems = igxDropDown.headers;
            expect(headerItems).toEqual([]);
        }));

        it('Should return all header items for headers when there are some header items', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxDropDownTestDisabledComponent);
            fixture.detectChanges();
            const button = fixture.debugElement.query(By.css('button')).nativeElement;
            const igxDropDown = fixture.componentInstance.dropdownDisabled;
            button.click();
            tick();

            fixture.detectChanges();
            const headerItems = igxDropDown.headers;
            expect(headerItems).toBeTruthy();
            expect(headerItems.length).toEqual(2);
        }));

        it('Should open drop down when call open()', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxDropDownTestComponent);
            const componentInstance = fixture.componentInstance;
            const igxDropDown = componentInstance.dropdown;
            fixture.detectChanges();
            expect(igxDropDown.collapsed).toEqual(true);
            igxDropDown.open();
            tick();

            fixture.detectChanges();
            expect(igxDropDown.collapsed).toEqual(false);
        }));

        it('Should close drop down when call close()', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxDropDownTestComponent);
            const componentInstance = fixture.componentInstance;
            const igxDropDown = componentInstance.dropdown;
            fixture.detectChanges();
            expect(igxDropDown.collapsed).toEqual(true);
            igxDropDown.toggle();
            tick();

            fixture.detectChanges();
            expect(igxDropDown.collapsed).toEqual(false);

            igxDropDown.toggle();
            tick();

            fixture.detectChanges();
            expect(igxDropDown.collapsed).toEqual(true);
        }));

        it('#1663 drop down flickers on open', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxDropDownWithScrollComponent);
            fixture.detectChanges();
            const button = fixture.debugElement.query(By.css('button')).nativeElement;
            const igxDropDown = fixture.componentInstance.dropdownScroll;
            button.click();
            igxDropDown.open();
            tick();
            fixture.detectChanges();

            expect((<any>igxDropDown).toggleDirective.element.scrollTop).toEqual(116);
        }));

        it('Should set isSelected via igxDropDownIteComponent', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxDropDownTestComponent);
            const componentInstance = fixture.componentInstance;
            fixture.detectChanges();
            const button = fixture.debugElement.query(By.css('button')).nativeElement;
            button.click();
            tick();

            fixture.detectChanges();
            expect(componentInstance.dropdown.selectedItem).toBeNull();
            const items = componentInstance.dropdown.items as IgxDropDownItemComponent[];
            items[2].isSelected = true;
            tick();
            fixture.detectChanges();

            expect(items[2].isSelected).toBeTruthy();
            expect(componentInstance.dropdown.selectedItem.index).toEqual(2);

            items[1].isSelected = true;
            tick();
            fixture.detectChanges();

            expect(items[2].isSelected).toBeFalsy();
            expect(items[1].isSelected).toBeTruthy();
            expect(componentInstance.dropdown.selectedItem.index).toEqual(1);

            button.click();
            tick();
            fixture.detectChanges();

            expect(componentInstance.dropdown.selectedItem.index).toEqual(1);
        }));

        it('Should not set isSelected via igxDropDownItemBase on header items', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxDropDownTestDisabledAnyComponent);
            const componentInstance = fixture.componentInstance;
            fixture.detectChanges();
            const button = fixture.debugElement.query(By.css('button')).nativeElement;
            button.click();
            tick();
            fixture.detectChanges();

            expect(componentInstance.dropdownDisabledAny.selectedItem).toBeNull();
            const items = componentInstance.dropdownDisabledAny.items as IgxDropDownItemComponent[];
            const headerItems = componentInstance.dropdownDisabledAny.headers as IgxDropDownItemComponent[];

            // try to select header item
            headerItems[0].isSelected = true;
            tick();
            fixture.detectChanges();

            expect(headerItems[0].isSelected).toBeFalsy();
            expect(componentInstance.dropdownDisabledAny.selectedItem).toBeNull();

            // try to select disabled item
            items[2].isSelected = true;
            tick();
            fixture.detectChanges();

            expect(items[2].isSelected).toBeTruthy();
            expect(componentInstance.dropdownDisabledAny.selectedItem.index).toEqual(2);

            // try to select header item
            headerItems[1].isSelected = true;
            expect(headerItems[1].isSelected).toBeFalsy();
            expect(componentInstance.dropdownDisabledAny.selectedItem.index).toEqual(2);

            button.click();
            tick();
            fixture.detectChanges();

            expect(componentInstance.dropdownDisabledAny.selectedItem.index).toEqual(2);
        }));

        it('Should properly handle IgxDropDownItem value', fakeAsync(() => {
            const fixture = TestBed.createComponent(DropDownWithValuesComponent);
            const dropdown = fixture.componentInstance.dropdown;
            dropdown.toggle();
            tick();
            fixture.detectChanges();
            dropdown.selectItem(dropdown.items[2]);
            tick();
            fixture.detectChanges();
            expect(dropdown.selectedItem.value).toEqual({ name: 'Product 3', id: 3 });
        }));

        it('#2798 - Allow canceling of open and close of IgxDropDown through onOpening and onClosing events', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxDropDownTestComponent);
            const dropdown = fixture.componentInstance.dropdown;
            const toggle: IgxToggleDirective = (<any>dropdown).toggleDirective;
            fixture.detectChanges();

            const onOpeningSpy = spyOn(dropdown.onOpening, 'emit').and.callThrough();
            const onOpenedSpy = spyOn(dropdown.onOpened, 'emit').and.callThrough();
            spyOn(dropdown.onClosing, 'emit').and.callThrough();
            spyOn(dropdown.onClosed, 'emit').and.callThrough();

            dropdown.onClosing.pipe(take(1)).subscribe((e: CancelableEventArgs) => e.cancel = true);

            const button = fixture.debugElement.query(By.css('button')).nativeElement;
            const mockObj = jasmine.createSpyObj('mockEvt', ['stopPropagation', 'preventDefault']);
            button.click(mockObj);
            fixture.detectChanges();
            tick();

            expect(dropdown.onOpening.emit).toHaveBeenCalledTimes(1);
            expect(dropdown.onOpened.emit).toHaveBeenCalledTimes(1);

            button.click({ stopPropagation: () => null });
            fixture.detectChanges();
            tick();

            expect(dropdown.onClosing.emit).toHaveBeenCalledTimes(1);
            expect(dropdown.onClosed.emit).toHaveBeenCalledTimes(0);

            toggle.close();
            fixture.detectChanges();
            tick();
            onOpeningSpy.calls.reset();
            onOpenedSpy.calls.reset();

            dropdown.onOpening.pipe(take(1)).subscribe((e: CancelableEventArgs) => e.cancel = true);
            button.click(mockObj);
            fixture.detectChanges();
            tick();

            expect(dropdown.onOpening.emit).toHaveBeenCalledTimes(1);
            expect(dropdown.onOpened.emit).toHaveBeenCalledTimes(0);
        }));
    });
});

@Component({
    template: `
    <button (click)="toggleDropDown()">Toggle</button>
    <igx-drop-down igxDropDownItemNavigation (onSelection)="onSelection($event)" [allowItemsFocus]="true"
    (onOpening)="onToggleOpening($event)" (onOpened)="onToggleOpened()"
    (onClosing)="onToggleClosing($event)" (onClosed)="onToggleClosed()" [width]="'400px'" [height]="'400px'">
        <igx-drop-down-item *ngFor="let item of items">
            {{ item.field }}
        </igx-drop-down-item>
    </igx-drop-down>`
})
class IgxDropDownTestComponent {

    @ViewChild(IgxDropDownComponent, { read: IgxDropDownComponent })
    public dropdown: IgxDropDownComponent;

    public items: any[] = [
        { field: 'Nav1' },
        { field: 'Nav2' },
        { field: 'Nav3' },
        { field: 'Nav4' }
    ];

    public toggleDropDown() {
        this.dropdown.toggle();
    }

    public onSelection(ev) { }

    public onToggleOpening() { }

    public onToggleOpened() { }

    public onToggleClosing() { }

    public onToggleClosed() { }
}

@Component({
    template: `
    <button (click)="toggleDropDown()">Show</button>
    <button (click)="selectItem5()">Select 5</button>
    <igx-drop-down igxDropDownItemNavigation #scrollDropDown [allowItemsFocus]="true">
        <igx-drop-down-item *ngFor="let item of items">
            {{ item.field }}
        </igx-drop-down-item>
    </igx-drop-down>
    `
})
class IgxDropDownTestScrollComponent {

    @ViewChild('scrollDropDown', { read: IgxDropDownComponent })
    public dropdownScroll: IgxDropDownComponent;

    public items: any[] = [
        { field: 'Item 1' },
        { field: 'Item 2' },
        { field: 'Item 3' },
        { field: 'Item 4' },
        { field: 'Item 5' },
        { field: 'Item 6' },
        { field: 'Item 7' },
        { field: 'Item 8' },
        { field: 'Item 9' },
        { field: 'Item 10' },
        { field: 'Item 11' },
        { field: 'Item 12' },
        { field: 'Item 13' },
        { field: 'Item 14' },
        { field: 'Item 15' }
    ];

    public toggleDropDown() {
        this.dropdownScroll.toggle();
    }

    public selectItem5() {
        this.dropdownScroll.setSelectedItem(4);
    }
}

@Component({
    template: `
    <button (click)="toggleDropDown()">Show</button>
    <button (click)="selectItem5()">Select 5</button>
    <igx-drop-down igxDropDownItemNavigation #dropdownDisabledAny>
        <igx-drop-down-item *ngFor="let item of items" disabled={{item.disabled}} isHeader={{item.header}}>
            {{ item.field }}
        </igx-drop-down-item>
    </igx-drop-down>
    `
})
class IgxDropDownTestDisabledAnyComponent {

    @ViewChild(IgxDropDownComponent, { read: IgxDropDownComponent })
    public dropdownDisabledAny: IgxDropDownComponent;

    public items: any[] = [
        { field: 'Item 111' },
        { field: 'Item 2', header: true },
        { field: 'Item 3' },
        { field: 'Item 4', disabled: true },
        { field: 'Item 5', header: true },
        { field: 'Item 6' },
        { field: 'Item 7' },
        { field: 'Item 8', disabled: true },
        { field: 'Item 9' },
        { field: 'Item 10' },
        { field: 'Item 11' },
        { field: 'Item 12', disabled: true },
        { field: 'Item 13' },
        { field: 'Item 14' },
        { field: 'Item 15' }
    ];

    public toggleDropDown() {
        this.dropdownDisabledAny.toggle();
    }

    public selectItem5() {
        this.dropdownDisabledAny.setSelectedItem(4);
    }
}

@Component({
    template: `
    <button (click)="toggleDropDown()">Show</button>
    <button (click)="selectItem5()">Select 5</button>
    <igx-drop-down #dropdownDisabled>
        <igx-drop-down-item [igxDropDownItemNavigation]="dropdownDisabled" *ngFor="let item of items"
        [disabled]="item.disabled" [isHeader]="item.header" [isSelected]="item.selected">
            {{ item.field }}
        </igx-drop-down-item>
    </igx-drop-down>
    `
})
class IgxDropDownTestDisabledComponent {

    @ViewChild(IgxDropDownComponent, { read: IgxDropDownComponent })
    public dropdownDisabled: IgxDropDownComponent;

    public items: any[] = [
        { field: 'Item 111', disabled: true },
        { field: 'Item 2', header: true },
        { field: 'Item 3' },
        { field: 'Item 4', disabled: true },
        { field: 'Item 5', header: true },
        { field: 'Item 6' },
        { field: 'Item 7' },
        { field: 'Item 8', disabled: true },
        { field: 'Item 9' },
        { field: 'Item 10' },
        { field: 'Item 11', selected: true },
        { field: 'Item 12', disabled: true },
        { field: 'Item 13' },
        { field: 'Item 14' },
        { field: 'Item 15', disabled: true }
    ];

    public toggleDropDown() {
        this.dropdownDisabled.toggle();
    }

    public selectItem5() {
        this.dropdownDisabled.setSelectedItem(4);
    }
}

@Component({
    template: `
    <button (click)="toggleDropDown()">Show</button>
    <igx-drop-down igxDropDownItemNavigation #dropdownDisabled>
        <igx-drop-down-item *ngFor="let item of items" disabled={{item.disabled}} isHeader={{item.header}}>
            {{ item.field }}
        </igx-drop-down-item>
    </igx-drop-down>
    `
})
class IgxDropDownTestEmptyListComponent {

    @ViewChild(IgxDropDownComponent, { read: IgxDropDownComponent })
    public dropdownEmpty: IgxDropDownComponent;

    public items: any[] = [];

    public toggleDropDown() {
        this.dropdownEmpty.toggle();
    }
}
@Component({
    template: `
    <button (click)="selectItem5()">Select 5</button>
    <igx-drop-down igxDropDownItemNavigation #scrollDropDown [allowItemsFocus]="true">
        <igx-drop-down-item *ngFor="let item of items">
            {{ item.field }}
        </igx-drop-down-item>
    </igx-drop-down>
    `
})
class IgxDropDownWithScrollComponent implements OnInit {

    @ViewChild('scrollDropDown', { read: IgxDropDownComponent })
    public dropdownScroll: IgxDropDownComponent;

    public items: any[] = [];

    public toggleDropDown() {
        this.dropdownScroll.toggle();
    }

    public selectItem5() {
        this.dropdownScroll.setSelectedItem(4);
    }

    ngOnInit() {
        this.dropdownScroll.height = '200px';
        for (let index = 1; index < 100; index++) {
            this.items.push({ field: 'Item ' + index });
        }
    }
}

@Component({
    template: `
    <button (click)="selectItem5()">Select 5</button>
    <igx-drop-down #dropdown1>
        <igx-drop-down-item *ngFor="let item of items">
            {{ item.field }}
        </igx-drop-down-item>
    </igx-drop-down>
    <igx-drop-down #dropdown2>
        <igx-drop-down-item *ngFor="let item of items">
            {{ item.field }}
        </igx-drop-down-item>
    </igx-drop-down>
    `
})
class DoubleIgxDropDownComponent implements OnInit {

    @ViewChild('dropdown1', { read: IgxDropDownComponent })
    public dropdown1: IgxDropDownComponent;

    @ViewChild('dropdown2', { read: IgxDropDownComponent })
    public dropdown2: IgxDropDownComponent;

    public items: any[] = [];

    ngOnInit() {
        for (let index = 1; index < 100; index++) {
            this.items.push({ field: 'Item ' + index });
        }
    }
}

@Component({
    template: `
    <input (click)="toggleDropDown()">
    <igx-drop-down igxDropDownItemNavigation (onSelection)="onSelection($event)"
    (onOpening)="onToggleOpening()" (onOpened)="onToggleOpened()"
    (onClosing)="onToggleClosing()" (onClosed)="onToggleClosed()" [width]="'400px'" [height]="'400px'">
        <igx-drop-down-item *ngFor="let item of items">
            {{ item.field }}
        </igx-drop-down-item>
    </igx-drop-down>`
})
class IgxDropDownInputTestComponent {

    @ViewChild(IgxDropDownComponent, { read: IgxDropDownComponent })
    public dropdown: IgxDropDownComponent;

    public items: any[] = [
        { field: 'Nav1' },
        { field: 'Nav2' },
        { field: 'Nav3' },
        { field: 'Nav4' }
    ];

    public toggleDropDown() {
        this.dropdown.toggle();
    }

    public onSelection(ev) { }

    public onToggleOpening() { }

    public onToggleOpened() { }

    public onToggleClosing() { }

    public onToggleClosed() { }
}

@Component({
    template: `
    <img src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png" (click)="toggleDropDown()">
    <igx-drop-down igxDropDownItemNavigation (onSelection)="onSelection($event)"
    (onOpening)="onToggleOpening()" (onOpened)="onToggleOpened()"
    (onClosing)="onToggleClosing()" (onClosed)="onToggleClosed()" [width]="'400px'" [height]="'400px'">
        <igx-drop-down-item *ngFor="let item of items">
            {{ item.field }}
        </igx-drop-down-item>
    </igx-drop-down>`
})
class IgxDropDownImageTestComponent {

    @ViewChild(IgxDropDownComponent, { read: IgxDropDownComponent })
    public dropdown: IgxDropDownComponent;

    public items: any[] = [
        { field: 'Nav1' },
        { field: 'Nav2' },
        { field: 'Nav3' },
        { field: 'Nav4' }
    ];

    public toggleDropDown() {
        this.dropdown.toggle();
    }

    public onSelection(ev) { }

    public onToggleOpening() { }

    public onToggleOpened() { }

    public onToggleClosing() { }

    public onToggleClosed() { }
}

@Component({
    template: `
    <igx-tabs (onTabItemSelected)="toggleDropDown()" tabsType="fixed">
        <igx-tabs-group label="Tab111111111111111111111111">
            <ng-template igxTab>
                <div>T1</div>
                </ng-template>
                <h1>Tab 1 Content</h1>
            </igx-tabs-group>
        <igx-tabs-group label="Tab 2">
            <ng-template igxTab>
                <div>T2</div>
            </ng-template>
            <h1>Tab 2 Content</h1>
        </igx-tabs-group>
        <igx-tabs-group label="Tab 3">
            <ng-template igxTab>
                <div>T3</div>
            </ng-template>
            <h1>Tab 3 Content</h1>
        </igx-tabs-group>
    </igx-tabs>
    <igx-drop-down igxDropDownItemNavigation (onSelection)="onSelection($event)"
    (onOpening)="onToggleOpening()" (onOpened)="onToggleOpened()"
    (onClosing)="onToggleClosing()" (onClosed)="onToggleClosed()" [width]="'400px'" [height]="'400px'">
        <igx-drop-down-item *ngFor="let item of items">
            {{ item.field }}
        </igx-drop-down-item>
    </igx-drop-down>`
})
class IgxDropDownTabsTestComponent {

    @ViewChild(IgxTabsComponent)
    public tabs: IgxTabsComponent;
    @ViewChild(IgxDropDownComponent, { read: IgxDropDownComponent })
    public dropdown: IgxDropDownComponent;

    public items: any[] = [
        { field: 'Nav1' },
        { field: 'Nav2' },
        { field: 'Nav3' },
        { field: 'Nav4' }
    ];

    public toggleDropDown() {
        this.dropdown.toggle();
    }

    public onSelection(ev) { }

    public onToggleOpening() { }

    public onToggleOpened() { }

    public onToggleClosing() { }

    public onToggleClosed() { }
}

@Component({
    template: `
    <button (click)="toggleDropDown()">Toggle</button>
    <igx-drop-down igxDropDownItemNavigation (onSelection)="onSelection($event)" [allowItemsFocus]="true"
    [width]="'400px'" [height]="'400px'">
        <igx-drop-down-item *ngFor="let item of items">
            {{ item.field }}
        </igx-drop-down-item>
    </igx-drop-down>
    `
})
class IgxDropDownSelectComponent {
    @ViewChild(IgxDropDownComponent, { read: IgxDropDownComponent })
    public dropdown: IgxDropDownComponent;

    public items: any[] = [
        { field: 'Nav1' },
        { field: 'Nav2' },
        { field: 'Nav3' },
        { field: 'Nav4' }
    ];

    public toggleDropDown() {
        this.dropdown.toggle();
    }

    public onSelection(eventArgs) {
        eventArgs.cancel = true;
    }
}
@Component({
    template: ` <input #inputElement [igxDropDownItemNavigation]="dropdownElement" class='test-input' type='text' value='Focus Me!'/>
    <igx-drop-down #dropdownElement [width]="'400px'" [height]="'400px'" [allowItemsFocus]="true">
        <igx-drop-down-item *ngFor="let item of items">
            {{ item.field }}
        </igx-drop-down-item>
    </igx-drop-down>`
})
class InputWithDropDownDirectiveComponent {
    @ViewChild(IgxDropDownComponent, { read: IgxDropDownComponent })
    public dropdown: IgxDropDownComponent;

    @ViewChild(`inputElement`)
    public inputElement: ElementRef;

    public items: any[] = [
        { field: 'Nav1' },
        { field: 'Nav2' },
        { field: 'Nav3' },
        { field: 'Nav4' }
    ];
}

@Component({
    template: `
    <igx-drop-down #dropdownElement [width]="'400px'" [height]="'400px'">
        <igx-drop-down-item *ngFor="let item of items" [value]="item">
            {{ item.field }}
        </igx-drop-down-item>
    </igx-drop-down>`
})
class DropDownWithValuesComponent {
    @ViewChild(IgxDropDownComponent, { read: IgxDropDownComponent })
    public dropdown: IgxDropDownComponent;

    public items: any[] = [
        { name: 'Product 1', id: 1 },
        { name: 'Product 2', id: 2 },
        { name: 'Product 3', id: 3 },
        { name: 'Product 4', id: 3 },
    ];
}
