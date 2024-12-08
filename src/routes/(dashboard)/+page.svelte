<script lang="ts">
    import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
    import { Package2, Users, AlertCircle, ArrowUpRight } from "lucide-svelte";
    import { Button } from "$lib/components/ui/button";
</script>

<div class="container mx-auto py-6 space-y-6">
    <div class="flex justify-between items-center">
        <div>
            <h1 class="text-3xl font-bold">Dashboard</h1>
        </div>
    </div>

    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
            <CardHeader class="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle class="text-sm font-medium">Total Items</CardTitle>
                <Package2 class="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div class="text-2xl font-bold">123</div>
                <p class="text-xs text-muted-foreground">
                    +2 from last week
                </p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader class="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle class="text-sm font-medium">Active Users</CardTitle>
                <Users class="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div class="text-2xl font-bold">45</div>
                <p class="text-xs text-muted-foreground">
                    +5 new users this month
                </p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader class="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle class="text-sm font-medium">Pending Actions</CardTitle>
                <AlertCircle class="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div class="text-2xl font-bold">7</div>
                <p class="text-xs text-muted-foreground">
                    3 require immediate attention
                </p>
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
                    {#each Array(5) as _, i}
                        <div class="flex items-center">
                            <div class="ml-4 space-y-1">
                                <p class="text-sm font-medium leading-none">
                                    New item added to inventory
                                </p>
                                <p class="text-sm text-muted-foreground">
                                    2 hours ago
                                </p>
                            </div>
                            <div class="ml-auto font-medium">
                                <Button variant="ghost" size="sm" href="/inventory/123">
                                    View
                                    <ArrowUpRight class="w-4 h-4 ml-2" />
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
                        <Package2 class="w-4 h-4 mr-2" />
                        View All Items
                    </Button>
                    <Button variant="outline" class="w-full justify-start" href="/inventory/new">
                        <Package2 class="w-4 h-4 mr-2" />
                        Add New Item
                    </Button>
                    <Button variant="outline" class="w-full justify-start">
                        <Users class="w-4 h-4 mr-2" />
                        Manage Users
                    </Button>
                    <Button variant="outline" class="w-full justify-start">
                        <AlertCircle class="w-4 h-4 mr-2" />
                        View Reports
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
</div>
