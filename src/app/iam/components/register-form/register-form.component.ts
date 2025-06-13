import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';

import { UserRole } from '../../model/user-role.vo';
import { AccountStatus } from '../../model/account-status.vo';
import {NgForOf} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, FormsModule, NgForOf, TranslatePipe, MatCardModule],
  templateUrl: './register-form.component.html',
  styleUrl: './register-form.component.css'
})
export class RegisterFormComponent {
  roles = Object.values(UserRole); // ['TYPE_CLIENT', 'ORGANIZATION_USER', ...]
  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  username = '';
  password = '';
  role: UserRole = UserRole.TYPE_CLIENT;
  status: AccountStatus = AccountStatus.ACTIVE;

  @Output() submitted = new EventEmitter<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    username: string;
    password: string;
    role: UserRole;
    status: AccountStatus;
  }>();

  submitForm() {
    this.submitted.emit({
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phone: this.phone,
      username: this.username,
      password: this.password,
      role: this.role,
      status: this.status
    });
  }
}
