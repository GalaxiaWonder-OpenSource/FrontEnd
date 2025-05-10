import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-terms-and-conditions',
  imports: [MatButtonModule, MatDialogModule, TranslatePipe],
  templateUrl: './terms-and-conditions.component.html',
  styleUrl: './terms-and-conditions.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TermsAndConditionsComponent {
  readonly dialog = inject(MatDialog);

  openDialog() {
    const dialogRef = this.dialog.open(TermsAndConditionsDialogComponent);
  }
}


@Component({
  selector: 'app-terms-and-conditions-dialog',
  templateUrl: './terms-and-conditions-dialog.component.html',
  imports: [MatButtonModule, MatDialogModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TermsAndConditionsDialogComponent {

}
