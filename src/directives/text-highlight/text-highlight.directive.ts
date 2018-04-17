// Note: Currently this directive can't directly set the innerHTML of the parent element,
// as this breaks any existing ngTemplateOutlet (and possibly other) bindings. This happens, because the
// comment nodes that Angular uses for them get recreated by setting innerHTML. It seems like even if
// you recreate them with the exact same content they still don't work, so I had to wrokaround
// this by using appendChild and removeChild to modify the DOM without touching the comment nodes.

import { Directive, ElementRef, Input, NgModule, Renderer2 } from "@angular/core";

@Directive({
    selector: "[igxTextHighlight]"
})
export class IgxTextHighlightDirective {

    @Input("cssClass")
    public cssClass: string;

    @Input("activeCssClass")
    public activeCssClass: string;

    public parentElement;

    private _lastSearchString = null;
    private _lastSearchCount = -1;

    constructor(element: ElementRef, private renderer: Renderer2){
        this.parentElement = this.renderer.parentNode(element.nativeElement);
    }

    public highlight(text: string, caseSensitive?: boolean): number {
        if (this._lastSearchString || this._lastSearchString !== text) {
            this._lastSearchString = text;

            if (text === "" || text === undefined || text === null) {
                this.clearHighlight();
                return 0;
            }

            const content = this.clearChildElements();
            this._lastSearchCount = this.getHighlightedText(content, text, caseSensitive);
        }

        return this._lastSearchCount;
    }

    public clearHighlight() {
        const textContent = this.clearChildElements();
        this.appendText(textContent);
    }

    public activate(highlightIndex: number) {
        const spans = this.parentElement.querySelectorAll("." + this.cssClass);

        if(spans.length > highlightIndex) {
            this.renderer.addClass(spans[highlightIndex], this.activeCssClass);
            this.renderer.setAttribute(spans[highlightIndex], "style", "background:orange;font-weight:bold");
        }
    }

    private clearChildElements(): string {
        let child = this.parentElement.firstChild;
        let text = "";

        while (child) {
            const elementToRemove = child;
            child = this.renderer.nextSibling(child);

            if (elementToRemove.nodeName !== "#comment") {
                text += elementToRemove.textContent;
                this.renderer.removeChild(this.parentElement, elementToRemove);
            }
        }

        return text;
    }

    private getHighlightedText(contentString: string, searchText: string, caseSensitive: boolean) {
        let contentStringResolved = !caseSensitive ? contentString.toLowerCase() : contentString;
        let searchTextResolved = !caseSensitive ? searchText.toLowerCase() : searchText;

        let foundIndex = contentStringResolved.indexOf(searchTextResolved, 0);
        let previousMatchEnd = 0;
        let matchCount = 0;

        while (foundIndex != -1) {
            const start = foundIndex;
            const end = foundIndex + searchTextResolved.length;

            this.appendText(contentString.substring(previousMatchEnd, start));
            this.appendSpan(`<span class="${this.cssClass}" style="background:yellow;font-weight:bold">${contentString.substring(start, end)}</span>`);

            previousMatchEnd = end;
            matchCount++;

            foundIndex = contentStringResolved.indexOf(searchTextResolved, end);
        }

        this.appendText(contentString.substring(previousMatchEnd, contentString.length));

        return matchCount;
    }

    private appendText(text: string) {
        const textElement = this.renderer.createText(text);
        this.renderer.appendChild(this.parentElement, textElement);
    }

    private appendSpan(outerHTML: string) {
        const span = this.renderer.createElement("span");
        this.renderer.appendChild(this.parentElement, span);
        span.outerHTML = outerHTML;
    }
}

@NgModule({
    declarations: [IgxTextHighlightDirective],
    exports: [IgxTextHighlightDirective]
})
export class IgxTextHighlightModule { }
