import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Project } from '../../model/project.entity';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, TranslatePipe],
  templateUrl: './project-card.component.html',
  styleUrl: './project-card.component.css'
})
export class ProjectCardComponent {
  @Input() project!: Project;
}
