"""Validate JSON text into a closed recursive value model for report boundaries."""

import math
import re
from dataclasses import dataclass
from json.decoder import scanstring
from typing import Final, TypeAlias

JsonScalar: TypeAlias = None | bool | int | float | str
JsonValue: TypeAlias = JsonScalar | list["JsonValue"] | dict[str, "JsonValue"]
_NUMBER_PATTERN: Final = re.compile(r"-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?")


class JsonDocumentError(ValueError):
    """Identify invalid JSON text without exposing raw report contents."""


@dataclass(slots=True)
class _JsonDocumentReader:
    """Parse a JSON document while preserving an explicitly typed value tree."""

    source: str
    position: int = 0

    def read_document(self) -> JsonValue:
        """Read exactly one document and reject trailing non-whitespace content."""
        self._skip_whitespace()
        value = self._read_value()
        self._skip_whitespace()
        if self.position != len(self.source):
            raise JsonDocumentError("unexpected trailing content")
        return value

    def _read_value(self) -> JsonValue:
        """Read one JSON value at the current position."""
        if self.position >= len(self.source):
            raise JsonDocumentError("expected a JSON value")
        token = self.source[self.position]
        if token == "{":
            return self._read_object()
        if token == "[":
            return self._read_array()
        if token == '"':
            return self._read_string()
        if token in "-0123456789":
            return self._read_number()
        if self.source.startswith("true", self.position):
            self.position += len("true")
            return True
        if self.source.startswith("false", self.position):
            self.position += len("false")
            return False
        if self.source.startswith("null", self.position):
            self.position += len("null")
            return None
        raise JsonDocumentError("invalid JSON value")

    def _read_object(self) -> dict[str, JsonValue]:
        """Read a JSON object with string keys and recursively typed values."""
        result: dict[str, JsonValue] = {}
        self.position += 1
        self._skip_whitespace()
        if self._consume("}"):
            return result
        while True:
            self._skip_whitespace()
            if self.position >= len(self.source) or self.source[self.position] != '"':
                raise JsonDocumentError("object key must be a string")
            key = self._read_string()
            self._skip_whitespace()
            self._expect(":")
            self._skip_whitespace()
            result[key] = self._read_value()
            self._skip_whitespace()
            if self._consume("}"):
                return result
            self._expect(",")

    def _read_array(self) -> list[JsonValue]:
        """Read a JSON array whose elements retain their validated union type."""
        result: list[JsonValue] = []
        self.position += 1
        self._skip_whitespace()
        if self._consume("]"):
            return result
        while True:
            result.append(self._read_value())
            self._skip_whitespace()
            if self._consume("]"):
                return result
            self._expect(",")
            self._skip_whitespace()

    def _read_string(self) -> str:
        """Read one JSON string using the standard-library escape implementation."""
        try:
            value, self.position = scanstring(self.source, self.position + 1, True)
        except ValueError as error:
            raise JsonDocumentError("invalid JSON string") from error
        return value

    def _read_number(self) -> int | float:
        """Read a finite JSON number and retain its precise scalar category."""
        match = _NUMBER_PATTERN.match(self.source, self.position)
        if match is None:
            raise JsonDocumentError("invalid JSON number")
        token = match.group(0)
        self.position = match.end()
        if "." not in token and "e" not in token.lower():
            return int(token)
        value = float(token)
        if not math.isfinite(value):
            raise JsonDocumentError("JSON number must be finite")
        return value

    def _skip_whitespace(self) -> None:
        """Advance past JSON whitespace without accepting unrelated separators."""
        while self.position < len(self.source) and self.source[self.position] in " \t\r\n":
            self.position += 1

    def _consume(self, expected: str) -> bool:
        """Consume one expected token when present at the current position."""
        if self.source.startswith(expected, self.position):
            self.position += len(expected)
            return True
        return False

    def _expect(self, expected: str) -> None:
        """Require and consume one structural token."""
        if not self._consume(expected):
            raise JsonDocumentError(f"expected '{expected}'")


def parse_json_document(source: str) -> JsonValue:
    """Validate JSON source into a closed recursive type without dynamic values."""
    return _JsonDocumentReader(source).read_document()
