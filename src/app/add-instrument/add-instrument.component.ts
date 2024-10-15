import { Component } from '@angular/core';
import { InstrumentsService } from '../services/instruments.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-instrument',
  templateUrl: './add-instrument.component.html',
  styleUrl: './add-instrument.component.css'
})
export class AddInstrumentComponent {
  instrumentBox: boolean = false;
  newInstrument: string = '';
  allInstruments: any;

  constructor(private is:InstrumentsService, private toast: ToastrService){}

  ngOnInit(): void{
    this.is.getAllInstruments().subscribe(val=>{
      this.allInstruments = val;
      console.log(this.allInstruments)
    })
  }

  confirmInstrument(){
    this.is.addInstrument(this.newInstrument)
    this.newInstrument = '';
    this.instrumentBox = false;
    this.toast.success('Updated Instrument List')
  }

  deleteInstrument(i:number){
    const id = this.allInstruments[i].id
    this.is.deleteInstrument(id)
  }
}
