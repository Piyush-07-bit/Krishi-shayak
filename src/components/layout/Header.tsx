import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Globe, Moon, Sun, User, LogIn, UserPlus } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Link } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [gtLoaded, setGtLoaded] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' },
    { code: 'de', label: 'Deutsch' },
    { code: 'it', label: 'Italiano' },
    { code: 'pt', label: 'Português' },
    { code: 'ar', label: 'العربية' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'zh-CN', label: '中文' }
  ];

  async function changeLanguage(code: string) {
    setSelectedLang(code);
    // Set googtrans cookie immediately so Google knows desired target (helps avoid auto-apply bugs)
    try {
      const domain = window.location.hostname;
      document.cookie = `googtrans=/en/${code};domain=${domain};path=/`;
      document.cookie = `googtrans=/en/${code};path=/`;
    } catch {}

    // Ensure widget loaded
    if (!(window as any).__googleTranslateInitialized) {
      await loadGoogleTranslate();
    }

    // Wait/poll for the internal combo to appear (widget may initialize asynchronously)
    let combo: HTMLSelectElement | null = null;
    for (let i = 0; i < 10; i++) {
      combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
      if (combo) break;
      // small delay before next check
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 200));
    }

    if (combo) {
      combo.value = code;
      combo.dispatchEvent(new Event('change'));
      // remove top banner if it appears - run a few times to catch Chrome timing
      try {
        for (let i = 0; i < 6; i++) {
          const banners = Array.from(document.querySelectorAll('.goog-te-banner-frame, .goog-te-balloon-frame, iframe.goog-te-banner-frame, iframe[src*="translate.google"]'));
          banners.forEach((b) => { try { (b as HTMLElement).style.display = 'none'; b.remove(); } catch {} });
          // eslint-disable-next-line no-await-in-loop
          await new Promise((r) => setTimeout(r, 150));
        }
      } catch {}
      return;
    }

    // Last-resort fallback: set cookie and reload. This is undesirable because it reloads the page.
    try {
      console.warn('Google widget not available, falling back to cookie+reload for translation');
      document.cookie = `googtrans=/en/${code};domain=${window.location.hostname};path=/`;
      window.location.reload();
    } catch (e) {
      // ignore
    }
  }
  // Lazy-load Google Translate when user clicks the globe button
  async function loadGoogleTranslate() {
    if ((window as any).__googleTranslateInitialized) {
      setGtLoaded(true);
      return;
    }

    // Helper to remove Google's injected banners/iframes and any top margin
    const removeGoogleBanner = () => {
      try {
        const banners = Array.from(document.querySelectorAll('.goog-te-banner-frame, .goog-te-balloon-frame, iframe.goog-te-banner-frame, iframe[src*="translate.google"]'));
        banners.forEach((b) => { try { (b as HTMLElement).style.display = 'none'; if (b.parentElement) b.parentElement.removeChild(b); } catch {} });
        try { document.body.style.top = '0px'; } catch {}
        try { (document.documentElement as HTMLElement).style.marginTop = '0px'; } catch {}
        const gtFrame = document.getElementById('goog-gt-tt');
        if (gtFrame && gtFrame.parentElement) {
          try { gtFrame.parentElement.removeChild(gtFrame); } catch {}
        }
      } catch {}
    };

    // Define callback expected by the Google script
    (window as any).googleTranslateElementInit = () => {
      try {
        const included = languages.map((l) => l.code).join(',');
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - google global types are not available here
        new (window as any).google.translate.TranslateElement({ pageLanguage: 'en', includedLanguages: included, layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE }, 'google_translate_element');
        try {
          new (window as any).google.translate.TranslateElement({ pageLanguage: 'en', includedLanguages: included, layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE }, 'google_translate_element_mobile');
        } catch {}
      } catch {}
      removeGoogleBanner();
      (window as any).__googleTranslateInitialized = true;
      setGtLoaded(true);
    };

    // Insert script
    const script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    // Observe DOM mutations to catch banners injected after initial load
    const observer = new MutationObserver(() => removeGoogleBanner());
    observer.observe(document.documentElement || document.body, { childList: true, subtree: true });

    // Resolve once the google init flag becomes true or after a timeout
    await new Promise<void>((resolve) => {
      let checks = 0;
      const interval = setInterval(() => {
        if ((window as any).__googleTranslateInitialized || ++checks > 30) {
          clearInterval(interval);
          removeGoogleBanner();
          resolve();
        }
      }, 200);
      // Fallback: ensure we at least run remove on script load
      script.addEventListener('load', () => removeGoogleBanner());
    });
  }

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Features", href: "#features" },
    { name: "About", href: "#about" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-6">
        {/* Brand */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center overflow-hidden">
            <img src="/Krishi_Sahayak_logo_main.png" alt="Krishi Sahayak Logo" className="h-7 w-7 object-contain" />
          </div>
          <span className="text-lg font-bold text-foreground">Krishi Sahayak</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.name}
            </a>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Google Translate - inline selector */}
          <div className="flex items-center space-x-2 relative">
            <Button
              variant="ghost"
              size="sm"
              className={`p-2 rounded-md transition-colors ${showLang ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
              onClick={() => { setShowLang((s) => !s); void loadGoogleTranslate(); }}
              aria-pressed={showLang}
            >
              <Globe className={`h-4 w-4 transition-transform duration-150 ${showLang ? 'scale-105' : 'hover:scale-105'}`} />
            </Button>
            {/* Custom visible select to match header styling */}
            {showLang && (
              <select
                value={selectedLang}
                onChange={(e) => changeLanguage(e.target.value)}
                className="translate-select bg-transparent text-muted-foreground border border-border px-2 py-1 rounded-md transition-all duration-150 ease-in-out"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
            )}
            {/* Hidden real widget containers - used only for functionality */}
            <div id="google_translate_element" style={{ display: 'none' }} />
          </div>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // Remove console.log for production
              // console.log("Theme toggle clicked, current theme:", theme);
              setTheme(theme === "dark" ? "light" : "dark");
            }}
            className="text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* Auth Buttons */}
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Link>
          </Button>
          
          <Button className="gradient-primary text-primary-foreground" size="sm" asChild>
            <Link to="/register">
              <UserPlus className="h-4 w-4 mr-2" />
              Register
            </Link>
          </Button>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center space-x-2">
          {/* Mobile Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // Remove console.log for production  
              // console.log("Mobile theme toggle clicked, current theme:", theme);
              setTheme(theme === "dark" ? "light" : "dark");
            }}
            className="text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          
          {/* Mobile Google Translate - inline selector (compact) */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className={`p-2 rounded-md transition-colors ${showLang ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
              onClick={() => { setShowLang((s) => !s); void loadGoogleTranslate(); }}
              aria-pressed={showLang}
            >
              <Globe className={`h-4 w-4 transition-transform duration-150 ${showLang ? 'scale-105' : 'hover:scale-105'}`} />
            </Button>
            {showLang && (
              <select
                value={selectedLang}
                onChange={(e) => changeLanguage(e.target.value)}
                className="translate-select-mobile bg-transparent text-muted-foreground border border-border px-2 py-1 rounded-md ml-2"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
            )}
            <div id="google_translate_element_mobile" style={{ display: 'none' }} />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-muted-foreground"
          >
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden animate-slide-in">
          <div className="px-4 pt-2 pb-4 space-y-2 bg-background border-t border-border">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
            <div className="pt-4 space-y-2">
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Link>
              </Button>
              <Button className="w-full gradient-primary text-primary-foreground" asChild>
                <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Register
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

// Styling for Google Translate widget
const style = document.createElement('style');
style.innerHTML = `
/* Container base */
.translate-container, .translate-container-mobile {
  display: inline-flex !important;
  align-items: center !important;
  vertical-align: middle !important;
  min-width: 0 !important;
}

/* Style the injected Google select (.goog-te-combo) to match header */
.translate-container .goog-te-gadget, .translate-container-mobile .goog-te-gadget {
  background: transparent !important;
  color: var(--foreground) !important;
  border: none !important;
  padding: 0 !important;
}
.translate-container select.goog-te-combo, .translate-container-mobile select.goog-te-combo {
  background: transparent !important;
  color: var(--foreground) !important;
  border: 1px solid rgba(0,0,0,0.06) !important;
  padding: 6px 10px !important;
  font-size: 0.9rem !important;
  border-radius: 8px !important;
  appearance: none !important;
  -webkit-appearance: none !important;
}
.translate-container select.goog-te-combo:focus, .translate-container-mobile select.goog-te-combo:focus {
  outline: none !important;
  box-shadow: 0 0 0 6px rgba(59,130,246,0.08) !important;
}

/* Hide the verbose "Select Language" label and Google logo text if present */
.translate-container .goog-te-gadget .goog-te-menu-value span, .translate-container-mobile .goog-te-gadget .goog-te-menu-value span {
  display: none !important;
}

/* Prevent the large floating menu from showing in a big white box by styling common frames */
.goog-te-menu-frame.skiptranslate, .goog-te-banner-frame.skiptranslate, iframe.goog-te-banner-frame { display: none !important; }
body { top: 0 !important; }

/* Make the selector compact on mobile */
.translate-container-mobile select.goog-te-combo { font-size: 0.85rem !important; padding: 4px 8px !important; }

/* Keep dropdown above other UI */
.translate-container, .translate-container-mobile { z-index: 60 !important; }
        
        /* Hide the default Google widget UI (we use our custom select) */
        .goog-te-gadget { display: none !important; }
        .goog-te-combo { display: none !important; }
        
        /* Custom visible select styling */
        .translate-select, .translate-select-mobile {
          background: transparent;
          color: var(--foreground);
          border: 1px solid rgba(0,0,0,0.06);
          padding: 6px 10px;
          font-size: 0.9rem;
          border-radius: 8px;
        }
        .translate-select:focus, .translate-select-mobile:focus {
          outline: none;
          box-shadow: 0 0 0 6px rgba(59,130,246,0.08);
        }

        /* Dark mode adjustments */
        :root.dark .translate-select, :root.dark .translate-select-mobile,
        :root.dark .translate-container .goog-te-combo {
          background: rgba(255,255,255,0.03) !important;
          color: var(--foreground) !important;
          border-color: rgba(255,255,255,0.06) !important;
        }

        :root.dark .translate-select option, :root.dark .translate-select-mobile option,
        :root.dark .translate-container .goog-te-combo option {
          background: #0b1220 !important;
          color: rgba(255,255,255,0.92) !important;
        }

        /* force text color in webkit dropdowns */
        :root.dark select::-webkit-text-fill-color { color: rgba(255,255,255,0.92) !important; }

        /* Chrome: hide any translate.google iframes quickly to avoid navbar shift */
        iframe[src*="translate.google"] { display: none !important; }
`;
document.head.appendChild(style);