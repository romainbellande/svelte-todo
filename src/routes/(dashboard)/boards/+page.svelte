<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	export let data: PageData;

	let newBoardName = '';
	let showNewBoardInput = false;
</script>

<div class="p-6">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-bold">My Boards</h1>
		<button
			class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
			on:click={() => (showNewBoardInput = true)}
		>
			Create Board
		</button>
	</div>

	{#if showNewBoardInput}
		<div class="mb-6 rounded bg-white p-4 shadow">
			<form method="POST" action="?/create" use:enhance>
				<input
					type="text"
					name="name"
					bind:value={newBoardName}
					placeholder="Enter board name"
					class="mb-2 w-full rounded border p-2"
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
					<button type="submit" class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
						Create
					</button>
				</div>
			</form>
		</div>
	{/if}

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
		{#each data.boards as board}
			<a
				href="/boards/{board.id}"
				class="block rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-md"
			>
				<h2 class="mb-2 text-xl font-semibold">{board.name}</h2>
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
