import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MemberListComponent } from '../../components/member-list/member-list.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-member-tab',
  standalone: true,
  imports: [CommonModule, MemberListComponent, TranslatePipe],
  templateUrl: './member-tab.component.html',
  styleUrl: './member-tab.component.css'
})
export class MemberTabComponent {
  // Este componente actúa como contenedor para MemberListComponent
  // Se puede ampliar para añadir elementos adicionales en el futuro
} // Se puede ampliar para añadir elementos adicionales en el futuro

