import { Injectable } from '@angular/core';

import * as fs from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class ExcelServiceService {
  
  generateExcel() {
    const header = ['Asset ID','Fleet Name (As added in Fleet area in portal)','Asset Type (per portal)','Year','Asset Make (no abbreviations, per portal options)','Model','Plate #','Plate Jurisdiction (do not use abbreviations)','VIN # (17 digits)','Country (Canada or USA)','Registered Gross Vehicle Weight','Units (Kgs or Lbs)','# of axles','Active Date(YYYY,MM,DD)','Comments'];
    let colWidthFix = 30;
    // let workbook = new Workbook();
    // let worksheet = workbook.addWorksheet('Test Attendance Data');
    // worksheet.addRow(header);
    // // worksheet.getRow(1).font = {bold:true,size:15};
    // let count = 0;
    // worksheet.columns.forEach(column => {
    //   if(count == 0)
    //   column.width = 10;
    //   if(count == 1)
    //   column.width = 45;
    //   if(count == 2)
    //   column.width = 25;
    //   if(count == 3)
    //   column.width = 10;
    //   if(count == 4)
    //   column.width = 45;
    //   if(count == 5)
    //   column.width = 15;
    //   if(count == 6)
    //   column.width = 15;
    //   if(count == 7)
    //   column.width = 45;
    //   if(count == 8)
    //   column.width = 15;
    //   if(count == 9)
    //   column.width = 25;
    //   if(count == 10)
    //   column.width = 40;
    //   if(count == 11)
    //   column.width = 20;
    //   if(count == 12)
    //   column.width = 10;
    //   if(count == 13)
    //   column.width = 25;
    //   if(count == 14)
    //   column.width = 25;
    //   // column.alignment = {horizontal:'center',vertical:'middle'};
    //   count++;
    // })
    // // worksheet.getRow(3).height = 40;
    // // worksheet.getRow(3).alignment = {horizontal:'center',vertical:'middle'};
    // // worksheet.getCell('AL3').value = 'TDP';
    // workbook.xlsx.writeBuffer().then((data) => {
    //   let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    //   fs.saveAs(blob, 'Asset Sample File.xlsx');
    // });
  }
  
  constructor() { }
}
