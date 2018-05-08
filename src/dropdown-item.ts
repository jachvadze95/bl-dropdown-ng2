export class DropdownItem<T> {
    public value: T;
    public text: string;
    public isPlaceholder: boolean;
    public selected: boolean;

    constructor() {
        this.text = undefined;
    }
}