document.addEventListener('DOMContentLoaded', function () {
  const tocbox = document.querySelector('.toc-box')
  var headers = document.querySelectorAll('.subject-name')

  headers.forEach(h => {
    let tocItem = document.createElement('li')
    tocItem.id = 'toc-id-' + h.textContent

    let itemLink = document.createElement('a')
    itemLink.classList.add('content-link')
    itemLink.textContent = h.textContent

    tocItem.append(itemLink)

    tocItem.addEventListener('click', function () {
      h.scrollIntoView({
        behavior: 'smooth'
      })
    })

    tocbox.append(tocItem)
  })

  var contents = document.querySelectorAll('.subject, .item')

  setInterval(function () {
    var scrollPos = document.documentElement.scrollTop
    var wh = window.innerHeight

    Array.from(tocbox.querySelectorAll('li')).forEach(function (tocItem) {
      tocItem.classList.remove('active')
    })

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

    if (currHead != undefined) {
      let tocLink = document.getElementById('toc-id-' + currHead.textContent)
      tocLink.classList.add('active')
    }
  }, 200)
})

// === THEME TOGGLE (safe) ===
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
})()
