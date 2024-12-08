<script lang="ts">
    import { Plus } from 'lucide-svelte';
    import { Button } from '$lib/components/ui/button';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
    import { formatDate } from '$lib/utils';
    import type { PageData } from './$types';

    export let data: PageData;
</script>

<div class="container mx-auto py-6">
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">Inventory</h1>
        <Button href="/inventory/new">
            <Plus class="w-4 h-4 mr-2" />
            New Item
        </Button>
    </div>

    <div class="bg-white rounded-lg shadow">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Assigned At</TableHead>
                    <TableHead class="w-[100px]">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {#if data.items.length === 0}
                    <TableRow>
                        <TableCell colspan={5} class="text-center py-4">No items found</TableCell>
                    </TableRow>
                {:else}
                    {#each data.items as item}
                        <TableRow>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.reference}</TableCell>
                            <TableCell>{item.assignee?.firstname} {item.assignee?.lastname ?? '-'}</TableCell>
                            <TableCell>{item.assignedAt ? formatDate(item.assignedAt) : '-'}</TableCell>
                            <TableCell>
                                <div class="flex gap-2">
                                    <Button variant="ghost" size="sm" href="/inventory/{item.id}">
                                        Edit
                                    </Button>
                                    <form action="/inventory/{item.id}?/delete" method="POST">
                                        <Button variant="ghost" size="sm" type="submit" class="text-red-600 hover:text-red-700">
                                            Delete
                                        </Button>
                                    </form>
                                </div>
                            </TableCell>
                        </TableRow>
                    {/each}
                {/if}
            </TableBody>
        </Table>
    </div>
</div>
