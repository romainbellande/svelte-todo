<script lang="ts">
	import { Plus, Search } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import { formatDate } from '$lib/utils';
	import type { PageData } from './$types';
	import { Input } from '$lib/components/ui/input';
	import { goto } from '$app/navigation';

	export let data: PageData;

	let searchTerm = '';
	let searchTimeout: NodeJS.Timeout;

	function handleSearch() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			const url = new URL(window.location.href);
			if (searchTerm) {
				url.searchParams.set('search', searchTerm);
			} else {
				url.searchParams.delete('search');
			}
			goto(url.toString());
		}, 300);
	}
</script>

<div class="container mx-auto py-6">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-3xl font-bold">Inventory</h1>
		<Button href="/inventory/new">
			<Plus class="mr-2 h-4 w-4" />
			New Item
		</Button>
	</div>

	<div class="relative mb-4">
		<Input
			type="text"
			placeholder="Search by name, reference or assignee..."
			bind:value={searchTerm}
			on:input={handleSearch}
		/>
		<Search class="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500" />
	</div>

	<div class="rounded-lg bg-white shadow">
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
						<TableCell colspan={5} class="py-4 text-center">No items found</TableCell>
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
									<Button variant="ghost" size="sm" href="/inventory/{item.id}">Edit</Button>
									<form action="/inventory/{item.id}?/delete" method="POST">
										<Button
											variant="ghost"
											size="sm"
											type="submit"
											class="text-red-600 hover:text-red-700"
										>
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
