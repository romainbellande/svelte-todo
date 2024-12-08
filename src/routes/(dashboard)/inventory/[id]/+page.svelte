<script lang="ts">
    import { page } from '$app/stores';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { FormField, FormControl, FormLabel } from '$lib/components/ui/form';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '$lib/components/ui/select';
    import type { PageData } from './$types';
    import { superForm } from 'sveltekit-superforms/client';

    type Props = {
        data: PageData;
    };

    const { data }: Props = $props();
    const isNew = $derived($page.params.id === 'new');
    
    const form = superForm(data.form)
    const { form: formData, enhance, errors } = form
</script>

<div class="container mx-auto py-6">
    <h1 class="text-3xl font-bold mb-6">{isNew ? 'New Item' : 'Edit Item'}</h1>

    <div class="bg-white rounded-lg shadow p-6 max-w-xl">
        <form method="POST" action="?/save" class="space-y-4" use:enhance>
            <FormField {form} name="name">
                <div class="space-y-2">
                    <FormControl>
                        <FormLabel for="name">Name</FormLabel>
                        <Input 
                            id="name" 
                            name="name" 
                            bind:value={$formData.name} 
                            aria-invalid={$errors.name ? 'true' : undefined}
                        />
                    </FormControl>
                    {#if $errors.name}
                        <p class="text-sm text-red-500">{$errors.name}</p>
                    {/if}
                </div>
            </FormField>

            <FormField {form} name="reference">
                <div class="space-y-2">
                    <FormControl>
                        <FormLabel for="reference">Reference</FormLabel>
                        <Input 
                            id="reference" 
                            name="reference" 
                            bind:value={$formData.reference}
                            aria-invalid={$errors.reference ? 'true' : undefined}
                        />
                    </FormControl>
                    {#if $errors.reference}
                        <p class="text-sm text-red-500">{$errors.reference}</p>
                    {/if}
                </div>
            </FormField>

            <FormField {form} name="assigneeId">
                <div class="space-y-2">
                    <FormControl>
                        <FormLabel for="assignee">Assignee</FormLabel>
                        <Select name="assigneeId">
                            <SelectTrigger>
                                <SelectValue placeholder="Select an assignee" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">None</SelectItem>
                                {#each data.users as user}
                                    <SelectItem value={user.id}>{user.name}</SelectItem>
                                {/each}
                            </SelectContent>
                        </Select>
                    </FormControl>
                </div>
            </FormField>

            <div class="flex justify-end space-x-2 pt-4">
                <Button href="/inventory" variant="outline">Cancel</Button>
                <Button type="submit">{isNew ? 'Create' : 'Save'}</Button>
            </div>
        </form>
    </div>
</div>
