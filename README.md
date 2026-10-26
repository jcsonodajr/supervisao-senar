
# Supervisão SENAR

Aplicativo web para apoiar o processo de supervisão de instrutoria do SENAR, com formulário de avaliação metodológica, registro de observações, elaboração de relatório em PDF e exportação de dados para futura automação.

## Acesso ao aplicativo

**Aplicativo publicado:**  
https://jcsonodajr.github.io/supervisao-senar/

Repositório:  
https://github.com/jcsonodajr/supervisao-senar

## Funcionalidades

- Formulário de avaliação organizado por categorias.
- Escala de avaliação de 0 a 4:
  - 4 — Sim, plenamente
  - 3 — Sim, parcialmente
  - 2 — Precisa melhorar
  - 1 — Não
  - 0 — Não observado
- Campo para registro de observações de campo.
- Registro de aspectos positivos da instrutoria.
- Registro de aspectos discutidos para melhoria do desempenho e sugestões.
- Salvamento dos dados no armazenamento local do navegador.
- Geração de relatório em PDF.
- Exportação de dados em formato JSON para integração futura com Python e Selenium.
- Configuração de PWA para permitir a instalação do aplicativo em dispositivos compatíveis.

## Categorias avaliadas

1. Objetivos
2. Conteúdo programático
3. Desenvolvimento das técnicas instrucionais
4. Recursos instrucionais
5. Avaliação
6. Plano instrucional
7. Postura do instrutor

## Como utilizar

1. Acesse o aplicativo pelo endereço publicado.
2. Preencha as avaliações de acordo com as observações realizadas durante a supervisão.
3. Registre as observações de campo e os aspectos positivos e de melhoria.
4. Utilize a opção de exportação JSON para gerar um arquivo com os dados registrados.
5. Utilize a opção de PDF para gerar o relatório da supervisão.

## Armazenamento dos dados

Os dados são armazenados no `localStorage` do navegador utilizado.

**Atenção:** o armazenamento é local ao navegador e ao dispositivo. Os dados não são automaticamente sincronizados entre computadores ou celulares. Limpar os dados do navegador pode apagar as avaliações salvas.

Recomenda-se exportar os dados regularmente e manter cópias de segurança em local autorizado.

## Funcionamento offline

O projeto utiliza um Service Worker (`sw.js`) para armazenar arquivos do aplicativo em cache.

O funcionamento offline depende de o aplicativo ter sido carregado anteriormente e de seus recursos necessários estarem disponíveis no dispositivo. Bibliotecas carregadas de serviços externos podem não funcionar sem conexão.

A geração de PDF e outros recursos devem ser testados em modo offline antes de serem utilizados em atividades de campo.

## Estrutura do repositório

```text
supervisao-senar/
├── index.html
├── manifest.json
├── sw.js
└── README.md
```

- `index.html`: interface, questionário, armazenamento local, exportação JSON e geração de PDF.
- `manifest.json`: nome, aparência e configurações de instalação do aplicativo.
- `sw.js`: gerenciamento do cache e suporte ao funcionamento offline.
- `README.md`: documentação do projeto.

## Tecnologias utilizadas

- HTML5
- JavaScript
- Tailwind CSS
- Service Worker
- Web App Manifest
- html2pdf.js
- GitHub Pages

## Próximas etapas do projeto

- Aprimorar o armazenamento e a gestão de múltiplas supervisões.
- Padronizar o formato JSON para integração com sistemas externos.
- Implementar integração segura com inteligência artificial para apoiar a redação dos relatórios.
- Desenvolver automação com Python e Selenium para preenchimento assistido do sistema oficial.
- Ampliar o suporte offline, incluindo a disponibilização local das bibliotecas necessárias.
- Implementar validações e mecanismos de conferência antes do envio dos dados.

## Segurança e privacidade

As avaliações podem conter informações profissionais e observações sobre o desempenho dos instrutores. Utilize o aplicativo e armazene os arquivos exportados conforme as orientações internas de segurança e proteção de dados do SENAR.

Não inclua senhas, credenciais ou chaves de API no código-fonte publicado no GitHub.

## Manutenção

O projeto é mantido no repositório GitHub. Alterações nos arquivos devem ser testadas após a publicação, incluindo:

- Preenchimento e recuperação das respostas.
- Exportação e integridade do JSON.
- Geração do PDF.
- Abertura do aplicativo em dispositivos compatíveis.
- Funcionamento com e sem conexão à internet.
