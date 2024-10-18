import { Component } from '@angular/core';
import { MembersService } from '../services/members.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-inactive-members',
  templateUrl: './inactive-members.component.html',
  styleUrl: './inactive-members.component.css'
})
export class InactiveMembersComponent {
  inactive: any;
  currentMemberId: string = '';
  noMembers: boolean = false;

  constructor(
    private ms: MembersService,
    private toast: ToastrService,
  ){}

  ngOnInit(): void{
    this.ms.getInactiveMembers().subscribe(val=>{
      this.inactive = val
      if(this.inactive.length==0){
        this.noMembers = true;
      }
    })
  }

  setMember(i:number){
    this.currentMemberId = this.inactive[i].id;
  }

  makeActive(i:number){
    const currentId = this.inactive[i].id
    console.log(currentId)
    this.ms.moveToActive(currentId)
    this.toast.success('Member now active')
  }

  delete(){
    this.ms.deleteInactive(this.currentMemberId)
    this.toast.success('Member successfully deleted')
  }
}
