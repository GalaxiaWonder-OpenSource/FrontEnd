//just to try security guards
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-members',
  imports: [CommonModule],
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.css']
})
export class MembersComponent {
  projectMembers = [
    {
      name: 'Fabrizio Leon',
      role: 'Analista',
      email: 'zack&cody@example.com'
    },
    {
      name: 'Mongo',
      role: 'Diseñador',
      email: 'monguito@example.com'
    },
    {
      name: 'Mario López',
      role: 'Líder Técnico',
      email: 'mariocabanossi@example.com'
    }
  ];
}
