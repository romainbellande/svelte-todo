<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { cn } from '$lib/utils';
	import { ChevronDown } from 'lucide-svelte';
	import { slide } from 'svelte/transition';
	import type { User } from '$lib/types';

	let { user } = $props<{ user: User | null }>();
	let isMenuOpen = $state(false);

	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.user-menu')) {
			isMenuOpen = false;
		}
	}

	$effect(() => {
		if (isMenuOpen) {
			document.addEventListener('click', handleClickOutside);
			return () => document.removeEventListener('click', handleClickOutside);
		}
	});
</script>

<svelte:head>
	{#if isMenuOpen}
		<style>
			body {
				overflow: hidden;
			}
		</style>
	{/if}
</svelte:head>

<nav
	class="z-10 flex h-[var(--header-height)] items-center justify-between bg-background p-4 shadow-sm md:px-8"
>
	<div class="flex items-center gap-4">
		<a href="/" class="text-xl font-bold">Todo App</a>
	</div>

	{#if user}
		<div class="user-menu relative">
			<Button variant="ghost" class="flex items-center gap-2" onclick={toggleMenu}>
				<span data-test-id="header-user-email">{user.email}</span>
				<ChevronDown class={cn('h-4 w-4 transition-transform', isMenuOpen && 'rotate-180')} />
			</Button>

			{#if isMenuOpen}
				<div
					class="absolute right-0 top-full mt-2 w-48 rounded-md bg-background shadow-lg ring-1 ring-black ring-opacity-5"
					transition:slide={{ duration: 200 }}
				>
					<div class="py-1" role="menu" aria-orientation="vertical">
						<a href="/profile" class="block px-4 py-2 text-sm hover:bg-muted" role="menuitem">
							Profile
						</a>
						<a
							href="/reset-password"
							class="block px-4 py-2 text-sm hover:bg-muted"
							role="menuitem"
						>
							Reset Password
						</a>
						<form action="/logout" method="POST" class="border-t border-border">
							<button
								type="submit"
								class="block w-full px-4 py-2 text-left text-sm text-destructive hover:bg-muted"
								role="menuitem"
							>
								Sign out
							</button>
						</form>
					</div>
				</div>
			{/if}
		</div>
	{:else}
		<div class="flex items-center gap-4">
			<a href="/login">
				<Button variant="ghost">Sign in</Button>
			</a>
			<a href="/register">
				<Button>Sign up</Button>
			</a>
		</div>
	{/if}
</nav>
