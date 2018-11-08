import { TestBed, async } from '@angular/core/testing';
import { IgxIconService } from './icon.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DOCUMENT } from '@angular/common';

import { configureTestSuite } from '../test-utils/configure-suite';

describe('Icon Service', () => {
    configureTestSuite();
    const MY_FONT = 'my-awesome-icons';
    const ALIAS = 'awesome';

    const svgText = `<svg id="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <path d="M74 74h54v54H74" />
    <path d="M10 10h181v181H10V10zm38.2 38.2v104.6h104.6V48.2H48.2z"/>
</svg>`;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [IgxIconService]
        }).compileComponents();
    });

    it('should set the default icon set', () => {
        const iconService = TestBed.get(IgxIconService);

        expect(() => {
            iconService.defaultFontSet = MY_FONT;
        }).not.toThrow();
    });

    it('should get the default icon set', () => {
        const iconService = TestBed.get(IgxIconService);
        iconService.defaultFontSet = MY_FONT;

        expect(iconService.defaultFontSet).toBe(MY_FONT);
    });

    it('should associate alias name with icon set name', () => {
        const iconService = TestBed.get(IgxIconService);

        expect(() => {
            iconService.registerFontSetAlias(ALIAS, MY_FONT);
        }).not.toThrow();
    });

    it('should get icon set name from alias name', () => {
        const iconService = TestBed.get(IgxIconService);
        iconService.registerFontSetAlias(ALIAS, MY_FONT);

        expect(iconService.fontSetClassName(ALIAS)).toBe(MY_FONT);
    });

    it('should add custom svg icon from url', () => {
        const iconService = TestBed.get(IgxIconService) as IgxIconService;
        const httpMock = TestBed.get(HttpTestingController);
        const document = TestBed.get(DOCUMENT);

        const iconName = 'test';
        const fontSet = 'svg-icons';
        const iconKey = fontSet + '_' + iconName;

        iconService.addSvgIcon(iconName, 'test.svg', fontSet);

        const req = httpMock.expectOne('test.svg');
        expect(req.request.method).toBe('GET');
        req.flush(svgText);

        expect(iconService.isSvgIconCached(iconName, fontSet)).toBeTruthy();
        expect(iconService.getSvgIconKey(iconName, fontSet)).toEqual(iconKey);

        const svgElement = document.querySelector(`svg[id='${iconKey}']`);
        expect(svgElement).toBeDefined();

        // make sure thare are no outstanding requests
        httpMock.verify();
    });

    it('should add custom svg icon from text', () => {
        const iconService = TestBed.get(IgxIconService) as IgxIconService;
        const document = TestBed.get(DOCUMENT);

        const iconName = 'test';
        const fontSet = 'svg-icons';
        const iconKey = fontSet + '_' + iconName;

        iconService.addSvgIconFromText(iconName, svgText, fontSet);

        expect(iconService.isSvgIconCached(iconName, fontSet)).toBeTruthy();
        expect(iconService.getSvgIconKey(iconName, fontSet)).toEqual(iconKey);

        const svgElement = document.querySelector(`svg[id='${iconKey}']`);
        expect(svgElement).toBeDefined();
    });
});
