<script lang="ts">
    import { page } from '$app/stores';
    let { href, children } = $props();
    const active = $derived($page.url.pathname === href);
</script>

<a {href} class="flex items-center px-4 py-3 text-sm font-medium transition-colors hover:bg-gray-100 {active ? 'bg-gray-100 text-primary' : 'text-gray-600'} group">
    {@render children?.()}
</a>
