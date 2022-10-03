<script lang="ts">
  import { sc_instance } from "$lib/stores.js";
  import { getContext } from "svelte";

  export let gamblers = [];
  export let playerPosition;
  let amount;
  let gamblerName;
  let index;

  let position;
  let joinInProgress = false;
  let previousLength = 0;

  sc_instance.subscribe(value => {
    index = value;
  });

  const errorOccurred = getContext("errorOccurred");
  const errorMessage = getContext("errorMessage");

  $: {
    if (gamblers.length != previousLength){
      joinInProgress = false;
      gamblerName = undefined;
      amount = undefined;
    }
  }

  previousLength = gamblers.length;

  function bet() {
    joinInProgress = true;

    if (playerPosition == 1) {
      position = 1;
    } else if (playerPosition == 2) {
      position = 2;
    }

    concordiumHelpers.detectConcordiumProvider()
      .then((provider) => {
        provider
          .connect()
          .catch((error) => {
            console.log(error);
            $errorOccurred = 'true';
            $errorMessage = error.toString();
          })
          .then((acc) => {
            provider.sendTransaction(
              acc,
              concordiumSDK.AccountTransactionType.UpdateSmartContractInstance,
              {
                amount: new concordiumSDK.GtuAmount(amount),
                contractAddress: {
                  index: index,
                  subindex: 0n
                },
                receiveName: "tictactoebet.bet",
                maxContractExecutionEnergy: 30000n
              } as concordiumSDK.AccountTransactionPayload,
              {
                name: gamblerName,
                player_to_bet_on: position
              },
              "//8CAQAAAAwAAAB0aWN0YWN0b2ViZXQBABQAAgAAAAkAAABnYW1lX25hbWUWAgMAAABlbmQNBAAAAAMAAABiZXQEFAACAAAABAAAAG5hbWUWAhAAAABwbGF5ZXJfdG9fYmV0X29uAhUGAAAACwAAAE9ubHlBY2NvdW50AgoAAABCZXRUb29MYXRlAgkAAABCZXRDbG9zZWQCCgAAAEFscmVhZHlCZXQCEAAAAEludmFsaWRQYXJhbWV0ZXICCgAAAFBhcnNlRXJyb3ICBAAAAGpvaW4EFAABAAAABAAAAG5hbWUWAhUFAAAACwAAAE9ubHlBY2NvdW50AgkAAABMb2JieUZ1bGwCDgAAAEFscmVhZHlBUGxheWVyAhAAAABNaXNzaW5nUGFyYW1ldGVyAgoAAABQYXJzZUVycm9yAgQAAABtYXJrBBQAAgAAAAgAAABwb3NpdGlvbgIGAAAAcGxheWVyCxUHAAAACgAAAFBhcnNlRXJyb3ICEAAAAFdhaXRpbmdGb3JQbGF5ZXICCgAAAE5vdEFQbGF5ZXICCwAAAE5vdFlvdXJUdXJuAgkAAABDZWxsVGFrZW4CDQAAAFRyYW5zZmVyRXJyb3ICCwAAAEdhbWVFeHBpcmVkAgQAAAB2aWV3ARQACQAAAAUAAABzdGFrZQoPAAAAcGxheWVyX29uZV9uYW1lFgIPAAAAcGxheWVyX3R3b19uYW1lFgIPAAAAYmV0c19wbGF5ZXJfb25lEAIPFgIKDwAAAGJldHNfcGxheWVyX3R3bxACDxYCCgkAAABnYW1lX25hbWUWAgoAAABnYW1lX3N0YXRlFgILAAAAcGxheWVyX3R1cm4CBAAAAGdyaWQQAgI="
            ).then((response) => {
              console.log(response);
              return true;
            }).catch((error) => {
              console.log(error);
              $errorOccurred = "true";
              $errorMessage = error.toString();
              return false;
            });
          });
      }).catch((error) => {
        console.log(error);
        $errorOccurred = "true";
        $errorMessage = error.toString();
        return false;
    }).catch((error) => {
      console.log(error);
      $errorOccurred = "true";
      $errorMessage = error;
    });

    return false;
  }
</script>


<div class="flex flex-col mt-10">
  <div class="form-control">
    <div class="input-group">
      <input style="width: 130px" type="text" placeholder="Name" bind:value={gamblerName}
             class="input input-bordered" />
      <input style="width: 160px" type="text" placeholder="amount of &micro;CCD" bind:value={amount}
             class="input input-bordered" />
      <button on:click={bet} class="btn btn-square" class:loading={joinInProgress}>Bet</button>
    </div>

  </div>
  <div class="overflow-x-auto">
    <table class="table w-full mt-5 table-compact">
      <thead>
      <tr>
        <th>Name</th>
        <th>Amount</th>
      </tr>
      </thead>
      <tbody>
      {#each gamblers as gambler}
        <tr>
          <th>{gambler[0]}</th>
          <td>{gambler[1]}</td>
        </tr>
      {/each}
      </tbody>
    </table>
  </div>
</div>
