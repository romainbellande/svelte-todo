<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { FormField, FormControl, FormLabel, FormFieldErrors } from '$lib/components/ui/form';
	import { superForm } from 'sveltekit-superforms/client';
	import type { PageData } from './$types';
	import { Download } from 'lucide-svelte';
	import { page } from '$app/stores';

	type Props = {
		data: PageData;
	};

	const { data }: Props = $props();
	const billingFileKey = $derived(data.item?.billingFileKey);
	const form = superForm(data.billingForm);
	const { enhance } = form;
</script>

<div class="mt-6 border-t pt-6">
	<div class="mb-4 flex items-center justify-between">
		<h2 class="text-xl font-semibold">Billing Document</h2>
		{#if billingFileKey}
			<a href="/inventory/{$page.params.id}/download-billing" target="_blank">
				<Button variant="outline" class="gap-2">
					<Download class="h-4 w-4" />
					Download
				</Button>
			</a>
		{/if}
	</div>

	<form
		method="POST"
		action="?/uploadBilling"
		enctype="multipart/form-data"
		class="space-y-4"
		use:enhance
	>
		<div class="space-y-2">
			<FormField {form} name="billingFile">
				<FormControl>
					<FormLabel for="billingFile">Billing File</FormLabel>
					<Input
						type="file"
						id="billingFile"
						name="billingFile"
						accept=".pdf,.doc,.docx,.xls,.xlsx"
					/>
				</FormControl>
				<FormFieldErrors />
			</FormField>
		</div>

		<div class="flex justify-end">
			<Button type="submit">Upload Document</Button>
		</div>
	</form>
</div>
