<script lang="ts">
     import { page } from '$app/stores';
	import { cn } from '@/utils';
     import type { HTMLLinkAttributes } from 'svelte/elements';

    let { href, children }: HTMLLinkAttributes = $props();
</script>
<a
    href={href}
    class={cn({ 'bg-secondary/80': $page.url.pathname === href }, 'w-full inline-flex items-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 text-xs h-12 justify-start text-wrap rounded-none px-6')}>
    {@render children?.()}
</a>