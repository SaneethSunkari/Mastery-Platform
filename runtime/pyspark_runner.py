#!/usr/bin/env python3
"""Execute a deliberately tiny, AST-restricted PySpark DataFrame submission."""

from __future__ import annotations

import ast
import json
import os
import sys
import time
import traceback
from pathlib import Path
from typing import Any


ALLOWED_NAMES = {"F", "Window", "orders_df", "customers_df", "result"}
ALLOWED_ATTRIBUTES = {"alias", "col", "filter", "select"}
ALLOWED_IMPORTS = {
    ("pyspark.sql", "functions", "F"),
    ("pyspark.sql", "Window", "Window"),
}


class UnsafeSource(ValueError):
    pass


class SubmissionValidator(ast.NodeVisitor):
    def generic_visit(self, node: ast.AST) -> None:
        allowed = (
            ast.Module,
            ast.ImportFrom,
            ast.alias,
            ast.Assign,
            ast.Expr,
            ast.Call,
            ast.Attribute,
            ast.Name,
            ast.Constant,
            ast.List,
            ast.Tuple,
            ast.keyword,
            ast.Compare,
            ast.Eq,
            ast.Gt,
            ast.Load,
            ast.Store,
        )
        if not isinstance(node, allowed):
            raise UnsafeSource(f"Syntax `{type(node).__name__}` is not allowed in runtime exercises.")
        super().generic_visit(node)

    def visit_ImportFrom(self, node: ast.ImportFrom) -> None:
        if node.level != 0 or len(node.names) != 1:
            raise UnsafeSource("Only the imports provided by the starter code are allowed.")
        imported = node.names[0]
        signature = (node.module or "", imported.name, imported.asname or imported.name)
        if signature not in ALLOWED_IMPORTS:
            raise UnsafeSource("Only the imports provided by the starter code are allowed.")

    def visit_Assign(self, node: ast.Assign) -> None:
        if len(node.targets) != 1 or not isinstance(node.targets[0], ast.Name):
            raise UnsafeSource("Only a direct assignment to `result` is allowed.")
        if node.targets[0].id != "result":
            raise UnsafeSource("The final DataFrame must be assigned directly to `result`.")
        self.visit(node.value)

    def visit_Expr(self, node: ast.Expr) -> None:
        raise UnsafeSource("Standalone expressions and actions are not allowed.")

    def visit_Name(self, node: ast.Name) -> None:
        if node.id not in ALLOWED_NAMES:
            raise UnsafeSource(f"Name `{node.id}` is not available in this runtime.")

    def visit_Attribute(self, node: ast.Attribute) -> None:
        if node.attr.startswith("_") or node.attr not in ALLOWED_ATTRIBUTES:
            raise UnsafeSource(f"Attribute `{node.attr}` is not allowed in this runtime.")
        self.visit(node.value)


def validate_source(source: str) -> ast.Module:
    try:
        tree = ast.parse(source, mode="exec")
    except SyntaxError as error:
        raise UnsafeSource(f"Python syntax error on line {error.lineno or 1}.") from error
    SubmissionValidator().visit(tree)
    if not any(
        isinstance(node, ast.Assign)
        and isinstance(node.targets[0], ast.Name)
        and node.targets[0].id == "result"
        for node in tree.body
    ):
        raise UnsafeSource("Assign the final DataFrame to `result`.")
    return tree


RESULT_PREFIX = "__MASTERY_SPARK_RESULT__"


def emit_result(payload: dict[str, Any]) -> None:
    print(RESULT_PREFIX + json.dumps(payload, separators=(",", ":")), flush=True)


def main() -> int:
    if len(sys.argv) != 2:
        return 2

    input_path = Path(sys.argv[1])
    started = time.monotonic()

    try:
        request = json.loads(input_path.read_text(encoding="utf-8"))
        source = request["source"]
        tree = validate_source(source)
    except UnsafeSource as error:
        emit_result({"passed": False, "errorCode": "UNSAFE_SOURCE", "feedback": [str(error)]})
        return 0
    except (KeyError, TypeError, ValueError, OSError, json.JSONDecodeError):
        emit_result({"passed": False, "errorCode": "INVALID_REQUEST", "feedback": ["The runtime request was invalid."]})
        return 0

    spark = None
    try:
        from pyspark.sql import SparkSession, Window, functions as F

        spark = (
            SparkSession.builder.master("local[1]")
            .appName("mastery-platform-runtime")
            .config("spark.ui.enabled", "false")
            .config("spark.sql.shuffle.partitions", "1")
            .config("spark.driver.memory", "512m")
            .config("spark.executor.memory", "512m")
            .getOrCreate()
        )
        spark.sparkContext.setLogLevel("ERROR")
        order_fixture = [
            {**row, "amount": float(row["amount"])}
            for row in request["fixture"]["orders"]
        ]
        namespace = {
            "__builtins__": {},
            "F": F,
            "Window": Window,
            "orders_df": spark.createDataFrame(
                order_fixture,
                "order_id long, customer_id long, status string, amount double",
            ),
            "customers_df": spark.createDataFrame(
                request["fixture"]["customers"],
                "customer_id long, customer_name string, country string",
            ),
        }
        executable = ast.Module(
            body=[node for node in tree.body if not isinstance(node, ast.ImportFrom)],
            type_ignores=[],
        )
        exec(compile(executable, "<submission>", "exec"), namespace, namespace)
        result = namespace.get("result")
        if result is None or not hasattr(result, "collect"):
            raise TypeError("`result` is not a Spark DataFrame.")

        actual_columns = list(result.columns)
        actual_rows = [row.asDict(recursive=True) for row in result.collect()]
        passed = (
            actual_columns == request["expectedColumns"]
            and actual_rows == request["expectedRows"]
        )
        feedback = (
            ["Real Spark execution matched the expected schema and rows."]
            if passed
            else ["Real Spark execution completed, but the schema or rows did not match the expected result."]
        )
        emit_result(
            {
                "passed": passed,
                "feedback": feedback,
                "sparkVersion": spark.version,
                "actualColumns": actual_columns,
                "actualRows": actual_rows,
                "durationMs": round((time.monotonic() - started) * 1000),
            },
        )
        return 0
    except Exception:
        traceback.print_exc(file=sys.stderr)
        emit_result(
            {
                "passed": False,
                "errorCode": "EXECUTION_FAILED",
                "feedback": ["Spark could not execute this submission. Check the transformation and try again."],
                "durationMs": round((time.monotonic() - started) * 1000),
            },
        )
        return 0
    finally:
        if spark is not None:
            spark.stop()


if __name__ == "__main__":
    raise SystemExit(main())
