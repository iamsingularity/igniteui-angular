// tslint:disable-next-line:no-implicit-dependencies
import { FileEntry, SchematicContext, Tree, FileVisitor } from '@angular-devkit/schematics';

import * as fs from 'fs';
import * as path from 'path';
import { ClassChanges, BindingChanges, SelectorChange, SelectorChanges } from './schema';
import { getIdentifierPositions } from './tsUtils';
import { getProjectPaths, getWorkspace } from './util';

// tslint:disable:arrow-parens
export class UpdateChanges {
    protected sourcePaths: string[];
    protected classChanges: ClassChanges;
    protected outputChanges: BindingChanges;
    protected inputChanges: BindingChanges;
    protected selectorChanges: SelectorChanges;
    protected conditionFunctions: Map<string, Function> = new Map<string, Function>();

    private _templateFiles: string[] = [];
    public get templateFiles(): string[] {
        if (!this._templateFiles.length) {
            // https://github.com/angular/devkit/blob/master/packages/angular_devkit/schematics/src/tree/filesystem.ts
            this.sourceDirsVisitor((fulPath, entry) => {
                if (fulPath.endsWith('component.html')) {
                    this._templateFiles.push(entry.path);
                }
            });
        }
        return this._templateFiles;
    }

    private _tsFiles: string[] = [];
    public get tsFiles(): string[] {
        if (!this._tsFiles.length) {
            this.sourceDirsVisitor((fulPath, entry) => {
                if (fulPath.endsWith('.ts')) {
                    this._tsFiles.push(entry.path);
                }
            });
        }
        return this._tsFiles;
    }

    /**
     * Create a new base schematic to apply changes
     * @param rootPath Root folder for the schematic to read configs, pass __dirname
     */
    constructor(private rootPath: string, private host: Tree, private context?: SchematicContext) {
        this.sourcePaths = getProjectPaths(getWorkspace(host));

        const selectorJson = path.join(this.rootPath, 'changes', 'selectors.json');
        if (fs.existsSync(selectorJson)) {
            this.selectorChanges = JSON.parse(fs.readFileSync(selectorJson, 'utf-8'));
        }
        const classJson = path.join(this.rootPath, 'changes', 'classes.json');
        if (fs.existsSync(classJson)) {
            this.classChanges = JSON.parse(fs.readFileSync(classJson, 'utf-8'));
        }
        const outputsJson = path.join(this.rootPath, 'changes', 'outputs.json');
        if (fs.existsSync(outputsJson)) {
            this.outputChanges = JSON.parse(fs.readFileSync(outputsJson, 'utf-8'));
        }
        const inputsJson = path.join(this.rootPath, 'changes', 'inputs.json');
        if (fs.existsSync(inputsJson)) {
            this.inputChanges = JSON.parse(fs.readFileSync(inputsJson, 'utf-8'));
        }
    }

    /** Apply configured changes to the Host Tree */
    public applyChanges() {
        if (this.selectorChanges && this.selectorChanges.changes.length) {
            for (const entryPath of this.templateFiles) {
                this.updateSelectors(entryPath);
            }
        }
        if (this.outputChanges && this.outputChanges.changes.length) {
            for (const entryPath of this.templateFiles) {
                this.updateBindings(entryPath, this.outputChanges);
            }
        }

        if (this.inputChanges && this.inputChanges.changes.length) {
            for (const entryPath of this.templateFiles) {
                this.updateBindings(entryPath, this.inputChanges, BindingType.input);
            }
        }

        /** TS files */
        if (this.classChanges && this.classChanges.changes.length) {
            for (const entryPath of this.tsFiles) {
                this.updateClasses(entryPath);
            }
        }
    }

    /** Add condition funtion. */
    public addCondition(conditionName: string, callback: (ownerMatch: string) => boolean) {
        this.conditionFunctions.set(conditionName, callback);
    }

    protected updateSelectors(entryPath: string) {
        let fileContent = this.host.read(entryPath).toString();
        let overwrite = false;
        for (const change of this.selectorChanges.changes) {
            let searchPttrn = change.type === 'component' ? '<' : '';
            searchPttrn += change.selector;
            if (fileContent.indexOf(searchPttrn) !== -1) {
                fileContent = this.applySelectorChange(fileContent, change);
                overwrite = true;
            }
        }
        if (overwrite) {
            this.host.overwrite(entryPath, fileContent);
        }
    }

    protected applySelectorChange(fileContent: string, change: SelectorChange): string {
        let regSource: string;
        let replace: string;
        switch (change.type) {
            case 'component':
                if (change.remove) {
                    regSource = String.raw`\<${change.selector}[\s\S]*?\<\/${change.selector}\>`;
                    replace = '';
                } else {
                    regSource = String.raw`\<(\/?)${change.selector}`;
                    replace = `<$1${change.replaceWith}`;
                }
                break;
            case 'directive':
                if (change.remove) {
                    // Group match (\2) as variable as it looks like octal escape (error in strict)
                    regSource = String.raw`\s*?\[?${change.selector}\]?(=(["']).*?${'\\2'}(?=\s|\>))?`;
                    replace = '';
                } else {
                    regSource = change.selector;
                    replace = change.replaceWith;
                }
                break;
            default:
                break;
        }
        fileContent = fileContent.replace(new RegExp(regSource, 'g'), replace);
        return fileContent;
    }

    protected updateClasses(entryPath: string) {
        let fileContent = this.host.read(entryPath).toString();
        let overwrite = false;
        for (const change of this.classChanges.changes) {
            if (fileContent.indexOf(change.name) !== -1) {
                const positions = getIdentifierPositions(fileContent, change.name);
                // loop backwards to preserve positions
                for (let i = positions.length; i--;) {
                    const pos = positions[i];
                    fileContent = fileContent.slice(0, pos.start) + change.replaceWith + fileContent.slice(pos.end);
                }
                overwrite = true;
            }
        }
        if (overwrite) {
            this.host.overwrite(entryPath, fileContent);
        }
    }

    protected updateBindings(entryPath: string, bindChanges: BindingChanges, type = BindingType.output) {
        let fileContent = this.host.read(entryPath).toString();
        let overwrite = false;

        for (const change of bindChanges.changes) {
            if (fileContent.indexOf(change.owner.selector) === -1 || fileContent.indexOf(change.name) === -1) {
                continue;
            }

            let base;
            let replace;
            let groups = 1;
            let searchPattern;

            if (type === BindingType.output) {
                base = String.raw`\(${change.name}\)`;
                replace = `(${change.replaceWith})`;
            } else {
                base = String.raw`(\[?)${change.name}(\]?)`;
                replace = String.raw`$1${change.replaceWith}$2`;
                groups = 3;
            }

            let reg = new RegExp(base, 'g');
            if (change.remove || change.moveBetweenElementTags) {
                // Group match (\1) as variable as it looks like octal escape (error in strict)
                reg = new RegExp(String.raw`\s*${base}=(["']).*?${'\\' + groups}(?=\s|\>)`, 'g');
                replace = '';
            }
            switch (change.owner.type) {
            case 'component':
                searchPattern = String.raw`\<${change.owner.selector}[^\>]*\>`;
                break;
            case 'directive':
                searchPattern = String.raw`\<[^\>]*[\s\[]${change.owner.selector}[^\>]*\>`;
                break;
            }

            const matches = fileContent.match(new RegExp(searchPattern, 'g'));

            for (const match of matches) {
                if (!this.areConditionsFulfiled(match, change.conditions)) {
                    continue;
                }

                if (change.moveBetweenElementTags) {
                    const moveMatch = match.match(reg);
                    fileContent = this.copyPropertyValueBetweenElementTags(fileContent, match, moveMatch);
                }

                fileContent = fileContent.replace(
                    match,
                    match.replace(reg, replace)
                );
            }
            overwrite = true;
        }
        if (overwrite) {
            this.host.overwrite(entryPath, fileContent);
        }
    }

    private areConditionsFulfiled(match: string, conditions: string[]): boolean {
        if (conditions) {
            for (const condition of conditions) {
                if (this.conditionFunctions && this.conditionFunctions.has(condition)) {
                    const callback = this.conditionFunctions.get(condition);
                    if (callback && !callback(match)) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    private copyPropertyValueBetweenElementTags(fileContent: string, ownerMatch: string, propertyMatchArray: RegExpMatchArray): string {
        if (ownerMatch && propertyMatchArray && propertyMatchArray.length > 0) {
            const propMatch = propertyMatchArray[0].trim();
            const propValueMatch = propMatch.match(new RegExp(`=(["'])(.+?)${'\\1'}`));
            if (propValueMatch && propValueMatch.length > 0) {
                const propValue = propValueMatch[propValueMatch.length-1];

                if (propMatch.startsWith('[')) {
                    return fileContent.replace(ownerMatch, ownerMatch + `{{${propValue}}}`);
                } else {
                    return fileContent.replace(ownerMatch, ownerMatch + propValue);
                }
            }
        }

        return fileContent;
    }

    private sourceDirsVisitor(visitor: FileVisitor) {
        for (const sourcePath of this.sourcePaths) {
            const srcDir = this.host.getDir(sourcePath);
            srcDir.visit(visitor);
        }
    }
}

export enum BindingType {
    output,
    input
}
