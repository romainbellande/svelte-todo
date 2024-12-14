<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';
	import { dndzone } from 'svelte-dnd-action';
	type Props = {
		data: PageData;
	}
	const { data }: Props = $props();
	type Card = (typeof lists)[0]['cards'][0];
	let lists = $state<(typeof data.board.lists)>([]);
	$effect(() => {
		lists = data.board.lists.sort((a, b) => a.order - b.order);
	});
	let newListName = $state('');
	let showNewListInput = $state(false);
	let newCardTitle = $state('');
	let activeListForNewCard: string | null = $state(null);
	let editingCard: {
		id: string;
		title: string;
		description: string | null;
		assigneeId: string | null;
	} | null = $state(null);
	let editingList: { id: string; name: string } | null = $state(null);

	let dragSource: { listId: string | null; cardId: string | null; originalIndex: number | null } = {
		listId: null,
		cardId: null,
		originalIndex: null
	};
	let isProcessingMove = false;

	async function handleCardDndConsider(
		e: CustomEvent<{ items: (typeof lists)[0]['cards'] }>,
		listId: string
	) {
		const list = lists.find((l) => l.id === listId);
		if (list) {
			// Only track source on the first movement
			if (!dragSource.listId) {
				// Find which card is missing from the new array
				const missingCard = list.cards.find(
					(oldCard) =>
						!e.detail.items.some(
							(newCard) =>
								newCard.id === oldCard.id && !newCard.id.includes('dnd-shadow-placeholder')
						)
				);

				if (missingCard) {
					dragSource = {
						listId,
						cardId: missingCard.id,
						originalIndex: list.cards.findIndex((c) => c.id === missingCard.id)
					};
					console.log('Drag started:', dragSource);
				}
			}

			// Update the list's cards
			list.cards = e.detail.items.filter((card) => !card.id.includes('dnd-shadow-placeholder'));
			lists = [...lists];
		}
	}

	async function handleCardDndFinalize(e: CustomEvent<{ items: Card[] }>, listId: string) {
		// Prevent multiple finalize events from being processed
		if (isProcessingMove) {
			console.log('Already processing a move, skipping...');
			return;
		}

		try {
			isProcessingMove = true;
			const list = lists.find((l) => l.id === listId);
			console.log('Finalize - dragSource:', dragSource);
			console.log('Finalize - target list:', listId);

			if (!list || !dragSource.cardId) {
				console.log('No drag source or list found!');
				return;
			}

			// Filter out placeholder items
			const newCards = e.detail.items.filter((card) => !card.id.includes('dnd-shadow-placeholder'));
			console.log(
				'Filtered cards:',
				newCards.map((c) => ({ id: c.id, title: c.title }))
			);

			// Find the moved card
			const movedCard = newCards.find((card) => card.id === dragSource.cardId);
			console.log('Looking for card:', dragSource.cardId);
			console.log('Found moved card:', movedCard);

			if (!movedCard) {
				console.log('Could not find moved card!');
				return;
			}

			const movedCardIndex = newCards.findIndex((card) => card.id === movedCard.id);
			const formData = new FormData();
			formData.append('cardId', movedCard.id);
			formData.append('targetListId', listId);

			if (movedCardIndex > 0) {
				formData.append('prevCardId', newCards[movedCardIndex - 1].id);
			}
			if (movedCardIndex < newCards.length - 1) {
				formData.append('nextCardId', newCards[movedCardIndex + 1].id);
			}

			console.log('Sending request with data:', Object.fromEntries(formData));
			const response = await fetch('?/moveCard', {
				method: 'POST',
				body: formData
			});

			const responseText = await response.text();
			console.log('Server response:', responseText);

			if (!response.ok) {
				throw new Error(`Failed to move card: ${responseText}`);
			}

			// Update the UI
			list.cards = newCards;
			lists = [...lists];
			await invalidateAll();
		} catch (error) {
			console.error('Error moving card:', error);
			// Revert the UI to the original state
			const list = lists.find((l) => l.id === listId);
			if (list) {
				list.cards = list.cards.filter((card) => !card.id.includes('dnd-shadow-placeholder'));
				lists = [...lists];
			}
		} finally {
			// Reset states
			dragSource = { listId: null, cardId: null, originalIndex: null };
			isProcessingMove = false;
		}
	}
</script>

<div class="p-6">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-bold">{data.board.name}</h1>
		<button
			type="button"
			class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
			onclick={() => (showNewListInput = true)}
		>
			Add List
		</button>
	</div>

	{#if showNewListInput}
		<div class="mb-6 max-w-sm rounded bg-white p-4 shadow">
			<form method="POST" action="?/createList" use:enhance>
				<input
					type="text"
					name="name"
					bind:value={newListName}
					placeholder="Enter list name"
					class="mb-2 w-full rounded border p-2"
				/>
				<div class="flex justify-end gap-2">
					<button
						type="button"
						class="px-4 py-2 text-gray-600 hover:text-gray-800"
						onclick={() => {
							showNewListInput = false;
							newListName = '';
						}}
					>
						Cancel
					</button>
					<button type="submit" class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
						Add List
					</button>
				</div>
			</form>
		</div>
	{/if}

	<div class="flex gap-4 overflow-x-auto pb-4">
		{#each lists as list (list.id)}
			<div class="min-w-[300px] rounded-lg bg-gray-100 p-4" role="region">
				<div class="mb-4 flex items-center justify-between">
					{#if editingList?.id === list.id}
						<form
							method="POST"
							action="?/updateList"
							use:enhance={() => {
								return async ({ update }) => {
									await update();
									editingList = null;
								};
							}}
							class="flex-1"
						>
							<input type="hidden" name="listId" value={list.id} />
							<div class="flex gap-2">
								<input
									type="text"
									name="name"
									bind:value={editingList.name}
									class="flex-1 rounded border px-2 py-1"
								/>
								<button
									type="submit"
									class="rounded bg-blue-500 px-2 py-1 text-white hover:bg-blue-600">Save</button
								>
								<button
									type="button"
									class="rounded bg-gray-500 px-2 py-1 text-white hover:bg-gray-600"
									onclick={() => (editingList = null)}>Cancel</button
								>
							</div>
						</form>
					{:else}
						<button
							type="button"
							class="text-left text-lg font-semibold hover:text-blue-600"
							onclick={() => {
								editingList = { id: list.id, name: list.name };
							}}
						>
							{list.name}
						</button>
					{/if}
				</div>

				<div
					class="space-y-2"
					use:dndzone={{
						items: list.cards,
						dragDisabled: !!editingCard,
						flipDurationMs: 0
					}}
					onconsider={(e) => handleCardDndConsider(e, list.id)}
					onfinalize={(e) => handleCardDndFinalize(e, list.id)}
				>
					{#each list.cards as card (card.id)}
						<div class="rounded bg-white p-3 shadow">
							{#if editingCard?.id === card.id}
								<form
									method="POST"
									action="?/updateCard"
									use:enhance={() => {
										return async ({ update }) => {
											await update();
											editingCard = null;
										};
									}}
									class="space-y-2"
								>
									<input type="hidden" name="cardId" value={card.id} />
									<input
										type="text"
										name="title"
										bind:value={editingCard.title}
										class="w-full rounded border px-2 py-1"
									/>
									<textarea name="description" class="w-full rounded border px-2 py-1" rows="2"
										>{editingCard.description || ''}</textarea
									>
									<select name="assigneeId" class="w-full rounded border px-2 py-1">
										<option value="">Unassigned</option>
										{#each data.users as user}
											<option value={user.id} selected={card.assigneeId === user.id}>
												{user.firstname}
												{user.lastname}
											</option>
										{/each}
									</select>
									<div class="flex gap-2">
										<button
											type="submit"
											class="rounded bg-blue-500 px-2 py-1 text-white hover:bg-blue-600"
											>Save</button
										>
										<button
											type="button"
											class="rounded bg-gray-500 px-2 py-1 text-white hover:bg-gray-600"
											onclick={() => (editingCard = null)}>Cancel</button
										>
									</div>
								</form>
							{:else}
								<button
									type="button"
									class="w-full cursor-pointer text-left"
									onclick={() => {
										editingCard = {
											id: card.id,
											title: card.title,
											description: card.description,
											assigneeId: card.assigneeId
										};
									}}
								>
									<h4 class="font-medium">{card.title}</h4>
									{#if card.description}
										<p class="mt-1 text-sm text-gray-600">{card.description}</p>
									{/if}
									{#if card.assignee}
										<div class="mt-2 flex items-center gap-1 text-sm text-gray-500">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												class="h-4 w-4"
												viewBox="0 0 20 20"
												fill="currentColor"
											>
												<path
													fill-rule="evenodd"
													d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
													clip-rule="evenodd"
												/>
											</svg>
											{card.assignee.firstname}
											{card.assignee.lastname}
										</div>
									{/if}
								</button>
							{/if}
						</div>
					{/each}
				</div>

				{#if activeListForNewCard === list.id}
					<form method="POST" action="?/createCard" use:enhance>
						<input type="hidden" name="listId" value={list.id} />
						<input
							type="text"
							name="title"
							bind:value={newCardTitle}
							placeholder="Enter card title"
							class="mt-2 w-full rounded border p-2"
						/>
						<div class="mt-2 flex justify-end gap-2">
							<button
								type="button"
								class="text-gray-600 hover:text-gray-800"
								onclick={() => {
									activeListForNewCard = null;
									newCardTitle = '';
								}}
							>
								Cancel
							</button>
							<button
								type="submit"
								class="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
							>
								Add Card
							</button>
						</div>
					</form>
				{:else}
					<button
						class="mt-2 text-gray-600 hover:text-gray-800"
						onclick={() => (activeListForNewCard = list.id)}
					>
						+ Add a card
					</button>
				{/if}
			</div>
		{/each}
	</div>
</div>
