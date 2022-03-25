import { Component, OnInit } from "@angular/core";
import { TreeModule } from "primeng/tree";
import { TreeNode, MenuItem } from "primeng/api";
import { Tree } from "primeng/primeng";
import { IrpService } from "./irp.service";
import { FleetDialogComponent } from "./fleet-dialog/fleet-dialog.component";
import { MatDialog } from "@angular/material";
import { YearDialogComponent } from "./year-dialog/year-dialog.component";
import { DocumentDialogComponent } from "./document-dialog/document-dialog.component";
import { FormControl } from "@angular/forms";
import { CarriersService } from "../carriers.service";
import { AlertService } from "src/app/shared/services/alert.service";
import { DeleteConfirmDialogComponent } from "src/app/shared/delete-confirm-dialog/delete-confirm-dialog.component";

@Component({
  selector: "app-irp-information",
  templateUrl: "./irp-information.component.html",
  styleUrls: ["./irp-information.component.scss"],
  providers: [IrpService]
})
export class IrpInformationComponent implements OnInit {
  selectedFile2:any;
  selectedId = 0;
  filesTree: any;
  items: MenuItem[];
  isfleet = true;
  isyear = false;
  isdoc = false;
  weight = "2";
  weightGroup: any[] = [];
  fleetName = '';
  startDate = '';
  expiryDate = '';
  deleteId = ''
  showEmpty: boolean = true;
  showWeight: boolean = true;
  public canCreate : any;
  public canDelete : any;
  public canUpdate : any;
  Assets = new FormControl();
  currDate = new Date();
  docUrl = '';
  public minDate = new Date(
    this.currDate.getFullYear(),
    this.currDate.getMonth(),
    this.currDate.getDate()
  );
  public maxDate = new Date(
    this.currDate.getFullYear(),
    this.currDate.getMonth(),
    this.currDate.getDate() + 1
  );

  constructor(public irpService: IrpService, public dialog: MatDialog,public carrierService:CarriersService, public alertService: AlertService) {
   
  }

  ngOnInit() {
    this.getIrp({});
    let userdata = JSON.parse(sessionStorage.getItem('trs_user_info')).user_permissions[5];
   this.canCreate = parseInt(userdata.permission_type.split('')[0]);
   this.canUpdate = parseInt(userdata.permission_type.split('')[2]);
   this.canDelete = parseInt(userdata.permission_type.split('')[3]);

  }

  operations = [
    { operation_id: "1", operation_name: "TR187982323" },
    { operation_id: "2", operation_name: "TR987982324" },
    { operation_id: "3", operation_name: "TR987982254" }
  ];

  addFleet() {
    this.isfleet = true;
    this.isdoc = false;
    this.isyear = false;
  }

  addYear() {
    this.isfleet = false;
    this.isyear = true;
    this.isdoc = false;
  }

  addDoc() {
    this.isfleet = false;
    this.isdoc = true;
    this.isyear = false;
  }

  changeCountry(event) {
    const selected = event.value;
    if (selected == "1") {
      this.weight = "1";
    } else {
      this.weight = "2";
    }
  }

  getIrp(filters) {
    filters['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
    var dataList: dataArray[] = [];
    this.carrierService.getIrp(filters).then(data => {
      if (data.success) {
        for(let i in data.results) { 
          var p = new dataArray;
            p.label = data.results[i].fleet_name;
            p.id = i;
            if(data.results[i].trs_tbl_irp){
              for (let j in data.results[i].trs_tbl_irp.trs_tbl_irp_fleet_years){
                var y = new Children;
                  y.label = data.results[i].trs_tbl_irp.trs_tbl_irp_fleet_years[j].year_duration;
                  y.year_id = data.results[i].trs_tbl_irp.trs_tbl_irp_fleet_years[j].year_id.toString();
              for (let k in data.results[i].trs_tbl_irp.trs_tbl_irp_fleet_years[j].trs_tbl_irp_fleet_documents){
                var d = new subChildren;
                 d.label = data.results[i].trs_tbl_irp.trs_tbl_irp_fleet_years[j].trs_tbl_irp_fleet_documents[k].document_name;
                 d.data = data.results[i].trs_tbl_irp.trs_tbl_irp_fleet_years[j].trs_tbl_irp_fleet_documents[k].document_name;
                 d.effectiveDate = data.results[i].trs_tbl_irp.trs_tbl_irp_fleet_years[j].year_duration;
                 d.docurl = data.results[i].trs_tbl_irp.trs_tbl_irp_fleet_years[j].trs_tbl_irp_fleet_documents[k].document_path;
                 d.document_id = data.results[i].trs_tbl_irp.trs_tbl_irp_fleet_years[j].trs_tbl_irp_fleet_documents[k].document_id.toString();
                 y.children.push(d);
              };
              p.children.push(y);
               };
            }
            if(data.results[i].trs_tbl_irp){
              for(let l in data.results[i].trs_tbl_irp.trs_tbl_irp_weight_groups){
                var w = new weightgrp;
                w.weight_group_id = data.results[i].trs_tbl_irp.trs_tbl_irp_weight_groups[l].weight_group_id;
                w.irp_id = data.results[i].trs_tbl_irp.trs_tbl_irp_weight_groups[l].irp_id;
                w.max_weight_group = data.results[i].trs_tbl_irp.trs_tbl_irp_weight_groups[l].max_weight_group;
                w.number_of_combined_axels = data.results[i].trs_tbl_irp.trs_tbl_irp_weight_groups[l].number_of_combined_axels;
                p.weightGroup.push(w);
               }
            }
           dataList.push(p);
        }
      }
      if(dataList.length){
        this.filesTree = dataList;
        this.showEmpty = false;
        this.selectedFile2 = this.filesTree[this.selectedId];
        this.fleetName = this.filesTree[this.selectedId].label;
        this.weightGroup = this.filesTree[this.selectedId].weightGroup;
        if(this.weightGroup.length){
          this.showWeight = false;
        }else{
          this.showWeight = true;
        }
      }else{
        this.showEmpty = true;
      }
    })
  }

  public nodeMenu(event, node) {
    this.isfleet = false;
    this.isyear = false;
    this.isdoc = false;
    this.items = [];
    if (node.isRoot) {
      this.items.push({
        label: "Add Fleet",
        icon: "fa fa-plus",
        command: data => this.addFleet()
      });
    } else if (node.isFleet) {
      this.isfleet = true;
      this.items.push({
        label: "Add Year",
        icon: "fa fa-plus",
        command: data => this.addYear()
      });
      this.items.push({
        label: "Edit Fleet",
        icon: "fa fa-edit",
        command: data => this.addFleet()
      });
    } else if (node.isYear) {
      this.isyear = true;
      this.items.push({
        label: "Add Document",
        icon: "fa fa-plus",
        command: data => this.addDoc()
      });
      this.items.push({
        label: "Edit Year",
        icon: "fa fa-edit",
        command: data => this.addFleet()
      });
    } else if (node.isDoc) {
      this.isdoc = true;
      this.items.push({
        label: "Edit Document",
        icon: "fa fa-edit",
        command: data => this.addDoc()
      });
    }
    return false;
  }

  nodeSelect(event) {
    this.isfleet = false;
    this.isyear = false;
    this.isdoc = false;
    if (event.node.isFleet) {
      this.isfleet = true;
      this.selectedId = event.node.id
      this.fleetName = event.node.label;
      this.weightGroup = event.node.weightGroup;
      if(this.weightGroup.length){
        this.showWeight = false;
      }else{
        this.showWeight = true;
      }
    } else if (event.node.isYear) {
      this.isyear = true;
      this.startDate = event.node.label.split("-")[0];
      this.expiryDate = event.node.label.split("-")[1];
      this.deleteId = event.node.year_id;
    } else if (event.node.isDoc) {
       this.isdoc = true;
       this.fleetName = event.node.label;
       this.expiryDate = event.node.effectiveDate;
       this.docUrl = event.node.docurl;
       this.deleteId = event.node.document_id;
    }
  }
  
  contextMenu(node, contextMenu) {
    contextMenu.show();
  }

  selectAll(ev, type) {
    if (ev._selected) {
      if (type == "attach") {
        let temp = [];
        for (let i = 0; i < this.operations.length; i++) {
          temp.push(this.operations[i]["operation_id"]);
        }
        this.Assets.setValue(temp);
      }

      ev._selected = true;
    }
    if (ev._selected == false) {
      if (type == "attach") this.Assets.setValue([]);
    }
  }

  selectOne(ev, type) {
    if (type == "attach") {
      this.operations.length <= this.Assets.value.length && !ev._selected
        ? ev.select()
        : ev.deselect();
    }
  }

  openAddYeardialog(data) {
    let dialogRef = this.dialog.open(YearDialogComponent, {
      data: data,
      height: "auto",
      width: "500px",
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(prospects => {
      if (prospects == "save") {
        this.getIrp({});
      }
    });
  }

  openAddDocumentdialog(data) {
    let dialogRef = this.dialog.open(DocumentDialogComponent, {
      data: data,
      height: "auto",
      width: "600px",
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(prospects => {
      if (prospects == "save") {
        this.getIrp({});
      }
    });
  }

  openAddWeightGroupdialog(data) {
    let dialogRef = this.dialog.open(FleetDialogComponent, {
      data: data,
      height: "auto",
      width: "600px",
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(prospects => {
      if (prospects == "save") {
        this.getIrp({});
      }
    });
  }

   deleteFiles(){
    let dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      data: this.deleteId,
      height: 'auto',
      width: 'auto',
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe(data => {
      if (data != null && data !== undefined) {
         let obj = {};
         if(this.isyear == true){
          obj['year_id'] = parseInt(data);
          obj['is_deleted'] = 1;
         }else{
          obj['document_id'] = parseInt(data);
          obj['is_deleted'] = 1;
         }
         this.carrierService.deleteRecord(obj).then(data => {
          if (data.success) {
            this.alertService.createAlert("Record deleted successfully", 1);
            this.getIrp({});
          }
          else {
            this.alertService.createAlert(data.message, 0);
          }
        })  
       }
    });
   }

   deleteWeightGroup(data){
    let dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      data:data,
      height: 'auto',
      width: 'auto',
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe(data => {
      if (data != null && data !== undefined) {
         let obj = {};
          obj['weight_group_id'] = data.weight_group_id
          obj['is_deleted'] = 1;
        this.carrierService.deleteRecord(obj).then(data => {
          if (data.success) {
            this.alertService.createAlert("Weight group deleted successfully", 1);
             this.getIrp({});
          }
          else {
            this.alertService.createAlert(data.message, 0);
          }
        })  
       }
    });
   }
}

export class dataArray {    
  label: string = '';
  id: string = '0';
  data:string = "Documents Folder";
  expandedIcon:string = "fa fa-bus red";
  collapsedIcon: string = "fa fa-bus red";
  isFleet: Boolean = true;
  expanded: Boolean = false;
  children: Children[]=[];
  weightGroup: weightgrp[]=[];
}

export class weightgrp {
  weight_group_id: number = 0;
  irp_id:number = 0;
  max_weight_group:string ='';
  number_of_combined_axels:string = '';
}

export class Children {
    label: string = '';   
    year_id:string = '';
    data: string = "Work Folder";
    expandedIcon:string = "fa fa-folder-open green";
    collapsedIcon: string = "fa fa-folder green";
    isYear: Boolean = true;
    expanded: Boolean = false;
    children: subChildren[]=[];
}

export class subChildren {
  label: string = '';  
  document_id:string ='';
  effectiveDate: string = ''; 
  docurl:string = '';
  icon: string = "fa fa-file-pdf-o blue";
  data: string = '';
  isDoc: Boolean = true;
}
