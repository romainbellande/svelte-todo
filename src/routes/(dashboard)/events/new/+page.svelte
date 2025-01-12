<script lang="ts">
	import { Button } from '@/components/ui/button';
	import { Input } from '@/components/ui/input';
	import { Textarea } from '@/components/ui/textarea';
	import { FormField, FormControl, FormLabel, FormFieldErrors } from '$lib/components/ui/form';
	import BackButton from '$lib/components/ui/back-button.svelte';
	import { superForm } from 'sveltekit-superforms/client';
	import * as m from '$lib/paraglide/messages';

	let { data } = $props();
	const form = superForm(data.form);
	const { form: formData, errors, enhance } = form;
</script>

<div class="container space-y-8 py-8">
	<div class="flex items-center justify-between">
		<h1 class="text-4xl font-bold">{m.events_new_title()}</h1>
		<BackButton href="/events" />
	</div>

	<div class="max-w-2xl">
		<form method="POST" use:enhance class="space-y-6">
			<FormField {form} name="title">
				<div class="space-y-2">
					<FormControl>
						{#snippet children({ props })}
							<FormLabel for="title">{m.events_form_title()}</FormLabel>
							<Input
								type="text"
								id="title"
								name={props.name}
								bind:value={$formData.title}
								placeholder={m.events_form_title_placeholder()}
								aria-invalid={$errors.title ? 'true' : undefined}
							/>
						{/snippet}
					</FormControl>
					<FormFieldErrors />
				</div>
			</FormField>

			<FormField {form} name="startDate">
				<div class="space-y-2">
					<FormControl>
						{#snippet children({ props })}
							<FormLabel for="startDate">{m.events_form_start_date()}</FormLabel>
							<Input
								type="datetime-local"
								id="startDate"
								name={props.name}
								bind:value={$formData.startDate}
								aria-invalid={$errors.startDate ? 'true' : undefined}
							/>
						{/snippet}
					</FormControl>
					<FormFieldErrors />
				</div>
			</FormField>

			<FormField {form} name="endDate">
				<div class="space-y-2">
					<FormControl>
						{#snippet children({ props })}
							<FormLabel for="endDate">{m.events_form_end_date()}</FormLabel>
							<Input
								type="datetime-local"
								id="endDate"
								name={props.name}
								bind:value={$formData.endDate}
								aria-invalid={$errors.endDate ? 'true' : undefined}
							/>
						{/snippet}
					</FormControl>
					<FormFieldErrors />
				</div>
			</FormField>

			<FormField {form} name="description">
				<div class="space-y-2">
					<FormControl>
						{#snippet children({ props })}
							<FormLabel for="description">{m.events_form_description()}</FormLabel>
							<Textarea
								id="description"
								name={props.name}
								bind:value={$formData.description}
								placeholder={m.events_form_description_placeholder()}
								aria-invalid={$errors.description ? 'true' : undefined}
							/>
						{/snippet}
					</FormControl>
					<FormFieldErrors />
				</div>
			</FormField>

			<FormField {form} name="location">
				<div class="space-y-2">
					<FormControl>
						{#snippet children({ props })}
							<FormLabel for="location">{m.events_form_location()}</FormLabel>
							<Input
								type="text"
								id="location"
								name={props.name}
								bind:value={$formData.location}
								placeholder={m.events_form_location_placeholder()}
								aria-invalid={$errors.location ? 'true' : undefined}
							/>
						{/snippet}
					</FormControl>
					<FormFieldErrors />
				</div>
			</FormField>

			<div class="flex justify-end">
				<Button type="submit">{m.events_form_submit()}</Button>
			</div>
		</form>
	</div>
</div>
