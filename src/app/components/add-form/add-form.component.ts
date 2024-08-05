import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule, ValidatorFn, AbstractControl } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faCircleExclamation, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { PhotoService } from '../../services/photo.service';
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
  jwtToken = localStorage.getItem('jwtToken') || '';

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
    return (control: AbstractControl): { [key: string]: boolean } | null =>
      control.value?.[0] === ' ' ? { 'leadingSpace': true } : null;
  }

  ngOnInit() {
    this.toggleGlobalDragEvents(true);
  }

  ngOnDestroy() {
    this.toggleGlobalDragEvents(false);
  }

  private toggleGlobalDragEvents(enable: boolean) {
    const method = enable ? 'addEventListener' : 'removeEventListener';
    const events: { [key: string]: (event: Event) => void } = {
      dragenter: this.onGlobalDragEnter.bind(this),
      dragleave: this.onGlobalDragLeave.bind(this),
      dragover: this.onGlobalDragOver.bind(this),
      drop: this.onGlobalDrop.bind(this),
      dragend: this.onGlobalDragEnd.bind(this),
    };
    Object.keys(events).forEach(event => 
      document[method](event, events[event])
    );
  }

  onGlobalDragEnter(event: Event) {
    const dragEvent = event as DragEvent;
    if (dragEvent.dataTransfer?.items.length) {
      this.isDraggingOver = true;
    }
  }

  onGlobalDragLeave(event: Event) {
    const dragEvent = event as DragEvent;
    if (dragEvent.relatedTarget === null) {
      this.isDraggingOver = false;
    }
  }

  onGlobalDragOver(event: Event) {
    event.preventDefault();
  }

  onGlobalDrop(event: Event) {
    this.resetDragState();
  }

  onGlobalDragEnd(event: Event) {
    this.resetDragState();
  }

  private resetDragState() {
    this.isDraggingOver = false;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file && this.isValidFile(file)) {
      this.readFile(file);
    } else {
      alert('Файл должен быть формата JPG и не превышать 3 МБ');
      input.value = '';
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.resetDragState();
    const file = event.dataTransfer?.files[0];
    if (file && this.isValidFile(file)) {
      this.readFile(file);
    } else {
      alert('Файл должен быть формата JPG и не превышать 3 МБ');
    }
  }

  private isValidFile(file: File): boolean {
    return file.type === 'image/jpeg' && file.size <= 3 * 1024 * 1024;
  }

  private readFile(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.imageSrc = reader.result;
      this.photoForm.patchValue({ image: file });
    };
    reader.readAsDataURL(file);
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