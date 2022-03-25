import { Injectable } from '@angular/core';

import * as fs from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class DriverExcelServiceService {

  generateExcel() {
    const header = ['Driver Last Name','Driver First Name','Cell Phone','Email ID','Driving Licence Number','Driving Licence Class','Active Date(YYYY,MM,DD)','Address','Country (Canada, USA)','State (No abbreviations)','City','Zip','Comments'];
    let colWidthFix = 30;
    // let workbook = new Workbook();
    // let worksheet = workbook.addWorksheet('Test Attendance Data');
    // worksheet.addRow(header);
    // // worksheet.getRow(1).font = {bold:true,size:15};
    // let count = 0;
    // worksheet.columns.forEach(column => {
    //   if(count == 0)
    //   column.width = 20;
    //   if(count == 1)
    //   column.width = 20;
    //   if(count == 2)
    //   column.width = 15;
    //   if(count == 3)
    //   column.width = 15;
    //   if(count == 4)
    //   column.width = 25;
    //   if(count == 5)
    //   column.width = 25;
    //   if(count == 6)
    //   column.width = 25;
    //   if(count == 7)
    //   column.width = 15;
    //   if(count == 8)
    //   column.width = 25;
    //   if(count == 9)
    //   column.width = 30;
    //   if(count == 10)
    //   column.width = 10;
    //   if(count == 11)
    //   column.width = 10;
    //   if(count == 12)
    //   column.width = 15;
    //   // column.alignment = {horizontal:'center',vertical:'middle'};
    //   count++;
    // })
    // // worksheet.getRow(3).height = 40;
    // // worksheet.getRow(3).alignment = {horizontal:'center',vertical:'middle'};
    // // worksheet.getCell('AL3').value = 'TDP';
    // workbook.xlsx.writeBuffer().then((data) => {
    //   let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    //   fs.saveAs(blob, 'Driver Sample File.xlsx');
    // });
  }
  
  constructor() { }
}
 