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
    console.log(this.players)
    this.assignedInstruments = this.assignInstruments(this.players, this.gigType);
  }

  showDiv(){
    this.show = true;
    this.assignedInstruments = this.assignInstruments(this.players, this.gigType);
  }

  
  // Main function to handle assignment of instruments
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

    // Step 2: Assign one player to "Rep-Leader" based on priority
    if (assigned["Rep-Leader"].length === 0) {
      const sortedRepLeaders = this.getSortedPlayersForInstrument(unassignedPlayers, "Rep-Leader");
      if (sortedRepLeaders.length > 0) {
        const repLeaderPlayer = sortedRepLeaders[0]; // Select the highest-priority player
        assigned["Rep-Leader"].push(repLeaderPlayer.name);
        unassignedPlayers.splice(unassignedPlayers.indexOf(repLeaderPlayer), 1);
      }
    }

    // Step 3: Assign Marking players based on gig type and player count, with priority
    const sortedMarkingPlayers = this.getSortedPlayersForInstrument(unassignedPlayers, "Marking");
    const markingPlayersToAssign = sortedMarkingPlayers.slice(0, markingTarget); // Select required number based on priority
    markingPlayersToAssign.forEach(player => {
      assigned["Marking"].push(player.name);
      unassignedPlayers.splice(unassignedPlayers.indexOf(player), 1);
    });

    // Step 4: Distribute remaining players across Caixa, Timbal, Rep, and Roller
    this.distributeRemaining(unassignedPlayers, assigned);

     // Final Step: Fallback for any unassigned players
     this.assignFallback(unassignedPlayers, assigned);

    return assigned;
  }

  // Determines the number of Marking players needed based on gig type and player count
  determineMarkingCount(gigType: string, playerCount: number): number {
    if (gigType === "Standing" && playerCount < 20) return 1;
    if (gigType === "Procession" && playerCount > 20) return 4;
    return 2;
  }

  // Sort players by their preference order for a specific instrument
  getSortedPlayersForInstrument(players: Player[], instrument: string): Player[] {
    return players
      .filter(player => player.instruments.includes(instrument)) // Only include players who can play the instrument
      .sort((a, b) => a.instruments.indexOf(instrument) - b.instruments.indexOf(instrument)); // Sort by position of instrument in the list
  }

  // Assigns remaining players to Caixa, Timbal, Rep, and Roller, balancing Thirds for Rollers
  distributeRemaining(players: Player[], assigned: AssignedInstruments) {
    const primaryInstruments = ["Caixa", "Timbal", "Rep", "Roller"];

    // Iterate through each primary instrument, filling slots based on player priority
    primaryInstruments.forEach(instrument => {
      // Get unassigned players sorted by their preference for this instrument
      const sortedPlayers = this.getSortedPlayersForInstrument(players, instrument);

      // Fill up minimum required players (e.g., 2 for each) with players who prioritize this instrument
      while (assigned[instrument].length < 2 && sortedPlayers.length > 0) {
        const player = sortedPlayers.shift()!; // Get the highest-priority player
        assigned[instrument].push(player.name);
        players.splice(players.indexOf(player), 1); // Remove from unassigned

        // Check Third-Roller balance after adding to Roller
        if (instrument === "Roller") {
          this.balanceThirdsWithRollers(assigned);
        }
      }
    });

    // Assign remaining players to their highest-preference primary instrument, respecting Third-Roller rule
    players.forEach(player => {
      for (let instrument of primaryInstruments) {
        if (player.instruments.includes(instrument)) {
          assigned[instrument].push(player.name);
          players.splice(players.indexOf(player), 1); // Remove from unassigned

          // Check Third-Roller balance
          if (instrument === "Roller") {
            this.balanceThirdsWithRollers(assigned);
          }
          break; // Assign only one instrument per player
        }
      }
    });
  }

  // 1. Track unassigned players and possible reassignments for flexibility
assignFallback(players: Player[], assigned: AssignedInstruments) {
  // Track unassigned players and initialize a reassignable map
  const unassignedPlayers: Player[] = [];
  const reassignable = new Map<string, string>(); // player -> original instrument assigned

  // Try initial fallback assignment
  players.forEach(player => {
    const fallbackInstrument = player.instruments.find(inst => {
      if (inst === "Marking" || inst === "Rep-Leader") return false; 
      if (inst === "Third" && !this.isThirdAssignmentPossible(assigned)) return false;
      return !assigned[inst].includes(player.name);
    });

    if (fallbackInstrument) {
      assigned[fallbackInstrument].push(player.name);
      reassignable.set(player.name, fallbackInstrument);
    } else {
      unassignedPlayers.push(player);
    }
  });

  // If players remain unassigned, try to reassign
  unassignedPlayers.forEach(unassignedPlayer => {
    this.reassignToMakeRoom(unassignedPlayer, assigned, reassignable);
  });
}

// 2. Helper to check if Third assignment is balanced with Roller count
isThirdAssignmentPossible(assigned: AssignedInstruments): boolean {
  const rollerCount = assigned["Roller"].length;
  const requiredThirds = Math.ceil(rollerCount / 3);
  return assigned["Third"].length < requiredThirds;
}

// 3. Reassign already-assigned players if it allows unassigned player to receive an instrument
reassignToMakeRoom(unassignedPlayer: Player, assigned: AssignedInstruments, reassignable: Map<string, string>) {
  for (const instrument of unassignedPlayer.instruments) {
    // Skip restricted instruments or if the instrument has the unassigned player already
    if (instrument === "Marking" || instrument === "Rep-Leader" || assigned[instrument].includes(unassignedPlayer.name)) continue;

    // Check if the instrument can have the current unassigned player
    const assignedPlayers = assigned[instrument];
    if (assignedPlayers.length > 0) {
      const currentHolder = assignedPlayers[0];
      const originalInstrument = reassignable.get(currentHolder);

      // Try to find a new assignment for currentHolder, if not the original instrument
      if (originalInstrument && currentHolder !== unassignedPlayer.name) {
        const reassigned = this.tryReassign(currentHolder, assigned, reassignable);
        
        if (reassigned) {
          // Successful reassign: assign the unassigned player to the freed instrument
          assigned[instrument] = assigned[instrument].filter(p => p !== currentHolder);
          assigned[instrument].push(unassignedPlayer.name);
          reassignable.set(unassignedPlayer.name, instrument);
          return true;
        }
      }
    }
  }
  return false
}

// 4. Try reassigning a player to their next preference if it helps assign another player
tryReassign(playerName: string, assigned: AssignedInstruments, reassignable: Map<string, string>): boolean {
  const playerInstruments = Array.from(reassignable.entries()).find(([name]) => name === playerName)?.[1] || [];

  for (const newInstrument of playerInstruments) {
    if (newInstrument !== "Marking" && newInstrument !== "Rep-Leader" && !assigned[newInstrument].includes(playerName)) {
      // Reassign to new instrument if available
      assigned[newInstrument].push(playerName);
      reassignable.set(playerName, newInstrument);
      return true;
    }
  }
  return false;
}


  // // Assign a fallback instrument to any remaining unassigned players
  // assignFallback(players: Player[], assigned: AssignedInstruments) {
  //   players.forEach(player => {
  //     // Recalculate the Roller and Third counts as we assign players
  //     const rollerCount = assigned["Roller"].length;
  //     const requiredThirds = Math.ceil(rollerCount / 3);
  
  //     // Try to find a fallback instrument that respects the conditions
  //     const fallbackInstrument = player.instruments.find(inst => {
  //       // Skip "Marking" and "Rep-Leader" always
  //       if (inst === "Marking" || inst === "Rep-Leader") return false;
  //       // Only allow "Third" if there is a shortage of Third players based on Roller count
  //       if (inst === "Third" && assigned["Third"].length >= requiredThirds) return false;
  //       return true;
  //     });
  
  //     // Assign fallback instrument if found, otherwise log unassigned player
  //     if (fallbackInstrument) {
  //       assigned[fallbackInstrument].push(player.name);
  //       console.log(player.name, ' added in fallback')
  //       // After assigning to Roller, recheck Third requirements if Roller was added
  //       if (fallbackInstrument === "Roller") {
  //         console.log(player.name, 'entering balance rollers/thirds')
  //         this.ensureThirdBalance(assigned);
  //       }
  //     } else {
  //       console.log(`Unassigned player: ${player.name} who plays ${player.instruments}`);
  //     }
  //   });
  // }
  
  // // Ensure Third balance whenever a Roller is added
  // ensureThirdBalance(assigned: AssignedInstruments) {
  //   const rollerCount = assigned["Roller"].length;
  //   const requiredThirds = Math.ceil(rollerCount / 3);
    
  //   while (assigned["Third"].length < requiredThirds) {
  //     // Check if there is any player who can be added to Third and hasn't been assigned elsewhere
  //     const availableThirdPlayer = assigned["Third"].find(player => {
  //       return !assigned["Third"].includes(player);
  //     });
  
  //     if (!availableThirdPlayer) break; // No unassigned player available for Third
  //     assigned["Third"].push(availableThirdPlayer);
  //   }
  // }

  // For every three Rollers, assign a Third if available
  balanceThirdsWithRollers(assigned: AssignedInstruments) {
    const rollerCount = assigned["Roller"].length;
    const requiredThirds = Math.ceil(rollerCount / 3); // Calculate required Third players

    // Get players who can play Third but haven't been assigned yet
    const unassignedThirds = this.getSortedPlayersForInstrument(this.players, "Third")
      .filter(player => !Object.values(assigned).flat().includes(player.name)); // Only include unassigned players

    // Assign as many Thirds as needed and available
    while (assigned["Third"].length < requiredThirds && unassignedThirds.length > 0) {
      const thirdPlayer = unassignedThirds.shift()!;
      assigned["Third"].push(thirdPlayer.name);
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



