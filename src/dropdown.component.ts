import {
    Component, ElementRef, forwardRef,
    OnChanges, AfterContentInit,
    Input, Output, EventEmitter,
    ContentChildren, ViewChildren, QueryList
} from '@angular/core';

import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { DropdownItemComponent } from './dropdown-item/dropdown-item.component';
import { DropdownItem } from './dropdown-item';
// import { Utils } from '../../_common/helpers/utils';

@Component({
    selector: 'bl-dropdown-ng2',
    templateUrl: 'dropdown.component.html',
    styleUrls: ['dropdown.component.css'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DropdownComponent),
            multi: true
        }
    ]
})
export class DropdownComponent implements AfterContentInit, OnChanges, ControlValueAccessor {
    // input and output properties
    @Input()
    valueField: string;
    @Input()
    width: number;
    @Input()
    placeholder: string; // placeholder
    @Input()
    disabled: boolean;
    @Input()
    required: boolean;
    @Input()
    itemsListPosition: string; // list position when choosing 
    @Input()
    dataSource: Array<DropdownItem<any>>; // dynamic item list
    @Input()
    hasEmptyItem: boolean; // it dropdown with dynamic data source has empty dropdown item
    @Input()
    hasFieldset: boolean;
    @Output("onSelect")
    itemSelectEmitter: EventEmitter<any>; // dropdown select trigger

    @ContentChildren(DropdownItemComponent)
    staticDropdownItems: QueryList<DropdownItemComponent>; // item list from markup
    @ViewChildren(DropdownItemComponent)
    dynamicDropdownItems: QueryList<DropdownItemComponent>; // item list from dynamic data source
    filteredDropdownItems: Array<DropdownItem<any>>; // item list after filtering

    // selected item
    selectedItem: any;
    selectedItemValue: any;
    selectedItemText: string;

    displayItemsList: boolean; // item list visibility

    // read only properties
    get dropdownName(): string { // dropdown name, if presented
        if (this.elementRef.nativeElement.attributes["name"] === undefined)
            return "";

        return this.elementRef.nativeElement.attributes["name"].value;
    }

     get isEmpty(): boolean { // if dropdown is empty
        return this.selectedItemValue === undefined && this.selectedItemText === "";
    }

    get dropdownItems(): Array<DropdownItem<any>> {
        if (this.staticDropdownItems.length > 0) {
            return this.staticDropdownItems.toArray()
                .map((dropdownItemComponent) => {
                    let dropdownItem = new DropdownItem();
                    dropdownItem.value = dropdownItemComponent.value;
                    dropdownItem.text = dropdownItemComponent.text;
                    dropdownItem.isPlaceholder = dropdownItemComponent.isPlaceholder;
                    dropdownItem.selected = dropdownItemComponent.selected;
                    return dropdownItem;
                });
        } else {
            return this.dataSource;
        }
    }

    get fieldsetWidth(): number {
        return this.width + 31;
    }

    // initialization
    constructor(
        private elementRef: ElementRef,
        private sanitizer: DomSanitizer) {

        this.placeholder = "";
        this.itemsListPosition = "bottom";
        this.dataSource = [];
        this.hasEmptyItem = false;
        this.itemSelectEmitter = new EventEmitter();

        this.selectedItemText = "";

        this.displayItemsList = false;

        this.filteredDropdownItems = [];
    }

    // lifecycle events
    ngOnChanges(simpleChanges): void {
        this.disabled = !(this.disabled === undefined || this.disabled === false);
        this.required = !(this.required === undefined || this.required === false);
        this.hasEmptyItem = !(this.hasEmptyItem === undefined || this.hasEmptyItem === false);
        this.hasFieldset = !(this.hasFieldset === undefined || this.hasFieldset === false);
        this.width = this.width ? +this.width : undefined;

        if (simpleChanges.dataSource && simpleChanges.dataSource.currentValue) {
            this.filteredDropdownItems = this.copyObject(simpleChanges.dataSource.currentValue);
            if (this.selectedItemValue) {
                this.writeValue(this.selectedItemValue);
            }
        }
    }

    ngAfterContentInit(): void {
        if (this.staticDropdownItems.length > 0) {
            this.filteredDropdownItems = this.staticDropdownItems.toArray()
                .map((dropdownItemComponent) => {
                    let dropdownItem = new DropdownItem();
                    dropdownItem.value = dropdownItemComponent.value;
                    dropdownItem.text = dropdownItemComponent.text;
                    dropdownItem.isPlaceholder = dropdownItemComponent.isPlaceholder;
                    return dropdownItem;
                });
        }
    }

    // overrides
    writeValue(value: any) {
        if (value === undefined) {
            this.selectedItem = undefined;
            this.selectedItemValue = undefined;
            this.selectedItemText = "";
            this.deselectAll();
        } else if (value !== null) {
            this.deselectAll();
            this.selectedItemValue = value;
            this.selectByValue(value);
        }
    }

    propagateChange = (_: any) => { };
    registerOnChange(fn) {
        this.propagateChange = fn;
    }

    registerOnTouched() { }

    // dropdown events
    filterDropdownItems(event): void {
        var key = event.which || event.keyCode;

        if (key == 8 // backspace
            || key == 32 // space
            || key == 46 // delete
            || key == 109 // dash
            || key == 110 // num lock point
            || key == 188 // comma
            || key == 189 // dash
            || key == 190 // point
            || key >= 48 && key <= 90 // alphabet and numerics
            || key >= 96 && key <= 105) { // num lock numerics
            if (this.selectedItemText) {
                this.filteredDropdownItems = this.dropdownItems.filter((dropdownItem) => {
                    return dropdownItem.text.toLowerCase().indexOf(this.selectedItemText.toLowerCase()) > -1
                });
                this.displayItemsList = true;
            } else {
                this.filteredDropdownItems = this.copyObject(this.dropdownItems);
            }
        }
    }

    onDropdownBlur() {
        setTimeout(() => { this.displayItemsList = false }, 100);
    }

    toggleDropdown() {
        this.displayItemsList = !this.displayItemsList;
    }

    dropdownItemSelect(selectedItem: DropdownItemComponent) {
        this.filteredDropdownItems = this.copyObject(this.dropdownItems); // clear filter

        this.displayItemsList = false; // hide item list

        if (selectedItem === undefined || selectedItem.isPlaceholder) {
            var value = undefined;
            var text = "";

            this.deselectAll(); // deselect all items
        } else {
            var value = selectedItem.value;
            var text = selectedItem.text;

            this.filteredDropdownItems.forEach((dropdownItem) => {
                dropdownItem.selected = this.getActualValue(dropdownItem.value) === this.getActualValue(selectedItem.value);
            });
        }

        let valueChanged = this.selectedItemValue !== this.getActualValue(value);

        // selected item value and text
        this.selectedItem = value;
        this.selectedItemValue = this.getActualValue(value);
        this.selectedItemText = text;

        this.propagateChange(this.getActualValue(value)); // propagate change

        this.itemSelectEmitter.emit({
            dropdownName: this.dropdownName,
            valueChanged: valueChanged,
            selectedItem: value,
            selectedItemValue: this.getActualValue(value),
            selectedItemText: text
        }); // fire onSelect event
    }

    // deselect all items
    deselectAll() {
        this.filteredDropdownItems.forEach((dropdownItem) => {
            dropdownItem.selected = false;
        });
    }

    // select by value
    selectByValue(value: any) {
        this.filteredDropdownItems.forEach((dropdownItem) => {
            if (this.getActualValue(dropdownItem.value) == value) {
                dropdownItem.selected = true;
                this.selectedItem = dropdownItem.value;
                this.selectedItemText = dropdownItem.text;
            }
        });
    }

    // placeholder styles
    setPlaceholderTopPosition() {
        if (!this.isEmpty) {
            return "-8px";
        } else {
            return "6px";
        }
    }

    // arrows styles
    setArrowColor() {
        if (this.displayItemsList) {
            return "#000000";
        } else {
            return "#9E9E9E";
        }
    }

    public setArrowLeftSafeTransform() {
        if (this.itemsListPosition.toUpperCase() == "BOTTOM") {
            if (this.displayItemsList) {
                return this.sanitizer.bypassSecurityTrustStyle("rotateZ(-45deg)");
            } else {
                return this.sanitizer.bypassSecurityTrustStyle("rotateZ(45deg)");
            }
        } else if (this.itemsListPosition.toUpperCase() == "TOP") {
            if (this.displayItemsList) {
                return this.sanitizer.bypassSecurityTrustStyle("rotateZ(45deg)");
            } else {
                return this.sanitizer.bypassSecurityTrustStyle("rotateZ(-45deg)");
            }
        } else {
            throw new Error("Invalid itemsListPosition value");
        }
    }

    public setArrowRightSafeTransform() {
        if (this.itemsListPosition.toUpperCase() == "BOTTOM") {
            if (this.displayItemsList) {
                return this.sanitizer.bypassSecurityTrustStyle("rotateZ(45deg)");
            } else {
                return this.sanitizer.bypassSecurityTrustStyle("rotateZ(-45deg)");
            }
        } else if (this.itemsListPosition.toUpperCase() == "TOP") {
            if (this.displayItemsList) {
                return this.sanitizer.bypassSecurityTrustStyle("rotateZ(-45deg)");
            } else {
                return this.sanitizer.bypassSecurityTrustStyle("rotateZ(45deg)");
            }
        } else {
            throw new Error("Invalid itemsListPosition value");
        }
    }

    // items list styles
    getItemsListStyles() {
        var boxShadow = "";
        var top = "";
        var bottom = "";

        if (this.itemsListPosition.toUpperCase() == "BOTTOM") {
            boxShadow = "1px 0px 1px #B9B9B9";
            top = "100%";
        } else if (this.itemsListPosition.toUpperCase() == "TOP") {
            boxShadow = "1px 0px 1px #B9B9B9";
            bottom = "120%";
        }

        return {
            'box-shadow': boxShadow,
            'top': top,
            'bottom': bottom
        };
    }

    clearSelection() {
        this.selectedItemText = "";
        this.selectedItemValue = undefined;
        this.deselectAll();
    }

    private getActualValue(value: any): any {
        return value === undefined ?
            undefined :
            this.valueField ? value[this.valueField] : value;
    }

    private copyObject(object: any): any {
        if (object === undefined || object === null) {
            return object;
        }

        var newObject = JSON.parse(JSON.stringify(object));

        for (var prop in object) {
            if (object[prop] instanceof File) {
                newObject[prop] = object[prop];
            }
        }

        return newObject;
    }
}