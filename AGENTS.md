# Maryland Business Online - AGENTS.md

This is a directory website for Maryland businesses, built using the Minted Directory Astro template. It provides a markdown-driven, SEO-optimized platform for listing businesses with features like search, tags, sponsored content, and multiple data source integrations.

## Project Overview

- **Framework**: Astro (static site generator)
- **UI**: Vue.js components with Tailwind CSS
- **Data Sources**: Supports markdown, JSON, CSV, Google Sheets, Notion, Airtable
- **Features**: SEO optimization, dark/light mode, programmatic SEO, search and filtering
- **Deployment**: Static site (built with `yarn build`)

## Development Setup

- Install dependencies: `yarn install`
- Start dev server: `yarn dev`
- Build for production: `yarn build` (includes `astro check`)
- Preview build: `yarn preview`

## Code Style Guidelines

- Use TypeScript for all new components and utilities
- Follow Vue 3 composition API patterns
- Use Tailwind CSS for styling with custom CSS variables for theming
- Component files: `.astro` for pages/layouts, `.vue` for interactive components
- File organization: Pages in `src/pages/`, components in `src/components/`, data in `src/data/`

## Adding Content

- **Markdown listings**: Add `.md` files to `src/content/directory/` with frontmatter including `title`, `description`, and other metadata
- **Alternative formats**: JSON (`src/content/directory/directory.json`), CSV (`src/content/directory/directory.csv`), or external sources (Google Sheets, Notion, Airtable)
- Content is loaded at build time for optimal performance

## Customization

- **Styles**: Modify CSS variables in `src/styles/` for colors and fonts
- **Fonts**: Install from Fontsource, import in `Base.astro`, update `--font-sans` variable
- **Settings**: Configure site-wide options in `src/config/config.json`
- **Themes**: Pre-made themes available (spearmint, peppermint)

## Testing and Quality

- Run type checking: `astro check` (included in build)
- Ensure all listings have required frontmatter fields
- Test search and filtering functionality
- Verify responsive design across devices

## Deployment

- Build generates static files in `dist/`
- Deploy to any static hosting service (Vercel, Netlify, etc.)
- Rebuild required when content changes to update listings

## Security Considerations

- Validate all external data sources (Google Sheets, Airtable, etc.)
- Sanitize user-generated content if added
- Keep dependencies updated for security patches

## Development Stipulations

- All new changes must adhere to the whiteboarding skill.md and be approved by the user before implementation
- No code modifications without first planning through whiteboarding and obtaining explicit user consent

## Best Practices

- Use semantic HTML in Astro components
- Optimize images with Astro's built-in optimization
- Follow SEO best practices for meta tags and structured data
- Keep component props typed with TypeScript
- Use Vue's reactivity features appropriately for interactive elements
