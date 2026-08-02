#!/usr/bin/env node
import { Command } from "commander";
import { registerInitCommand } from "./commands/init.js";
import { registerScanCommand } from "./commands/scan.js";
import { registerUpdateCommand } from "./commands/update.js";
import { registerCleanCommand } from "./commands/clean.js";
import { registerDoctorCommand } from "./commands/doctor.js";

const program = new Command();

program
  .name("ai-context")
  .description(
    "Gera e mantém o diretório .ai-context: um contexto estruturado do seu projeto para modelos de IA."
  )
  .version("0.0.1");

registerInitCommand(program);
registerScanCommand(program);
registerUpdateCommand(program);
registerCleanCommand(program);
registerDoctorCommand(program);

program.parseAsync(process.argv).catch((error: unknown) => {
  console.error("Erro inesperado:", error);
  process.exitCode = 1;
});
