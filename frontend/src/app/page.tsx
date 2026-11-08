"use client";
import {
  useId,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { FormEvent } from "react";

const API_URL = "http://localhost:3001";

type Person = {
  _id: string;
  name: string;
  email?: string;
};

type Site = {
  _id: string;
  address: string;
  title: string;
  html: string;
  authorId: string;
};

type SearchResult = {
  _id: string;
  address: string;
  title: string;
  authorId: string;
  createdAt: string;
};

type HistoryEntry = {
  siteId: string | null;
  address: string;
  visitedAt: string;
  scrollY: number;
  isBroken: boolean;
};

type HistoryResponse = {
  entries: HistoryEntry[];
  currentIndex: number;
};

type NavigationResponse = {
  currentIndex: number;
  currentPage: Site | null;
  address?: string;
  scrollY?: number;
  isBroken: boolean;
  history?: HistoryEntry[];
  message?: string;
};

const navigation = [
  { id: "home", label: "Home", icon: "⌂" },
  { id: "history", label: "Browsing History", icon: "◷" },
  { id: "search", label: "Search Websites", icon: "⌕" },
  { id: "publish", label: "Publish Website", icon: "＋" },
];

const quickLinks = [
  {
    title: "Tech World",
    address: "techworld",
    description: "Technology, innovation and digital trends",
    icon: "T",
  },
  {
    title: "Code Corner",
    address: "codecorner",
    description: "Programming tutorials and development",
    icon: "C",
  },
  {
    title: "Green Living",
    address: "greenliving",
    description: "Environment and sustainable living",
    icon: "G",
  },
  {
    title: "City Journal",
    address: "cityjournal",
    description: "Stories, people and city life",
    icon: "J",
  },
];

// Render website HTML inside an isolated iframe.
// Only the trusted bridge script receives permission to execute.
function createSafeDocument(html: string, nonce: string) {
  const bridge = `
    <script nonce="${nonce}">
      (() => {
        document.addEventListener("click", (event) => {
          const anchor = event.target.closest("a");

          if (!anchor) return;

          event.preventDefault();

          window.parent.postMessage({
            source: "smallweb-frame",
            type: "navigate",
            href: anchor.getAttribute("href") || ""
          }, "*");
        });

        let scrollTimer;

        window.addEventListener("scroll", () => {
          clearTimeout(scrollTimer);

          scrollTimer = setTimeout(() => {
            window.parent.postMessage({
              source: "smallweb-frame",
              type: "scroll",
              scrollY: window.scrollY
            }, "*");
          }, 300);
        }, { passive: true });

        window.addEventListener("message", (event) => {
          if (event.data?.source !== "smallweb-parent") return;

          if (event.data.type === "restore-scroll") {
            window.scrollTo(0, Number(event.data.scrollY) || 0);
          }
        });
      })();
    </script>
  `;

  return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          http-equiv="Content-Security-Policy"
          content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}'; base-uri 'none'; form-action 'none';"
        />
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.7;
            color: #1e293b;
            padding: 24px;
            max-width: 900px;
            margin: 0 auto;
          }

          a {
            color: #2563eb;
            text-decoration: underline;
          }

          img, iframe, object, embed {
            display: none !important;
          }
        </style>
      </head>
      <body>
        ${html}
        ${bridge}
      </body>
    </html>`;
}

export default function Home() {
  const [activeNav, setActiveNav] = useState("home");

  // People
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [peopleLoading, setPeopleLoading] = useState(true);
  const [peopleError, setPeopleError] = useState("");

  const selectedPerson = people.find(
    (person) => person._id === selectedPersonId
  );

  // Browser
  const [address, setAddress] = useState("");
  const [currentPage, setCurrentPage] = useState<Site | null>(null);
  const [isBroken, setIsBroken] = useState(false);
  const [browserLoading, setBrowserLoading] = useState(false);
  const [browserError, setBrowserError] = useState("");
  const [currentScrollY, setCurrentScrollY] = useState(0);
  const [returnToSearch, setReturnToSearch] = useState(false);

  // History
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Publish
  const [publishAddress, setPublishAddress] = useState("");
  const [publishTitle, setPublishTitle] = useState("");
  const [publishHtml, setPublishHtml] = useState(
    `<h1>Welcome to my website</h1>
<p>This website was created using SmallWeb.</p>
<p>Explore my content and browse other websites in the local web.</p>`
  );
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishError, setPublishError] = useState("");
  const [publishSuccess, setPublishSuccess] = useState("");

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canGoBack = currentIndex > 0;
  const canGoForward =
    currentIndex >= 0 && currentIndex < history.length - 1;

  // Keep the nonce stable while the current HTML remains unchanged.
   const iframeNonce = useId().replace(/:/g, "");

  const safeDocument = useMemo(() => {
    if (!currentPage) return "";
    return createSafeDocument(currentPage.html, iframeNonce);
  }, [currentPage, iframeNonce]);

  // Load people from backend.
  useEffect(() => {
    const controller = new AbortController();

    async function fetchPeople() {
      try {
        setPeopleLoading(true);
        setPeopleError("");

        const response = await fetch(`${API_URL}/people`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load people.");
        }

        const data: Person[] = await response.json();

        if (controller.signal.aborted) return;

        setPeople(data);

        if (data.length > 0) {
          setSelectedPersonId(data[0]._id);
        }
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          setPeopleError(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setPeopleLoading(false);
        }
      }
    }

    fetchPeople();

    return () => controller.abort();
  }, []);

  // Load selected person's browsing history.
  useEffect(() => {
    if (!selectedPersonId) return;

    const controller = new AbortController();

    async function loadHistory() {
      try {
        setHistoryLoading(true);
        setHistoryError("");

        setCurrentPage(null);
        setAddress("");
        setIsBroken(false);
        setCurrentScrollY(0);
        setHistory([]);
        setCurrentIndex(-1);
        setReturnToSearch(false);

        const response = await fetch(
          `${API_URL}/history/${selectedPersonId}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Failed to load browsing history.");
        }

        const data: HistoryResponse = await response.json();

        if (controller.signal.aborted) return;

        setHistory(data.entries);
        setCurrentIndex(data.currentIndex);

        const currentEntry = data.entries[data.currentIndex];

        if (!currentEntry) return;

        setAddress(currentEntry.address);
        setCurrentScrollY(currentEntry.scrollY);
        setIsBroken(currentEntry.isBroken);

        if (!currentEntry.isBroken) {
          const siteResponse = await fetch(
            `${API_URL}/sites/${encodeURIComponent(currentEntry.address)}`,
            { signal: controller.signal }
          );

          if (!siteResponse.ok) {
            throw new Error("Could not restore the current website.");
          }

          const site: Site = await siteResponse.json();

          if (!controller.signal.aborted) {
            setCurrentPage(site);
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          setHistoryError(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setHistoryLoading(false);
        }
      }
    }

    loadHistory();

    return () => controller.abort();
  }, [selectedPersonId]);

  // Save scroll position and handle links from the iframe.
  useEffect(() => {
    async function handleFrameMessage(event: MessageEvent) {
      if (event.source !== iframeRef.current?.contentWindow) return;

      const data = event.data;

      if (!data || data.source !== "smallweb-frame") return;

      if (data.type === "navigate" && typeof data.href === "string") {
        const href = data.href.trim();
        const internalAddress = href.replace(/^\/+/, "");

        // Only allow internal SmallWeb addresses.
        if (!/^[a-z0-9-]+$/i.test(internalAddress)) return;

        await navigateTo(internalAddress);
      }

      if (
        data.type === "scroll" &&
        typeof data.scrollY === "number" &&
        Number.isFinite(data.scrollY)
      ) {
        setCurrentScrollY(data.scrollY);

        if (scrollTimerRef.current) {
          clearTimeout(scrollTimerRef.current);
        }

        scrollTimerRef.current = setTimeout(() => {
          saveScrollPosition(data.scrollY);
        }, 500);
      }
    }

    window.addEventListener("message", handleFrameMessage);

    return () => {
      window.removeEventListener("message", handleFrameMessage);

      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
    };
  }, [selectedPersonId]);

  async function saveScrollPosition(scrollY: number) {
    if (!selectedPersonId) return;

    try {
      await fetch(`${API_URL}/history/${selectedPersonId}/scroll`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ scrollY }),
      });
    } catch (error) {
      console.error("Could not save scroll position:", error);
    }
  }

  async function refreshHistory() {
    if (!selectedPersonId) return;

    const response = await fetch(
      `${API_URL}/history/${selectedPersonId}`
    );

    if (response.ok) {
      const data: HistoryResponse = await response.json();

      setHistory(data.entries);
      setCurrentIndex(data.currentIndex);
    }
  }

  // Navigate to a website and add it to browsing history.
  async function navigateTo(targetAddress: string) {
    if (!selectedPersonId) {
      setBrowserError("Please select a person first.");
      return;
    }

    const normalizedAddress = targetAddress
      .trim()
      .replace(/^\/+/, "")
      .toLowerCase();

    if (!/^[a-z0-9-]+$/.test(normalizedAddress)) {
      setBrowserError("Enter a valid internal website address.");
      return;
    }

    try {
      setBrowserLoading(true);
      setBrowserError("");

      const response = await fetch(
        `${API_URL}/history/${selectedPersonId}/navigate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ address: normalizedAddress }),
        }
      );

      if (!response.ok) {
        throw new Error("Navigation request failed.");
      }

      const data: NavigationResponse = await response.json();

      setAddress(normalizedAddress);
      setCurrentIndex(data.currentIndex);
      setCurrentPage(data.currentPage ?? null);
      setIsBroken(data.isBroken);
      setCurrentScrollY(data.scrollY ?? 0);

      if (data.history) {
        setHistory(data.history);
      } else {
        await refreshHistory();
      }

      setActiveNav("home");
    } catch (error) {
      setBrowserError(
        error instanceof Error ? error.message : "Navigation failed."
      );
    } finally {
      setBrowserLoading(false);
    }
  }

  function handleNavigate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setReturnToSearch(false);
    navigateTo(address);
  }

  // Search websites by title and HTML content.
async function handleSearch(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  const query = searchQuery.trim();

  if (!query) {
    setSearchError("Please enter something to search.");
    setSearchResults([]);
    setSearchPerformed(false);
    return;
  }

  try {
    setSearchLoading(true);
    setSearchError("");
    setSearchPerformed(true);
    setSearchResults([]);

    const response = await fetch(
      `${API_URL}/sites/search?q=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error("Search request failed.");
    }

    const data = await response.json();

    const results: SearchResult[] = Array.isArray(data)
      ? data
      : Array.isArray(data.value)
        ? data.value
        : [];

    setSearchResults(results);
  } catch (error) {
    setSearchError(
      error instanceof Error ? error.message : "Something went wrong."
    );
  } finally {
    setSearchLoading(false);
  }
}
  async function openSearchResult(siteAddress: string) {
    setReturnToSearch(true);
    await navigateTo(siteAddress);
  }

  // Back and Forward use existing history entries.
  async function moveHistory(direction: "back" | "forward") {
    if (!selectedPersonId) return;

    try {
      setBrowserLoading(true);
      setBrowserError("");
      setReturnToSearch(false);

      const response = await fetch(
        `${API_URL}/history/${selectedPersonId}/${direction}`,
        { method: "POST" }
      );

      if (!response.ok) {
        throw new Error(`Could not go ${direction}.`);
      }

      const data: NavigationResponse = await response.json();

      setCurrentIndex(data.currentIndex);
      setAddress(data.address ?? data.currentPage?.address ?? "");
      setCurrentPage(data.currentPage ?? null);
      setIsBroken(data.isBroken);
      setCurrentScrollY(data.scrollY ?? 0);

      await refreshHistory();
    } catch (error) {
      setBrowserError(
        error instanceof Error ? error.message : "History navigation failed."
      );
    } finally {
      setBrowserLoading(false);
    }
  }

  // Jump to any visit using the existing Back/Forward API.
  async function jumpToHistory(targetIndex: number) {
    if (
      !selectedPersonId ||
      targetIndex < 0 ||
      targetIndex >= history.length ||
      targetIndex === currentIndex
    ) {
      return;
    }

    try {
      setBrowserLoading(true);
      setBrowserError("");
      setReturnToSearch(false);

      const direction = targetIndex < currentIndex ? "back" : "forward";
      const steps = Math.abs(targetIndex - currentIndex);

      let finalData: NavigationResponse | null = null;

      for (let step = 0; step < steps; step++) {
        const response = await fetch(
          `${API_URL}/history/${selectedPersonId}/${direction}`,
          { method: "POST" }
        );

        if (!response.ok) {
          throw new Error("Could not open this history entry.");
        }

        finalData = await response.json();
      }

      if (finalData) {
        setCurrentIndex(finalData.currentIndex);
        setAddress(finalData.address ?? finalData.currentPage?.address ?? "");
        setCurrentPage(finalData.currentPage ?? null);
        setIsBroken(finalData.isBroken);
        setCurrentScrollY(finalData.scrollY ?? 0);
      }

      await refreshHistory();
      setActiveNav("home");
    } catch (error) {
      setBrowserError(
        error instanceof Error ? error.message : "Could not open history entry."
      );
    } finally {
      setBrowserLoading(false);
    }
  }

  async function refreshCurrentPage() {
    if (!address) return;

    if (isBroken) {
      await navigateTo(address);
      return;
    }

    try {
      setBrowserLoading(true);
      setBrowserError("");

      const response = await fetch(
        `${API_URL}/sites/${encodeURIComponent(address)}`
      );

      if (!response.ok) {
        throw new Error("Could not refresh website.");
      }

      const site: Site = await response.json();
      setCurrentPage(site);
    } catch (error) {
      setBrowserError(
        error instanceof Error ? error.message : "Refresh failed."
      );
    } finally {
      setBrowserLoading(false);
    }
  }

  // Publish a new website.
  async function handlePublish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setPublishError("");
    setPublishSuccess("");

    if (!selectedPersonId) {
      setPublishError("Please select a person first.");
      return;
    }

    const normalizedAddress = publishAddress
      .trim()
      .toLowerCase()
      .replace(/^\/+/, "");

    if (!/^[a-z0-9-]+$/.test(normalizedAddress)) {
      setPublishError(
        "Address must contain only lowercase letters, numbers, and hyphens."
      );
      return;
    }

    if (!publishTitle.trim()) {
      setPublishError("Please enter a website title.");
      return;
    }

    if (!publishHtml.trim()) {
      setPublishError("Please enter your website HTML.");
      return;
    }

    try {
      setPublishLoading(true);

      const response = await fetch(`${API_URL}/sites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: normalizedAddress,
          title: publishTitle.trim(),
          html: publishHtml,
          authorId: selectedPersonId,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message
            ? Array.isArray(data.message)
              ? data.message.join(", ")
              : data.message
            : "Could not publish website."
        );
      }

      setPublishSuccess("Your website has been published successfully.");

      setPublishAddress("");
      setPublishTitle("");
      setPublishHtml(
        `<h1>Welcome to my website</h1>
<p>This website was created using SmallWeb.</p>
<p>Explore my content and browse other websites in the local web.</p>`
      );

      await navigateTo(normalizedAddress);
    } catch (error) {
      setPublishError(
        error instanceof Error ? error.message : "Publishing failed."
      );
    } finally {
      setPublishLoading(false);
    }
  }

  function restoreIframeScroll() {
    iframeRef.current?.contentWindow?.postMessage(
      {
        source: "smallweb-parent",
        type: "restore-scroll",
        scrollY: currentScrollY,
      },
      "*"
    );
  }

  function formatVisitTime(date: string) {
    return new Date(date).toLocaleString("en-PK", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  return (
    <main className="flex min-h-screen bg-slate-50 text-slate-800">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white">
            S
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-tight">SmallWeb</h1>
            <p className="text-xs text-slate-400">Personal web browser</p>
          </div>
        </div>

        <div className="px-4 py-6">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Workspace
          </p>

          <nav className="space-y-1">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium transition ${
                  activeNav === item.id
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span className="w-5 text-center text-lg">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto border-t border-slate-100 p-4">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-700">
              SmallWeb Browser
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Explore a collection of published websites in your own local web.
            </p>

            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Local environment
            </div>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <section className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="flex min-h-20 items-center justify-between border-b border-slate-200 bg-white px-5 py-3 md:px-8">
          <div>
            <h2 className="text-lg font-semibold">My Browser</h2>
            <p className="text-xs text-slate-400">
              Your personal browsing workspace
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <label
                htmlFor="person-select"
                className="block text-xs text-slate-400"
              >
                Browsing as
              </label>

              <select
                id="person-select"
                value={selectedPersonId}
                onChange={(event) => setSelectedPersonId(event.target.value)}
                disabled={peopleLoading || people.length === 0}
                className="max-w-40 bg-transparent text-sm font-semibold text-slate-700 outline-none"
              >
                {peopleLoading && (
                  <option value="">Loading people...</option>
                )}

                {people.map((person) => (
                  <option key={person._id} value={person._id}>
                    {person.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
              {selectedPerson?.name?.charAt(0) ?? "U"}
            </div>
          </div>
        </header>

        {(peopleError || historyError) && (
          <div className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm text-red-600">
            {peopleError || historyError}
          </div>
        )}

        {/* Browser toolbar */}
        <div className="border-b border-slate-200 bg-white px-4 py-4 md:px-8">
          <div className="flex items-center gap-2">
            <button
              onClick={() => moveHistory("back")}
              disabled={!canGoBack || browserLoading}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-lg text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
              title="Back"
            >
              ←
            </button>

            <button
              onClick={() => moveHistory("forward")}
              disabled={!canGoForward || browserLoading}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-lg text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
              title="Forward"
            >
              →
            </button>

            <button
              onClick={refreshCurrentPage}
              disabled={!address || browserLoading}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-lg text-slate-600 hover:bg-slate-50 disabled:opacity-30"
              title="Refresh"
            >
              ↻
            </button>

            <form
              onSubmit={handleNavigate}
              className="flex min-w-0 flex-1 gap-2"
            >
              <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 focus-within:border-blue-400">
                <span className="text-sm text-slate-400">⌕</span>

                <input
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="Enter a website address..."
                  className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>

              <button
                type="submit"
                disabled={browserLoading}
                className="rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {browserLoading ? "..." : "Go"}
              </button>
            </form>
          </div>
        </div>

        {browserError && (
          <div className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm text-red-600">
            {browserError}
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 overflow-y-auto px-5 py-8 md:px-8 md:py-10">
          {/* Home */}
          {activeNav === "home" && (
            <div className="mx-auto max-w-5xl">
              {!currentPage && !isBroken && (
                <div className="rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-600 px-7 py-10 text-white md:px-10">
                  <p className="text-sm font-medium text-blue-100">
                    YOUR PERSONAL WEB EXPERIENCE
                  </p>

                  <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                    Welcome to SmallWeb.
                  </h2>

                  <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100 md:text-base">
                    Discover websites, explore content, and keep track of your
                    browsing journey in one simple workspace.
                  </p>
                </div>
              )}

              {!currentPage && !isBroken && (
                <>
                  <div className="mt-10">
                    <h3 className="text-lg font-bold">Explore websites</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Choose a website to start browsing.
                    </p>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {quickLinks.map((site) => (
                      <button
                        key={site.address}
                        onClick={() => navigateTo(site.address)}
                        className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg font-bold text-blue-700">
                          {site.icon}
                        </div>

                        <div>
                          <h4 className="font-semibold text-slate-800">
                            {site.title}
                          </h4>

                          <p className="mt-1 text-xs text-slate-400">
                            {site.address}
                          </p>

                          <p className="mt-2 text-sm leading-5 text-slate-500">
                            {site.description}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {isBroken && (
                <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-red-200 bg-white p-10 text-center">
                  <div className="text-4xl text-red-500">!</div>

                  <h2 className="mt-4 text-xl font-bold">
                    Website not found
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    The address <strong>{address}</strong> does not exist in
                    SmallWeb.
                  </p>
                </div>
              )}

              {currentPage && (
                <div className="mx-auto max-w-5xl">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h2 className="text-lg font-bold">
                        {currentPage.title}
                      </h2>

                      <p className="text-xs text-slate-400">
                        smallweb.local/{currentPage.address}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {returnToSearch && (
                        <button
                          onClick={() => {
                            setActiveNav("search");
                            setReturnToSearch(false);
                          }}
                          className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-50"
                        >
                          ← Return to search results
                        </button>
                      )}

                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                        Published website
                      </span>
                    </div>
                  </div>

                  <div className="min-h-[550px] overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <iframe
                      key={`${selectedPersonId}-${currentPage.address}-${currentIndex}`}
                      ref={iframeRef}
                      title={currentPage.title}
                      srcDoc={safeDocument}
                      sandbox="allow-scripts"
                      onLoad={restoreIframeScroll}
                      className="h-[650px] w-full bg-white"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Browsing history */}
          {activeNav === "history" && (
            <div className="mx-auto max-w-5xl">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold">Browsing History</h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Browsing activity for{" "}
                    {selectedPerson?.name ?? "selected user"}.
                  </p>
                </div>

                <div className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
                  {history.length} visits
                </div>
              </div>

              {historyLoading && (
                <p className="mt-6 rounded-xl border bg-white p-8 text-center text-sm text-slate-500">
                  Loading browsing history...
                </p>
              )}

              {!historyLoading && history.length === 0 && (
                <p className="mt-6 rounded-xl border bg-white p-8 text-center text-sm text-slate-500">
                  No browsing history yet.
                </p>
              )}

              {!historyLoading && history.length > 0 && (
                <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <div className="border-b border-slate-100 px-5 py-4">
                    <h3 className="font-semibold">All visits</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Select any visit to return to that point in your history.
                    </p>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {history.map((entry, index) => (
                      <button
                        key={`${entry.address}-${entry.visitedAt}-${index}`}
                        onClick={() => jumpToHistory(index)}
                        disabled={browserLoading}
                        className={`flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left transition disabled:cursor-wait ${
                          index === currentIndex
                            ? "bg-blue-50/70"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                            {entry.isBroken ? "!" : "◉"}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                              {entry.address}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {formatVisitTime(entry.visitedAt)}
                            </p>

                            {entry.isBroken && (
                              <span className="text-xs font-medium text-red-600">
                                Broken link
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          {index === currentIndex && (
                            <span className="text-xs font-medium text-blue-700">
                              Current
                            </span>
                          )}

                          <p className="mt-1 text-xs text-slate-400">
                            Scroll: {entry.scrollY}px
                          </p>

                          {index !== currentIndex && (
                            <p className="mt-1 text-xs font-medium text-blue-600">
                              Open visit →
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Website Search */}
          {activeNav === "search" && (
            <div className="mx-auto max-w-5xl">
              <div>
                <h2 className="text-2xl font-bold">Search Websites</h2>

                <p className="mt-2 text-sm text-slate-500">
                  Search websites by title or content.
                </p>
              </div>

              <form
                onSubmit={handleSearch}
                className="mt-6 flex flex-col gap-3 sm:flex-row"
              >
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search technology, developers, science..."
                  className="h-12 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-500"
                />

                <button
                  type="submit"
                  disabled={searchLoading}
                  className="h-12 rounded-xl bg-blue-600 px-7 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {searchLoading ? "Searching..." : "Search"}
                </button>
              </form>

              {searchError && (
                <p className="mt-4 text-sm text-red-600">{searchError}</p>
              )}

              {searchPerformed && !searchLoading && !searchError && (
                <div className="mt-8">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold">Search Results</h3>

                    <span className="text-sm text-slate-500">
                      {searchResults.length} results found
                    </span>
                  </div>

                  {searchResults.length === 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
                      <h3 className="font-semibold">No websites found</h3>

                      <p className="mt-2 text-sm text-slate-500">
                        Try another keyword.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {searchResults.map((site) => (
                        <button
                          key={site._id}
                          onClick={() => openSearchResult(site.address)}
                          className="flex w-full items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 text-left transition hover:border-blue-300 hover:shadow-sm"
                        >
                          <div className="flex min-w-0 items-center gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-700">
                              {site.title.charAt(0)}
                            </div>

                            <div className="min-w-0">
                              <h4 className="font-semibold text-slate-800">
                                {site.title}
                              </h4>

                              <p className="mt-1 text-sm text-slate-500">
                                smallweb.local/{site.address}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                Published{" "}
                                {new Date(site.createdAt).toLocaleDateString(
                                  "en-PK"
                                )}
                              </p>
                            </div>
                          </div>

                          <span className="shrink-0 text-sm font-medium text-blue-600">
                            Open →
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Publish Website */}
          {activeNav === "publish" && (
            <div className="mx-auto max-w-5xl">
              <div>
                <h2 className="text-2xl font-bold">Publish a Website</h2>

                <p className="mt-2 text-sm text-slate-500">
                  Create and publish your own website to SmallWeb.
                </p>
              </div>

              <form
                onSubmit={handlePublish}
                className="mt-6 space-y-5 rounded-xl border border-slate-200 bg-white p-6"
              >
                <div>
                  <label
                    htmlFor="publish-address"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Website address
                  </label>

                  <div className="flex overflow-hidden rounded-lg border border-slate-200 focus-within:border-blue-500">
                    <span className="flex items-center bg-slate-50 px-3 text-sm text-slate-500">
                      smallweb.local/
                    </span>

                    <input
                      id="publish-address"
                      value={publishAddress}
                      onChange={(event) =>
                        setPublishAddress(event.target.value)
                      }
                      placeholder="my-website"
                      className="min-w-0 flex-1 px-3 py-3 text-sm outline-none"
                      required
                    />
                  </div>

                  <p className="mt-1 text-xs text-slate-400">
                    Use lowercase letters, numbers, and hyphens only.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="publish-title"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Website title
                  </label>

                  <input
                    id="publish-title"
                    value={publishTitle}
                    onChange={(event) => setPublishTitle(event.target.value)}
                    placeholder="My Personal Website"
                    className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="publish-html"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Website HTML content
                  </label>

                  <textarea
                    id="publish-html"
                    value={publishHtml}
                    onChange={(event) => setPublishHtml(event.target.value)}
                    rows={14}
                    placeholder="<h1>My website</h1><p>Hello SmallWeb!</p>"
                    className="w-full rounded-lg border border-slate-200 bg-slate-950 px-4 py-3 font-mono text-sm text-green-300 outline-none focus:border-blue-500"
                    required
                  />

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    HTML is sanitized by the backend before it is stored and
                    displayed. Scripts and unsafe content are removed.
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Publishing as:{" "}
                  <strong>{selectedPerson?.name ?? "No person selected"}</strong>
                </div>

                {publishError && (
                  <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                    {publishError}
                  </p>
                )}

                {publishSuccess && (
                  <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {publishSuccess}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={publishLoading || !selectedPersonId}
                  className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {publishLoading ? "Publishing..." : "Publish Website"}
                </button>
              </form>
            </div>
          )}
        </div>

        <footer className="border-t border-slate-200 bg-white px-5 py-4 text-center text-xs text-slate-400">
          SmallWeb © 2026 · A local website browsing experience
        </footer>
      </section>
    </main>
  );
}