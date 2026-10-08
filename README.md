# Limoeiro — demonstração de gestão de pessoas

Demo navegável para validar as funcionalidades com a equipe da fazenda. Dados fictícios e simulações salvas exclusivamente no navegador. Não usa o Neon, não autentica usuários e não gera assinatura ou registro oficial de ponto.

**Demo publicada:** [fazendalimoeiro.vercel.app](https://fazendalimoeiro.vercel.app). Acesso direto, sem login. [Tela do funcionário](https://fazendalimoeiro.vercel.app/ponto).

## Executar

Ambiente verificado: Node.js 24 e npm.

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000`. Verificações: `npm run typecheck`, `npm test`, `npm run test:e2e` e `npm run build`. Antes do primeiro teste de navegador, execute `npx playwright install chromium`.

## Explorar

- Visão geral: pendências, atalhos e roteiro de exploração.
- Funcionários: cadastro fictício e pasta com resumo, ponto, documentos, entregas e histórico.
- Documentos: quatro modelos ilustrativos, emissão, leitura e assinatura simulada.
- Ponto: QR abre `/ponto`. Escolher o nome → confirmar a próxima batida, sem login, senha ou digitação de horário. Relógio automático de demonstração, dia 08/10/2026. Escolha João Ferreira para experimentar.
- Intervalo: configurável por jornada (2 ou 4 batidas), com padrão da empresa para novos cadastros. Pausa prevista é configurável nos exemplos sem batida; nenhuma regra real foi homologada.
- Fechamento: classificar excedentes, conferir pendências, congelar uma cópia local, reabrir com motivo e exportar CSV. Não calcula folha nem regras trabalhistas.
- Configurações: preferências da demo e restauração dos exemplos.
- Feedback: comentário contextual e exportação CSV. Não é enviado automaticamente; exporte antes de limpar os dados do navegador. O reset da demo mantém os feedbacks.

Não inserir dados reais. As pessoas e documentos iniciais são fictícios. Abas no mesmo navegador e endereço se atualizam; dispositivos diferentes não compartilham alterações. Em desenvolvimento, o QR aponta para o IP local do computador: o celular precisa estar na mesma rede com acesso permitido. A leitura física pelo celular ainda precisa ser conferida pelo usuário.

## Fonte de verdade

[Especificação e recorte DEMO-01](docs/especificacao-mvp.md), especialmente a seção 14, registram escopo, arquitetura, aceite e evidências. As fases operacionais anteriores permanecem como proposta futura.

## Infraestrutura existente

O setup Neon solicitado antes da demo permanece no projeto (`neon.ts`). `.env.local`, `.neon` e dependências estão ignorados no Git e no upload da Vercel. O frontend não lê suas credenciais nem chama o banco; nenhuma migration foi executada. Código enviado à branch `main` de `MateusTeixeira9203/Fazenda-limoeiro` e publicado no projeto Vercel `fazendalimoeiro`, com autorização do usuário. A seção 15 da especificação registra a publicação e as verificações.
