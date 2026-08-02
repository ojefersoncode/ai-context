import path from "node:path";
import { OUTPUT_DIR_NAME, OUTPUT_FILES } from "../../config/constants.js";
import { pathExists } from "../../utils/fs.js";
import { walkProjectFiles } from "../../scanner/file-walker.js";
import { computeFileHashes, diffHashes } from "../../analyzers/hash-analyzer.js";
import type { OutputWriter } from "../../writers/output-writer.interface.js";

export interface DoctorCheck {
  label: string;
  ok: boolean;
  detail?: string;
}

export interface DoctorReport {
  checks: DoctorCheck[];
  healthy: boolean;
}

export async function runDoctor(
  rootDir: string,
  writer: OutputWriter
): Promise<DoctorReport> {
  const checks: DoctorCheck[] = [];

  const nodeMajorVersion = Number(process.versions.node.split(".")[0]);
  checks.push({
    label: "Versão do Node.js >= 18",
    ok: nodeMajorVersion >= 18,
    detail: `detectado: v${process.versions.node}`,
  });

  const initialized = writer.exists();
  checks.push(
    initialized
      ? { label: `${OUTPUT_DIR_NAME} existe`, ok: true }
      : {
          label: `${OUTPUT_DIR_NAME} existe`,
          ok: false,
          detail: "rode `ai-context init` ou `ai-context scan`",
        }
  );

  if (!initialized) {
    return { checks, healthy: false };
  }

  const outputDir = path.join(rootDir, OUTPUT_DIR_NAME);
  for (const [key, fileName] of Object.entries(OUTPUT_FILES)) {
    const filePath = path.join(outputDir, fileName);
    checks.push({
      label: `arquivo ${fileName} presente`,
      ok: pathExists(filePath),
    });
    void key;
  }

  const previousHashes = await writer.readExistingHashes();
  if (previousHashes) {
    const files = await walkProjectFiles(rootDir);
    const currentHashes = await computeFileHashes(files);
    const diff = diffHashes(previousHashes, currentHashes);
    const inSync =
      diff.added.length === 0 &&
      diff.modified.length === 0 &&
      diff.removed.length === 0;

    checks.push(
      inSync
        ? { label: "Contexto sincronizado com o código atual", ok: true }
        : {
            label: "Contexto sincronizado com o código atual",
            ok: false,
            detail: `${diff.added.length} novo(s), ${diff.modified.length} modificado(s), ${diff.removed.length} removido(s) — rode \`ai-context update\``,
          }
    );
  }

  const healthy = checks.every((check) => check.ok);
  return { checks, healthy };
}
