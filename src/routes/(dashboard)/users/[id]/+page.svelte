<!-- Use Svelte 5 syntax -->
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { FormField, FormControl, FormLabel } from '$lib/components/ui/form';
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';
	import { superForm } from 'sveltekit-superforms/client';
	import FormFieldErrors from '@/components/ui/form/form-field-errors.svelte';
	import BackButton from '$lib/components/ui/back-button.svelte';
	import { page } from '$app/stores';

	type Props = {
		data: PageData;
	};

	const { data }: Props = $props();
	const isNew = $page.params.id === 'new';

	const form = superForm(data.form);
	const { form: formData, enhance, errors } = form;

	$effect(() => {
		document.title = isNew ? m.users_new_title() : m.users_edit_title();
	});
</script>

<div class="container space-y-8 py-8">
	<div class="flex items-center justify-between">
		<h1 class="text-4xl font-bold">{isNew ? m.users_new_title() : m.users_edit_title()}</h1>
		<BackButton href="/users" />
	</div>

	<div class="max-w-2xl">
		<form method="POST" action={isNew ? '?/create' : '?/update'} class="space-y-6" use:enhance>
			<FormField {form} name="firstname">
				<div class="space-y-2">
					<FormControl>
						{#snippet children({ props })}
							<FormLabel for="firstname">{m.users_firstname()}</FormLabel>
							<Input
								type="text"
								id="firstname"
								name={props.name}
								bind:value={$formData.firstname}
								aria-invalid={$errors.firstname ? 'true' : undefined}
							/>
						{/snippet}
					</FormControl>
					<FormFieldErrors />
				</div>
			</FormField>

			<FormField {form} name="lastname">
				<div class="space-y-2">
					<FormControl>
						{#snippet children({ props })}
							<FormLabel for="lastname">{m.users_lastname()}</FormLabel>
							<Input
								type="text"
								id="lastname"
								name={props.name}
								bind:value={$formData.lastname}
								aria-invalid={$errors.lastname ? 'true' : undefined}
							/>
						{/snippet}
					</FormControl>
					<FormFieldErrors />
				</div>
			</FormField>

			<FormField {form} name="email">
				<div class="space-y-2">
					<FormControl>
						{#snippet children({ props })}
							<FormLabel for="email">{m.users_email()}</FormLabel>
							<Input
								type="email"
								id="email"
								name={props.name}
								bind:value={$formData.email}
								aria-invalid={$errors.email ? 'true' : undefined}
							/>
						{/snippet}
					</FormControl>
					<FormFieldErrors />
				</div>
			</FormField>

			<div class="flex justify-end">
				<Button type="submit">{m.common_save()}</Button>
			</div>
		</form>
	</div>
</div>
