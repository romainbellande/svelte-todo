<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Package2, Users, AlertCircle, ArrowUpRight } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
</script>

<div class="container mx-auto space-y-6 py-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">Dashboard</h1>
		</div>
	</div>

	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Total Items</CardTitle>
				<Package2 class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">123</div>
				<p class="text-xs text-muted-foreground">+2 from last week</p>
			</CardContent>
		</Card>
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Active Users</CardTitle>
				<Users class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">45</div>
				<p class="text-xs text-muted-foreground">+5 new users this month</p>
			</CardContent>
		</Card>
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Pending Actions</CardTitle>
				<AlertCircle class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">7</div>
				<p class="text-xs text-muted-foreground">3 require immediate attention</p>
			</CardContent>
		</Card>
	</div>

	<div class="grid gap-4 md:grid-cols-2">
		<Card>
			<CardHeader>
				<CardTitle>Recent Activity</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="space-y-4">
					{#each Array(5) as _}
						<div class="flex items-center">
							<div class="ml-4 space-y-1">
								<p class="text-sm font-medium leading-none">New item added to inventory</p>
								<p class="text-sm text-muted-foreground">2 hours ago</p>
							</div>
							<div class="ml-auto font-medium">
								<Button variant="ghost" size="sm" href="/inventory/123">
									View
									<ArrowUpRight class="ml-2 h-4 w-4" />
								</Button>
							</div>
						</div>
					{/each}
				</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Quick Actions</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="space-y-4">
					<Button variant="outline" class="w-full justify-start" href="/inventory">
						<Package2 class="mr-2 h-4 w-4" />
						View All Items
					</Button>
					<Button variant="outline" class="w-full justify-start" href="/inventory/new">
						<Package2 class="mr-2 h-4 w-4" />
						Add New Item
					</Button>
					<Button variant="outline" class="w-full justify-start">
						<Users class="mr-2 h-4 w-4" />
						Manage Users
					</Button>
					<Button variant="outline" class="w-full justify-start">
						<AlertCircle class="mr-2 h-4 w-4" />
						View Reports
					</Button>
				</div>
			</CardContent>
		</Card>
	</div>
</div>
