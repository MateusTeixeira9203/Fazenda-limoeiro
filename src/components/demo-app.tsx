"use client";
import { QrCollector } from "./qr-collector";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  Clock3,
  ClipboardCheck,
  Download,
  FileCheck2,
  FileText,
  Home,
  Leaf,
  Menu,
  MessageSquare,
  Plus,
  RotateCcw,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Sprout,
  Users,
  X,
} from "lucide-react";
import {
  Avatar,
  Badge,
  Empty,
  Hint,
  Intro,
  Modal,
  SectionTitle,
  TextLink,
} from "./ui";
import {
  ClosingPage,
  DocumentsPage,
  EmployeeProfile,
  SettingsPage,
  TimePage,
} from "./module-pages";
import {
  DEMO_DATE,
  STORAGE_KEY,
  closingState,
  csvCell,
  download,
  hours,
  id,
  readStored,
  seedState,
  summary,
  templates,
  type DemoState,
  type Document,
  type Employee,
  type Page,
} from "@/lib/demo";

const navigation = [
  { id: "overview", label: "Visão geral", icon: Home },
  { id: "employees", label: "Funcionários", icon: Users },
  { id: "time", label: "Ponto e jornadas", icon: Clock3 },
  { id: "documents", label: "Documentos", icon: FileText },
  { id: "closing", label: "Fechamentos", icon: ClipboardCheck },
  { id: "settings", label: "Configurações", icon: Settings2 },
] as const;
type Dialog =
  | { type: "employee"; employee?: Employee }
  | { type: "newDocument"; employeeId?: string; template?: string }
  | { type: "document"; id: string }
  | { type: "feedback" }
  | { type: "guide" }
  | { type: "reset" }
  | { type: "simulator"; employeeId?: string }
  | { type: "reopen" };
export type Actions = {
  navigate: (page: Page, employeeId?: string) => void;
  openDocument: (doc: Document) => void;
  newDocument: (employeeId?: string, template?: string) => void;
  simulate: (employeeId?: string) => void;
  authorize: (employeeId: string) => void;
  editEmployee: (employee: Employee) => void;
  closeMonth: () => void;
  reopenMonth: () => void;
  saveSettings: (settings: DemoState["settings"]) => void;
  reset: () => void;
  exportClosing: () => void;
  feedback: () => void;
};
const now = () => new Date().toISOString();
export default function DemoApp({ networkUrl }: { networkUrl?: string }) {
  const [state, setState] = useState<DemoState>(seedState);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [page, setPage] = useState<Page>("overview");
  const [employeeId, setEmployeeId] = useState<string>();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("Todos os setores");
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState(readStored(raw));
    } catch {
      setStorageError(true);
    }
    const sync = () => {
      const [p, employee] = location.hash.slice(1).split("/");
      setPage(navigation.some((n) => n.id === p) ? (p as Page) : "overview");
      setEmployeeId(employee || undefined);
      setMobileMenu(false);
    };
    sync();
    const syncStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        try {
          setState(readStored(event.newValue));
        } catch {
          setStorageError(true);
        }
      }
    };
    window.addEventListener("storage", syncStorage);
    window.addEventListener("hashchange", sync);
    setReady(true);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("storage", syncStorage);
    };
  }, []);
  useEffect(() => {
    if (ready) {
      try {
        const serialized = JSON.stringify(state);
        if (localStorage.getItem(STORAGE_KEY) !== serialized)
          localStorage.setItem(STORAGE_KEY, serialized);
      } catch {
        setStorageError(true);
      }
    }
  }, [state, ready]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 6000);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    if (!mobileMenu) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenu(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mobileMenu]);
  const navigate = useCallback((next: Page, employee?: string) => {
    window.location.hash = employee ? `${next}/${employee}` : next;
    setPage(next);
    setEmployeeId(employee);
    setMobileMenu(false);
    window.scrollTo({ top: 0 });
  }, []);
  function update(fn: (s: DemoState) => DemoState, message?: string) {
    setState(fn);
    if (message) setToast(message);
  }
  const pendingDocs = state.documents.filter((d) => !d.signed);
  const pendingTime = state.employees.filter(
    (e) =>
      e.status === "Ativo" &&
      (!summary(state.punches, e.id).complete ||
        (summary(state.punches, e.id).extra > 0 &&
          !state.authorized.includes(e.id))),
  );
  const actions: Actions = {
    navigate,
    openDocument: (doc) => setDialog({ type: "document", id: doc.id }),
    newDocument: (employeeId, template) =>
      setDialog({ type: "newDocument", employeeId, template }),
    simulate: (employeeId) => setDialog({ type: "simulator", employeeId }),
    editEmployee: (employee) => setDialog({ type: "employee", employee }),
    authorize: (employeeId) => {
      if (state.closed)
        return setToast("Reabra o fechamento antes de alterar autorizações.");
      const employee = state.employees.find((e) => e.id === employeeId)!;
      update(
        (s) => ({
          ...s,
          authorized: [...new Set([...s.authorized, employeeId])],
          audit: [
            {
              id: id(),
              employeeId,
              text: `Excedente de ${employee.name} autorizado para ${s.settings.destination.toLowerCase()} (simulação).`,
              created: now(),
            },
            ...s.audit,
          ],
        }),
        "Excedente autorizado. As horas foram preservadas.",
      );
    },
    closeMonth: () => {
      if (pendingTime.length || state.closed) return;
      update(
        (s) => ({
          ...s,
          closed: true,
          closingVersion: s.closingVersion + 1,
          closingSnapshot: structuredClone({
            employees: s.employees.filter((e) => e.status === "Ativo"),
            punches: s.punches,
            authorized: s.authorized,
            settings: s.settings,
          }),
          audit: [
            {
              id: id(),
              text: `Fechamento demonstrativo de outubro confirmado. Versão ${s.closingVersion + 1}.`,
              created: now(),
            },
            ...s.audit,
          ],
        }),
        "Fechamento simulado concluído. Alterações de ponto estão bloqueadas.",
      );
    },
    reopenMonth: () => setDialog({ type: "reopen" }),
    saveSettings: (settings) => {
      if (state.closed && settings.destination !== state.settings.destination)
        return setToast(
          "Reabra o fechamento antes de mudar o destino das horas.",
        );
      update(
        (s) => ({ ...s, settings }),
        "Preferências da demonstração salvas neste navegador.",
      );
    },
    reset: () => setDialog({ type: "reset" }),
    feedback: () => setDialog({ type: "feedback" }),
    exportClosing: () => {
      const report = closingState(state);
      const rows = [
        [
          "SIMULAÇÃO — Outubro 2026 (amostra: 08/10)",
          "Matrícula",
          "Situação",
          "Entrada",
          "Início intervalo",
          "Fim intervalo",
          "Saída",
          "Minutos previstos",
          "Minutos trabalhados",
          "Minutos excedentes",
          "Minutos faltantes",
          "Classificação",
          "Destino",
          "Fechamento",
        ],
      ];
      report.employees
        .filter((e) => e.status === "Ativo")
        .forEach((e) => {
          const t = summary(report.punches, e.id);
          const authorized = report.authorized.includes(e.id);
          rows.push([
            e.name,
            e.code,
            e.status,
            ...Array.from(
              { length: 4 },
              (_, i) => t.rows.find((p) => p.type === i)?.time ?? "",
            ),
            "480",
            t.complete ? String(t.worked) : "Pendente",
            t.complete ? String(t.extra) : "Pendente",
            t.complete ? String(t.missing) : "Pendente",
            !t.complete
              ? "Marcações incompletas"
              : t.extra
                ? authorized
                  ? "Autorizado"
                  : "Sem autorização"
                : "Sem excedente",
            authorized && t.extra ? report.settings.destination : "—",
            state.closed ? `Fechado v${state.closingVersion}` : "Prévia",
          ]);
        });
      download(
        "limoeiro-fechamento-simulado-outubro.csv",
        rows.map((r) => r.map(csvCell).join(";")).join("\r\n"),
      );
      setToast("Relatório demonstrativo exportado.");
    },
  };
  function exportFeedback() {
    download(
      "limoeiro-feedbacks.csv",
      [
        ["Data", "Tela", "Tipo", "Comentário"],
        ...state.feedbacks.map((f) => [f.created, f.page, f.kind, f.text]),
      ]
        .map((r) => r.map(csvCell).join(";"))
        .join("\r\n"),
    );
  }
  const currentEmployee = state.employees.find((e) => e.id === employeeId);
  if (!ready)
    return (
      <div className="loading">
        <Sprout size={34} />
        <h1>Limoeiro</h1>
        <p>Preparando sua demonstração…</p>
      </div>
    );
  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main-content")?.focus();
        }}
      >
        Pular para o conteúdo
      </a>
      {mobileMenu && (
        <button
          className="sidebar-backdrop"
          aria-label="Fechar navegação"
          onClick={() => setMobileMenu(false)}
        />
      )}
      <aside className={`sidebar ${mobileMenu ? "open" : ""}`}>
        <a
          href="#overview"
          className="brand"
          onClick={() => navigate("overview")}
        >
          <span className="brand-symbol">
            <Sprout size={29} strokeWidth={1.6} />
          </span>
          <span>
            Limoeiro<small>GESTÃO DE PESSOAS</small>
          </span>
        </a>
        <button className="unit-switch" onClick={() => navigate("settings")}>
          <span className="unit-icon">
            <Leaf size={17} />
          </span>
          <span>
            {state.settings.unit}
            <small>Unidade demonstrativa</small>
          </span>
          <ChevronDown size={15} />
        </button>
        <span className="nav-caption">ESPAÇO DE TRABALHO</span>
        <nav aria-label="Navegação principal">
          {navigation.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => navigate(item.id)}
              className={`nav-item ${page === item.id ? "active" : ""}`}
              aria-current={page === item.id ? "page" : undefined}
            >
              <item.icon size={20} strokeWidth={1.7} />
              <span>{item.label}</span>
              {item.id === "documents" && pendingDocs.length > 0 && (
                <span className="nav-count">{pendingDocs.length}</span>
              )}
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="explore-card">
            <span className="explore-icon">
              <Sparkles size={21} />
            </span>
            <h3>Vamos experimentar?</h3>
            <p>Conheça os fluxos com dados fictícios e conte o que achou.</p>
            <button onClick={() => setDialog({ type: "guide" })}>
              Roteiro de exploração <ArrowUpRight size={17} />
            </button>
          </div>
          <button className="sidebar-feedback" onClick={actions.feedback}>
            <MessageSquare size={18} /> Deixar um feedback{" "}
            <ArrowUpRight size={15} />
          </button>
          <div className="powered">
            uma solução{" "}
            <strong>
              verson<span>®</span>
            </strong>
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button menu-button"
              onClick={() => setMobileMenu(!mobileMenu)}
              aria-label="Abrir navegação"
              aria-expanded={mobileMenu}
            >
              <Menu size={22} />
            </button>
            <span>Fazenda Limoeiro</span>
            <ChevronRight size={14} />
            <strong>{navigation.find((n) => n.id === page)?.label}</strong>
          </div>
          <div className="topbar-actions">
            <span className="demo-pill">
              <i /> Demonstração
            </span>
            <button
              className="notification-button"
              onClick={() => navigate("documents")}
              aria-label={`${pendingDocs.length} documentos pendentes`}
            >
              <Bell size={19} />
              {pendingDocs.length > 0 && <i />}
            </button>
            <button
              className="user-button"
              onClick={() => navigate("settings")}
              aria-label="Abrir configurações administrativas"
            >
              <span>AD</span>
              <ChevronDown size={14} />
            </button>
          </div>
        </header>
        <main id="main-content" tabIndex={-1} className="main-content">
          <div className="demo-strip">
            <span>
              <Sparkles size={15} />
              <b>Este é seu espaço para experimentar.</b> Dados fictícios;
              alterações salvas só neste navegador.
            </span>
            <button onClick={() => setDialog({ type: "guide" })}>
              Como explorar <ArrowRight size={14} />
            </button>
          </div>
          {storageError && (
            <div className="storage-warning" role="alert">
              Não foi possível ler ou salvar os dados locais. Suas alterações
              podem ser perdidas ao sair. Exporte os feedbacks antes de fechar
              esta página.
            </div>
          )}
          {page === "overview" && (
            <Overview
              state={state}
              actions={actions}
              newEmployee={() => setDialog({ type: "employee" })}
            />
          )}
          {page === "employees" &&
            (currentEmployee ? (
              <EmployeeProfile
                key={currentEmployee.id}
                employee={currentEmployee}
                state={state}
                actions={actions}
              />
            ) : (
              <>
                <Intro
                  eyebrow="PESSOAS EM PRIMEIRO LUGAR"
                  title="Funcionários"
                  description="Uma pasta para cada pessoa. Tudo o que importa, no mesmo lugar."
                  action={
                    <button
                      className="button primary"
                      onClick={() => setDialog({ type: "employee" })}
                    >
                      <Plus size={18} /> Novo funcionário
                    </button>
                  }
                />
                <Hint>
                  Experimente cadastrar uma pessoa fictícia e abrir sua pasta.
                  Documentos, ponto e histórico ficam reunidos aqui.
                </Hint>
                <section className="panel">
                  <div className="table-toolbar">
                    <div>
                      <h2>
                        Equipe da fazenda{" "}
                        <span className="count">{state.employees.length}</span>
                      </h2>
                    </div>
                    <div className="filters">
                      <label className="search-input">
                        <Search size={17} />
                        <input
                          aria-label="Buscar funcionário"
                          placeholder="Buscar nome ou matrícula"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                        />
                      </label>
                      <select
                        aria-label="Filtrar por setor"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                      >
                        {[
                          "Todos os setores",
                          "Campo",
                          "Administrativo",
                          "Logística",
                        ].map((d) => (
                          <option key={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <EmployeeTable
                    state={state}
                    actions={actions}
                    employees={state.employees.filter(
                      (e) =>
                        `${e.name} ${e.code}`
                          .toLocaleLowerCase("pt-BR")
                          .includes(search.toLocaleLowerCase("pt-BR")) &&
                        (department === "Todos os setores" ||
                          e.department === department),
                    )}
                  />
                </section>
              </>
            ))}
          {page === "time" && <TimePage state={state} actions={actions} />}
          {page === "documents" && (
            <DocumentsPage state={state} actions={actions} />
          )}
          {page === "closing" && (
            <ClosingPage state={state} actions={actions} />
          )}
          {page === "settings" && (
            <SettingsPage state={state} actions={actions} />
          )}
          <footer className="page-footer">
            <span>
              <Sprout size={15} /> Cuidar de quem faz a fazenda acontecer.
            </span>
            <button onClick={actions.feedback}>
              Sua opinião ajuda a construir <MessageSquare size={15} />
            </button>
          </footer>
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <CheckCheck size={20} />
          <span>{toast}</span>
          <button aria-label="Dispensar aviso" onClick={() => setToast("")}>
            <X size={17} />
          </button>
        </div>
      )}
      {dialog?.type === "employee" && (
        <EmployeeForm
          employee={dialog.employee}
          state={state}
          close={() => setDialog(null)}
          save={(employee) => {
            update(
              (s) => ({
                ...s,
                employees: dialog.employee
                  ? s.employees.map((e) =>
                      e.id === employee.id ? employee : e,
                    )
                  : [...s.employees, employee],
                audit: [
                  {
                    id: id(),
                    employeeId: employee.id,
                    text: `${employee.name}: ${dialog.employee ? "cadastro atualizado" : "pasta digital criada"} na demonstração.`,
                    created: now(),
                  },
                  ...s.audit,
                ],
              }),
              "Cadastro fictício salvo. A pasta já está disponível.",
            );
            setDialog(null);
            navigate("employees", employee.id);
          }}
        />
      )}
      {dialog?.type === "newDocument" && (
        <Modal
          title="Preparar um documento"
          description="Escolha uma pessoa e um modelo para simular a emissão."
          onClose={() => setDialog(null)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);
              const doc: Document = {
                id: id(),
                employeeId: String(data.get("employee")),
                template: String(data.get("template")),
                created: DEMO_DATE,
                signed: false,
                snapshot: (() => {
                  const e = state.employees.find(
                    (e) => e.id === String(data.get("employee")),
                  )!;
                  return {
                    name: e.name,
                    code: e.code,
                    role: e.role,
                    unit: state.settings.unit,
                  };
                })(),
              };
              update((s) => ({
                ...s,
                documents: [doc, ...s.documents],
                audit: [
                  {
                    id: id(),
                    employeeId: doc.employeeId,
                    text: `${doc.template} emitido na demonstração.`,
                    created: now(),
                  },
                  ...s.audit,
                ],
              }));
              setDialog({ type: "document", id: doc.id });
            }}
          >
            <label>
              Funcionário
              <select
                name="employee"
                defaultValue={dialog.employeeId || state.employees[0]?.id}
                required
              >
                {state.employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} · {e.code}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Modelo de documento
              <select
                name="template"
                defaultValue={dialog.template || templates[0].name}
              >
                {templates.map((t) => (
                  <option key={t.name}>{t.name}</option>
                ))}
              </select>
            </label>
            <Hint>
              O conteúdo é ilustrativo. Nesta versão, a emissão e a assinatura
              servem apenas para experimentar o fluxo.
            </Hint>
            <div className="modal-actions">
              <button
                type="button"
                className="button"
                onClick={() => setDialog(null)}
              >
                Cancelar
              </button>
              <button className="button primary">
                Gerar prévia <ArrowRight size={17} />
              </button>
            </div>
          </form>
        </Modal>
      )}
      {dialog?.type === "document" && (
        <DocumentDialog
          key={dialog.id}
          doc={state.documents.find((d) => d.id === dialog.id)!}
          state={state}
          close={() => setDialog(null)}
          sign={(doc) => {
            update(
              (s) => ({
                ...s,
                documents: s.documents.map((d) =>
                  d.id === doc.id ? { ...d, signed: true, signedAt: now() } : d,
                ),
                audit: [
                  {
                    id: id(),
                    employeeId: doc.employeeId,
                    text: `Assinatura simulada de ${doc.template} concluída.`,
                    created: now(),
                  },
                  ...s.audit,
                ],
              }),
              "Assinatura simulada concluída. Documento salvo na pasta do funcionário.",
            );
            setDialog(null);
          }}
        />
      )}
      {dialog?.type === "simulator" && (
        <QrCollector networkUrl={networkUrl} onClose={() => setDialog(null)} />
      )}
      {dialog?.type === "feedback" && (
        <Modal
          title="O que podemos melhorar?"
          description={`Seu comentário ficará associado a ${navigation.find((n) => n.id === page)?.label}${currentEmployee ? ` / ${currentEmployee.name}` : ""}.`}
          onClose={() => setDialog(null)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);
              const text = String(data.get("text")).trim();
              if (!text) return;
              update(
                (s) => ({
                  ...s,
                  feedbacks: [
                    {
                      id: id(),
                      page: `${navigation.find((n) => n.id === page)?.label}${currentEmployee ? ` / ${currentEmployee.code}` : ""}`,
                      kind: String(data.get("kind")),
                      text,
                      created: now(),
                    },
                    ...s.feedbacks,
                  ],
                }),
                "Feedback guardado neste navegador. Exporte para compartilhar com a equipe.",
              );
              setDialog(null);
            }}
          >
            <label>
              Tipo de comentário
              <select name="kind">
                <option>Sugestão de melhoria</option>
                <option>Algo não ficou claro</option>
                <option>Funcionalidade que falta</option>
                <option>Gostei desta funcionalidade</option>
              </select>
            </label>
            <label>
              Seu comentário
              <textarea
                name="text"
                required
                maxLength={2000}
                rows={4}
                placeholder="O que faria diferença no dia a dia da fazenda?"
              />
            </label>
            <p className="field-note">
              O feedback fica neste navegador. Use “Exportar feedbacks” para
              enviá-lo à equipe por um canal de sua escolha.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="button"
                onClick={exportFeedback}
                disabled={!state.feedbacks.length}
              >
                <Download size={16} /> Exportar ({state.feedbacks.length})
              </button>
              <button className="button primary">
                Guardar feedback <Check size={17} />
              </button>
            </div>
          </form>
          {state.feedbacks.length > 0 && (
            <div className="feedback-list">
              <h3>Comentários já registrados</h3>
              {state.feedbacks.map((f) => (
                <article key={f.id}>
                  <span className="eyebrow">
                    {f.page} · {f.kind}
                  </span>
                  <p>{f.text}</p>
                </article>
              ))}
            </div>
          )}
        </Modal>
      )}
      {dialog?.type === "guide" && (
        <Modal
          title="Um passeio pela fazenda digital"
          description="Três caminhos para entender como tudo se conecta. Experimente na ordem que preferir."
          onClose={() => setDialog(null)}
        >
          <div className="guide-list">
            {[
              {
                title: "Conheça uma pasta digital",
                text: "Abra um funcionário ou crie um cadastro fictício. Veja seus documentos e registros.",
                page: "employees" as Page,
                icon: Users,
              },
              {
                title: "Do documento à assinatura",
                text: "Gere um termo, confira o conteúdo e simule a assinatura do funcionário.",
                page: "documents" as Page,
                icon: FileCheck2,
              },
              {
                title: "Do ponto ao fechamento",
                text: "Abra o QR, registre uma batida na tela do funcionário e confira o fechamento.",
                page: "time" as Page,
                icon: Clock3,
              },
            ].map((g, index) => (
              <button
                key={g.page}
                className="guide-item"
                onClick={() => {
                  setDialog(null);
                  navigate(g.page);
                }}
              >
                <span className="guide-number">0{index + 1}</span>
                <span>
                  <strong>{g.title}</strong>
                  <small>{g.text}</small>
                </span>
                <ArrowRight size={20} />
              </button>
            ))}
          </div>
          <Hint>
            Use “Deixar um feedback” em qualquer tela. Você pode reiniciar a
            demonstração nas configurações sem apagar seus comentários.
          </Hint>
        </Modal>
      )}
      {dialog?.type === "reset" && (
        <Modal
          title="Começar uma nova simulação?"
          description="Cadastros, documentos, ponto e configurações voltarão aos exemplos iniciais. Seus feedbacks serão mantidos."
          onClose={() => setDialog(null)}
        >
          <div className="modal-actions">
            <button className="button" onClick={() => setDialog(null)}>
              Continuar explorando
            </button>
            <button
              className="button primary"
              onClick={() => {
                update(
                  (s) => ({ ...seedState(), feedbacks: s.feedbacks }),
                  "Demonstração reiniciada. Seus feedbacks foram preservados.",
                );
                setDialog(null);
                navigate("overview");
              }}
            >
              <RotateCcw size={17} /> Reiniciar demonstração
            </button>
          </div>
        </Modal>
      )}
      {dialog?.type === "reopen" && (
        <Modal
          title="Reabrir o fechamento"
          description="O motivo fica no histórico da demonstração. Você poderá voltar a simular marcações."
          onClose={() => setDialog(null)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const reason = String(
                new FormData(e.currentTarget).get("reason"),
              ).trim();
              if (!reason) return;
              update(
                (s) => ({
                  ...s,
                  closed: false,
                  audit: [
                    {
                      id: id(),
                      text: `Fechamento v${s.closingVersion} reaberto. Motivo: ${reason}`,
                      created: now(),
                    },
                    ...s.audit,
                  ],
                }),
                "Fechamento reaberto com motivo registrado.",
              );
              setDialog(null);
            }}
          >
            <label>
              Motivo da reabertura
              <textarea name="reason" rows={3} required maxLength={500} />
            </label>
            <div className="modal-actions">
              <button className="button primary">Confirmar reabertura</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Overview({
  state,
  actions,
  newEmployee,
}: {
  state: DemoState;
  actions: Actions;
  newEmployee: () => void;
}) {
  const pending = state.documents.filter((d) => !d.signed);
  const complete = state.employees.filter(
    (e) => summary(state.punches, e.id).complete,
  ).length;
  const extra = state.employees.reduce(
    (acc, e) => acc + summary(state.punches, e.id).extra,
    0,
  );
  return (
    <>
      <Intro
        eyebrow="QUINTA-FEIRA, 08 DE OUTUBRO · DIA DE EXEMPLO"
        title="Bom dia, equipe."
        description="Uma visão de quem faz a Fazenda Limoeiro acontecer."
        action={
          <button className="button primary" onClick={newEmployee}>
            <Plus size={18} /> Novo funcionário
          </button>
        }
      />
      <div className="stats-grid">
        {[
          {
            title: "Funcionários ativos",
            value: String(
              state.employees.filter((e) => e.status === "Ativo").length,
            ).padStart(2, "0"),
            caption: "Pessoas na sua equipe",
            icon: Users,
            page: "employees" as Page,
            className: "",
          },
          {
            title: "Jornadas completas",
            value: `${String(complete).padStart(2, "0")}`,
            caption: `${state.punches.length} marcações no dia de exemplo`,
            icon: Clock3,
            page: "time" as Page,
            className: "",
          },
          {
            title: "Assinaturas pendentes",
            value: String(pending.length).padStart(2, "0"),
            caption: "Documentos para conferir",
            icon: FileText,
            page: "documents" as Page,
            className: "",
          },
          {
            title: "Horas excedentes",
            value: hours(extra),
            caption: "Acompanhe a classificação",
            icon: ClipboardCheck,
            page: "closing" as Page,
            className: "highlight",
          },
        ].map((card) => (
          <button
            key={card.title}
            className={`stat-card ${card.className}`}
            onClick={() => actions.navigate(card.page)}
          >
            <span className="stat-top">
              <span>{card.title}</span>
              <card.icon size={20} strokeWidth={1.6} />
            </span>
            <strong>{card.value}</strong>
            <span className="stat-bottom">
              {card.caption}
              <ArrowUpRight size={17} />
            </span>
          </button>
        ))}
      </div>
      <div className="dashboard-grid">
        <section className="panel attention-panel">
          <SectionTitle
            title="Um pouco de atenção por aqui"
            subtitle="Pequenas ações para manter tudo em dia."
            action={<span className="subtle-tag">PRÓXIMOS PASSOS</span>}
          />
          <div className="attention-item">
            <span className="task-icon amber">
              <FileText size={21} />
            </span>
            <div>
              <h3>
                {pending.length
                  ? `${pending.length} documentos aguardam assinatura`
                  : "Documentos em dia"}
              </h3>
              <p>
                {pending.length
                  ? "Prepare o celular e convide cada pessoa a conferir."
                  : "Todos os documentos desta simulação foram confirmados."}
              </p>
            </div>
            <button
              aria-label="Conferir documentos pendentes"
              onClick={() => actions.navigate("documents")}
            >
              <ArrowUpRight size={20} />
            </button>
          </div>
          <div className="attention-item">
            <span className="task-icon blue">
              <Clock3 size={21} />
            </span>
            <div>
              <h3>
                {state.employees.length - complete
                  ? `${state.employees.length - complete} jornada(s) para conferir`
                  : "Marcações completas"}
              </h3>
              <p>
                {state.employees.length - complete
                  ? "Há horários faltando no dia de exemplo."
                  : "As marcações previstas estão disponíveis para apuração."}
              </p>
            </div>
            <button
              aria-label="Conferir jornadas"
              onClick={() => actions.navigate("time")}
            >
              <ArrowUpRight size={20} />
            </button>
          </div>
          <div className="attention-item">
            <span className="task-icon green">
              <ClipboardCheck size={21} />
            </span>
            <div>
              <h3>
                {state.closed
                  ? "Outubro fechado na simulação"
                  : "Prepare o fechamento de outubro"}
              </h3>
              <p>Confira horas, autorizações e pendências em um só lugar.</p>
            </div>
            <button
              aria-label="Ver fechamento de outubro"
              onClick={() => actions.navigate("closing")}
            >
              <ArrowUpRight size={20} />
            </button>
          </div>
        </section>
        <section className="quick-panel">
          <span className="eyebrow">MENOS PAPEL, MAIS PROXIMIDADE</span>
          <h2>
            A rotina fica mais leve
            <br />
            quando tudo se conecta.
          </h2>
          <p>
            Da chegada ao campo à assinatura de um documento, cada registro
            encontra seu lugar.
          </p>
          <div className="field-illustration" aria-hidden="true">
            <div className="sun" />
            <div className="hill h1" />
            <div className="hill h2" />
            <div className="hill h3" />
            <Sprout className="field-sprout" size={44} strokeWidth={1.1} />
          </div>
          <button onClick={() => actions.newDocument()}>
            Experimentar um documento <ArrowRight size={17} />
          </button>
        </section>
      </div>
      <section className="panel">
        <SectionTitle
          title="Gente que faz acontecer"
          subtitle="Acesse a pasta digital de cada funcionário."
          action={
            <TextLink onClick={() => actions.navigate("employees")}>
              Ver toda a equipe
            </TextLink>
          }
        />
        <EmployeeTable
          employees={state.employees.slice(0, 4)}
          state={state}
          actions={actions}
          compact
        />
      </section>
      <div className="bottom-grid">
        <section className="panel">
          <SectionTitle
            title="Últimos movimentos"
            subtitle="O histórico acompanha suas simulações."
          />
          <div className="activity-list">
            {state.audit.slice(0, 3).map((a) => (
              <div key={a.id} className="activity">
                <span>
                  <Check size={14} />
                </span>
                <p>{a.text}</p>
                <small>
                  {new Date(a.created).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                  })}
                </small>
              </div>
            ))}
          </div>
        </section>
        <button className="feedback-card" onClick={actions.feedback}>
          <MessageSquare size={24} strokeWidth={1.5} />
          <div>
            <h3>Esse jeito de trabalhar faz sentido?</h3>
            <p>
              Conte o que ajuda, o que falta e o que pode ficar mais simples.
            </p>
            <span>
              Deixar um feedback <ArrowUpRight size={16} />
            </span>
          </div>
        </button>
      </div>
    </>
  );
}
function EmployeeTable({
  employees,
  state,
  actions,
  compact = false,
}: {
  employees: Employee[];
  state: DemoState;
  actions: Actions;
  compact?: boolean;
}) {
  if (!employees.length)
    return (
      <Empty
        title="Nenhuma pessoa encontrada"
        text="Tente outro nome, matrícula ou setor."
      />
    );
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Funcionário</th>
            <th>Cargo / setor</th>
            {!compact && <th>Jornada</th>}
            <th>Documentos</th>
            <th>Status</th>
            <th>
              <span className="sr-only">Ações</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {employees.map((e) => {
            const count = state.documents.filter(
              (d) => d.employeeId === e.id && !d.signed,
            ).length;
            return (
              <tr key={e.id}>
                <td>
                  <button
                    className="person-cell"
                    onClick={() => actions.navigate("employees", e.id)}
                  >
                    <Avatar employee={e} />
                    <span>
                      <strong>{e.name}</strong>
                      <small>{e.code}</small>
                    </span>
                  </button>
                </td>
                <td>
                  <span className="cell-main">{e.role}</span>
                  <small>{e.department}</small>
                </td>
                {!compact && (
                  <td>
                    <span className="cell-main">8h diárias</span>
                    <small>
                      {e.recordBreaks === false
                        ? "2 batidas · pausa prevista"
                        : "4 batidas · com intervalo"}
                    </small>
                  </td>
                )}
                <td>
                  {count ? (
                    <Badge tone="amber">
                      {count} pendente{count > 1 ? "s" : ""}
                    </Badge>
                  ) : (
                    <Badge tone="gray">Em dia</Badge>
                  )}
                </td>
                <td>
                  <Badge tone={e.status === "Ativo" ? "green" : "gray"}>
                    {e.status}
                  </Badge>
                </td>
                <td>
                  <button
                    className="icon-button"
                    onClick={() => actions.navigate("employees", e.id)}
                    aria-label={`Abrir pasta de ${e.name}`}
                  >
                    <ArrowUpRight size={18} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
function EmployeeForm({
  employee,
  state,
  save,
  close,
}: {
  employee?: Employee;
  state: DemoState;
  save: (employee: Employee) => void;
  close: () => void;
}) {
  const [error, setError] = useState("");
  const nextCode = `FL-${String(Math.max(0, ...state.employees.map((e) => Number(e.code.replace(/\D/g, "")) || 0)) + 1).padStart(3, "0")}`;
  return (
    <Modal
      title={
        employee ? "Editar cadastro fictício" : "Uma nova pessoa na equipe"
      }
      description="Use apenas dados fictícios para experimentar a pasta digital."
      onClose={close}
    >
      <form
        onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const name = String(data.get("name")).trim();
          const code = String(data.get("code")).trim();
          const role = String(data.get("role")).trim();
          if (!name || !code || !role)
            return setError(
              "Preencha nome, matrícula e cargo sem usar apenas espaços.",
            );
          if (
            state.employees.some(
              (e) =>
                e.code.toUpperCase() === code.toUpperCase() &&
                e.id !== employee?.id,
            )
          )
            return setError(
              "Esta matrícula já está em uso. Escolha outra para manter as pessoas separadas.",
            );
          save({
            id: employee?.id || id(),
            name,
            code,
            role,
            department: String(data.get("department")),
            admission: String(data.get("admission")),
            status: String(data.get("status") || "Ativo") as Employee["status"],
            color: employee?.color ?? state.employees.length % 5,
            recordBreaks: data.get("recordBreaks") === "true",
            breakMinutes: Number(
              data.get("breakMinutes") || state.settings.breakMinutes,
            ),
          });
        }}
      >
        <label>
          Nome fictício
          <input
            name="name"
            required
            maxLength={80}
            defaultValue={employee?.name}
            placeholder="Ex.: Beatriz Souza"
            autoComplete="off"
          />
        </label>
        <div className="form-grid">
          <label>
            Matrícula
            <input
              name="code"
              required
              maxLength={20}
              defaultValue={employee?.code || nextCode}
            />
          </label>
          <label>
            Data de admissão
            <input
              type="date"
              name="admission"
              required
              defaultValue={employee?.admission || DEMO_DATE}
            />
          </label>
        </div>
        <label>
          Cargo
          <input
            name="role"
            required
            maxLength={70}
            defaultValue={employee?.role}
            placeholder="Ex.: Auxiliar de campo"
          />
        </label>
        <div className="form-grid">
          <label>
            Setor
            <select
              name="department"
              defaultValue={employee?.department || "Campo"}
            >
              <option>Campo</option>
              <option>Administrativo</option>
              <option>Logística</option>
            </select>
          </label>
          <label>
            Status
            <select
              name="status"
              defaultValue={employee?.status || "Ativo"}
              disabled={state.closed}
            >
              <option>Ativo</option>
              <option>Inativo</option>
            </select>
            {state.closed && (
              <input
                type="hidden"
                name="status"
                value={employee?.status || "Ativo"}
              />
            )}
          </label>
        </div>
        <label>
          Registro de intervalo
          <select
            name="recordBreaks"
            defaultValue={String(
              employee?.recordBreaks ?? state.settings.recordBreaks,
            )}
            disabled={
              !!employee &&
              state.punches.some((p) => p.employeeId === employee.id)
            }
          >
            <option value="true">Com intervalo · 4 batidas</option>
            <option value="false">Sem batida de intervalo · 2 batidas</option>
          </select>
        </label>
        {!!employee &&
          state.punches.some((p) => p.employeeId === employee.id) && (
            <>
              <input
                type="hidden"
                name="recordBreaks"
                value={String(employee.recordBreaks !== false)}
              />
              <p className="field-note">
                Esta jornada já tem registros. Na demo, crie outra pessoa para
                experimentar um modo diferente sem reescrever o histórico.
              </p>
            </>
          )}
        <input
          type="hidden"
          name="breakMinutes"
          value={employee?.breakMinutes ?? state.settings.breakMinutes}
        />
        <p className="field-note">
          Carga de exemplo: 8h. Sem batida de intervalo, a pausa prevista
          configurada é descontada na simulação.{" "}
          {state.closed &&
            "O período está fechado; o novo cadastro não altera marcações existentes."}
        </p>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="modal-actions">
          <button type="button" className="button" onClick={close}>
            Cancelar
          </button>
          <button className="button primary">
            {employee ? "Salvar alterações" : "Criar pasta digital"}
            <ArrowRight size={17} />
          </button>
        </div>
      </form>
    </Modal>
  );
}
function DocumentDialog({
  doc,
  state,
  close,
  sign,
}: {
  doc: Document;
  state: DemoState;
  close: () => void;
  sign: (doc: Document) => void;
}) {
  const [accepted, setAccepted] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const employee =
    doc.snapshot || state.employees.find((e) => e.id === doc.employeeId)!;
  const template = templates.find((t) => t.name === doc.template)!;
  return (
    <Modal
      title={
        doc.signed
          ? "Documento da pasta digital"
          : "Conferir e simular assinatura"
      }
      description="Prévia ilustrativa do que o funcionário verá no celular."
      onClose={close}
      wide
    >
      <div className="document-paper">
        <div className="document-brand">
          <Sprout size={25} />
          <span>{doc.snapshot?.unit || state.settings.unit}</span>
          <span className="subtle-tag">SEM VALIDADE LEGAL</span>
        </div>
        <span className="eyebrow">DOCUMENTO DE DEMONSTRAÇÃO</span>
        <h3>{doc.template}</h3>
        <p>
          <strong>Funcionário:</strong> {employee.name}
          <br />
          <strong>Matrícula:</strong> {employee.code}
          <br />
          <strong>Cargo:</strong> {employee.role}
        </p>
        <p>{template.content}</p>
        <p>
          Este texto é fictício e foi criado para avaliar a experiência. Não
          constitui contrato, recibo ou aceite real. Nenhum dado é enviado para
          assinatura externa.
        </p>
        <div className="signature-area">
          {doc.signed ? (
            <>
              <ShieldCheck size={24} />
              <strong>Assinatura simulada registrada</strong>
              <span>
                {employee.name} ·{" "}
                {doc.signedAt
                  ? new Date(doc.signedAt).toLocaleDateString("pt-BR")
                  : ""}
              </span>
            </>
          ) : (
            <>
              <span>Espaço reservado à assinatura</span>
              <small>
                A captura real de assinatura será definida após a validação do
                fluxo.
              </small>
            </>
          )}
        </div>
        <small>
          Referência da demo: {doc.id} · Emitido em{" "}
          {doc.created.split("-").reverse().join("/")}
        </small>
      </div>
      {!doc.signed && (
        <div className="consent">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />{" "}
            Estou simulando o acesso de {employee.name}, matrícula{" "}
            {employee.code}.
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            />{" "}
            Li o exemplo completo e quero simular sua assinatura.
          </label>
        </div>
      )}
      <div className="modal-actions">
        <button className="button" onClick={close}>
          Fechar
        </button>
        {!doc.signed && (
          <button
            className="button primary"
            disabled={!accepted || !confirmed}
            onClick={() => sign(doc)}
          >
            <Check size={17} /> Simular assinatura
          </button>
        )}
      </div>
    </Modal>
  );
}
