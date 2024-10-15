import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MembersService } from '../services/members.service';
import { ToastrService } from 'ngx-toastr';
import { InstrumentsService } from '../services/instruments.service';

@Component({
  selector: 'app-add-member',
  templateUrl: './add-member.component.html',
  styleUrl: './add-member.component.css'
})
export class AddMemberComponent {
  instrumentForm: FormGroup;

  constructor(
    private fb: FormBuilder, 
    private ms: MembersService,
    private toast: ToastrService,
    private is: InstrumentsService) {
    // Initialize the form with fields
    this.instrumentForm = this.fb.group({
      name: ['', Validators.required],  // Name is required
      instruments: this.fb.array([])
    });
  }

  allInstruments: any;

  ngOnInit(): void{
    this.is.getAllInstruments().subscribe(val=>{
      this.allInstruments = val
      const count = this.allInstruments.length
      for (let i = 0; i < count; i++) {
        this.instruments.push(this.fb.control(''));  // Add empty form control for each instrument
      }
    })
  }

  get instruments(): FormArray {
    return this.instrumentForm.get('instruments') as FormArray;
  }

  // Method to handle form submission
  onSubmit(): void {
    if (this.instrumentForm.valid) {
      console.log('Form Data:', this.instrumentForm.value);
      this.ms.addMember(this.instrumentForm.value).then(()=>{
        this.toast.success('Member successfully added');
        this.instrumentForm.reset();
      })
    } else {
      console.log('Form is invalid');
    }
  }
}
