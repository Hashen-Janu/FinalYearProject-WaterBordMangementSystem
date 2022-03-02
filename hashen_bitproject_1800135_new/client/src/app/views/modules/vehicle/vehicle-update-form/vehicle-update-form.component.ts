import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {LoggedUser} from '../../../../shared/logged-user';
import {UsecaseList} from '../../../../usecase-list';
import {ResourceLink} from '../../../../shared/resource-link';
import {AbstractComponent} from '../../../../shared/abstract-component';
import {PageRequest} from '../../../../shared/page-request';
import {Vehicle} from '../../../../entities/vehicle';
import {VehicleService} from '../../../../services/vehicle.service';
import {Vehicletype} from '../../../../entities/vehicletype';
import {VehicletypeService} from '../../../../services/vehicletype.service';
import {Unit} from '../../../../entities/unit';
import {UnitService} from '../../../../services/unit.service';

@Component({
  selector: 'app-vehicle-update-form',
  templateUrl: './vehicle-update-form.component.html',
  styleUrls: ['./vehicle-update-form.component.scss']
})
export class VehicleUpdateFormComponent extends AbstractComponent implements OnInit {

  selectedId: number;
  vehicle: Vehicle;

  vehicletypes: Vehicletype[] = [];
  units: Unit[] = [];

  form = new FormGroup({
    no: new FormControl(null, [
      Validators.required,
      Validators.minLength(null),
      Validators.maxLength(20),
      Validators.pattern('^(sp|wp|sg|np|up|cp|ep|nw|nc)-([a-zA-Z]{2,3}|((?!0*-)[0-9]{1,3}))-[0-9]{4}(?!0{4})$)'),
    ]),
    vehicletype: new FormControl(null, [
      Validators.required,
    ]),
    brand: new FormControl(null, [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(255),
    ]),
    model: new FormControl(null, [
      Validators.minLength(2),
      Validators.maxLength(255),
    ]),
    regyear: new FormControl(null, [
      Validators.minLength(null),
      Validators.maxLength(255),
      Validators.pattern('^([1,2][0-9]{3})$'),
    ]),
    photo: new FormControl(),
    description: new FormControl(null, [
      Validators.minLength(null),
      Validators.maxLength(5000),
    ]),
    unit: new FormControl(null, [
      Validators.required,
    ]),
  });

  get noField(): FormControl{
    return this.form.controls.no as FormControl;
  }

  get vehicletypeField(): FormControl{
    return this.form.controls.vehicletype as FormControl;
  }

  get brandField(): FormControl{
    return this.form.controls.brand as FormControl;
  }

  get modelField(): FormControl{
    return this.form.controls.model as FormControl;
  }

  get regyearField(): FormControl{
    return this.form.controls.regyear as FormControl;
  }

  get photoField(): FormControl{
    return this.form.controls.photo as FormControl;
  }

  get descriptionField(): FormControl{
    return this.form.controls.description as FormControl;
  }

  get unitField(): FormControl{
    return this.form.controls.unit as FormControl;
  }

  constructor(
    private vehicletypeService: VehicletypeService,
    private vehicleService: VehicleService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private unitService: UnitService,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe( async (params) => {
      this.selectedId =  + params.get('id');
      await this.loadData();
      this.refreshData();
    });
  }

async loadData(): Promise<any>{

    this.updatePrivileges();
    if (!this.privilege.update) { return; }

    this.vehicletypeService.getAll().then((vehicletypes) => {
      this.vehicletypes = vehicletypes;
    }).catch((e) => {
      console.log(e);
      this.snackBar.open('Something is wrong', null, {duration: 2000});
    });
    this.unitService.getAll().then((units) => {
      this.units = units;
    }).catch((e) => {
      console.log(e);
      this.snackBar.open('Something is wrong', null, {duration: 2000});
    });
    this.vehicle = await this.vehicleService.get(this.selectedId);
    this.setValues();
  }

  updatePrivileges(): any {
    this.privilege.add = LoggedUser.can(UsecaseList.ADD_VEHICLE);
    this.privilege.showAll = LoggedUser.can(UsecaseList.SHOW_ALL_VEHICLES);
    this.privilege.showOne = LoggedUser.can(UsecaseList.SHOW_VEHICLE_DETAILS);
    this.privilege.delete = LoggedUser.can(UsecaseList.DELETE_VEHICLE);
    this.privilege.update = LoggedUser.can(UsecaseList.UPDATE_VEHICLE);
  }

  discardChanges(): void{
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.setValues();
  }

  setValues(): void{
    if (this.noField.pristine) {
      this.noField.setValue(this.vehicle.no);
    }
    if (this.vehicletypeField.pristine) {
      this.vehicletypeField.setValue(this.vehicle.vehicletype.id);
    }
    if (this.brandField.pristine) {
      this.brandField.setValue(this.vehicle.brand);
    }
    if (this.modelField.pristine) {
      this.modelField.setValue(this.vehicle.model);
    }
    if (this.regyearField.pristine) {
      this.regyearField.setValue(this.vehicle.regyear);
    }
    if (this.photoField.pristine) {
      if (this.vehicle.photo) { this.photoField.setValue([this.vehicle.photo]); }
      else { this.photoField.setValue([]); }
    }
    if (this.descriptionField.pristine) {
      this.descriptionField.setValue(this.vehicle.description);
    }
    if (this.unitField.pristine) {
      this.unitField.setValue(this.vehicle.unit.id);
    }
}

  async submit(): Promise<void> {
    this.photoField.updateValueAndValidity();
    this.photoField.markAsTouched();
    if (this.form.invalid) { return; }

    const newvehicle: Vehicle = new Vehicle();
    newvehicle.no = this.noField.value;
    newvehicle.vehicletype = this.vehicletypeField.value;
    newvehicle.brand = this.brandField.value;
    newvehicle.model = this.modelField.value;
    newvehicle.unit = this.unitField.value;
    newvehicle.regyear = this.regyearField.value;
    const photoIds = this.photoField.value;
    if (photoIds !== null && photoIds !== []){
      newvehicle.photo = photoIds[0];
    }else{
      newvehicle.photo = null;
    }
    newvehicle.description = this.descriptionField.value;
    try{
      const resourceLink: ResourceLink = await this.vehicleService.update(this.selectedId, newvehicle);
      if (this.privilege.showOne) {
        await this.router.navigateByUrl('/vehicles/' + resourceLink.id);
      } else {
        await this.router.navigateByUrl('/vehicles');
      }
    }catch (e) {
      switch (e.status) {
        case 401: break;
        case 403: this.snackBar.open(e.error.message, null, {duration: 2000}); break;
        case 400:
          const msg = JSON.parse(e.error.message);
          let knownError = false;
          if (msg.no) { this.noField.setErrors({server: msg.no}); knownError = true; }
          if (msg.vehicletype) { this.vehicletypeField.setErrors({server: msg.vehicletype}); knownError = true; }
          if (msg.brand) { this.brandField.setErrors({server: msg.brand}); knownError = true; }
          if (msg.model) { this.modelField.setErrors({server: msg.model}); knownError = true; }
          if (msg.regyear) { this.regyearField.setErrors({server: msg.regyear}); knownError = true; }
          if (msg.photo) { this.photoField.setErrors({server: msg.photo}); knownError = true; }
          if (msg.description) { this.descriptionField.setErrors({server: msg.description}); knownError = true; }
          if (!knownError) {
            this.snackBar.open('Validation Error', null, {duration: 2000});
          }
          break;
        default:
          this.snackBar.open('Something is wrong', null, {duration: 2000});
      }
    }

  }
}
