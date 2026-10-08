export const STORAGE_KEY = "limoeiro-demo-v1";
export const DEMO_DATE = "2026-10-08";
export const DEMO_DATE_LABEL = "08 de outubro de 2026";
export type Page =
  "overview" | "employees" | "time" | "documents" | "closing" | "settings";
export type Employee = {
  id: string;
  name: string;
  code: string;
  role: string;
  department: string;
  admission: string;
  status: "Ativo" | "Inativo";
  color: number;
  recordBreaks?: boolean;
  breakMinutes?: number;
};
export type Punch = {
  id: string;
  employeeId: string;
  date: string;
  type: number;
  time: string;
  recordBreaks?: boolean;
  breakMinutes?: number;
};
export type Document = {
  id: string;
  employeeId: string;
  template: string;
  created: string;
  signed: boolean;
  signedAt?: string;
  snapshot?: { name: string; code: string; role: string; unit: string };
};
export type Feedback = {
  id: string;
  page: string;
  kind: string;
  text: string;
  created: string;
};
export type Audit = {
  id: string;
  employeeId?: string;
  text: string;
  created: string;
};
export type ClosingSnapshot = {
  employees: Employee[];
  punches: Punch[];
  authorized: string[];
  settings: DemoState["settings"];
};
export type DemoState = {
  version: 1;
  employees: Employee[];
  punches: Punch[];
  documents: Document[];
  authorized: string[];
  feedbacks: Feedback[];
  audit: Audit[];
  closed: boolean;
  closingVersion: number;
  closingSnapshot?: ClosingSnapshot;
  settings: {
    unit: string;
    manager: string;
    destination: "Banco de horas" | "Conferência para pagamento";
    recordBreaks: boolean;
    breakMinutes: number;
  };
};
export function closingState(state: DemoState): DemoState {
  return state.closed && state.closingSnapshot
    ? { ...state, ...state.closingSnapshot }
    : state;
}
export const eventNames = [
  "Entrada",
  "Início do intervalo",
  "Fim do intervalo",
  "Saída",
];
export const templates = [
  {
    name: "Entrega de uniforme",
    category: "Entregas",
    description:
      "Registre o recebimento de uniformes e a ciência do funcionário.",
    content:
      "Este exemplo registra o recebimento de 2 camisetas e 1 calça para uso nas atividades da fazenda. O funcionário pode conferir os itens antes de confirmar o recebimento.",
  },
  {
    name: "Contrato de experiência",
    category: "Admissão",
    description: "Reúna os dados de admissão e acompanhe a assinatura.",
    content:
      "Este exemplo apresenta um contrato de experiência de 45 dias, com jornada ilustrativa de 8 horas diárias. Condições e prazos reais deverão ser definidos e validados antes do uso operacional.",
  },
  {
    name: "Regulamento interno",
    category: "Ciência",
    description: "Compartilhe orientações e registre a ciência de cada pessoa.",
    content:
      "Orientações ilustrativas: registrar entrada, intervalos e saída; comunicar inconsistências ao administrativo; cuidar dos materiais de trabalho e seguir as orientações de segurança da unidade.",
  },
  {
    name: "Termo de alojamento",
    category: "Termos",
    description:
      "Centralize os termos de uso e responsabilidade pelo alojamento.",
    content:
      "Este exemplo descreve cuidados com espaços compartilhados, conservação das instalações e comunicação de necessidades de manutenção. A confirmação representa apenas uma simulação de ciência.",
  },
];
export function id() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
    "",
  );
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("");
}
export function hours(minutes: number) {
  return `${Math.floor(Math.abs(minutes) / 60)}h${Math.abs(minutes) % 60 ? String(Math.abs(minutes) % 60).padStart(2, "0") : ""}`;
}
export function minute(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}
export function summary(
  punches: Punch[],
  employeeId: string,
  date = DEMO_DATE,
) {
  const rows = punches
    .filter((p) => p.employeeId === employeeId && p.date === date)
    .sort((a, b) => a.type - b.type);
  const recordBreaks = rows[0]?.recordBreaks !== false;
  const sequence = recordBreaks ? [0, 1, 2, 3] : [0, 3];
  const complete =
    rows.length === sequence.length &&
    rows.every((p, i) => p.type === sequence[i]) &&
    rows.every((p, i) => i === 0 || minute(p.time) > minute(rows[i - 1].time));
  const worked = complete
    ? recordBreaks
      ? minute(rows[1].time) -
        minute(rows[0].time) +
        minute(rows[3].time) -
        minute(rows[2].time)
      : Math.max(
          0,
          minute(rows[1].time) -
            minute(rows[0].time) -
            (rows[0].breakMinutes ?? 60),
        )
    : 0;
  return {
    rows,
    complete,
    worked,
    recordBreaks,
    sequence,
    normal: Math.min(worked, 480),
    extra: Math.max(0, worked - 480),
    missing: complete ? Math.max(0, 480 - worked) : 0,
  };
}
export function seedState(): DemoState {
  const employees: Employee[] = [
    {
      id: "e1",
      name: "Carlos Oliveira",
      code: "FL-001",
      role: "Operador de máquinas",
      department: "Campo",
      admission: "2026-03-02",
      status: "Ativo",
      color: 0,
    },
    {
      id: "e2",
      name: "Ana Santos",
      code: "FL-002",
      role: "Auxiliar administrativa",
      department: "Administrativo",
      admission: "2026-02-10",
      status: "Ativo",
      color: 1,
    },
    {
      id: "e3",
      name: "João Ferreira",
      code: "FL-003",
      role: "Trabalhador rural",
      department: "Campo",
      admission: "2026-04-15",
      status: "Ativo",
      color: 2,
    },
    {
      id: "e4",
      name: "Maria Costa",
      code: "FL-004",
      role: "Assistente de logística",
      department: "Logística",
      admission: "2026-01-12",
      status: "Ativo",
      color: 3,
    },
    {
      id: "e5",
      recordBreaks: false,
      breakMinutes: 60,
      name: "Pedro Almeida",
      code: "FL-005",
      role: "Trabalhador rural",
      department: "Campo",
      admission: "2026-05-04",
      status: "Ativo",
      color: 4,
    },
    {
      id: "e6",
      name: "Luciana Lima",
      code: "FL-006",
      role: "Técnica de segurança",
      department: "Administrativo",
      admission: "2026-02-23",
      status: "Ativo",
      color: 1,
    },
  ];
  const punches: Punch[] = [];
  const times = [
    ["07:00", "12:00", "14:00", "19:00"],
    ["07:00", "12:00", "14:00", "17:00"],
    ["07:00", "12:00"],
    ["07:00", "12:00", "14:00", "17:00"],
    ["07:00", "16:00"],
    ["07:00", "12:00", "14:00", "17:00"],
  ];
  employees.forEach((e, index) =>
    times[index].forEach((time, type) =>
      punches.push({
        id: `p${index}-${type}`,
        employeeId: e.id,
        type: e.recordBreaks === false && type === 1 ? 3 : type,
        time,
        date: DEMO_DATE,
        recordBreaks: e.recordBreaks !== false,
        breakMinutes: e.breakMinutes ?? 60,
      }),
    ),
  );
  const state: DemoState = {
    version: 1,
    employees,
    punches,
    documents: [
      {
        id: "d1",
        employeeId: "e1",
        template: "Entrega de uniforme",
        created: "2026-10-08",
        signed: false,
      },
      {
        id: "d2",
        employeeId: "e3",
        template: "Contrato de experiência",
        created: "2026-10-07",
        signed: false,
      },
      {
        id: "d3",
        employeeId: "e4",
        template: "Regulamento interno",
        created: "2026-10-06",
        signed: false,
      },
      {
        id: "d4",
        employeeId: "e2",
        template: "Entrega de uniforme",
        created: "2026-10-05",
        signed: true,
        signedAt: "2026-10-05T14:30:00.000Z",
      },
      {
        id: "d5",
        employeeId: "e6",
        template: "Regulamento interno",
        created: "2026-10-05",
        signed: true,
        signedAt: "2026-10-05T15:00:00.000Z",
      },
    ],
    authorized: [],
    feedbacks: [],
    audit: [
      {
        id: "a1",
        employeeId: "e2",
        text: "Ana Santos confirmou o recebimento de uniforme (simulação).",
        created: "2026-10-08T10:40:00.000Z",
      },
      {
        id: "a2",
        employeeId: "e3",
        text: "Contrato de experiência emitido para João Ferreira.",
        created: "2026-10-08T10:10:00.000Z",
      },
    ],
    closed: false,
    closingVersion: 0,
    settings: {
      unit: "Fazenda Limoeiro",
      manager: "Equipe administrativa",
      destination: "Banco de horas",
      recordBreaks: true,
      breakMinutes: 60,
    },
  };
  return withDocumentSnapshots(state);
}
export function readStored(raw: string): DemoState {
  const s = JSON.parse(raw) as DemoState;
  if (
    s.version !== 1 ||
    !Array.isArray(s.employees) ||
    !Array.isArray(s.punches) ||
    !Array.isArray(s.documents) ||
    !Array.isArray(s.feedbacks) ||
    !Array.isArray(s.audit) ||
    !Array.isArray(s.authorized) ||
    !s.settings
  )
    throw new Error("Dados da demo incompatíveis.");
  s.settings = {
    ...s.settings,
    recordBreaks: s.settings.recordBreaks ?? true,
    breakMinutes: s.settings.breakMinutes ?? 60,
  };
  s.employees = s.employees.map((e) => ({
    ...e,
    recordBreaks: e.recordBreaks ?? true,
    breakMinutes: e.breakMinutes ?? 60,
  }));
  return withDocumentSnapshots(s);
}
export function csvCell(value: unknown) {
  const text = String(value ?? "");
  return `"${(/^[=+@\-\t\r]/.test(text) ? "'" : "") + text.replaceAll('"', '""')}"`;
}
export function download(
  filename: string,
  content: string,
  type = "text/csv;charset=utf-8",
) {
  const url = URL.createObjectURL(new Blob(["\uFEFF", content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function withDocumentSnapshots(state: DemoState): DemoState {
  return {
    ...state,
    employees: state.employees.map((e) => ({
      ...e,
      recordBreaks: e.recordBreaks ?? true,
      breakMinutes: e.breakMinutes ?? 60,
    })),
    documents: state.documents.map((doc) => {
      const e = state.employees.find((e) => e.id === doc.employeeId);
      if (!e || doc.snapshot) return doc;
      return {
        ...doc,
        snapshot: {
          name: e.name,
          code: e.code,
          role: e.role,
          unit: state.settings.unit,
        },
      };
    }),
  };
}
