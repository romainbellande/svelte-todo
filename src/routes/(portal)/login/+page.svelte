<script lang="ts">
	import { page } from '$app/stores';
	import * as m from '$lib/paraglide/messages';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { FormField, FormControl, FormLabel } from '$lib/components/ui/form';
	import { Check } from 'lucide-svelte';
	import { superForm } from 'sveltekit-superforms/client';
	import type { PageData } from './$types';
	import FormFieldErrors from '@/components/ui/form/form-field-errors.svelte';

	type Props = {
		data: PageData;
	};

	const { data }: Props = $props();

	const form = superForm(data.form);

	const { form: formData, enhance, errors } = form;

	const showActivationSuccess = $state($page.url.searchParams.get('activated') === 'true');

	$effect(() => {
		document.title = m.login_title();
	});
</script>

<div class="container flex min-h-screen items-center justify-center">
	<div class="w-full max-w-md space-y-4">
		{#if showActivationSuccess}
			<Alert variant="success">
				<Check class="h-4 w-4" />
				<AlertDescription>{m.activation_success()}</AlertDescription>
			</Alert>
		{/if}

		<div class="space-y-2 text-center">
			<h1 class="text-2xl font-semibold tracking-tight">{m.login_title()}</h1>
			<p class="text-sm text-muted-foreground">{m.login_subtitle()}</p>
		</div>

		<form method="POST" action="?/login" class="space-y-4" use:enhance>
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

			<FormField {form} name="password">
				<div class="space-y-2">
					<FormControl>
						{#snippet children({ props })}
							<FormLabel for="password">{m.form_password()}</FormLabel>
							<Input
								{...props}
								type="password"
								bind:value={$formData.password}
								aria-invalid={$errors.password ? 'true' : undefined}
							/>
						{/snippet}
					</FormControl>
					<FormFieldErrors />
				</div>
			</FormField>

			<div class="space-y-2">
				<Button type="submit" class="w-full">{m.login_button()}</Button>
			</div>
		</form>
	</div>
</div>
