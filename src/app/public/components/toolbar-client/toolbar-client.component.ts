import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import {LanguageSwitcherComponent} from '../language-switcher/language-switcher.component';
import {TranslatePipe} from '@ngx-translate/core';
import {MatIcon} from '@angular/material/icon';
import {UserMenuComponent} from '../user-menu/user-menu.component';

@Component({
  selector: 'app-toolbar-client',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    LanguageSwitcherComponent,
    TranslatePipe,
    MatIcon,
    UserMenuComponent
  ],
  templateUrl: './toolbar-client.component.html',
  styleUrls: ['./toolbar-client.component.css']
})
export class ToolbarClientComponent {}
