<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { FormField, FormControl, FormLabel } from '$lib/components/ui/form';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
	import type { PageData } from './$types';
	import { superForm } from 'sveltekit-superforms/client';
	import FormFieldErrors from '@/components/ui/form/form-field-errors.svelte';

	type Props = {
		data: PageData;
	};

	const { data }: Props = $props();
	const isNew = $derived($page.params.id === 'new');

	const form = superForm(data.form);
	const { form: formData, enhance, errors } = form;
	const assignee = $derived(() =>
		$formData.assigneeId
			? {
					label: data.users.find((u) => u.id === $formData.assigneeId)?.name,
					value: $formData.assigneeId
				}
			: undefined
	);
</script>

<div class="container mx-auto py-6">
	<h1 class="mb-6 text-3xl font-bold">{isNew ? 'New Item' : 'Edit Item'}</h1>

	<div class="max-w-xl rounded-lg bg-white p-6 shadow">
		<form method="POST" action="?/save" class="space-y-4" use:enhance>
			<FormField {form} name="name">
				<div class="space-y-2">
					<FormControl>
						{#snippet children({ props })}
							<FormLabel for="name">Name</FormLabel>
							<Input
								type="name"
								name={props.name}
								bind:value={$formData.name}
								aria-invalid={$errors.name ? 'true' : undefined}
							/>
						{/snippet}
					</FormControl>
					<FormFieldErrors />
				</div>
			</FormField>

			<FormField {form} name="reference">
				<div class="space-y-2">
					<FormControl>
						{#snippet children({ props })}
							<FormLabel for="reference">Reference</FormLabel>
							<Input
								type="reference"
								name={props.name}
								bind:value={$formData.reference}
							/>
						{/snippet}
					</FormControl>
					{#if $errors.reference}
						<p class="text-sm text-red-500">{$errors.reference}</p>
					{/if}
				</div>
			</FormField>

			<FormField {form} name="assigneeId">
				<div class="space-y-2">
					<FormControl>
						{#snippet children({ props })}
							<FormLabel for="assignee">Assignee</FormLabel>
							<Select
								type="single"
								name={props.name}
								bind:value={$formData.assigneeId}
							>
								<SelectTrigger {...props}>
									{ assignee()
										? assignee()?.label
										: 'Select assignee' }
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="">None</SelectItem>
									{#each data.users as user}
										<SelectItem value={user.id} label={user.name} />
									{/each}
								</SelectContent>
							</Select>
						{/snippet}
					</FormControl>
					<FormFieldErrors />
				</div>
			</FormField>

			<div class="flex justify-end space-x-2 pt-4">
				<Button href="/inventory" variant="outline">Cancel</Button>
				<Button type="submit">{isNew ? 'Create' : 'Save'}</Button>
			</div>
		</form>
	</div>
</div>
