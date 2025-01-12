<script lang="ts">
	import { Button } from '@/components/ui/button';
	import { Calendar, MapPin, Plus } from 'lucide-svelte';
	import { format } from 'date-fns';

	let { data } = $props();
	const events = $derived(data.events);
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-semibold tracking-tight">Events</h1>
		<Button href="/events/new">
			<Plus class="mr-2 h-4 w-4" />
			New Event
		</Button>
	</div>

	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
		{#each events as event}
			<div class="rounded-lg border bg-white p-4 shadow-sm">
				<h3 class="text-lg font-semibold">{event.title}</h3>
				{#if event.description}
					<p class="mt-2 text-sm text-gray-600">{event.description}</p>
				{/if}
				<div class="mt-4 space-y-2">
					<div class="flex items-center text-sm text-gray-600">
						<Calendar class="mr-2 h-4 w-4" />
						<span>
							{format(event.startDate, 'PPP')} - {format(event.endDate, 'PPP')}
						</span>
					</div>
					{#if event.location}
						<div class="flex items-center text-sm text-gray-600">
							<MapPin class="mr-2 h-4 w-4" />
							<span>{event.location}</span>
						</div>
					{/if}
				</div>
				<div class="mt-4 flex justify-end">
					<Button variant="outline" href="/events/{event.id}">View Details</Button>
				</div>
			</div>
		{/each}
	</div>
</div>
