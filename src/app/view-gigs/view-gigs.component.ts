import { Component } from '@angular/core';
import { GigsService } from '../services/gigs.service';

@Component({
  selector: 'app-view-gigs',
  templateUrl: './view-gigs.component.html',
  styleUrl: './view-gigs.component.css'
})
export class ViewGigsComponent {

  allGigs: any;

  constructor(
    private gs: GigsService
  ){}

  ngOnInit(): void{
    this.gs.getGigs().subscribe(val=>{
      this.allGigs = val
      console.log(this.allGigs)
    })
  }

  deleteGig(id:string){
    this.gs.deleteGig(id)
  }

}
