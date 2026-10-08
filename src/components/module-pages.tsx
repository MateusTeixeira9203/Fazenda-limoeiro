"use client";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  Download,
  FileText,
  LockKeyhole,
  MessageSquare,
  Pencil,
  Plus,
  QrCode,
  RotateCcw,
  Search,
  Settings2,
  ShieldCheck,
  Shirt,
  Users,
} from "lucide-react";
import {
  Avatar,
  Badge,
  Empty,
  Hint,
  Intro,
  SectionTitle,
  TextLink,
} from "./ui";
import {
  DEMO_DATE_LABEL,
  closingState,
  eventNames,
  hours,
  summary,
  templates,
  type DemoState,
  type Employee,
} from "@/lib/demo";
import type { Actions } from "./demo-app";

type Props = { state: DemoState; actions: Actions };
export function EmployeeProfile({
  employee,
  state,
  actions,
}: Props & { employee: Employee }) {
  const [tab, setTab] = useState("Resumo");
  const docs = state.documents.filter((d) => d.employeeId === employee.id);
  const data = summary(state.punches, employee.id);
  const pending = docs.filter((d) => !d.signed).length;
  return (
    <>
      <button
        className="back-link"
        onClick={() => actions.navigate("employees")}
      >
        <ArrowLeft size={17} /> Todos os funcionários
      </button>
      <div className="profile-heading">
        <Avatar employee={employee} large />
        <div>
          <div className="eyebrow">PASTA DIGITAL · {employee.code}</div>
          <h1>{employee.name}</h1>
          <p>
            {employee.role} <span>·</span> {employee.department}
          </p>
        </div>
        <div className="profile-actions">
          <Badge tone={employee.status === "Ativo" ? "green" : "gray"}>
            {employee.status}
          </Badge>
          <button
            className="button"
            onClick={() => actions.editEmployee(employee)}
          >
            <Pencil size={16} /> Editar cadastro
          </button>
        </div>
      </div>
      <div className="tabs" role="group" aria-label="Seções da pasta digital">
        {["Resumo", "Ponto e horas", "Documentos", "Entregas", "Histórico"].map(
          (t) => (
            <button
              key={t}
              className={tab === t ? "selected" : ""}
              onClick={() => setTab(t)}
            >
              {t}
              {t === "Documentos" && <span>{docs.length}</span>}
            </button>
          ),
        )}
      </div>
      {tab === "Resumo" && (
        <>
          <Hint>
            Esta é a pasta de {employee.name.split(" ")[0]}. Experimente as abas
            para acompanhar a jornada, emitir documentos e consultar o
            histórico.
          </Hint>
          <div className="profile-grid">
            <section className="panel padded">
              <SectionTitle title="Dados do vínculo" />
              <dl className="details-list">
                <div>
                  <dt>Matrícula</dt>
                  <dd>{employee.code}</dd>
                </div>
                <div>
                  <dt>Data de admissão</dt>
                  <dd>{employee.admission.split("-").reverse().join("/")}</dd>
                </div>
                <div>
                  <dt>Cargo</dt>
                  <dd>{employee.role}</dd>
                </div>
                <div>
                  <dt>Setor</dt>
                  <dd>{employee.department}</dd>
                </div>
                <div>
                  <dt>Unidade</dt>
                  <dd>{state.settings.unit}</dd>
                </div>
                <div>
                  <dt>Jornada de exemplo</dt>
                  <dd>
                    {employee.recordBreaks === false
                      ? `8h · 2 batidas · pausa prevista ${employee.breakMinutes ?? 60}min`
                      : "8h · 4 batidas · 07h–12h / 14h–17h"}
                  </dd>
                </div>
              </dl>
            </section>
            <section className="panel padded">
              <SectionTitle title="O que merece atenção" />
              <div className="profile-summary-row">
                <span className="task-icon amber">
                  <FileText size={20} />
                </span>
                <div>
                  <strong>{pending} documento(s) pendente(s)</strong>
                  <p>Acompanhe a leitura e a assinatura.</p>
                </div>
                <button
                  className="icon-button"
                  onClick={() => setTab("Documentos")}
                  aria-label="Ver documentos da pessoa"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              <div className="profile-summary-row">
                <span className="task-icon green">
                  <Clock3 size={20} />
                </span>
                <div>
                  <strong>
                    {data.complete
                      ? `${hours(data.worked)} trabalhadas no exemplo`
                      : "Ponto para conferir"}
                  </strong>
                  <p>
                    {data.complete
                      ? `${hours(data.extra)} excedentes · ${hours(data.missing)} faltantes`
                      : "Complete os horários no simulador."}
                  </p>
                </div>
                <button
                  className="icon-button"
                  onClick={() => setTab("Ponto e horas")}
                  aria-label="Ver ponto da pessoa"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              <button
                className="button primary full-width"
                onClick={() => actions.newDocument(employee.id)}
              >
                <Plus size={17} /> Novo documento para esta pessoa
              </button>
            </section>
          </div>
        </>
      )}
      {tab === "Ponto e horas" && (
        <>
          <Hint>
            A apuração depende de marcações completas. Sem autorização, as horas
            excedentes continuam visíveis para conferência.
          </Hint>
          <section className="panel">
            <SectionTitle
              title="Jornada do dia de exemplo"
              subtitle={DEMO_DATE_LABEL}
              action={
                <button
                  className="button"
                  disabled={state.closed || employee.status === "Inativo"}
                  onClick={() => actions.simulate(employee.id)}
                >
                  <Clock3 size={17} /> Ver QR do ponto
                </button>
              }
            />
            <div
              className={`punch-timeline ${employee.recordBreaks === false ? "two-events" : ""}`}
            >
              {(employee.recordBreaks === false ? [0, 3] : [0, 1, 2, 3]).map(
                (i) => (
                  <div key={i}>
                    <span
                      className={`timeline-dot ${data.rows.find((p) => p.type === i) ? "done" : ""}`}
                    >
                      {data.rows.find((p) => p.type === i) ? (
                        <Check size={15} />
                      ) : (
                        <Clock3 size={15} />
                      )}
                    </span>
                    <small>{eventNames[i]}</small>
                    <strong>
                      {data.rows.find((p) => p.type === i)?.time || "—"}
                    </strong>
                  </div>
                ),
              )}
            </div>
            <div className="time-summary">
              <div>
                <small>Previsto</small>
                <strong>8h</strong>
              </div>
              <div>
                <small>Trabalhado</small>
                <strong>
                  {data.complete ? hours(data.worked) : "Pendente"}
                </strong>
              </div>
              <div>
                <small>Excedente</small>
                <strong>{data.complete ? hours(data.extra) : "—"}</strong>
              </div>
              <div>
                <small>Faltante</small>
                <strong>{data.complete ? hours(data.missing) : "—"}</strong>
              </div>
              <div>
                <small>Classificação</small>
                <Badge
                  tone={
                    !data.complete ||
                    (data.extra > 0 && !state.authorized.includes(employee.id))
                      ? "amber"
                      : "green"
                  }
                >
                  {!data.complete
                    ? "Incompleto"
                    : data.extra
                      ? state.authorized.includes(employee.id)
                        ? "Autorizado"
                        : "Conferir excedente"
                      : "Regular"}
                </Badge>
              </div>
            </div>
          </section>
        </>
      )}
      {tab === "Documentos" && (
        <>
          <Hint>
            Os documentos são vinculados à matrícula. Assinar um exemplo
            atualiza apenas a pasta desta pessoa.
          </Hint>
          <section className="panel">
            <SectionTitle
              title="Documentos desta pessoa"
              subtitle={`${docs.length} documento(s) na demonstração`}
              action={
                <button
                  className="button primary"
                  onClick={() => actions.newDocument(employee.id)}
                >
                  <Plus size={17} /> Novo documento
                </button>
              }
            />
            {docs.length ? (
              <div className="document-rows">
                {docs.map((d) => (
                  <button key={d.id} onClick={() => actions.openDocument(d)}>
                    <span
                      className={`file-icon ${d.signed ? "green" : "amber"}`}
                    >
                      <FileText size={23} />
                    </span>
                    <span>
                      <strong>{d.template}</strong>
                      <small>
                        Emitido em {d.created.split("-").reverse().join("/")}
                      </small>
                    </span>
                    <Badge tone={d.signed ? "green" : "amber"}>
                      {d.signed
                        ? "Assinatura simulada"
                        : "Aguardando assinatura"}
                    </Badge>
                    <ArrowUpRight size={19} />
                  </button>
                ))}
              </div>
            ) : (
              <Empty
                title="Uma pasta pronta para começar"
                text="Emita um primeiro documento para experimentar o fluxo de assinatura."
              />
            )}
          </section>
        </>
      )}
      {tab === "Entregas" && (
        <>
          <Hint>
            Experimente um termo de uniforme. O controle detalhado de
            quantidades, devoluções e EPI será definido com a equipe após o
            feedback.
          </Hint>
          <section className="panel padded">
            <SectionTitle
              title="Uniformes e materiais"
              action={
                <button
                  className="button primary"
                  onClick={() =>
                    actions.newDocument(employee.id, "Entrega de uniforme")
                  }
                >
                  <Plus size={17} /> Simular entrega
                </button>
              }
            />
            {docs.filter((d) => d.template === "Entrega de uniforme").length ? (
              docs
                .filter((d) => d.template === "Entrega de uniforme")
                .map((d) => (
                  <div key={d.id} className="delivery-row">
                    <span className="task-icon green">
                      <Shirt size={23} />
                    </span>
                    <div>
                      <h3>Kit de uniforme · exemplo</h3>
                      <p>2 camisetas e 1 calça · referência no termo</p>
                      <Badge tone={d.signed ? "green" : "amber"}>
                        {d.signed
                          ? "Recebimento simulado"
                          : "Aguardando confirmação"}
                      </Badge>
                    </div>
                    <button
                      className="button"
                      onClick={() => actions.openDocument(d)}
                    >
                      Ver termo <ArrowUpRight size={16} />
                    </button>
                  </div>
                ))
            ) : (
              <Empty
                title="Nenhuma entrega simulada"
                text="Crie um termo para conhecer a confirmação de recebimento."
              />
            )}
          </section>
        </>
      )}
      {tab === "Histórico" && (
        <>
          <Hint>
            Cada ação tem seu lugar na história. Nesta demo, os eventos são
            locais e servem para avaliar o que precisa ser acompanhado.
          </Hint>
          <section className="panel">
            <SectionTitle title="Histórico desta pessoa" />
            <div className="history-list">
              {state.audit.filter((a) => a.employeeId === employee.id)
                .length ? (
                state.audit
                  .filter((a) => a.employeeId === employee.id)
                  .map((a) => (
                    <div key={a.id}>
                      <span className="history-dot">
                        <Check size={15} />
                      </span>
                      <div>
                        <p>{a.text}</p>
                        <small>
                          {new Date(a.created).toLocaleString("pt-BR")}
                        </small>
                      </div>
                    </div>
                  ))
              ) : (
                <Empty
                  title="A história começa aqui"
                  text="Ao emitir um documento ou simular o ponto, a ação aparecerá nesta linha do tempo."
                />
              )}
            </div>
          </section>
        </>
      )}
    </>
  );
}
export function TimePage({ state, actions }: Props) {
  const [filter, setFilter] = useState("Todos");
  const incomplete = state.employees.filter(
    (e) => e.status === "Ativo" && !summary(state.punches, e.id).complete,
  ).length;
  return (
    <>
      <Intro
        eyebrow="PRESENÇA QUE FAZ A DIFERENÇA"
        title="Ponto e jornadas"
        description="Acompanhe os horários e entenda o que precisa ser conferido."
        action={
          <button
            className="button primary"
            disabled={
              state.closed || !state.employees.some((e) => e.status === "Ativo")
            }
            onClick={() => actions.simulate()}
          >
            <QrCode size={18} /> Exibir QR do ponto
          </button>
        }
      />
      <Hint>
        O funcionário escaneia o QR, se identifica e confirma a batida. O
        relógio de demonstração avança automaticamente. O intervalo pode ser
        registrado ou não, conforme a jornada.
      </Hint>
      {state.closed && (
        <div className="closed-notice">
          <LockKeyhole size={18} /> Outubro está fechado na simulação.
          <button onClick={() => actions.navigate("closing")}>
            Ver fechamento <ArrowRight size={15} />
          </button>
        </div>
      )}
      <div className="time-overview">
        <div className="calendar-tile">
          <CalendarDays size={21} />
          <div>
            <span>Dia de exemplo</span>
            <strong>08 out. 2026</strong>
          </div>
        </div>
        <div>
          <span className="mini-dot green" />
          <strong>{state.punches.length}</strong> marcações registradas
        </div>
        <div>
          <span className="mini-dot amber" />
          <strong>{incomplete}</strong> jornada(s) incompleta(s)
        </div>
        <div className="schedule-tag">
          Jornada padrão <b>8h / dia</b>
        </div>
      </div>
      <section className="panel">
        <div className="table-toolbar">
          <h2>Marcações da equipe</h2>
          <div
            className="segmented"
            role="group"
            aria-label="Filtrar marcações"
          >
            {["Todos", "Pendências"].map((f) => (
              <button
                key={f}
                className={filter === f ? "selected" : ""}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="table-scroll">
          <table className="punch-table">
            <thead>
              <tr>
                <th>Funcionário</th>
                {eventNames.map((n) => (
                  <th key={n}>{n}</th>
                ))}
                <th>Trabalhado</th>
                <th>Situação</th>
                <th>
                  <span className="sr-only">Simular</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {state.employees
                .filter(
                  (e) =>
                    filter === "Todos" ||
                    !summary(state.punches, e.id).complete ||
                    (summary(state.punches, e.id).extra > 0 &&
                      !state.authorized.includes(e.id)),
                )
                .map((e) => {
                  const t = summary(state.punches, e.id);
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
                      {eventNames.map((_, i) => (
                        <td key={i}>
                          <span
                            className={`punch-value ${t.rows.find((p) => p.type === i) ? "" : "missing"}`}
                          >
                            {t.rows.find((p) => p.type === i)?.time ||
                              ((i === 1 || i === 2) &&
                              (e.recordBreaks === false ||
                                t.rows[0]?.recordBreaks === false)
                                ? "Dispensado"
                                : "—")}
                          </span>
                        </td>
                      ))}
                      <td>
                        <strong className="worked-time">
                          {t.complete ? hours(t.worked) : "—"}
                        </strong>
                      </td>
                      <td>
                        <Badge
                          tone={
                            !t.complete ||
                            (t.extra > 0 && !state.authorized.includes(e.id))
                              ? "amber"
                              : "green"
                          }
                        >
                          {!t.complete
                            ? "Incompleto"
                            : t.extra
                              ? state.authorized.includes(e.id)
                                ? "Extra autorizada"
                                : `+${hours(t.extra)} a conferir`
                              : "Regular"}
                        </Badge>
                      </td>
                      <td>
                        <button
                          className="icon-button"
                          aria-label={`Abrir pasta de ${e.name}`}
                          disabled={state.closed || e.status === "Inativo"}
                          onClick={() => actions.navigate("employees", e.id)}
                        >
                          <ArrowUpRight size={17} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        {filter === "Pendências" &&
          !state.employees.some(
            (e) =>
              !summary(state.punches, e.id).complete ||
              (summary(state.punches, e.id).extra > 0 &&
                !state.authorized.includes(e.id)),
          ) && (
            <Empty
              title="Tudo conferido por aqui"
              text="As jornadas desta demonstração estão completas e classificadas."
            />
          )}
      </section>
      <div className="explanation-grid">
        <div>
          <span className="task-icon green">
            <Clock3 size={21} />
          </span>
          <h3>O intervalo é configurável</h3>
          <p>
            Com intervalo, são quatro batidas. Sem batida de intervalo, apenas
            entrada e saída. O padrão da empresa pode variar por pessoa.
          </p>
        </div>
        <div>
          <span className="task-icon amber">
            <ShieldCheck size={21} />
          </span>
          <h3>Horas que não desaparecem</h3>
          <p>
            Um excedente sem autorização continua registrado. Sua classificação
            é feita na conferência do fechamento.
          </p>
        </div>
        <div>
          <span className="task-icon blue">
            <CircleHelp size={21} />
          </span>
          <h3>E o QR na fazenda?</h3>
          <p>
            O QR abre uma tela simples, sem menus administrativos. Confirmação
            rápida e horário automático; aqui, o relógio é fictício.
          </p>
        </div>
      </div>
    </>
  );
}
export function DocumentsPage({ state, actions }: Props) {
  const [tab, setTab] = useState("Documentos emitidos");
  const [filter, setFilter] = useState("Todos");
  const [query, setQuery] = useState("");
  const docs = state.documents.filter(
    (d) =>
      (filter === "Todos" || (filter === "Pendentes" ? !d.signed : d.signed)) &&
      `${d.template} ${state.employees.find((e) => e.id === d.employeeId)?.name}`
        .toLocaleLowerCase("pt-BR")
        .includes(query.toLocaleLowerCase("pt-BR")),
  );
  return (
    <>
      <Intro
        eyebrow="CADA DOCUMENTO NO SEU LUGAR"
        title="Documentos"
        description="Prepare, confira e acompanhe. Do modelo à pasta do funcionário."
        action={
          <button
            className="button primary"
            onClick={() => actions.newDocument()}
          >
            <Plus size={18} /> Novo documento
          </button>
        }
      />
      <Hint>
        Emita um exemplo e simule a leitura e a assinatura. O status aparece na
        pasta da pessoa; nenhum contrato real é criado.
      </Hint>
      <div className="tabs" role="group" aria-label="Áreas de documentos">
        {["Documentos emitidos", "Biblioteca de modelos"].map((t) => (
          <button
            key={t}
            className={tab === t ? "selected" : ""}
            onClick={() => setTab(t)}
          >
            {t}
            <span>
              {t === "Documentos emitidos"
                ? state.documents.length
                : templates.length}
            </span>
          </button>
        ))}
      </div>
      {tab === "Biblioteca de modelos" ? (
        <div className="template-grid">
          {templates.map((t, i) => (
            <article key={t.name} className="template-card">
              <div className="template-top">
                <span className={`file-icon ${i % 2 ? "blue" : "green"}`}>
                  <FileText size={25} />
                </span>
                <span className="subtle-tag">{t.category}</span>
              </div>
              <h2>{t.name}</h2>
              <p>{t.description}</p>
              <div className="template-bottom">
                <span>Modelo ilustrativo · v1</span>
                <button onClick={() => actions.newDocument(undefined, t.name)}>
                  Usar modelo <ArrowRight size={16} />
                </button>
              </div>
            </article>
          ))}
          <div className="template-suggestion">
            <MessageSquare size={25} />
            <h3>Falta algum documento?</h3>
            <p>
              Conte quais termos e recibos a fazenda usa. Sua sugestão ajuda a
              definir os próximos modelos.
            </p>
            <button className="button" onClick={actions.feedback}>
              Sugerir um modelo <Plus size={16} />
            </button>
          </div>
        </div>
      ) : (
        <section className="panel">
          <div className="table-toolbar">
            <div
              className="segmented"
              role="group"
              aria-label="Filtrar documentos"
            >
              {["Todos", "Pendentes", "Assinados"].map((f) => (
                <button
                  key={f}
                  className={f === filter ? "selected" : ""}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
            <label className="search-input">
              <Search size={17} />
              <input
                placeholder="Buscar documento ou pessoa"
                aria-label="Buscar documento ou pessoa"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
          </div>
          {docs.length ? (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Documento</th>
                    <th>Funcionário</th>
                    <th>Emissão</th>
                    <th>Status</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {docs.map((d) => {
                    const e = state.employees.find(
                      (e) => e.id === d.employeeId,
                    )!;
                    return (
                      <tr key={d.id}>
                        <td>
                          <button
                            className="doc-cell"
                            onClick={() => actions.openDocument(d)}
                          >
                            <span
                              className={`file-icon ${d.signed ? "green" : "amber"}`}
                            >
                              <FileText size={21} />
                            </span>
                            <span>
                              <strong>{d.template}</strong>
                              <small>Documento de demonstração</small>
                            </span>
                          </button>
                        </td>
                        <td>
                          <button
                            className="person-cell text-only"
                            onClick={() => actions.navigate("employees", e.id)}
                          >
                            <span>
                              <strong>{e.name}</strong>
                              <small>{e.code}</small>
                            </span>
                          </button>
                        </td>
                        <td>{d.created.split("-").reverse().join("/")}</td>
                        <td>
                          <Badge tone={d.signed ? "green" : "amber"}>
                            {d.signed
                              ? "Assinatura simulada"
                              : "Aguardando assinatura"}
                          </Badge>
                        </td>
                        <td>
                          <button
                            className="text-link"
                            onClick={() => actions.openDocument(d)}
                          >
                            {d.signed ? "Ver documento" : "Conferir"}
                            <ArrowUpRight size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty
              title="Nenhum documento nesta seleção"
              text="Altere o filtro ou emita um novo documento para experimentar."
            />
          )}
        </section>
      )}
    </>
  );
}
export function ClosingPage({ state: liveState, actions }: Props) {
  const state = closingState(liveState);
  const people = state.employees.filter((e) => e.status === "Ativo");
  const rows = people.map((e) => ({
    e,
    t: summary(state.punches, e.id),
    authorized: state.authorized.includes(e.id),
  }));
  const incomplete = rows.filter((r) => !r.t.complete).length;
  const unauthorized = rows.filter(
    (r) => r.t.complete && r.t.extra > 0 && !r.authorized,
  ).length;
  const worked = rows.reduce((n, r) => n + r.t.worked, 0);
  const extra = rows.reduce((n, r) => n + r.t.extra, 0);
  const allocated = rows.reduce(
    (n, r) => n + (r.authorized ? r.t.extra : 0),
    0,
  );
  return (
    <>
      <Intro
        eyebrow="CLAREZA PARA FECHAR O MÊS"
        title="Fechamentos"
        description="Confira a jornada, resolva pendências e simule o fechamento."
        action={
          <button className="button" onClick={actions.exportClosing}>
            <Download size={17} /> Exportar relatório
          </button>
        }
      />
      <Hint>
        Prévia de outubro com uma amostra de um dia (08/10). Complete os
        horários e classifique o excedente para experimentar o fechamento. Não
        há cálculo de salário.
      </Hint>
      <div className="closing-banner">
        <span className="month-icon">
          <CalendarDays size={27} />
        </span>
        <div>
          <span className="eyebrow">PERÍODO EM CONFERÊNCIA</span>
          <h2>Outubro de 2026</h2>
          <p>
            {people.length} funcionários ativos · Amostra demonstrativa de 08/10
          </p>
        </div>
        <Badge tone={state.closed ? "green" : "amber"}>
          {state.closed
            ? `Fechado · versão ${state.closingVersion}`
            : "Em preparação"}
        </Badge>
      </div>
      <div className="closing-stats">
        <div>
          <small>Horas apuradas</small>
          <strong>{hours(worked)}</strong>
          <span>Somente jornadas completas</span>
        </div>
        <div>
          <small>Horas excedentes</small>
          <strong>{hours(extra)}</strong>
          <span>Preservadas, com ou sem autorização</span>
        </div>
        <div>
          <small>
            {state.settings.destination === "Banco de horas"
              ? "Destinadas ao banco"
              : "Para conferir pagamento"}
          </small>
          <strong>{hours(allocated)}</strong>
          <span>Excedentes autorizados nesta demo</span>
        </div>
        <div>
          <small>Pendências</small>
          <strong className={incomplete + unauthorized ? "amber-text" : ""}>
            {incomplete + unauthorized}
          </strong>
          <span>
            {incomplete} jornada(s) · {unauthorized} autorização(ões)
          </span>
        </div>
      </div>
      <section className="panel">
        <SectionTitle
          title="Conferência por funcionário"
          subtitle="O excedente só muda de classificação após sua confirmação."
        />
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Funcionário</th>
                <th>Previsto</th>
                <th>Trabalhado</th>
                <th>Excedente</th>
                <th>Faltante</th>
                <th>Conferência</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ e, t, authorized }) => (
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
                  <td>8h</td>
                  <td>
                    <strong>{t.complete ? hours(t.worked) : "—"}</strong>
                  </td>
                  <td>{t.complete ? hours(t.extra) : "—"}</td>
                  <td>{t.complete ? hours(t.missing) : "—"}</td>
                  <td>
                    {!t.complete ? (
                      <button
                        className="text-link amber-text"
                        onClick={() => actions.simulate(e.id)}
                        disabled={state.closed}
                      >
                        Abrir QR do ponto <ArrowRight size={15} />
                      </button>
                    ) : t.extra > 0 && !authorized ? (
                      <button
                        className="button small"
                        disabled={state.closed}
                        onClick={() => actions.authorize(e.id)}
                      >
                        Autorizar {hours(t.extra)} <Check size={15} />
                      </button>
                    ) : (
                      <Badge>{t.extra ? "Autorizado" : "Conferido"}</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="closing-actions">
          <div>
            <ShieldCheck size={22} />
            <p>
              {state.closed
                ? "Fechamento simulado. Reabra com um motivo para alterar as marcações."
                : incomplete + unauthorized
                  ? "Resolva as pendências acima para concluir esta simulação."
                  : "Tudo conferido. Você já pode simular o fechamento deste período."}
            </p>
          </div>
          {state.closed ? (
            <button className="button" onClick={actions.reopenMonth}>
              <RotateCcw size={17} /> Reabrir período
            </button>
          ) : (
            <button
              className="button primary"
              disabled={incomplete + unauthorized > 0 || !people.length}
              onClick={actions.closeMonth}
            >
              <LockKeyhole size={17} /> Simular fechamento
            </button>
          )}
        </div>
      </section>
      <section className="panel closing-history">
        <SectionTitle title="Histórico do período" />
        {state.audit.filter((a) => a.text.startsWith("Fechamento")).length ? (
          state.audit
            .filter((a) => a.text.startsWith("Fechamento"))
            .map((a) => (
              <div className="activity" key={a.id}>
                <span>
                  <Check size={14} />
                </span>
                <p>{a.text}</p>
                <small>{new Date(a.created).toLocaleDateString("pt-BR")}</small>
              </div>
            ))
        ) : (
          <p className="muted padded-note">
            O fechamento e as reaberturas aparecerão aqui, com os motivos
            registrados.
          </p>
        )}
      </section>
    </>
  );
}
export function SettingsPage({ state, actions }: Props) {
  const [unit, setUnit] = useState(state.settings.unit);
  const [manager, setManager] = useState(state.settings.manager);
  const [destination, setDestination] = useState(state.settings.destination);
  const [recordBreaks, setRecordBreaks] = useState(state.settings.recordBreaks);
  const [breakMinutes, setBreakMinutes] = useState(state.settings.breakMinutes);
  const [error, setError] = useState("");
  return (
    <>
      <Intro
        eyebrow="DO JEITO DA FAZENDA"
        title="Configurações"
        description="Conheça as preferências que vão orientar a rotina da equipe."
      />
      <Hint>
        Estas preferências afetam somente a demonstração neste navegador. As
        regras reais de jornada e permissões serão definidas com o
        administrativo.
      </Hint>
      <div className="settings-grid">
        <form
          className="panel padded"
          onSubmit={(e) => {
            e.preventDefault();
            if (!unit.trim() || !manager.trim())
              return setError("Preencha os campos sem usar apenas espaços.");
            setError("");
            actions.saveSettings({
              unit: unit.trim(),
              manager: manager.trim(),
              destination,
              recordBreaks,
              breakMinutes,
            });
          }}
        >
          <SectionTitle title="Unidade e apuração" />
          <label>
            Nome da unidade demonstrativa
            <input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              required
              maxLength={70}
            />
          </label>
          <label>
            Responsável pela conferência
            <input
              value={manager}
              onChange={(e) => setManager(e.target.value)}
              required
              maxLength={70}
            />
          </label>
          <label>
            Destino dos excedentes autorizados
            <select
              value={destination}
              onChange={(e) =>
                setDestination(
                  e.target.value as DemoState["settings"]["destination"],
                )
              }
              disabled={state.closed}
            >
              <option>Banco de horas</option>
              <option>Conferência para pagamento</option>
            </select>
          </label>
          <label>
            Registro de intervalo — padrão da empresa
            <select
              value={String(recordBreaks)}
              onChange={(e) => setRecordBreaks(e.target.value === "true")}
            >
              <option value="true">
                Com intervalo · entrada, intervalo, retorno e saída
              </option>
              <option value="false">
                Sem batida de intervalo · apenas entrada e saída
              </option>
            </select>
          </label>
          <label>
            Pausa prevista sem batida (minutos, apenas na demo)
            <input
              type="number"
              min={0}
              max={240}
              step={15}
              required
              value={breakMinutes}
              onChange={(e) => setBreakMinutes(Number(e.target.value))}
            />
          </label>
          <p className="field-note">
            O padrão vale para novos cadastros. Cada pessoa pode ter uma jornada
            diferente. Os horários já registrados são preservados. A pausa
            prevista é descontada somente nos exemplos sem batida de intervalo;
            a regra real será definida depois.
          </p>
          <p className="field-note">
            {state.closed
              ? "Reabra o período para alterar o destino das horas."
              : "A escolha classifica os exemplos; não gera pagamento ou saldo real."}
          </p>
          <div className="readonly-setting">
            <Clock3 size={19} />
            <div>
              <strong>Jornada usada nesta demo</strong>
              <p>
                8h diárias · {recordBreaks ? "4 batidas" : "2 batidas"} no
                padrão escolhido
              </p>
            </div>
            <span className="subtle-tag">EXEMPLO</span>
          </div>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <button className="button primary" type="submit">
            <Check size={17} /> Salvar preferências
          </button>
        </form>
        <div className="settings-side">
          <section className="panel padded">
            <SectionTitle
              title="Quem usará o sistema"
              subtitle="Papéis previstos para a versão operacional."
            />
            <div className="role-row">
              <span className="task-icon green">
                <Settings2 size={18} />
              </span>
              <div>
                <strong>Administrador / DP</strong>
                <p>Cadastros, documentos e conferência.</p>
              </div>
            </div>
            <div className="role-row">
              <span className="task-icon blue">
                <Users size={18} />
              </span>
              <div>
                <strong>Gestor</strong>
                <p>Equipe, pendências e autorizações.</p>
              </div>
            </div>
            <div className="role-row">
              <span className="task-icon amber">
                <ShieldCheck size={18} />
              </span>
              <div>
                <strong>Funcionário</strong>
                <p>Registro de ponto e documentos designados.</p>
              </div>
            </div>
            <p className="field-note">
              A demo é aberta para avaliação. Login e restrições reais de acesso
              ainda não estão implementados.
            </p>
          </section>
          <section className="reset-card">
            <RotateCcw size={22} />
            <h3>Um novo começo, quando quiser</h3>
            <p>
              Restaure os exemplos iniciais para apresentar a outra pessoa. Os
              feedbacks ficam guardados.
            </p>
            <button className="button" onClick={actions.reset}>
              Reiniciar demonstração
            </button>
          </section>
        </div>
      </div>
    </>
  );
}
