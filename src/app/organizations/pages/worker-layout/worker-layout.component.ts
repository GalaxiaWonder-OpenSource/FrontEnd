import { Component } from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {ToolbarWorkerComponent} from '../../../public/components/toolbar-worker/toolbar-worker.component';

@Component({
  selector: 'app-worker-layout',
  imports: [
    RouterOutlet,
    ToolbarWorkerComponent
  ],
  templateUrl: './worker-layout.component.html',
  styleUrl: './worker-layout.component.css'
})
export class WorkerLayoutComponent {

}
