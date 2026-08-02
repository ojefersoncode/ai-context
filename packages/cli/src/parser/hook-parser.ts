import { Node, type SourceFile } from "ts-morph";
import type { HookUsageInfo } from "../types/index.js";

const BUILTIN_HOOKS = new Set([
  "useState",
  "useEffect",
  "useContext",
  "useReducer",
  "useCallback",
  "useMemo",
  "useRef",
  "useLayoutEffect",
  "useImperativeHandle",
  "useTransition",
  "useDeferredValue",
  "useId",
  "useSyncExternalStore",
]);

function isHookName(name: string): boolean {
  return /^use[A-Z]/.test(name);
}

export function extractHookUsages(sourceFile: SourceFile): HookUsageInfo[] {
  const filePath = sourceFile.getFilePath();
  const hooks: HookUsageInfo[] = [];
  const seen = new Set<string>();

  sourceFile.forEachDescendant((node) => {
    if (!Node.isCallExpression(node)) return;

    const expression = node.getExpression();
    const name = expression.getText();

    if (isHookName(name) && !seen.has(name)) {
      seen.add(name);
      hooks.push({
        name,
        filePath,
        isCustomHook: !BUILTIN_HOOKS.has(name),
      });
    }
  });

  return hooks;
}
