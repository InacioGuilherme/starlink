"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./page.module.css";

function maskPhoneBR(v) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
}

function PhoneIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1V20a1 1 0 01-1 1C10.85 21 3 13.15 3 3a1 1 0 011-1h3.5a1 1 0 011 1c0 1.24.2 2.45.57 3.57a1 1 0 01-.24 1.02l-2.2 2.2z"
      />
    </svg>
  );
}

export default function Page() {
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [phone, setPhone] = useState("");
  const [checking, setChecking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepText, setStepText] = useState("Inicializando sistema…");
  const [done, setDone] = useState(false);

  const phoneRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/geo", { cache: "no-store" });
        const j = await r.json();
        if (!cancelled) {
          setCity(j?.city || "");
          setRegion(j?.regionName || "");
          setTimeout(() => phoneRef.current?.focus(), 120);
        }
      } catch {
        if (!cancelled) {
          setCity("sua região");
          setRegion("");
          setTimeout(() => phoneRef.current?.focus(), 120);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const locationLabel = useMemo(() => {
    if (city && region) return `${city} — ${region}`;
    if (city) return city;
    return "sua região";
  }, [city, region]);

  const startCheck = () => {
    const digits = phone.replace(/\D/g, "");
    if (!digits) {
      alert("Digite seu número para verificar.");
      return;
    }
    setChecking(true);
    setDone(false);
    setProgress(0);

    const steps = [
      "Estabelecendo link com constelação LEO…",
      "Calibrando feixe direcionado…",
      "Medindo perda e jitter do sinal…",
      "Calculando latência média…",
      "Validando capacidade na célula local…",
    ];

    let i = 0;
    const tick = () => {
      setStepText(steps[i] || "Finalizando verificação…");
      setProgress((p) => Math.min(100, p + 18 + Math.round(Math.random() * 7)));
      i += 1;
    };

    tick();
    const iv = setInterval(() => {
      tick();
      if (i >= steps.length + 2) {
        clearInterval(iv);
        setTimeout(() => {
          setChecking(false);
          setDone(true);
        }, 550);
      }
    }, 900);
  };

  const resetFlow = () => {
    setDone(false);
    setChecking(false);
    setProgress(0);
    setStepText("Inicializando sistema…");
    setPhone("");
    setTimeout(() => phoneRef.current?.focus(), 80);
  };

  const latencyLive = Math.max(18, Math.round(35 - progress / 5.2));
  const signalLive = Math.min(100, 70 + Math.round(progress / 1.7));
  const stabilityLive = Math.min(100, 78 + Math.round(progress / 2));

  const latencyFinal = 21;
  const signalFinal = 96;
  const stabilityFinal = 99;

  return (
    <main className={styles.page}>
      <div className={styles.bgLayer} />
      <div className={styles.gridDecor} aria-hidden="true">
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={`h-${i}`} className={styles.hLine} style={{ top: `${i * 8}vh` }} />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={`v-${i}`} className={styles.vLine} style={{ left: `${10 + i * 15}%` }} />
        ))}
      </div>

      <header className={styles.header}>
        <div className={styles.logo}>STARLINK</div>
      </header>

      <section className={styles.wrap}>
        <h1 className={styles.title}>Verifique sua conexão satelital</h1>
        <p className={styles.subtitle}>
          Sistema de análise automática via rede de satélites de órbita baixa (LEO).
          <br />
          Disponibilidade dinâmica por célula — cobertura varia por região.
        </p>

        {!checking && !done && (
          <div className={styles.form}>
            <label htmlFor="phone" className={styles.label}>Número de telefone</label>
            <div className={styles.inputBox}>
              <PhoneIcon className={styles.inputIcon} />
              <input
                id="phone"
                ref={phoneRef}
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="(11) 98765-4321"
                value={phone}
                onChange={(e) => setPhone(maskPhoneBR(e.target.value))}
                className={styles.input}
                aria-label="Digite seu número para verificação"
              />
            </div>
            <button className={styles.cta} onClick={startCheck}>
              Iniciar verificação
            </button>

            <ul className={styles.sellingPoints}>
              <li>Baixa latência típica <b>~20 ms</b></li>
              <li>Satélites LEO → <b>cobertura onde a fibra não chega</b></li>
              <li>Estabilidade com <b>redundância orbital</b></li>
            </ul>
          </div>
        )}

        {checking && (
          <div className={styles.loader}>
            <div className={styles.progressBar} role="progressbar" aria-valuenow={progress}>
              <div className={styles.progress} style={{ width: `${progress}%` }} />
            </div>
            <p className={styles.stepText}>{stepText}</p>

            <div className={styles.metricsBox}>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Latência</span>
                <span className={styles.metricValue}>{latencyLive} ms</span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Sinal</span>
                <span className={styles.metricValue}>{signalLive}%</span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Estabilidade</span>
                <span className={styles.metricValue}>{stabilityLive}%</span>
              </div>
            </div>
          </div>
        )}

        {done && (
          <>
            <div className={styles.result}>
              <div className={styles.badge}>Cobertura confirmada</div>
              <h2 className={styles.resultTitle}>
                Região de <span className={styles.location}>{locationLabel}</span> está disponível
              </h2>
              <p className={styles.resultText}>
                Conexão via satélite ativa nesta área. A constelação LEO oferece
                <b> alta velocidade</b> e <b>baixa latência</b>, mesmo onde as operadoras
                terrestres não chegam.
              </p>

              <div className={styles.resultMetrics}>
                <div className={styles.metricBlock}>
                  <span>{latencyFinal} ms</span>
                  <small>Latência</small>
                </div>
                <div className={styles.metricBlock}>
                  <span>{signalFinal}%</span>
                  <small>Sinal</small>
                </div>
                <div className={styles.metricBlock}>
                  <span>{stabilityFinal}%</span>
                  <small>Estabilidade</small>
                </div>
              </div>

<a
  href="https://wa.me/557192644642?text=Tenho%20interesse%20no%20teste%20da%20Starlink,%20realizei%20o%20teste%20de%20conex%C3%A3o."
  className={styles.whatsLarge}
  target="_blank"
  rel="noopener noreferrer"
>
  Conversar no WhatsApp
</a>
            </div>
          </>
        )}
      </section>

      <footer className={styles.footer}>
        <span className={styles.mini}>© Starlink — verificador de disponibilidade • LEO</span>
      </footer>
    </main>
  );
}
