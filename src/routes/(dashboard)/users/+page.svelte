<!-- Use Svelte 5 syntax -->
<script lang="ts">
	import { Plus } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import { Input } from '$lib/components/ui/input';
	import { Switch } from '$lib/components/ui/switch';
	import * as m from '$lib/paraglide/messages';
	import { formatDate } from '$lib/utils';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { invalidateAll } from '$app/navigation';

	type Props = {
		data: PageData;
	};

	const { data }: Props = $props();
	let searchTerm = $state('');
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
			url.searchParams.set('page', '1');
			goto(url.toString());
		}, 300);
	}

	async function toggleUserStatus(userId: string) {
		try {
			const formData = new FormData();
			formData.append('id', userId);

			const response = await fetch('?/toggleStatus', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				throw new Error('Failed to toggle user status');
			}

			await invalidateAll();
		} catch (error) {
			console.error('Error toggling user status:', error);
		}
	}

	$effect(() => {
		document.title = m.users_title();
	});
</script>

<div class="container space-y-8 py-8">
	<div class="flex justify-between">
		<h1 class="text-4xl font-bold">{m.users_title()}</h1>
		<Button href="/users/new">
			<Plus class="mr-2 h-4 w-4" />
			{m.users_new_button()}
		</Button>
	</div>

	<div class="flex items-center gap-4">
		<form class="flex-1">
			<Input
				type="search"
				name="search"
				placeholder={m.users_search_placeholder()}
				bind:value={searchTerm}
				oninput={handleSearch}
			/>
		</form>
	</div>

	<div class="rounded-md border">
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>{m.users_table_name()}</TableHead>
					<TableHead>{m.users_table_email()}</TableHead>
					<TableHead>{m.users_table_status()}</TableHead>
					<TableHead>{m.users_table_activated_at()}</TableHead>
					<TableHead>{m.users_table_created_at()}</TableHead>
					<TableHead class="w-[100px]">{m.users_table_actions()}</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#if data.users.length === 0}
					<TableRow>
						<TableCell colspan={6} class="py-4 text-center">{m.users_no_items()}</TableCell>
					</TableRow>
				{:else}
					{#each data.users as user}
						<TableRow>
							<TableCell>
								<div class="font-medium">{user.firstname} {user.lastname}</div>
							</TableCell>
							<TableCell>{user.email}</TableCell>
							<TableCell>
								<Switch
									checked={!user.disabled}
									onCheckedChange={() => toggleUserStatus(user.id)}
								/>
							</TableCell>
							<TableCell>
								{#if user.activatedAt}
									{formatDate(user.activatedAt)}
								{:else}
									<span class="text-muted-foreground">-</span>
								{/if}
							</TableCell>
							<TableCell>{formatDate(user.createdAt)}</TableCell>
							<TableCell>
								<div class="flex gap-2">
									<Button variant="ghost" size="sm" href="/users/{user.id}"
										>{m.users_action_edit()}</Button
									>
									<form action="/users/{user.id}?/delete" method="POST">
										<Button
											variant="ghost"
											size="sm"
											type="submit"
											class="text-red-600 hover:text-red-700"
										>
											{m.users_action_delete()}
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

	<div class="text-sm text-muted-foreground">
		{m.users_items_count({ count: data.totalUsers })}
	</div>
</div>
