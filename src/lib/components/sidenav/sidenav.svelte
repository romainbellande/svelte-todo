<script lang="ts">
	import SidenavTop from './sidenav-top.svelte';
	import SidenavItem from './sidenav-item.svelte';
	import { Home, LayoutDashboard, Package } from 'lucide-svelte';
</script>

<aside
	class="fixed inset-y-0 left-0 z-50 hidden w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out md:block"
>
	<div class="flex h-full flex-col">
		<SidenavTop />
		<nav class="flex-1 space-y-1 px-2 py-4">
			<SidenavItem href="/">
				<Home class="mr-3 h-5 w-5" />
				Home
			</SidenavItem>
			<SidenavItem href="/boards">
				<LayoutDashboard class="mr-3 h-5 w-5" />
				Boards
			</SidenavItem>
			<SidenavItem href="/inventory">
				<Package class="mr-3 h-5 w-5" />
				Inventory
			</SidenavItem>
		</nav>
	</div>
</aside>
