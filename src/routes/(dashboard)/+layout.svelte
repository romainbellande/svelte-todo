<script lang="ts">
	import { i18n } from "$lib/i18n";
	import { ParaglideJS } from "@inlang/paraglide-sveltekit";
	import '../../app.css';
	import { Sidenav } from '@/components/sidenav';
	import { Header } from '@/components/header';
	import Main from '$lib/components/main.svelte';
	let { children } = $props();
</script>

<ParaglideJS {i18n}>
	<div class="min-h-screen bg-gray-50">
		<Sidenav />
		<Main>
			<div class="flex flex-col h-full">
				<Header />
				<div class="flex-1 p-6 overflow-auto">
					<div class="container mx-auto">
						{@render children()}
					</div>
				</div>
			</div>
		</Main>
	</div>
</ParaglideJS>
