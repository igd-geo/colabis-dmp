// angular dependencies
import { Component } from '@angular/core';

// app dependencies
import { ResourceReducer } from './resources';
import { AuthenticationService } from './auth/authentication.service';
import { WorkflowReducer } from './workflow';

// import common styles
import '../assets/css/common.css';

/**
 * This is the Main Application
 */
@Component({
  selector: 'app',
  styleUrls: [
    './app.style.css'
  ],
  templateUrl: './app.html'
})
export class AppComponent {
  public title: string = 'Colabis Data Management Platform';

  public sidebarExpanded = false;
  public sidebarVisible = true;

  public notificationOptions = {
      timeOut: 2000,
      lastOnBottom: true,
      clickToClose: true,
      maxLength: 0,
      maxStack: 3,
      showProgressBar: true,
      pauseOnHover: true,
      preventDuplicates: true,
      preventLastDuplicates: 'visible',
      rtl: false,
      animate: 'scale',
      position: ['right', 'bottom']
  };

  constructor(
      private auth: AuthenticationService,
      private reducer: ResourceReducer,
      private workflowReducer: WorkflowReducer
  ) {
    this.auth.updateUserInfo();
  }
}
