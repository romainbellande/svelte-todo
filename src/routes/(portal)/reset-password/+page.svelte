<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import { FormField, FormControl, FormLabel } from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { superForm } from 'sveltekit-superforms/client';
	import type { PageData } from './$types';
	import FormFieldErrors from '@/components/ui/form/form-field-errors.svelte';

	type Props = {
		data: PageData;
	};

	const { data }: Props = $props();
	const form = superForm(data.form);
	const { form: formData, enhance, errors } = form;

	$effect(() => {
		document.title = m.reset_password_title();
	});
</script>

<div class="container flex min-h-screen items-center justify-center">
	<div class="w-full max-w-md space-y-4">
		<div class="space-y-2 text-center">
			<h1 class="text-2xl font-semibold tracking-tight">{m.reset_password_title()}</h1>
			<p class="text-sm text-muted-foreground">
				{m.reset_password_subtitle()}
			</p>
		</div>

		{#if $formData.success}
			<Alert variant="default">
				<AlertTitle>{m.reset_password_check_email_title()}</AlertTitle>
				<AlertDescription>
					{m.reset_password_check_email_description()}
				</AlertDescription>
			</Alert>
		{/if}

		<form method="POST" class="space-y-4" use:enhance>
			<FormField {form} name="email">
				<div class="space-y-2">
					<FormControl>
						{#snippet children({ props })}
							<FormLabel for="email">{m.form_email()}</FormLabel>
							<Input
								{...props}
								type="email"
								bind:value={$formData.email}
								placeholder={m.form_email_placeholder()}
								aria-invalid={$errors.email ? 'true' : undefined}
							/>
						{/snippet}
					</FormControl>
					<FormFieldErrors />
				</div>
			</FormField>

			<div class="space-y-2">
				<Button type="submit" class="w-full">{m.reset_password_send_link()}</Button>
			</div>
		</form>

		<div class="text-center text-sm">
			<a href="/login" class="text-primary hover:underline">{m.login_back()}</a>
		</div>
	</div>
</div>
