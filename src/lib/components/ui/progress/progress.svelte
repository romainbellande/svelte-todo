<script lang="ts">
	import { Progress as ProgressPrimitive, type WithoutChildrenOrChild } from 'bits-ui';
	import { cn } from '$lib/utils.js';

	type Props = WithoutChildrenOrChild<ProgressPrimitive.RootProps> & {
		indicatorColor?: string;
	};

	let {
		ref = $bindable(null),
		class: className,
		max = 100,
		value,
		indicatorColor = 'bg-primary',
		...restProps
	}: Props = $props();
</script>

<ProgressPrimitive.Root
	bind:ref
	class={cn('relative h-4 w-full overflow-hidden rounded-full bg-secondary', className)}
	{value}
	{max}
	{...restProps}
>
	<div
		class={cn('h-full w-full flex-1 transition-all', indicatorColor)}
		style={`transform: translateX(-${100 - (100 * (value ?? 0)) / (max ?? 1)}%)`}
	></div>
</ProgressPrimitive.Root>
