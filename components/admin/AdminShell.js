"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { api } from "../../lib/admin-client";

const NAV = [
  { href: "/admin/books", label: "Books", group: "Content" },
  { href: "/admin/home", label: "Homepage", group: "Content" },
  { href: "/admin/comments", label: "Comments & Reviews", group: "Community" },
  { href: "/admin/subscribers", label: "Newsletter", group: "Community" },
  { href: "/admin/prebooking", label: "Prebooking", group: "Shop" },
];

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  const isLogin = pathname === "/admin";

  useEffect(() => {
    const check = async () => {
      try {
        await api("/api/admin/session");
        if (isLogin) router.replace("/admin/books");
      } catch {
        if (!isLogin) router.replace("/admin");
      } finally {
        setChecked(true);
      }
    };
    check();
  }, [isLogin, router]);

  const logout = async () => {
    await api("/api/admin/logout", { method: "POST" }).catch(() => {});
    router.push("/admin");
  };

  if (isLogin) return <>{children}</>;

  if (!checked) return <div className="adm-shell" />;

  return (
    <div className="adm-shell">
      <aside className="adm-sidebar">
        <div className="adm-brand">
          <img src="/images/logo/logo-maroon-bg.png" alt="" />
          <div className="adm-brand-text">
            <b>Zoha Asif</b>
            <span>Content studio</span>
          </div>
        </div>

        <nav className="adm-nav">
          {NAV.map((item, i) => {
            const prev = NAV[i - 1];
            const showGroup = !prev || prev.group !== item.group;
            return (
              <span key={item.href}>
                {showGroup && <div className="adm-nav-group">{item.group}</div>}
                <a href={item.href} className={pathname.startsWith(item.href) ? "adm-active" : ""}>
                  {item.label}
                </a>
              </span>
            );
          })}
        </nav>

        <div className="adm-sidebar-foot">
          <a href="/" target="_blank" rel="noreferrer">View live site <span aria-hidden="true">↗</span></a>
          <button type="button" onClick={logout}>Log out</button>
        </div>
      </aside>

      <main className="adm-main">{children}</main>
    </div>
  );
}
