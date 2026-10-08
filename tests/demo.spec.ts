import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";

const store = (page: Page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem("limoeiro-demo-v1")!));
async function go(page: Page, hash: string) {
  await page.evaluate((hash) => {
    location.hash = hash;
  }, hash);
  await expect(page.locator(".loading")).toHaveCount(0);
}
async function start(page: Page) {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Bom dia, equipe." }),
  ).toBeVisible();
}
async function createEmployee(page: Page, name: string) {
  await go(page, "employees");
  await page
    .getByRole("button", { name: "Novo funcionário", exact: true })
    .click();
  await page.getByLabel("Nome fictício").fill(name);
  await page.getByLabel("Cargo", { exact: true }).fill("Auxiliar de campo");
  await page.getByRole("button", { name: "Criar pasta digital" }).click();
  await expect(page.locator(".profile-heading h1")).toHaveText(name);
}

test("cadastros similares mantêm identidade, documentos e assinaturas após recarga", async ({
  page,
}) => {
  await start(page);
  await createEmployee(page, "Beatriz Souza");
  const id1 = (await store(page)).employees.at(-1).id;
  await createEmployee(page, "Beatriz Sousa");
  const id2 = (await store(page)).employees.at(-1).id;
  expect(id1).not.toBe(id2);
  await page
    .getByRole("button", { name: "Novo documento para esta pessoa" })
    .click();
  await page
    .getByLabel("Modelo de documento")
    .selectOption("Contrato de experiência");
  await page.getByRole("button", { name: "Gerar prévia" }).click();
  await expect(page.getByRole("dialog")).toContainText("Beatriz Sousa");
  const sign = page.getByRole("button", {
    name: "Simular assinatura",
    exact: true,
  });
  await expect(sign).toBeDisabled();
  await page.getByRole("checkbox").nth(0).check();
  await page.getByRole("checkbox").nth(1).check();
  await sign.click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.reload();
  await expect(page.locator(".profile-heading h1")).toHaveText("Beatriz Sousa");
  let state = await store(page);
  expect(
    state.documents.filter(
      (d: { employeeId: string; signed: boolean }) =>
        d.employeeId === id2 && d.signed,
    ),
  ).toHaveLength(1);
  expect(
    state.documents.filter((d: { employeeId: string }) => d.employeeId === id1),
  ).toHaveLength(0);
  await go(page, `employees/${id1}`);
  await page
    .getByRole("button", { name: "Novo documento para esta pessoa" })
    .click();
  await page.getByRole("button", { name: "Gerar prévia" }).click();
  await expect(page.getByRole("dialog")).not.toContainText("Beatriz Sousa");
  await expect(page.getByRole("checkbox").nth(0)).not.toBeChecked();
  await expect(page.getByRole("checkbox").nth(1)).not.toBeChecked();
  await page.getByRole("button", { name: "Fechar janela" }).click();
  await page.getByRole("button", { name: "Editar cadastro" }).click();
  await page.getByLabel("Matrícula").fill("FL-001");
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(page.locator(".form-error, .storage-warning")).toContainText(
    "matrícula já está em uso",
  );
  state = await store(page);
  expect(
    state.employees.filter((e: { code: string }) => e.code === "FL-001"),
  ).toHaveLength(1);
});

test("ponto, autorização, fechamento congelado, exportação e reabertura", async ({
  page,
  context,
}) => {
  await start(page);
  await go(page, "closing");
  await expect(
    page.getByRole("button", { name: "Simular fechamento", exact: true }),
  ).toBeDisabled();
  const carlosRow = page
    .getByRole("row")
    .filter({ hasText: "Carlos Oliveira" });
  await expect(carlosRow).toContainText("10h");
  await expect(carlosRow).toContainText("2h");
  await page.getByRole("button", { name: "Autorizar 2h" }).click();
  const worker = await context.newPage();
  await worker.goto("/ponto");
  await clockPunch(worker, "FL-003", "Confirmar fim do intervalo");
  await clockPunch(worker, "FL-003", "Confirmar saída");
  await worker.close();
  await go(page, "closing");
  await page
    .getByRole("button", { name: "Simular fechamento", exact: true })
    .click();
  await expect(
    page.getByText("Fechado · versão 1", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText("Fechado · versão 1", { exact: true }),
  ).toBeVisible();
  await go(page, "time");
  await expect(
    page.getByRole("button", { name: "Exibir QR do ponto" }),
  ).toBeDisabled();
  await createEmployee(page, "Novo Cadastro após fechamento");
  await go(page, "closing");
  await expect(page.getByRole("table")).not.toContainText(
    "Novo Cadastro após fechamento",
  );
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar relatório" }).click();
  const file = await downloaded;
  const csv = await readFile((await file.path())!, "utf8");
  expect(csv).toContain('"600";"120"');
  expect(csv).toContain('"Fechado v1"');
  expect(csv).not.toContain("Novo Cadastro após fechamento");
  await page.getByRole("button", { name: "Reabrir período" }).click();
  await page
    .getByLabel("Motivo da reabertura")
    .fill("Revisar exemplo de marcação");
  await page.getByRole("button", { name: "Confirmar reabertura" }).click();
  await expect(page.getByText("Em preparação", { exact: true })).toBeVisible();
  await expect(page.locator(".closing-history")).toContainText(
    "Revisar exemplo de marcação",
  );
  await go(page, "time");
  await expect(
    page.getByRole("button", { name: "Exibir QR do ponto" }),
  ).toBeEnabled();
});

test("QR abre escolha por nome sem login e registra sem horário manual", async ({
  page,
  context,
}) => {
  await start(page);
  await go(page, "time");
  await page.getByRole("button", { name: "Exibir QR do ponto" }).click();
  await expect(
    page.getByRole("img", {
      name: "QR Code para abrir o ponto da Fazenda Limoeiro",
    }),
  ).toBeVisible();
  const popupPromise = page.waitForEvent("popup");
  await page.getByRole("link", { name: "Abrir tela do funcionário" }).click();
  const worker = await popupPromise;
  await worker.waitForURL("**/ponto");
  await expect(worker.getByRole("navigation")).toHaveCount(0);
  await expect(worker.locator('input[type="time"]')).toHaveCount(0);
  await expect(worker.locator("input")).toHaveCount(0);
  await worker
    .getByRole("button", {
      name: /João Ferreira/,
    })
    .click();
  await expect(worker.locator(".worker-clock")).toContainText("14:00");
  await worker
    .getByRole("button", { name: "Confirmar fim do intervalo", exact: true })
    .click();
  await expect(
    worker.getByRole("heading", { name: "Ponto confirmado." }),
  ).toBeVisible();
  await expect(worker.locator("main")).not.toContainText("João Ferreira");
  await page.getByRole("button", { name: "Fechar janela" }).click();
  const row = page.getByRole("row").filter({ hasText: "João Ferreira" });
  await expect(row).toContainText("14:00");
  await expect(row).toContainText("Incompleto");
  await clockPunch(worker, "FL-003", "Confirmar saída");
  await expect(row).toContainText("8h");
  await expect(row).toContainText("Regular");
  expect(
    (await store(page)).punches.filter(
      (p: { employeeId: string }) => p.employeeId === "e3",
    ),
  ).toHaveLength(4);
  await worker.close();
});

test("empresa configura duas batidas sem alterar jornadas existentes", async ({
  page,
  context,
}) => {
  await start(page);
  await go(page, "settings");
  await page
    .getByLabel("Registro de intervalo — padrão da empresa")
    .selectOption("false");
  await page.getByRole("button", { name: "Salvar preferências" }).click();
  await createEmployee(page, "Pessoa sem batida de intervalo");
  const employee = (await store(page)).employees.at(-1);
  expect(employee.recordBreaks).toBe(false);
  const worker = await context.newPage();
  await worker.goto("/ponto");
  await clockPunch(worker, employee.code, "Confirmar entrada");
  await clockPunch(worker, employee.code, "Confirmar saída");
  const data = await store(page);
  expect(
    data.punches
      .filter((p: { employeeId: string }) => p.employeeId === employee.id)
      .map((p: { type: number }) => p.type),
  ).toEqual([0, 3]);
  expect(
    data.punches.filter((p: { employeeId: string }) => p.employeeId === "e2"),
  ).toHaveLength(4);
  await page
    .getByRole("button", { name: "Ponto e horas", exact: true })
    .click();
  await expect(page.locator(".time-summary")).toContainText("8h");
  await worker.close();
});

test("feedback contextual persiste, exporta e sobrevive ao reset", async ({
  page,
}) => {
  await start(page);
  await go(page, "documents");
  await page
    .getByRole("button", { name: "Deixar um feedback", exact: true })
    .click();
  await page
    .getByLabel("Seu comentário")
    .fill("Precisamos de um termo específico para ferramentas.");
  await page.getByRole("button", { name: "Guardar feedback" }).click();
  await page.reload();
  await page
    .getByRole("button", { name: "Deixar um feedback", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText(
    "Precisamos de um termo específico",
  );
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: /Exportar \(1\)/ }).click();
  const file = await downloaded;
  const csv = await readFile((await file.path())!, "utf8");
  expect(csv).toContain('"Documentos"');
  expect(csv).toContain("termo específico");
  await page.getByRole("button", { name: "Fechar janela" }).click();
  await go(page, "settings");
  await page
    .getByRole("button", { name: "Reiniciar demonstração", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Reiniciar demonstração", exact: true })
    .click();
  expect((await store(page)).feedbacks).toHaveLength(1);
  expect((await store(page)).employees).toHaveLength(6);
});

test("seis áreas, fichas e formulários cabem em 360, 390 e 430px sem overflow", async ({
  page,
}) => {
  await start(page);
  for (const width of [360, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    for (const section of [
      "overview",
      "employees",
      "documents",
      "time",
      "closing",
      "settings",
      "employees/e1",
    ]) {
      await go(page, section);
      await page.waitForTimeout(100);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${width}px ${section}`,
      ).toBe(true);
    }
    await go(page, "employees");
    await page
      .getByRole("button", { name: "Novo funcionário", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(
      await page
        .getByRole("dialog")
        .evaluate((e) => e.scrollWidth <= e.clientWidth),
    ).toBe(true);
    await page.getByRole("button", { name: "Fechar janela" }).click();
    await go(page, "overview");
    await page.screenshot({
      path: `artifacts/overview-${width}.png`,
      fullPage: true,
    });
    await page.getByRole("button", { name: "Abrir navegação" }).click();
    await page
      .getByRole("navigation")
      .getByRole("link", { name: "Documentos" })
      .click();
    await expect(
      page.getByRole("heading", { name: "Documentos", exact: true }),
    ).toBeVisible();
    await expect(page.locator(".sidebar")).not.toHaveClass(/open/);
  }
});

test("demo não faz requests externos, não revela credenciais e não gera erros", async ({
  page,
}) => {
  const errors: string[] = [];
  const external: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (req) => {
    if (
      !req.url().startsWith("http://localhost:3000") &&
      !req.url().startsWith("data:")
    )
      external.push(req.url());
  });
  await start(page);
  for (const section of [
    "employees",
    "documents",
    "time",
    "closing",
    "settings",
  ])
    await go(page, section);
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
  expect(await page.content()).not.toMatch(/postgres(?:ql)?:\/\//);
});

test("armazenamento indisponível avisa sem bloquear a navegação", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("QuotaExceededError");
    };
  });
  await start(page);
  await expect(page.locator(".form-error, .storage-warning")).toContainText(
    "Não foi possível ler ou salvar",
  );
  await go(page, "employees");
  await expect(
    page.getByRole("heading", { name: "Funcionários", exact: true }),
  ).toBeVisible();
});

async function clockPunch(worker: Page, code: string, action: string) {
  if (
    await worker
      .getByRole("button", { name: "Registrar outro ponto", exact: true })
      .isVisible()
  )
    await worker
      .getByRole("button", { name: "Registrar outro ponto", exact: true })
      .click();
  await worker.locator(`button[data-employee-code="${code}"]`).click();
  await worker.getByRole("button", { name: action, exact: true }).click();
  await expect(
    worker.getByRole("heading", { name: "Ponto confirmado." }),
  ).toBeVisible();
}
