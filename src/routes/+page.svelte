<script lang="ts">
    import GameView from '$lib/GameView.svelte';

    import {sc_instance} from '$lib/stores.js'

    let index;
    let id;
    let name;
    let ready = false;
    let newGameClicked = false;

    sc_instance.subscribe(value => {
        index = value;
    });

    // Connect to the account and instantiate the smart contract module, store the instance address
    function createNewGame() {
        newGameClicked = true;

        concordiumHelpers.detectConcordiumProvider()
            .then((provider) => {
                provider
                    .connect()
                    .then((acc) => {
                        console.log("Account selected in the extension " + acc);

                        provider.sendTransaction(
                            acc,
                            concordiumSDK.AccountTransactionType.InitializeSmartContractInstance,
                            {
                                amount: new concordiumSDK.GtuAmount(0n),
                                moduleRef: new concordiumSDK.ModuleReference(
                                    '3c18ec20b58c2b5dbf44fb97eea0ef2b324ee36364c6daed4d593295d5282c83'
                                ),
                                contractName: 'tictactoebet',
                                maxContractExecutionEnergy: 30000n
                            } as concordiumSDK.InitContractPayload,
                            {
                                game_name: name,
                                end: new Date( new Date().getTime() + 45*60000).toISOString(), // 45 Minutes timeout
                            },
                            '//8CAQAAAAwAAAB0aWN0YWN0b2ViZXQBABQAAgAAAAkAAABnYW1lX25hbWUWAgMAAABlbmQNBAAAAAMAAABiZXQEFAACAAAABAAAAG5hbWUWAhAAAABwbGF5ZXJfdG9fYmV0X29uAhUGAAAACwAAAE9ubHlBY2NvdW50AgoAAABCZXRUb29MYXRlAgkAAABCZXRDbG9zZWQCCgAAAEFscmVhZHlCZXQCEAAAAEludmFsaWRQYXJhbWV0ZXICCgAAAFBhcnNlRXJyb3ICBAAAAGpvaW4EFAABAAAABAAAAG5hbWUWAhUFAAAACwAAAE9ubHlBY2NvdW50AgkAAABMb2JieUZ1bGwCDgAAAEFscmVhZHlBUGxheWVyAhAAAABNaXNzaW5nUGFyYW1ldGVyAgoAAABQYXJzZUVycm9yAgQAAABtYXJrBBQAAgAAAAgAAABwb3NpdGlvbgIGAAAAcGxheWVyCxUHAAAACgAAAFBhcnNlRXJyb3ICEAAAAFdhaXRpbmdGb3JQbGF5ZXICCgAAAE5vdEFQbGF5ZXICCwAAAE5vdFlvdXJUdXJuAgkAAABDZWxsVGFrZW4CDQAAAFRyYW5zZmVyRXJyb3ICCwAAAEdhbWVFeHBpcmVkAgQAAAB2aWV3ARQACQAAAAUAAABzdGFrZQoPAAAAcGxheWVyX29uZV9uYW1lFgIPAAAAcGxheWVyX3R3b19uYW1lFgIPAAAAYmV0c19wbGF5ZXJfb25lEAIPFgIKDwAAAGJldHNfcGxheWVyX3R3bxACDxYCCgkAAABnYW1lX25hbWUWAgoAAABnYW1lX3N0YXRlFgILAAAAcGxheWVyX3R1cm4CBAAAAGdyaWQQAgI='
                        )
                            .then((transaction_address) => {
                                console.log("Init contract response : " + transaction_address);
                                id = setInterval(checkTransactionStatus, 2000, transaction_address);
                            })
                            .catch((error) => console.log(error));
                    });
            });
    }

    function checkTransactionStatus(transaction_address) {
        concordiumHelpers.detectConcordiumProvider()
            .then((provider) => {
                provider.getJsonRpcClient().getTransactionStatus(transaction_address)
                    .then((transaction) => {
                        if (transaction.status === concordiumSDK.TransactionStatusEnum.Committed || transaction.status === concordiumSDK.TransactionStatusEnum.Finalized) {
                            clearInterval(id);
                            const event = Object.values(transaction.outcomes)[0];
                            if (event.result.outcome === "success") {
                                let index = event.result.events[0].address.index;
                                console.log("Success index: " + index);
                                sc_instance.set(index);
                                ready = true;
                            }
                        }
                    });
            });
    }

    function setAsReady(){
        sc_instance.set(index);
        ready = true;
    }

</script>

<svelte:head>
    <title>TicTacToe </title>
    <meta name="description" content="Tic Tac Toe betting dapp"/>
    <script src="concordium.min.js" ></script>
    <script src=concordiumHelpers.min.js></script>
</svelte:head>

<section>
    <div>
        <h1 class="mb-10 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight dark:text-slate-200">Tic Tac
            Toe Betting Dapp on Concordium</h1>
    </div>

    {#if ready}
        <GameView></GameView>
    {:else}
        <div class="form-control">
            <div class="input-group">
                <input type="text" bind:value={name} class="input input-bordered input-accent w-full max-w-xs mt-2"/>
                <button class="btn mt-2" on:click={createNewGame} class:loading="{ newGameClicked}">Create a new game</button>
            </div>
            <div class="input-group">
                <input type="text" bind:value={index} class="input input-bordered input-accent w-full max-w-xs mt-2"/>
                <button class="btn btn-accent mt-2" class:btn-disabled={newGameClicked} on:click={setAsReady}>Join existing game</button>
            </div>
        </div>
    {/if}

</section>

<style>

</style>
