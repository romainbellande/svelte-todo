<script lang="ts">
    import SidenavTop from "./sidenav-top.svelte";
    import { SidenavItem } from "./sidenav-item";
</script>


<aside class="h-full overflow-auto flex flex-col fixed left-0 right-0 top-0 z-50 w-full border-r-2 border-r-muted transition-[width] md:bottom-0 md:right-auto md:h-svh md:w-64">
    <SidenavTop />
    <nav>
        <SidenavItem href="/">Home</SidenavItem>
    </nav>
</aside>