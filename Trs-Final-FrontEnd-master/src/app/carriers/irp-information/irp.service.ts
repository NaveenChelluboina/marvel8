import { Injectable } from '@angular/core';

@Injectable()
export class IrpService {
    treeData = {
        "data":
            [
                {
                    "label": "Fleet 1",
                    "data": "Documents Folder",
                    "expandedIcon": "fa fa-bus",
                    "collapsedIcon": "fa fa-bus",
                    "isFleet": true,
                    "expanded":true,
                    "children": [{
                        "label": "Nov 2019 - Oct 2020",
                        "data": "Work Folder",
                        "expandedIcon": "fa fa-folder-open",
                        "collapsedIcon": "fa fa-folder",
                        "isYear": true,
                        "expanded":true,
                        "children": [
                            { "label": "Cab Card 1", "icon": "fa fa-file-pdf-o", "data": "Cab Card 1", "isDoc": true, },
                            { "label": "Cab Card 2", "icon": "fa fa-file-pdf-o", "data": "Cab Card 2", "isDoc": true }
                        ]
                    },
                    {
                        "label": "Nov 2018 - Oct 2019",
                        "data": "Work Folder",
                        "expandedIcon": "fa fa-folder-open",
                        "collapsedIcon": "fa fa-folder",
                        "isYear": true,
                        "expanded":true,
                        "children": [
                            { "label": "Cab Card 1", "icon": "fa fa-file-pdf-o", "data": "Cab Card 1", "isDoc": true, },
                            { "label": "Cab Card 2", "icon": "fa fa-file-pdf-o", "data": "Cab Card 2", "isDoc": true }
                        ]
                    }]
                },{
                    "label": "Fleet 2",
                    "data": "Documents Folder",
                    "expandedIcon": "fa fa-bus",
                    "collapsedIcon": "fa fa-bus",
                    "isFleet": true,
                    "expanded":true,
                    "children": [{
                        "label": "Nov 2019 - Oct 2020",
                        "data": "Work Folder",
                        "expandedIcon": "fa fa-folder-open",
                        "collapsedIcon": "fa fa-folder",
                        "isYear": true,
                        "expanded":true,
                        "children": [
                            { "label": "Cab Card 1", "icon": "fa fa-file-pdf-o", "data": "Cab Card 1", "isDoc": true, },
                            { "label": "Cab Card 2", "icon": "fa fa-file-pdf-o", "data": "Cab Card 2", "isDoc": true }
                        ]
                    }]
                }
            ]
    };
    constructor() {
    }
    getTreeJson() {
        return this.treeData;
    }

}
