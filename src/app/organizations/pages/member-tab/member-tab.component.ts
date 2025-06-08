import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MemberComponent } from '../../components/members/member.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-member-tab',
  standalone: true,
  imports: [CommonModule, MemberComponent, TranslatePipe],
  templateUrl: './member-tab.component.html',
  styleUrl: './member-tab.component.css'
})
export class MemberTabComponent {}
