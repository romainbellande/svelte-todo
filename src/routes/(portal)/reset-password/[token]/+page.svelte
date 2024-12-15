<script lang="ts">
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
			<p class="text-sm text-muted-foreground">Enter your new password below</p>
		</div>

		<form method="POST" action="?/reset" class="space-y-4" use:enhance>
			<FormField {form} name="password">
				<div class="space-y-2">
					<FormControl>
						{#snippet children({ props })}
							<FormLabel for="password">New Password</FormLabel>
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

			<FormField {form} name="confirmPassword">
				<div class="space-y-2">
					<FormControl>
						{#snippet children({ props })}
							<FormLabel for="confirmPassword">Confirm Password</FormLabel>
							<Input
								{...props}
								type="password"
								bind:value={$formData.confirmPassword}
								aria-invalid={$errors.confirmPassword ? 'true' : undefined}
							/>
						{/snippet}
					</FormControl>
					<FormFieldErrors />
				</div>
			</FormField>

			<div class="space-y-2">
				<Button type="submit" class="w-full">Reset Password</Button>
			</div>
		</form>
	</div>
</div>
