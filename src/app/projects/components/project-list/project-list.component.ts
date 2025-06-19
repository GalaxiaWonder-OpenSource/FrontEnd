import {Component, Input, HostListener} from '@angular/core';
import {ProjectCardComponent} from '../project-card/project-card.component';
import {TranslatePipe} from '@ngx-translate/core';
import {CommonModule} from '@angular/common';
import {Project} from '../../model/project.entity';
import { UserType } from '../../../iam/model/user-type.vo';
import { OrganizationMemberType } from '../../../organizations/model/organization-member-type.vo';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, ProjectCardComponent, TranslatePipe],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.css'
})
export class ProjectListComponent {
  @Input() projects: Project[] = [];
  @Input() organizationRole?: OrganizationMemberType;

  definirConsoleLog() {
    console.log("PROYECTOSsxd", this.projects);
  }

  // Método que se activa cuando se presiona cualquier tecla
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    // Escucha específicamente la tecla "K"
    if (event.key.toLowerCase() === 'k') {
      this.definirConsoleLog(); // Imprime los proyectos cuando se presiona la tecla "K"
    }
  }
}
