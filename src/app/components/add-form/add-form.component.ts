import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule, ValidatorFn, AbstractControl } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faCircleExclamation, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { PhotoService } from '../../services/photo.service';
import { jwtDecode } from 'jwt-decode';
import { CommonModule } from '@angular/common';
import { UploadPhotoData } from '../../types/photo';

@Component({
  selector: 'app-add-form',
  standalone: true,
  imports: [FontAwesomeModule, ReactiveFormsModule, CommonModule],
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
  isSubmitting: boolean = false;
  photoForm: FormGroup;
  jwtToken!: string;

  constructor(private photoService: PhotoService) {
    this.photoForm = new FormGroup({
      name: new FormControl('', [Validators.required, this.noLeadingSpaceValidator()]),
      image: new FormControl(null, [Validators.required])
    });

    const token = localStorage.getItem('jwtToken');
    if (token) {
      this.jwtToken = token;
    }
  }

  private noLeadingSpaceValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      if (control.value && control.value[0] === ' ') {
        return { 'leadingSpace': true };
      }
      return null;
    };
  }

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
        input.value = '';
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
    reader.onload = e => {
      this.imageSrc = reader.result;
      this.photoForm.patchValue({ image: file });
      this.photoForm.get('image')?.updateValueAndValidity();
    };
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
    event.stopPropagation();
    this.imageSrc = null;
    this.fileInput.nativeElement.value = '';
    this.photoForm.patchValue({ image: null });
    this.photoForm.get('image')?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.photoForm.valid) {
      this.isSubmitting = true;
      const uploadData: UploadPhotoData = {
        name: this.photoForm.get('name')!.value,
        image: this.photoForm.get('image')!.value,
        token: this.jwtToken!,
        onComplete: () => {
          this.isSubmitting = false;
        }
      };
      setTimeout(() => {
        this.photoService.uploadPhoto(uploadData);
      }, 1000);
    }
  }
}