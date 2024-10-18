import { Component } from '@angular/core';
import { MembersService } from '../services/members.service';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-manage-members',
  templateUrl: './manage-members.component.html',
  styleUrl: './manage-members.component.css'
})
export class ManageMembersComponent {

  allmembers: any

  constructor(
    private ms: MembersService,
    private router: Router
  ){}

  ngOnInit(): void{
    this.ms.getMembers().subscribe(val=>{
      this.allmembers = val

    })
  }

  getValidInstruments(member: any) {
    return member.instruments.filter((instrument: any) => instrument !== null && instrument !== '');
  }

  editMember(i:number){
    this.router.navigate(['edit',i]);
  }
  
}
