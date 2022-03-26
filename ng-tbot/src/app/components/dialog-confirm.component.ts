import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'dialog-confirm',
    templateUrl: './dialog-confirm.component.html'
})
export class DialogConfirmComponent {
    dialogText: string;
    action: string;

    constructor(private mdDialogRef: MatDialogRef<DialogConfirmComponent>) {}

    confirm() {
        this.mdDialogRef.close(true);
    }
}
