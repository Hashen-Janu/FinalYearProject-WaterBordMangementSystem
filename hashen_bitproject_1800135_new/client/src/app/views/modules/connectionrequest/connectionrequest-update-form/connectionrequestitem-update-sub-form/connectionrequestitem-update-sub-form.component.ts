import {Component, forwardRef, OnInit} from '@angular/core';
import {FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {ApiManager} from '../../../../../shared/api-manager';
import {MatSnackBar} from '@angular/material/snack-bar';
import {PageRequest} from '../../../../../shared/page-request';
import {AbstractSubFormComponent} from '../../../../../shared/ui-components/abstract-sub-form/abstract-sub-form.component';
import {Connectionrequestitem} from '../../../../../entities/connectionrequestitem';
import {Item} from '../../../../../entities/item';
import {ItemService} from '../../../../../services/item.service';

@Component({
  selector: 'app-connectionrequestitem-update-sub-form',
  templateUrl: './connectionrequestitem-update-sub-form.component.html',
  styleUrls: ['./connectionrequestitem-update-sub-form.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ConnectionrequestitemUpdateSubFormComponent),
      multi: true
    }, {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => ConnectionrequestitemUpdateSubFormComponent),
      multi: true,
    }
  ]
})
export class ConnectionrequestitemUpdateSubFormComponent extends AbstractSubFormComponent<Connectionrequestitem> implements OnInit{

  items: Item[] = [];

  hasValidations = false;

  get thumbnailURL(): string{
    return ApiManager.getURL('/files/thumbnail/');
  }

  form = new FormGroup({
    id: new FormControl(null),
    item: new FormControl(),
    qty: new FormControl(),
    unitprice: new FormControl(),
  });

  get idField(): FormControl{
    return this.form.controls.id as FormControl;
  }

  get itemField(): FormControl{
    return this.form.controls.item as FormControl;
  }

  get qtyField(): FormControl{
    return this.form.controls.qty as FormControl;
  }

  get unitpriceField(): FormControl{
    return this.form.controls.unitprice as FormControl;
  }

  get isFormEmpty(): boolean{
    return this.isEmptyField(this.idField)
      &&   this.isEmptyField(this.itemField)
      &&   this.isEmptyField(this.qtyField)
      &&   this.isEmptyField(this.unitpriceField);
  }

  constructor(
    private itemService: ItemService,
    protected dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    super();
  }

  ngOnInit(): void {
    this.itemService.getAllBasic(new PageRequest()).then((itemDataPage) => {
      this.items = itemDataPage.content;
    }).catch((e) => {
      console.log(e);
      this.snackBar.open('Something is wrong', null, {duration: 2000});
    });
  }

  setValidations(): void{
    this.hasValidations = true;
    this.itemField.setValidators([Validators.required]);
    this.qtyField.setValidators([
      Validators.required,
      Validators.pattern('^([0-9]{1,10}([.][0-9]{1,3})?)$'),
      Validators.max(10000000),
      Validators.min(0),
    ]);
    this.unitpriceField.setValidators([
      Validators.pattern('^([0-9]{1,8}([.][0-9]{1,2})?)$'),
      Validators.max(10000000),
      Validators.min(0),
    ]);
  }

  removeValidations(): void{
    this.hasValidations = false;
    this.itemField.clearValidators();
    this.qtyField.clearValidators();
    this.unitpriceField.clearValidators();
  }

  fillForm(dataItem: Connectionrequestitem): void {
    this.idField.patchValue(dataItem.id);
    this.itemField.patchValue(dataItem.item.id);
    this.qtyField.patchValue(dataItem.qty);
    this.unitpriceField.patchValue(dataItem.unitprice);
  }

  resetForm(): void{
    this.form.reset();
    this.removeValidations();
  }

  // Operations related functions
  getDeleteConfirmMessage(connectionrequestitem: Connectionrequestitem): string {
    return 'Are you sure to remove \u201C ' + connectionrequestitem.item.name + ' \u201D from allowance list ?';
  }

  getUpdateConfirmMessage(connectionrequestitem: Connectionrequestitem): string {
    if (this.isFormEmpty){
      return 'Are you sure to update \u201C\u00A0' + connectionrequestitem.item.name + '\u00A0\u201D\u00A0?';
    }

    return 'Are you sure to update \u201C\u00A0' + connectionrequestitem.item.name + '\u00A0\u201D and discard existing form data\u00A0?';
  }

  addData(): void{
    if (this.form.invalid) { return; }

    const dataItem: Connectionrequestitem = new Connectionrequestitem();
    dataItem.id = this.idField.value;

    for (const item of this.items){
      if (this.itemField.value === item.id) {
        dataItem.item = item;
        break;
      }
    }

    dataItem.qty = this.qtyField.value;
    dataItem.unitprice = this.unitpriceField.value;
    this.addToTop(dataItem);
    this.resetForm();
  }

  customValidations(): object {
    return null;
  }
}
