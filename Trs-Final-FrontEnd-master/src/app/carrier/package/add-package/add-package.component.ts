import { Component, OnInit,Inject } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { AlertService } from 'src/app/shared/services/alert.service';
import { MatDialogRef,MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-add-package',
  templateUrl: './add-package.component.html',
  styleUrls: ['./add-package.component.scss']
})
export class AddPackageComponent implements OnInit {

  id: any;
  action: any;
  item: any;
  public addPackageForm: FormGroup;
  public gridObject: any = {};
  public formValue: any = {};
  public formData: any = {};
  constructor(@Inject(MAT_DIALOG_DATA) public lead: any,public alertService: AlertService, private _fb: FormBuilder,
     public dialogRef: MatDialogRef<AddPackageComponent>,
    public fb: FormBuilder) { }

  ngOnInit() {
    this.addPackageForm = this.fb.group({
      PackageLevel: new FormControl('', [Validators.required]),
      NoOfFleetsFrom: new FormControl('', [Validators.required]),
      NoOfFleetsTo: new FormControl('', [Validators.required]),
      MonthlyPrice: new FormControl('', [Validators.required]),
      AnnualPrice: new FormControl('', [Validators.required]),
    });


  }

 

  close(): void {
    this.dialogRef.close();
  }
  noWhiteSpaceValidator(control: FormControl) {
    const isWhiteSpace = (control.value || '').trim().length === 0;
    const isValid = !isWhiteSpace;
    return isValid ? null : { 'whitespace': true };
  }
}
