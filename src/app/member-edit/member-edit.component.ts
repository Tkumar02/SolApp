import { Component } from '@angular/core';
import { Router, Route, ActivatedRoute } from '@angular/router';
import { MembersService } from '../services/members.service';
import { InstrumentsService } from '../services/instruments.service';
import { AddInstrumentComponent } from '../add-instrument/add-instrument.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-member-edit',
  templateUrl: './member-edit.component.html',
  styleUrl: './member-edit.component.css'
})
export class MemberEditComponent {
  memberId:string;
  memberData:any;
  show:boolean;
  allInstruments: any;
  new: string;
  newInstrumentList: Array<string>;

  constructor(
    private route:ActivatedRoute,
    private router: Router,
    private ms:MembersService,
    private is:InstrumentsService,
    private toast:ToastrService,
  ){}

  ngOnInit(): void{
    this.memberId = this.route.snapshot.paramMap.get('id')
    this.ms.getMember(this.memberId).subscribe(val=>{
      this.memberData = val
      this.memberData.instruments = this.memberData.instruments.filter((instrument: any) => instrument !== null && instrument !== '')
    })

    this.is.getAllInstruments().subscribe(val=>{
      this.allInstruments = val;
    })
  }
  
  addInstrument(){
    if(!this.memberData.instruments.includes(this.new)&&this.new){
      this.memberData.instruments.push(this.new)
      this.ms.updateInstruments(this.memberId, this.memberData.instruments)
      this.show = false;
    }
    else{
      this.toast.error('Instrument already exists')
    }
  }

  deleteInstrument(i:number){
    const selectedInstrument = this.memberData.instruments[i];
    const index = this.memberData.instruments.indexOf(selectedInstrument);
    this.memberData.instruments.splice(index,1)
    this.newInstrumentList = this.memberData.instruments.copyWithin(-1,-1)
    this.ms.updateInstruments(this.memberId,this.memberData.instruments)
  }

  deleteMember(){
    this.ms.deleteMember(this.memberId)
    this.toast.success('Member has been successfully deleted')
    this.router.navigate(['members'])
  }

  inactive(){
    this.ms.addInactiveMember(this.memberData,this.memberData.id)
    this.ms.deleteMember(this.memberId)
    this.toast.success('Member has been marked as inactive')
    this.router.navigate(['members'])
  }
}
