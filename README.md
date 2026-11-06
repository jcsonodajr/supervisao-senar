# Supervisão SENAR

Aplicativo web (PWA) para apoiar a supervisão de instrutoria do SENAR: formulário de avaliação metodológica, registro de observações, refinamento de textos com IA, relatório em PDF e envio do relatório por e-mail junto com um arquivo JSON para facilitar o preenchimento posterior no sistema oficial.

**Aplicativo publicado:** https://jcsonodajr.github.io/supervisao-senar/
**Repositório:** https://github.com/jcsonodajr/supervisao-senar

## Funcionalidades

- Questionário com **50 itens em 7 categorias**: Objetivos, Conteúdo programático, Desenvolvimento das técnicas instrucionais, Recursos instrucionais, Avaliação, Plano instrucional e Postura do instrutor.
- Escala de 0 a 4: 4 — Sim, plenamente · 3 — Sim, parcialmente · 2 — Precisa melhorar · 1 — Não · 0 — Não observado.
- Dados da ação: natureza, descrição, evento, municípios de origem e destino, período (DD/MM/AAAA, com validação).
- Rascunho de campo, aspectos positivos e aspectos de melhoria (cada texto guarda a versão original e a versão revisada).
- **Refinamento com IA** dos textos (ver "Segurança e privacidade"). O texto original nunca é alterado, e o app pergunta antes de substituir uma versão revisada editada à mão.
- **Salvamento automático** do formulário no navegador, com restauração ao reabrir e botão **Limpar avaliação**.
- **Imprimir / Salvar PDF** pelo navegador (texto selecionável).
- **Enviar PDF + JSON por e-mail** ao supervisor escolhido. O app só informa "enviado" quando o servidor confirma; se não for possível confirmar, avisa para conferir a caixa de entrada.
- **Baixar JSON** (funciona sem internet) e **Carregar avaliação** a partir de um JSON.
- Aviso de quantos itens estão sem nota antes de enviar ou gerar o PDF.
- Instalável como aplicativo (PWA).

## Como utilizar

1. Abra o aplicativo e preencha os dados da ação e as notas durante ou após a supervisão. O que for digitado é salvo automaticamente neste aparelho.
2. Registre o rascunho e os textos de aspectos positivos e de melhoria. Se quiser, use o botão de IA e **confira o resultado** antes de usar.
3. Para entregar o relatório: escolha o supervisor e use **Enviar PDF + JSON por e-mail**. Ao terminar, o app oferece limpar o formulário para uma nova supervisão.
4. Alternativas: **Imprimir / Salvar PDF** e **Baixar JSON**, que servem como plano B quando não há envio.

## Arquitetura

O projeto tem três partes:

| Parte | Onde fica | Função |
|---|---|---|
| Aplicativo (front-end) | Este repositório, publicado no GitHub Pages | Formulário, PDF, JSON, rascunho |
| Envio de e-mail | Google Apps Script (implantado como aplicativo da web) | Recebe PDF e JSON e envia ao supervisor |
| Refinamento com IA | Cloudflare Worker | Recebe os textos e devolve a versão revisada |

Os endereços do Apps Script e do Worker estão no `index.html` (constantes `URL_APPS_SCRIPT` e `URL_WORKER`).

### Apps Script

- A lista de supervisores (`SUPERVISORES`) fica **somente no Apps Script**. O app envia apenas um identificador (`julio`, `lyvia`, `lucas`, `marlon`), e o script traduz para o e-mail. Destinatários fora da lista são recusados.
- Limites: PDF até 15 MB, JSON até 1 MB e 60 envios por dia.
- A resposta é sempre um JSON com `sucesso: true` ou `sucesso: false` e a mensagem de erro.
- Recomenda-se guardar uma cópia do código no repositório (por exemplo, em `apps-script/`), para não depender só do editor do Google.

## Formato do JSON

Cada avaliação exportada, baixada ou enviada por e-mail segue este formato (`schemaVersion: 1`):

```json
{
  "schemaVersion": 1,
  "app": { "versao": "2026.11.1" },
  "geradoEm": "2026-11-05T18:30:00.000Z",
  "envio": { "supervisorId": "julio" },
  "acao": {
    "natureza": "", "descricao": "", "evento": "",
    "municipioOrigem": "", "municipioDestino": "",
    "dataInicio": "03/11/2026", "dataFim": "04/11/2026"
  },
  "resumo": { "totalItens": 50, "avaliados": 47, "semNota": 3 },
  "avaliacao": [
    { "id": "objetivos.apresentou_objetivos", "categoria": "Objetivos",
      "item": "texto da pergunta", "nota": 4, "rotulo": "Sim, plenamente" }
  ],
  "rascunho": "",
  "textos": {
    "aspectosPositivos": { "original": "", "final": "" },
    "aspectosMelhoria": { "original": "", "final": "" }
  }
}
```

Pontos importantes:

- **`nota: null` significa "sem nota"**, que é diferente de `0` ("Não observado").
- `geradoEm` está em UTC. As datas da ação ficam em DD/MM/AAAA, como no formulário.
- Cada item tem um **ID estável** (`categoria.nome_do_item`).

### Regras para quem mantém o projeto

- **Nunca altere o ID de um item existente.** O texto da pergunta pode ser corrigido, mas o ID é o que liga arquivos antigos ao questionário atual. Para um item novo, crie um ID novo.
- Se o formato do JSON mudar de forma incompatível, aumente `SCHEMA_VERSION` no `index.html`. Rascunhos e arquivos de versões incompatíveis passam a ser ignorados ou recusados em vez de lidos errado.
- Se alterar os arquivos guardados em cache no `sw.js`, aumente o nome do cache (`CACHE_NAME`) para os aparelhos receberem a atualização.

## Armazenamento dos dados

O rascunho fica no `localStorage` **deste navegador e deste aparelho**. Ele não é sincronizado entre dispositivos, e limpar os dados do navegador o apaga. Em aparelho compartilhado, use **Limpar avaliação** ao terminar.

O backup confiável de uma supervisão é o envio por e-mail ou o arquivo JSON baixado.

## Funcionamento offline

O `sw.js` guarda no aparelho a página e o manifesto. **O modo offline ainda é limitado**, porque o estilo (Tailwind) e o gerador de PDF do e-mail (html2pdf.js) são carregados de serviços externos. Sem internet:

- a página pode abrir **sem o estilo visual**;
- o PDF do e-mail não é gerado;
- o refinamento com IA e o envio por e-mail não funcionam.

**Baixar JSON** funciona sem internet. Antes de usar em atividades de campo, teste o aplicativo em modo avião.

## Segurança e privacidade

As avaliações contêm observações sobre o desempenho de profissionais. Para o uso do aplicativo e a guarda dos arquivos gerados, siga as orientações internas de segurança e proteção de dados do SENAR (LGPD).

Para onde os dados vão:

- **Serviço de IA:** ao usar o botão de refinamento, o texto do rascunho e dos aspectos positivos e de melhoria é enviado ao Cloudflare Worker e, por ele, a um serviço de IA. **Evite digitar nomes de pessoas** nesses campos e confirme com o SENAR se esse uso é permitido.
- **E-mail:** o PDF e o JSON, com todas as notas e textos, são enviados ao supervisor escolhido, e ficam guardados na caixa de entrada e nos servidores de e-mail.
- **Neste aparelho:** o rascunho automático fica guardado no navegador até ser limpo.

Cuidados com o código:

- Não coloque senhas, credenciais ou chaves de API no código publicado no GitHub.
- Os endereços do Apps Script e do Worker são visíveis no código da página. Por isso, as regras de proteção (lista de destinatários, limites) ficam no servidor, e não no navegador.
- Os e-mails dos supervisores estão apenas no Apps Script, mas **continuam visíveis em versões antigas do histórico do repositório**.

## Estrutura do repositório

```text
supervisao-senar/
├── index.html
├── manifest.json
├── sw.js
└── README.md
```

- `index.html`: interface, questionário, rascunho automático, JSON, PDF, envio e IA.
- `manifest.json`: nome, aparência e configurações de instalação.
- `sw.js`: cache e suporte ao funcionamento offline.
- `README.md`: esta documentação.

## Publicação

1. Se o Apps Script mudou: em **Implantar → Gerenciar implantações**, edite a implantação existente e escolha **Nova versão** (assim o endereço continua o mesmo). Publique o Apps Script **antes** do front-end.
2. Envie as alterações para o GitHub. A publicação no GitHub Pages é feita pelo workflow em **Actions**; confira se terminou com ✓ verde.
3. Abra o aplicativo com `Ctrl+Shift+R` para ignorar o cache e confirme que a versão nova carregou.

## Testes após cada alteração

- Preencher, fechar e reabrir: o rascunho deve voltar.
- Baixar o JSON e carregá-lo de novo: tudo deve voltar igual.
- Enviar por e-mail: devem chegar o PDF (não pode estar em branco) e o JSON.
- Enviar sem internet: nunca pode aparecer "enviado".
- Imprimir / Salvar PDF.
- Abrir o aplicativo no celular, instalado e no navegador.

## Tecnologias

HTML5, JavaScript, Tailwind CSS (via CDN), html2pdf.js (via CDN), Service Worker, Web App Manifest, Google Apps Script, Cloudflare Workers e GitHub Pages.

## Limitações conhecidas

- O PDF enviado por e-mail é uma imagem da página, e o texto não é selecionável. O JSON anexo traz os dados em texto.
- O relatório não identifica o instrutor avaliado, a turma nem o supervisor que avaliou.
- O item "Necessitou ajustar/modificar o plano instrucional" tem a escala invertida em relação aos demais (nota alta significa mais ajustes). Isso deve ser considerado em qualquer cálculo de média.
- O estilo e o gerador de PDF dependem de serviços externos (ver "Funcionamento offline").
- Existem dois geradores de relatório (impressão e PDF do e-mail) que precisam ser mantidos em sincronia.

## Próximas etapas

- Trazer Tailwind e html2pdf.js para o repositório e atualizar o `sw.js`, para o aplicativo abrir de verdade sem internet.
- Ícones próprios para o aplicativo instalado.
- Campos de identificação do instrutor, turma e supervisor.
- Tratamento do item de escala invertida.
- Unificar a geração do relatório de impressão e do PDF.
- Proteções adicionais no Worker da IA (limite de uso e origem permitida).
- PDF com texto selecionável.
- Preenchimento assistido do sistema oficial a partir do JSON.
