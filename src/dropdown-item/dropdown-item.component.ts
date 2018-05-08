import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'bl-dropdown-item-ng2',
    templateUrl: 'dropdown-item.component.html',
    styleUrls: ['dropdown-item.component.css']
})
export class DropdownItemComponent {
    @Input()
    value: any;
    @Input()
    text: string;
    @Input()
    selected: boolean;
    @Input()
    isPlaceholder: boolean;
    @Output("select")
    itemSelectEmitter: EventEmitter<any>;

    constructor() {
        this.value = undefined;
        this.text = "";
        this.selected = false;
        this.isPlaceholder = false;

        this.itemSelectEmitter = new EventEmitter();
    }

    dropdownItemSelect() {
        this.itemSelectEmitter.emit(this);
    }
}