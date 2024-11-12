import { Component, Input, OnInit } from '@angular/core';

interface Player {
  name: string;
  instruments: string[];
}

interface AssignedInstruments {
  [instrument: string]: string[];
}

@Component({
  selector: 'app-allocation',
  templateUrl: './allocation.component.html',
  styleUrls: ['./allocation.component.css']
})
export class AllocationComponent implements OnInit {

  @Input() players: Array<Player> = []; // Ensure default empty array to avoid undefined issues
  @Input() gigType!: string; // Marking gigType as required (non-null)
  
  assignedInstruments: AssignedInstruments = {}; // Store assigned instruments here
  show: boolean = false;

  constructor() {}

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

  submit(){
    console.log(this.assignInstruments)
  }
}





// import { Component, Input, OnInit } from '@angular/core';

// interface Player {
//   id: string;
//   name: string;
//   instruments: string[];
// }

// interface AssignedInstruments {
//   [instrument: string]: Player[];
// }

// @Component({
//   selector: 'app-allocation',
//   templateUrl: './allocation.component.html',
//   styleUrls: ['./allocation.component.css']
// })
// export class AllocationComponent implements OnInit {

//   @Input() players: Array<Player> = []; // Ensure default empty array to avoid undefined issues
//   @Input() gigType: string;
//   assignments: AssignedInstruments = {}; // Store assigned instruments here
//   show: boolean = false;

//   constructor() {}

//   ngOnInit(): void {
//     // Can optionally add initialization here if needed
//   }

//   assignInstruments(): void {
//     this.show = true;
//     const setType = this.gigType
//     let players = [...this.players]
//     const assigned: AssignedInstruments = {
//       Marking: [],
//       Timbal: [],
//       Caixa: [],
//       Roller: [],
//       Rep: [],
//       'Rep-Leader': [],
//       Third: [],
//       Shaker: []
//     };

//     // Step 1: Assign players with only one instrument choice
//     players.forEach(player => {
//       if (player.instruments.length === 1) {
//         const instrument = player.instruments[0];
//         assigned[instrument].push(player);
//         console.log('START',assigned,'HERE')
//       }
//     });

//     // Filter out assigned players from the main list
//     players = players.filter(player => player.instruments.length > 1 || assigned[player.instruments[0]].includes(player));

//     // Step 2: Assign one `rep-leader` if available
//     const repLeaders = players.filter(player => player.instruments.includes('Rep-Leader'));
//     if (repLeaders.length > 0 && assigned['Rep-Leader'].length<1) {
//       const chosenRepLeader = repLeaders[0];
//       assigned['Rep-Leader'].push(chosenRepLeader);
//       players = players.filter(player => player.id !== chosenRepLeader.id);
//     }

//     // Step 3: Assign `marking` instruments based on set type
//     const markingCount = (setType == 'Procession' && players.length > 20) 
//     ? 4 
//     : (setType == 'Standing' && players.length < 20) 
//     ? 1 
//     : 2;
//     const markingPlayers = players.filter(player => player.instruments.includes('Marking')).slice(0, markingCount);
//     markingPlayers.forEach(player => {
//       assigned['Marking'].push(player);
//       players = players.filter(p => p.id !== player.id);
//     });

//     // Step 4: Assign players who now have only one remaining instrument option
//     players.forEach(player => {
//       const remainingInstruments = player.instruments.filter(instr => !assigned[instr].includes(player));
//       if (remainingInstruments.length === 1) {
//         const instrument = remainingInstruments[0];
//         assigned[instrument].push(player);
//       }
//     });

//     // Filter again after assigning players with only one option left
//     players = players.filter(player => !Object.values(assigned).some(group => group.includes(player)));

//     // Step 5: For every three `roller` players, assign one `third` (if possible)
//     let rollerCount = players.filter(player => player.instruments.includes('Roller')).length;
//     let thirdCount = Math.floor(rollerCount / 3);
//     const rollerPlayers = players.filter(player => player.instruments.includes('Roller')).slice(0, rollerCount);
//     const thirdPlayers = players.filter(player => player.instruments.includes('Third')).slice(0, thirdCount);

//     rollerPlayers.forEach(player => {
//       assigned['Roller'].push(player);
//       players = players.filter(p => p.id !== player.id);
//     });
//     thirdPlayers.forEach(player => {
//       assigned['Third'].push(player);
//       players = players.filter(p => p.id !== player.id);
//     });

//     // Step 6: Distribute remaining players evenly across other instruments
//     const remainingInstruments = ['Timbal', 'Caixa', 'Rep'];
//     players.forEach((player) => {
//       for (let instrument of remainingInstruments) {
//         if (player.instruments.includes(instrument) && assigned[instrument].length <= assigned['Marking'].length) {
//           assigned[instrument].push(player);
//           break;
//         }
//       }
//     });

//     // Store the final assignments in the component property
//     this.assignments = assigned;
//   }
// }
