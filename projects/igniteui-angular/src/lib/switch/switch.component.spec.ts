import { Component, ViewChild } from '@angular/core';
import {
    async,
    TestBed
} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { IgxSwitchComponent } from './switch.component';

import { configureTestSuite } from '../test-utils/configure-suite';

describe('IgxSwitch', () => {
    configureTestSuite();
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                InitSwitchComponent,
                SwitchSimpleComponent,
                SwitchRequiredComponent,
                SwitchDisabledComponent,
                SwitchExternalLabelComponent,
                SwitchInvisibleLabelComponent,
                IgxSwitchComponent
            ],
            imports: [FormsModule, IgxRippleModule]
        })
            .compileComponents();
    }));

    it('Initializes', () => {
        const fixture = TestBed.createComponent(InitSwitchComponent);
        fixture.detectChanges();

        const domSwitch = fixture.debugElement.query(By.css('igx-switch')).nativeElement;
        const nativeCheckbox = fixture.debugElement.query(By.css('input')).nativeElement;
        const nativeLabel = fixture.debugElement.query(By.css('label')).nativeElement;
        const placeholderLabel = fixture.debugElement.query(By.css('.igx-switch__label')).nativeElement;

        expect(domSwitch.id).toBe('igx-switch-0');
        expect(nativeCheckbox).toBeTruthy();
        expect(nativeCheckbox.id).toEqual('igx-switch-0-input');
        expect(nativeCheckbox.getAttribute('aria-label')).toEqual(null);
        expect(nativeCheckbox.getAttribute('aria-labelledby')).toMatch('igx-switch-0-label');

        expect(nativeLabel).toBeTruthy();
        expect(nativeLabel.getAttribute('for')).toEqual('igx-switch-0-input');

        expect(placeholderLabel.textContent.trim()).toEqual('Init');
        expect(placeholderLabel.classList).toContain('igx-switch__label');
        expect(placeholderLabel.getAttribute('id')).toEqual('igx-switch-0-label');
    });

    it('Initializes with ngModel', () => {
        const fixture = TestBed.createComponent(SwitchSimpleComponent);
        fixture.detectChanges();

        const testInstance = fixture.componentInstance;
        const switchInstance = testInstance.switch;
        const nativeCheckbox = switchInstance.nativeCheckbox.nativeElement;

        fixture.detectChanges();

        expect(nativeCheckbox.checked).toBe(false);
        expect(switchInstance.checked).toBe(false);

        testInstance.subscribed = true;
        switchInstance.name = 'my-switch';
        fixture.detectChanges();

        expect(nativeCheckbox.checked).toBe(true);
        expect(switchInstance.checked).toBe(true);
        expect(switchInstance.name).toEqual('my-switch');
    });

    it('Initializes with external label', () => {
        const fixture = TestBed.createComponent(SwitchExternalLabelComponent);
        const switchInstance = fixture.componentInstance.switch;
        const nativeCheckbox = switchInstance.nativeCheckbox.nativeElement;
        const externalLabel = fixture.debugElement.query(By.css('#my-label')).nativeElement;
        fixture.detectChanges();

        expect(nativeCheckbox.getAttribute('aria-labelledby')).toMatch(externalLabel.getAttribute('id'));
        expect(externalLabel.textContent).toMatch(fixture.componentInstance.label);
    });

    it('Initializes with invisible label', () => {
        const fixture = TestBed.createComponent(SwitchInvisibleLabelComponent);
        const switchInstance = fixture.componentInstance.switch;
        const nativeCheckbox = switchInstance.nativeCheckbox.nativeElement;
        fixture.detectChanges();

        expect(nativeCheckbox.getAttribute('aria-label')).toMatch(fixture.componentInstance.label);
    });

    it('Positions label before and after switch', () => {
        const fixture = TestBed.createComponent(SwitchSimpleComponent);
        const switchInstance = fixture.componentInstance.switch;
        const placeholderLabel = switchInstance.placeholderLabel.nativeElement;
        const labelStyles = window.getComputedStyle(placeholderLabel);
        fixture.detectChanges();

        expect(labelStyles.order).toEqual('0');

        switchInstance.labelPosition = 'before';
        fixture.detectChanges();

        expect(labelStyles.order).toEqual('-1');
    });

    it('Required state', () => {
        const fixture = TestBed.createComponent(SwitchRequiredComponent);
        const testInstance = fixture.componentInstance;
        const switchInstance = testInstance.switch;
        const nativeCheckbox = switchInstance.nativeCheckbox.nativeElement;
        fixture.detectChanges();

        expect(switchInstance.required).toBe(true);
        expect(nativeCheckbox.required).toBeTruthy();

        switchInstance.required = false;
        fixture.detectChanges();

        expect(switchInstance.required).toBe(false);
        expect(nativeCheckbox.required).toBe(false);
    });

    it('Disabled state', () => {
        const fixture = TestBed.createComponent(SwitchDisabledComponent);
        const testInstance = fixture.componentInstance;
        const switchInstance = testInstance.switch;
        const nativeCheckbox = switchInstance.nativeCheckbox.nativeElement;
        const nativeLabel = switchInstance.nativeLabel.nativeElement;
        const placeholderLabel = switchInstance.placeholderLabel.nativeElement;
        fixture.detectChanges();

        expect(switchInstance.disabled).toBe(true);
        expect(nativeCheckbox.disabled).toBe(true);

        nativeCheckbox.dispatchEvent(new Event('change'));
        nativeLabel.click();
        placeholderLabel.click();
        fixture.detectChanges();

        // Should not update
        expect(switchInstance.checked).toBe(false);
        expect(testInstance.subscribed).toBe(false);
    });

    it('Event handling', () => {
        const fixture = TestBed.createComponent(SwitchSimpleComponent);
        const testInstance = fixture.componentInstance;
        const switchInstance = testInstance.switch;
        const nativeCheckbox = switchInstance.nativeCheckbox.nativeElement;
        const nativeLabel = switchInstance.nativeLabel.nativeElement;
        const placeholderLabel = switchInstance.placeholderLabel.nativeElement;
        fixture.detectChanges();

        nativeCheckbox.dispatchEvent(new Event('focus'));
        fixture.detectChanges();
        expect(switchInstance.focused).toBe(true);

        nativeCheckbox.dispatchEvent(new Event('blur'));
        fixture.detectChanges();
        expect(switchInstance.focused).toBe(false);

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
            const fixture = TestBed.createComponent(SwitchSimpleComponent);
            fixture.detectChanges();

            const instance = fixture.componentInstance.switch;
            const editElement = fixture.debugElement.query(By.css('.igx-switch__input')).nativeElement;

            expect(instance.getEditElement()).toBe(editElement);
        });
    });
});

@Component({ template: `<igx-switch>Init</igx-switch>` })
class InitSwitchComponent { }

@Component({
    template: `<igx-switch #switch (change)="onChange($event)" (click)="onClick($event)"
[(ngModel)]="subscribed" [checked]="subscribed">Simple</igx-switch>`})
class SwitchSimpleComponent {
    @ViewChild('switch') public switch: IgxSwitchComponent;
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
    template: `<igx-switch #switch
                                [(ngModel)]="subscribed"
                                >Indeterminate</igx-switch>`})
class SwitchIndeterminateComponent {
    @ViewChild('switch') public switch: IgxSwitchComponent;

    public subscribed = false;
}

@Component({
    template: `<igx-switch #switch [required]="true">Required</igx-switch>`
})
class SwitchRequiredComponent {
    @ViewChild('switch') public switch: IgxSwitchComponent;
}

@Component({
    template: `<igx-switch #switch
                                [(ngModel)]="subscribed"
                                [checked]="subscribed"
                                [disabled]="true">Disabled</igx-switch>`})
class SwitchDisabledComponent {
    @ViewChild('switch') public switch: IgxSwitchComponent;

    public subscribed = false;
}

@Component({
    template: `<p id="my-label">{{label}}</p>
    <igx-switch #switch aria-labelledby="my-label"></igx-switch>`
})
class SwitchExternalLabelComponent {
    @ViewChild('switch') public switch: IgxSwitchComponent;
    label = 'My Label';
}

@Component({
    template: `<igx-switch #switch [aria-label]="label"></igx-switch>`
})
class SwitchInvisibleLabelComponent {
    @ViewChild('switch') public switch: IgxSwitchComponent;
    label = 'Invisible Label';
}
