<script lang="ts">
    import { enhance } from '$app/forms';
    import { invalidateAll } from '$app/navigation';
    import type { PageData } from './$types';
    import { dndzone } from 'svelte-dnd-action';
    
    export let data: PageData;

    $: newListName = '';
    $: showNewListInput = false;
    $: newCardTitle = '';
    let activeListForNewCard: string | null = null;
    $: lists = data.board.lists;

    let editingCard: { id: string; title: string; description: string | null } | null = null;

    function startEditing(card: any) {
        editingCard = { ...card };
    }

    function cancelEditing() {
        editingCard = null;
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
                class="bg-gray-100 p-4 rounded min-w-[300px] max-w-[300px]"
                role="region"
            >
                <h3 class="font-bold mb-4">{list.name}</h3>
                
                <div 
                    class="space-y-2 min-h-[2rem]"
                    use:dndzone={{
                        items: list.cards,
                        flipDurationMs: 300,
                        dropTargetStyle: {
                            outline: "2px dashed #4a5568",
                        },
                        dragDisabled: false
                    }}
                    on:consider={(e) => handleCardDndConsider(e, list.id)}
                    on:finalize={(e) => handleCardDndFinalize(e, list.id)}
                >
                    {#each list.cards as card (card.id)}
                        <div
                            class="bg-white p-3 rounded shadow"
                        >
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
                                >
                                    <input type="hidden" name="cardId" value={card.id} />
                                    <input
                                        type="text"
                                        name="title"
                                        bind:value={editingCard.title}
                                        class="w-full p-2 border rounded"
                                        placeholder="Card title"
                                    />
                                    <textarea
                                        name="description"
                                        bind:value={editingCard.description}
                                        class="w-full p-2 border rounded"
                                        placeholder="Add a description..."
                                        rows="3"
                                    ></textarea>
                                    <div class="flex justify-end gap-2">
                                        <button 
                                            type="button" 
                                            class="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                                            on:click={cancelEditing}
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit"
                                            class="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </form>
                            {:else}
                                <button 
                                    type="button"
                                    class="text-left w-full cursor-pointer hover:bg-gray-100 p-2 rounded"
                                    on:click={() => startEditing(card)}
                                >
                                    <div class="font-medium">{card.title}</div>
                                    {#if card.description}
                                        <div class="text-sm text-gray-600 mt-1">{card.description}</div>
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
