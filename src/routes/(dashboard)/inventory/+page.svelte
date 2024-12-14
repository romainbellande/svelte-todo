<script lang="ts">
	import { Plus, Search, ChevronLeft, ChevronRight } from 'lucide-svelte';
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
	import {
		Pagination,
		PaginationContent,
		PaginationEllipsis,
		PaginationItem,
		PaginationLink,
		PaginationNextButton,
		PaginationPrevButton,
	} from '$lib/components/ui/pagination';

	type Props = {
		data: PageData;
	};

	const { data }: Props = $props();
	let searchTerm = $state('');
	let searchTimeout: NodeJS.Timeout;
	const count = $derived(data.pagination.totalItems);
	const perPage = $derived(data.pagination.perPage); // Number of items to display per page
	const siblingCount = 1;

	function handleSearch() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			const url = new URL(window.location.href);
			if (searchTerm) {
				url.searchParams.set('search', searchTerm);
			} else {
				url.searchParams.delete('search');
			}
			url.searchParams.set('page', '1');
			goto(url.toString());
		}, 300);
	}

	function handlePageChange(page: number) {
		const url = new URL(window.location.href);
		url.searchParams.set('page', page.toString());
		goto(url.toString());
	}
</script>

<div class="container mx-auto py-10">
	<div class="flex items-center justify-between mb-6">
		<div class="flex items-center gap-2 relative w-[300px]">
			<Input
				type="text"
				placeholder="Search by name, reference or assignee..."
				bind:value={searchTerm}
				oninput={handleSearch}
				class="pl-3 pr-10"
			/>
			<Search class="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500" />
		</div>
		<Button href="/inventory/new">
			<Plus class="mr-2 h-4 w-4" />
			New Item
		</Button>
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
							<TableCell>
								<a
									href="/inventory/{item.id}"
									class="text-blue-600 hover:underline"
								>
									{item.name}
								</a>
							</TableCell>
							<TableCell>{item.reference}</TableCell>
							<TableCell>
								{#if item.assignee}
									{item.assignee.firstname} {item.assignee.lastname}
								{:else}
									<span class="text-gray-400">Unassigned</span>
								{/if}
							</TableCell>
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
	{#if data.items.length > 0}
		<div class="mt-4">
			<Pagination {count} {perPage} {siblingCount}>
				{#snippet children({ pages, currentPage })}
					<PaginationContent>
						<PaginationItem>
							<PaginationPrevButton>
								<ChevronLeft class="size-4" />
								<span class="hidden sm:block">Previous</span>
							</PaginationPrevButton>
						</PaginationItem>
						{#each pages as page (page.key)}
						{#if page.type === 'ellipsis'}
							<PaginationEllipsis />
						{:else}
							<PaginationItem>
								<PaginationLink
									{page}
									isActive={currentPage === page.value}
								>
									{page.value}
								</PaginationLink>
							</PaginationItem>
						{/if}
						{/each}
						<PaginationItem>
							<PaginationNextButton>
								<span class="hidden sm:block">Next</span>
								<ChevronRight class="size-4" />
							</PaginationNextButton>
						</PaginationItem>
					</PaginationContent>
				{/snippet}
			</Pagination>
		</div>
	{/if}
</div>
