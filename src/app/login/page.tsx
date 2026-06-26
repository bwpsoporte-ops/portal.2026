"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { login } from "@/lib/auth";

function MailIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
      <path d="m22 7-10 6L2 7" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <rect width="18" height="13" x="3" y="9" rx="2" />
      <path d="M7 9V7a5 5 0 0 1 10 0v2M12 14v3" />
    </svg>
  );
}

function EyeIcon({ hidden }: { hidden: boolean }) {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.5" />
      {hidden ? <path d="m4 4 16 16" /> : null}
    </svg>
  );
}

function FeatureIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/12 text-white backdrop-blur-sm">
      <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
        {children}
      </svg>
    </span>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("admin@roatanselfstorage.com");
  const [password, setPassword] = useState("Admin123!");
  const [message, setMessage] = useState("");

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const user = login(email, password);

    if (!user) {
      setMessage("Correo o contraseña incorrectos.");
      return;
    }

    router.push("/dashboard/overview");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#edf7ff] p-3 sm:p-5 lg:p-7">
      <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-sky-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-96 w-96 rounded-full bg-[#4188ef]/20 blur-3xl" />

      <section className="relative mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-7xl overflow-hidden rounded-[30px] border border-white/80 bg-white shadow-[0_30px_90px_rgba(15,89,168,0.18)] sm:min-h-[calc(100vh-2.5rem)] lg:min-h-[calc(100vh-3.5rem)] lg:grid-cols-[1.08fr_0.92fr]">
        <div className="relative hidden overflow-hidden bg-[#2874db] px-10 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-14 xl:py-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(255,255,255,0.22),transparent_30%),radial-gradient(circle_at_92%_90%,rgba(15,23,42,0.20),transparent_34%)]" />
          <div className="absolute -right-20 top-24 h-56 w-56 rounded-full border border-white/15" />
          <div className="absolute -right-8 top-36 h-56 w-56 rounded-full border border-white/10" />
          <div className="absolute bottom-0 left-0 right-0 h-44 bg-[linear-gradient(145deg,transparent_0%,rgba(12,71,155,0.42)_100%)]" />

          <div className="relative">
            <div className="inline-flex items-center gap-3 rounded-2xl border border-white/20 bg-white px-4 py-3 shadow-xl shadow-blue-950/15">
              <Image alt="Roatan Self Storage" className="h-auto w-32" height={406} priority src="/logologin.png" width={463} />
            </div>
            <p className="mt-12 text-xs font-black uppercase tracking-[0.22em] text-sky-100">Portal administrativo</p>
            <h1 className="mt-4 max-w-xl text-4xl font-black leading-[1.08] tracking-[-0.045em] text-white xl:text-5xl">
              Control fiscal con la claridad que tu operación necesita.
            </h1>
            <p className="mt-5 max-w-lg text-base font-medium leading-7 text-sky-50/90">
              Gestiona facturas, pagos BAC, correlativos CAI e integraciones desde un solo lugar seguro.
            </p>
          </div>

          <div className="relative grid gap-5 border-t border-white/15 pt-7 sm:grid-cols-2">
            <div className="flex gap-3">
              <FeatureIcon>
                <path d="M12 3 20 6v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-3Z" />
                <path d="m9 12 2 2 4-5" />
              </FeatureIcon>
              <div>
                <p className="text-sm font-black">Acceso protegido</p>
                <p className="mt-1 text-xs leading-5 text-sky-100">Entorno administrativo seguro.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <FeatureIcon>
                <path d="M4 19h16M7 16V9M12 16V5M17 16v-4" />
              </FeatureIcon>
              <div>
                <p className="text-sm font-black">Operación centralizada</p>
                <p className="mt-1 text-xs leading-5 text-sky-100">Visibilidad clara en tiempo real.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-5 py-8 sm:px-10 lg:px-12 xl:px-20">
          <div className="w-full max-w-md">
            <div className="mb-9 flex justify-center lg:hidden">
              <div className="rounded-2xl border border-sky-100 bg-white p-3 shadow-lg shadow-sky-900/10">
                <Image alt="Roatan Self Storage" className="h-auto w-36" height={406} priority src="/logologin.png" width={463} />
              </div>
            </div>

            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#2874db]">Bienvenido de nuevo</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">Inicia sesión</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">Ingresa tus credenciales para acceder al panel administrativo.</p>

            <form className="mt-9 space-y-5" onSubmit={handleLogin}>
              <label className="block">
                <span className="mb-2 block text-sm font-extrabold text-slate-700">Correo electrónico</span>
                <span className="flex items-center gap-3 rounded-xl border border-sky-100 bg-sky-50/50 px-4 text-slate-400 transition focus-within:border-[#4188ef] focus-within:bg-white focus-within:text-[#2874db] focus-within:ring-4 focus-within:ring-sky-100">
                  <MailIcon />
                  <input autoComplete="email" className="min-w-0 flex-1 bg-transparent py-3.5 text-sm font-semibold text-slate-800 outline-none placeholder:font-medium placeholder:text-slate-400" name="email" onChange={(event) => setEmail(event.target.value)} placeholder="admin@roatanselfstorage.com" required type="email" value={email} />
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-extrabold text-slate-700">Contraseña</span>
                <span className="flex items-center gap-3 rounded-xl border border-sky-100 bg-sky-50/50 px-4 text-slate-400 transition focus-within:border-[#4188ef] focus-within:bg-white focus-within:text-[#2874db] focus-within:ring-4 focus-within:ring-sky-100">
                  <LockIcon />
                  <input autoComplete="current-password" className="min-w-0 flex-1 bg-transparent py-3.5 text-sm font-semibold text-slate-800 outline-none placeholder:font-medium placeholder:text-slate-400" name="password" onChange={(event) => setPassword(event.target.value)} placeholder="Ingresa tu contraseña" required type={showPassword ? "text" : "password"} value={password} />
                  <button aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} className="rounded-md p-1 text-slate-400 transition hover:bg-sky-100 hover:text-[#2874db] focus:outline-none focus:ring-2 focus:ring-sky-300" onClick={() => setShowPassword((current) => !current)} type="button">
                    <EyeIcon hidden={!showPassword} />
                  </button>
                </span>
              </label>

              <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <label className="flex cursor-pointer items-center gap-2 font-semibold text-slate-600">
                  <input className="h-4 w-4 rounded border-sky-200 accent-[#2874db]" type="checkbox" />
                  Recordarme
                </label>
                <button className="font-extrabold text-[#2874db] transition hover:text-sky-700" type="button">¿Olvidaste tu contraseña?</button>
              </div>

              {message ? <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-700">{message}</p> : null}

              <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2874db] px-4 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-600/25 transition hover:bg-[#1f68cc] hover:shadow-xl hover:shadow-blue-600/30 focus:outline-none focus:ring-4 focus:ring-sky-200" type="submit">
                Ingresar al dashboard
                <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" viewBox="0 0 24 24">
                  <path d="M5 12h14m-6-6 6 6-6 6" />
                </svg>
              </button>
            </form>

            <div className="mt-10 flex items-center justify-center gap-2 border-t border-sky-100 pt-5 text-xs font-semibold text-slate-400">
              <svg aria-hidden="true" className="h-4 w-4 text-emerald-500" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 3 20 6v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-3Z" />
                <path d="m9 12 2 2 4-5" />
              </svg>
              Conexión segura y protegida
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
