<!-- Use Svelte 5 syntax -->
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { FormField, FormControl, FormLabel, FormDescription } from '$lib/components/ui/form';
	import FormFieldErrors from '@/components/ui/form/form-field-errors.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';
	import { superForm } from 'sveltekit-superforms/client';

	type Props = {
		data: PageData;
	};

	const { data }: Props = $props();
	const form = superForm(data.form);
	const { enhance } = form;
	const user = $derived(data.user);

	$effect(() => {
		document.title = m.referendums_new_title();
	});
</script>

<div class="container max-w-2xl space-y-8 py-8">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-4xl font-bold">{m.referendums_new_title()}</h1>
			<p class="mt-2 text-muted-foreground">
				{m.referendums_new_subtitle()}
			</p>
		</div>
	</div>

	<form method="POST" class="space-y-6" use:enhance>
		<input type="hidden" name="createdById" value={user.id} />

		<FormField {form} name="title">
			<div class="space-y-2">
				<FormControl>
					{#snippet children({ props })}
						<FormLabel for="title">{m.referendums_form_title()}</FormLabel>
						<Input {...props} type="text" placeholder={m.referendums_form_title_placeholder()} />
					{/snippet}
				</FormControl>
				<FormFieldErrors />
			</div>
		</FormField>

		<FormField {form} name="description">
			<div class="space-y-2">
				<FormControl>
					{#snippet children({ props })}
						<FormLabel for="description">{m.referendums_form_description()}</FormLabel>
						<Textarea {...props} placeholder={m.referendums_form_description_placeholder()} />
					{/snippet}
				</FormControl>
				<FormFieldErrors />
			</div>
		</FormField>

		<div class="grid grid-cols-2 gap-6">
			<FormField {form} name="fromDate">
				<div class="space-y-2">
					<FormControl>
						{#snippet children({ props })}
							<FormLabel for="fromDate">{m.referendums_form_from_date()}</FormLabel>
							<Input {...props} type="datetime-local" />
						{/snippet}
					</FormControl>
					<FormDescription>{m.referendums_form_from_date_description()}</FormDescription>
					<FormFieldErrors />
				</div>
			</FormField>

			<FormField {form} name="toDate">
				<div class="space-y-2">
					<FormControl>
						{#snippet children({ props })}
							<FormLabel for="toDate">{m.referendums_form_to_date()}</FormLabel>
							<Input {...props} type="datetime-local" />
						{/snippet}
					</FormControl>
					<FormDescription>{m.referendums_form_to_date_description()}</FormDescription>
					<FormFieldErrors />
				</div>
			</FormField>
		</div>

		<div class="mt-6 flex justify-end gap-4">
			<Button href="/referendums" variant="outline">
				{m.common_cancel()}
			</Button>
			<Button type="submit">
				{m.common_create()}
			</Button>
		</div>
	</form>
</div>
