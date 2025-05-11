import { Component } from '@angular/core';
import {ToolbarClientComponent} from '../../../public/components/toolbar-client/toolbar-client.component';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-client-layout',
  imports: [
    ToolbarClientComponent,
    RouterOutlet
  ],
  templateUrl: './client-layout.component.html',
  styleUrl: './client-layout.component.css'
})
export class ClientLayoutComponent {

}
