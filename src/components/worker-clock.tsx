"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCheck,
  Clock3,
  ShieldCheck,
  Sprout,
} from "lucide-react";
import {
  DEMO_DATE,
  STORAGE_KEY,
  eventNames,
  id,
  initials,
  readStored,
  seedState,
  summary,
  type DemoState,
} from "@/lib/demo";

function loadDemo() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? readStored(raw) : seedState();
}
export default function WorkerClock() {
  const [state, setState] = useState<DemoState>(seedState);
  const [ready, setReady] = useState(false);
  const [employeeId, setEmployeeId] = useState<string>();
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<{
    event: string;
    time: string;
    protocol: string;
  }>();
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  useEffect(() => {
    try {
      setState(loadDemo());
    } catch {
      setError(
        "O navegador não conseguiu carregar a demonstração. Tente permitir o armazenamento local.",
      );
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!receipt) return;
    const timer = setTimeout(() => setReceipt(undefined), 15000);
    return () => clearTimeout(timer);
  }, [receipt]);
  const employee = state.employees.find((e) => e.id === employeeId);
  const data = employee ? summary(state.punches, employee.id) : null;
  const recordBreaks =
    data?.rows[0]?.recordBreaks ??
    employee?.recordBreaks ??
    state.settings.recordBreaks;
  const breakMinutes =
    data?.rows[0]?.breakMinutes ??
    employee?.breakMinutes ??
    state.settings.breakMinutes;
  const sequence = recordBreaks ? [0, 1, 2, 3] : [0, 3];
  const nextEvent = sequence[data?.rows.length ?? 0];
  const demoTimes = recordBreaks
    ? ["07:00", "12:00", "14:00", "17:00"]
    : [
        "07:00",
        `${String(Math.floor((7 * 60 + 480 + breakMinutes) / 60)).padStart(2, "0")}:${String(breakMinutes % 60).padStart(2, "0")}`,
      ];
  const displayTime = demoTimes[data?.rows.length ?? 0] || "Jornada concluída";
  const leave = () => {
    setEmployeeId(undefined);
    setError("");
    setReceipt(undefined);
  };
  async function confirmPunch() {
    if (!employee || nextEvent === undefined || submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      const write = () => {
        const fresh = loadDemo();
        if (fresh.closed)
          throw new Error(
            "Este período está fechado. Peça ao administrativo para reabrir a demonstração.",
          );
        const current = summary(fresh.punches, employee.id);
        if (current.rows.length !== data?.rows.length) {
          setState(fresh);
          throw new Error(
            "Este ponto já foi atualizado em outra tela. Confira a próxima batida.",
          );
        }
        const punchId = id();
        const updated: DemoState = {
          ...fresh,
          punches: [
            ...fresh.punches,
            {
              id: punchId,
              employeeId: employee.id,
              date: DEMO_DATE,
              type: nextEvent,
              time: displayTime,
              recordBreaks,
              breakMinutes,
            },
          ],
          audit: [
            {
              id: id(),
              employeeId: employee.id,
              text: `${eventNames[nextEvent]} de ${employee.name} registrada pela tela do QR às ${displayTime} (relógio simulado).`,
              created: new Date().toISOString(),
            },
            ...fresh.audit,
          ],
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setState(updated);
        setEmployeeId(undefined);
        setReceipt({
          event: eventNames[nextEvent],
          time: displayTime,
          protocol: punchId.slice(0, 8).toUpperCase(),
        });
      };
      if (navigator.locks)
        await navigator.locks.request("limoeiro-demo-punch", write);
      else write();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível guardar a batida. Tente novamente.",
      );
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }
  if (!ready)
    return (
      <div className="loading">
        <Sprout size={34} />
        <p>Preparando o ponto…</p>
      </div>
    );
  return (
    <div className="worker-page">
      <header className="worker-brand">
        <Sprout size={27} />
        <span>
          Limoeiro<small>PONTO DA EQUIPE</small>
        </span>
      </header>
      <main className="worker-card">
        <span className="worker-demo">
          <i /> Demonstração · relógio fictício
        </span>
        {receipt ? (
          <div className="worker-success">
            <span className="success-ring">
              <CheckCheck size={42} strokeWidth={1.6} />
            </span>
            <h1>Ponto confirmado.</h1>
            <p>
              {receipt.event} registrada às <strong>{receipt.time}</strong>.
            </p>
            <div className="receipt">
              <span>Comprovante de demonstração</span>
              <strong>08/10/2026 · {receipt.time}</strong>
              <small>Protocolo {receipt.protocol}</small>
            </div>
            <p className="worker-caption">
              Tudo certo! Você já pode fechar esta tela.
            </p>
            <button className="button primary full-width" onClick={leave}>
              Registrar outro ponto <ArrowRight size={18} />
            </button>
          </div>
        ) : !employee ? (
          <>
            <span className="worker-step">PASSO 1 DE 2</span>
            <h1>
              Olá! Vamos registrar
              <br />
              seu ponto?
            </h1>
            <p className="worker-intro">
              Toque no seu nome. Depois, é só confirmar.
            </p>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <div
              className="worker-people"
              role="group"
              aria-label="Escolha seu nome"
            >
              {state.employees
                .filter((e) => e.status === "Ativo")
                .map((person) => (
                  <button
                    key={person.id}
                    className="worker-person"
                    data-employee-code={person.code}
                    onClick={() => {
                      setError("");
                      try {
                        const fresh = loadDemo();
                        setState(fresh);
                        if (
                          !fresh.employees.some(
                            (e) => e.id === person.id && e.status === "Ativo",
                          )
                        )
                          return setError(
                            "Este funcionário não está disponível. Escolha outro nome.",
                          );
                        setEmployeeId(person.id);
                      } catch {
                        setError(
                          "Não foi possível carregar a demonstração neste navegador.",
                        );
                      }
                    }}
                  >
                    <span className={`avatar color-${person.color}`}>
                      {initials(person.name)}
                    </span>
                    <span>
                      <strong>{person.name}</strong>
                      <small>
                        {person.role}
                        {state.employees.filter(
                          (e) =>
                            e.name.toLocaleLowerCase("pt-BR") ===
                            person.name.toLocaleLowerCase("pt-BR"),
                        ).length > 1
                          ? ` · ${person.code}`
                          : ""}
                      </small>
                    </span>
                    <ArrowRight size={18} />
                  </button>
                ))}
            </div>
            {!state.employees.some((e) => e.status === "Ativo") && (
              <p className="worker-caption">
                Ainda não há funcionários ativos nesta demonstração.
              </p>
            )}
            <p className="worker-caption">
              Pessoas fictícias para experimentar. Não precisa de usuário ou
              senha.
            </p>
          </>
        ) : (
          <>
            <div className="worker-step-row">
              <span className="worker-step">PASSO 2 DE 2</span>
              <button className="worker-exit" onClick={leave}>
                <ArrowLeft size={15} /> Trocar nome
              </button>
            </div>
            <h1>Olá, {employee.name.split(" ")[0]}.</h1>
            <p className="worker-intro">
              {employee.code} · {state.settings.unit}
            </p>
            {state.closed ? (
              <div className="worker-blocked">
                <ShieldCheck size={31} />
                <h2>Período fechado</h2>
                <p>
                  O administrativo precisa reabrir o período para continuar esta
                  demonstração.
                </p>
              </div>
            ) : nextEvent === undefined ? (
              <div className="worker-blocked">
                <CheckCheck size={34} />
                <h2>Seu dia está completo.</h2>
                <p>
                  As {sequence.length} batidas desta jornada já foram
                  registradas. Consulte a pasta digital na demonstração
                  administrativa.
                </p>
              </div>
            ) : (
              <>
                <div className="worker-clock">
                  <span>Horário automático de demonstração</span>
                  <strong>{displayTime}</strong>
                  <small>Quinta-feira, 08 de outubro</small>
                </div>
                <div className="worker-next">
                  <span className="task-icon green">
                    <Clock3 size={22} />
                  </span>
                  <div>
                    <small>Você vai registrar</small>
                    <strong>{eventNames[nextEvent]}</strong>
                  </div>
                </div>
                {error && (
                  <p className="form-error" role="alert">
                    {error}
                  </p>
                )}
                <button
                  className="button primary worker-confirm"
                  onClick={confirmPunch}
                  disabled={busy}
                >
                  <Check size={25} />{" "}
                  {busy
                    ? "Registrando…"
                    : `Confirmar ${eventNames[nextEvent].toLowerCase()}`}
                </button>
                <p className="worker-caption">
                  Sem preencher horário. Basta confirmar.
                </p>
                <div
                  className={`worker-progress ${!recordBreaks ? "two-events" : ""}`}
                >
                  {sequence.map((type, index) => (
                    <div
                      key={type}
                      className={
                        index < (data?.rows.length || 0)
                          ? "done"
                          : type === nextEvent
                            ? "current"
                            : ""
                      }
                    >
                      <span>
                        {index < (data?.rows.length || 0) ? (
                          <Check size={13} />
                        ) : (
                          index + 1
                        )}
                      </span>
                      <small>{eventNames[type]}</small>
                    </div>
                  ))}
                </div>
              </>
            )}
            <button className="worker-back" onClick={leave}>
              <ArrowLeft size={15} /> Não sou {employee.name.split(" ")[0]}
            </button>
          </>
        )}
      </main>
      <footer className="worker-footer">
        <ShieldCheck size={15} />
        <p>Dados fictícios. Cada navegador mantém sua própria demonstração.</p>
        <span>
          uma solução <b>verson</b>
        </span>
      </footer>
    </div>
  );
}
