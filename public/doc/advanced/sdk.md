# JS SDK

Understand how the JS SDK works help you integrate Cusdis to an existed system.

To embed the comment widget to your web page, you need to put **the element and JS SDK** on the page, at the position where you want to embed to:

```html
<!-- Enhanced Cusdis Embed Code -->
<!-- You can customize the element ID and page slug will be auto-detected -->
<div id="cusdis_thread"
  data-host="https://cusdis.com"
  data-app-id="{{ APP_ID }}"
  data-page-id="{{ PAGE_ID }}"
  data-page-url="{{ PAGE_URL }}"
  data-page-title="{{ PAGE_TITLE }}"
  data-auto-page-slug="true"
></div>
<script>
  // Optional: Custom element ID (uncomment and modify if needed)
  // window.cusdisElementId = 'my-custom-comment-section';

  // Optional: Auto-detect page slug from URL or meta tags
  // window.cusdisAutoPageSlug = function() {
  //   // Method 1: From URL pathname
  //   return window.location.pathname.replace(/\\/+/g, '-').replace(/^-|-$/g, '') || 'home';
  //
  //   // Method 2: From meta tag
  //   // return document.querySelector('meta[name="page-slug"]')?.content || 'default';
  //
  //   // Method 3: From canonical URL
  //   // const canonical = document.querySelector('link[rel="canonical"]')?.href;
  //   // return canonical ? new URL(canonical).pathname : window.location.pathname;
  // };
</script>
<script async defer src="https://cusdis.com/js/cusdis.es.js"></script>
```

> If you are using self-hosted Cusdis, remember changing the `data-host` and the host in `<script>` to your own domain

## How it Works

1. The SDK will find the element with id `cusdis_thread`, then mount the widget on it.
2. The SDK request the comments for the page with id `data-page-id`, in the website with id (`data-app-id`)
3. When user post a comment, the SDK send a POST request to the API server with the attributes.

## Enhanced Features

### Custom Element ID

You can use any CSS selector to target your comment container:

```javascript
// Using ID
window.cusdisElementId = 'my-custom-comments';

// Using class
window.cusdisElementId = '.comment-section';

// Using data attribute
window.cusdisElementId = '[data-comments="cusdis"]';

// Using complex CSS selector
window.cusdisElementId = 'main .post-footer .comments';
```

### Automatic Page Slug Detection

Enable automatic page slug detection with `data-auto-page-slug="true"`:

```html
<div id="cusdis_thread"
  data-host="https://cusdis.com"
  data-app-id="{{ APP_ID }}"
  data-auto-page-slug="true"
  data-page-url="{{ PAGE_URL }}"
  data-page-title="{{ PAGE_TITLE }}"
></div>
```

The system will automatically detect the page slug using these methods (in order):

1. **Meta tag**: `<meta name="page-slug" content="my-page-slug">`
2. **Canonical URL**: From `<link rel="canonical" href="...">`
3. **Current URL**: From `window.location.pathname`

You can also provide a custom detection function:

```javascript
window.cusdisAutoPageSlug = function() {
  // Your custom logic here
  return 'custom-page-slug';
};
```

## Attributes Reference

- `data-host` **(required)** API server host.
- `data-app-id` **(required)** The website ID.
- `data-page-id` **(required)** Current page ID. Used to identity your page. Should be unique in a website. Such as page slug, permalink.
- `data-page-url` Current page URL. Used to display on dashboard.
- `data-page-title` Current page title. Used to display on dashboard.
- `data-theme`
  - `light` (default)
  - `auto` Automatically set theme by `prefers-color-scheme`
  - `dark`
- `data-auto-page-slug` **(new)** Enable automatic page slug detection. Default: `false`

## API

Cusdis exposes some global APIs on `window.CUSDIS`:

#### window.CUSDIS.initial()

Initialize widget.

#### window.CUSDIS.renderTo(target: HTMLElement)

Render widget to specific DOM element.

#### window.CUSDIS.setTheme(theme: 'dark' | 'light' | 'auto')

Manually set theme.

#### window.cusdisElementId

**(new)** Custom CSS selector for targeting the comment container element.

#### window.cusdisAutoPageSlug

**(new)** Custom function for automatic page slug detection. 
