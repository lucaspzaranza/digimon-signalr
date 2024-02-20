import { Component, ElementRef, Inject, TemplateRef } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  title: string,
  text: string,
  hideCloseButton?: boolean,
  acceptButton?: boolean,
  loading?: boolean,
  acceptCallback?: () => {}
  closeCallback?: () => {}
}

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.css']
})
export class ConfirmationModalComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {
   }
}