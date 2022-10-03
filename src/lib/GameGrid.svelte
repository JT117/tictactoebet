<script lang="ts">
  import {sc_instance} from '$lib/stores.js'
  import { getContext } from "svelte";

  let index;
  sc_instance.subscribe(value => {
    index = value;
  });

  export let grid = [0,0,0,0,0,0,0,0,0];

  const errorOccurred = getContext('errorOccurred');
  const errorMessage = getContext('errorMessage');

  function handleClick(i){
    concordiumHelpers.detectConcordiumProvider()
      .then((provider) => {
        provider
          .connect()
          .then((acc) => {
            provider.sendTransaction(
              acc,
              concordiumSDK.AccountTransactionType.UpdateSmartContractInstance,
              {
                amount: new concordiumSDK.GtuAmount(0n),
                contractAddress: {
                  index: index,
                  subindex: 0n,
                },
                receiveName: 'tictactoebet.mark',
                maxContractExecutionEnergy: 30000n,
              } as concordiumSDK.AccountTransactionPayload,
              {
                position: i,
                player: acc
              },
              '//8CAQAAAAwAAAB0aWN0YWN0b2ViZXQBABQAAgAAAAkAAABnYW1lX25hbWUWAgMAAABlbmQNBAAAAAMAAABiZXQEFAACAAAABAAAAG5hbWUWAhAAAABwbGF5ZXJfdG9fYmV0X29uAhUGAAAACwAAAE9ubHlBY2NvdW50AgoAAABCZXRUb29MYXRlAgkAAABCZXRDbG9zZWQCCgAAAEFscmVhZHlCZXQCEAAAAEludmFsaWRQYXJhbWV0ZXICCgAAAFBhcnNlRXJyb3ICBAAAAGpvaW4EFAABAAAABAAAAG5hbWUWAhUFAAAACwAAAE9ubHlBY2NvdW50AgkAAABMb2JieUZ1bGwCDgAAAEFscmVhZHlBUGxheWVyAhAAAABNaXNzaW5nUGFyYW1ldGVyAgoAAABQYXJzZUVycm9yAgQAAABtYXJrBBQAAgAAAAgAAABwb3NpdGlvbgIGAAAAcGxheWVyCxUHAAAACgAAAFBhcnNlRXJyb3ICEAAAAFdhaXRpbmdGb3JQbGF5ZXICCgAAAE5vdEFQbGF5ZXICCwAAAE5vdFlvdXJUdXJuAgkAAABDZWxsVGFrZW4CDQAAAFRyYW5zZmVyRXJyb3ICCwAAAEdhbWVFeHBpcmVkAgQAAAB2aWV3ARQACQAAAAUAAABzdGFrZQoPAAAAcGxheWVyX29uZV9uYW1lFgIPAAAAcGxheWVyX3R3b19uYW1lFgIPAAAAYmV0c19wbGF5ZXJfb25lEAIPFgIKDwAAAGJldHNfcGxheWVyX3R3bxACDxYCCgkAAABnYW1lX25hbWUWAgoAAABnYW1lX3N0YXRlFgILAAAAcGxheWVyX3R1cm4CBAAAAGdyaWQQAgI='
            ).then((response) => {
              console.log(response);
              return true;
            }).catch((error) => {
              console.log(error);
              $errorOccurred = 'true';
              $errorMessage = error;
              return false;
            });
          });
      }).catch((error) => {
      console.log(error);
      $errorOccurred = 'true';
      $errorMessage = error;
      return false;
    });

    return false;
  }

</script>


<div class="flex flex-col shrink-0">
    <div class="grid grid-cols-3 grow-0">
      {#each grid as cell, i}
        {#if cell === 0 }
          <div on:click={() => handleClick(i)} class="h-24 w-24 border-2 border-black"> <img class="mt-4 ml-4" src="empty.svg" height="60px" width="60px" /> </div>
        {:else if cell === 1 }
          <div class="h-24 w-24 border-2 border-black"> <img class="mt-4 ml-4" src="round.svg" height="60px" width="60px" /> </div>
        {:else if cell === 2 }
          <div class="h-24 w-24 border-2 border-black"> <img class="mt-5 ml-5" src="cross.svg" height="55px" width="55px" /> </div>
        {/if}
      {/each}
  </div>
</div>