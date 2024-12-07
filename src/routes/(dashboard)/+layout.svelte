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
	<div>
		<Sidenav />
		<Main>
			<Header />
			{@render children()}
		</Main>
	</div>
</ParaglideJS>
