import { async, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SortingDirection } from '../data-operations/sorting-expression.interface';
import { IgxTreeGridComponent } from './tree-grid.component';
import { IgxTreeGridModule } from './index';
import { IgxTreeGridSimpleComponent, IgxTreeGridPrimaryForeignKeyComponent } from '../test-utils/tree-grid-components.spec';
import { IgxNumberFilteringOperand } from '../data-operations/filtering-condition';
import { TreeGridFunctions } from '../test-utils/tree-grid-functions.spec';
import { UIInteractions, wait } from '../test-utils/ui-interactions.spec';

describe('IgxTreeGrid - Indentation', () => {
    let fix;
    let treeGrid: IgxTreeGridComponent;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxTreeGridSimpleComponent,
                IgxTreeGridPrimaryForeignKeyComponent
            ],
            imports: [IgxTreeGridModule]
        })
            .compileComponents();
    }));

    describe('Child Collection Indentation', () => {
        beforeEach(() => {
            fix = TestBed.createComponent(IgxTreeGridSimpleComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid;
        });

        it('should have the tree-cell as a first cell on every row', () => {
            // Verify all rows are present
            const rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(10);

            // Verify the tree cell is the first cell for every row
            TreeGridFunctions.verifyCellsPosition(rows, 4);
        });

        it('should have correct indentation for every record of each level', () => {
            const rows = TreeGridFunctions.sortElementsVertically(TreeGridFunctions.getAllRows(fix));
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(0), rows[0], 0);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(1), rows[1], 1);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(2), rows[2], 1);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(3), rows[3], 1);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(4), rows[4], 2);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(5), rows[5], 2);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(6), rows[6], 2);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(7), rows[7], 0);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(8), rows[8], 0);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(9), rows[9], 1);
        });

        it('should persist the indentation after sorting', () => {
            treeGrid.columnList.filter(c => c.field === 'Age')[0].sortable = true;
            fix.detectChanges();
            treeGrid.sort({ fieldName: 'Age', dir: SortingDirection.Asc });
            fix.detectChanges();

            const rows = TreeGridFunctions.sortElementsVertically(TreeGridFunctions.getAllRows(fix));
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(0), rows[0], 0);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(1), rows[1], 1);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(2), rows[2], 0);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(3), rows[3], 1);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(4), rows[4], 1);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(5), rows[5], 1);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(6), rows[6], 2);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(7), rows[7], 2);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(8), rows[8], 2);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(9), rows[9], 0);
        });

        it('should persist the indentation after filtering', () => {
            treeGrid.columnList.filter(c => c.field === 'Age')[0].sortable = true;
            fix.detectChanges();

            treeGrid.filter('Age', 40, IgxNumberFilteringOperand.instance().condition('greaterThan'));
            fix.detectChanges();

            const rows = TreeGridFunctions.sortElementsVertically(TreeGridFunctions.getAllRows(fix));
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(0), rows[0], 0);

            // This row does not satisfy the filtering, but is present in the DOM with lowered opacity
            // in order to indicate that it is a parent of another record that satisfies the filtering.
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(1), rows[1], 1);

            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(2), rows[2], 2);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(3), rows[3], 0);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(4), rows[4], 0);
        });

        it('should persist the indentation on all pages when using paging', () => {
            treeGrid.paging = true;
            fix.detectChanges();
            treeGrid.perPage = 4;
            fix.detectChanges();

            // Verify page 1
            let rows = TreeGridFunctions.sortElementsVertically(TreeGridFunctions.getAllRows(fix));
            expect(rows.length).toBe(4, 'Incorrect number of rows on page 1.');
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(0), rows[0], 0);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(1), rows[1], 1);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(2), rows[2], 1);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(3), rows[3], 1);

            treeGrid.page = 1;
            fix.detectChanges();

            // Verify page 2
            rows = TreeGridFunctions.sortElementsVertically(TreeGridFunctions.getAllRows(fix));
            expect(rows.length).toBe(4, 'Incorrect number of rows on page 2.');
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(0), rows[0], 2);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(1), rows[1], 2);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(2), rows[2], 2);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(3), rows[3], 0);

            treeGrid.page = 2;
            fix.detectChanges();

            // Verify page 3
            rows = TreeGridFunctions.sortElementsVertically(TreeGridFunctions.getAllRows(fix));
            expect(rows.length).toBe(2, 'Incorrect number of rows on page 3.');
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(0), rows[0], 0);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(1), rows[1], 1);
        });

        it('should transform a non-tree column into a tree column when pinning it', () => {
            TreeGridFunctions.verifyTreeColumn(fix, 'ID', 4);

            treeGrid.pinColumn('Age');
            fix.detectChanges();

            TreeGridFunctions.verifyTreeColumn(fix, 'Age', 4);
        });

        it('should transform a non-tree column into a tree column when hiding the original tree-column', () => {
            TreeGridFunctions.verifyTreeColumn(fix, 'ID', 4);

            const column = treeGrid.columns.filter(c => c.field === 'ID')[0];
            column.hidden = true;
            fix.detectChanges();

            TreeGridFunctions.verifyTreeColumn(fix, 'Name', 3);
        });

        it('should transform the first visible column into tree column when pin and hide another column before that', () => {
            TreeGridFunctions.verifyTreeColumn(fix, 'ID', 4);

            treeGrid.pinColumn('Age');
            fix.detectChanges();

            const column = treeGrid.columns.filter(c => c.field === 'Age')[0];
            column.hidden = true;
            fix.detectChanges();

            TreeGridFunctions.verifyTreeColumn(fix, 'ID', 3);
        });

        it('should transform a non-tree column into a tree column when moving the original tree-column through API', () => {
            TreeGridFunctions.verifyTreeColumn(fix, 'ID', 4);

            // Move tree-column
            const sourceColumn = treeGrid.columns.filter(c => c.field === 'ID')[0];
            const targetColumn = treeGrid.columns.filter(c => c.field === 'HireDate')[0];
            treeGrid.moveColumn(sourceColumn, targetColumn);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeColumn(fix, 'Name', 4);
        });

        it('should transform a non-tree column into a tree column when moving the original tree-column through UI', (async() => {
            TreeGridFunctions.verifyTreeColumn(fix, 'ID', 4);

            const column = treeGrid.columnList.filter(c => c.field === 'ID')[0];
            column.movable = true;

            const header = TreeGridFunctions.getHeaderCell(fix, 'ID').nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 50, 50);
            UIInteractions.simulatePointerEvent('pointermove', header, 56, 56);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 490, 30);
            UIInteractions.simulatePointerEvent('pointerup', header, 490, 30);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeColumn(fix, 'Name', 4);
        }));
    });

    describe('Primary/Foreign key Relation Indentation', () => {
        beforeEach(() => {
            fix = TestBed.createComponent(IgxTreeGridPrimaryForeignKeyComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid;
        });

        it('should have the tree-cell as a first cell on every row', () => {
            // Verify all rows are present
            const rows = TreeGridFunctions.getAllRows(fix);
            expect(rows.length).toBe(8);

            // Verify the tree cell is the first cell for every row
            TreeGridFunctions.verifyCellsPosition(rows, 5);
        });

        it('should have correct indentation for every record of each level', () => {
            const rows = TreeGridFunctions.sortElementsVertically(TreeGridFunctions.getAllRows(fix));
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(0), rows[0], 0);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(1), rows[1], 1);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(2), rows[2], 2);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(3), rows[3], 2);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(4), rows[4], 1);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(5), rows[5], 0);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(6), rows[6], 0);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(7), rows[7], 1);
        });

        it('should persist the indentation after sorting', () => {
            treeGrid.columnList.filter(c => c.field === 'Age')[0].sortable = true;
            fix.detectChanges();
            treeGrid.sort({ fieldName: 'Age', dir: SortingDirection.Asc });
            fix.detectChanges();

            const rows = TreeGridFunctions.sortElementsVertically(TreeGridFunctions.getAllRows(fix));
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(0), rows[0], 0);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(1), rows[1], 1);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(2), rows[2], 1);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(3), rows[3], 2);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(4), rows[4], 2);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(5), rows[5], 0);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(6), rows[6], 0);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(7), rows[7], 1);
        });

        it('should persist the indentation after filtering', () => {
            treeGrid.columnList.filter(c => c.field === 'Age')[0].sortable = true;
            fix.detectChanges();

            treeGrid.filter('Age', 35, IgxNumberFilteringOperand.instance().condition('greaterThan'));
            fix.detectChanges();

            const rows = TreeGridFunctions.sortElementsVertically(TreeGridFunctions.getAllRows(fix));

            // This row does not satisfy the filtering, but is present in the DOM with lowered opacity
            // in order to indicate that it is a parent of another record that satisfies the filtering.
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(0), rows[0], 0);

            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(1), rows[1], 1);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(2), rows[2], 0);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(3), rows[3], 0);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(4), rows[4], 1);
        });

        it('should persist the indentation on all pages when using paging', () => {
            treeGrid.paging = true;
            fix.detectChanges();
            treeGrid.perPage = 3;
            fix.detectChanges();

            // Verify page 1
            let rows = TreeGridFunctions.sortElementsVertically(TreeGridFunctions.getAllRows(fix));
            expect(rows.length).toBe(3, 'Incorrect number of rows on page 1.');
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(0), rows[0], 0);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(1), rows[1], 1);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(2), rows[2], 2);

            treeGrid.page = 1;
            fix.detectChanges();

            // Verify page 2
            rows = TreeGridFunctions.sortElementsVertically(TreeGridFunctions.getAllRows(fix));
            expect(rows.length).toBe(3, 'Incorrect number of rows on page 2.');
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(0), rows[0], 2);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(1), rows[1], 1);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(2), rows[2], 0);

            treeGrid.page = 2;
            fix.detectChanges();

            // Verify page 3
            rows = TreeGridFunctions.sortElementsVertically(TreeGridFunctions.getAllRows(fix));
            expect(rows.length).toBe(2, 'Incorrect number of rows on page 3.');
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(0), rows[0], 0);
            TreeGridFunctions.verifyRowIndentationLevel(treeGrid.getRowByIndex(1), rows[1], 1);
        });

        it('should transform a non-tree column into a tree column when pinning it', () => {
            TreeGridFunctions.verifyTreeColumn(fix, 'ID', 5);

            treeGrid.pinColumn('Name');
            fix.detectChanges();

            TreeGridFunctions.verifyTreeColumn(fix, 'Name', 5);
        });

        it('should transform a non-tree column into a tree column when hiding the original tree-column', () => {
            TreeGridFunctions.verifyTreeColumn(fix, 'ID', 5);

            const column = treeGrid.columns.filter(c => c.field === 'ID')[0];
            column.hidden = true;
            fix.detectChanges();

            TreeGridFunctions.verifyTreeColumn(fix, 'ParentID', 4);
        });

        it('should transform the first visible column into tree column when pin and hide another column before that', () => {
            TreeGridFunctions.verifyTreeColumn(fix, 'ID', 5);

            treeGrid.pinColumn('Age');
            fix.detectChanges();

            const column = treeGrid.columns.filter(c => c.field === 'Age')[0];
            column.hidden = true;
            fix.detectChanges();

            TreeGridFunctions.verifyTreeColumn(fix, 'ID', 4);
        });

        it('should transform a non-tree column into a tree column when moving the original tree-column through API', () => {
            TreeGridFunctions.verifyTreeColumn(fix, 'ID', 5);

            // Move tree-column
            const sourceColumn = treeGrid.columns.filter(c => c.field === 'ID')[0];
            const targetColumn = treeGrid.columns.filter(c => c.field === 'JobTitle')[0];
            treeGrid.moveColumn(sourceColumn, targetColumn);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeColumn(fix, 'ParentID', 5);
        });

        it('should transform a non-tree column into a tree column when moving the original tree-column through UI', (async() => {
            TreeGridFunctions.verifyTreeColumn(fix, 'ID', 5);

            const column = treeGrid.columnList.filter(c => c.field === 'ID')[0];
            column.movable = true;

            const header = TreeGridFunctions.getHeaderCell(fix, 'ID').nativeElement;
            UIInteractions.simulatePointerEvent('pointerdown', header, 50, 50);
            UIInteractions.simulatePointerEvent('pointermove', header, 56, 56);
            await wait();
            UIInteractions.simulatePointerEvent('pointermove', header, 490, 30);
            UIInteractions.simulatePointerEvent('pointerup', header, 490, 30);
            fix.detectChanges();

            TreeGridFunctions.verifyTreeColumn(fix, 'ParentID', 5);
        }));
    });
});

