import { filteringStateDefaults, IFilteringState } from './filtering-state.interface';
import { ISortingState, SortingStateDefaults } from './sorting-state.interface';
import { IGroupByResult, TreeGridSortingStrategy } from './sorting-strategy';
import { IPagingState, PagingError } from './paging-state.interface';
import { IDataState } from './data-state.interface';
import { IGroupByExpandState, IGroupByKey } from './groupby-expand-state.interface';
import { IGroupByRecord } from './groupby-record.interface';
import { IGroupingState } from './groupby-state.interface';
import { Transaction, TransactionType, HierarchicalTransaction, IgxHierarchicalTransactionService, HierarchicalState } from '../services';
import { mergeObjects, cloneValue } from '../core/utils';
import { ITreeGridRecord } from '../grids/tree-grid/tree-grid.interfaces';

/**
 * @hidden
 */
export enum DataType {
    String = 'string',
    Number = 'number',
    Boolean = 'boolean',
    Date = 'date'
}

/**
 * @hidden
 */
export class DataUtil {
    public static mergeDefaultProperties(target: object, defaults: object) {
        if (!defaults) {
            return target;
        }
        if (!target) {
            target = Object.assign({}, defaults);
            return target;
        }
        Object
            .keys(defaults)
            .forEach((key) => {
                if (target[key] === undefined && defaults[key] !== undefined) {
                    target[key] = defaults[key];
                }
            });
        return target;
    }
    public static sort<T>(data: T[], state: ISortingState): T[] {
        // set defaults
        DataUtil.mergeDefaultProperties(state, SortingStateDefaults);
        // apply default settings for each sorting expression(if not set)
        return state.strategy.sort(data, state.expressions);
    }

    public static hierarchicalSort(hierarchicalData: ITreeGridRecord[], state: ISortingState, parent: ITreeGridRecord): ITreeGridRecord[] {
        state.strategy = new TreeGridSortingStrategy();
        let res: ITreeGridRecord[] = [];

        hierarchicalData.forEach((hr: ITreeGridRecord) => {
            const rec: ITreeGridRecord = DataUtil.cloneTreeGridRecord(hr);
            rec.parent = parent;
            if (rec.children) {
                rec.children = DataUtil.hierarchicalSort(rec.children, state, rec);
            }
            res.push(rec);
        });

        res = DataUtil.sort(res, state);

        return res;
    }

    public static cloneTreeGridRecord(hierarchicalRecord: ITreeGridRecord) {
        const rec: ITreeGridRecord = {
            rowID: hierarchicalRecord.rowID,
            data: hierarchicalRecord.data,
            children: hierarchicalRecord.children,
            isFilteredOutParent: hierarchicalRecord.isFilteredOutParent,
            level: hierarchicalRecord.level,
            expanded: hierarchicalRecord.expanded,
            path: [...hierarchicalRecord.path]
        };
        return rec;
    }

    public static group<T>(data: T[], state: IGroupingState): IGroupByResult {
        // set defaults
        DataUtil.mergeDefaultProperties(state, SortingStateDefaults);
        // apply default settings for each grouping expression(if not set)
        return state.strategy.groupBy(data, state.expressions);
    }
    public static restoreGroups(groupData: IGroupByResult, state: IGroupingState, groupsRecords: any[] = []): any[] {
        DataUtil.mergeDefaultProperties(state, SortingStateDefaults);
        if (state.expressions.length === 0) {
            return groupData.data;
        }
        return this.restoreGroupsRecursive(groupData, 1, state.expressions.length, state.expansion, state.defaultExpanded, groupsRecords);
    }
    private static restoreGroupsRecursive(
        groupData: IGroupByResult, level: number, depth: number,
        expansion: IGroupByExpandState[], defaultExpanded: boolean, groupsRecords): any[] {
        let i = 0;
        let j: number;
        let result = [];
        // empty the array without changing reference
        groupsRecords.splice(0, groupsRecords.length);
        if (level !== depth) {
            groupData.data = this.restoreGroupsRecursive(groupData, level + 1, depth, expansion, defaultExpanded, groupsRecords);
        }
        while (i < groupData.data.length) {
            const g = level === depth ? groupData.metadata[i] :
                groupData.data[i].groupParent;
            for (j = i + 1; j < groupData.data.length; j++) {
                const h = level === depth ? groupData.metadata[j] :
                    groupData.data[j].groupParent;
                if (h && g !== h && g.level === h.level) {
                    break;
                }
            }
            const hierarchy = this.getHierarchy(g);
            const expandState: IGroupByExpandState = expansion.find((state) =>
                this.isHierarchyMatch(state.hierarchy || [{ fieldName: g.expression.fieldName, value: g.value }], hierarchy));
            const expanded = expandState ? expandState.expanded : defaultExpanded;
            result.push(g);
            groupsRecords.push(g);

            g['groups'] = groupData.data.slice(i, j).filter((e) =>
                e.records && e.records.length && e.level === g.level + 1);
            while (groupsRecords.length) {
                if (groupsRecords[0].level + 1 > level) {
                    groupsRecords.shift();
                } else {
                    break;
                }
            }
            if (expanded) {
                result = result.concat(groupData.data.slice(i, j));
            }
            i = j;
        }
        return result;
    }
    public static page<T>(data: T[], state: IPagingState): T[] {
        if (!state) {
            return data;
        }
        const len = data.length;
        const index = state.index;
        const res = [];
        const recordsPerPage = state.recordsPerPage;
        state.metadata = {
            countPages: 0,
            countRecords: data.length,
            error: PagingError.None
        };
        if (index < 0 || isNaN(index)) {
            state.metadata.error = PagingError.IncorrectPageIndex;
            return res;
        }
        if (recordsPerPage <= 0 || isNaN(recordsPerPage)) {
            state.metadata.error = PagingError.IncorrectRecordsPerPage;
            return res;
        }
        state.metadata.countPages = Math.ceil(len / recordsPerPage);
        if (!len) {
            return data;
        }
        if (index >= state.metadata.countPages) {
            state.metadata.error = PagingError.IncorrectPageIndex;
            return res;
        }
        return data.slice(index * recordsPerPage, (index + 1) * recordsPerPage);
    }
    public static filter<T>(data: T[], state: IFilteringState): T[] {
        // set defaults
        DataUtil.mergeDefaultProperties(state, filteringStateDefaults);
        if (!state.strategy) {
            return data;
        }
        return state.strategy.filter(data, state.expressionsTree);
    }
    public static process<T>(data: T[], state: IDataState): T[] {
        if (!state) {
            return data;
        }
        if (state.filtering) {
            data = DataUtil.filter(data, state.filtering);
        }
        if (state.sorting) {
            data = DataUtil.sort(data, state.sorting);
        }
        if (state.paging) {
            data = DataUtil.page(data, state.paging);
        }
        return data;
    }

    public static getHierarchy(gRow: IGroupByRecord): Array<IGroupByKey> {
        const hierarchy: Array<IGroupByKey> = [];
        if (gRow !== undefined && gRow.expression) {
            hierarchy.push({ fieldName: gRow.expression.fieldName, value: gRow.value });
            while (gRow.groupParent) {
                gRow = gRow.groupParent;
                hierarchy.unshift({ fieldName: gRow.expression.fieldName, value: gRow.value });
            }
        }
        return hierarchy;
    }

    public static isHierarchyMatch(h1: Array<IGroupByKey>, h2: Array<IGroupByKey>): boolean {
        if (h1.length !== h2.length) {
            return false;
        }
        return h1.every((level, index): boolean => {
            return level.fieldName === h2[index].fieldName && level.value === h2[index].value;
        });
    }

    /**
     * Merges all changes from provided transactions into provided data collection
     * @param data Collection to merge
     * @param transactions Transactions to merge into data
     * @param primaryKey Primary key of the collection, if any
     */
    public static mergeTransactions<T>(data: T[], transactions: Transaction[], primaryKey?: any): T[] {
        data.forEach((item: any, index: number) => {
            const rowId = primaryKey ? item[primaryKey] : item;
            const transaction = transactions.find(t => t.id === rowId);
            if (Array.isArray(item.children)) {
                this.mergeTransactions(item.children, transactions, primaryKey);
            }
            if (transaction && transaction.type === TransactionType.UPDATE) {
                data[index] = transaction.newValue;
            }
        });

        data.push(...transactions
            .filter(t => t.type === TransactionType.ADD)
            .map(t => t.newValue));
        return data;
    }

    // TODO: optimize addition of added rows. Should not filter transaction in each recursion!!!
    /** @experimental @hidden */
    public static mergeHierarchicalTransactions(
        data: any[],
        transactions: HierarchicalTransaction[],
        childDataKey: any,
        primaryKey?: any,
        parentKey?: any): any[] {

        for (let index = 0; index < data.length; index++) {
            const dataItem = data[index];
            const rowId = primaryKey ? dataItem[primaryKey] : dataItem;
            const updateTransaction = transactions.filter(t => t.type === TransactionType.UPDATE).find(t => t.id === rowId);
            const addedTransactions = transactions.filter(t => t.type === TransactionType.ADD).filter(t => t.parentId === rowId);
            if (updateTransaction || addedTransactions.length > 0) {
                data[index] = mergeObjects(cloneValue(dataItem), updateTransaction && updateTransaction.newValue);
            }
            if (addedTransactions.length > 0) {
                if (!data[index][childDataKey]) {
                    data[index][childDataKey] = [];
                }
                for (const addedTransaction of addedTransactions) {
                    data[index][childDataKey].push(addedTransaction.newValue);
                }
            }
            if (data[index][childDataKey]) {
                data[index][childDataKey] = this.mergeHierarchicalTransactions(
                    data[index][childDataKey],
                    transactions,
                    childDataKey,
                    primaryKey,
                    rowId
                );
            }
        }
        return data;
    }
}
