import { THEMES } from "../constants";
import { useThemeStore } from "../store/useThemeStore";
import { useState } from "react";
import UserProfileSection from "../components/UserProfileSection";
import { useAuthStore } from "../store/useAuthStore";
import { User, Settings, Bell, Image, Lock, Shield } from "lucide-react";

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();
  const { authUser, logout } = useAuthStore();
  const [active, setActive] = useState("profile");
  const [readReceipts, setReadReceipts] = useState(true);
  const [protectIP, setProtectIP] = useState(true);

  const leftItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "account", label: "Account", icon: Settings },
    { id: "chats", label: "Chats", icon: Bell },
    { id: "personalization", label: "Personalization", icon: Image },
    { id: "privacy", label: "Privacy", icon: Lock },
    { id: "security", label: "Security", icon: Shield },
  ];

  return (
    <div className="h-screen pt-16 sm:pt-20">
      <div className="max-w-6xl mx-auto p-2 sm:p-4">
        <div className="flex flex-col sm:grid sm:grid-cols-12 sm:gap-6">
          {/* Sidebar: vertical on desktop, horizontal scroll on mobile */}
          <aside className="sm:col-span-3 bg-base-200 rounded-xl p-2 sm:p-4 mb-2 sm:mb-0">
            <div className="mb-2 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-semibold">Settings</h2>
              <p className="text-xs sm:text-sm text-zinc-500">Manage your account and preferences</p>
            </div>
            <nav className="flex sm:block overflow-x-auto space-x-2 sm:space-x-0 sm:space-y-1">
              {leftItems.map((it) => {
                const Icon = it.icon;
                return (
                  <button
                    key={it.id}
                    onClick={() => setActive(it.id)}
                    className={`min-w-[90px] sm:min-w-0 px-2 py-2 sm:px-3 sm:py-2 rounded-lg flex items-center gap-2 sm:gap-3 text-xs sm:text-base ${
                      active === it.id ? "bg-base-100 font-medium" : "hover:bg-base-100/60"
                    }`}
                  >
                    <Icon className="w-4 h-4 text-zinc-500" />
                    <span>{it.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main content: stacked on mobile, side-by-side on desktop */}
          <section className="sm:col-span-9">
            <div className="bg-base-200 rounded-xl p-2 sm:p-6 min-h-[320px] sm:min-h-[520px]">
              {active === "profile" && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold">Profile</h3>
                  <p className="text-xs sm:text-sm text-zinc-500">View and edit your profile</p>
                  <div className="mt-2 sm:mt-4">
                    <UserProfileSection />
                  </div>
                </div>
              )}

              {active === "account" && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold">Account</h3>
                  <p className="text-xs sm:text-sm text-zinc-500">Privacy and account settings</p>

                  <div className="mt-2 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                    <div className="bg-base-100 rounded-xl p-2 sm:p-4">
                      <h4 className="font-medium text-sm sm:text-base">Privacy</h4>
                      <div className="mt-2 sm:mt-3 text-xs sm:text-sm space-y-2 sm:space-y-3">
                        <div className="flex justify-between">
                          <span>Last seen and online</span>
                          <span className="text-zinc-400">Nobody</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Profile photo</span>
                          <span className="text-zinc-400">My contacts</span>
                        </div>
                        <div className="flex justify-between">
                          <span>About</span>
                          <span className="text-zinc-400">My contacts</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Add to groups</span>
                          <span className="text-zinc-400">Everyone</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-base-100 rounded-xl p-2 sm:p-4">
                      <h4 className="font-medium text-sm sm:text-base">Account</h4>
                      <p className="text-xs sm:text-sm text-zinc-500 mt-1 sm:mt-2">Phone and login details</p>
                      <div className="mt-2 sm:mt-4 text-xs sm:text-sm space-y-2 sm:space-y-3">
                        <div>
                          <div className="text-zinc-500 text-xs sm:text-sm">Phone number</div>
                          <div className="mt-1 font-medium">{authUser?.phone || "Not set"}</div>
                        </div>

                        <div>
                          <button className="btn btn-outline btn-error mt-2 sm:mt-4" onClick={() => logout()}>
                            Log out
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {active === "personalization" && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold">Personalization</h3>
                  <p className="text-xs sm:text-sm text-zinc-500">Theme, wallpaper and appearance</p>

                  <div className="mt-2 sm:mt-4">
                    <h4 className="text-xs sm:text-sm font-medium mb-2">Theme</h4>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {THEMES.map((t) => (
                        <button
                          key={t}
                          className={`group flex flex-col items-center gap-1.5 p-1 sm:p-2 rounded-lg transition-colors ${
                            theme === t ? "bg-base-100 font-medium" : "hover:bg-base-100/60"
                          }`}
                          onClick={() => setTheme(t)}
                        >
                          <div className="relative h-6 sm:h-8 w-full rounded-md overflow-hidden" data-theme={t}>
                            <div className="absolute inset-0 grid grid-cols-4 gap-px p-1">
                              <div className="rounded bg-primary"></div>
                              <div className="rounded bg-secondary"></div>
                              <div className="rounded bg-accent"></div>
                              <div className="rounded bg-neutral"></div>
                            </div>
                          </div>
                          <span className="text-[10px] sm:text-[11px] font-medium truncate w-full text-center">
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="mt-4 sm:mt-6">
                      <h4 className="text-xs sm:text-sm font-medium mb-2">Chat wallpaper</h4>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <div key={i} className={`h-10 sm:h-16 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20`} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {active === "privacy" && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold">Privacy</h3>
                  <div className="mt-2 sm:mt-4 space-y-2 sm:space-y-4">
                    <div className="bg-base-100 rounded-xl p-2 sm:p-4 flex items-center justify-between">
                      <div>
                        <div className="text-xs sm:text-sm text-zinc-500">Read receipts</div>
                        <div className="text-[10px] sm:text-xs text-zinc-400">Read receipts are always sent for group chats</div>
                      </div>
                      <label className="swap">
                        <input type="checkbox" checked={readReceipts} onChange={(e) => setReadReceipts(e.target.checked)} />
                        <div className="swap-on">On</div>
                        <div className="swap-off">Off</div>
                      </label>
                    </div>

                    <div className="bg-base-100 rounded-xl p-2 sm:p-4 flex items-center justify-between">
                      <div>
                        <div className="text-xs sm:text-sm text-zinc-500">Protect IP address in calls</div>
                        <div className="text-[10px] sm:text-xs text-zinc-400">Helps make it harder to infer your network address</div>
                      </div>
                      <label className="swap">
                        <input type="checkbox" checked={protectIP} onChange={(e) => setProtectIP(e.target.checked)} />
                        <div className="swap-on">On</div>
                        <div className="swap-off">Off</div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {active !== "profile" && active !== "account" && active !== "personalization" && active !== "privacy" && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold">{leftItems.find((li) => li.id === active)?.label}</h3>
                  <p className="text-xs sm:text-sm text-zinc-500">This section is a placeholder — implement specific settings here.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
