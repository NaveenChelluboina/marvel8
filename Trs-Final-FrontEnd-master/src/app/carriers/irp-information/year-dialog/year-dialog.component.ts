import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { AlertService } from 'src/app/shared/services/alert.service';
import { CarriersService } from '../../carriers.service';

@Component({
  selector: 'app-year-dialog',
  templateUrl: './year-dialog.component.html',
  styleUrls: ['./year-dialog.component.scss']
})
export class YearDialogComponent implements OnInit {
  
  addYearForm: FormGroup;
  fleets: any[] = [];
  endYears: any[] = [];
  currDate = new Date();
  public minDate = new Date(this.currDate.getFullYear(), this.currDate.getMonth(), this.currDate.getDate());
  public maxDate = new Date(this.currDate.getFullYear(), this.currDate.getMonth(), this.currDate.getDate()+1);
  
  startyears = [
    {'year_id':0,'year_name':'July 2030'},
    {'year_id':1,'year_name':'July 2029'},
    {'year_id':2,'year_name':'July 2028'},
    {'year_id':3,'year_name':'July 2027'},
    {'year_id':4,'year_name':'July 2026'},
    {'year_id':5,'year_name':'July 2025'},
    {'year_id':6,'year_name':'July 2024'},
    {'year_id':0,'year_name':'July 2023'},
    {'year_id':0,'year_name':'July 2023'},
    {'year_id':1,'year_name':'July 2022'},
    {'year_id':2,'year_name':'July 2021'},
    {'year_id':3,'year_name':'July 2020'},
    {'year_id':4,'year_name':'July 2019'},
    {'year_id':5,'year_name':'July 2018'},
    {'year_id':6,'year_name':'July 2017'},
    {'year_id':7,'year_name':'July 2016'},
    {'year_id':8,'year_name':'July 2015'},
    {'year_id':9,'year_name':'July 2014'},
    {'year_id':10,'year_name':'July 2013'},
    {'year_id':11,'year_name':'July 2012'},
    {'year_id':12,'year_name':'July 2011'},
    {'year_id':13,'year_name':'July 2010'},
    {'year_id':14,'year_name':'July 2009'},
    {'year_id':15,'year_name':'July 2008'},
    {'year_id':16,'year_name':'July 2007'},
    {'year_id':17,'year_name':'July 2006'},
    {'year_id':18,'year_name':'July 2005'},
    {'year_id':19,'year_name':'July 2004'},
    {'year_id':20,'year_name':'July 2003'},
    {'year_id':21,'year_name':'July 2002'},
    {'year_id':22,'year_name':'July 2001'},
    {'year_id':23,'year_name':'July 2000'},
    {'year_id':24,'year_name':'July 1999'},
    {'year_id':25,'year_name':'July 1998'},
    {'year_id':26,'year_name':'July 1997'},
    {'year_id':27,'year_name':'July 1996'},
    {'year_id':28,'year_name':'July 1995'},
    {'year_id':29,'year_name':'July 1994'},
    {'year_id':30,'year_name':'July 1993'},
    {'year_id':31,'year_name':'July 1992'},
    {'year_id':32,'year_name':'July 1991'},
    {'year_id':33,'year_name':'July 1990'},
    {'year_id':34,'year_name':'July 1989'},
    {'year_id':35,'year_name':'July 1988'},
    {'year_id':36,'year_name':'July 1987'},
    {'year_id':37,'year_name':'July 1986'},
    {'year_id':38,'year_name':'July 1985'},
    {'year_id':39,'year_name':'July 1984'},
    {'year_id':40,'year_name':'July 1983'},
    {'year_id':41,'year_name':'July 1982'},
    {'year_id':42,'year_name':'July 1981'},
    {'year_id':43,'year_name':'July 1980'},
    
  ]
  endyears = [
    {'year_id':0,'year_name':'Dec 2030'},
    {'year_id':1,'year_name':'Dec 2029'},
    {'year_id':2,'year_name':'Dec 2028'},
    {'year_id':3,'year_name':'Dec 2027'},
    {'year_id':4,'year_name':'Dec 2026'},
    {'year_id':5,'year_name':'Dec 2025'},
    {'year_id':6,'year_name':'Dec 2024'},
    {'year_id':0,'year_name':'Dec 2023'},
    {'year_id':1,'year_name':'Dec 2022'},
    {'year_id':2,'year_name':'Dec 2021'},
    {'year_id':3,'year_name':'Dec 2020'},
    {'year_id':4,'year_name':'Dec 2019'},
    {'year_id':5,'year_name':'Dec 2018'},
    {'year_id':6,'year_name':'Dec 2017'},
    {'year_id':7,'year_name':'Dec 2016'},
    {'year_id':8,'year_name':'Dec 2015'},
    {'year_id':9,'year_name':'Dec 2014'},
    {'year_id':10,'year_name':'Dec 2013'},
    {'year_id':11,'year_name':'Dec 2012'},
    {'year_id':12,'year_name':'Dec 2011'},
    {'year_id':13,'year_name':'Dec 2010'},
    {'year_id':14,'year_name':'Dec 2009'},
    {'year_id':15,'year_name':'Dec 2008'},
    {'year_id':16,'year_name':'Dec 2007'},
    {'year_id':17,'year_name':'Dec 2006'},
    {'year_id':18,'year_name':'Dec 2005'},
    {'year_id':19,'year_name':'Dec 2004'},
    {'year_id':20,'year_name':'Dec 2003'},
    {'year_id':21,'year_name':'Dec 2002'},
    {'year_id':22,'year_name':'Dec 2001'},
    {'year_id':23,'year_name':'Dec 2000'},
    {'year_id':24,'year_name':'Dec 1999'},
    {'year_id':25,'year_name':'Dec 1998'},
    {'year_id':26,'year_name':'Dec 1997'},
    {'year_id':27,'year_name':'Dec 1996'},
    {'year_id':28,'year_name':'Dec 1995'},
    {'year_id':29,'year_name':'Dec 1994'},
    {'year_id':30,'year_name':'Dec 1993'},
    {'year_id':31,'year_name':'Dec 1992'},
    {'year_id':32,'year_name':'Dec 1991'},
    {'year_id':33,'year_name':'Dec 1990'},
    {'year_id':34,'year_name':'Dec 1989'},
    {'year_id':35,'year_name':'Dec 1988'},
    {'year_id':36,'year_name':'Dec 1987'},
    {'year_id':37,'year_name':'Dec 1986'},
    {'year_id':38,'year_name':'Dec 1985'},
    {'year_id':39,'year_name':'Dec 1984'},
    {'year_id':40,'year_name':'Dec 1983'},
    {'year_id':41,'year_name':'Dec 1982'},
    {'year_id':42,'year_name':'Dec 1981'},
    {'year_id':43,'year_name':'Dec 1980'},
    
  ]
  public monthsObj = [{id:"01" , value:"Jan"} , {id:"02" , value:"Feb"} , {id:"03" , value:"Mar"} , {id:"04" , value:"Apr"} , {id:"05" , value:"May"} , {id:"06" , value:"Jun"} , {id:"07" , value:"Jul"} , {id:"08" , value:"Aug"} , {id:"09" , value:"Sep"} , {id:"10" , value:"Oct"} , {id:"11" , value:"Nov"} , {id:"12" , value:"Dec"}];
  constructor(public carrierService:CarriersService, public alertService: AlertService,public dialogRef: MatDialogRef<YearDialogComponent>,public fb:FormBuilder,@Inject(MAT_DIALOG_DATA) public year: any) {
    this.createAddYearForm()
  }
  
  ngOnInit() {
    this.getFleetDropDown();
    if(this.year){
      this.addYearForm.controls['fleetName'].setValue(this.year.fleetName);
      this.addYearForm.controls['fleetName'].disable();
      this.addYearForm.controls['startDate'].setValue(this.year.startDate);
      this.addYearForm.controls['inactiveDate'].setValue(this.year.inactiveDate);
    }
  }
  
  get fleetName() { return this.addYearForm.get('fleetName'); }
  get startDate() { return this.addYearForm.get('startDate'); }
  get inactiveDate() { return this.addYearForm.get('inactiveDate'); }
  
  
  createAddYearForm(){
    this.addYearForm = this.fb.group({
      fleetName : new FormControl('' , [Validators.required]),
      startDate : new FormControl('',[Validators.required]),
      inactiveDate : new FormControl('',[Validators.required]),
    })
  }
  
  getFleetDropDown() {
    let filters = {};
    filters['is_irp'] = 1;
    filters['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
    this.carrierService.getFleetDropDown(filters).then(data => {
      if (data.success) {
        this.fleets = data.results;
      }
    })
  }
  
  close(): void {
    this.dialogRef.close();
  }
  
  firstDropDownChanged(value){ 
    this.endYears = [];
    if(value){
      let finlaObj = {}
      finlaObj['year_id'] = '1'
      finlaObj['year_name'] = 'June ' + (parseInt(value.split(' ')[1]) + 1).toString();
      this.endYears.push(finlaObj)
    }
  }
  
  saveYear(){
    let stringedStartDate = this.addYearForm.value.startDate.toString();
    let stringedEndDate = this.addYearForm.value.inactiveDate.toString();
    let finalDate = stringedStartDate.split(" ")[1] + " " + stringedStartDate.split(" ")[3] + " - " + stringedEndDate.split(" ")[1] + " " + stringedEndDate.split(" ")[3];
    let finlaObj = {};
    finlaObj['fleet_id'] = this.addYearForm.value.fleetName;
    finlaObj['year_duration'] = finalDate;
    finlaObj['inactive_date'] = this.addYearForm.value.inactiveDate;
    finlaObj['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
    this.carrierService.addIrpYear(finlaObj).then(data => {
      if (data.success) {
        this.alertService.createAlert("IRP year added successfully", 1);
        this.dialogRef.close('save');
      }
      else {
        this.alertService.createAlert(data.message, 0);
      }
    })
  }  
  
}
