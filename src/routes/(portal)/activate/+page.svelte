<!-- Use Svelte 5 syntax -->
<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { Loader2 } from 'lucide-svelte';

	$effect(() => {
		document.title = m.activation_title();
	});
</script>

<div class="container flex min-h-screen items-center justify-center">
	<div class="w-full max-w-md space-y-4">
		<Alert>
			<AlertTitle>
				<div class="flex items-center gap-2">
					<Loader2 class="h-4 w-4 animate-spin" />
					{m.activation_title()}
				</div>
			</AlertTitle>
			<AlertDescription>{m.activation_processing()}</AlertDescription>
		</Alert>
	</div>
</div>
