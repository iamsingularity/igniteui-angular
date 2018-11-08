import {
    AfterViewInit,
    Directive,
    ElementRef,
    EventEmitter,
    Input,
    NgModule,
    OnChanges,
    OnDestroy,
    Output,
    Renderer2,
    SimpleChanges
} from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

interface ISearchInfo {
    searchedText: string;
    content: string;
    matchCount: number;
    caseSensitive: boolean;
    exactMatch: boolean;
}

export interface IActiveHighlightInfo {
    rowIndex: number;
    columnIndex: number;
    page: number;
    index: number;
}

@Directive({
    selector: '[igxTextHighlight]'
})
export class IgxTextHighlightDirective implements AfterViewInit, OnDestroy, OnChanges {
    private static onActiveElementChanged = new EventEmitter<string>();
    public static highlightGroupsMap = new Map<string, IActiveHighlightInfo>();

    private _lastSearchInfo: ISearchInfo;
    private _div = null;
    private _observer: MutationObserver = null;
    private _nodeWasRemoved = false;
    private _forceEvaluation = false;
    private _activeElementIndex = -1;

    /**
     * Determines the `CSS` class of the highlight elements.
     * This allows the developer to provide custom `CSS` to customize the highlight.
     *
     * ```html
     * <div
     *   igxTextHighlight
     *   [cssClass]="myClass">
     * </div>
     * ```
     */
    @Input('cssClass')
    public cssClass: string;

    /**
     * Determines the `CSS` class of the active highlight element.
     * This allows the developer to provide custom `CSS` to customize the highlight.
     *
     * ```html
     * <div
     *   igxTextHighlight
     *   [activeCssClass]="activeHighlightClass">
     * </div>
     * ```
     */
    @Input('activeCssClass')
    public activeCssClass: string;

    /**
     * @hidden
     */
    @Input('containerClass')
    public containerClass: string;

    /**
     * Identifies the highlight within a unique group.
     * This allows it to have several different highlight groups,
     * with each of them having their own active highlight.
     *
     * ```html
     * <div
     *   igxTextHighlight
     *   [groupName]="myGroupName">
     * </div>
     * ```
     */
    @Input('groupName')
    public groupName = '';

    private _value = '';

    /**
     * The underlying value of the element that will be highlighted.
     *
     * ```typescript
     * // get
     * const elementValue = this.textHighlight.value;
     * ```
     *
     * ```html
     * <!--set-->
     * <div
     *   igxTextHighlight
     *   [value]="newValue">
     * </div>
     * ```
     */
    @Input('value')
    public get value(): any {
        return this._value;
    }
    public set value(value: any) {
        if (value === undefined || value === null) {
            this._value = '';
        } else {
            this._value = value;
        }
    }

    /**
     * The index of the row on which the directive is currently on.
     *
     * ```html
     * <div
     *   igxTextHighlight
     *   [row]="0">
     * </div>
     * ```
     */
    @Input('row')
    public row: number;

    /**
     * The index of the column on which the directive is currently on.
     *
     * ```html
     * <div
     *   igxTextHighlight
     *   [column]="0">
     * </div>
     * ```
     */
    @Input('column')
    public column: number;

    /**
     * The index of the page on which the directive is currently on.
     * It is used when the component containing the directive supports paging.
     *
     * ```html
     * <div
     *   igxTextHighlight
     *   [page]="0">
     * </div>
     * ```
     */
    @Input('page')
    public page: number;

    /**
     * @hidden
     */
    public parentElement: any;

    private _container: any;

    private destroy$ = new Subject<boolean>();

    /**
     * Activates the highlight at a given index.
     * (if such index exists)
     */
    public static setActiveHighlight(groupName: string, highlight: IActiveHighlightInfo) {
        IgxTextHighlightDirective.highlightGroupsMap.set(groupName, highlight);
        IgxTextHighlightDirective.onActiveElementChanged.emit(groupName);
    }

    /**
     * Clears any existing highlight.
     */
    public static clearActiveHighlight(groupName) {
        IgxTextHighlightDirective.highlightGroupsMap.set(groupName, {
            rowIndex: -1,
            columnIndex: -1,
            page: -1,
            index: -1
        });
        IgxTextHighlightDirective.onActiveElementChanged.emit(groupName);
    }

    constructor(element: ElementRef, public renderer: Renderer2) {
        this.parentElement = this.renderer.parentNode(element.nativeElement);

        IgxTextHighlightDirective.onActiveElementChanged.pipe(takeUntil(this.destroy$)).subscribe((groupName) => {
            if (this.groupName === groupName) {
                if (this._activeElementIndex !== -1) {
                    this.deactivate();
                }
                this.activateIfNecessary();
            }
        });
    }

    /**
     * @hidden
     */
    ngOnDestroy() {
        if (this._observer !== null) {
            this._observer.disconnect();
        }
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    /**
     * @hidden
     */
    ngOnChanges(changes: SimpleChanges) {
        if (changes.value && !changes.value.firstChange) {
            this.highlight(this._lastSearchInfo.searchedText, this._lastSearchInfo.caseSensitive, this._lastSearchInfo.exactMatch);
            this.activateIfNecessary();
        }

        if ((changes.row !== undefined && !changes.row.firstChange) ||
            (changes.column !== undefined && !changes.column.firstChange) ||
            (changes.page !== undefined && !changes.page.firstChange)) {
            if (this._activeElementIndex !== -1) {
                this.deactivate();
            }

            this.activateIfNecessary();
        }
    }

    /**
     * @hidden
     */
    ngAfterViewInit() {
        if (IgxTextHighlightDirective.highlightGroupsMap.has(this.groupName) === false) {
            IgxTextHighlightDirective.highlightGroupsMap.set(this.groupName, {
                rowIndex: -1,
                columnIndex: -1,
                page: -1,
                index: -1
            });
        }

        this._lastSearchInfo = {
            searchedText: '',
            content: this.value,
            matchCount: 0,
            caseSensitive: false,
            exactMatch: false
        };

        this._container = this.parentElement.firstElementChild;
    }

    /**
     * Clears the existing highlight and highlights the searched text.
     * Returns how many times the element contains the searched text.
     */
    public highlight(text: string, caseSensitive?: boolean, exactMatch?: boolean): number {
        const caseSensitiveResolved = caseSensitive ? true : false;
        const exactMatchResolved = exactMatch ? true : false;

        if (this.searchNeedsEvaluation(text, caseSensitiveResolved, exactMatchResolved)) {
            this._lastSearchInfo.searchedText = text;
            this._lastSearchInfo.caseSensitive = caseSensitiveResolved;
            this._lastSearchInfo.exactMatch = exactMatchResolved;
            this._lastSearchInfo.content = this.value;

            if (text === '' || text === undefined || text === null) {
                this.clearHighlight();
            } else {
                this.clearChildElements(true);
                this._lastSearchInfo.matchCount = this.getHighlightedText(text, caseSensitive, exactMatch);
            }
        } else if (this._nodeWasRemoved) {
            this._lastSearchInfo.searchedText = text;
            this._lastSearchInfo.caseSensitive = caseSensitiveResolved;
            this._lastSearchInfo.exactMatch = exactMatchResolved;
        }

        return this._lastSearchInfo.matchCount;
    }

    /**
     * Clears any existing highlight.
     */
    public clearHighlight(): void {
        this.clearChildElements(false);

        this._lastSearchInfo.searchedText = '';
        this._lastSearchInfo.matchCount = 0;
    }

    /**
     * Activates the highlight if it is on the currently active row, column and page.
     */
    public activateIfNecessary(): void {
        const group = IgxTextHighlightDirective.highlightGroupsMap.get(this.groupName);
        if (group.columnIndex === this.column && group.rowIndex === this.row && group.page === this.page) {
            this.activate(group.index);
        }
    }

    /**
     * Attaches a MutationObserver to the parentElement and watches for when the container element is removed/readded to the DOM.
     * Should be used only when necessary as using many observers may lead to performance degradation.
     */
    public observe(): void {
        if (this._observer === null) {
            const callback = (mutationList) => {
                mutationList.forEach((mutation) => {
                    const removedNodes = new Array(... mutation.removedNodes);
                    removedNodes.forEach((n) => {
                        if (n === this._container) {
                            this._nodeWasRemoved = true;
                            this.clearChildElements(false);
                        }
                    });

                    const addedNodes = new Array(... mutation.addedNodes);
                    addedNodes.forEach((n) => {
                        if (n === this.parentElement.firstElementChild && this._nodeWasRemoved) {
                            this._container = this.parentElement.firstElementChild;
                            this._nodeWasRemoved = false;

                            this._forceEvaluation = true;
                            this.highlight(this._lastSearchInfo.searchedText,
                                this._lastSearchInfo.caseSensitive,
                                this._lastSearchInfo.exactMatch);
                            this._forceEvaluation = false;

                            this.activateIfNecessary();
                            this._observer.disconnect();
                            this._observer = null;
                        }
                    });
                });
            };

            this._observer = new MutationObserver(callback);
            this._observer.observe(this.parentElement, {childList: true});
        }
    }

    private activate(index: number) {
        this.deactivate();

        if (this._div !== null) {
            const spans = this._div.querySelectorAll('span');
            this._activeElementIndex = index;

            if (spans.length <= index) {
                return;
            }

            const elementToActivate = spans[index];
            this.renderer.addClass(elementToActivate, this.activeCssClass);
            this.renderer.setAttribute(elementToActivate, 'style', 'background:orange;font-weight:bold;color:black');
        }
    }

    private deactivate() {
        if (this._activeElementIndex === -1) {
            return;
        }

        const spans = this._div.querySelectorAll('span');

        if (spans.length <= this._activeElementIndex) {
            this._activeElementIndex = -1;
            return;
        }

        const elementToDeactivate = spans[this._activeElementIndex];
        this.renderer.removeClass(elementToDeactivate, this.activeCssClass);
        this.renderer.setAttribute(elementToDeactivate, 'style', 'background:yellow;font-weight:bold;color:black');
        this._activeElementIndex = -1;
    }

    private clearChildElements(originalContentHidden: boolean): void {
        if (this.parentElement.firstElementChild) {
            this.renderer.setProperty(this.parentElement.firstElementChild, 'hidden', originalContentHidden);
        }

        if (this._div !== null) {
            this.renderer.removeChild(this.parentElement, this._div);

            this._div = null;
            this._activeElementIndex = -1;
        }
    }

    private getHighlightedText(searchText: string, caseSensitive: boolean, exactMatch: boolean) {
        this.appendDiv();

        const stringValue = String(this.value);
        const contentStringResolved = !caseSensitive ? stringValue.toLowerCase() : stringValue;
        const searchTextResolved = !caseSensitive ? searchText.toLowerCase() : searchText;

        let matchCount = 0;

        if (exactMatch) {
            if (contentStringResolved === searchTextResolved) {
                // tslint:disable-next-line:max-line-length
                this.appendSpan(`<span class="${this.cssClass}" style="background:yellow;font-weight:bold;color:black">${stringValue}</span>`);
                matchCount++;
            } else {
                this.appendText(stringValue);
            }
        } else {
            let foundIndex = contentStringResolved.indexOf(searchTextResolved, 0);
            let previousMatchEnd = 0;

            while (foundIndex !== -1) {
                const start = foundIndex;
                const end = foundIndex + searchTextResolved.length;

                this.appendText(stringValue.substring(previousMatchEnd, start));
                // tslint:disable-next-line:max-line-length
                this.appendSpan(`<span class="${this.cssClass}" style="background:yellow;font-weight:bold;color:black">${stringValue.substring(start, end)}</span>`);

                previousMatchEnd = end;
                matchCount++;

                foundIndex = contentStringResolved.indexOf(searchTextResolved, end);
            }

            this.appendText(stringValue.substring(previousMatchEnd, stringValue.length));
        }

        return matchCount;
    }

    private appendText(text: string) {
        const textElement = this.renderer.createText(text);
        this.renderer.appendChild(this._div, textElement);
    }

    private appendSpan(outerHTML: string) {
        const span = this.renderer.createElement('span');
        this.renderer.appendChild(this._div, span);
        this.renderer.setProperty(span, 'outerHTML', outerHTML);
    }

    private appendDiv() {
        this._div = this.renderer.createElement('div');
        this.renderer.addClass(this._div, this.containerClass);
        this.renderer.appendChild(this.parentElement, this._div);
    }

    private searchNeedsEvaluation(text: string, caseSensitive: boolean, exactMatch: boolean): boolean {
        const searchedText = this._lastSearchInfo.searchedText;

        return !this._nodeWasRemoved &&
            (searchedText === null ||
                searchedText !== text ||
                this._lastSearchInfo.content !== this.value ||
                this._lastSearchInfo.caseSensitive !== caseSensitive ||
                this._lastSearchInfo.exactMatch !== exactMatch ||
                this._forceEvaluation);
    }
}

@NgModule({
    declarations: [IgxTextHighlightDirective],
    exports: [IgxTextHighlightDirective]
})
export class IgxTextHighlightModule { }
