<script lang="ts">
	import { Sidenav } from '@/components/sidenav';
	import { Header } from '@/components/header';
	import Main from '$lib/components/main.svelte';

	let { data, children } = $props();
	const user = $derived(data.user);
</script>

<div class="min-h-screen bg-gray-50">
	<Sidenav />
	<Main>
		<div class="flex h-full flex-col">
			<Header {user} />
			<div class="flex-1 overflow-auto p-6">
				<div class="container mx-auto">
					{@render children()}
				</div>
			</div>
		</div>
	</Main>
</div>
