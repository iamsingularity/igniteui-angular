import { Pipe, PipeTransform, Inject, InjectionToken } from '@angular/core';
import { IgxGridRsourceStrings } from './grid-resource-strings';

export enum TranslateComponent {
    IgxGridComponent
}

export const TranslateComponentToken = new InjectionToken<TranslateComponent>('TranslateComponent');

@Pipe({
    name: 'translate',
    pure: true
})
export class IgxTranslatePipe implements PipeTransform {

    private resourceStrings = new Map<string, string>();

    constructor(@Inject(TranslateComponent) private component: TranslateComponent) {
        var language = navigator.language.substring(0, 2);
        this.loadResources(language);
    }

    public transform(value: string): string {
        return this.resourceStrings.get(value) || value;
    }

    private loadResources(language: string) {
        switch (this.component) {
            case TranslateComponent.IgxGridComponent:
                this.loadResourceStrings(IgxGridRsourceStrings, language);
                break;
        }
    }

    private loadResourceStrings(resources: any, language: string): any {
        switch(language) {
            case "en":
                this.populateResourceStrings(resources.EN);
                break;
            case "ja":
                this.populateResourceStrings(resources.JA);
                break;
            case "ko":
                this.populateResourceStrings(resources.KO);
                break;
        }
    }

    private populateResourceStrings(resources) {
        for (let k of Object.keys(resources)) {
            this.resourceStrings.set(k, resources[k]);
        }
    }
}