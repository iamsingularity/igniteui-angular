import { Component, ElementRef, ViewChild, Injectable, OnInit, AfterViewInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Http } from '@angular/http';
import { IgxForOfDirective } from 'igniteui-angular';
import { RemoteService } from '../shared/remote.service';


@Component({
    selector: 'app-virt-for-sample',
    templateUrl: 'virtual-for.sample.html'
})
export class VirtualForSampleComponent implements OnInit, AfterViewInit {
    search1: string;
    data = [];
    remoteData: any;
    options = {};
    prevRequest: any;
    @ViewChild('virtDirVertical', { read: IgxForOfDirective })
    virtDirVertical: IgxForOfDirective<any>;

    @ViewChild('virtDirHorizontal', { read: IgxForOfDirective })
    virtDirHorizontal: IgxForOfDirective<any>;

    @ViewChild('virtDirRemote', { read: IgxForOfDirective })
    virtDirRemote: IgxForOfDirective<any>;

    @ViewChild('virtDirVariableVertical', { read: IgxForOfDirective })
    virtDirVariableVertical: IgxForOfDirective<any>;

    constructor(private remoteService: RemoteService) {
        this.remoteService.urlBuilder = (dataState) => {
            let qS = `?`;
            let requiredChunkSize;

            if (dataState) {
                const skip = dataState.startIndex;
                requiredChunkSize = dataState.chunkSize === 0 ? 10 : dataState.chunkSize;
                const top = requiredChunkSize;
                qS += `$skip=${skip}&$top=${top}&$count=true`;
            }
            return `${this.remoteService.url}${qS}`;
        };
     }

    ngOnInit(): void {
        this.remoteData = this.remoteService.remoteData;
        const data = [{
            key: 1,
            avatar: 'assets/images/avatar/1.jpg',
            favorite: true,
            link: '#',
            phone: '770-504-2217',
            text: 'Terrance Orta',
            width: 100,
            height: 100
        }, {
            key: 2,
            avatar: 'assets/images/avatar/2.jpg',
            favorite: false,
            link: '#',
            phone: '423-676-2869',
            text: 'Richard Mahoney',
            width: 200,
            height: 200
        }, {
            key: 3,
            avatar: 'assets/images/avatar/3.jpg',
            favorite: false,
            link: '#',
            phone: '859-496-2817',
            text: 'Donna Price',
            width: 300,
            height: 300
        }, {
            key: 4,
            avatar: 'assets/images/avatar/4.jpg',
            favorite: false,
            link: '#',
            phone: '901-747-3428',
            text: 'Lisa Landers',
            width: 200,
            height: 200
        }, {
            key: 5,
            avatar: 'assets/images/avatar/12.jpg',
            favorite: true,
            link: '#',
            phone: '573-394-9254',
            text: 'Dorothy H. Spencer',
            width: 200,
            height: 200
        }, {
            key: 6,
            avatar: 'assets/images/avatar/13.jpg',
            favorite: false,
            link: '#',
            phone: '323-668-1482',
            text: 'Stephanie May',
            width: 100,
            height: 100
        }, {
            key: 7,
            avatar: 'assets/images/avatar/14.jpg',
            favorite: false,
            link: '#',
            phone: '401-661-3742',
            text: 'Marianne Taylor',
            width: 100,
            height: 100
        }, {
            key: 8,
            avatar: 'assets/images/avatar/15.jpg',
            favorite: true,
            link: '#',
            phone: '662-374-2920',
            text: 'Tammie Alvarez',
            width: 300,
            height: 300
        }, {
            key: 9,
            avatar: 'assets/images/avatar/16.jpg',
            favorite: true,
            link: '#',
            phone: '240-455-2267',
            text: 'Charlotte Flores',
            width: 200,
            height: 200
        }, {
            key: 10,
            avatar: 'assets/images/avatar/17.jpg',
            favorite: false,
            link: '#',
            phone: '724-742-0979',
            text: 'Ward Riley',
            width: 100,
            height: 100
        }];
        for (let i = 10; i < 1e5; i++) {
            const obj = Object.assign({}, data[i % 10]);
            obj['key'] = i;
            data.push(obj);
        }
        this.data = data;
    }

    ngAfterViewInit() {
        this.remoteService.getData(this.virtDirRemote.state, (data) => {
            this.virtDirRemote.totalItemCount = data['@odata.count'];
        });
    }
    chunkLoading(evt) {
        if (this.prevRequest) {
            this.prevRequest.unsubscribe();
        }
        this.prevRequest = this.remoteService.getData(evt, () => {
            this.virtDirRemote.cdr.detectChanges();
        });
    }
    scrNextRow() {
        this.virtDirVertical.scrollNext();
    }
    scrPrevRow() {
        this.virtDirVertical.scrollPrev();
    }
    scrNextPage() {
        this.virtDirVertical.scrollNextPage();
    }
    scrPrevPage() {
        this.virtDirVertical.scrollPrevPage();
    }
    scrScrollTo(index) {
        this.virtDirVertical.scrollTo(parseInt(index, 10));
    }
    scrNextCol() {
        this.virtDirHorizontal.scrollNext();
    }
    scrPrevCol() {
        this.virtDirHorizontal.scrollPrev();
    }
    scrNextHorizontalPage() {
        this.virtDirHorizontal.scrollNextPage();
    }
    scrPrevHorizontalPage() {
        this.virtDirHorizontal.scrollPrevPage();
    }

    horizontalVisibleItemCount() {
        const count = this.virtDirHorizontal.getItemCountInView();
        console.log(count);
    }
    verticalVisibleItemCount() {
        const count = this.virtDirVertical.getItemCountInView();
        console.log(count);
    }

    scrHorizontalScrollTo(index) {
        this.virtDirHorizontal.scrollTo(index);
    }

    trackByKey(index, item) {
        return item.key;
    }

}
