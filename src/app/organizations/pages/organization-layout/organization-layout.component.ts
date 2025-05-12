import { Component } from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {ToolbarWorkerComponent} from '../../../public/components/toolbar-worker/toolbar-worker.component';
import {
  ToolbarOrganizationComponent
} from '../../../public/components/toolbar-organization/toolbar-organization.component';

@Component({
  selector: 'app-organization-layout',
  imports: [
    RouterOutlet,
    ToolbarOrganizationComponent
  ],
  templateUrl: './organization-layout.component.html',
  styleUrl: './organization-layout.component.css'
})
export class OrganizationLayoutComponent {

}
