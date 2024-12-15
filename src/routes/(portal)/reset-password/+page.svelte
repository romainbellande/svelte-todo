<script lang="ts">
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
		document.title = 'Reset Password';
	});
</script>

<div class="container flex min-h-screen items-center justify-center">
	<div class="w-full max-w-md space-y-4">
		<div class="space-y-2 text-center">
			<h1 class="text-2xl font-semibold tracking-tight">Reset Password</h1>
			<p class="text-sm text-muted-foreground">
				Enter your email address and we'll send you a link to reset your password.
			</p>
		</div>

		{#if $formData.success}
			<Alert variant="default">
				<AlertTitle>Check your email</AlertTitle>
				<AlertDescription>
					If an account exists with that email, we've sent you instructions to reset your password.
				</AlertDescription>
			</Alert>
		{/if}

		<form method="POST" class="space-y-4" use:enhance>
			<FormField {form} name="email">
				<div class="space-y-2">
					<FormControl>
						{#snippet children({ props })}
							<FormLabel for="email">Email</FormLabel>
							<Input
								{...props}
								type="email"
								bind:value={$formData.email}
								placeholder="name@example.com"
								aria-invalid={$errors.email ? 'true' : undefined}
							/>
						{/snippet}
					</FormControl>
					<FormFieldErrors />
				</div>
			</FormField>

			<div class="space-y-2">
				<Button type="submit" class="w-full">Send Reset Link</Button>
			</div>
		</form>

		<div class="text-center text-sm">
			<a href="/login" class="text-primary hover:underline">Back to login</a>
		</div>
	</div>
</div>
