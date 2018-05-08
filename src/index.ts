import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownComponent} from './dropdown.component';
import { DropdownItemComponent} from './dropdown-item/dropdown-item.component';

export * from './dropdown.component';
export * from './dropdown-item/dropdown-item.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [
    DropdownComponent,
    DropdownItemComponent
  ],
  exports: [
    DropdownComponent,
    DropdownItemComponent
  ]
})
export class DropdownModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: DropdownModule,
      providers: []
    };
  }
}
