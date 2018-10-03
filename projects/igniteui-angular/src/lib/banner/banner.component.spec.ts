import { Component, OnInit, ViewChild } from '@angular/core';
import { async, TestBed, ComponentFixture, tick, fakeAsync } from '@angular/core/testing';
// import { IgxBannerModule } from './banner.module';

describe('igxBanner', () => {
    beforeEach(async(() => {
        // TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            declarations: [
                // IgxExpansionPanelGridComponent,
                // IgxExpansionPanelListComponent,
                // IgxExpansionPanelSampleComponent,
                // IgxExpansionPanelImageComponent
            ],
            imports: [
                // IgxBannerModule,
                // NoopAnimationsModule,
                // IgxToggleModule,
                // IgxRippleModule,
                // IgxButtonModule,
                // IgxListModule,
                // IgxGridModule.forRoot()
            ]
        }).compileComponents();
    }));

    describe('General tests: ', () => {
        it('Should initialize banner component properly', () => {
        });
        it('Should properly accept input properties', () => {
        });
        it('Should properly set base classes', () => {
        });
        it('Should properly emit events', fakeAsync(() => {
        }));
    });

    describe('Template tests: ', () => {
        it('Should initialize banner with default template', () => {
        });
        it('Should be able to add image to text message', () => {
        });
        it('Should initialize banner with at least one and up to two buttons', () => {
        });
        it('Should position buttons under the banner content', () => {
        });
        it('Should be able to create banner with custom template', fakeAsync(() => {
        }));
        it('Should span the entire width of the parent element', () => {
        });
        it('Should push parent element content downwards on loading', () => {
        });
    });

    describe('Action tests: ', () => {
        it('Should dismiss/confirm banner on buton clicking', () => {
        });
        it('Should not be displayed after confirmation/dismissal', () => {
        });
        it('Should not be dismissed on user actions outside the component', () => {
        });
    });

    describe('Rendering tests: ', () => {
        it('Should apply all appropriate classes on initialization_default template', fakeAsync(() => {
        }));
        it('Should apply all appropriate classes on initialization_custom template', fakeAsync(() => {
        }));
    });

});
