import { Component } from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {ToolbarProjectComponent} from '../../../public/components/toolbar-project/toolbar-project.component';

@Component({
  selector: 'app-project-layout',
  imports: [
    RouterOutlet,
    ToolbarProjectComponent
  ],
  templateUrl: './project-layout.component.html',
  styleUrl: './project-layout.component.css'
})
export class ProjectLayoutComponent {

}
