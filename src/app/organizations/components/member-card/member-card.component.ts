import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { OrganizationMember } from '../../model/organization-member.entity';

@Component({
  selector: 'app-member-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './member-card.component.html',
  styleUrls: ['./member-card.component.css']
})
export class MemberCardComponent {
  @Input() member!: {
    memberType: string;
    joinedAt: Date;
    fullName: string;
    email: string;
    member: OrganizationMember; // para compatibilidad con el método actual
  };

  @Input() isCreator: boolean = false;
  @Input() currentPersonId: string | null = null;

  @Output() removeMember = new EventEmitter<OrganizationMember>();

  /**
   * Obtiene las iniciales del nombre completo
   */
  getInitials(fullName: string): string {
    return fullName
      .split(' ')
      .map(p => p[0])
      .join('')
      .toUpperCase();
  }

  /**
   * Verifica si el miembro puede ser eliminado
   */
  canBeRemoved(): boolean {
    return this.isCreator && 
           !(this.member.memberType === 'CONTRACTOR' && 
             this.member.member.personId.toString() === this.currentPersonId);
  }

  /**
   * Emite evento para eliminar miembro
   */
  onRemoveMember(): void {
    this.removeMember.emit(this.member.member);
  }
}
