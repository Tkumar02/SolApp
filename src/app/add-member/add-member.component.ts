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
  allNames: Array<string> = [];
  members: any;

  ngOnInit(): void{
    this.is.getAllInstruments().subscribe(val=>{
      this.allInstruments = val
      const count = this.allInstruments.length
      for (let i = 0; i < count; i++) {
        this.instruments.push(this.fb.control(''));  // Add empty form control for each instrument
      }
    })
    this.ms.getMembers().subscribe(val=>{
      this.members = val;
      this.allNames = this.members.map(member=>member.name)
      console.log(this.allNames,'allNames')
    })
  }

  get instruments(): FormArray {
    return this.instrumentForm.get('instruments') as FormArray;
  }

  // Method to handle form submission
  onSubmit(): void {
    const currentName = this.instrumentForm.value.name;
    const nameExists = this.allNames.some(name => name.toLowerCase() === currentName.toLowerCase());
  
    if (nameExists) {
      this.toast.error('Name already exists, please choose another name');
      return;
    }

    if (this.instrumentForm.valid) {
      this.instrumentForm.value.instruments = this.instrumentForm.value.instruments.filter((instrument:string)=>instrument!==null && instrument!=='')
      this.ms.addMember(this.instrumentForm.value).then(()=>{
        this.toast.success('Member successfully added');
        this.instrumentForm.reset();
      })
    } else {
      console.log('Form is invalid');
    }
  }
}
