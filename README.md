# Astro + React + Prisma TODO app

## How to run
```bash
$ pnpm install
$ pnpm prisma:migrate

$ pnpm dev
```

### How to run tests
```bash
$ pnpm test
```

### Why React
I was told that using React instead of Svelte does fit the requirements of this assignment

## Key choices

### Calling Astro actions
I chose to use React 19 hooks and `experimental_withState` wrapper as it represents the way how this communication will be done in the future in SSR based applications (would I use it on prod now? Probably not)

Another possible way is to call them directly and track its state manually.

### Working with data
I chose to follow the Astro way of working with data in SSR-first way:
- Data is received directly in the Astro component and passed to the React component as props
- Data is updated by reloading the page which works seamlessly with View Transitions

Another possible way is to preload data and update the state on the client side on CRUD operations (which is a common way in React apps).
See example in `src/components/TasksListVariant.tsx` and `src/pages/tasks-variation` for a possible implementation. 
But it would still require to keep some state like filters in the URL to meet _"Ensure the front end uses server-side rendering (SSR) for optimal performance and SEO.
"_

## Advantages
- The app is implemented in the Astro way: almost zero JS on the client besides React itself (could be without client React bundle with a few tweaks), SSR-first and SEO friendly, no need for a state manager
- Future-proof: uses the latest React and Astro features
- Great UX with animated transitions and combined view/edit mode

## Caveats
- It allows to create empty tasks by design as we create a task first and then edit it, it fits perfectly for this app but something to keep in mind in a real-world app.
Probably a good UX would be to delete the task if it's empty after the user leaves the title field and a description/date field is not filled or focused.
- A bit of blinking on task cards
- If any errors during the task update action it rolls back original form state (React action does call form.reset() even on error for some reason https://github.com/facebook/react/issues/29034)
- When a task update causes to reload the page, scroll position is lost
- a11y is not perfect
- Transitions could be disabled
- it expects both a good internet connection and a fast server response time, otherwise for an app like this I'd use a local state and optimistic updates