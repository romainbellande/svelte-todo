<!-- Use Svelte 5 syntax -->
<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { FormField, FormControl, FormLabel } from '$lib/components/ui/form';
	import { superForm } from 'sveltekit-superforms/client';
	import type { PageData } from './$types';
	import FormFieldErrors from '@/components/ui/form/form-field-errors.svelte';

	type Props = {
		data: PageData;
	};

	const { data }: Props = $props();
	const form = superForm(data.form);
	const { form: formData, enhance } = form;

	$effect(() => {
		document.title = m.activation_title();
	});
</script>

<div class="container flex min-h-screen items-center justify-center">
	<div class="w-full max-w-md space-y-4">
		<div class="space-y-2 text-center">
			<h1 class="text-2xl font-semibold tracking-tight">{m.activation_title()}</h1>
			<p class="text-sm text-muted-foreground">{m.activation_subtitle()}</p>
		</div>

		<form method="POST" class="space-y-4" use:enhance>
			<FormField {form} name="password">
				<div class="space-y-2">
					<FormControl>
						{#snippet children({ props })}
							<FormLabel for="password">{m.form_password()}</FormLabel>
							<Input
								{...props}
								type="password"
								bind:value={$formData.password}
								placeholder={m.form_password_placeholder()}
							/>
						{/snippet}
					</FormControl>
					<FormFieldErrors />
				</div>
			</FormField>

			<FormField {form} name="confirmPassword">
				<div class="space-y-2">
					<FormControl>
						{#snippet children({ props })}
							<FormLabel for="confirmPassword">{m.form_confirm_password()}</FormLabel>
							<Input
								{...props}
								type="password"
								bind:value={$formData.confirmPassword}
								placeholder={m.form_confirm_password_placeholder()}
							/>
						{/snippet}
					</FormControl>
					<FormFieldErrors />
				</div>
			</FormField>

			<Button type="submit" class="w-full">{m.activation_button()}</Button>
		</form>
	</div>
</div>
