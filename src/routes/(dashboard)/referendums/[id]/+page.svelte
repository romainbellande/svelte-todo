<!-- Use Svelte 5 syntax -->
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import * as m from '$lib/paraglide/messages';
	import { cn, formatDate, getReferendumStatus } from '$lib/utils';
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';

	type Props = {
		data: PageData;
	};

	const { data }: Props = $props();
	const user = $derived(data.user);
	const referendum = $derived(data.referendum);

	const status = $derived(getReferendumStatus(data.referendum.fromDate, data.referendum.toDate));

	function hasUserVoted() {
		return referendum.votes.some((v) => v.userId === user.id);
	}

	function getVoteStats() {
		const total = referendum.votes.length;
		const yesVotes = referendum.votes.filter((v) => v.vote === 'yes').length;
		const noVotes = referendum.votes.filter((v) => v.vote === 'no').length;
		const blankVotes = referendum.votes.filter((v) => v.vote === 'blank').length;

		return {
			total,
			yesPercentage: total > 0 ? Math.round((yesVotes / total) * 100) : 0,
			noPercentage: total > 0 ? Math.round((noVotes / total) * 100) : 0,
			blankPercentage: total > 0 ? Math.round((blankVotes / total) * 100) : 0
		};
	}

	const stats = $derived(getVoteStats());
	const userHasVoted = $derived(hasUserVoted());

	$effect(() => {
		document.title = `${m.referendums_title()} - ${referendum.title}`;
	});
</script>

<div class="container max-w-4xl space-y-8 py-8">
	<div class="flex items-center justify-between">
		<div>
			<Button href="/referendums" variant="outline" class="mb-4">
				{m.common_back()}
			</Button>
			<h1 class="text-4xl font-bold">{referendum.title}</h1>
			<p class="mt-2 text-muted-foreground">
				{referendum.description}
			</p>
		</div>
	</div>

	<div class="grid gap-6 md:grid-cols-2">
		<Card>
			<CardHeader>
				<CardTitle>{m.referendums_details_info()}</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				<div>
					<div class="text-sm font-medium text-muted-foreground">
						{m.referendums_table_period()}
					</div>
					<div>
						{formatDate(referendum.fromDate)} - {formatDate(referendum.toDate)}
					</div>
				</div>
				<div>
					<div class="text-sm font-medium text-muted-foreground">
						{m.referendums_table_status()}
					</div>
					<div>
						<span
							class={cn(
								'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset',
								{
									'bg-green-50 text-green-700 ring-green-600/20': status === 'active',
									'bg-yellow-50 text-yellow-700 ring-yellow-600/20': status === 'upcoming',
									'bg-red-50 text-red-700 ring-red-600/20': status === 'ended'
								}
							)}
						>
							{status}
						</span>
					</div>
				</div>
				<div>
					<div class="text-sm font-medium text-muted-foreground">
						{m.referendums_details_created_by()}
					</div>
					<div>
						{referendum.createdBy.firstname}
						{referendum.createdBy.lastname}
					</div>
				</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>{m.referendums_details_results()}</CardTitle>
				<CardDescription>
					{stats.total}
					{m.referendums_details_total_votes()}
				</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="space-y-2">
					<div class="flex justify-between text-sm">
						<span class="text-green-700">{m.referendums_vote_yes()}</span>
						<span>{stats.yesPercentage}%</span>
					</div>
					<Progress
						value={stats.yesPercentage}
						class="bg-green-100"
						indicatorColor="bg-green-700"
					/>
				</div>
				<div class="space-y-2">
					<div class="flex justify-between text-sm">
						<span class="text-red-700">{m.referendums_vote_no()}</span>
						<span>{stats.noPercentage}%</span>
					</div>
					<Progress value={stats.noPercentage} class="bg-red-100" indicatorColor="bg-red-700" />
				</div>
				<div class="space-y-2">
					<div class="flex justify-between text-sm">
						<span class="text-gray-700">{m.referendums_vote_blank()}</span>
						<span>{stats.blankPercentage}%</span>
					</div>
					<Progress
						value={stats.blankPercentage}
						class="bg-gray-100"
						indicatorColor="bg-gray-700"
					/>
				</div>
			</CardContent>
		</Card>
	</div>

	{#if status === 'active' && !userHasVoted}
		<Card>
			<CardHeader>
				<CardTitle>{m.referendums_details_vote()}</CardTitle>
				<CardDescription>
					{m.referendums_details_vote_description()}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form method="POST" action="?/vote" class="flex gap-4" use:enhance>
					<input type="hidden" name="referendumId" value={referendum.id} />
					<Button
						type="submit"
						name="vote"
						value="yes"
						variant="outline"
						class="flex-1 bg-green-50 text-green-700 hover:bg-green-100"
					>
						{m.referendums_vote_yes()}
					</Button>
					<Button
						type="submit"
						name="vote"
						value="no"
						variant="outline"
						class="flex-1 bg-red-50 text-red-700 hover:bg-red-100"
					>
						{m.referendums_vote_no()}
					</Button>
					<Button
						type="submit"
						name="vote"
						value="blank"
						variant="outline"
						class="flex-1 bg-gray-50 text-gray-700 hover:bg-gray-100"
					>
						{m.referendums_vote_blank()}
					</Button>
				</form>
			</CardContent>
		</Card>
	{/if}

	<Card>
		<CardHeader>
			<CardTitle>{m.referendums_details_votes()}</CardTitle>
			<CardDescription>
				{m.referendums_details_votes_description()}
			</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="space-y-4">
				{#each referendum.votes as vote}
					<div class="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
						<div>
							<div>{vote.user.firstname} {vote.user.lastname}</div>
							<div class="text-sm text-muted-foreground">{formatDate(vote.createdAt)}</div>
						</div>
						<div>
							<span
								class={cn(
									'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset',
									{
										'bg-green-50 text-green-700 ring-green-600/20': vote.vote === 'yes',
										'bg-red-50 text-red-700 ring-red-600/20': vote.vote === 'no',
										'bg-gray-50 text-gray-700 ring-gray-600/20': vote.vote === 'blank'
									}
								)}
							>
								{vote.vote}
							</span>
						</div>
					</div>
				{/each}
			</div>
		</CardContent>
	</Card>
</div>
