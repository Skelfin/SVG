import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faCircleExclamation, faTrashCan } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-add-form',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './add-form.component.html',
  styleUrls: ['./add-form.component.scss']
})
export class AddFormComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef;
  faPlus = faPlus;
  faCircleExclamation = faCircleExclamation;
  faTrashCan = faTrashCan;

  imageSrc: string | ArrayBuffer | null = null;
  isDraggingOver: boolean = false;
  isDraggingFile: boolean = false;

  ngOnInit() {
    this.toggleGlobalDragEvents(true);
  }

  ngOnDestroy() {
    this.toggleGlobalDragEvents(false);
  }

  private toggleGlobalDragEvents(enable: boolean) {
    const method = enable ? 'addEventListener' : 'removeEventListener';
    document[method]('dragenter', this.onGlobalDragEnter as EventListener);
    document[method]('dragleave', this.onGlobalDragLeave as EventListener);
    document[method]('dragover', this.onGlobalDragOver as EventListener);
    document[method]('drop', this.onGlobalDrop as EventListener);
    document[method]('dragend', this.onGlobalDragEnd as EventListener);
  }

  private onGlobalDragEnter = (event: DragEvent) => {
    if (event.dataTransfer?.items.length) {
      this.isDraggingFile = true;
      this.isDraggingOver = true;
    }
  }

  private onGlobalDragLeave = (event: DragEvent) => {
    if (event.relatedTarget === null) {
      this.isDraggingFile = false;
      this.isDraggingOver = false;
    }
  }

  private onGlobalDragOver = (event: DragEvent) => {
    event.preventDefault();
    if (this.isDraggingFile) {
      this.isDraggingOver = true;
    }
  }

  private onGlobalDrop = (event: DragEvent) => {
    this.resetDragState();
  }

  private onGlobalDragEnd = (event: DragEvent) => {
    this.resetDragState();
  }

  private resetDragState() {
    this.isDraggingFile = false;
    this.isDraggingOver = false;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      if (this.isValidFile(file)) {
        this.readFile(file);
      } else {
        alert('Файл должен быть формата JPG и не превышать 3 МБ');
        input.value = ''; // Сбросить значение input, чтобы пользователь мог выбрать другой файл
      }
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.resetDragState();
    if (!this.imageSrc && event.dataTransfer?.files.length) {
      const file = event.dataTransfer.files[0];
      if (this.isValidFile(file)) {
        this.readFile(file);
      } else {
        alert('Файл должен быть формата JPG и не превышать 3 МБ');
      }
    }
  }

  private isValidFile(file: File): boolean {
    return file.type === 'image/jpeg' && file.size <= 3 * 1024 * 1024;
  }

  private readFile(file: File): void {
    const reader = new FileReader();
    reader.onload = e => this.imageSrc = reader.result;
    reader.readAsDataURL(file);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDragLeave(event: DragEvent): void {
    if (event.relatedTarget === null) {
      this.isDraggingOver = false;
    }
  }

  onBoxClick(): void {
    if (!this.imageSrc) {
      this.fileInput.nativeElement.click();
    }
  }

  removeImage(event: Event): void {
    event.stopPropagation(); // Prevent triggering the file input click
    this.imageSrc = null;
    this.fileInput.nativeElement.value = ''; // Сбрасываем значение input
  }
}