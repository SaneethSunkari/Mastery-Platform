import ast
import json
import resource
import sys

def set_soft_limit(limit, value):
    _, hard_limit = resource.getrlimit(limit)
    try:
        resource.setrlimit(limit, (min(value, hard_limit), hard_limit))
    except ValueError:
        # macOS can report virtual memory above a lower requested RLIMIT_AS.
        # The isolated child still keeps the platform limit in that case.
        if sys.platform != "darwin" or limit != resource.RLIMIT_AS:
            raise


set_soft_limit(resource.RLIMIT_CPU, 3)
set_soft_limit(resource.RLIMIT_AS, 256 * 1024 * 1024)
set_soft_limit(resource.RLIMIT_FSIZE, 0)
set_soft_limit(resource.RLIMIT_NPROC, 1)

request = json.loads(sys.stdin.read())
source = request["source"]
function_name = request["functionName"]
tests = request["tests"]

blocked_names = {"open", "input", "eval", "exec", "compile", "__import__", "globals", "locals", "vars", "getattr", "setattr", "delattr", "breakpoint", "help"}
tree = ast.parse(source, mode="exec")
for node in ast.walk(tree):
    if isinstance(node, (ast.Import, ast.ImportFrom, ast.Global, ast.Nonlocal)):
        raise ValueError("Imports and global state are disabled in this runtime.")
    if isinstance(node, ast.Name) and node.id in blocked_names:
        raise ValueError(f"{node.id} is disabled in this runtime.")
    if isinstance(node, ast.Attribute) and node.attr.startswith("__"):
        raise ValueError("Dunder attribute access is disabled in this runtime.")

safe_builtins = {
    "abs": abs, "all": all, "any": any, "bool": bool, "dict": dict,
    "enumerate": enumerate, "filter": filter, "float": float, "int": int,
    "len": len, "list": list, "map": map, "max": max, "min": min,
    "range": range, "reversed": reversed, "round": round, "set": set,
    "sorted": sorted, "str": str, "sum": sum, "tuple": tuple, "zip": zip,
    "Exception": Exception, "ValueError": ValueError, "TypeError": TypeError,
}
namespace = {"__builtins__": safe_builtins}
exec(compile(tree, "<learner>", "exec"), namespace, namespace)
function = namespace.get(function_name)
if not callable(function):
    raise ValueError(f"Expected a function named {function_name}.")

results = []
for test in tests:
    try:
        actual = function(test["input"])
        passed = actual == test["expected"]
        results.append({"description": test["description"], "passed": passed, "actual": actual})
    except Exception as error:
        results.append({"description": test["description"], "passed": False, "error": f"{type(error).__name__}: {error}"})

print(json.dumps({"passed": all(result["passed"] for result in results), "results": results}, default=str))
