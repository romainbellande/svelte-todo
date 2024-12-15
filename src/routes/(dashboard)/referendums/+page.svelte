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
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
	import * as m from '$lib/paraglide/messages';
	import { cn, formatDate, getReferendumStatus } from '$lib/utils';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';

	type Props = {
		data: PageData;
	};

	const { data }: Props = $props();
	let searchTerm = $state('');
	let status = $state('all');
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

	function handleStatusChange(value: string) {
		status = value;
		const url = new URL(window.location.href);
		url.searchParams.set('status', value);
		goto(url.toString());
	}

	function getStatus(fromDate: Date, toDate: Date) {
		return getReferendumStatus(fromDate, toDate);
	}

	$effect(() => {
		document.title = m.referendums_title();
	});
</script>

<div class="container space-y-8 py-8">
	<div class="flex justify-between">
		<h1 class="text-4xl font-bold">{m.referendums_title()}</h1>
		<Button href="/referendums/new">
			<Plus class="mr-2 h-4 w-4" />
			{m.referendums_new_button()}
		</Button>
	</div>

	<div class="flex items-center gap-4">
		<form class="flex-1">
			<Input
				type="search"
				name="search"
				placeholder={m.referendums_search_placeholder()}
				bind:value={searchTerm}
				oninput={handleSearch}
			/>
		</form>
		<Select type="single" bind:value={status} onValueChange={handleStatusChange}>
			<SelectTrigger class="w-[180px]"></SelectTrigger>
			<SelectContent>
				<SelectItem value="all">{m.referendums_status_all()}</SelectItem>
				<SelectItem value="active">{m.referendums_status_active()}</SelectItem>
				<SelectItem value="upcoming">{m.referendums_status_upcoming()}</SelectItem>
				<SelectItem value="ended">{m.referendums_status_ended()}</SelectItem>
			</SelectContent>
		</Select>
	</div>

	<div class="rounded-md border">
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>{m.referendums_table_title()}</TableHead>
					<TableHead>{m.referendums_table_period()}</TableHead>
					<TableHead>{m.referendums_table_status()}</TableHead>
					<TableHead class="text-right">{m.common_actions()}</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#if data.referendums.length === 0}
					<TableRow>
						<TableCell colspan={4} class="py-4 text-center">{m.referendums_no_items()}</TableCell>
					</TableRow>
				{:else}
					{#each data.referendums as referendum}
						<TableRow>
							<TableCell>{referendum.title}</TableCell>
							<TableCell>
								{formatDate(referendum.fromDate)} - {formatDate(referendum.toDate)}
							</TableCell>
							<TableCell>
								<span
									class={cn(
										'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset',
										{
											'bg-green-50 text-green-700 ring-green-600/20':
												getStatus(referendum.fromDate, referendum.toDate) === 'active',
											'bg-yellow-50 text-yellow-700 ring-yellow-600/20':
												getStatus(referendum.fromDate, referendum.toDate) === 'upcoming',
											'bg-red-50 text-red-700 ring-red-600/20':
												getStatus(referendum.fromDate, referendum.toDate) === 'ended'
										}
									)}
								>
									{#if getStatus(referendum.fromDate, referendum.toDate) === 'active'}
										{m.referendums_status_active()}
									{:else if getStatus(referendum.fromDate, referendum.toDate) === 'upcoming'}
										{m.referendums_status_upcoming()}
									{:else}
										{m.referendums_status_ended()}
									{/if}
								</span>
							</TableCell>
							<TableCell class="text-right">
								<Button variant="outline" size="sm" href="/referendums/{referendum.id}">
									{m.common_view()}
								</Button>
							</TableCell>
						</TableRow>
					{/each}
				{/if}
			</TableBody>
		</Table>
	</div>
</div>
