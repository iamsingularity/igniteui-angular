import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DoCheck,
    ElementRef,
    EventEmitter,
    HostBinding,
    HostListener,
    Input,
    NgZone,
    OnInit,
    TemplateRef,
    ViewChild,
    QueryList,
    ViewChildren
} from '@angular/core';
import { Subject } from 'rxjs';
import { DataType } from '../data-operations/data-util';
import { IgxGridAPIService } from './api.service';
import { IgxColumnComponent } from './column.component';
import { IgxDropDownComponent } from '../drop-down/drop-down.component';
import { IFilteringOperation } from '../data-operations/filtering-condition';
import { FilteringLogic, IFilteringExpression } from '../data-operations/filtering-expression.interface';
import { OverlaySettings, HorizontalAlignment, VerticalAlignment } from '../services/overlay/utilities';
import { ConnectedPositioningStrategy } from '../services/overlay/position/connected-positioning-strategy';
import { FilteringExpressionsTree } from '../data-operations/filtering-expressions-tree';
import { IgxGridFilterConditionPipe } from './grid.pipes';
import { TitleCasePipe } from '../../../../../node_modules/@angular/common';
import { IgxDatePickerComponent } from '../date-picker/date-picker.component';

/**
 * @hidden
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-grid-quick-filter',
    templateUrl: './grid-quick-filter.component.html'
})
export class IgxGridQuickFilterComponent implements OnInit, AfterViewInit {

    @Input()
    public column: IgxColumnComponent;

    @Input()
    public gridID: string;

    @Input()
    get value() {
        return this._value;
    }

    set value(val) {
        if (!val && val !== 0) {
            this._value = null;
        } else {
            this._value = this.transformValue(val);
        }
        this.expression.searchVal = this._value;
    }

    @ViewChild(IgxDropDownComponent) 
    public igxDropDown: IgxDropDownComponent;

    @ViewChild('defaultFilterUI', { read: TemplateRef })
    protected defaultFilterUI: TemplateRef<any>;

    @ViewChild('defaultDateUI', { read: TemplateRef })
    protected defaultDateUI: TemplateRef<any>;

    @ViewChild('input', { read: ElementRef })
    protected input: ElementRef;

    @ViewChild('datePicker', { read: ElementRef })
    protected datePicker: IgxDatePickerComponent;

    private expression: IFilteringExpression;
    protected conditionChanged = new Subject();
    protected unaryConditionChanged = new Subject();
    private _value = null;

    private _positionSettings = {
        horizontalStartPoint: HorizontalAlignment.Left,
        verticalStartPoint: VerticalAlignment.Bottom
    };

    private _overlaySettings = {
      closeOnOutsideClick: true,
      modal: false,
      positionStrategy: new ConnectedPositioningStrategy(this._positionSettings)
    };

    constructor(private zone: NgZone, public gridAPI: IgxGridAPIService, public cdr: ChangeDetectorRef) {
        this.unaryConditionChanged.subscribe(() => this.unaryConditionChangedCallback());
        this.conditionChanged.subscribe(() => this.conditionChangedCallback());
    }

    ngOnInit(): void {
        this.expression = {
            fieldName: this.column.field,
            condition: this.getCondition(this.conditions[0]),
            searchVal: this.value,
            ignoreCase: this.column.filteringIgnoreCase
        };
    }

    ngAfterViewInit(): void {
        this.igxDropDown.setSelectedItem(0);
    }

    get template() {
        switch (this.column.dataType) {
            case DataType.String:
            case DataType.Number:
            case DataType.Boolean:
                return this.defaultFilterUI;
            case DataType.Date:
                return this.defaultDateUI;
        }
    }

    get type() {
        switch (this.column.dataType) {
            case DataType.String:
            case DataType.Boolean:
                return 'text';
            case DataType.Number:
                return 'number';
        }
    }

    public conditionChangedCallback(): void {
        if (!!this.expression.searchVal || this.expression.searchVal === 0) {
            this._filter();
        } else {
            this.gridAPI.get(this.gridID).clearFilter(this.column.field);
            this.value = null;
            if (this.input) {
                this.input.nativeElement.value = null;
            }
            if (this.datePicker) {
                this.datePicker.value = null;
            }
        }
    }

    public unaryConditionChangedCallback(): void {
        const name = this.expression.condition.name;
        this.input.nativeElement.value = new TitleCasePipe().transform(new IgxGridFilterConditionPipe().transform(name));
        this.expression.searchVal = null;
        this._filter();
    }

    get unaryCondition(): boolean {
        return this.isUnaryCondition();
    }

    public isUnaryCondition(): boolean {
        return this.expression && this.expression.condition && this.expression.condition.isUnary;
    }

    get conditions() {
        return this.column.filters.instance().conditionList();
    }

    public getCondition(value: string): IFilteringOperation {
        return this.column.filters.instance().condition(value);
    }

    public toggleDropDown(eventArgs) {
        this._overlaySettings.positionStrategy.settings.target = eventArgs.target;
        this.igxDropDown.toggle(this._overlaySettings);
    }

    public clearInput(): void {
        //this.expression.condition =  undefined;
        this.value = null;
        this.gridAPI.get(this.gridID).clearFilter(this.column.field);
    }

    public onOperandChanged(event) {
        const value = event.newSelection.elementRef.nativeElement.firstChild.value;
        this.expression.condition = this.getCondition(value);
        if (this.unaryCondition) {
            this.unaryConditionChanged.next(value);
        } else {
            this.conditionChanged.next(value);
        }
    }

    protected transformValue(value) {
        if (this.column.dataType === DataType.Number) {
            value = parseFloat(value);
        } else if (this.column.dataType === DataType.Boolean) {
            value = Boolean(value);
        }

        return value;
    }

    private _createNewExpression(expression: IFilteringExpression): IFilteringExpression {
        return {
            fieldName: expression.fieldName,
            condition: expression.condition,
            searchVal: expression.searchVal,
            ignoreCase: expression.ignoreCase
        };
    }
    
    public onInputChanged(value): void {
        this.updateExpression(value);
    }

    public onDatePickerValueChanged(value): void {
        this.updateExpression(value);
    }

    private updateExpression(value): void {
        this.value = value;
        this._filter();
    }

    private _filter(){
        const grid = this.gridAPI.get(this.gridID);
        let expr = grid.filteringExpressionsTree.find(this.column.field) as FilteringExpressionsTree;

        if (!expr) {
            expr = new FilteringExpressionsTree(FilteringLogic.And, this.column.field);
        } else {
            expr.filteringOperands = [];
        }

        if (this.expression.searchVal || this.expression.searchVal === 0 || this.isUnaryCondition()) {
            const newExpression = this._createNewExpression(this.expression);
            expr.filteringOperands.push(newExpression);
        }

        if (expr.filteringOperands.length === 0 ) {
            grid.clearFilter(this.column.field);
        } else {
            grid.filter(this.column.field, null, expr, this.column.filteringIgnoreCase);
        }
    }

}
