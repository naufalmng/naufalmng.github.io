/* main.js — gabungan TOC, appear, theme-toggle, dan mobile hamburger/drawer */
document.addEventListener('DOMContentLoaded', function () {
  /* -----------------------
     TOC & appear-on-scroll
     ----------------------- */
  const tocbox = document.querySelector('.toc-box')
  var headers = document.querySelectorAll('.subject-name')

  if (tocbox && headers.length) {
    headers.forEach(h => {
      let tocItem = document.createElement('li')
      // gunakan id yang aman (hapus karakter aneh agar valid sebagai id)
      const safeText = h.textContent
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9\-_]/g, '')
      tocItem.id = 'toc-id-' + safeText

      let itemLink = document.createElement('a')
      itemLink.classList.add('content-link')
      itemLink.textContent = h.textContent
      itemLink.href = '#' // agar kursornya menunjukkan clickable (kami smooth-scroll manual)

      tocItem.append(itemLink)

      tocItem.addEventListener('click', function (ev) {
        ev.preventDefault()
        h.scrollIntoView({
          behavior: 'smooth'
        })
      })

      tocbox.append(tocItem)
    })
  }

  var contents = document.querySelectorAll('.subject, .item')

  setInterval(function () {
    var scrollPos =
      document.documentElement.scrollTop || document.body.scrollTop
    var wh = window.innerHeight

    if (tocbox) {
      Array.from(tocbox.querySelectorAll('li')).forEach(function (tocItem) {
        tocItem.classList.remove('active')
      })
    }

    var currHead

    Array.from(headers).forEach(function (h) {
      let headPos = h.getBoundingClientRect().top + window.scrollY - wh / 2

      if (scrollPos > headPos) currHead = h
    })

    Array.from(contents).forEach(function (c) {
      let contentPos = c.getBoundingClientRect().top + window.scrollY - wh

      if (c.classList.contains('appear')) return

      if (scrollPos < contentPos) return

      c.classList.add('appear')
    })

    if (currHead != undefined && tocbox) {
      const safeText = currHead.textContent
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9\-_]/g, '')
      let tocLink = document.getElementById('toc-id-' + safeText)
      if (tocLink) tocLink.classList.add('active')
    }
  }, 200)
}) // end DOMContentLoaded
;(function () {
  const onReady = fn =>
    document.readyState === 'loading'
      ? document.addEventListener('DOMContentLoaded', fn)
      : fn()

  onReady(function () {
    const KEY = 'theme'
    const root = document.documentElement
    const btn = document.getElementById('theme-toggle')

    // kalau tombol gak ada, jangan error
    if (!btn || !root) return

    const stored = localStorage.getItem(KEY)
    const prefersDark =
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    const initial =
      stored ||
      root.getAttribute('data-theme') ||
      (prefersDark ? 'dark' : 'light')
    root.setAttribute('data-theme', initial)

    const syncIcon = () => {
      const mode = root.getAttribute('data-theme')
      btn.textContent = mode === 'dark' ? '☀️' : '🌙'
      btn.setAttribute('aria-pressed', mode === 'dark')
    }
    syncIcon()

    btn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
      root.setAttribute('data-theme', next)
      localStorage.setItem(KEY, next)
      syncIcon()
    })

    // follow OS jika user belum pilih manual
    if (!stored && window.matchMedia) {
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', e => {
          root.setAttribute('data-theme', e.matches ? 'dark' : 'light')
          syncIcon()
        })
    }
  })
})()(
  /* ===== mobile: keep sidebar positioned under header and follow on scroll ===== */
  function () {
    const sidebar = document.getElementById('sidebar')
    const contents = document.getElementById('contents')
    if (!sidebar) return

    // compute and set sidebar top so it sits below the header/profile area
    function syncSidebarTop () {
      // prefer a visible header/profile region
      const profile =
        document.querySelector('.profile-zone') ||
        document.querySelector('#about')
      let topOffset = 120 // fallback
      if (profile) {
        // bottom of profile relative to viewport + current page scroll = document y
        const rect = profile.getBoundingClientRect()
        // convert to px from top of viewport, then add small gap
        topOffset =
          Math.max(12, rect.bottom + window.scrollY) - window.scrollY + 12
        // rect.bottom is viewport coordinate; we want fixed top relative to viewport so use rect.bottom + 12
        topOffset = rect.bottom + 12
      }
      // constrain topOffset so sidebar doesn't go under very large header
      if (topOffset < 8) topOffset = 8
      sidebar.style.top = `${topOffset}px`

      // ensure contents padding-right matches sidebar width if width changed via CSS/media queries
      const sbWidth = Math.round(sidebar.getBoundingClientRect().width)
      if (contents) {
        contents.style.paddingRight = `${sbWidth + 32}px`
      }
    }

    // only activate behavior on small screens (mobile)
    function checkAndSync () {
      if (window.innerWidth <= 767) {
        // ensure fixed positioning (in case earlier css/script toggled something)
        sidebar.style.position = 'fixed'
        sidebar.style.right = '10px'
        syncSidebarTop()
      } else {
        // restore removal of inline styles on larger screens
        sidebar.style.position = ''
        sidebar.style.top = ''
        sidebar.style.right = ''
        if (contents) contents.style.paddingRight = ''
      }
    }

    // run initially
    checkAndSync()

    // listen to resize + orientation changes
    let _t
    window.addEventListener('resize', function () {
      clearTimeout(_t)
      _t = setTimeout(checkAndSync, 110)
    })
    window.addEventListener('orientationchange', () =>
      setTimeout(checkAndSync, 120)
    )

    // optional: keep top in sync on scroll (useful if header height collapses)
    window.addEventListener('scroll', function () {
      if (window.innerWidth <= 767) syncSidebarTop()
    })
  }
)()
