<script lang="ts">
  import Seat from "$lib/Seat.svelte";
  import BetTable from "$lib/BetTable.svelte";
  import GameGrid from "$lib/GameGrid.svelte";

  import { sc_instance } from "$lib/stores.js";

  import {writable} from "svelte/store";
  import {setContext} from "svelte";

  let refreshId;

  let index: number;
  let totalStake: bigint = 0;

  let playerOnePlaceHolder = "Player name";
  let playerOneJoined = false;
  let playerTwoPlaceHolder = "Player name";
  let playerTwoJoined = false;

  let gamblersPlayerOne;
  let gamblersPlayerTwo;

  let gameName;
  let gameState;
  let playerTurn;
  let grid = new Array(9);

  const errorOccurred = writable('false');
  setContext('errorOccurred', errorOccurred)

  const errorMessage = writable('Error');
  setContext('errorMessage', errorMessage)

  sc_instance.subscribe(value => {
    index = Number(value);
  });

  refreshId = setInterval(getState, 5000);

  function getState() {
    concordiumHelpers.detectConcordiumProvider()
      .then((provider) => {
        provider.getJsonRpcClient().invokeContract({
          method: `tictactoebet.view`,
          contract: { index: index, subindex: 0n }
        })
          .then((view_state) => {
            let rawContractState = concordiumSDK.toBuffer(view_state.returnValue, "hex");

            let offset = 0;
            [totalStake, offset] = parseAmount(rawContractState, offset);

            let playerOneName;
            [playerOneName, offset] = parseString(rawContractState, offset);

            if (playerOneName.length > 0) {
              playerOnePlaceHolder = playerOneName;
              playerOneJoined = true;
            }

            let playerTwoName;
            [playerTwoName, offset] = parseString(rawContractState, offset);

            if (playerTwoName.length > 0) {
              playerTwoPlaceHolder = playerTwoName;
              playerTwoJoined = true;
            }

            [gamblersPlayerOne, offset] = parseGamblers(rawContractState, offset);

            [gamblersPlayerTwo, offset] = parseGamblers(rawContractState, offset);

            [gameName, offset] = parseString(rawContractState, offset);

            [gameState, offset] = parseString(rawContractState, offset);

            playerTurn = rawContractState.readUInt8(offset)
            offset += 1;

            let array_size = rawContractState.readUInt16LE(offset);// Array length
            offset += 4; //  Offset with 4 bytes for the length

            for (let i = 0; i < array_size; i++) {
              grid[i] = rawContractState.readUInt8(offset);
              offset += 1;
            }
          })
          .catch((error) => {
            console.log(error);
            $errorOccurred = 'true';
            $errorMessage = error;
          });
      });
  }

  function parseGamblers(buffer, offset) {
    let array_size = buffer.readUInt16LE(offset);// Array length
    offset += 4; //  Offset with 4 bytes for the length
    let gamblers = new Array(array_size);

    for (let i = 0; i < array_size; i++) {
      let name;
      [name, offset] = parseString(buffer, offset);

      let amount = 0;
      [amount, offset] = parseAmount(buffer, offset);

      gamblers[i] = [name, amount];
    }

    return [gamblers, offset];
  }

  function parseAmount(buffer, offset) {
    let amount = buffer.readBigUInt64LE(offset);
    offset += 8;

    return [amount, offset];
  }

  function parseString(buffer, offset) {
    let stringLength = buffer.readUInt32LE(offset);
    offset += 4; //  Offset with 4 bytes for the length
    let string = buffer.slice(offset, offset + stringLength).toString("utf8");
    offset += stringLength; // Offset with length bytes for the actual string
    return [string, offset];
  }

  getState();
</script>

<section>
  <div class="alert alert-success shadow-lg mb-5" class:hidden={gameState !== 'Finished'}>
    <div>
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <span>Game finished</span>
    </div>
  </div>

  <div class="alert alert-error shadow-lg mb-5" class:hidden={$errorOccurred === 'false'}>
    <div>
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <span>{errorMessage}</span>
    </div>
  </div>

  <div class="flex flex-col">
    <div class="flex flew-row self-center">
      <div class="stats shadow mb-8 ">
        <div class="stat">
          <div class="stat-title">At stake</div>
          <div class="stat-value">{totalStake} &micro;CCD</div>
          <div class="stat-desc">Game index {index}</div>
        </div>
      </div>
    </div>

    <div class="flex flew-row">
      <div class="flex flex-col mr-10">
        <Seat name={playerOnePlaceHolder} joined={playerOneJoined} isMyTurn={playerTurn === 1}></Seat>
        <BetTable gamblers={gamblersPlayerOne} playerPosition="1"></BetTable>
      </div>

      <GameGrid grid={grid}></GameGrid>

      <div class="flex flex-col ml-10">
        <Seat name={playerTwoPlaceHolder} joined={playerTwoJoined} isMyTurn={playerTurn === 2}></Seat>
        <BetTable gamblers="" playerPosition="2"></BetTable>
      </div>

    </div>
  </div>
</section>

<style>
    section {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        flex: 1;
    }
</style>
