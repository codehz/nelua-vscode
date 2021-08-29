/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import { ExtensionContext, window, workspace } from "vscode";

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
} from "vscode-languageclient/node";

import { spawn } from "child_process";

let client: LanguageClient;

export function activate(context: ExtensionContext) {
  const config = workspace.getConfiguration("nelua");
  const nelua_path = config.get<string>("path");
  if (!config.get<boolean>("lsp.enabled")) return;
  const lsp_path = config.get<string>("lsp.path");
  const channel = window.createOutputChannel("Nelua: LSP");
  context.subscriptions.push(channel);

  if (lsp_path == "") {
    return;
  }

  // If the extension is launched in debug mode then the debug server options are used
  // Otherwise the run options are used

  const serverOptions: ServerOptions = () => {
    channel.appendLine("LSP: " + lsp_path)
    return Promise.resolve(spawn(nelua_path, ["--script", lsp_path], { stdio: "pipe" }));
  }

  // Options to control the language client
  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: "file", language: "nelua" }],
    outputChannel: channel,
  };

  // Create the language client and start the client.
  client = new LanguageClient(
    "NeluaLanguageServer",
    "Nelua Language Server",
    serverOptions,
    clientOptions,
  );

  // Start the client. This will also launch the server
  client.start();
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
