import { Component } from '@angular/core';
import { ProjectTabComponent } from '../../../projects/pages/project-tab/project-tab.component';

@Component({
  selector: 'app-projects',
  imports: [ProjectTabComponent],
  standalone: true,
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css'
})
export class ProjectsComponent {

}
