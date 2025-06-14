import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectTabComponent } from '../../../projects/pages/project-tab/project-tab.component';

@Component({
  selector: 'app-projects',
  imports: [ProjectTabComponent],
  standalone: true,
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css'
})
export class ProjectsComponent implements OnInit {
  organizationId: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // En el contexto de la organización, el parámetro de ruta es 'orgId'
    this.organizationId = this.route.snapshot.parent?.paramMap.get('orgId') || null;
    console.log("Organization ID from projects component:", this.organizationId);
  }
}
