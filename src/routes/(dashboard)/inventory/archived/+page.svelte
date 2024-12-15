<!-- Use Svelte 5 syntax -->
<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import type { PageData } from './$types';
	import * as m from '$lib/paraglide/messages';

	type Props = {
		data: PageData;
	};

	const { data }: Props = $props();

	$effect(() => {
		document.title = m.inventory_archived_title();
	});
</script>

<div class="container space-y-8 py-8">
	<div class="flex justify-between">
		<h1 class="text-4xl font-bold">{m.inventory_archived_title()}</h1>
		<Button href="/inventory" variant="outline">{m.inventory_archived_back()}</Button>
	</div>

	<div class="flex items-center gap-4">
		<form class="flex-1">
			<Input
				type="search"
				name="search"
				placeholder={m.inventory_search_placeholder()}
				value={$page.url.searchParams.get('search') ?? ''}
			/>
		</form>
	</div>

	<div class="rounded-md border">
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>{m.inventory_table_reference()}</TableHead>
					<TableHead>{m.inventory_table_name()}</TableHead>
					<TableHead>{m.inventory_table_assignee()}</TableHead>
					<TableHead>{m.inventory_table_archived_at()}</TableHead>
					<TableHead class="w-[100px]">{m.inventory_table_actions()}</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#each data.items as { item, user }}
					<TableRow>
						<TableCell>{item.reference}</TableCell>
						<TableCell>{item.name}</TableCell>
						<TableCell>
							{#if user}
								{user.firstname} {user.lastname}
							{:else}
								<span class="text-muted-foreground">Unassigned</span>
							{/if}
						</TableCell>
						<TableCell>
							{#if item.archivedAt}
								{new Date(item.archivedAt).toLocaleDateString()}
							{/if}
						</TableCell>
						<TableCell>
							<div class="flex gap-2">
								<form action="/inventory/{item.id}?/restore" method="POST">
									<Button
										variant="ghost"
										size="sm"
										type="submit"
										class="text-green-600 hover:text-green-700"
									>
										{m.inventory_action_restore()}
									</Button>
								</form>
							</div>
						</TableCell>
					</TableRow>
				{/each}
			</TableBody>
		</Table>
	</div>

	<div class="text-sm text-muted-foreground">
		{m.inventory_items_count({ count: data.totalItems })}
	</div>
</div>
