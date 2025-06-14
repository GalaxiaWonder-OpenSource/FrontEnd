import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SessionService } from '../../../iam/services/session.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [
    CommonModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule
  ],
  templateUrl: './user-menu.component.html',
  styleUrl: './user-menu.component.css'
})
export class UserMenuComponent {
  constructor(
    private sessionService: SessionService,
    private router: Router
  ) {}

  logout(): void {
    // Limpia todos los datos de la sesión
    this.sessionService.clearAll();
    // Limpia también la identidad del usuario
    this.sessionService.clearIdentity();
    // Redirige al usuario a la página de inicio de sesión
    this.router.navigate(['/login']);
  }
}
