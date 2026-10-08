# Especificação funcional e técnica — MVP 01
## Gestão de Funcionários da Fazenda | Demonstrativo Verson

**Versão:** 0.1 — proposta inicial para validação com a fazenda
**Data:** 08/10/2026
**Objetivo:** demonstrar uma pasta digital de funcionários que centralize documentos, assinatura pelo celular e ponto com apuração configurável de jornada, banco de horas e horas extras.

> **Status:** especificação proposta, não requisitos homologados. Os documentos recebidos são exemplos reais de processos; não foram validados juridicamente. O demonstrativo usará dados fictícios. Não considerar o registro QR um sistema REP-P homologado/conforme antes de adequação e validação técnica/jurídica.

---

## 1. Visão do produto

A unidade de organização principal é o **funcionário**, não o documento ou o QR. Cada funcionário possui uma pasta digital duradoura que consolida cadastro, vínculo, jornada, marcações, apurações, entregas de uniformes/EPI, documentos, assinaturas e histórico.

**Princípios:**
1. Administrativo centralizado; funcionário não precisa manter conta convencional.
2. Experiência extremamente simples para trabalhadores: escanear, identificar, confirmar; para assinar: conferir, identificar, assinar.
3. Modelos de documentos e regras de jornada cadastráveis sem alterar código.
4. Marcações originais e documentos assinados imutáveis; ajustes apenas por registros adicionais com auditoria.
5. Começar com um demonstrativo funcional de três jornadas de valor e crescer por validação.
6. Ambiente pronto para múltiplas empresas/unidades do grupo, mas o MVP pode operar com uma empresa/unidade piloto.

### 1.1 Objetivo do primeiro demonstrativo

Demonstrar ponta a ponta:
- Criar um funcionário fictício e acessar sua pasta digital.
- Gerar documento a partir de um modelo, coletar assinatura na tela do celular compartilhado e arquivar PDF/histórico.
- Registrar entrada, intervalos e saída via QR; apurar horas normais e excedentes conforme jornada e autorização; exibir prévia do fechamento.

### 1.2 Fora do primeiro MVP

Folha de pagamento e tributos; eSocial; cálculo salarial, adicional noturno e DSR reais; integração com relógio de ponto ou equipamentos; estoque completo; controle de alojamentos por quarto/leito; gestão disciplinar investigativa; workflow de aprovação jurídica; emissão legal REP-P/AFD/AEJ/comprovantes conformes; aplicativo nativo; assinatura digital certificada ICP-Brasil ou GOV.BR; comunicação automática por WhatsApp. Estes pontos são candidatos à evolução e exigem validação específica.

---

## 2. Perfis e permissões

| Perfil | Pode fazer | Não pode fazer |
|---|---|---|
| Administrador | Configurar empresa, cargos, jornadas, permissões, modelos e relatórios | Alterar silenciosamente marcação bruta ou PDF assinado |
| Administrativo / DP | Cadastrar funcionários, documentos, autorizações, ajustar apuração com justificativa, fechar período | Administrar segredos técnicos, se não autorizado |
| Gestor | Consultar equipe sob sua responsabilidade, solicitar/aprovar extras conforme permissão, ver pendências | Consultar documentos restritos de outras equipes |
| Funcionário | Registrar ponto em fluxo público controlado, assinar documento designado em sessão limitada | Acessar sistema administrativo ou dados de colegas |

**Segurança:** autenticação real para usuários administrativos, sessões limitadas para assinaturas em aparelho compartilhado e PIN individual ou outro segundo fator simples para registro de ponto. Digitar nome sozinho não é identificação suficiente para implantação oficial.

---

## 3. Navegação e telas

**Sidebar (administrativo)**
1. Visão geral — indicadores e pendências de hoje.
2. Funcionários — listagem, pesquisa, filtros e nova ficha.
3. Ponto e jornadas — marcações, QR, ajustes e autorizações.
4. Documentos — biblioteca de modelos, emissões, assinatura pendente e histórico.
5. Fechamentos — apuração mensal, pendências, exportação e bloqueio do período.
6. Configurações — empresa/unidade, cargos, jornadas, calendário, regras, acessos.

### 3.1 Dashboard

Cards: funcionários ativos; marcações hoje; documentos aguardando assinatura; inconsistências de ponto; horas excedentes pendentes de classificação; fechamento do mês em andamento. Lista de ações: **Registrar ponto (abrir QR)**, **Novo funcionário**, **Novo documento**, **Fechar mês**.

### 3.2 Listagem de funcionários

Nome, matrícula, cargo, setor, jornada ativa, status, documentos pendentes. Filtros por ativo/inativo, setor/cargo, unidade, pendências. CTA novo funcionário. Nunca usar nome como chave primária; usar ID interno e matrícula/identificador.

### 3.3 Perfil do funcionário — pasta digital

Cabeçalho: nome, matrícula, cargo, setor, admissão, status, responsável.

Abas:
- **Resumo:** dados relevantes, contrato, jornada vigente, saldo, pendências e eventos recentes.
- **Ponto e horas:** calendário, registros brutos, apuração, banco de horas, autorizações.
- **Documentos:** todos os PDFs, modelos, assinaturas, vencimentos, versões e filtros.
- **Entregas:** uniforme/EPI/material, quantidade, referência, entrega/devolução, termo assinado.
- **Histórico:** linha do tempo com eventos, alterações e responsável por cada ação.

Alojamento, ocorrências detalhadas e gestão de advertências podem começar como documentos categorizados e só virar abas específicas caso o processo exija regras próprias.

### 3.4 Interface do funcionário — celular

- **Ponto:** QR -> página mínima -> nome (busca no cadastro) + identificação adicional -> ação exibida (entrada, início/fim do intervalo, saída) -> confirmação -> comprovante visual do registro.
- **Assinatura:** link/sessão gerada pelo administrativo -> identificação -> leitura do documento completo -> aceite expresso -> assinatura na tela -> confirmação e protocolo.

Sem sidebar, sem formulário longo, sem acesso a registros de terceiros; botões grandes, mensagens de erro claras.

---

## 4. Registro de ponto por QR Code

### 4.1 Modos

**A. QR dinâmico em tela:** token curto com renovação frequente; exibido em computador/tablet na fazenda.

**B. QR impresso por dia:** token específico, assinado/validado pelo servidor, com intervalo de validade configurado pelo administrativo (ex.: dia de trabalho). Pode ser deixado na mesa; ao vencer, precisa imprimir outro.

**Limitação deliberada:** imprimir QR por dia não demonstra presença física. Foto/cópia do QR pode ser compartilhada enquanto válido. PIN e limites antifraude ajudam na identificação, mas não provam localização. Para uso oficial, exigir solução de controle de presença e conformidade definida com a fazenda.

### 4.2 Sequência de marcações

O ponto deve tratar quatro eventos com hora real do servidor:
1. Entrada.
2. Início do intervalo.
3. Fim do intervalo.
4. Saída.

A interface pode **sugerir** o próximo evento pelo histórico, mas o funcionário confirma qual evento está registrando. Nunca inferir silenciosamente uma saída só porque chegou às 17h. Validar marcações duplicadas, fora de sequência, turnos noturnos e dias sem intervalo. Capturar data/hora com fuso da unidade; preservar UTC e offset/fuso.

Pode haver dois QRs por sentido (entrada/saída) na interface para a fazenda, mas a apuração exige suporte a intervalos e identificação explícita do evento. Um único QR por local com formulário inteligente também é viável, podendo ser a configuração inicial do MVP.

### 4.3 Regras técnicas

- Servidor gera e valida token, local e validade; token não contém dados do funcionário.
- Funcionário digita nome para localizar registro e informa identificador adicional (ex.: PIN). Evitar nomes duplicados como identidade.
- Backend resolve perfil pelo ID e grava servidor timestamp, tipo, coletor, empresa/unidade, versão do fluxo e ID único de marcação.
- Respostas idempotentes para duplo clique/reenvio; feedback de sucesso e identificação de duplicidade.
- Nenhuma exclusão ou edição direta de registro bruto; correção é ocorrência separada com motivo, antes/depois, autor e data.
- Registrar ocorrências de marcações incompletas, repetidas, fora do período ou suspeitas; não apagar horas por falta de autorização.
- A indisponibilidade de internet e o procedimento de contingência devem ser definidos antes da produção.

---

## 5. Jornadas, autorizações, apuração e banco de horas

### 5.1 Configuração por perfil/período

`ModeloJornada`: nome; dias/escala; carga diária/semanal prevista; horários teóricos; intervalo; unidade; vigência; política de tolerância; feriados; regras de classificação. Associar o modelo ao funcionário **com início e fim de validade** para preservar histórico. Regras de convenção/acordo coletivo exigem revisão competente.

`AutorizacaoExtra`: funcionário(s) ou equipe; data/período; limite de horas autorizadas; justificativa; aprovador; status; destino autorizado (banco ou pagamento, se aplicável); referência à política vigente. Safra = período de autorização associado a grupos, **não substituição de jornada contratual por padrão**.

### 5.2 Motor de apuração (minutos inteiros)

Para cada funcionário e dia/período:
1. Ordenar marcações brutas e parear intervalos completos; sinalizar inconsistências em vez de inventar horário.
2. Somar tempo efetivamente trabalhado, excluindo os intervalos registrados ou legalmente parametrizados.
3. Consultar modelo de jornada vigente, escala, feriados e regras aprovadas.
4. Calcular diferença entre tempo trabalhado e previsto; produzir `excedente` e `faltante`.
5. Consultar autorização para **classificar** o excedente: autorizado, sem autorização, revisão necessária. A falta de autorização não faz horas trabalhadas desaparecerem nem elimina eventual direito a pagamento.
6. Aplicar política validada de destinação: **a pagar**, **compensar em banco**, **pendente de decisão**. Separar apuração de jornada de apuração financeira/folha.
7. Criar eventos de banco (`crédito`, `débito/compensação`, `ajuste`) com origem e autor; obter saldo somando eventos, não editando número manualmente.
8. Fechamento mensal gera *snapshot* auditável, com versão das regras e dados usados.

**Exemplo A (sem extras):** Carlos 07:00–12:00, 14:00–17:00 => 8h trabalhadas, 8h previstas, 0 excedente.

**Exemplo B (safra/autorização):** Carlos 07:00–12:00, 14:00–19:00 => 10h trabalhadas, 8h previstas, 2h excedentes. Se houver autorização de 2h, classificar autorizadas e destinar conforme política; se não, classificar **2h excedentes não autorizadas para conferência**, sem excluir registro nem horas.

**Exemplo C (erro de ponto):** sem fim de intervalo => apuração pendente; administrativo corrige com justificativa e histórico, sem sobrescrever o bruto.

### 5.3 Fechamento mensal

Fluxo: selecionar mês/unidade -> gerar prévia por funcionário -> mostrar pendências -> conferir ajustes/autorização -> classificar banco/pagamento -> confirmar fechamento -> exportar XLSX/CSV/PDF. Bloquear reprocessamento silencioso de mês fechado; reabertura apenas por usuário autorizado com motivo e versionamento.

**Relatório:** funcionário/matrícula, período, jornada prevista, tempos trabalhados, extras autorizadas, excedentes sob análise, horas destinadas a banco, compensações, saldo inicial/final, inconsistências, assinaturas/ciência caso solicitadas.

**Não incluído:** transformar automaticamente estes valores em folha de pagamento ou eventos eSocial.

---

## 6. Documentos, modelos e assinatura universal

### 6.1 Tipos da biblioteca inicial baseados nos materiais recebidos

| Tipo | Processo suportado | Primeiro MVP |
|---|---|---|
| Contrato de experiência | Modelo, preencher dados da pessoa, prazos e prorrogação | Modelo + aviso de vencimento simples |
| Termo de uniforme | Entrega/devolução, quantidade e referência do anexo | Cadastro de entrega + geração/assinatura |
| Termo de alojamento | Ciência e responsabilidade pelo uso | Modelo + assinatura |
| Autorização de uso de imagem | Concordância específica com o documento | Modelo + assinatura e status |
| Ordem de serviço por cargo | Vincular documento à função e coletar ciência | Modelo vinculado ao cargo + assinatura |
| Regulamento interno | Publicação de versão e ciência do recebimento | Modelo/documento + ciência registrada |
| Regulamento disciplinar | Publicação de versão e ciência; procedimento disciplinar detalhado futuro | Documento + ciência registrada |

**Cópias:** uniforme e autorização de imagem foram enviados duas vezes. Catalogar como tipos únicos, sujeitas à verificação de conteúdo/versão.

### 6.2 Biblioteca de modelos

- Criar modelo por editor simples com campos dinâmicos (`{{funcionario.nome}}`, `{{funcionario.cargo}}`, `{{data}}`, `{{empresa.razao_social}}`, etc.).
- Categoria, nome, descrição, responsável, versões e status rascunho/publicado/arquivado.
- Visualizar PDF antes de emitir; preencher valores adicionais com formulário gerado a partir de campos do modelo.
- Opcional: carregar PDF pronto e solicitar assinatura sem transformar o conteúdo em template editável. **Não prometer edição automática de qualquer PDF importado**.
- Ao emitir, **congelar versão do modelo e dados resolvidos**. Alterar o modelo futuro não altera arquivo já assinado.

### 6.3 Assinatura no celular compartilhado

1. Administrativo escolhe perfil e documento; prepara versão final para leitura.
2. Inicia uma sessão curta para aquele signatário (token único, expiração e bloqueio após uso).
3. Funcionário confirma identidade; **visualiza o documento inteiro**, aceita assinar e desenha rubrica/assinatura na tela.
4. Backend registra evidências: pessoa, ID documento/versionamento, hash SHA-256 do arquivo final, data/hora, sessão, aceite e demais metadados proporcionais (ex.: IP/device, respeitando LGPD).
5. Gerar PDF final e registro de evento, preservar integridade e disponibilizar no perfil; se falhar, manter pendência e permitir nova sessão auditada.
6. Limpar imediatamente sessão e dados visíveis do aparelho compartilhado antes do próximo colaborador.

**Atenção:** assinatura desenhada + aceite é proposta funcional do demonstrativo, **não equivalência automática** a assinatura avançada/qualificada. O nível exigido para contratos e termos deve ser decidido com jurídico/DP. Se necessário, integrar serviço de assinatura que suporte padrão/evidências requeridos.

---

## 7. Banco de dados — domínio inicial (Neon PostgreSQL)

Separar identidade, arquivos, marcação bruta, apuração e auditoria. Esboço de tabelas:

- `organizations` — entidade empregadora, informações básicas.
- `units` — fazendas/unidades, fuso, identificação, setor.
- `admin_users`, `memberships`, `roles` — usuários e permissões administrativas.
- `employees` — ID UUID, organização, matrícula, nome, status, cargo/setor, admissão, desligamento e dados estritamente necessários.
- `job_roles`, `departments` — catálogos configuráveis.
- `work_schedules`, `employee_schedule_assignments` — modelos de jornada versionados e vigência.
- `overtime_authorizations` — escopo, período, limite, aprovador, destino, versão.
- `qr_collectors`, `qr_tokens` — modos tela/impresso, local, expiração e status.
- `time_punches` — **imutável**: funcionário, tipo, timestamp UTC/fuso, coletor, idempotência, evidências.
- `time_adjustments` — solicitações e decisões de correção, vinculadas às marcações.
- `daily_time_summaries` — resultado calculado, inconsistências e versão do motor.
- `time_bank_entries` — créditos, compensações, ajustes e origem da autorização.
- `monthly_closings`, `closing_items` — snapshots de fechamentos e estado.
- `document_templates`, `document_template_versions`, `document_fields` — modelos e placeholders.
- `employee_documents`, `signature_sessions`, `signatures`, `file_objects` — documentos gerados, PDFs, assinaturas, metadados e armazenamento privado.
- `material_deliveries`, `material_delivery_items` — entregas/devoluções assinadas.
- `audit_events` — log transversal, ator, tipo, origem, data, mudança.

**Decisões:** todas as tabelas com segregação por `organization_id`/`unit_id` quando apropriado; índices por empregado/data e status; constraints de unicidade; backups; testes de autorização de leitura/escrita multiempresa. Não gravar arquivos PDF/imagens pesados dentro do Neon: guardar em storage privado, somente referências/metadados no Postgres.

---

## 8. Infraestrutura e tecnologia

- Aplicação web responsiva: **Next.js** com TypeScript.
- Hospedagem: **Vercel**, sob domínio/subdomínio da **Verson** (endereço exato pendente).
- Banco relacional: **Neon PostgreSQL**.
- Camada de acesso e migração: **Drizzle ORM** (proposta, pode ser Prisma se houver padrão de projeto).
- Login administrativo: biblioteca de autenticação consolidada, RBAC, senha/sessão seguras, suporte a redefinição.
- Documentos e assinaturas: **storage privado compatível com S3 ou equivalente**, com URLs assinadas de curta duração e políticas de acesso.
- Geração de PDF server-side, hash de integridade e exportação CSV/XLSX/PDF.
- Observabilidade: logs sem dados sensíveis, auditoria, backup/teste de recuperação.
- Separar `development`, `preview/demo` e `production`; dados fictícios na demo.
- UX: português claro, botões grandes para celular, responsivo, pouco texto, tarefas frequentes em até poucos passos.

---

## 9. Sequência de implementação — fases do primeiro demonstrativo

### Fase 0 — Fundação

Criar projeto, layout, identidade Verson, esquema inicial Neon, migrações, autenticação administrativa, permissões, tenant/unidade, dados fictícios e auditoria. Entrega: sistema acessível no ambiente de demo com menu e autorização mínima.

### Fase 1 — Funcionários

CRUD do funcionário, listagem, ficha com abas Resumo/Ponto/Documentos/Entregas/Histórico. Entrega: perfil digital completo navegável e integrado aos módulos seguintes.

### Fase 2 — Modelos e assinatura

Biblioteca de modelos configuráveis, importação como anexo, geração de PDF, sessão limitada de assinatura para aparelho compartilhado, PDF final e histórico. Entrega: contrato/termo fictício criado, assinado e recuperado no perfil.

### Fase 3 — QR e registro de jornada

QR dinâmico e QR diário imprimível, busca de empregado + PIN, quatro tipos de evento, registro servidor, validação de duplicação e listagem por funcionário. Entrega: marcações confiáveis para fins de demonstração e extrato por dia.

### Fase 4 — Regras e horas

Modelos de jornada, vigência por funcionário, autorização individual/em grupo (safra), apuração em minutos, classificação das horas e eventos de banco; painel de inconsistências. Entrega: cenário de Carlos 8h normal e 10h com +2h excedentes funcionando.

### Fase 5 — Fechamento e apresentação

Prévia mensal, revisão e correções auditadas, exportação de relatório simples, estados pendente/fechado, roteiro de apresentação, testes responsivos. Entrega: fluxo completo do empregado ao fechamento.

---

## 10. Critérios mínimos de aceite do demonstrativo

1. Cadastrar dois funcionários com nomes similares sem misturar registros; documentos e marcações vinculados por UUID.
2. Alterar a jornada em uma data futura sem reescrever a vigente no passado.
3. Emitir dois documentos por modelos distintos, assinar em sessões individuais e encontrar cada PDF na pasta correta.
4. Após concluir assinatura no celular compartilhado, nenhum dado do trabalhador anterior permanecer exposto.
5. Utilizar QR impresso somente dentro da janela válida; após vencer, rejeitar com mensagem clara.
6. Registrar entrada, início/fim de intervalo e saída com horários do servidor; impedir duplo registro acidental.
7. Mostrar 8h normais para 07–12, 14–17 e 2h excedentes para 07–12, 14–19.
8. Com extra autorizada: classificar 2h conforme política. Sem autorização: preservar 2h, marcar pendência.
9. Ao corrigir ponto, manter original, justificar ajuste e atualizar apuração rastreável.
10. Exportar relatório de um mês com funcionário, marcações, horas, banco e pendências.
11. Administrador de uma empresa não consegue ver dados de outra; funcionário não enxerga outros perfis.
12. Dados de demonstração são fictícios e não contêm CPFs/endereços/salários de contratos reais.

---

## 11. Pontos que precisam ser confirmados com o administrativo da fazenda

1. **Jornada real:** horários, intervalos, turnos, sábados/domingos, safra, feriados e mudanças de escala.
2. **Tratamento do excedente:** horas pagas, banco, compensação, regras da CCT/acordo coletivo, aprovações e quem decide.
3. **Fechamento:** planilhas e formato exigido pela contabilidade; período de corte e assinaturas de espelho.
4. **Dispositivo e acesso:** QR impresso diário vs tela digital, conectividade e políticas de presença.
5. **Identificação:** PIN/matrícula ou outro método adequado, inclusive no dispositivo compartilhado.
6. **Assinaturas:** quais documentos precisam de assinatura do empregado e do empregador; exigência de assinatura avançada/qualificada.
7. **Modelos:** quais arquivos são apenas ciência, quais geram termo com dados variáveis, quais exigem fluxos específicos.
8. **Estrutura organizacional:** uma fazenda ou várias, empresas/CNPJs distintos, setores, responsáveis e restrições de acesso.
9. **Política de privacidade e guarda:** responsáveis pelo acesso, retenção, backup, exportação e exclusões legalmente permitidas.

---

## 12. Observações técnicas e de conformidade

**Controle oficial de ponto.** O sistema demonstrativo de QR por si só não é REP-P. O Ministério do Trabalho e Emprego diferencia REP-C, REP-A e REP-P; o REP-P possui exigências sobre identificação, sincronismo de relógio, registro/auditoria, comprovantes, AFD/AEJ e assinaturas técnicas. Antes de substituir controle oficial, decidir se haverá adequação rigorosa à Portaria 671/2021 ou integração a solução especializada.

**Assinatura eletrônica.** O desenho com dedo é apenas parte da experiência, não garantia universal de autenticidade/validade. Manter autoria, integridade, aceite, versão e prova; avaliar juridicamente os casos e níveis apropriados de assinatura.

**Privacidade.** Há documentos de trabalhadores com dados pessoais, possivelmente dados de saúde/atestados em expansões futuras. Usar minimização, controle de acesso, auditoria, storage privado e políticas de retenção conformes à LGPD.

**Registros e direitos.** O limite de autorização para hora extra é controle operacional e não deve suprimir horas trabalhadas reais nem efeitos legais. Os cálculos demonstrativos não substituem revisão contábil/jurídica.

---

## 13. Origem dos requisitos nos nove arquivos recebidos

- 2 cópias do **Termo de compromisso da entrega de uniforme**: obrigações e anexo de entregas/devoluções.
- **Termo de responsabilidade para utilização de alojamento**: assinatura e responsabilidades.
- 2 cópias da **Autorização para uso de imagem**: consentimento documental específico.
- **O.S. Cargo Assistente Logística**: responsabilidades vinculadas a função e ciência.
- **Regulamento interno**: jornada, intervalo, marcação e comunicação de erros, uniforme/EPI, ciência e normas.
- **Regulamento de procedimentos e sanções disciplinares**: procedimentos e registro de decisões (funcionalidade detalhada futura).
- **Contrato de experiência**: cargo, jornada semanal, prorrogação, assinaturas e prazo contratual de exemplo.

**Importante:** exemplos de contratos e normas não são automaticamente regras vigentes para todos os funcionários. Não replicar dados pessoais dos arquivos em ambientes de demonstração. Validar versões, cláusulas, regras e aplicabilidade com a fazenda antes de produção.

---

## 14. Recorte vigente — DEMO-01: navegação e simulação para feedback

**Precedência:** esta seção incorpora as decisões mais recentes do usuário e prevalece sobre as propostas das seções 1–13 quando houver diferença.

Decisão do usuário em 08/10/2026: entregar primeiro um MVP navegável para explorar funcionalidades, simular uso e colher feedback, com textos explicativos curtos. Este recorte antecede a implementação operacional das seções anteriores.

**Baseline inicial:** checkout sem commits, somente configuração Neon; branch remota de banco `production` já vinculada. Nenhuma aplicação existia no início desta tarefa. **Resultado desejado:** demo interativa administrativa e simulação da experiência do funcionário. **Lacuna operacional:** autenticação, autorização, persistência compartilhada, assinatura válida, ponto oficial e integrações serão etapas posteriores.

**Responsável:** Codex, execução e integração neste checkout, sem agentes paralelos. Arquivos: `src/`, configuração do app, README e esta especificação. Sem artefato visual previamente aprovado.

**Direção de produto confirmada:** facilitar o dia a dia da gestão e eliminar papel/retrabalho. O administrativo cadastra uma vez, reaproveita dados em documentos e confere pendências. O funcionário tem apenas o fluxo do QR para ponto, sem portal, menus administrativos ou digitação de horários. Assinaturas são pontuais, conduzidas pelo administrativo. Pergunta central do feedback: "Isso ficou mais fácil do que fazemos hoje?"

**Ponto e intervalo:** QR demonstrativo abre `/ponto`; escolha do nome → próximo evento indicado → confirmação em botão único. Decisão posterior do usuário: retirar usuário/senha para simplificar o compartilhamento e a avaliação da demo; não há login nem PIN. A demo usa relógio fictício automático para testar rapidamente. Produção deverá registrar horário pelo servidor. Intervalo configurável por jornada, com padrão da empresa: quatro batidas ou apenas entrada/saída. Sem batida não significa sem pausa: a demo desconta uma pausa prevista configurável, como hipótese ilustrativa a validar. Mudança do padrão vale para novos cadastros; registros antigos preservam sua configuração. Sem sistema oficial de ponto nesta entrega.

**Arquitetura:** Next.js/TypeScript, UI por módulos, domínio em `src/lib/demo.ts`, localStorage versionado, relações por ID. Não há API de negócio, autenticação real, upload ou acesso ao Neon. `/ponto` é uma página independente. A seleção é por ID interno; nomes iguais exibem a matrícula como referência, sem exigir sua digitação. Abas na mesma origem/navegador sincronizam via evento de storage; dispositivos diferentes não compartilham dados. O QR aponta para endereço local de rede em desenvolvimento e para a origem publicada quando houver publicação autorizada. Falha de armazenamento avisa. Documentos emitidos congelam dados resolvidos; fechamento mantém cópia local da conferência. Feedbacks são locais e exportáveis, preservados pelo reset.

**Dentro:** seis áreas navegáveis, ficha/cadastro fictícios, documento com leitura/aceite simulado, QR e tela mínima de ponto automático, intervalo configurável, apuração demonstrativa, fechamento/reabertura, exportação CSV, preferências, feedback por tela e mobile.

**Fora:** backend, multiusuário real, dados reais, tokens oficiais/temporários de QR, assinatura jurídica, PDFs oficiais, regras legais de folha, migrations, commit, push e publicação. Configuração Neon preservada. Publicação necessita pedido explícito.

| ID | Estado inicial → ação | Resultado esperado | Efeito proibido | Verificação / estado |
| --- | --- | --- | --- | --- |
| D01 | Demo inicial → navegar pelas seis áreas e ficha | Conteúdo útil, ações e explicação curta por área | Tela vazia ou navegação quebrada | PASSA — Playwright desktop/mobile, seis áreas e ficha |
| D02 | Pessoas fictícias → cadastrar nomes similares e recarregar | Fichas distintas por ID, estado local restaurado | Misturar registros ou gravar no banco | PASSA — nomes similares, recarga e matrícula duplicada rejeitada |
| D03 | Pessoa → emitir, ler e simular assinatura → reabrir | Documento e histórico na pessoa correta, status persistido | Alegar assinatura real ou expor documento anterior na próxima sessão | PASSA — emissão, assinatura, recarga e sessão seguinte sem dados da anterior |
| D04 | Exemplos 8h/10h → confirmar ponto pelo QR e criar jornada de duas batidas | Apuração, excedente preservado e confirmação sem digitar hora | Inventar horários em dia incompleto ou apagar excedente sem autorização | PASSA — testes de domínio e Playwright; seleção por nome sem campos de login, duas/quatro batidas |
| D05 | Prévia → fechar, tentar editar, reabrir com motivo, exportar | Fechamento local auditado, bloqueio e CSV correspondente | Mudar silenciosamente período fechado | PASSA — cópia preservada após novo cadastro, bloqueio, CSV e reabertura com motivo |
| D06 | Tela → registrar feedback → recarregar → exportar → reset | Feedback mantém contexto e sobrevive ao reset; simulações reiniciam | Perder feedback silenciosamente | PASSA — persistência, CSV contextual e reset preservando feedback |
| D07 | App em 360/390/430px e desktop | Conteúdo e ações acessíveis, sem overflow da página | Botões inacessíveis ou texto cortado | PASSA — Playwright e capturas; tabelas com rolagem interna |
| D08 | Setup Neon existente → executar demo/build | Nenhuma chamada ao Neon e segredos fora do bundle | Alterar dados/configuração remota ou expor credenciais | PASSA — zero requests externos no teste; nenhuma importação/conexão ao Neon em src; 38 arquivos do bundle sem valores de .env.local; segredos ignorados no Git |

**Entrega do executor:** pronta para revisão local em `http://localhost:3000` e `/ponto`. Branch `master`, sem commits; arquivos não commitados. Um responsável, sem integrações concorrentes.

**Evidências:** `npm run typecheck`, `npm test` (5 testes de domínio), `npm run test:e2e` (8 testes de navegador) e `npm run build` aprovados em Node 24 / Next 16.4.0 / Chromium headless. Testes em `tests/`. Capturas em `artifacts/overview-360.png`, `overview-390.png`, `overview-430.png`, `overview-desktop.png` e `worker-360.png`.

**Não verificado / pendente:** aceite da fazenda, leitura física do QR com câmera de telefone, acesso pela rede Wi-Fi do usuário, regras operacionais/jurídicas, autenticação/autorização reais, presença física e publicação. Não há artefato visual aprovado para comparação.

**Dados e reversão:** sem migrations ou chamadas ao banco. Remover os arquivos novos do app ou restaurar os exemplos pela UI reverte a demo; exportar feedbacks antes de limpar o navegador. Configuração Neon preservada. Sem commit/push/deploy. Aceite do usuário e publicação permanecem pendentes.

**Ajuste de acesso da demo (08/10/2026):** retirados matrícula/PIN do ponto e instruções de senha. Escolha do nome em botão → confirmação; IDs, apuração, sincronização local e encerramento da seleção após registrar continuam preservados. Verificação dirigida: testes de QR, fechamento e jornada de duas batidas, mais TypeScript e inspeção móvel.

## 15. Publicação da demonstração — autorização de 08/10/2026

O usuário autorizou explicitamente commits, push ao GitHub e publicação na Vercel. Repositório: `MateusTeixeira9203/Fazenda-limoeiro`, primeira branch de publicação `main`. Alvo conferido: projeto Vercel `fazendalimoeiro` (`prj_vPPqiAcLcbC9wSM8cjCDvtAtUDYI`), equipe `mateusteixeira9203s-projects`, ambiente production da demo. Os projetos de nome semelhante não serão alterados.

Escopo publicado: somente demonstração fictícia, sem login e sem chamadas ao Neon. `.env.local` e `.neon` ficam ignorados tanto pelo Git quanto pelo upload da Vercel. O QR publicado deverá apontar para a própria origem HTTPS.

Gate anterior ao envio: TypeScript, 5 testes de domínio e 8 testes de navegador aprovados. Após publicar, verificar acesso anônimo ao painel, QR/tela do funcionário, cadastro/documento/assinatura, ponto e persistência local; registrar a versão e o resultado. Aceite dos usuários da fazenda permanece pendente.
