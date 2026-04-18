# Your Tools Web

A landing page for Your Tools, built with Astro and Tailwind CSS v4.

## Development

Install dependencies and start the dev server:

```sh
pnpm install
pnpm dev
```

## Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `pnpm install`             | Installs dependencies                            |
| `pnpm dev`             | Starts local dev server at `localhost:4321`      |
| `pnpm build`           | Build your production site to `./dist/`          |
| `pnpm preview`         | Preview your build locally, before deploying     |
| `pnpm astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `pnpm astro -- --help` | Get help using the Astro CLI                     |

## Notes

- Global styles are imported from [src/layouts/Layout.astro](/Users/hpatel/.t3/worktrees/your-tools-web/t3code-cbd7f5d1/src/layouts/Layout.astro:1).
- The waitlist form is currently a local-first preview that stores submissions in `localStorage` until a real email backend is connected.
