<script lang="ts">
    import { enhance } from '$app/forms';
    import type { PageData } from './$types';
    
    export let data: PageData;

    let newBoardName = '';
    let showNewBoardInput = false;
</script>

<div class="p-6">
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">My Boards</h1>
        <button
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            on:click={() => showNewBoardInput = true}
        >
            Create Board
        </button>
    </div>

    {#if showNewBoardInput}
        <div class="mb-6 p-4 bg-white rounded shadow">
            <form method="POST" action="?/create" use:enhance>
                <input
                    type="text"
                    name="name"
                    bind:value={newBoardName}
                    placeholder="Enter board name"
                    class="w-full p-2 border rounded mb-2"
                />
                <div class="flex justify-end gap-2">
                    <button
                        type="button"
                        class="px-4 py-2 text-gray-600 hover:text-gray-800"
                        on:click={() => {
                            showNewBoardInput = false;
                            newBoardName = '';
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Create
                    </button>
                </div>
            </form>
        </div>
    {/if}

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each data.boards as board}
            <a
                href="/boards/{board.id}"
                class="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
                <h2 class="text-xl font-semibold mb-2">{board.name}</h2>
                <p class="text-gray-600">
                    {board.lists?.length || 0} lists
                </p>
            </a>
        {/each}
    </div>
</div>

<style>
    :global(body) {
        background-color: #f0f2f5;
    }
</style>
