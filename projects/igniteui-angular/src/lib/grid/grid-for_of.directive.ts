import { CommonModule, NgForOfContext } from '@angular/common';
import {
    ChangeDetectorRef,
    ComponentFactory,
    ComponentFactoryResolver,
    ComponentRef,
    Directive,
    DoCheck,
    EmbeddedViewRef,
    EventEmitter,
    Input,
    IterableChanges,
    IterableDiffer,
    IterableDiffers,
    NgModule,
    NgZone,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    TemplateRef,
    TrackByFunction,
    ViewChild,
    ViewContainerRef
} from '@angular/core';

import { 
    IgxForOfDirective,
    DisplayContainerComponent,
    HVirtualHelperComponent,
    VirtualHelperComponent
 } from '../directives/for-of/for_of.directive';

@Directive({ selector: '[igxGridFor][igxGridForOf]' })
export class IgxGridForOfDirective<T> extends IgxForOfDirective<T> {
}


/**
 * The IgxForOfModule provides the {@link IgxForOfDirective}, inside your application.
 */

@NgModule({
    declarations: [IgxForOfDirective, DisplayContainerComponent, VirtualHelperComponent, HVirtualHelperComponent],
    entryComponents: [DisplayContainerComponent, VirtualHelperComponent, HVirtualHelperComponent],
    exports: [IgxGridForOfDirective],
    imports: [CommonModule]
})

export class IgxGridForOfModule {
}
