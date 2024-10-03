import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import IndexPage from './index.astro';

// TODO: No valid renderer was found for the `.tsx` file extension.
test('Index page', async () => {
  // const container = await AstroContainer.create();
  // const result = await container.renderToString(IndexPage, {});
});
