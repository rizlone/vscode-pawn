
interface DependencyDescriptor {
    count: number;
    dependency: FileDependency;
}

// We use FileDepenency as a key for a WeakMap containing dependencies.
// This way we can wrap a string into an object that will get GC'd,
// together with it's corresponding value pair in the weakmap,
// if no open documents depend on the file.
export class FileDependency {
    public constructor(public uri: string) {

    }
}
export class FileDependencyManager {
    private _dependencies: Map<string, DependencyDescriptor>;

    public constructor() {
        this._dependencies = new Map();
    }

    public getDependency(uri: string): FileDependency | undefined {
        const descriptor = this._dependencies.get(uri);
        if (descriptor === undefined) { return undefined; }
        return descriptor.dependency;
    }

    public removeDependency(uri: string) {
        if (!this._dependencies.has(uri)) {
            throw new Error('Tried to remove a non-existent dependency.');
        }

        this._dependencies.delete(uri);
    }

    public getAllDependencies() {
        return Array.from(this._dependencies).map((pair) => pair[1].dependency);
    }

    public addReference(uri: string) {
        const dep = this._dependencies.get(uri);
        if (dep === undefined) {
            const newFileDep = new FileDependency(uri);
            this._dependencies.set(uri, { count: 1, dependency: newFileDep });
            return newFileDep;
        } else {
            ++dep.count;
            return dep.dependency;
        }
    }

    public removeReference(uri: string) {
        const dependency = this._dependencies.get(uri);
        if (dependency === undefined) {
            throw new Error('Tried to remove a reference from a non-existent dependency.');
        }
        --dependency.count;
        if (dependency.count === 0) {
            this._dependencies.delete(uri);
        }
    }
}