<script lang="ts">
	import * as t from '$lib/paraglide/messages';
</script>

<div class="flex items-center gap-3 border-b bg-white px-4 py-5">
	<div class="flex items-center gap-2">
		<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
			<span class="text-lg font-bold text-white">T</span>
		</div>
		<span class="text-lg font-semibold">{t.app_name()}</span>
	</div>
</div>
