window.CUSDIS = {}

const makeIframeContent = (target) => {
  const host = target.dataset.host || 'https://cusdis.com'
  const iframeJsPath = target.dataset.iframe || `${host}/js/iframe.umd.js`
  const cssPath = `${host}/js/style.css`

  // Enhanced page slug detection
  let pageId = target.dataset.pageId

  // Auto-detect page slug if enabled
  if (target.dataset.autoPageSlug === 'true' && (!pageId || pageId === '{{ PAGE_ID }}')) {
    // Check for custom auto-detection function
    if (window.cusdisAutoPageSlug && typeof window.cusdisAutoPageSlug === 'function') {
      pageId = window.cusdisAutoPageSlug()
    } else {
      // Default auto-detection methods
      pageId = autoDetectPageSlug()
    }
    // Update the dataset for the iframe
    target.dataset.pageId = pageId
  }

  return `<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="${cssPath}">
    <base target="_parent" />
    <link>
    <script>
      window.CUSDIS_LOCALE = ${JSON.stringify(window.CUSDIS_LOCALE)}
      window.__DATA__ = ${JSON.stringify(target.dataset)}
    </script>
    <style>
      :root {
        color-scheme: light;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script src="${iframeJsPath}" type="module">

    </script>
  </body>
</html>`
}

// Enhanced auto-detection function for page slug
function autoDetectPageSlug() {
  try {
    // Method 1: Check for meta tag with page-slug
    const metaSlug = document.querySelector('meta[name="page-slug"]')?.content
    if (metaSlug) return metaSlug

    // Method 2: Check for canonical URL
    const canonical = document.querySelector('link[rel="canonical"]')?.href
    if (canonical) {
      try {
        const url = new URL(canonical)
        return url.pathname.replace(/\/+/g, '-').replace(/^-|-$/g, '') || 'home'
      } catch (e) {
        // Invalid URL, fall back to next method
      }
    }

    // Method 3: Use current URL pathname
    return window.location.pathname
      .replace(/\/+/g, '-') // Replace multiple slashes with single dash
      .replace(/^-|-$/g, '') // Remove leading/trailing dashes
      .replace(/[^a-zA-Z0-9-_]/g, '-') // Replace special chars with dash
      .replace(/-+/g, '-') // Replace multiple dashes with single dash
      .toLowerCase() || 'home'
  } catch (e) {
    // Fallback to 'default' if all methods fail
    return 'default'
  }
}

let singleTonIframe
function createIframe(target) {
  if (!singleTonIframe) {
    singleTonIframe = document.createElement('iframe')
    listenEvent(singleTonIframe, target)
  }
  // srcdoc dosen't work on IE11
  singleTonIframe.srcdoc = makeIframeContent(target)
  singleTonIframe.style.width = '100%'
  singleTonIframe.style.border = '0'

  return singleTonIframe
}

function postMessage(event, data) {
  if (singleTonIframe) {
    singleTonIframe.contentWindow.postMessage(
      JSON.stringify({
        from: 'cusdis',
        event,
        data,
      }),
    )
  }
}

function listenEvent(iframe, target) {
  const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')

  const onMessage = (e) => {
    try {
      const msg = JSON.parse(e.data)
      if (msg.from === 'cusdis') {
        switch (msg.event) {
          case 'onload':
            {
              if (target.dataset.theme === 'auto') {
                postMessage(
                  'setTheme',
                  darkModeQuery.matches ? 'dark' : 'light',
                )
              }
            }
            break
          case 'resize':
            {
              iframe.style.height = msg.data + 'px'
            }
            break
        }
      }
    } catch (e) {}
  }

  window.addEventListener('message', onMessage)

  function onChangeColorScheme(e) {
    const isDarkMode = e.matches
    if (target.dataset.theme === 'auto') {
      postMessage('setTheme', isDarkMode ? 'dark' : 'light')
    }
  }

  darkModeQuery.addEventListener('change', onChangeColorScheme)

  return () => {
    darkModeQuery.removeEventListener('change', onChangeColorScheme)
    window.removeEventListener('message', onMessage)
  }
}

function render(target) {
  if (target) {
    target.innerHTML = ''
    const iframe = createIframe(target)
    target.appendChild(iframe)
  }
}

// deprecated
window.renderCusdis = render

window.CUSDIS.renderTo = render

window.CUSDIS.setTheme = function (theme) {
  postMessage('setTheme', theme)
}

function initial() {
  let target

  // Enhanced element detection with multiple methods
  if (window.cusdisElementId) {
    // Support for CSS selectors (not just IDs)
    if (window.cusdisElementId.includes('#') || window.cusdisElementId.includes('.') || window.cusdisElementId.includes('[')) {
      target = document.querySelector(window.cusdisElementId)
    } else {
      // Legacy ID-only support
      target = document.querySelector(`#${window.cusdisElementId}`)
    }
  } else if (document.querySelector('#cusdis_thread')) {
    target = document.querySelector('#cusdis_thread')
  } else if (document.querySelector('#cusdis')) {
    console.warn(
      'id `cusdis` is deprecated. Please use `cusdis_thread` instead',
    )
    target = document.querySelector('#cusdis')
  }

  // Support for multiple widgets with data attributes
  if (!target) {
    const cusdisElements = document.querySelectorAll('[data-cusdis-widget]')
    if (cusdisElements.length > 0) {
      target = cusdisElements[0]
    }
  }

  if (window.CUSDIS_PREVENT_INITIAL_RENDER === true) {
  } else {
    if (target) {
      render(target)
    } else {
      console.warn('Cusdis: No target element found. Please add a div with id="cusdis_thread" or set window.cusdisElementId')
    }
  }
}

// initialize
window.CUSDIS.initial = initial

initial()
