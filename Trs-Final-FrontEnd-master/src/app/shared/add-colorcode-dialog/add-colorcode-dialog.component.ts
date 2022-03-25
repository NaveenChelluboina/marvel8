import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AlertService } from '../services/alert.service';
import { AdminService } from 'src/app/admin/admin.service';

@Component({
  selector: 'app-add-colorcode-dialog',
  templateUrl: './add-colorcode-dialog.component.html',
  styleUrls: ['./add-colorcode-dialog.component.scss']
})
export class AddColorcodeDialogComponent implements OnInit {
  addColorForm: FormGroup;
  colorCodes = [];
  colors: Array<any> = [{ 'code': '1', 'name': 'Green', 'colorClass': 'dot_green' },
  { 'code': '2', 'name': 'Blue', 'colorClass': 'dot_blue' },
  { 'code': '3', 'name': 'Grey', 'colorClass': 'dot_grey' },
  { 'code': '4', 'name': 'Red', 'colorClass': 'dot_red' }];

  constructor(public dialogRef: MatDialogRef<AddColorcodeDialogComponent>, @Inject(MAT_DIALOG_DATA) public color: any,
    private alertService: AlertService, private fb: FormBuilder, private adminService: AdminService) {
    this.createColorForm();
  }

  ngOnInit() {
    if (this.color.data === 'Add') {
      this.addColorForm.controls['selectcolor'].setValue(null);
      this.addColorForm.controls['addColorCodeName'].setValue(this.color.data.color_code_name);
      this.addColorForm.controls['addColorDescription'].setValue(this.color.data.color_description);
    } else if (this.color.data) {
      this.addColorForm.controls['selectcolor'].setValue(this.color.data.color_code);
      this.addColorForm.controls['addColorCodeName'].setValue(this.color.data.color_code_name);
      this.addColorForm.controls['addColorDescription'].setValue(this.color.data.color_description);
    }
  }
  get selectcolor() { return this.addColorForm.get('selectcolor'); }

  get addColorCodeName() { return this.addColorForm.get('addColorCodeName'); }

  get addColorDescription() { return this.addColorForm.get('addColorDescription'); }

  close(): void {
    this.dialogRef.close();
  }

  saveLookup() {
    const temp = {
      'section': this.color.section,
      'color_code': this.addColorForm.value.selectcolor,
      'color_code_name': this.addColorForm.value.addColorCodeName,
      'color_description': this.addColorForm.value.addColorDescription
    };
    if (this.color.data === 'Add') {
      this.adminService.addColorCodes(temp).then(data => {
        if (data.success) {
          this.alertService.createAlert('Color code saved successfully', 1);
          this.dialogRef.close('save');
        } else {
          this.alertService.createAlert(data.message, 0);
        }
      });
    } else {
      temp['color_code_id'] = this.color.data.color_code_id;
      this.adminService.updateColorCodes(temp).then(data => {
        if (data.success) {
          this.alertService.createAlert('Color code updated successfully', 1);
          this.dialogRef.close('save');
        } else {
          this.alertService.createAlert(data.message, 0);
        }
      });
    }
  }


  createColorForm() {
    this.addColorForm = this.fb.group({
      addColorDescription: new FormControl('', [Validators.maxLength(150), Validators.required, this.noWhiteSpaceValidator]),
      selectcolor: new FormControl('', [Validators.required]),
      addColorCodeName: new FormControl('', [Validators.maxLength(15), Validators.required, this.noWhiteSpaceValidator]),
    })
  }

  noWhiteSpaceValidator(control: FormControl) {
    const isWhiteSpace = (control.value || '').trim().length === 0;
    const isVAlid = !isWhiteSpace;
    return isVAlid ? null : { 'whitespace': true };
  }

  omit_special_char(event) {
    var k;
    k = event.charCode;
    return ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k > 47 && k < 58))
  }
}
