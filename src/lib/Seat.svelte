<script lang="ts">
    import {sc_instance} from '$lib/stores.js'
    import {getContext} from 'svelte';

    export let name = "Player name";
    export let joined = false;
    export let isMyTurn = false;

    let index;

    sc_instance.subscribe(value => {
        index = value;
    });

    const errorOccurred = getContext('errorOccurred');
    const errorMessage = getContext('errorMessage');

    async function reserve_seat() {
        concordiumHelpers.detectConcordiumProvider()
            .then((provider) => {
                provider
                    .connect()
                    .then((acc) => {
                        provider.sendTransaction(
                            acc,
                            concordiumSDK.AccountTransactionType.UpdateSmartContractInstance,
                            {
                                amount: new concordiumSDK.GtuAmount(100n),
                                contractAddress: {
                                    index: index,
                                    subindex: 0n,
                                },
                                receiveName: 'tictactoebet.join',
                                maxContractExecutionEnergy: 30000n,
                            } as concordiumSDK.AccountTransactionPayload,
                            {
                                name: name
                            },
                            '//8CAQAAAAwAAAB0aWN0YWN0b2ViZXQBABQAAgAAAAkAAABnYW1lX25hbWUWAgMAAABlbmQNBAAAAAMAAABiZXQEFAACAAAABAAAAG5hbWUWAhAAAABwbGF5ZXJfdG9fYmV0X29uAhUGAAAACwAAAE9ubHlBY2NvdW50AgoAAABCZXRUb29MYXRlAgkAAABCZXRDbG9zZWQCCgAAAEFscmVhZHlCZXQCEAAAAEludmFsaWRQYXJhbWV0ZXICCgAAAFBhcnNlRXJyb3ICBAAAAGpvaW4EFAABAAAABAAAAG5hbWUWAhUFAAAACwAAAE9ubHlBY2NvdW50AgkAAABMb2JieUZ1bGwCDgAAAEFscmVhZHlBUGxheWVyAhAAAABNaXNzaW5nUGFyYW1ldGVyAgoAAABQYXJzZUVycm9yAgQAAABtYXJrBBQAAgAAAAgAAABwb3NpdGlvbgIGAAAAcGxheWVyCxUHAAAACgAAAFBhcnNlRXJyb3ICEAAAAFdhaXRpbmdGb3JQbGF5ZXICCgAAAE5vdEFQbGF5ZXICCwAAAE5vdFlvdXJUdXJuAgkAAABDZWxsVGFrZW4CDQAAAFRyYW5zZmVyRXJyb3ICCwAAAEdhbWVFeHBpcmVkAgQAAAB2aWV3ARQACQAAAAUAAABzdGFrZQoPAAAAcGxheWVyX29uZV9uYW1lFgIPAAAAcGxheWVyX3R3b19uYW1lFgIPAAAAYmV0c19wbGF5ZXJfb25lEAIPFgIKDwAAAGJldHNfcGxheWVyX3R3bxACDxYCCgkAAABnYW1lX25hbWUWAgoAAABnYW1lX3N0YXRlFgILAAAAcGxheWVyX3R1cm4CBAAAAGdyaWQQAgI='
                        ).then((response) => {
                            console.log(response);
                            return true;
                        }).catch((error) => {
                            console.log(error);
                            $errorOccurred = 'true';
                            $errorMessage = error.toString();
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

    function handleClick() {
      reserve_seat();
    }

</script>

<div class="flex flex-col">
    <img class="mask mask-circle border-8 border-emerald-600 rounded-full" class:border-8={isMyTurn} src="https://placeimg.com/160/160/arch" alt="Player one avatar"/>
    {#if joined}
        <input type="text" bind:value={name} disabled class="input input-bordered input-accent w-full max-w-xs mt-2"/>
    {:else}
        <input type="text" bind:value={name} class="input input-bordered input-accent w-full max-w-xs mt-2"/>
        <button on:click={handleClick} class="btn btn-accent mt-2">Join as {name}</button>
    {/if}
</div>

