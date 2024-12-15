<script lang="ts">
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
</script>

<div class="container flex min-h-screen items-center justify-center">
	<div class="w-full max-w-md space-y-4">
		<div class="space-y-2 text-center">
			<h1 class="text-2xl font-semibold tracking-tight">Change Password</h1>
			<p class="text-sm text-muted-foreground">Please set a new password for your account</p>
		</div>

		<form method="POST" class="space-y-4" use:enhance>
			<FormField {form} name="password">
				<div class="space-y-2">
					<FormControl>
						{#snippet children({ props })}
							<FormLabel for="password">New Password</FormLabel>
							<Input
								{...props}
								type="password"
								bind:value={$formData.password}
								placeholder="Enter your new password"
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
								placeholder="Confirm your new password"
							/>
						{/snippet}
					</FormControl>
					<FormFieldErrors />
				</div>
			</FormField>

			<Button type="submit" class="w-full">Change Password</Button>
		</form>
	</div>
</div>
