import { Component } from '@angular/core';

declare var bootstrap: any;

@Component({
  selector: 'app-toasts',
  standalone: true,
  imports: [],
  templateUrl: './toasts.component.html',
  styleUrls: ['./toasts.component.scss']
})
export class ToastsComponent {
  showSuccessToast(message: string) {
    const toastElement = document.getElementById('successToast');
    const toastBody = document.getElementById('successToastBody');
    if (toastElement && toastBody) {
      toastBody.textContent = message;
      const toast = new bootstrap.Toast(toastElement);
      toast.show();
    }
  }

  showErrorToast(message: string) {
    const toastElement = document.getElementById('errorToast');
    const toastBody = document.getElementById('errorToastBody');
    if (toastElement && toastBody) {
      toastBody.textContent = message;
      const toast = new bootstrap.Toast(toastElement);
      toast.show();
    }
  }
}
