import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings-carrier',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  public popoverStatusTitle = 'Confirm Save Change';
  public popoverStatusMessage = 'Are you sure you want to save changes.?';
  public cancelClicked = false;
  enabledCheckbox = true;
  constructor() { }

  ngOnInit() {
  }
}
