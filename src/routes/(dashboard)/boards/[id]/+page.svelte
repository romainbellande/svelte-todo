<script lang="ts">
    import { enhance } from '$app/forms';
    import { invalidateAll } from '$app/navigation';
    import type { PageData } from './$types';
    import { dndzone } from 'svelte-dnd-action';
    
    export let data: PageData;

    $: lists = data.board.lists.sort((a, b) => a.order - b.order);
    $: newListName = '';
    $: showNewListInput = false;
    $: newCardTitle = '';
    let activeListForNewCard: string | null = null;
    let editingCard: { id: string; title: string; description: string | null; assigneeId: string | null } | null = null;
    let editingList: { id: string; name: string } | null = null;

    function startEditing(card: any) {
        editingCard = { ...card };
    }

    function cancelEditing() {
        editingCard = null;
    }

    function startEditingList(list: any) {
        editingList = { id: list.id, name: list.name };
    }

    function cancelEditingList() {
        editingList = null;
    }

    let previousCards: Record<string, any[]> = {};

    let dragSource: { listId: string | null; cardId: string | null; originalIndex: number | null } = { 
        listId: null, 
        cardId: null, 
        originalIndex: null 
    };
    let isProcessingMove = false;

    async function handleCardDndConsider(e: CustomEvent<{items: any[]}>, listId: string) {
        const list = lists.find(l => l.id === listId);
        if (list) {
            // Only track source on the first movement
            if (!dragSource.listId) {
                // Find which card is missing from the new array
                const missingCard = list.cards.find(oldCard => 
                    !e.detail.items.some(newCard => 
                        newCard.id === oldCard.id && !newCard.id.includes('dnd-shadow-placeholder')
                    )
                );
                
                if (missingCard) {
                    dragSource = { 
                        listId, 
                        cardId: missingCard.id,
                        originalIndex: list.cards.findIndex(c => c.id === missingCard.id)
                    };
                    console.log('Drag started:', dragSource);
                }
            }

            // Update the list's cards
            list.cards = e.detail.items.filter(card => !card.id.includes('dnd-shadow-placeholder'));
            lists = [...lists];
        }
    }

    async function handleCardDndFinalize(e: CustomEvent<{items: any[]}>, listId: string) {
        // Prevent multiple finalize events from being processed
        if (isProcessingMove) {
            console.log('Already processing a move, skipping...');
            return;
        }

        try {
            isProcessingMove = true;
            const list = lists.find(l => l.id === listId);
            console.log('Finalize - dragSource:', dragSource);
            console.log('Finalize - target list:', listId);

            if (!list || !dragSource.cardId) {
                console.log('No drag source or list found!');
                return;
            }

            // Filter out placeholder items
            const newCards = e.detail.items.filter(card => !card.id.includes('dnd-shadow-placeholder'));
            console.log('Filtered cards:', newCards.map(c => ({ id: c.id, title: c.title })));

            // Find the moved card
            const movedCard = newCards.find(card => card.id === dragSource.cardId);
            console.log('Looking for card:', dragSource.cardId);
            console.log('Found moved card:', movedCard);

            if (!movedCard) {
                console.log('Could not find moved card!');
                return;
            }

            const movedCardIndex = newCards.findIndex(card => card.id === movedCard.id);
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
            const list = lists.find(l => l.id === listId);
            if (list) {
                list.cards = list.cards.filter(card => !card.id.includes('dnd-shadow-placeholder'));
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
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">{data.board.name}</h1>
        <button
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            on:click={() => showNewListInput = true}
        >
            Add List
        </button>
    </div>

    {#if showNewListInput}
        <div class="mb-6 p-4 bg-white rounded shadow max-w-sm">
            <form method="POST" action="?/createList" use:enhance>
                <input
                    type="text"
                    name="name"
                    bind:value={newListName}
                    placeholder="Enter list name"
                    class="w-full p-2 border rounded mb-2"
                />
                <div class="flex justify-end gap-2">
                    <button
                        type="button"
                        class="px-4 py-2 text-gray-600 hover:text-gray-800"
                        on:click={() => {
                            showNewListInput = false;
                            newListName = '';
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Add List
                    </button>
                </div>
            </form>
        </div>
    {/if}

    <div class="flex gap-4 overflow-x-auto pb-4"
   
    >
        {#each lists as list (list.id)}
            <div 
                class="bg-gray-100 rounded-lg p-4 min-w-[300px]"
                role="region"
            >
                <div class="flex justify-between items-center mb-4">
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
                                    class="flex-1 px-2 py-1 border rounded"
                                    autofocus
                                />
                                <button type="submit" class="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Save</button>
                                <button
                                    type="button"
                                    class="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                                    on:click={() => (editingList = null)}>Cancel</button
                                >
                            </div>
                        </form>
                    {:else}
                        <h3
                            class="text-lg font-semibold cursor-pointer hover:text-blue-600"
                            on:click={() => {
                                editingList = { id: list.id, name: list.name };
                            }}
                        >
                            {list.name}
                        </h3>
                    {/if}
                </div>

                <div 
                    class="space-y-2"
                    use:dndzone={{
                        items: list.cards,
                        dragDisabled: !!editingCard,
                        flipDurationMs: 0
                    }}
                    on:consider={e => handleCardDndConsider(e, list.id)}
                    on:finalize={e => handleCardDndFinalize(e, list.id)}
                >
                    {#each list.cards as card (card.id)}
                        <div class="bg-white p-3 rounded shadow">
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
                                        class="w-full px-2 py-1 border rounded"
                                        autofocus
                                    />
                                    <textarea
                                        name="description"
                                        class="w-full px-2 py-1 border rounded"
                                        rows="2">{editingCard.description || ''}</textarea
                                    >
                                    <select name="assigneeId" class="w-full px-2 py-1 border rounded">
                                        <option value="">Unassigned</option>
                                        {#each data.users as user}
                                            <option value={user.id} selected={card.assigneeId === user.id}>
                                                {user.firstname} {user.lastname}
                                            </option>
                                        {/each}
                                    </select>
                                    <div class="flex gap-2">
                                        <button type="submit" class="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                            >Save</button
                                        >
                                        <button
                                            type="button"
                                            class="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                                            on:click={() => (editingCard = null)}>Cancel</button
                                        >
                                    </div>
                                </form>
                            {:else}
                                <div
                                    class="cursor-pointer"
                                    on:click={() => {
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
                                        <p class="text-sm text-gray-600 mt-1">{card.description}</p>
                                    {/if}
                                    {#if card.assignee}
                                        <div class="mt-2 text-sm text-gray-500 flex items-center gap-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                                            </svg>
                                            {card.assignee.firstname} {card.assignee.lastname}
                                        </div>
                                    {/if}
                                </div>
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
                            class="w-full p-2 border rounded mt-2"
                        />
                        <div class="flex justify-end gap-2 mt-2">
                            <button
                                type="button"
                                class="text-gray-600 hover:text-gray-800"
                                on:click={() => {
                                    activeListForNewCard = null;
                                    newCardTitle = '';
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                            >
                                Add Card
                            </button>
                        </div>
                    </form>
                {:else}
                    <button
                        class="text-gray-600 hover:text-gray-800 mt-2"
                        on:click={() => activeListForNewCard = list.id}
                    >
                        + Add a card
                    </button>
                {/if}
            </div>
        {/each}
    </div>
</div>
