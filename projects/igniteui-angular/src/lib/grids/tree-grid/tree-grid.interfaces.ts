
export interface ITreeGridRecord {
    rowID: any;
    data: any;
    children?: ITreeGridRecord[];
    parent?: ITreeGridRecord;
    level?: number;
    isFilteredOutParent?: boolean;
    expanded?: boolean;
    path: any[];
}

export interface IRowToggleEventArgs {
    rowID: any;
    expanded: boolean;
    event?: Event;
    cancel: boolean;
}
