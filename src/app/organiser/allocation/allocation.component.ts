import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { GigsService } from '../../services/gigs.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

interface Player {
  name: string;
  instruments: string[];
}

interface AssignedInstruments {
  [instrument: string]: string[];
}

declare var bootstrap: any;

@Component({
  selector: 'app-allocation',
  templateUrl: './allocation.component.html',
  styleUrls: ['./allocation.component.css']
})
export class AllocationComponent implements OnInit {

  @Input() players: Array<Player> = []; // Ensure default empty array to avoid undefined issues
  @Input() gigType!: string; // Marking gigType as required (non-null)
  @Input() gigDate: Date;
  @Input() gigName: string;
  
  assignedInstruments: AssignedInstruments = {}; // Store assigned instruments here
  show: boolean = false;
  selectedPlayer: { name: string; currentInstrument: string } | null = null;
  selectedInstrument: string = '';
  availableInstruments: string[] = []; // Instruments player can actually play

  @ViewChild('reassignModal') reassignModal!: ElementRef;

  constructor(
    private gs: GigsService,
    private toast: ToastrService,
    private route: Router,
  ) {}

  ngOnInit(): void {
    // Call assignInstruments during initialization to populate assignedInstruments
    console.log(this.players.length)
    this.assignedInstruments = this.assignInstruments(this.players, this.gigType);
  }

  showDiv(){
    this.show = true;
    this.assignedInstruments = this.assignInstruments(this.players, this.gigType);
  }

  assignInstruments(players: Player[], gigType: string): AssignedInstruments {
    const assigned: AssignedInstruments = {
      Shaker: [],
      Roller: [],
      Timbal: [],
      Caixa: [],
      "Rep-Leader": [],
      Rep: [],
      Third: [],
      Marking: []
    };

    const markingTarget = this.determineMarkingCount(gigType, players.length);
    const unassignedPlayers = players.slice(); // Copy players array for further processing

    // Step 1: Assign single-instrument players
    for (let i = unassignedPlayers.length - 1; i >= 0; i--) {
      const player = unassignedPlayers[i];
      if (player.instruments.length === 1) {
        const instrument = player.instruments[0];
        assigned[instrument].push(player.name);
        unassignedPlayers.splice(i, 1); // Remove from unassigned
      }
    }

    // Step 2: Assign one player to "Rep-Leader" if not assigned
    if (assigned["Rep-Leader"].length === 0) {
      const repLeaderPlayer = unassignedPlayers.find(p => p.instruments.includes("Rep-Leader"));
      if (repLeaderPlayer) {
        assigned["Rep-Leader"].push(repLeaderPlayer.name);
        unassignedPlayers.splice(unassignedPlayers.indexOf(repLeaderPlayer), 1);
      }
    }

    // Step 3: Assign Marking instrument based on gig type and player count
    this.assignMarking(unassignedPlayers, assigned, markingTarget);

    // Step 4: Distribute remaining players across Caixa, Timbal, Rep, and Roller
    this.distributeRemaining(unassignedPlayers, assigned);

    return assigned; // Return assigned object
  }

  determineMarkingCount(gigType: string, playerCount: number): number {
    if (gigType === "Standing" && playerCount < 20) return 1;
    if (gigType === "Procession" && playerCount > 20) return 4;
    return 2;
  }

  assignMarking(players: Player[], assigned: AssignedInstruments, markingTarget: number) {
    const markingPlayers = players.filter(p => p.instruments.includes("Marking"));
    const toAssign = markingPlayers.slice(0, markingTarget - assigned["Marking"].length);

    toAssign.forEach(player => {
      assigned["Marking"].push(player.name);
      players.splice(players.indexOf(player), 1);
    });
  }

  distributeRemaining(players: Player[], assigned: AssignedInstruments) {
    const primaryInstruments = ["Caixa", "Timbal", "Rep", "Roller"];

    primaryInstruments.forEach(instrument => {
      while (assigned[instrument].length < 2) {
        const player = players.find(p => p.instruments.includes(instrument));
        if (!player) break;

        assigned[instrument].push(player.name);
        players.splice(players.indexOf(player), 1);

        this.balanceThirdsWithRollers(assigned);
      }
    });

    players.forEach(player => {
      for (let instrument of primaryInstruments) {
        if (player.instruments.includes(instrument)) {
          assigned[instrument].push(player.name);
          this.balanceThirdsWithRollers(assigned);
          break;
        }
      }
    });
  }

  balanceThirdsWithRollers(assigned: AssignedInstruments) {
    const rollerCount = assigned["Roller"].length;
    const requiredThirds = Math.floor(rollerCount / 3);

    while (assigned["Third"].length < requiredThirds) {
      const thirdPlayer = assigned["Third"].find(p => !assigned["Third"].includes(p));
      if (!thirdPlayer) break;
      assigned["Third"].push(thirdPlayer);
    }
  }

  getInstrumentNames(): string[] {
    return Object.keys(this.assignedInstruments);
  }

  // Triggered when the user clicks "Reassign" next to a player's name
  onReassignClick(player: string, currentInstrument: string) {
    //this.selectedPlayer = { name: player, currentInstrument };
    //this.selectedInstrument = ''; // Reset the selected instrument for the form

    const playerDetails = this.players.find(p => p.name === player);

    if (playerDetails) {
      this.selectedPlayer = { name: player, currentInstrument };
      this.availableInstruments = playerDetails.instruments; // Set available instruments
      this.selectedInstrument = ''; // Reset selected instrument
    }
  }

  // Open the modal for reassignment
  openReassignModal(player: string, currentInstrument: string) {
    this.selectedPlayer = { name: player, currentInstrument };
    this.selectedInstrument = ''; // Reset selection

    const modal = new bootstrap.Modal(this.reassignModal.nativeElement);
    modal.show();
  }

  // Finalizes the reassignment
  confirmReassignment() {
    if (this.selectedPlayer && this.selectedInstrument) {
      const { name, currentInstrument } = this.selectedPlayer;

      // Remove player from current instrument
      this.assignedInstruments[currentInstrument] = this.assignedInstruments[currentInstrument].filter(
        playerName => playerName !== name
      );

      // Add player to new instrument
      this.assignedInstruments[this.selectedInstrument].push(name);

      // Reset selection and close form
      this.selectedPlayer = null;
      this.selectedInstrument = '';
    }
  }

  // Cancels the reassignment process
  cancelReassignment() {
    this.selectedPlayer = null;
    this.selectedInstrument = '';
  }

  submit(){
    if(!this.gigDate || !this.gigName){
      this.toast.error('Please ensure Gig date and name is completed before submitting');
      return;
    }
    const form = {
      date: this.gigDate,
      name: this.gigName,
      type:this.gigType,
      allocations: this.assignedInstruments
    }
    
    console.log(this.assignedInstruments)
    this.gs.addGig(form)
    this.toast.success('Gig successfully submitted')
    this.route.navigate(['view'])
  }
}



