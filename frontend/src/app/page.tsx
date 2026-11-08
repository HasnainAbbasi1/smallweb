
"use client";

import { useState } from "react";

const navigation = [
  { id: "home", label: "Home", icon: "⌂" },
  { id: "history", label: "Browsing History", icon: "◷" },
  { id: "search", label: "Search Websites", icon: "⌕" },
  { id: "publish", label: "Publish Website", icon: "＋" },
];

const quickLinks = [
  { title: "Tech World", address: "techworld", description: "Technology, innovation and digital trends", icon: "T" },
  { title: "Code Corner", address: "codecorner", description: "Programming tutorials and development", icon: "C" },
  { title: "Green Living", address: "greenliving", description: "Environment and sustainable living", icon: "G" },
  { title: "City Journal", address: "cityjournal", description: "Stories, people and city life", icon: "J" },
];

export default function Home() {
  const [activeNav, setActiveNav] = useState("home");
  const [address, setAddress] = useState("");

  function handleNavigate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!address.trim()) return;

    // Backend navigation will be connected in the next stage.
    alert(`Navigation will be connected to the backend: ${address}`);
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
            <p className="text-sm font-semibold text-slate-700">SmallWeb Browser</p>
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
        {/* Top header */}
        <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 md:px-8">
          <div>
            <h2 className="text-lg font-semibold">My Browser</h2>
            <p className="text-xs text-slate-400">Your personal browsing workspace</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-slate-400 sm:block">
              Current user
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
              U
            </div>
          </div>
        </header>

        {/* Browser toolbar */}
        <div className="border-b border-slate-200 bg-white px-4 py-4 md:px-8">
          <div className="flex items-center gap-2">
            <button
              disabled
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-lg text-slate-400 disabled:cursor-not-allowed"
              title="Back"
            >
              ←
            </button>
            <button
              disabled
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-lg text-slate-400 disabled:cursor-not-allowed"
              title="Forward"
            >
              →
            </button>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-lg text-slate-600 hover:bg-slate-50"
              title="Refresh"
              onClick={() => setAddress("")}
            >
              ↻
            </button>

            <form onSubmit={handleNavigate} className="flex min-w-0 flex-1 gap-2">
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
                className="rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Go
              </button>
            </form>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto px-5 py-8 md:px-8 md:py-10">
          {activeNav === "home" && (
            <div className="mx-auto max-w-5xl">
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
                <button
                  onClick={() => setActiveNav("search")}
                  className="mt-6 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                >
                  Explore websites →
                </button>
              </div>

              <div className="mt-10 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">Explore websites</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Some websites available in your local web.
                  </p>
                </div>
                <button
                  onClick={() => setActiveNav("search")}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  View all →
                </button>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {quickLinks.map((site) => (
                  <button
                    key={site.address}
                    onClick={() => setAddress(site.address)}
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
            </div>
          )}

          {activeNav === "history" && (
            <div className="mx-auto max-w-5xl">
              <h2 className="text-2xl font-bold">Browsing History</h2>
              <p className="mt-2 text-sm text-slate-500">
                Review your previously visited websites.
              </p>
              <div className="mt-6 rounded-xl border border-slate-200 bg-white p-8 text-center">
                <p className="text-3xl">◷</p>
                <p className="mt-3 font-semibold">Your browsing history</p>
                <p className="mt-1 text-sm text-slate-500">
                  History records will appear here after connecting the backend.
                </p>
              </div>
            </div>
          )}

          {activeNav === "search" && (
            <div className="mx-auto max-w-5xl">
              <h2 className="text-2xl font-bold">Search Websites</h2>
              <p className="mt-2 text-sm text-slate-500">
                Find websites by their title or page content.
              </p>
              <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
                <label className="mb-2 block text-sm font-medium">
                  Search the local web
                </label>
                <input
                  placeholder="Search websites..."
                  className="h-11 w-full rounded-lg border border-slate-200 px-4 text-sm outline-none focus:border-blue-400"
                />
                <p className="mt-3 text-xs text-slate-400">
                  Search functionality will be connected to the API next.
                </p>
              </div>
            </div>
          )}

          {activeNav === "publish" && (
            <div className="mx-auto max-w-5xl">
              <h2 className="text-2xl font-bold">Publish a Website</h2>
              <p className="mt-2 text-sm text-slate-500">
                Create and publish your own website to SmallWeb.
              </p>
              <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
                <p className="font-semibold">Website editor</p>
                <p className="mt-2 text-sm text-slate-500">
                  Address, title, author and HTML editor will be implemented
                  in the next stage.
                </p>
              </div>
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
