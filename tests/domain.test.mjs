import test from "node:test";
import assert from "node:assert/strict";
import {
  seedState,
  summary,
  csvCell,
  readStored,
  closingState,
} from "../src/lib/demo.ts";

test("8h e 10h: intervalos excluídos, excedente preservado", () => {
  const state = seedState();
  const normal = summary(state.punches, "e2");
  const extra = summary(state.punches, "e1");
  assert.equal(normal.worked, 480);
  assert.equal(normal.extra, 0);
  assert.equal(extra.worked, 600);
  assert.equal(extra.extra, 120);
  assert.equal(state.authorized.includes("e1"), false);
});

test("jornada incompleta, eventos duplicados e ordem inválida não inventam horas", () => {
  const state = seedState();
  assert.equal(summary(state.punches, "e3").complete, false);
  assert.equal(summary(state.punches, "e3").worked, 0);
  const duplicate = state.punches
    .filter((p) => p.employeeId === "e2")
    .map((p, i) => ({ ...p, type: i === 3 ? 2 : p.type }));
  assert.equal(summary(duplicate, "e2").complete, false);
  const reversed = state.punches.map((p) =>
    p.employeeId === "e2" && p.type === 3 ? { ...p, time: "13:00" } : p,
  );
  assert.equal(summary(reversed, "e2").complete, false);
});

test("fechamento e documento emitido conservam o nome original", () => {
  const state = seedState();
  const snapshot = structuredClone({
    employees: state.employees,
    punches: state.punches,
    authorized: state.authorized,
    settings: state.settings,
  });
  state.closed = true;
  state.closingSnapshot = snapshot;
  state.employees[0].name = "Nome editado depois";
  assert.equal(closingState(state).employees[0].name, "Carlos Oliveira");
  assert.equal(state.documents[0].snapshot.name, "Carlos Oliveira");
  state.closed = false;
  assert.equal(closingState(state).employees[0].name, "Nome editado depois");
});

test("CSV escapa aspas e neutraliza fórmulas de planilha", () => {
  assert.equal(csvCell('A "B"'), '"A ""B"""');
  assert.equal(csvCell("=2+2"), '"\'=2+2"');
  assert.equal(csvCell("+SUM(A1:A2)"), '"\'+SUM(A1:A2)"');
});

test("persistência versionada restaura os exemplos e rejeita formato incompatível", () => {
  assert.deepEqual(readStored(JSON.stringify(seedState())), seedState());
  assert.throws(() => readStored('{"version": 999}'));
});
