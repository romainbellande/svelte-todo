<script lang="ts">
	import { Button } from './button';
	import { ArrowLeft } from 'lucide-svelte';

	type Props = {
		href: string;
	};

	const { href }: Props = $props();
</script>

<a {href} class="inline-block">
	<Button variant="outline" class="gap-2">
		<ArrowLeft class="h-4 w-4" />
		Back
	</Button>
</a>
