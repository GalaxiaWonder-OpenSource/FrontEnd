import { Component } from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {ToolbarMilestoneComponent} from '../../../public/components/toolbar-milestone/toolbar-milestone.component';

@Component({
  selector: 'app-milestone-layout',
  imports: [
    RouterOutlet,
    ToolbarMilestoneComponent
  ],
  templateUrl: './milestone-layout.component.html',
  styleUrl: './milestone-layout.component.css'
})
export class MilestoneLayoutComponent {

}
