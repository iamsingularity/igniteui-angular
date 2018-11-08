import { Component, ViewChild } from '@angular/core';
import {
    async,
    TestBed
} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { IgxCheckboxComponent } from './checkbox.component';

import { configureTestSuite } from '../test-utils/configure-suite';

describe('IgxCheckbox', () => {
    configureTestSuite();
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                InitCheckboxComponent,
                CheckboxSimpleComponent,
                CheckboxDisabledComponent,
                CheckboxIndeterminateComponent,
                CheckboxRequiredComponent,
                CheckboxExternalLabelComponent,
                CheckboxInvisibleLabelComponent,
                IgxCheckboxComponent
            ],
            imports: [FormsModule, IgxRippleModule]
        })
            .compileComponents();
    }));

    it('Initializes a checkbox', () => {
        const fixture = TestBed.createComponent(InitCheckboxComponent);
        fixture.detectChanges();

        const nativeCheckbox = fixture.debugElement.query(By.css('input')).nativeElement;
        const nativeLabel = fixture.debugElement.query(By.css('label')).nativeElement;
        const placeholderLabel = fixture.debugElement.query(By.css('.igx-checkbox__label')).nativeElement;

        expect(nativeCheckbox).toBeTruthy();
        expect(nativeCheckbox.id).toEqual('igx-checkbox-0-input');
        expect(nativeCheckbox.getAttribute('aria-label')).toEqual(null);
        expect(nativeCheckbox.getAttribute('aria-labelledby')).toMatch('igx-checkbox-0-label');

        expect(nativeLabel).toBeTruthy();
        expect(nativeLabel.getAttribute('for')).toEqual('igx-checkbox-0-input');

        expect(placeholderLabel.textContent.trim()).toEqual('Init');
        expect(placeholderLabel.classList).toContain('igx-checkbox__label');
        expect(placeholderLabel.getAttribute('id')).toEqual('igx-checkbox-0-label');
    });

    it('Initializes with ngModel', () => {
        const fixture = TestBed.createComponent(CheckboxSimpleComponent);
        fixture.detectChanges();

        const testInstance = fixture.componentInstance;
        const checkboxInstance = testInstance.cb;
        const nativeCheckbox = checkboxInstance.nativeCheckbox.nativeElement;

        fixture.detectChanges();

        expect(nativeCheckbox.checked).toBe(false);
        expect(checkboxInstance.checked).toBe(false);

        testInstance.subscribed = true;
        checkboxInstance.name = 'my-checkbox';
        fixture.detectChanges();

        expect(nativeCheckbox.checked).toBe(true);
        expect(checkboxInstance.checked).toBe(true);
        expect(checkboxInstance.name).toEqual('my-checkbox');
    });

    it('Initializes with external label', () => {
        const fixture = TestBed.createComponent(CheckboxExternalLabelComponent);
        const checkboxInstance = fixture.componentInstance.cb;
        const nativeCheckbox = checkboxInstance.nativeCheckbox.nativeElement;
        const externalLabel = fixture.debugElement.query(By.css('#my-label')).nativeElement;
        fixture.detectChanges();

        expect(nativeCheckbox.getAttribute('aria-labelledby')).toMatch(externalLabel.getAttribute('id'));
        expect(externalLabel.textContent).toMatch(fixture.componentInstance.label);
    });

    it('Initializes with invisible label', () => {
        const fixture = TestBed.createComponent(CheckboxInvisibleLabelComponent);
        const checkboxInstance = fixture.componentInstance.cb;
        const nativeCheckbox = checkboxInstance.nativeCheckbox.nativeElement;
        fixture.detectChanges();

        expect(nativeCheckbox.getAttribute('aria-label')).toMatch(fixture.componentInstance.label);
    });

    it('Positions label before and after checkbox', () => {
        const fixture = TestBed.createComponent(CheckboxSimpleComponent);
        const checkboxInstance = fixture.componentInstance.cb;
        const placeholderLabel = checkboxInstance.placeholderLabel.nativeElement;
        const labelStyles = window.getComputedStyle(placeholderLabel);
        fixture.detectChanges();

        expect(labelStyles.order).toEqual('0');

        checkboxInstance.labelPosition = 'before';
        fixture.detectChanges();

        expect(labelStyles.order).toEqual('-1');
    });

    it('Indeterminate state', () => {
        const fixture = TestBed.createComponent(CheckboxIndeterminateComponent);
        const testInstance = fixture.componentInstance;
        const checkboxInstance = testInstance.cb;
        const nativeCheckbox = checkboxInstance.nativeCheckbox.nativeElement;
        const nativeLabel = checkboxInstance.nativeLabel.nativeElement;
        testInstance.subscribed = true;
        fixture.detectChanges();

        expect(nativeCheckbox.indeterminate).toBe(true);
        expect(nativeCheckbox.checked).toBe(false);

        // Should not update
        nativeCheckbox.dispatchEvent(new Event('change'));
        fixture.detectChanges();

        expect(nativeCheckbox.indeterminate).toBe(true);
        expect(nativeCheckbox.checked).toBe(false);

        // Should update on click
        nativeLabel.click();
        fixture.detectChanges();

        expect(nativeCheckbox.indeterminate).toBe(false);
        expect(nativeCheckbox.checked).toBe(true);
    });

    it('Disabled state', () => {
        const fixture = TestBed.createComponent(CheckboxDisabledComponent);
        const testInstance = fixture.componentInstance;
        const checkboxInstance = testInstance.cb;
        const nativeCheckbox = checkboxInstance.nativeCheckbox.nativeElement;
        const nativeLabel = checkboxInstance.nativeLabel.nativeElement;
        const placeholderLabel = checkboxInstance.placeholderLabel.nativeElement;
        fixture.detectChanges();

        expect(checkboxInstance.disabled).toBe(true);
        expect(nativeCheckbox.disabled).toBe(true);

        nativeCheckbox.dispatchEvent(new Event('change'));
        nativeLabel.click();
        placeholderLabel.click();
        fixture.detectChanges();

        // Should not update
        expect(checkboxInstance.checked).toBe(false);
        expect(testInstance.subscribed).toBe(false);
    });

    it('Required state', () => {
        const fixture = TestBed.createComponent(CheckboxRequiredComponent);
        const testInstance = fixture.componentInstance;
        const checkboxInstance = testInstance.cb;
        const nativeCheckbox = checkboxInstance.nativeCheckbox.nativeElement;
        fixture.detectChanges();

        expect(checkboxInstance.required).toBe(true);
        expect(nativeCheckbox.required).toBeTruthy();

        checkboxInstance.required = false;
        fixture.detectChanges();

        expect(checkboxInstance.required).toBe(false);
        expect(nativeCheckbox.required).toBe(false);
    });

    it('Event handling', () => {
        const fixture = TestBed.createComponent(CheckboxSimpleComponent);
        const testInstance = fixture.componentInstance;
        const checkboxInstance = testInstance.cb;
        const nativeCheckbox = checkboxInstance.nativeCheckbox.nativeElement;
        const nativeLabel = checkboxInstance.nativeLabel.nativeElement;
        const placeholderLabel = checkboxInstance.placeholderLabel.nativeElement;
        fixture.detectChanges();

        nativeCheckbox.dispatchEvent(new Event('focus'));
        fixture.detectChanges();
        expect(checkboxInstance.focused).toBe(true);

        nativeCheckbox.dispatchEvent(new Event('blur'));
        fixture.detectChanges();
        expect(checkboxInstance.focused).toBe(false);

        nativeLabel.click();
        fixture.detectChanges();

        expect(testInstance.changeEventCalled).toBe(true);
        expect(testInstance.subscribed).toBe(true);
        expect(testInstance.clickCounter).toEqual(1);

        placeholderLabel.click();
        fixture.detectChanges();

        expect(testInstance.changeEventCalled).toBe(true);
        expect(testInstance.subscribed).toBe(false);
        expect(testInstance.clickCounter).toEqual(2);
    });

    describe('EditorProvider', () => {
        it('Should return correct edit element', () => {
            const fixture = TestBed.createComponent(CheckboxSimpleComponent);
            fixture.detectChanges();

            const instance = fixture.componentInstance.cb;
            const editElement = fixture.debugElement.query(By.css('.igx-checkbox__input')).nativeElement;

            expect(instance.getEditElement()).toBe(editElement);
        });
    });
});

@Component({ template: `<igx-checkbox>Init</igx-checkbox>` })
class InitCheckboxComponent { }

@Component({
    template: `<igx-checkbox #cb (change)="onChange($event)" (click)="onClick($event)"
[(ngModel)]="subscribed" [checked]="subscribed">Simple</igx-checkbox>`})
class CheckboxSimpleComponent {
    @ViewChild('cb') public cb: IgxCheckboxComponent;
    public changeEventCalled = false;
    public subscribed = false;
    public clickCounter = 0;
    public onChange(event) {
        this.changeEventCalled = true;
    }
    public onClick(event) {
        this.clickCounter++;
    }
}
@Component({
    template: `<igx-checkbox #cb
                                [(ngModel)]="subscribed"
                                [indeterminate]="true"
                                >Indeterminate</igx-checkbox>`})
class CheckboxIndeterminateComponent {
    @ViewChild('cb') public cb: IgxCheckboxComponent;

    public subscribed = false;
}

@Component({
    template: `<igx-checkbox #cb [required]="true">Required</igx-checkbox>`
})
class CheckboxRequiredComponent {
    @ViewChild('cb') public cb: IgxCheckboxComponent;
}

@Component({
    template: `<igx-checkbox #cb
                                [(ngModel)]="subscribed"
                                [checked]="subscribed"
                                [disabled]="true">Disabled</igx-checkbox>`})
class CheckboxDisabledComponent {
    @ViewChild('cb') public cb: IgxCheckboxComponent;

    public subscribed = false;
}

@Component({
    template: `<p id="my-label">{{label}}</p>
    <igx-checkbox #cb aria-labelledby="my-label"></igx-checkbox>`
})
class CheckboxExternalLabelComponent {
    @ViewChild('cb') public cb: IgxCheckboxComponent;
    label = 'My Label';
}

@Component({
    template: `<igx-checkbox #cb [aria-label]="label"></igx-checkbox>`
})
class CheckboxInvisibleLabelComponent {
    @ViewChild('cb') public cb: IgxCheckboxComponent;
    label = 'Invisible Label';
}
