import {Component, Input} from '@angular/core';
import {ProjectCardComponent} from '../project-card/project-card.component';
import {TranslatePipe} from '@ngx-translate/core';
import {CommonModule} from '@angular/common';
import {Project} from '../../model/project.entity';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, ProjectCardComponent, TranslatePipe],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.css'
})
export class ProjectListComponent {
  @Input() projects: Project[] = [];
}
